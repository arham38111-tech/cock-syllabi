# ⚡ Quick Start Guide

## 🎯 What You Got

One complete production-ready authentication system that:
- ✅ Logs users in with Google OAuth
- ✅ Redirects to main dashboard (not back to login)
- ✅ Stores all users in MongoDB
- ✅ Shows all registered users in admin dashboard
- ✅ Tracks login count and last login
- ✅ Has admin panel with statistics

---

## 🚀 Get Started in 3 Steps

### Step 1: Get Google Credentials (5 mins)

1. Go to https://console.cloud.google.com/
2. Create new project or use existing
3. Enable Google+ API
4. Create "OAuth 2.0 Client IDs" (Web Application)
5. Add redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

### Step 2: Update `.env` File

Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=any_random_string_here
```

### Step 3: Install & Run

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Server running on port 5000
✅ MongoDB: Connected
✅ Google OAuth: Configured
```

---

## 🌐 Test It Now

1. Open `http://localhost:5000/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. ✅ Should show dashboard
5. Check `http://localhost:5000/admin` to see yourself in the user list

---

## 📋 What Was Changed

| File | What Changed |
|------|------------|
| `server.js` | Complete auth system (from scratch) |
| `.env` | Added Google OAuth config |
| `package.json` | Added passport libraries |

**Everything else stays the same!** Your existing routes, models, and features are untouched.

---

## 🔑 Key URLs

```
Home Page:        http://localhost:5000/
Login:           http://localhost:5000/login
User Dashboard:  http://localhost:5000/main  [protected]
Admin Panel:     http://localhost:5000/admin [protected, admin only]
API Status:      http://localhost:5000/api/auth/status
```

---

## 📊 Admin Dashboard Shows

- **Total Users**: How many people signed up
- **New Today**: Users who registered today
- **Active Today**: Users who logged in today
- **User List**: Names, emails, roles, registration dates, last logins

---

## ✨ Features

- **Google OAuth**: Real OAuth (not mock)
- **Session Management**: 7-day sessions with security
- **MongoDB Storage**: All users saved and queryable
- **Admin Dashboard**: Real-time user statistics
- **Proper Redirects**: Fixed redirect issues
- **Error Handling**: Better error messages
- **API Ready**: RESTful endpoints for user data

---

## 🛠 If Something Goes Wrong

| Error | Fix |
|-------|-----|
| "Cannot find module" | Run `npm install` |
| MongoDB connection error | Start mongod or use Atlas URI |
| "Redirect URI mismatch" | Check Google Console settings match .env |
| User not showing up | Check user has role assigned |
| Session lost | Make sure SESSION_SECRET is set |

---

## 🎓 Next Steps

### For Development:
- Test login flow
- Test admin panel
- Test logout
- Test browser back button (shouldn't break)

### For Production:
1. Update `.env` with production values
2. Generate strong SESSION_SECRET
3. Use production MongoDB URL
4. Update Google redirect URI to production domain
5. Set NODE_ENV=production
6. Deploy to server

---

## 📞 Endpoints Reference

```bash
# Check if logged in
curl http://localhost:5000/api/auth/status

# Get current user info
curl http://localhost:5000/api/user

# Get all users (admin only)
curl http://localhost:5000/api/admin/users

# Get statistics (admin only)
curl http://localhost:5000/api/admin/stats
```

---

## ✅ Checklist

- [ ] Got Google credentials
- [ ] Updated `.env` file
- [ ] Ran `npm install`
- [ ] Started server with `npm run dev`
- [ ] Tested login at `http://localhost:5000/login`
- [ ] Checked admin dashboard at `http://localhost:5000/admin`
- [ ] User appears in the list

---

**🎉 Done! You now have a fully functional OAuth authentication system.**

For more details, see `GOOGLE_OAUTH_SETUP.md`
