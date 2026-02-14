const express = require('express');
const router = express.Router();

// Development-friendly mock OAuth redirect.
// If real OAuth is configured, replace these with proper provider flows.
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5174';

router.get('/google', (req, res) => {
  try {
    // Create mock token for demo
    const mockToken = `mock-google-token-${Date.now()}`;
    
    // Build redirect URL with proper encoding
    const callbackUrl = new URL(`${FRONTEND}/oauth/callback`);
    callbackUrl.searchParams.append('provider', 'google');
    callbackUrl.searchParams.append('token', mockToken);
    callbackUrl.searchParams.append('name', 'Google User');
    callbackUrl.searchParams.append('email', `google.user.${Date.now()}@example.com`);
    
    console.log('🔐 OAuth Google redirect to:', callbackUrl.toString());
    return res.redirect(302, callbackUrl.toString());
  } catch (err) {
    console.error('OAuth Google error:', err);
    return res.status(500).json({ error: 'OAuth redirect failed' });
  }
});

router.get('/apple', (req, res) => {
  try {
    // Create mock token for demo
    const mockToken = `mock-apple-token-${Date.now()}`;
    
    // Build redirect URL with proper encoding
    const callbackUrl = new URL(`${FRONTEND}/oauth/callback`);
    callbackUrl.searchParams.append('provider', 'apple');
    callbackUrl.searchParams.append('token', mockToken);
    callbackUrl.searchParams.append('name', 'Apple User');
    callbackUrl.searchParams.append('email', `apple.user.${Date.now()}@example.com`);
    
    console.log('🔐 OAuth Apple redirect to:', callbackUrl.toString());
    return res.redirect(302, callbackUrl.toString());
  } catch (err) {
    console.error('OAuth Apple error:', err);
    return res.status(500).json({ error: 'OAuth redirect failed' });
  }
});

module.exports = router;
