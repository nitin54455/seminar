# Smart Appointment & Prescription Management System

A full-stack web application for clinics and small hospitals to manage appointments, prescriptions, and patient medical history with role-based access (Admin, Doctor, Patient).

## Tech Stack

- **Frontend:** React 18 (functional components, hooks), React Router, Axios, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with role-based middleware, bcrypt password hashing

## Project Structure

```
seminar/
├── backend/                 # Node + Express API
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # auth, authorize
│   │   ├── models/         # User, Appointment, Prescription
│   │   ├── routes/         # auth, appointments, prescriptions, admin
│   │   ├── utils/          # errorHandler
│   │   ├── scripts/        # seedAdmin
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── api/            # axios instance
│   │   ├── components/     # Layout
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Register, Patient/Doctor/Admin dashboards
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Setup & Run

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, PORT (default 5000)
npm install
npm run dev
```

Create initial admin user (run once):

```bash
node src/scripts/seedAdmin.js
# Admin: admin@clinic.com / admin123
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:3000 and proxies `/api` to the backend.

### 3. MongoDB

Ensure MongoDB is running. If using a local instance:

```bash
# Windows (if installed as service it may already be running)
# Linux/macOS: mongod
```

Or set `MONGODB_URI` in backend `.env` to a MongoDB Atlas connection string.

## API Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register patient | - |
| POST | /api/auth/login | Login | - |
| GET | /api/auth/me | Current user | JWT |
| GET | /api/appointments/doctors | List doctors | JWT |
| GET | /api/appointments | List appointments (role-filtered) | JWT |
| POST | /api/appointments | Book appointment | Patient |
| PATCH | /api/appointments/:id/status | Approve/reject | Doctor |
| GET | /api/prescriptions | List prescriptions | JWT |
| POST | /api/prescriptions | Create prescription | Doctor |
| GET | /api/prescriptions/:id | Get one prescription | JWT |
| GET | /api/admin/overview | System counts | Admin |
| GET | /api/admin/patients | All patients | Admin |
| GET | /api/admin/appointments | All appointments | Admin |
| GET | /api/admin/doctors | All doctors | Admin |
| POST | /api/admin/doctors | Add doctor | Admin |
| DELETE | /api/admin/doctors/:id | Remove doctor | Admin |

## User Roles & Features

- **Patient:** Register, login, view doctors, book appointments, view status, view/download prescriptions, medical history.
- **Doctor:** Login, view assigned appointments, approve/reject requests, create prescriptions, view patient history, daily schedule.
- **Admin:** Login, add/remove doctors, view all patients and appointments, system overview dashboard.

## Default Credentials (after seed)

- **Admin:** admin@clinic.com / admin123

Add doctors via Admin dashboard; patients register from the Register page.

## License

MIT (or as required for your submission).
