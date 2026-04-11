from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "patient"


class Login(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DepartmentOut(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True


class DoctorCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialization: str
    department_id: Optional[int] = None
    bio: Optional[str] = ""


class DoctorUpdate(BaseModel):
    specialization: Optional[str] = None
    department_id: Optional[int] = None
    bio: Optional[str] = None
    name: Optional[str] = None


class DoctorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    specialization: str
    department: Optional[str] = None
    department_id: Optional[int] = None
    bio: Optional[str] = ""

    class Config:
        from_attributes = True


class ScheduleCreate(BaseModel):
    date: date
    time_slot: str


class ScheduleOut(BaseModel):
    id: int
    doctor_id: int
    date: date
    time_slot: str

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    doctor_id: int
    date: date
    time_slot: str


class AppointmentOut(BaseModel):
    id: int
    doctor_id: Optional[int] = None
    patient_id: Optional[int] = None
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    date: date
    time_slot: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AppointmentStatusUpdate(BaseModel):
    status: str


class PrescriptionCreate(BaseModel):
    appointment_id: int
    medications: str
    notes: Optional[str] = ""


class PrescriptionOut(BaseModel):
    id: int
    appointment_id: int
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    medications: str
    notes: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TopDoctorOut(BaseModel):
    doctor_id: int
    doctor_name: str
    specialization: Optional[str] = None
    department: Optional[str] = None
    booked_count: int

    class Config:
        from_attributes = True


class AdminStatsOut(BaseModel):
    total_doctors: int
    total_patients: int
    total_appointments: int
    total_departments: int
