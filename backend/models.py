from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, default="")

    doctors = relationship("Doctor", back_populates="department")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"))
    bio = Column(Text, default="")

    user = relationship("User", back_populates="doctor_profile")
    department = relationship("Department", back_populates="doctors")
    schedules = relationship("DoctorSchedule", back_populates="doctor", cascade="all, delete-orphan", passive_deletes=True)
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete-orphan", passive_deletes=True)

class DoctorSchedule(Base):
    __tablename__ = "doctor_schedule"
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "time_slot", name="uix_schedule_slot"),
    )

    id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=False)

    doctor = relationship("Doctor", back_populates="schedules")

class Appointment(Base):
    __tablename__ = "appointments"
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "time_slot", name="uix_appointment_slot"),
        UniqueConstraint("patient_id", "date", "time_slot", name="uix_patient_booking"),
    )

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String, nullable=False)
    status = Column(String, default="booked", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="appointments")
    patient = relationship("User")
    prescription = relationship("Prescription", back_populates="appointment", uselist=False)

class Prescription(Base):
    __tablename__ = "prescriptions"
    __table_args__ = (
        UniqueConstraint("appointment_id", name="uix_prescription_appointment"),
    )

    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, default="")
    medications = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="prescription")

class AppointmentLog(Base):
    __tablename__ = "appointment_logs"

    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
