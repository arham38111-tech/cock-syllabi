const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, pictureUrl, documentUrl } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create user object
    const userObj = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'student'
    };

    // Add teacher-specific fields if role is teacher
    if (role === 'teacher') {
      userObj.pictureUrl = pictureUrl || null;
      userObj.documentUrl = documentUrl || null;
    }

    // Create user
    const newUser = new User(userObj);
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        pictureUrl: newUser.pictureUrl,
        documentUrl: newUser.documentUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        allocatedTeacherAccount: user.allocatedTeacherAccount
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Trim inputs for comparison
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedStoredUsername = (process.env.ADMIN_USERNAME || '').trim();
    const trimmedStoredPassword = (process.env.ADMIN_PASSWORD || '').trim();

    // Prefer environment credentials when set
    let admin = null;
    if (trimmedStoredUsername && trimmedStoredPassword) {
      // Accept the configured env username OR common alias 'inshallah' (case-insensitive)
      const allowedUsernames = [trimmedStoredUsername.toLowerCase(), 'inshallah'];
      const usernameMatches = allowedUsernames.includes(trimmedUsername.toLowerCase());

      if (!usernameMatches || trimmedPassword !== trimmedStoredPassword) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }

      // Env creds are authoritative; do not query DB to allow running without MongoDB.
      admin = {
        _id: 'env-admin',
        name: 'Administrator',
        email: trimmedStoredUsername || trimmedUsername,
        role: 'admin'
      };
    } else {
      // Fallback: verify against admin user stored in DB
      admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const matchesUser = (
          trimmedUsername.toLowerCase() === (admin.email || '').toLowerCase() ||
          trimmedUsername === admin.name
        );
        const passwordMatches = await bcryptjs.compare(trimmedPassword, admin.password);

        if (!matchesUser || !passwordMatches) {
          return res.status(401).json({ message: 'Invalid admin credentials' });
        }
      } else {
        // No env creds and no admin in DB: create admin using provided credentials
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        admin = new User({
          name: 'Administrator',
          email: 'admin@cock-syllabi.local',
          password: hashedPassword,
          role: 'admin'
        });

        await admin.save();
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    res.status(500).json({ message: 'Admin login failed', error: error.message });
  }
};

// Get Current User
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getCurrentUser
};
