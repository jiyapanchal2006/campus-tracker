# 🎓 Campus Tracker — MERN Stack Project

A full-stack campus management system built with **MongoDB, Express.js, React, Node.js**.

## Features
- 🔐 JWT Authentication (Register / Login) with role-based access (Admin, Faculty, Student)
- 👤 Student Management (CRUD)
- 📚 Course Management with student enrollment
- ✅ Attendance Tracking — bulk mark, per-student summary, percentage alerts
- 📊 Grade Management — assessments, final grades, GPA calculation
- 📅 Campus Events — create, filter, view upcoming/past events
- 📱 Clean dark-themed UI (no Tailwind dependency issues)

---

## 🚀 Setup & Run (Step by Step)

### Prerequisites
Make sure you have installed:
- **Node.js** (v16+) → https://nodejs.org
- **MongoDB Community** (local) → https://www.mongodb.com/try/download/community
- **npm** (comes with Node.js)

---

### Step 1 — Start MongoDB
```bash
# On Windows (run in terminal as admin or use MongoDB Compass)
mongod

# On macOS (if installed via Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

---

### Step 2 — Start the Backend
```bash
cd backend
npm install
npm run dev
```
The backend will start at **http://localhost:5000**

---

### Step 3 — Start the Frontend
Open a **new terminal window**:
```bash
cd frontend
npm install
npm start
```
The React app will open at **http://localhost:3000**

---

## 📁 Project Structure
```
campus-tracker/
├── backend/
│   ├── models/          # Mongoose schemas (User, Course, Attendance, Grade, Event)
│   ├── routes/          # Express route handlers
│   ├── middleware/       # JWT auth middleware
│   ├── server.js        # Main Express app
│   ├── .env             # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── context/     # React Auth context
    │   ├── pages/       # Dashboard, Students, Courses, Attendance, Grades, Events
    │   ├── components/  # Layout, Sidebar
    │   ├── api.js       # Axios API calls
    │   └── index.css    # All styles
    └── package.json
```

---

## 🔑 First Time Use
1. Open http://localhost:3000
2. Click **Register here**
3. Create an account with role **Admin** for full access
4. Log in and explore all features

## Environment Variables (backend/.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus_tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

## MERN Topics Covered
- **MongoDB** — Mongoose ODM, schemas, relationships (refs), indexes, bulkWrite
- **Express.js** — REST API, middleware, routing, error handling
- **React** — Hooks (useState, useEffect), Context API, React Router v6
- **Node.js** — Server, JWT auth, bcrypt hashing, dotenv config
