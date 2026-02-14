# 🔌 Cock Syllabi - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "student" | "teacher"
}

Response 201:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "allocatedTeacherAccount": null
  }
}
```

### Admin Login
```http
POST /auth/login-admin
Content-Type: application/json

{
  "username": "arham ka coc syllabi",
  "password": "succes"
}

Response 200:
{
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Administrator",
    "email": "admin@cock-syllabi.local",
    "role": "admin"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    ...all user fields
  }
}
```

---

## 📚 Course Endpoints

### Get All Courses
```http
GET /courses?subject=Mathematics&class=10&search=algebra
Authorization: Optional (Bearer <token>)

Query Parameters:
- subject (string): Filter by subject
- class (string): Filter by class
- search (string): Search in title and description

Response 200:
{
  "courses": [
    {
      "_id": "...",
      "title": "Algebra Fundamentals",
      "description": "...",
      "subject": "Mathematics",
      "class": "10",
      "price": 1000,
      "finalPrice": 1030,
      "approved": true,
      "enrollmentCount": 45,
      "rating": 4.5,
      "teacherId": { "name": "...", "email": "..." },
      "category": { "name": "Mathematics" }
    }
  ]
}
```

### Get Course Details
```http
GET /courses/:courseId
Authorization: Optional

Response 200:
{
  "course": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "price": 1000,
    "finalPrice": 1030,
    "videos": [
      {
        "title": "Chapter 1",
        "url": "...",
        "duration": 3600
      }
    ],
    "teacherId": {
      "name": "...",
      "email": "...",
      "bio": "..."
    },
    ...all course fields
  }
}
```

### Create Course (Teacher)
```http
POST /courses
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Advanced Mathematics",
  "description": "Learn advanced mathematical concepts",
  "subject": "Mathematics",
  "classLevel": "12",
  "price": 1500,
  "category": "categoryId"
}

Response 201:
{
  "message": "Course created successfully",
  "course": {
    "_id": "...",
    "title": "Advanced Mathematics",
    "price": 1500,
    "finalPrice": 1545,
    "approved": false,
    ...all course fields
  }
}
```

### Update Course (Teacher)
```http
PATCH /courses/:courseId
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 2000
}

Response 200:
{
  "message": "Course updated successfully",
  "course": {...updated course}
}
```

### Delete Course (Teacher)
```http
DELETE /courses/:courseId
Authorization: Bearer <teacher_token>

Response 200:
{
  "message": "Course deleted successfully"
}
```

### Approve Course (Admin)
```http
PATCH /courses/:courseId/approve
Authorization: Bearer <admin_token>

Response 200:
{
  "message": "Course approved successfully",
  "course": {...course with approved: true}
}
```

### Reject Course (Admin)
```http
PATCH /courses/:courseId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Content quality does not meet standards"
}

Response 200:
{
  "message": "Course rejected",
  "course": {...course with rejectionReason}
}
```

---

## 👨‍🏫 Teacher Endpoints

### Submit Teacher Request
```http
POST /teachers/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I am an experienced educator with 10 years of teaching experience..."
}

Response 201:
{
  "message": "Teacher request submitted successfully",
  "request": {
    "_id": "...",
    "teacherId": "...",
    "message": "...",
    "status": "pending"
  }
}
```

### Get My Teacher Request
```http
GET /teachers/my-request
Authorization: Bearer <token>

Response 200:
{
  "request": {
    "_id": "...",
    "status": "pending" | "approved" | "rejected",
    "allocatedUsername": "TEACH0001" | null,
    "allocatedPassword": "..." | null,
    "rejectionReason": "..." | null
  }
}
```

### Get All Teacher Requests (Admin)
```http
GET /teachers/requests
Authorization: Bearer <admin_token>

Response 200:
{
  "requests": [
    {
      "_id": "...",
      "teacherId": { "name": "...", "email": "..." },
      "message": "...",
      "status": "pending",
      "createdAt": "2024-..."
    }
  ]
}
```

### Approve Teacher Request (Admin)
```http
PATCH /teachers/requests/:requestId/approve
Authorization: Bearer <admin_token>

Response 200:
{
  "message": "Teacher request approved successfully",
  "request": {
    "status": "approved",
    "allocatedUsername": "TEACH0001",
    "allocatedPassword": "..."
  }
}
```

### Reject Teacher Request (Admin)
```http
PATCH /teachers/requests/:requestId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejectionReason": "Qualifications do not match requirements"
}

Response 200:
{
  "message": "Teacher request rejected",
  "request": {...with rejection reason}
}
```

---

## 👨‍🎓 Student Endpoints

### Enroll in Course
```http
POST /students/enroll/:courseId
Authorization: Bearer <student_token>

Response 200:
{
  "message": "Course enrolled successfully",
  "progress": {
    "_id": "...",
    "studentId": "...",
    "courseId": "...",
    "progressPercentage": 0,
    "completed": false
  }
}
```

### Get My Courses
```http
GET /students/my-courses
Authorization: Bearer <student_token>

Response 200:
{
  "courses": [
    {
      "_id": "...",
      "courseId": {
        "title": "...",
        "description": "...",
        "price": 1000,
        "finalPrice": 1030
      },
      "progressPercentage": 25,
      "completed": false,
      "enrolledAt": "2024-..."
    }
  ]
}
```

### Get Course Progress
```http
GET /students/course/:courseId/progress
Authorization: Bearer <student_token>

Response 200:
{
  "progress": {
    "_id": "...",
    "progressPercentage": 50,
    "videosWatched": [
      {
        "videoId": "...",
        "watchedAt": "2024-...",
        "duration": 3600
      }
    ],
    "completed": false
  }
}
```

### Mark Video as Watched
```http
PATCH /students/course/:courseId/mark-watched
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "videoId": "video_123",
  "videoDuration": 3600
}

Response 200:
{
  "message": "Progress updated",
  "progress": {
    "progressPercentage": 60,
    "completed": false
  }
}
```

### Generate Schedule
```http
POST /students/schedule/generate
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "subjects": ["Mathematics", "English", "Science"]
}

Response 201:
{
  "message": "Schedule generated successfully",
  "schedule": {
    "_id": "...",
    "scheduleData": [
      {
        "day": "Monday",
        "timeSlot": "morning",
        "subject": "Mathematics",
        "duration": 60
      },
      {
        "day": "Monday",
        "timeSlot": "afternoon",
        "subject": "English",
        "duration": 60
      }
    ]
  }
}
```

### Get My Schedule
```http
GET /students/schedule
Authorization: Bearer <student_token>

Response 200:
{
  "schedule": {
    "_id": "...",
    "scheduleData": [...],
    "selectedSubjects": ["Mathematics", "English", "Science"],
    "generatedAt": "2024-..."
  }
}
```

### Get Student Statistics
```http
GET /students/stats
Authorization: Bearer <student_token>

Response 200:
{
  "stats": {
    "totalCourses": 5,
    "completedCourses": 2,
    "enrollmentRate": 40,
    "totalSpent": 5150
  }
}
```

---

## 🏷️ Category Endpoints

### Get All Categories
```http
GET /categories
Authorization: Optional

Response 200:
{
  "categories": [
    {
      "_id": "...",
      "name": "Mathematics",
      "slug": "mathematics",
      "courseCount": 25
    }
  ]
}
```

### Get Category by ID or Slug
```http
GET /categories/:id
Authorization: Optional

Response 200:
{
  "category": {
    "_id": "...",
    "name": "Mathematics",
    "description": "...",
    "courseCount": 25
  }
}
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Physics",
  "description": "Physics and applied sciences",
  "icon": "science"
}

Response 201:
{
  "message": "Category created successfully",
  "category": {...}
}
```

### Update Category (Admin)
```http
PATCH /categories/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Physics",
  "description": "Updated description"
}

Response 200:
{
  "message": "Category updated successfully",
  "category": {...}
}
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer <admin_token>

Response 200:
{
  "message": "Category deleted successfully"
}
```

---

## 🛡️ Admin Endpoints

### Get Dashboard Statistics
```http
GET /admin/stats
Authorization: Bearer <admin_token>

Response 200:
{
  "stats": {
    "totalUsers": 150,
    "totalTeachers": 25,
    "totalStudents": 120,
    "totalCourses": 80,
    "approvedCourses": 70,
    "pendingCourses": 10,
    "totalRevenue": 85300
  }
}
```

### Get All Users
```http
GET /admin/users?role=student
Authorization: Bearer <admin_token>

Query Parameters:
- role (string): Filter by role (admin, teacher, student)

Response 200:
{
  "users": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "student",
      "createdAt": "2024-..."
    }
  ]
}
```

### Get All Teachers
```http
GET /admin/teachers
Authorization: Bearer <admin_token>

Response 200:
{
  "teachers": [
    {
      "_id": "...",
      "name": "...",
      "email": "...",
      "role": "teacher",
      "isApproved": true
    }
  ]
}
```

### Get Teacher Pool Status
```http
GET /admin/pool-status
Authorization: Bearer <admin_token>

Response 200:
{
  "poolStatus": {
    "totalAccounts": 1000,
    "allocatedAccounts": 25,
    "availableAccounts": 975
  }
}
```

### Get Course Analytics
```http
GET /admin/analytics
Authorization: Bearer <admin_token>

Response 200:
{
  "analytics": [
    {
      "_id": "...",
      "title": "Advanced Mathematics",
      "enrollmentCount": 45,
      "finalPrice": 1545,
      "revenue": 69525
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting (Recommended for Production)

Implement rate limiting using `express-rate-limit`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "student"
  }'
```

### Create Course
```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Test Course",
    "description": "Test course description",
    "subject": "Mathematics",
    "classLevel": "10",
    "price": 1000
  }'
```

---

## Webhook Support (Future)

Consider implementing webhooks for:
- Course approval/rejection
- Enrollment notifications
- Payment confirmations
- Schedule generation events

---

**API Version**: 1.0  
**Last Updated**: February 2026
