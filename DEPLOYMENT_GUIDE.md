# 📋 Deployment & Setup Checklist

## ✅ Pre-Deployment Checklist

### 1. **Local Development Setup**

- [ ] Run `npm install` in `backend/` folder
- [ ] Ensure MongoDB is running locally (`mongod`)
- [ ] Verify all dependencies installed: `npm list`

### 2. **Google OAuth Configuration**

- [ ] Create Google Cloud Project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs:
  - [ ] `http://localhost:5000/auth/google/callback` (development)
  - [ ] `https://yourdomain.com/auth/google/callback` (production)
- [ ] Copy Client ID and Client Secret

### 3. **Environment Variable Setup**

**Development (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cock-syllabi
NODE_ENV=development
FRONTEND_URL=http://localhost:5174

GOOGLE_CLIENT_ID=your_dev_client_id
GOOGLE_CLIENT_SECRET=your_dev_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=dev-secret-key-123
```

### 4. **Local Testing**

- [ ] Start server: `npm run dev`
- [ ] Open http://localhost:5000/login
- [ ] Test Google login
- [ ] Verify redirect to /main
- [ ] Check user appears in admin dashboard at /admin
- [ ] Test logout functionality
- [ ] Test multiple logins (verify loginCount increases)

---

## 🚀 Deployment Steps

### Step 1: Prepare Production Environment

```bash
# 1. Create .env.production file
# 2. Update with production values:

PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cock-syllabi
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
SESSION_SECRET=generate-long-random-string-here

# 3. Generate strong SESSION_SECRET:
# Option 1: Online generator https://www.uuidgenerator.net/
# Option 2: Command line: openssl rand -hex 32
```

### Step 2: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. In OAuth 2.0 Client ID settings:
   - Add production redirect URI: `https://yourdomain.com/auth/google/callback`
   - Remove or keep development URIs (for testing)
3. IMPORTANT: For production Google OAuth, credentials must be the SAME Client ID/Secret

### Step 3: Test Production Build

```bash
# Before deploying, test production build locally
cd backend

# Install only production dependencies
npm ci --production

# Run in production mode
export NODE_ENV=production
npm start

# Test at http://localhost:5000
# Then stop (Ctrl+C)
```

### Step 4: Deploy to Server

#### Option A: Heroku
```bash
# 1. Install Heroku CLI
# 2. Login: heroku login
# 3. Create app: heroku create your-app-name
# 4. Add MongoDB Atlas URL: heroku config:set MONGODB_URI=...
# 5. Deploy code:
git push heroku main
```

#### Option B: VPS (DigitalOcean, AWS, etc.)
```bash
# 1. SSH into server
ssh user@your-server

# 2. Clone repository
git clone your-repo-url

# 3. Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install dependencies
cd backend
npm install --production

# 5. Create .env file with production values
nano .env

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start app with PM2
pm2 start server.js --name "cock-syllabi"
pm2 save
pm2 startup

# 8. Setup reverse proxy (nginx)
# Create /etc/nginx/sites-available/default with proxy config
```

#### Option C: Docker (Recommended)

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY server.js .

EXPOSE 5000

CMD ["node", "server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:5.0
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongo-data:
```

Deploy:
```bash
docker-compose up -d
```

### Step 5: Post-Deployment Verification

- [ ] Server is running on production domain
- [ ] MongoDB connection works
- [ ] Google OAuth credentials are correct
- [ ] Login redirects to /main (not /login)
- [ ] User data appears in admin dashboard
- [ ] HTTPS is enabled
- [ ] Cookies are secure (HttpOnly, Secure, SameSite)

---

## 🔒 Security Checklist for Production

- [ ] NODE_ENV=production in .env
- [ ] SESSION_SECRET is strong (32+ characters)
- [ ] HTTPS/SSL is enabled
- [ ] Cookies set to secure: true
- [ ] No console.log statements with sensitive data
- [ ] Rate limiting enabled
- [ ] CORS whitelist configured properly
- [ ] MongoDB authentication enabled
- [ ] Regular database backups setup
- [ ] Error logs don't expose stack traces to users
- [ ] All secrets in environment variables (not hardcoded)

---

## 📊 Monitoring & Maintenance

### Setup Monitoring
```bash
# 1. PM2 Monitoring
pm2 install pm2-auto-pull
pm2 install pm2-logrotate

# 2. Application Performance Monitoring (APM)
npm install apm-agent-nodejs
# Configure in server.js

# 3. Error Tracking (Sentry)
npm install @sentry/node
```

### Regular Maintenance
```bash
# Check for vulnerabilities
npm audit
npm audit fix

# Update dependencies
npm update
npm outdated

# Clean up
npm cache clean --force
```

---

## 🔧 Troubleshooting Production Issues

### Issue: "Cannot GET /"
**Cause**: Server not running properly
**Fix**: 
```bash
pm2 logs
# Check logs for errors
npm run dev  # Test locally first
```

### Issue: "Google authentication failed"
**Cause**: OAuth credentials mismatch or redirect URI incorrect
**Fix**:
1. Verify `.env` has correct credentials
2. Check Google Cloud Console redirect URI matches exactly
3. Clear browser cookies
4. Try in incognito mode

### Issue: "MongoDB connection refused"
**Cause**: MongoDB not running or connection string wrong
**Fix**:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Or update to Atlas cloud
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Issue: "Session lost after redirect"
**Cause**: SESSION_SECRET not set or cookie configuration wrong
**Fix**:
```env
# Ensure SESSION_SECRET is set
SESSION_SECRET=your-long-random-string

# Check cookie settings in production
# - httpOnly: true
# - secure: true (HTTPS only)
# - sameSite: 'lax'
```

### Issue: "Port already in use"
**Cause**: Another process using port 5000
**Fix**:
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

---

## 📈 Performance Optimization

### Database Optimization
```javascript
// Indexes are already added:
// - email: 1
// - createdAt: -1

// Consider adding for admin dashboard queries:
// - lastLogin: -1 (for active today query)
// - role: 1 (for filtering by role)
```

### API Response Caching
```javascript
app.get('/api/admin/stats', ensureAdmin, (req, res) => {
    res.set('Cache-Control', 'public, max-age=300');  // 5 minute cache
    // ... fetch data
});
```

### Database Connection Pooling
```javascript
mongoose.connect(uri, {
    maxPoolSize: 10,  // Default: 10
    minPoolSize: 5,   // Default: 5
});
```

---

## 📝 Environment Variables Reference

### Required (Must Set)
```env
GOOGLE_CLIENT_ID=        # From Google Cloud Console
GOOGLE_CLIENT_SECRET=    # From Google Cloud Console
MONGODB_URI=             # MongoDB connection string
SESSION_SECRET=          # Random 32+ character string
```

### Recommended
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
```

### Optional
```env
LOG_LEVEL=info          # debug, info, warn, error
BODY_LIMIT=50mb
CORS_WHITELIST=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🚨 Rollback Plan

If deployment goes wrong:

```bash
# 1. Check status
pm2 status

# 2. View logs
pm2 logs cock-syllabi --lines 100

# 3. Restart service
pm2 restart cock-syllabi

# 4. If restart fails, rollback:
git log --oneline
git revert <commit-hash>
git push
npm install
pm2 restart all

# 5. If database is corrupted:
# - Use database backup
# - Or clear and let users re-register
```

---

## 📞 Quick Commands

```bash
# Development
npm run dev              # Start with auto-reload

# Production
pm2 start server.js     # Start with PM2
pm2 stop all            # Stop all services
pm2 logs                # View logs
pm2 delete all          # Remove all

# Database
mongo                   # Connect to local MongoDB
db.users.find()         # View all users
db.users.deleteOne({email: "test@test.com"})  # Delete user

# Utilities
npm audit               # Check vulnerabilities
npm update              # Update dependencies
npm ci                  # Clean install
```

---

## ✅ Deployment Verification

After deployment, verify:

1. **Server is Running**
   ```bash
   curl https://yourdomain.com/health
   # Should return: { "message": "Server is running" }
   ```

2. **Auth Status**
   ```bash
   curl https://yourdomain.com/api/auth/status
   # Should return: { "authenticated": false, "user": null }
   ```

3. **Google OAuth**
   - Go to https://yourdomain.com/login
   - Click "Continue with Google"
   - Should redirect to Google OAuth
   - After login, should show dashboard

4. **Admin Panel**
   - Login as admin user
   - Go to https://yourdomain.com/admin
   - Should see user statistics and list

5. **Database**
   - Query MongoDB for users
   - Should see registered users with timestamps

---

**You're now ready to deploy! 🎉**

For additional help, refer to:
- `QUICK_START.md` - Quick setup guide
- `GOOGLE_OAUTH_SETUP.md` - Detailed OAuth setup
- `CODE_IMPLEMENTATION_DETAILS.md` - Implementation details
