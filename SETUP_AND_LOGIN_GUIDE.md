# 🚀 COCK SYLLABI - COMPLETE SETUP GUIDE

## ✅ APPLICATION STATUS

### Currently Running:
- ✅ **Frontend**: http://localhost:5173
- ✅ **Backend**: http://localhost:5000
- ⚠️ **Database**: MongoDB - Needs Setup

---

## 🔐 LOGIN CREDENTIALS

### Admin Login
- **Route**: Click "Admin" button in navbar OR visit http://localhost:5173/admin-login
- **Username**: `arham ka coc syllabi`
- **Password**: `succes`

### Teacher Account
- **Route**: /register → Select "Teacher" role
- **Steps**:
  1. Register with any email (e.g., teacher@example.com)
  2. Password: any 6+ characters
  3. Submit teacher request from Teacher Dashboard
  4. Login as Admin to approve request
  5. Back to Teacher Dashboard to see allocated account

### Student Account
- **Route**: /register → Select "Student" role
- **Steps**:
  1. Fill name, email, password (6+ chars)
  2. Click Register
  3. Access Student Dashboard

---

## 🗄️ MONGODB SETUP (Required for Database Operations)

### Option 1: Download MongoDB Community Edition (Recommended)

1. Visit: https://www.mongodb.com/try/download/community
2. Select your OS (Windows)
3. Download and Run Installer
4. Choose "Install MongoDB as a Service"
5. Accept Default Installation Path
6. Complete Installation

After installation:
```bash
# Test MongoDB is running
mongod --version

# Verify database connection
# The backend will automatically connect
```

### Option 2: Use MongoDB Atlas (Cloud - No Installation Needed)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create FREE account
3. Create a Free Cluster
4. Get Connection String (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cock-syllabi
   ```
5. Update `.env` file:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cock-syllabi
   ```
6. Restart Backend server

### Option 3: Docker (If Docker is Installed)

```bash
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongo mongo:latest

# Backend will automatically connect
```

---

## 🔌 VERIFY CONNECTIONS

### Test Backend Health Check
Open in browser or terminal:
```bash
curl http://localhost:5000/health
# Should return: { "message": "Server is running" }
```

### Test MongoDB Connection
Once MongoDB is installed, restart backend:
```bash
node server.js
# Should show: ✓ MongoDB Connected: localhost
```

---

## 📱 TESTING THE APPLICATION

### Home Page
1. Visit http://localhost:5173
2. See landing page with sign up options

### Student Flow
1. Click "Register"
2. Fill: Name, Email, Password, Select "Student"
3. Auto-login to /student dashboard
4. Browse courses (empty until courses created)
5. View student statistics

### Teacher Flow
1. Click "Register"
2. Fill form, Select "Teacher"
3. Submit teacher request with message
4. Switch to Admin to approve
5. Return to Teacher Dashboard
6. Create courses with pricing

### Admin Flow
1. Click "Admin" button in navbar
2. username: `arham ka coc syllabi`
3. password: `succes`
4. Access dashboard:
   - View statistics
   - Manage teacher requests
   - Approve/reject courses
   - View users and categories

---

## 🎮 CREATE SAMPLE DATA

### Once MongoDB is Connected

#### Step 1: Create Admin (Auto-Created)
```bash
cd backend
npm run setup-admin
# Creates default admin user
```

#### Step 2: Generate Teacher Pool (1000 accounts)
```bash
npm run generate-teacher-pool
# Creates TEACH0001 to TEACH1000
```

#### Step 3: Create Categories
```bash
npm run generate-categories
# Creates 10 course categories
```

### Manual Data Creation (After MongoDB Setup)

**Via Admin Dashboard:**
1. Login as Admin
2. Go to Categories section
3. Create categories (Math, Science, English, etc.)

**Via Teacher Dashboard:**
1. Register as Teacher
2. Submit request → Admin approves
3. Click "Create New Course"
4. Fill:
   - Title: "Java Programming 101"
   - Description: Course overview
   - Subject: Computer Science
   - Class: 10
   - Price: 1000 (will show 1030 with 3% markup)
5. Admin approves the course
6. Course appears in public listing

---

## 🛠️ FILE LOCATIONS

| Component | Location | Role |
|-----------|----------|------|
| Backend Server | `backend/server.js` | API & Routes |
| Frontend App | `frontend/src/App.jsx` | Main App |
| Admin Login | `frontend/src/pages/AdminLogin.jsx` | Admin Page |
| Student Dashboard | `frontend/src/pages/StudentDashboard.jsx` | Student Page |
| Teacher Dashboard | `frontend/src/pages/TeacherDashboard.jsx` | Teacher Page |
| Database Config | `backend/config/database.js` | DB Connection |
| Auth Controller | `backend/controllers/authController.js` | Login/Register Logic |
| Models | `backend/models/` | Database Schemas |

---

## 🚨 TROUBLESHOOTING

### Frontend Won't Load
```bash
# Check Vite is running on port 5173
# Clear browser cache: Ctrl+Shift+Delete
# Restart frontend: Ctrl+C then npm run dev
```

### Login Says "Invalid Credentials"
```bash
# Check .env file in backend/
# Username must be: arham ka coc syllabi (with spaces)
# Password must be: succes
# Restart backend server
```

### API Errors (500)
```bash
# Install MongoDB (see Option 1 above)
# OR use MongoDB Atlas (see Option 2 above)
# Update .env with MongoDB URI
# Restart backend
```

### Port Already in Use
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart servers
cd backend && node server.js
cd frontend && npm run dev
```

---

## 🔗 QUICK ACCESS LINKS

- **Home**: http://localhost:5173
- **Login**: http://localhost:5173/login
- **Register**: http://localhost:5173/register
- **Courses**: http://localhost:5173/courses
- **Admin**: http://localhost:5173/admin-login
- **API Health**: http://localhost:5000/health

---

## 📋 COMPLETE PROJECT FEATURES

✅ User Registration (Student, Teacher, Admin)  
✅ Secure Login with JWT Tokens  
✅ Admin Dashboard with Statistics  
✅ Teacher Request & Approval System  
✅ Teacher Account Pool (1000 pre-generated)  
✅ Course Management (CRUD)  
✅ Course Approval Workflow  
✅ Student Enrollment  
✅ Progress Tracking  
✅ Schedule Generation  
✅ Dynamic Pricing (3% markup)  
✅ Category Management  
✅ Search & Filter  
✅ Responsive Design  
✅ Professional UI (Blue/Yellow Theme)  

---

## 🎯 NEXT STEPS

1. **Set up MongoDB**
   - Option 1: Download & Install locally (Recommended)
   - Option 2: Use MongoDB Atlas cloud service
   - Option 3: Use Docker

2. **Create Initial Data**
   ```bash
   cd backend
   npm run setup-admin
   npm run generate-teacher-pool
   npm run generate-categories
   ```

3. **Test All Flows**
   - Admin login
   - Teacher registration & request
   - Course creation & approval
   - Student enrollment

4. **Customize**
   - Change colors in `frontend/tailwind.config.js`
   - Update admin credentials in `backend/.env`
   - Add your own courses & categories

---

## 📞 SUPPORT

All major files are documented in:
- README.md - Project overview
- INSTALLATION.md - Detailed setup
- QUICK_REFERENCE.md - Commands cheat sheet
- API_DOCUMENTATION.md - REST API endpoints
- PROJECT_STATUS.md - Requirements checklist

---

**Status**: 🟢 READY TO USE (Database pending setup)

Created: February 13, 2026  
Version: 1.0
