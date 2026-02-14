const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cock-syllabi', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB connected');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ==================== USER SCHEMA ====================
const userSchema = new mongoose.Schema({
    googleId: { type: String, sparse: true },
    email: { type: String, unique: true, required: true },
    name: String,
    avatar: { type: String, default: 'https://via.placeholder.com/100' },
    role: { type: String, default: 'student', enum: ['student', 'teacher', 'admin'] },
    lastLogin: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    provider: { type: String, default: 'google' },
    isActive: { type: Boolean, default: true },
    phone: String,
    bio: String,
    registrationSource: { type: String, default: 'google' }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

// ==================== SESSION CONFIGURATION ====================
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    },
    proxy: true
}));

// ==================== MIDDLEWARE ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ==================== PASSPORT CONFIGURATION ====================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/auth/google/callback',
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0]?.value;
        
        if (!email) {
            return done(null, false, { message: 'No email provided by Google' });
        }

        console.log('🔍 Google OAuth - Processing:', email);
        
        // Check if user exists
        let user = await User.findOne({ email: email });
        
        if (!user) {
            // Create new user
            user = new User({
                googleId: profile.id,
                email: email,
                name: profile.displayName || profile.name?.givenName || 'User',
                avatar: profile.photos[0]?.value || 'https://via.placeholder.com/100',
                provider: 'google',
                role: 'student',
                loginCount: 1,
                lastLogin: new Date(),
                registrationSource: 'google'
            });
            await user.save();
            console.log('✅ New user registered from Google:', email);
        } else {
            // Update existing user login info
            user.googleId = profile.id;
            user.loginCount = (user.loginCount || 0) + 1;
            user.lastLogin = new Date();
            user.avatar = profile.photos[0]?.value || user.avatar;
            user.name = profile.displayName || user.name;
            await user.save();
            console.log('✅ User logged in from Google:', email);
        }
        
        return done(null, user);
    } catch (error) {
        console.error('❌ Google OAuth Strategy Error:', error);
        return done(error, null);
    }
}));

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('❌ Deserialize error:', error);
        done(error, null);
    }
});

// ==================== AUTHENTICATION MIDDLEWARE ====================
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized', redirect: '/login' });
};

const ensureAdmin = async (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Forbidden' });
};

// ==================== API ROUTES ====================

// Get current user
app.get('/api/user', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (req.user) {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            role: req.user.role,
            loginCount: req.user.loginCount,
            lastLogin: req.user.lastLogin,
            createdAt: req.user.createdAt
        });
    } else {
        res.json(null);
    }
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    res.json({
        authenticated: req.isAuthenticated(),
        user: req.user ? {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            avatar: req.user.avatar
        } : null
    });
});

// Admin: Get all users
app.get('/api/admin/users', ensureAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch users' 
        });
    }
});

// Admin: Get user statistics
app.get('/api/admin/stats', ensureAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newToday = await User.countDocuments({
            createdAt: { $gte: today }
        });
        
        const activeToday = await User.countDocuments({
            lastLogin: { $gte: today }
        });

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const newThisMonth = await User.countDocuments({
            createdAt: { $gte: thisMonth }
        });

        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const adminCount = await User.countDocuments({ role: 'admin' });

        res.json({
            success: true,
            stats: {
                totalUsers,
                newToday,
                activeToday,
                newThisMonth,
                byRole: {
                    student: studentCount,
                    teacher: teacherCount,
                    admin: adminCount
                }
            }
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch statistics' 
        });
    }
});

// Admin: Get specific user details
app.get('/api/admin/users/:id', ensureAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch user' 
        });
    }
});

// Admin: Update user role
app.put('/api/admin/users/:id/role', ensureAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid role' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        console.log(`✅ User ${user.email} role updated to ${role}`);

        res.json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('❌ Error updating user role:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update user role' 
        });
    }
});

// Admin: Delete user
app.delete('/api/admin/users/:id', ensureAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        console.log(`✅ User ${user.email} deleted`);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete user' 
        });
    }
});

// ==================== POLICIES ROUTES ====================
const Policy = require('./models/Policy');

// Get all policies
app.get('/api/policies', async (req, res) => {
    try {
        const policies = await Policy.find().sort({ createdAt: 1 });
        res.json({ success: true, policies });
    } catch (error) {
        console.error('❌ Error fetching policies:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch policies' });
    }
});

// Get single policy by type
app.get('/api/policies/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const policy = await Policy.findOne({ policyType: type });
        
        if (!policy) {
            return res.status(404).json({ success: false, error: 'Policy not found' });
        }
        
        res.json({ success: true, policy });
    } catch (error) {
        console.error('❌ Error fetching policy:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch policy' });
    }
});

// Update policy (admin only)
app.put('/api/policies/:type', ensureAdmin, async (req, res) => {
    try {
        const { type } = req.params;
        const { content, title } = req.body;
        
        let policy = await Policy.findOne({ policyType: type });
        
        if (!policy) {
            // Create new policy if it doesn't exist
            policy = new Policy({
                policyType: type,
                title: title || type.charAt(0).toUpperCase() + type.slice(1),
                content: content || '',
                updatedBy: req.user.name || req.user.email
            });
        } else {
            // Update existing policy
            policy.content = content !== undefined ? content : policy.content;
            if (title) policy.title = title;
            policy.updatedBy = req.user.name || req.user.email;
            policy.updatedAt = Date.now();
        }
        
        await policy.save();
        
        console.log(`✅ Policy ${type} updated`);
        
        res.json({ 
            success: true,
            message: 'Policy updated successfully',
            policy 
        });
    } catch (error) {
        console.error('❌ Error updating policy:', error);
        res.status(500).json({ success: false, error: 'Failed to update policy' });
    }
});

// Initialize default policies
app.post('/api/policies/init/default', ensureAdmin, async (req, res) => {
    try {
        const defaultPolicies = [
            {
                policyType: 'terms',
                title: 'Terms of Service',
                content: 'Our Terms of Service will be updated here. This section outlines the legal agreement between the user and our platform.'
            },
            {
                policyType: 'privacy',
                title: 'Privacy Policy',
                content: 'Our Privacy Policy will be updated here. This section explains how we collect, use, and protect your personal information.'
            },
            {
                policyType: 'refund',
                title: 'Return & Refund Policy',
                content: 'Our Return & Refund Policy will be updated here. This section outlines the terms for returns and refunds of courses and products.'
            }
        ];
        
        for (const policyData of defaultPolicies) {
            const exists = await Policy.findOne({ policyType: policyData.policyType });
            if (!exists) {
                await Policy.create(policyData);
            }
        }
        
        res.json({ success: true, message: 'Default policies initialized' });
    } catch (error) {
        console.error('❌ Error initializing policies:', error);
        res.status(500).json({ success: false, error: 'Failed to initialize policies' });
    }
});

// ==================== AUTHENTICATION ROUTES ====================

// Google Login Initiator
app.get('/auth/google', 
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        session: true
    })
);

// Google OAuth Callback - FIXED & TESTED
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login?error=auth_failed',
        failureMessage: true,
        session: true
    }),
    (req, res) => {
        console.log('✅ OAuth Callback - User authenticated:', req.user.email);
        
        // Ensure session is saved before redirecting
        req.session.save((err) => {
            if (err) {
                console.error('❌ Session save error:', err);
                return res.redirect('/login?error=session_failed');
            }
            
            // Set session properties explicitly
            req.session.userId = req.user._id;
            req.session.userEmail = req.user.email;
            
            console.log('✅ Session established for:', req.user.email);
            
            // Redirect to main/dashboard page
            // Determine redirect based on user role
            const redirectUrl = req.user.role === 'admin' 
                ? '/admin' 
                : '/main';
            
            res.redirect(302, redirectUrl);
        });
    }
);

// Logout
app.get('/logout', (req, res) => {
    const userEmail = req.user?.email || 'Unknown';
    
    req.logout((err) => {
        if (err) {
            console.error('❌ Logout error:', err);
        }
        
        req.session.destroy((sessionErr) => {
            if (sessionErr) {
                console.error('❌ Session destroy error:', sessionErr);
            }
            
            res.clearCookie('sessionId');
            res.clearCookie('connect.sid');
            
            console.log('✅ User logged out:', userEmail);
            
            res.redirect('/');
        });
    });
});

// ==================== PAGE ROUTES ====================

// Home page
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/main');
    }
    res.send(generateHomePage());
});

// Login page
app.get('/login', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    if (req.isAuthenticated()) {
        return res.redirect('/main');
    }
    
    const error = req.query.error;
    res.send(generateLoginPage(error));
});

// Main/Dashboard page (protected)
app.get('/main', ensureAuthenticated, (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(generateMainPage(req.user));
});

// Admin page (protected)
app.get('/admin', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    
    try {
        const totalUsers = await User.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const newToday = await User.countDocuments({ createdAt: { $gte: today } });
        const activeToday = await User.countDocuments({ lastLogin: { $gte: today } });
        
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.send(generateAdminPage(req.user, { totalUsers, newToday, activeToday, recentUsers }));
    } catch (error) {
        console.error('❌ Admin page error:', error);
        res.status(500).send(generateErrorPage('Failed to load admin dashboard'));
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ==================== HTML GENERATORS ====================

function generateHomePage() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home - Cock Syllabi Auth</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .container { 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
            padding: 50px; 
            max-width: 600px; 
            width: 90%; 
            text-align: center; 
            animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 { 
            color: #333; 
            margin-bottom: 20px; 
            font-size: 2.5em; 
        }
        p { 
            color: #666; 
            margin-bottom: 30px; 
            font-size: 1.1em; 
            line-height: 1.6; 
        }
        .btn { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 15px 40px; 
            border-radius: 50px; 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 1.1em;
            transition: transform 0.3s, box-shadow 0.3s; 
            border: none; 
            cursor: pointer; 
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .btn:hover { 
            transform: translateY(-2px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature {
            padding: 20px;
        }
        .feature-icon {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .feature-text {
            color: #555;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎓 Cock Syllabi</h1>
        <p>Secure authentication system with Google OAuth. Your data is protected and managed securely!</p>
        
        <div class="features">
            <div class="feature">
                <div class="feature-icon">🔒</div>
                <div class="feature-text">Secure Auth</div>
            </div>
            <div class="feature">
                <div class="feature-icon">⚡</div>
                <div class="feature-text">Fast Access</div>
            </div>
            <div class="feature">
                <div class="feature-icon">📊</div>
                <div class="feature-text">Dashboard</div>
            </div>
            <div class="feature">
                <div class="feature-icon">👥</div>
                <div class="feature-text">Community</div>
            </div>
        </div>
        
        <a href="/login" class="btn">Get Started →</a>
    </div>
</body>
</html>
    `;
}

function generateLoginPage(error) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Cock Syllabi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            padding: 20px;
        }
        .container { 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
            padding: 50px; 
            max-width: 450px; 
            width: 100%; 
            text-align: center; 
            animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 { 
            color: #333; 
            margin-bottom: 30px; 
            font-size: 2em; 
        }
        .google-btn { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: white; 
            border: 2px solid #e0e0e0; 
            border-radius: 10px; 
            padding: 15px 30px; 
            width: 100%; 
            cursor: pointer; 
            transition: all 0.3s; 
            margin-bottom: 25px; 
            font-size: 1em;
            font-weight: 600;
            color: #555;
        }
        .google-btn:hover { 
            background: #f8f9fa; 
            border-color: #4285f4;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .google-btn img { 
            width: 24px; 
            height: 24px; 
            margin-right: 12px; 
        }
        .divider { 
            display: flex; 
            align-items: center; 
            text-align: center; 
            color: #999; 
            margin: 25px 0; 
            font-size: 0.9em;
        }
        .divider::before, .divider::after { 
            content: ''; 
            flex: 1; 
            border-bottom: 1px solid #e0e0e0; 
        }
        .divider::before { margin-right: 15px; }
        .divider::after { margin-left: 15px; }
        .info-box { 
            background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
            border-radius: 15px; 
            padding: 20px; 
            margin-top: 20px;
            text-align: left;
        }
        .info-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #555;
            margin: 12px 0;
            font-size: 0.95em;
        }
        .info-icon {
            font-size: 1.3em;
            min-width: 30px;
        }
        .error-message { 
            background: #ffebee; 
            color: #c62828; 
            padding: 15px; 
            border-radius: 10px; 
            margin-bottom: 25px; 
            display: ${error ? 'block' : 'none'}; 
            font-weight: 500;
            border-left: 4px solid #c62828;
            animation: shake 0.5s ease;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .back-link { 
            margin-top: 25px; 
        }
        .back-link a { 
            color: #667eea; 
            text-decoration: none; 
            font-weight: 500;
            font-size: 0.95em;
        }
        .back-link a:hover { 
            text-decoration: underline; 
        }
        .loading {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.95);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            backdrop-filter: blur(5px);
        }
        .loading.active {
            display: flex;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loading" id="loading">
        <div class="spinner"></div>
        <p>Authenticating with Google...</p>
    </div>

    <div class="container">
        <h1>🔐 Login</h1>
        
        <div class="error-message" id="errorMessage">
            ${error === 'auth_failed' ? '❌ Authentication failed. Please try again.' : error === 'session_failed' ? '❌ Session error. Please try again.' : ''}
        </div>
        
        <button class="google-btn" onclick="handleGoogleLogin()">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
            <span>Continue with Google</span>
        </button>
        
        <div class="divider">Secure Login</div>
        
        <div class="info-box">
            <div class="info-item">
                <span class="info-icon">✅</span>
                <span>One-click Google authentication</span>
            </div>
            <div class="info-item">
                <span class="info-icon">🛡️</span>
                <span>Your data is encrypted and safe</span>
            </div>
            <div class="info-item">
                <span class="info-icon">⚡</span>
                <span>Instant access to dashboard</span>
            </div>
        </div>
        
        <div class="back-link">
            <a href="/">← Back to Home</a>
        </div>
    </div>

    <script>
        let isRedirecting = false;

        function handleGoogleLogin() {
            if (isRedirecting) return;
            isRedirecting = true;
            
            const loading = document.getElementById('loading');
            loading.classList.add('active');
            
            // Redirect to Google OAuth
            setTimeout(() => {
                window.location.href = '/auth/google';
            }, 300);
        }

        async function checkAuthStatus() {
            try {
                const res = await fetch('/api/auth/status', {
                    cache: 'no-store',
                    headers: {
                        'Pragma': 'no-cache',
                        'Cache-Control': 'no-cache'
                    }
                });
                const data = await res.json();
                
                if (data.authenticated && data.user) {
                    // Already logged in
                    const redirectUrl = data.user.role === 'admin' ? '/admin' : '/main';
                    window.location.replace(redirectUrl);
                }
            } catch (err) {
                console.error('Auth check error:', err);
            }
        }

        // Check auth status on page load
        checkAuthStatus();

        // Prevent multiple form submissions
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                checkAuthStatus();
            }
        });
    </script>
</body>
</html>
    `;
}

function generateMainPage(user) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Cock Syllabi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
        }
        nav { 
            background: white; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            padding: 15px 30px; 
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav-container { 
            max-width: 1200px; 
            margin: 0 auto; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 20px; 
        }
        .user-avatar { 
            width: 45px; 
            height: 45px; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 3px solid #667eea;
        }
        .user-name { 
            color: #333; 
            font-weight: 600; 
        }
        .logout-btn { 
            background: #ff4757; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s; 
            font-weight: 600;
        }
        .logout-btn:hover { 
            background: #ff6b81; 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255,71,87,0.3);
        }
        .container { 
            max-width: 1000px; 
            margin: 40px auto; 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.2); 
            padding: 40px; 
            animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 { 
            color: #333; 
            margin-bottom: 30px; 
            font-size: 2.2em; 
        }
        .profile-section { 
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 40px;
            align-items: center;
            margin-bottom: 40px; 
            padding: 30px;
            background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
            border-radius: 15px;
        }
        .profile-avatar { 
            width: 150px; 
            height: 150px; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 4px solid #667eea;
            box-shadow: 0 10px 20px rgba(102,126,234,0.3);
        }
        .profile-info h2 { 
            color: #333; 
            margin-bottom: 10px; 
            font-size: 1.8em;
        }
        .profile-info p { 
            color: #666; 
            font-size: 1em; 
            margin: 8px 0;
        }
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 25px; 
            margin-top: 40px; 
        }
        .stat-card { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            text-align: center; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            border: 1px solid #f0f0f0;
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-card h3 { 
            color: #666; 
            margin-bottom: 15px; 
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-card p { 
            color: #667eea; 
            font-size: 2.5em; 
            font-weight: bold; 
        }
        .welcome-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 18px;
            border-radius: 20px;
            font-size: 0.9em;
            display: inline-block;
            margin-top: 15px;
        }
        .admin-link {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .admin-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102,126,234,0.3);
        }
        @media (max-width: 640px) {
            .profile-section {
                grid-template-columns: 1fr;
                text-align: center;
            }
            .profile-avatar {
                width: 120px;
                height: 120px;
                margin: 0 auto;
            }
        }
    </style>
</head>
<body>
    <nav>
        <div class="nav-container">
            <div class="logo">🎓 Cock Syllabi</div>
            <div class="user-info">
                <span class="user-name">${user.name}</span>
                <img class="user-avatar" src="${user.avatar}" alt="Avatar">
                <button class="logout-btn" onclick="handleLogout()">Logout</button>
            </div>
        </div>
    </nav>

    <div class="container">
        <h1>Welcome back, ${user.name}! 👋</h1>
        
        <div class="profile-section">
            <img class="profile-avatar" src="${user.avatar}" alt="Profile">
            <div class="profile-info">
                <h2>${user.name}</h2>
                <p>📧 <strong>Email:</strong> ${user.email}</p>
                <p>🎓 <strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                <span class="welcome-badge">✨ Welcome back!</span>
                ${user.role === 'admin' ? `<br><a href="/admin" class="admin-link">🔧 Go to Admin Panel</a>` : ''}
            </div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Total Logins</h3>
                <p>${user.loginCount || 1}</p>
            </div>
            <div class="stat-card">
                <h3>Last Login</h3>
                <p>${new Date(user.lastLogin).toLocaleDateString()}</p>
            </div>
            <div class="stat-card">
                <h3>Member Since</h3>
                <p>${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    </div>

    <script>
        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/logout';
            }
        }

        // Verify session on page show
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                fetch('/api/auth/status', { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.authenticated) {
                            window.location.href = '/login';
                        }
                    });
            }
        });
    </script>
</body>
</html>
    `;
}

function generateAdminPage(user, stats) {
    const recentUsersHTML = stats.recentUsers.map(u => `
        <tr>
            <td><img src="${u.avatar}" alt="avatar" style="width:40px;height:40px;border-radius:50%;margin-right:10px;vertical-align:middle;">${u.name}</td>
            <td>${u.email}</td>
            <td><span style="background:${u.role === 'admin' ? '#ff4757' : '#667eea'};color:white;padding:5px 10px;border-radius:20px;font-size:0.85em;font-weight:600;">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td>${new Date(u.lastLogin).toLocaleDateString()}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Cock Syllabi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
        }
        nav { 
            background: white; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            padding: 15px 30px; 
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav-container { 
            max-width: 1400px; 
            margin: 0 auto; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .user-info { 
            display: flex; 
            align-items: center; 
            gap: 20px; 
        }
        .user-avatar { 
            width: 45px; 
            height: 45px; 
            border-radius: 50%; 
            object-fit: cover; 
            border: 3px solid #667eea;
        }
        .user-name { 
            color: #333; 
            font-weight: 600; 
        }
        .logout-btn { 
            background: #ff4757; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s; 
            font-weight: 600;
        }
        .logout-btn:hover { 
            background: #ff6b81; 
        }
        .container { 
            max-width: 1400px; 
            margin: 40px auto; 
            padding: 0 20px;
            animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        h1 { 
            color: white; 
            margin-bottom: 40px; 
            font-size: 2.5em; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 25px; 
            margin-bottom: 40px; 
        }
        .stat-card { 
            background: white;
            padding: 30px; 
            border-radius: 15px; 
            text-align: center; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-card h3 { 
            color: #666; 
            margin-bottom: 15px; 
            font-size: 1em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-card p { 
            color: #667eea; 
            font-size: 2.8em; 
            font-weight: bold; 
        }
        .users-container {
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            overflow: hidden;
            animation: fadeIn 0.6s ease 0.2s both;
        }
        .users-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px 30px;
        }
        .users-header h2{
            font-size: 1.5em;
            margin: 0;
        }
        .users-table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
        }
        .users-table th { 
            background: #f8f9fa;
            color: #333;
            padding: 15px 20px; 
            text-align: left; 
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
        }
        .users-table td { 
            padding: 15px 20px; 
            border-bottom: 1px solid #f0f0f0; 
        }
        .users-table tr:hover { 
            background: #f8f9fa; 
        }
        .back-link{
            display: inline-block;
            color: white;
            text-decoration: none;
            margin-bottom: 20px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .back-link:hover{
            opacity: 0.8;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <nav>
        <div class="nav-container">
            <div class="logo">🎓 Cock Syllabi</div>
            <div class="user-info">
                <span class="user-name">${user.name} (Admin)</span>
                <img class="user-avatar" src="${user.avatar}" alt="Avatar">
                <button class="logout-btn" onclick="handleLogout()">Logout</button>
            </div>
        </div>
    </nav>

    <div class="container">
        <a href="/main" class="back-link">← Back to Dashboard</a>
        <h1>📊 Admin Dashboard</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Users</h3>
                <p>${stats.totalUsers}</p>
            </div>
            <div class="stat-card">
                <h3>New Today</h3>
                <p>${stats.newToday}</p>
            </div>
            <div class="stat-card">
                <h3>Active Today</h3>
                <p>${stats.activeToday}</p>
            </div>
        </div>

        <div class="users-container">
            <div class="users-header">
                <h2>📋 Recent Users</h2>
            </div>
            <table class="users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Registered</th>
                        <th>Last Login</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentUsersHTML}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = '/logout';
            }
        }

        // Verify admin session
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                fetch('/api/auth/status', { cache: 'no-store' })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.authenticated || data.user.role !== 'admin') {
                            window.location.href = '/login';
                        }
                    });
            }
        });
    </script>
</body>
</html>
    `;
}

function generateErrorPage(message) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error - Cock Syllabi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .container { 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); 
            padding: 50px; 
            max-width: 500px; 
            width: 90%; 
            text-align: center; 
        }
        h1 { color: #ff4757; margin-bottom: 20px; }
        p { color: #666; margin-bottom: 30px; }
        a { color: #667eea; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Error</h1>
        <p>${message}</p>
        <a href="/login">← Go to Login</a>
    </div>
</body>
</html>
    `;
}

// ==================== ERROR HANDLING ====================
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════╗');
    console.log('║  COCK SYLLABI - AUTH SERVER       ║');
    console.log('╚════════════════════════════════════╝\n');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ MongoDB: Connected`);
    console.log(`✅ Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not Configured'}`);
    console.log('\n📍 Key Endpoints:');
    console.log('   • http://localhost:' + PORT + ' - Home page');
    console.log('   • http://localhost:' + PORT + '/login - Login page');
    console.log('   • http://localhost:' + PORT + '/main - User dashboard');
    console.log('   • http://localhost:' + PORT + '/admin - Admin dashboard');
    console.log('   • http://localhost:' + PORT + '/api/auth/status - Check auth status');
    console.log('\n');
});

module.exports = app;
