import React, { useEffect, useState } from 'react';
import Calculator from './Calculator';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-[4px] z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto z-[60] transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
      >
        <div className="relative">
          <Calculator />
          <button 
            onClick={onClose}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-black/60 shadow-lg hover:bg-white transition-transform active:scale-90"
            aria-label="Close Calculator"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default CalculatorModal;
