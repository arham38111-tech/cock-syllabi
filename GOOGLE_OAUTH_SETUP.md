# Google OAuth Setup & Implementation Guide

## ✅ What's Fixed

This complete implementation resolves **both issues**:

### Issue #1: ✅ Redirect to Main Page After Google Login
- **Before**: After Google login, it redirected back to login page
- **After**: Now redirects directly to `/main` (user dashboard) or `/admin` (admin dashboard)
- Fixed through proper session management and callback handling

### Issue #2: ✅ Store User Registration/Login in Admin Dashboard
- **Before**: No user tracking in admin panel
- **After**: All registered and logged-in users are stored in MongoDB and visible in admin dashboard
- Users tracked with: name, email, role, login count, last login, registration date

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs all required packages:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session management
- `mongoose` - Database
- And all other dependencies

### Step 2: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web Application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - `http://localhost:3000/auth/google/callback` (if using port 3000)
   - Your production URL when ready

7. Copy the **Client ID** and **Client Secret**

### Step 3: Configure Environment Variables

Update `backend/.env`:

```env
# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session Secret
SESSION_SECRET=your-super-secret-key-change-this

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cock-syllabi

# Other
PORT=5000
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

### Step 4: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or if using MongoDB Atlas cloud, MongoDB will connect automatically via MONGODB_URI
```

### Step 5: Start the Server

```bash
npm run dev
# or
npm start
```

You should see:
```
╔════════════════════════════════════╗
║  COCK SYLLABI - AUTH SERVER       ║
╚════════════════════════════════════╝

✅ Server running on port 5000
✅ Environment: development
✅ MongoDB: Connected
✅ Google OAuth: Configured
```

---

## 🔑 Key Features Implemented

### 1. **Google OAuth Login Flow**
```
User clicks "Continue with Google"
    ↓
Redirects to Google login
    ↓
Google authenticates user
    ↓
Google redirects back to /auth/google/callback
    ↓
User created/updated in MongoDB
    ↓
Session established
    ↓
Redirects to /main (or /admin if admin)
```

### 2. **User Data Stored in MongoDB**

Each user has:
```javascript
{
  googleId: "Google Profile ID",
  email: "user@gmail.com",
  name: "User Name",
  avatar: "Google Avatar URL",
  role: "student" | "teacher" | "admin",
  loginCount: 5,
  lastLogin: "2024-02-14",
  createdAt: "2024-01-15",
  registrationSource: "google"
}
```

### 3. **Admin Dashboard**

The admin dashboard shows:
- **Total Users**: Count of all registered users
- **New Today**: Users registered today
- **Active Today**: Users who logged in today
- **Recent Users Table**: Last 10 users with details

Access: `http://localhost:5000/admin` (admin only)

### 4. **API Endpoints**

```
GET  /api/auth/status              - Check if user is logged in
GET  /api/user                     - Get current user info
GET  /api/admin/users              - Get all users (admin only)
GET  /api/admin/stats              - Get user statistics (admin only)
GET  /api/admin/users/:id          - Get specific user (admin only)
PUT  /api/admin/users/:id/role     - Update user role (admin only)
DELETE /api/admin/users/:id        - Delete user (admin only)

GET  /auth/google                  - Start Google login
GET  /auth/google/callback         - Google callback (automatic)
GET  /logout                       - Logout user

GET  /                             - Home page
GET  /login                        - Login page
GET  /main                         - User dashboard (protected)
GET  /admin                        - Admin dashboard (protected)
```

---

## 🌐 Page Flows

### Unauthenticated User
```
/ (home) → /login → /auth/google → Google login → /auth/google/callback → /main
```

### Authenticated User
```
/ → /main (auto redirect)
/login → /main (auto redirect)
```

### Admin User
```
Google login as admin → /admin (auto redirect)
/main → Can click "Go to Admin Panel" button
```

---

## 🔒 Security Features

✅ **Session Security**
- HTTP-only cookies (cannot access from JavaScript)
- Secure cookies in production (HTTPS only)
- 7-day session expiration
- SameSite: lax (prevents CSRF)

✅ **Password & Data Security**
- No passwords stored (OAuth only)
- All connections encrypted
- MongoDB indexes for performance

✅ **Authentication**
- Passport.js for OAuth handling
- Proper serialization/deserialization
- Role-based access control

---

## 🧪 Testing the Implementation

### 1. Test Google Login
```
1. Go to http://localhost:5000/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. Should redirect to /main dashboard
```

### 2. Test User in Admin Dashboard
```
1. Go to http://localhost:5000/admin (as admin user)
2. Should see your user in "Recent Users" table
3. See login statistics updated
```

### 3. Test API Endpoints
```bash
# Check if logged in
curl http://localhost:5000/api/auth/status

# Get current user
curl http://localhost:5000/api/user

# Get admin stats (requires admin role)
curl http://localhost:5000/api/admin/stats
```

---

## 🐛 Troubleshooting

### Issue: "Google OAuth not configured"
**Solution**: Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env`

### Issue: "Redirect URI mismatch"
**Solution**: Check that `GOOGLE_CALLBACK_URL` matches exactly in:
- `.env` file
- Google Cloud Console settings

### Issue: MongoDB connection error
**Solution**: 
- Make sure MongoDB is running (`mongod`)
- Or update `MONGODB_URI` to your cloud MongoDB URL

### Issue: Session not persisting
**Solution**: Make sure cookies are allowed in browser and `SESSION_SECRET` is set

### Issue: Users not showing in admin dashboard
**Solution**: Check that admin user has `role: "admin"` in database

---

## 📝 Important Files Modified

| File | Changes |
|------|---------|
| `backend/server.js` | Complete auth system with OAuth, sessions, admin dashboard |
| `backend/.env` | Added Google OAuth credentials and session secret |
| `backend/package.json` | Added passport and express-session dependencies |

---

## 🔄 Production Deployment

### Before Going to Production:

1. **Update .env**:
   ```env
   NODE_ENV=production
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   SESSION_SECRET=generate-a-random-strong-secret-key
   MONGODB_URI=your-atlas-connection-string
   ```

2. **Update Google Cloud**:
   - Add production redirect URIs in console
   - Use production domain name

3. **Security**:
   - Change all SECRET values
   - Enable HTTPS
   - Set secure cookies
   - Use environment variables (not hardcoded)

4. **Database**:
   - Use MongoDB Atlas (cloud)
   - Enable authentication
   - Setup backups

---

## ✨ Success Indicators

When everything is working correctly, you should see:

✅ User logs in with Google  
✅ Redirects to main dashboard  
✅ User appears in admin panel  
✅ Login count increases on repeat logins  
✅ Admin can view all users and statistics  
✅ Logout works properly  
✅ Cache issues resolved (no redirect loops)  

---

## 📞 Support

If you encounter issues:

1. Check `.env` file is correct
2. Verify MongoDB is running
3. Check browser console for errors
4. Check server logs for detailed error messages
5. Clear browser cookies and retry

---

**Your authentication system is now fully functional! 🎉**
