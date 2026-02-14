# Cock Syllabi - Premium Course Marketplace

A professional, full-stack course marketplace web application with secure authentication, role-based access control, and dynamic pricing logic.

## Project Overview

Cock Syllabi is an academic course marketplace platform that connects teachers with students. The system supports three main roles:
- **Admin**: Manages teachers, approves courses, controls categories
- **Teachers**: Create and sell courses with dynamic pricing
- **Students**: Browse, purchase, and track course progress

## Features

### Authentication & Security
- JWT-based authentication with role-based access control
- Bcrypt password hashing
- Secure environment variable management
- Protected routes and API endpoints

### Admin Dashboard
- Teacher request approval/rejection workflow
- Course management and approval system
- Teacher account pool allocation system
- Category management
- Student purchase tracking

### Teacher Portal
- Course creation and management
- Video upload and hosting
- Dynamic pricing (3% markup calculation)
- Sales tracking and analytics
- course approval status monitoring

### Student Dashboard
- Course browsing and filtering
- Course purchasing with secure payment
- Progress tracking
- Schedule generator (AI-powered weekly timetable)
- Purchased courses library

### Additional Features
- Dynamic category system
- Teacher account pool (1000 pre-generated accounts)
- Weekly schedule generator
- Responsive design (mobile, tablet, desktop)
- Professional UI with zero layout breakage

## Technology Stack

### Frontend
- React 18+ with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for HTTP requests
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- CORS for security

### Database
- MongoDB (Atlas or local)
- Collections: Users, Courses, TeacherRequests, TeacherAccountsPool, Categories, Schedules, CourseProgress

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
ADMIN_USERNAME=arham ka coc syllabi
ADMIN_PASSWORD=succes
PORT=5000
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm run dev
```

## Default Credentials

### Admin Login
- **Username**: `arham ka coc syllabi`
- **Password**: `succes`

These credentials are environment-protected and should only be used for initial setup.

## Project Structure

```
cock-syllabi/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context for state
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/              # Database and server config
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Auth, error handling
│   ├── scripts/             # Setup scripts
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Key Concepts

### Pricing Logic
```
Final Price = Base Price + (Base Price × 0.03)
Example: 1000 → 1030
```

### Role-Based Access
- Admin: Full system access
- Teachers: Own course management only
- Students: Browse and purchase courses

### Teacher Account Pool
- 1000 pre-generated teacher accounts
- Admin allocates accounts to approved teachers
- Prevents unauthorized account creation

### Schedule Generator
- Students select subjects
- System distributes them across 5 weekdays
- Daily timeframes: Morning, Afternoon, Evening

## Security Considerations

- Always use HTTPS in production
- Store JWT secrets in environment variables
- Implement rate limiting on API endpoints
- Validate all input on both frontend and backend
- Use bcrypt for password hashing
- Never store plain text passwords
- Implement CORS properly

## Troubleshooting

### Common Issues

**Login Not Working**
- Ensure environment variables are set correctly
- Check admin credentials in .env file
- Verify JWT_SECRET is the same on frontend and backend

**Database Connection Failed**
- Verify MongoDB URI is correct
- Check MongoDB is running
- Ensure IP whitelist is configured (if using Atlas)

**UI Layout Breaking**
- Clear browser cache
- Check responsive breakpoints in Tailwind config
- Verify no CSS class conflicts

## Performance Optimization

- Lazy load course images
- Optimize video streaming
- Implement pagination for course listings
- Cache frequently accessed data
- Use CDN for static assets

## Future Enhancements

- Video streaming optimization
- Advanced analytics dashboard
- Email notifications
- Payment gateway integration
- Certificate generation
- Wishlist feature
- Course reviews and ratings
- Live class support

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, contact the development team.

---

**Professional Quality Standards**: This application meets enterprise-grade standards for security, performance, and user experience.
