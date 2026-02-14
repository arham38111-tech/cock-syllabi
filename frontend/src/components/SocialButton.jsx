import React from 'react';

const icons = {
  google: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21.35 11.1h-9.2v2.8h5.3c-.23 1.37-1.3 3.2-5.3 3.2-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.82 0 3.03.78 3.73 1.45l2.55-2.45C17.43 3.1 15.05 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.75 0 9.86-4.02 9.86-9.7 0-.65-.07-1.15-.51-1.2z" fill="#4285F4"/>
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16.365 1.43c0 1.02-.37 2.01-1.02 2.77-.72.85-1.64 1.33-2.61 1.25.03-.18.05-.36.05-.54 0-1.16.49-2.2 1.28-2.96.59-.57 1.18-.77 1.85-.52.01.01.01.02.01.02z" fill="#111"/>
      <path d="M20.95 7.47c-.49-.89-1.07-1.66-1.83-2.29-1.24-1.01-2.72-1.52-4.33-1.46-1.44.05-2.62.57-3.5 1.53-.72.82-1.19 1.86-1.32 2.75-.02.13-.02.27-.02.4 0 .6.14 1.38.42 2.32.3 1.02.8 2.2 1.5 3.36.84 1.38 1.89 2.78 3.22 2.78 1.26 0 1.78-.59 3.34-.59 1.56 0 2.03.59 3.34.59 1.15 0 2.01-1.04 2.74-2.3.87-1.48 1.4-3.08 1.4-4.81 0-.82-.12-1.56-.4-2.22-.57-1.43-1.62-2.96-3.54-3.96z" fill="#111"/>
    </svg>
  )
};

const SocialButton = ({ provider = 'google', onClick }) => {
  const isGoogle = provider === 'google';
  const isApple = provider === 'apple' || provider === 'mac';

  return (
    <button
      onClick={onClick}
      aria-label={`Continue with ${provider}`}
      className={`w-full sm:w-auto flex items-center gap-3 px-4 py-2 rounded-lg border transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 ${isGoogle ? 'bg-white border-gray-200 hover:shadow-md' : ''} ${isApple ? 'bg-black text-white hover:opacity-95' : ''}`}
    >
      <span className="flex items-center justify-center w-7 h-7">{isGoogle ? icons.google : icons.apple}</span>
      <span className="text-sm font-medium">Continue with {isGoogle ? 'Google' : 'Apple'}</span>
    </button>
  );
};

export default SocialButton;
