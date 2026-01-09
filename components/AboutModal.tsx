
import React, { useEffect, useState } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm bg-theme-surface rounded-[2.5rem] p-8 shadow-2xl z-[60] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-theme-main tracking-tight">About Us</h2>
            <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-theme-body text-theme-main flex items-center justify-center transition-colors hover:bg-black/5"
            >
            <i className="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
            {/* App Logo/Branding - Changed to Briefcase for Office Theme */}
            <div className="w-20 h-20 bg-theme-primary-gradient rounded-3xl flex items-center justify-center shadow-lg shadow-theme-primary/30 transform rotate-3">
                <i className="fa-solid fa-briefcase text-3xl text-white"></i>
            </div>
            
            <div>
                <h3 className="text-xl font-extrabold text-theme-main">Office BU App</h3>
                <p className="text-sm text-theme-muted font-medium">Version 2.0.0</p>
            </div>

            <p className="text-theme-muted text-sm leading-relaxed">
                A comprehensive utility tool designed to streamline office expense tracking and management with ease and efficiency.
            </p>

            <div className="w-full h-px bg-black/5"></div>

            {/* Developer Profile Section */}
            <div className="w-full bg-theme-body rounded-2xl p-4 border border-black/5 hover:border-theme-primary/20 transition-colors text-left flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-theme-surface border-2 border-theme-primary flex items-center justify-center overflow-hidden shrink-0">
                    <i className="fa-solid fa-user-tie text-theme-primary text-lg"></i>
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase text-theme-muted tracking-wider">Developed By</p>
                    <h4 className="font-bold text-theme-main">Rishi Jha</h4>
                    <p className="text-xs text-theme-primary font-medium">Full Stack Developer</p>
                </div>
            </div>

            <div className="flex gap-4 pt-2">
                <a 
                  href="https://www.linkedin.com/in/rishi-jha-902757327/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-theme-body flex items-center justify-center text-theme-main hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                  aria-label="LinkedIn"
                >
                    <i className="fa-brands fa-linkedin-in text-xl"></i>
                </a>
                <a 
                  href="mailto:rishijha@tuta.io" 
                  className="w-12 h-12 rounded-2xl bg-theme-body flex items-center justify-center text-theme-main hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                  aria-label="Email"
                >
                    <i className="fa-solid fa-envelope text-xl"></i>
                </a>
            </div>

            <p className="text-[10px] text-theme-muted mt-4">
                © {new Date().getFullYear()} Office BU. All rights reserved.
            </p>
        </div>
      </div>
    </>
  );
};

export default AboutModal;
