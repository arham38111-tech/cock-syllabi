import React, { useEffect, useState } from 'react';

const OAuthCallback = () => {
  const [message, setMessage] = useState('Processing login...');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setIsProcessing(true);
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const provider = params.get('provider');
        const name = params.get('name') ? decodeURIComponent(params.get('name')) : 'OAuth User';
        const email = params.get('email') ? decodeURIComponent(params.get('email')) : `${provider}.user@example.com`;

        if (!token) {
          console.error('No token in URL params');
          setError('No token received from provider. Please try again.');
          setMessage('Token missing');
          setIsProcessing(false);
          return;
        }

        // Step 1: Save token to localStorage
        localStorage.setItem('token', token);
        console.log('Token saved:', token);
        setMessage('Token saved, storing user data...');

        // Step 2: Save OAuth user data in sessionStorage
        const userData = {
          name,
          email,
          provider,
          role: 'student',
          _id: `oauth_${provider}_${Date.now()}`
        };
        sessionStorage.setItem('oauth_user', JSON.stringify(userData));
        console.log('User data saved:', userData);

        // Step 3: Save login state before redirect
        localStorage.setItem('userLoggedIn', 'true');
        sessionStorage.setItem('loginTime', Date.now());
        sessionStorage.setItem('userRole', userData.role || 'student');
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessage('Redirecting to dashboard...');

        // Step 4: Determine redirect based on role
        const redirectPath = userData.role === 'admin' ? '/admin' 
                            : userData.role === 'teacher' ? '/teacher' 
                            : '/student';
        const targetUrl = `${window.location.origin}${redirectPath}`;
        console.log('Redirecting to:', targetUrl);
        
        // Single hard redirect
        window.location.replace(targetUrl);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Failed to process login');
        setMessage('Error processing login');
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, []);

  return (
    <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {error ? '❌ Login Failed' : '✓ Processing Login'}
          </h2>

          {error ? (
            <>
              <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
              <p className="text-sm text-gray-600 text-center mb-6 font-mono bg-red-50 p-3 rounded border border-red-200">
                {message}
              </p>
              <div className="w-full space-y-3">
                <a
                  href="/login"
                  className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
                >
                  Try Login Again
                </a>
                <a
                  href="/register"
                  className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
                >
                  Register Instead
                </a>
                <a
                  href="/"
                  className="block w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors text-center font-semibold"
                >
                  Return Home
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 text-center font-medium mb-2">{message}</p>
              <p className="text-xs text-gray-500 text-center">
                Setting up your session...
              </p>
              <div className="mt-6 w-full">
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                If you're not redirected in 5 seconds, <a href="/student" className="text-blue-600 hover:text-blue-700 font-semibold">click here</a>.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Fallback meta redirect as last resort */}
      {!error && <meta httpEquiv="refresh" content={`2; url=${window.location.origin}/student`} />}
    </main>
  );
};

export default OAuthCallback;
