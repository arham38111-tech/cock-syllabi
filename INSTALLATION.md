# Cock Syllabi - Installation & Setup Guide

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js v16+ installed
- MongoDB (local or Atlas connection string)
- Git
- VS Code (recommended)

### Step 1: Clone and Install

```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and admin credentials
npm install

# Frontend setup
cd ../frontend
cp .env.example .env
npm install
```

### Step 2: Initialize Database

```bash
cd backend
npm run setup-admin
npm run generate-teacher-pool
npm run generate-categories
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Visit: http://localhost:5173

---

## 📋 Detailed Setup Instructions

### 1. Environment Variables

#### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/cock-syllabi
# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cock-syllabi?retryWrites=true&w=majority

PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here_change_in_production

# Admin Credentials
ADMIN_USERNAME=arham ka coc syllabi
ADMIN_PASSWORD=succes

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Database Setup

Cock Syllabi uses MongoDB. Choose one:

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service: mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to .env in backend

### 3. Initialize Data

```bash
cd backend

# Create default admin user
npm run setup-admin
# Output should show: ✓ Admin user created successfully

# Generate 1000 teacher accounts (TEACH0001 to TEACH1000)
npm run generate-teacher-pool
# Output: ✓ Teacher account pool generated successfully

# Create default course categories
npm run generate-categories
# Output: ✓ Default categories created successfully
```

### 4. Start Development Servers

```bash
# Backend (Terminal 1)
cd backend
npm run dev
# Output: ✓ Server running on port 5000

# Frontend (Terminal 2)
cd frontend
npm run dev
# Output: ✓ Frontend running on http://localhost:5173
```

---

## 🔐 Default Credentials

### Admin Login
- **URL**: http://localhost:5173/admin
- **Username**: `arham ka coc syllabi`
- **Password**: `succes`

### Test Student Account
```bash
Email: student@example.com
Password: password123
Role: Student
```

Create by registering on: http://localhost:5173/register

### Test Teacher Account
```bash
Email: teacher@example.com
Password: password123
Role: Teacher (requires admin approval)
```

---

## 📁 Project Structure

```
cock-syllabi/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, error handling
│   ├── scripts/         # Setup scripts
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Utilities
│   │   ├── styles/      # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/login-admin` - Admin login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - Get all approved courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (teacher)
- `PATCH /api/courses/:id` - Update course (teacher)
- `DELETE /api/courses/:id` - Delete course (teacher)
- `PATCH /api/courses/:id/approve` - Approve course (admin)
- `PATCH /api/courses/:id/reject` - Reject course (admin)

### Teachers
- `POST /api/teachers/request` - Submit teacher request
- `GET /api/teachers/my-request` - Get my request
- `GET /api/teachers/requests` - Get all requests (admin)
- `PATCH /api/teachers/requests/:id/approve` - Approve request (admin)
- `PATCH /api/teachers/requests/:id/reject` - Reject request (admin)

### Students
- `POST /api/students/enroll/:courseId` - Enroll in course
- `GET /api/students/my-courses` - Get enrolled courses
- `GET /api/students/schedule` - Get my schedule
- `POST /api/students/schedule/generate` - Generate schedule
- `GET /api/students/stats` - Get statistics

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/teachers` - Get all teachers
- `GET /api/admin/pool-status` - Teacher pool status
- `GET /api/admin/analytics` - Course analytics

---

## 🚀 Features Implemented

### ✅ Authentication
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student)
- Secure password hashing with bcrypt
- Environment-protected admin credentials

### ✅ Admin Dashboard
- Teacher request approval/rejection
- Course approval/rejection workflow
- User management
- Teacher account pool allocation
- Analytics and statistics
- Category management

### ✅ Teacher Portal
- Course creation with pricing
- Course upload and management
- Teacher request submission
- Automatic account allocation
- Sales tracking

### ✅ Student Dashboard
- Course enrollment and purchasing
- Progress tracking
- Schedule generator (AI-based)
- Course list and filtering
- Statistics and analytics

### ✅ Pricing Logic
- 3% automatic markup calculation
- Frontend + Backend validation
- Clear pricing display

### ✅ UI/UX
- Professional design with Blue & Yellow theme
- Responsive mobile-first layout
- Smooth animations with Framer Motion
- Zero layout breakage
- Copy-friendly clean components

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB Connection Error
```
**Solution**: 
- Check .env MONGO_URI is correct
- Ensure MongoDB is running locally OR Atlas connection string is valid
- For Atlas, add IP to whitelist

### Admin Login Fails
**Solution**:
- Ensure ADMIN_USERNAME and ADMIN_PASSWORD in .env match exactly
- Username must be: `arham ka coc syllabi` (with spaces)
- Password must be: `succes`
- Run: `npm run setup-admin` to create admin user

### Teacher Pool Not Generated
```bash
npm run generate-teacher-pool
# Check if accounts exist already
```

### Ports Already in Use
```bash
# Change port in backend: backend/.env (PORT=5001)
# Change port in frontend: frontend/vite.config.js
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'teacher' | 'student',
  allocatedTeacherAccount: String,
  isApproved: Boolean,
  bio: String,
  profileImage: String,
  createdAt: Date
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  teacherId: ObjectId (ref: User),
  title: String,
  description: String,
  subject: String,
  class: String,
  price: Number,
  finalPrice: Number,
  approved: Boolean,
  thumbnail: String,
  videos: [{
    title: String,
    url: String,
    duration: Number
  }],
  enrollmentCount: Number,
  createdAt: Date
}
```

### TeacherAccountsPool Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  password: String (hashed),
  allocated: Boolean,
  allocatedTo: ObjectId (ref: User),
  allocatedAt: Date
}
```

---

## 🎨 Customization

### Change Admin Credentials
Edit backend/.env:
```env
ADMIN_USERNAME=your_new_username
ADMIN_PASSWORD=your_new_password
```
Then run: `npm run setup-admin`

### Change Theme Colors
Edit frontend/tailwind.config.js:
```javascript
colors: {
  primary: '#1565C0',      // Blue
  secondary: '#FFD600',    // Yellow
  neutral: '#FFFFFF',      // White
}
```

### Change Teacher Pool Size
Edit backend/scripts/generate-teacher-pool.js:
```javascript
for (let i = 1; i <= 1000; i++) {  // Change 1000 to desired number
```

---

## 📱 Responsive Design Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are fully responsive.

---

## 🔒 Security Best Practices

1. **Never commit .env files** - Added to .gitignore
2. **Use HTTPS in production**
3. **Change JWT_SECRET in production**
4. **Use environment variables for all secrets**
5. **Keep dependencies updated**: `npm update`
6. **Rate limiting on production** - Implement with express-rate-limit

---

## 📈 Production Deployment

### Backend (Node.js)
1. Deploy to Heroku, AWS, or DigitalOcean
2. Set environment variables on server
3. Use production-grade MongoDB (Atlas recommended)
4. Enable HTTPS
5. Set NODE_ENV=production

### Frontend (React)
1. Build: `npm run build`
2. Deploy dist/ folder to Vercel, Netlify, or AWS S3
3. Configure CORS for production API URL

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check backend logs for errors
4. Verify .env configuration

---

**Build Status**: ✅ Ready for Development & Production

Last Updated: February 2026
