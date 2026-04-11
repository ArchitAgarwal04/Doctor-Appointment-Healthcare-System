from contextlib import asynccontextmanager
from datetime import date, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from database import SessionLocal, engine
import models, schemas
from auth import create_token, get_current_user, require_role, hash_password, verify_password


# ─── DB Helpers ────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    models.Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TRIGGER IF NOT EXISTS trg_appointment_booked
            AFTER INSERT ON appointments
            BEGIN
                INSERT INTO appointment_logs (appointment_id, action, timestamp)
                VALUES (NEW.id, 'Booked', CURRENT_TIMESTAMP);
            END;
        """))
        conn.execute(text("""
            CREATE TRIGGER IF NOT EXISTS trg_appointment_status_change
            AFTER UPDATE OF status ON appointments
            BEGIN
                INSERT INTO appointment_logs (appointment_id, action, timestamp)
                VALUES (NEW.id, 'Status changed to ' || NEW.status, CURRENT_TIMESTAMP);
            END;
        """))


def seed_data():
    db = SessionLocal()
    try:
        # Admin
        if not db.query(models.User).filter(models.User.email == "admin@clinic.com").first():
            db.add(models.User(
                name="Admin User",
                email="admin@clinic.com",
                password=hash_password("admin123"),
                role="admin"
            ))
            db.commit()

        # Departments
        departments_data = [
            ("General Medicine", "Primary care and general family medicine."),
            ("Pediatrics", "Children's health, growth, and wellness."),
            ("Dermatology", "Skin, hair, and nail conditions."),
            ("Cardiology", "Heart and cardiovascular disease management."),
            ("Orthopedics", "Bone, joint, and muscle health."),
            ("Neurology", "Brain and nervous system disorders."),
        ]
        if not db.query(models.Department).first():
            db.add_all([models.Department(name=n, description=d) for n, d in departments_data])
            db.commit()

        # Doctors
        doctors_data = [
            ("Dr. John Smith", "dr.smith@clinic.com", "doctor123", "Pediatrics", "Pediatrics",
             "Experienced pediatrician with 15+ years caring for infants and children."),
            ("Dr. Sarah Johnson", "dr.sarah@clinic.com", "doctor123", "Cardiology", "Cardiology",
             "Board-certified cardiologist specialising in preventive and interventional care."),
            ("Dr. Michael Chen", "dr.chen@clinic.com", "doctor123", "Dermatology", "Dermatology",
             "Expert dermatologist treating acne, psoriasis, and complex skin conditions."),
            ("Dr. Emily White", "dr.emily@clinic.com", "doctor123", "Neurology", "Neurology",
             "Neurologist focused on headache, epilepsy, and stroke rehabilitation."),
            ("Dr. Robert Brown", "dr.robert@clinic.com", "doctor123", "Orthopedics", "Orthopedics",
             "Orthopedic surgeon specialising in sports injuries and joint replacement."),
            ("Dr. Priya Sharma", "dr.priya@clinic.com", "doctor123", "General Medicine", "General Medicine",
             "Family physician providing comprehensive primary care for all ages."),
        ]
        for name, email, password, spec, dept_name, bio in doctors_data:
            if not db.query(models.User).filter(models.User.email == email).first():
                doc_user = models.User(name=name, email=email, password=hash_password(password), role="doctor")
                db.add(doc_user)
                db.commit()
                db.refresh(doc_user)
                dept = db.query(models.Department).filter(models.Department.name == dept_name).first()
                db.add(models.Doctor(
                    user_id=doc_user.id,
                    specialization=spec,
                    department_id=dept.id if dept else None,
                    bio=bio
                ))
                db.commit()

        # Sample patient
        if not db.query(models.User).filter(models.User.email == "patient@clinic.com").first():
            db.add(models.User(
                name="Jane Doe",
                email="patient@clinic.com",
                password=hash_password("patient123"),
                role="patient"
            ))
            db.commit()

        # Seed schedules for all doctors (next 14 days)
        time_slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"]
        today = date.today()
        all_doctors = db.query(models.Doctor).all()
        for doctor in all_doctors:
            for day_offset in range(1, 15):
                sched_date = today + timedelta(days=day_offset)
                for slot in time_slots:
                    existing = db.query(models.DoctorSchedule).filter(
                        models.DoctorSchedule.doctor_id == doctor.id,
                        models.DoctorSchedule.date == sched_date,
                        models.DoctorSchedule.time_slot == slot
                    ).first()
                    if not existing:
                        db.add(models.DoctorSchedule(doctor_id=doctor.id, date=sched_date, time_slot=slot))
            db.commit()

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_data()
    yield


# ─── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Doctor Appointment & Healthcare Management System",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth ──────────────────────────────────────────────────────────────────────

@app.get("/me", response_model=schemas.UserOut)
def me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user["id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role != "patient":
        raise HTTPException(status_code=400, detail="Only patients may self-register")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login")
def login(data: schemas.Login, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"id": user.id, "role": user.role, "name": user.name})
    return {"token": token, "user": {"id": user.id, "name": user.name, "role": user.role, "email": user.email}}


# ─── Departments ───────────────────────────────────────────────────────────────

@app.get("/departments", response_model=list[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()


@app.post("/departments", response_model=schemas.DepartmentOut)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db),
                      user=Depends(require_role("admin"))):
    if db.query(models.Department).filter(func.lower(models.Department.name) == department.name.lower()).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    new_dept = models.Department(**department.model_dump())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept


@app.put("/departments/{department_id}", response_model=schemas.DepartmentOut)
def update_department(department_id: int, update: schemas.DepartmentUpdate,
                      db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    if update.name is not None:
        dept.name = update.name
    if update.description is not None:
        dept.description = update.description
    db.commit()
    db.refresh(dept)
    return dept


@app.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db),
                      user=Depends(require_role("admin"))):
    dept = db.query(models.Department).filter(models.Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"msg": "Department deleted"}


# ─── Doctors ───────────────────────────────────────────────────────────────────

def _build_doctor_out(doctor):
    return schemas.DoctorOut(
        id=doctor.id,
        name=doctor.user.name,
        email=doctor.user.email,
        specialization=doctor.specialization,
        department=doctor.department.name if doctor.department else None,
        department_id=doctor.department_id,
        bio=doctor.bio or "",
    )


@app.get("/doctors", response_model=list[schemas.DoctorOut])
def list_doctors(department_id: Optional[int] = None, specialization: Optional[str] = None,
                 db: Session = Depends(get_db)):
    query = db.query(models.Doctor).join(models.User).outerjoin(models.Department)
    if department_id:
        query = query.filter(models.Doctor.department_id == department_id)
    if specialization:
        query = query.filter(models.Doctor.specialization.ilike(f"%{specialization}%"))
    return [_build_doctor_out(d) for d in query.all()]


@app.get("/doctors/{doctor_id}", response_model=schemas.DoctorOut)
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return _build_doctor_out(doctor)


@app.post("/admin/doctors", response_model=schemas.DoctorOut)
def create_doctor(doctor: schemas.DoctorCreate, db: Session = Depends(get_db),
                  user=Depends(require_role("admin"))):
    if db.query(models.User).filter(models.User.email == doctor.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    user_acc = models.User(
        name=doctor.name, email=doctor.email,
        password=hash_password(doctor.password), role="doctor"
    )
    db.add(user_acc)
    db.commit()
    db.refresh(user_acc)
    new_doc = models.Doctor(
        user_id=user_acc.id,
        specialization=doctor.specialization,
        department_id=doctor.department_id,
        bio=doctor.bio,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return _build_doctor_out(new_doc)


@app.put("/admin/doctors/{doctor_id}", response_model=schemas.DoctorOut)
def update_doctor(doctor_id: int, update: schemas.DoctorUpdate, db: Session = Depends(get_db),
                  user=Depends(require_role("admin"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if update.specialization is not None:
        doctor.specialization = update.specialization
    if update.department_id is not None:
        doctor.department_id = update.department_id
    if update.bio is not None:
        doctor.bio = update.bio
    if update.name is not None:
        doctor.user.name = update.name
    db.commit()
    db.refresh(doctor)
    return _build_doctor_out(doctor)


@app.delete("/admin/doctors/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db),
                  user=Depends(require_role("admin"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doctor)
    db.commit()
    return {"msg": "Doctor removed"}


# ─── Schedules ─────────────────────────────────────────────────────────────────

@app.get("/schedules", response_model=list[schemas.ScheduleOut])
def get_my_schedules(db: Session = Depends(get_db), user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return db.query(models.DoctorSchedule).filter(
        models.DoctorSchedule.doctor_id == doctor.id,
        models.DoctorSchedule.date >= date.today()
    ).order_by(models.DoctorSchedule.date, models.DoctorSchedule.time_slot).all()


@app.post("/schedules", response_model=schemas.ScheduleOut)
def add_schedule(data: schemas.ScheduleCreate, db: Session = Depends(get_db),
                 user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    if data.date < date.today():
        raise HTTPException(status_code=400, detail="Schedule date must be today or in the future")
    schedule = models.DoctorSchedule(doctor_id=doctor.id, date=data.date, time_slot=data.time_slot)
    db.add(schedule)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=400, detail="This slot already exists")
    db.refresh(schedule)
    return schedule


@app.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db),
                    user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    schedule = db.query(models.DoctorSchedule).filter(
        models.DoctorSchedule.id == schedule_id,
        models.DoctorSchedule.doctor_id == doctor.id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"msg": "Schedule slot removed"}


@app.get("/available-slots/{doctor_id}")
def get_slots(doctor_id: int, db: Session = Depends(get_db)):
    schedules = db.query(models.DoctorSchedule).filter(
        models.DoctorSchedule.doctor_id == doctor_id,
        models.DoctorSchedule.date >= date.today()
    ).order_by(models.DoctorSchedule.date, models.DoctorSchedule.time_slot).all()
    booked = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.status != "cancelled"
    ).all()
    booked_set = {(str(b.date), b.time_slot) for b in booked}
    return {
        "schedules": [schemas.ScheduleOut.model_validate(s) for s in schedules],
        "booked": [{"date": str(b.date), "time_slot": b.time_slot} for b in booked],
        "available": [
            schemas.ScheduleOut.model_validate(s) for s in schedules
            if (str(s.date), s.time_slot) not in booked_set
        ]
    }


# ─── Appointments ──────────────────────────────────────────────────────────────

def _build_appt_out(a, doctor=None):
    return schemas.AppointmentOut(
        id=a.id,
        doctor_id=a.doctor_id,
        patient_id=a.patient_id,
        doctor_name=a.doctor.user.name if a.doctor and a.doctor.user else (doctor.user.name if doctor else None),
        patient_name=a.patient.name if a.patient else None,
        date=a.date,
        time_slot=a.time_slot,
        status=a.status,
        created_at=a.created_at,
    )


@app.post("/book")
def book(data: schemas.AppointmentCreate, db: Session = Depends(get_db),
         user=Depends(require_role("patient"))):
    if not db.query(models.DoctorSchedule).filter(
        models.DoctorSchedule.doctor_id == data.doctor_id,
        models.DoctorSchedule.date == data.date,
        models.DoctorSchedule.time_slot == data.time_slot,
    ).first():
        raise HTTPException(status_code=400, detail="This slot is not in the doctor's schedule")
    if db.query(models.Appointment).filter(
        models.Appointment.doctor_id == data.doctor_id,
        models.Appointment.date == data.date,
        models.Appointment.time_slot == data.time_slot,
        models.Appointment.status != "cancelled"
    ).first():
        raise HTTPException(status_code=400, detail="This slot is already booked")
    if db.query(models.Appointment).filter(
        models.Appointment.patient_id == user["id"],
        models.Appointment.date == data.date,
        models.Appointment.time_slot == data.time_slot,
        models.Appointment.status != "cancelled"
    ).first():
        raise HTTPException(status_code=400, detail="You already have an appointment at this time")
    appointment = models.Appointment(
        patient_id=user["id"],
        doctor_id=data.doctor_id,
        date=data.date,
        time_slot=data.time_slot,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return {"msg": "Appointment booked successfully", "appointment_id": appointment.id}


@app.patch("/appointments/{appointment_id}/cancel")
def cancel_appointment(appointment_id: int, db: Session = Depends(get_db),
                       user=Depends(require_role("patient"))):
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.patient_id == user["id"]
    ).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.status == "cancelled":
        raise HTTPException(status_code=400, detail="Appointment is already cancelled")
    appt.status = "cancelled"
    db.commit()
    return {"msg": "Appointment cancelled"}


@app.patch("/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: int, body: schemas.AppointmentStatusUpdate,
                              db: Session = Depends(get_db), user=Depends(get_current_user)):
    allowed_statuses = {"booked", "completed", "cancelled", "no-show"}
    if body.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed_statuses}")
    appt = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    # Patients can only cancel their own
    if user["role"] == "patient":
        if appt.patient_id != user["id"] or body.status != "cancelled":
            raise HTTPException(status_code=403, detail="Not allowed")
    # Doctors can update their own appointments
    elif user["role"] == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
        if not doctor or appt.doctor_id != doctor.id:
            raise HTTPException(status_code=403, detail="Not your appointment")
    appt.status = body.status
    db.commit()
    return {"msg": "Status updated"}


@app.get("/appointments/history", response_model=list[schemas.AppointmentOut])
def patient_history(db: Session = Depends(get_db), user=Depends(require_role("patient"))):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.patient_id == user["id"]
    ).order_by(models.Appointment.date.desc()).all()
    return [_build_appt_out(a) for a in appointments]


@app.get("/appointments/doctor", response_model=list[schemas.AppointmentOut])
def doctor_appointments(db: Session = Depends(get_db), user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    appointments = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor.id
    ).order_by(models.Appointment.date.desc()).all()
    return [_build_appt_out(a, doctor) for a in appointments]


@app.get("/admin/appointments", response_model=list[schemas.AppointmentOut])
def admin_all_appointments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user=Depends(require_role("admin"))
):
    query = db.query(models.Appointment).order_by(models.Appointment.date.desc())
    if status:
        query = query.filter(models.Appointment.status == status)
    return [_build_appt_out(a) for a in query.all()]


# ─── Prescriptions ─────────────────────────────────────────────────────────────

@app.post("/prescriptions", response_model=schemas.PrescriptionOut)
def create_prescription(data: schemas.PrescriptionCreate, db: Session = Depends(get_db),
                        user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    appt = db.query(models.Appointment).filter(models.Appointment.id == data.appointment_id).first()
    if not appt or appt.doctor_id != doctor.id:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if appt.prescription:
        raise HTTPException(status_code=400, detail="Prescription already exists for this appointment")
    prescription = models.Prescription(
        appointment_id=appt.id,
        medications=data.medications,
        notes=data.notes or "",
    )
    db.add(prescription)
    # Mark appointment as completed
    appt.status = "completed"
    db.commit()
    db.refresh(prescription)
    return schemas.PrescriptionOut(
        id=prescription.id,
        appointment_id=appt.id,
        doctor_name=doctor.user.name,
        patient_name=appt.patient.name if appt.patient else None,
        medications=prescription.medications,
        notes=prescription.notes,
        created_at=prescription.created_at,
    )


@app.get("/patient/prescriptions", response_model=list[schemas.PrescriptionOut])
def patient_prescriptions(db: Session = Depends(get_db), user=Depends(require_role("patient"))):
    prescriptions = db.query(models.Prescription).join(models.Appointment).filter(
        models.Appointment.patient_id == user["id"]
    ).order_by(models.Prescription.created_at.desc()).all()
    return [
        schemas.PrescriptionOut(
            id=p.id,
            appointment_id=p.appointment_id,
            doctor_name=p.appointment.doctor.user.name if p.appointment and p.appointment.doctor else None,
            patient_name=p.appointment.patient.name if p.appointment and p.appointment.patient else None,
            medications=p.medications,
            notes=p.notes,
            created_at=p.created_at,
        )
        for p in prescriptions
    ]


@app.get("/doctor/prescriptions", response_model=list[schemas.PrescriptionOut])
def doctor_prescriptions(db: Session = Depends(get_db), user=Depends(require_role("doctor"))):
    doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    prescriptions = db.query(models.Prescription).join(models.Appointment).filter(
        models.Appointment.doctor_id == doctor.id
    ).order_by(models.Prescription.created_at.desc()).all()
    return [
        schemas.PrescriptionOut(
            id=p.id,
            appointment_id=p.appointment_id,
            doctor_name=doctor.user.name,
            patient_name=p.appointment.patient.name if p.appointment and p.appointment.patient else None,
            medications=p.medications,
            notes=p.notes,
            created_at=p.created_at,
        )
        for p in prescriptions
    ]


# ─── Reports & Admin Stats ─────────────────────────────────────────────────────

@app.get("/admin/stats", response_model=schemas.AdminStatsOut)
def admin_stats(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    return schemas.AdminStatsOut(
        total_doctors=db.query(models.Doctor).count(),
        total_patients=db.query(models.User).filter(models.User.role == "patient").count(),
        total_appointments=db.query(models.Appointment).count(),
        total_departments=db.query(models.Department).count(),
    )


@app.get("/reports/top-doctors", response_model=list[schemas.TopDoctorOut])
def top_doctors(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    results = db.query(
        models.Doctor.id.label("doctor_id"),
        models.User.name.label("doctor_name"),
        models.Doctor.specialization,
        models.Department.name.label("department"),
        func.count(models.Appointment.id).label("booked_count")
    ).join(models.User, models.Doctor.user_id == models.User.id
     ).outerjoin(models.Department, models.Doctor.department_id == models.Department.id
     ).outerjoin(models.Appointment, models.Appointment.doctor_id == models.Doctor.id
     ).group_by(models.Doctor.id
     ).order_by(func.count(models.Appointment.id).desc()).all()
    return [
        schemas.TopDoctorOut(
            doctor_id=r.doctor_id,
            doctor_name=r.doctor_name,
            specialization=r.specialization,
            department=r.department,
            booked_count=r.booked_count,
        )
        for r in results
    ]


# ─── Notifications ─────────────────────────────────────────────────────────────

@app.get("/notifications")
def notifications(db: Session = Depends(get_db), user=Depends(get_current_user)):
    today = date.today()
    if user["role"] == "patient":
        appts = db.query(models.Appointment).filter(
            models.Appointment.patient_id == user["id"],
            models.Appointment.date >= today,
            models.Appointment.status == "booked"
        ).order_by(models.Appointment.date).limit(10).all()
        return [{"type": "appointment", "message": f"Upcoming appointment with {a.doctor.user.name} on {a.date} at {a.time_slot}", "date": str(a.date), "time": str(a.created_at)} for a in appts]
    elif user["role"] == "doctor":
        doctor = db.query(models.Doctor).filter(models.Doctor.user_id == user["id"]).first()
        if not doctor:
            return []
        appts = db.query(models.Appointment).filter(
            models.Appointment.doctor_id == doctor.id,
            models.Appointment.date >= today,
            models.Appointment.status == "booked"
        ).order_by(models.Appointment.date).limit(10).all()
        return [{"type": "appointment", "message": f"Patient {a.patient.name} on {a.date} at {a.time_slot}", "date": str(a.date), "time": str(a.created_at)} for a in appts]
    else:
        appts = db.query(models.Appointment).filter(
            models.Appointment.date >= today
        ).order_by(models.Appointment.date).limit(10).all()
        return [{"type": "appointment", "message": f"Appointment on {a.date} at {a.time_slot} — {a.status}", "date": str(a.date), "time": str(a.created_at)} for a in appts]
