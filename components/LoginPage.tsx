import React from 'react';
import { ThemeType } from '../types';
import ThemeSelector from './ThemeSelector';

interface LoginPageProps {
  handleAuthClick: () => void;
  onSetTheme: (theme: ThemeType) => void;
  currentTheme: ThemeType;
}

const LoginPage: React.FC<LoginPageProps> = ({ handleAuthClick, onSetTheme, currentTheme }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-body p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSelector currentTheme={currentTheme} onSetTheme={onSetTheme} />
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-theme-surface rounded-2xl shadow-2xl overflow-hidden md:grid md:grid-cols-2">
          {/* Branding Panel */}
          <div className="hidden md:flex flex-col items-center justify-center p-12 bg-theme-primary-gradient text-white">
            <i className="fa-solid fa-building text-6xl mb-4"></i>
            <h1 className="text-3xl font-bold">Office BU App</h1>
            <p className="mt-2 text-center opacity-80">Your Business Utility, backed by Google Sheets.</p>
          </div>

          {/* Form Panel */}
          <div className="p-8 md:p-12 flex flex-col items-center justify-center">
             <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-full bg-theme-primary-gradient shadow-lg mb-4 md:hidden">
                    <i className="fa-solid fa-building text-white text-4xl"></i>
                </div>
              <h1 className="text-3xl font-bold text-theme-main">Welcome</h1>
              <p className="text-theme-muted mt-2">Sign in with Google to continue.</p>
            </div>
            
            <button
                onClick={handleAuthClick}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 border border-gray-200 rounded-lg shadow-md transition-all flex items-center justify-center gap-4 w-full max-w-xs"
            >
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span>Sign in with Google</span>
            </button>
            <p className="text-xs text-theme-muted mt-6 text-center max-w-xs">By signing in, you allow this app to access your Google Sheets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;