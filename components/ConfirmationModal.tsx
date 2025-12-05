import React, { useEffect, useState } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/40 backdrop-blur-[4px] z-60 transition-opacity duration-300 flex items-center justify-center ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onCancel}
    >
      <div 
        className={`bg-theme-surface p-6 rounded-2xl w-11/12 max-w-xs shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <p className="font-medium text-center mb-6 text-lg text-theme-main">{message}</p>
        <div className="flex justify-between gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-theme-body text-theme-main active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-red-500 text-white transition-all active:scale-95 shadow-md hover:bg-red-600"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;