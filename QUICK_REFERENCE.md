# ⚡ Cock Syllabi - Quick Reference Guide

## 🚀 Start Project in 5 Steps

```bash
# 1. Enter project
cd cock-syllabi

# 2. Configure backend
cd backend
cp .env.example .env
# Edit .env with MongoDB URI

# 3. Install and initialize
npm install
npm run setup-admin
npm run generate-teacher-pool
npm run generate-categories

# 4. Start backend
npm run dev
# Backend runs on http://localhost:5000

# 5. In another terminal, start frontend
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Default Credentials

| Role | Username | Password | URL |
|------|----------|----------|-----|
| Admin | `arham ka coc syllabi` | `succes` | `/admin` |
| Test Student | `student@example.com` | `password123` | `/login` |
| Test Teacher | `teacher@example.com` | `password123` | `/login` |

---

## 📋 Common Commands

### Backend
```bash
cd backend

# Start development server
npm run dev

# Setup admin user (run once)
npm run setup-admin

# Generate teacher accounts (run once)
npm run generate-teacher-pool

# Create categories (run once)
npm run generate-categories

# Check for errors
npm run lint
```

### Frontend
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔗 Important URLs

| Page | URL | Role |
|------|-----|------|
| Home | `/` | Public |
| Courses | `/courses` | Public |
| Course Detail | `/course/:id` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Admin Panel | `/admin` | Admin |
| Admin Login | `/admin/login` | Admin |
| Teacher Portal | `/teacher` | Teacher |
| Student Dashboard | `/student` | Student |

---

## 💾 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/cock-syllabi
PORT=5000
NODE_ENV=development
JWT_SECRET=change_this_in_production
ADMIN_USERNAME=arham ka coc syllabi
ADMIN_PASSWORD=succes
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Initialization

```javascript
// What each script does:

// 1. set.admin.js
- Creates one super admin user
- Email: admin@cock-syllabi.local
- Prevents duplicate admin creation
- Uses bcrypt for password

// 2. generate-teacher-pool.js
- Creates 1000 teacher accounts
- Format: TEACH0001 to TEACH1000
- All marked as not allocated
- Admin assigns them to approved teachers

// 3. generate-categories.js
- Creates 10 default categories
- Math, Science, English, History, etc.
-Each with description and slug

// Run in order:
npm run setup-admin
npm run generate-teacher-pool
npm run generate-categories
```

---

## 🔐 Authentication Flow

```
User Registration
    ↓
User enters name, email, password, role
    ↓
Backend: Hash password with bcrypt
    ↓
Save to database
    ↓
Generate JWT token
    ↓
Return token + user data
    ↓
Frontend: Store token in localStorage
    ↓
Use token in Authorization header for future requests
```

---

## 💰 Pricing Logic

```javascript
// Teacher enters: $1000
// System calculates:
basePri = 1000
finalPrice = 1000 + (1000 * 0.03)
finalPrice = 1030

// Display to student: $1030
// Happens on FRONTEND and BACKEND
// Backend is authoritative
```

---

## 👥 Role-Based Access Control

```javascript
// Admin
- View all users
- Approve/reject teachers
- Approve/reject courses
- Manage categories
- Allocate teacher accounts

// Teacher
- Create courses
- Edit own courses
- Delete own courses
- Submit teacher request
- View own sales

// Student
- Browse courses
- Buy courses
- Track progress
- Generate schedule
- View profile
```

---

## 🔌 API Request Format

### With Authentication
```javascript
const token = localStorage.getItem('token');

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Using Axios (configured in api.js)
const response = await apiClient.post('/courses', data);
```

### Without Authentication
```javascript
const response = await apiClient.get('/courses');
```

---

## 📊 API Response Format

### Success (200, 201)
```json
{
  "message": "Success message",
  "data": { ... } or "user": { ... } or "courses": [ ... ]
}
```

### Error (400, 401, 403, 404, 500)
```json
{
  "message": "Error description"
}
```

---

## 🧪 Testing Features

### Test Admin Access
1. Go to `/admin/login`
2. Enter username: `arham ka coc syllabi`
3. Enter password: `succes`
4. Should see dashboard with stats

### Test Teacher Flow
1. Register as teacher
2. Submit teacher request (wait for admin to approve)
3. Create course after approval
4. Submit course for approval

### Test Student Flow
1. Register as student
2. Browse courses at `/courses`
3. Click a course to see details
4. Enroll and track progress
5. Go to `/student/schedule`
6. Enter subjects and generate schedule

---

## 🚨 Common Issues & Solutions

### Issue: Admin Login Fails
```
Solution:
1. Check .env has correct username and password
2. Username must have spaces: "arham ka coc syllabi"
3. Password is: "succes"
4. Run: npm run setup-admin
5. Restart backend server
```

### Issue: MongoDB Connection Error
```
Solution:
1. Start MongoDB service: mongod
2. Check .env MONGO_URI is correct
3. For Atlas, ensure IP is whitelisted
4. Test connection in MongoDB Compass
```

### Issue: Ports Already in Use
```
Solution:
1. Backend: Change PORT in backend/.env
2. Frontend: Change port in frontend/vite.config.js
3. Or kill process using port:
   - Windows: netstat -ano | findstr :5000
   - Mac/Linux: lsof -i :5000 | kill -9
```

### Issue: Token Errors
```
Solution:
1. Clear localStorage: Dev Tools → Storage → localStorage → Clear
2. Logout and re-login
3. Check JWT_SECRET in .env matches between frontend/backend
```

---

## 🎨 Styling Reference

### Tailwind Classes Used
```
bg-blue-600       → Button primary color
text-white        → Text on buttons
rounded-lg        → Border radius
shadow-premium    → Custom shadow (4px 4px 16px)
hover:bg-blue-700 → Hover state
```

### Custom Colors
```css
primary:   #1565C0  (Blue)
secondary: #FFD600  (Yellow)
neutral:   #FFFFFF  (White)
```

### Font
```css
font-family: 'Poppins', sans-serif
weights: 300, 400, 500, 600, 700, 800
```

---

## 📱 Responsive Design

### Tailwind Prefixes
```
sm: @media (min-width: 640px)
md: @media (min-width: 768px)
lg: @media (min-width: 1024px)
```

### Example
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3">
  // 1 column on mobile
  // 2 columns on tablet
  // 3 columns on desktop
</div>
```

---

## 🐛 Debug Tips

### See API Requests
```javascript
// In browser Dev Tools → Network tab
// Check API calls being made to http://localhost:5000/api
```

### Check Backend Logs
```bash
# Terminal running backend server
# All requests logged with timestamps
console.log() and console.error() output
```

### Check Stored Data
```javascript
// In browser Dev Tools → Application
// localStorage → see stored token
// sessionStorage → see session data
```

### Database Inspection
```bash
# Use MongoDB Compass
# Connect to: mongodb://localhost:27017
# Or use MongoDB Atlas dashboard
```

---

## 📚 File Location Cheat Sheet

| What to Edit | File |
|--------------|------|
| Admin username | backend/.env |
| Admin password | backend/.env |
| MongoDB connection | backend/.env |
| Colors/theme | frontend/tailwind.config.js |
| API base URL | frontend/.env |
| Backend port | backend/.env |
| Frontend port | frontend/vite.config.js |
| Global styles | frontend/src/styles/index.css |
| Routes | frontend/src/App.jsx |

---

## ✅ Deployment Checklist

- [ ] Remove .env files (use environment variables on server)
- [ ] Set NODE_ENV=production in backend
- [ ] Change JWT_SECRET to something strong
- [ ] Use MongoDB Atlas (not local)
- [ ] Set FRONTEND_URL to production domain
- [ ] Update VITE_API_URL to production API
- [ ] Build frontend: `npm run build`
- [ ] Deploy backend to server
- [ ] Deploy frontend `dist/` folder to hosting
- [ ] Enable HTTPS
- [ ] Setup domain SSL certificate
- [ ] Configure CORS for production domain

---

## 🎓 Key Concepts

### JWT (JSON Web Token)
- Issued after successful login
- Sent with every authenticated request
- Contains: { userId, role, email, expiresIn }
- Stored in localStorage on frontend

### Bcrypt
- Hashes passwords before storing
- Adds salt for security
- Used for password comparison
- Passwords never stored in plain text

### MongoDB ObjectId
-  Every document has unique `_id`
- Used for relationships (foreign keys)
- 24-character hex string

### Role-Based Access Control
- Middleware checks user role
- Only allows users with correct role
- Admin > Teacher > Student permissions

### Pricing Calculation
- Frontend shows final price for reference
- Backend calculates authoritative final price
- Student sees and pays final price
- Teacher sees base price + margin info

---

## 🔗 External Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Bcrypt Security](https://en.wikipedia.org/wiki/Bcrypt)

---

## 📞 Getting Help

1. **Check Documentation**
   - README.md - Overview and features
   - INSTALLATION.md - Setup instructions
   - API_DOCUMENTATION.md - All endpoints
   - FILE_STRUCTURE.md - File organization
   - PROJECT_STATUS.md - Requirements checklist

2. **Review Logs**
   - Backend console for server errors
   - Browser console for frontend errors
   - Network tab for API errors

3. **Common Solutions**
   - Clear cache and localStorage
   - Restart backend and frontend
   - Reinitialize database
   - Check environment variables

---

**Quick Reference Version**: 1.0  
**Last Updated**: February 2026

Keep this guide handy while developing! 🚀
