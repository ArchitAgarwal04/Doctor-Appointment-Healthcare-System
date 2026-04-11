# 🏥 Doctor Appointment & Healthcare Management System

A full-stack web application for managing doctor appointments, patient records, prescriptions, and clinic operations — built with **FastAPI** (backend) and **React + Vite + TailwindCSS** (frontend).

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Without Docker (Manual)](#option-1-without-docker-manual)
  - [With Docker](#option-2-with-docker-recommended)
- [Default Login Credentials](#-default-login-credentials)
- [API Endpoints](#-api-endpoints)
- [Role-Based Access](#-role-based-access)

---

## ✨ Features

### 👨‍💼 Admin
- Dashboard with live stats (doctors, patients, appointments, departments)
- Manage doctors — add, edit, delete
- Manage departments — create, update, delete
- View & filter all appointments by status
- Reports: top doctors by appointment count

### 🩺 Doctor
- Personal dashboard with today's appointments overview
- Manage weekly schedule — add/remove time slots
- View upcoming & past appointments
- Write prescriptions for completed appointments
- Receive notifications for upcoming patient visits

### 🙋 Patient
- Browse and filter doctors by department / specialization
- Book appointments from available time slots
- View, track, and cancel own appointments
- Access prescriptions issued by doctors
- Receive notifications for upcoming appointments

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, React Router v6 |
| **UI Components** | Lucide React, Recharts, React Hot Toast |
| **Backend** | FastAPI, Python 3.10, Uvicorn |
| **Database** | SQLite via SQLAlchemy ORM |
| **Auth** | JWT (PyJWT) + bcrypt password hashing |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📁 Project Structure

```
├── backend/
│   ├── main.py            # All API routes
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # JWT auth & password hashing
│   ├── database.py        # DB engine & session setup
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API calls
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React auth context
│   │   └── pages/
│   │       ├── admin/     # Admin dashboard pages
│   │       ├── doctor/    # Doctor dashboard pages
│   │       └── patient/   # Patient dashboard pages
│   ├── nginx.conf         # Nginx config for SPA routing
│   └── Dockerfile
│
├── docker-compose.yml     # Orchestrates backend + frontend
└── .gitignore
```

---

## 🚀 Getting Started

### Option 1: Without Docker (Manual)

#### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at → **http://localhost:8000**  
API Docs (Swagger) → **http://localhost:8000/docs**

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at → **http://localhost:3000**

---

### Option 2: With Docker (Recommended)

> **Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.

```bash
# From the project root
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

**Stop all services:**
```bash
docker-compose down
```

---

## 🔐 Default Login Credentials

The database is **auto-seeded** on first startup with the following test accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@clinic.com | admin123 |
| **Doctor** | dr.smith@clinic.com | doctor123 |
| **Doctor** | dr.sarah@clinic.com | doctor123 |
| **Doctor** | dr.chen@clinic.com | doctor123 |
| **Doctor** | dr.emily@clinic.com | doctor123 |
| **Doctor** | dr.robert@clinic.com | doctor123 |
| **Doctor** | dr.priya@clinic.com | doctor123 |
| **Patient** | patient@clinic.com | patient123 |

> New patients can **self-register** from the login page.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register a new patient | Public |
| `POST` | `/login` | Login and get JWT token | Public |
| `GET` | `/me` | Get current user info | Authenticated |

### Departments
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/departments` | List all departments | Public |
| `POST` | `/departments` | Create department | Admin |
| `PUT` | `/departments/{id}` | Update department | Admin |
| `DELETE` | `/departments/{id}` | Delete department | Admin |

### Doctors
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/doctors` | List doctors (filterable) | Public |
| `GET` | `/doctors/{id}` | Get doctor details | Public |
| `POST` | `/admin/doctors` | Add a doctor | Admin |
| `PUT` | `/admin/doctors/{id}` | Update doctor | Admin |
| `DELETE` | `/admin/doctors/{id}` | Remove doctor | Admin |

### Schedules & Slots
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/schedules` | My schedule | Doctor |
| `POST` | `/schedules` | Add time slot | Doctor |
| `DELETE` | `/schedules/{id}` | Remove time slot | Doctor |
| `GET` | `/available-slots/{doctor_id}` | Get available slots | Public |

### Appointments
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/book` | Book appointment | Patient |
| `GET` | `/appointments/history` | My appointments | Patient |
| `PATCH` | `/appointments/{id}/cancel` | Cancel appointment | Patient |
| `GET` | `/appointments/doctor` | My appointments | Doctor |
| `PATCH` | `/appointments/{id}/status` | Update status | Doctor/Admin |
| `GET` | `/admin/appointments` | All appointments | Admin |

### Prescriptions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/prescriptions` | Create prescription | Doctor |
| `GET` | `/patient/prescriptions` | My prescriptions | Patient |
| `GET` | `/doctor/prescriptions` | Prescriptions issued | Doctor |

### Reports & Notifications
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/admin/stats` | Dashboard statistics | Admin |
| `GET` | `/reports/top-doctors` | Top doctors report | Admin |
| `GET` | `/notifications` | Role-based notifications | Authenticated |

---

## 🔒 Role-Based Access

```
Public        → View doctors, departments, register, login
Patient       → Book/cancel/view appointments, view prescriptions
Doctor        → Manage schedule, update appointment status, write prescriptions
Admin         → Full access to all data, manage doctors & departments, view reports
```

---

## 👨‍💻 Author

**Archit Agarwal** 
**Mehul Agarwal**
**Glory Srujitha** 
GitHub: [@ArchitAgarwal04](https://github.com/ArchitAgarwal04)
