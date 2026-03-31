# Smart Appointment & Prescription Management System

A full-stack web application for clinics and small hospitals to manage appointments, prescriptions, and patient medical history with role-based access (Admin, Doctor, Patient).

## Tech Stack

- **Frontend:** React 18 (functional components, hooks), React Router, Axios, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT with role-based middleware, bcrypt password hashing

## Setup & Run

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, PORT (default 5000)
npm install
npm run dev
```


## Default Credentials (after seed)

- **Admin:** admin@clinic.com / admin123

Add doctors via Admin dashboard; patients register from the Register page.

## License

MIT (or as required for your submission).
