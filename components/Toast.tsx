import React, { useEffect, useState } from 'react';
import { IconCheck, IconX } from './Icons';

interface ToastProps {
  toast: {
    message: string;
    type: 'success' | 'error';
  } | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for the fade-out animation before calling onClose
        setTimeout(onClose, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`fixed top-20 right-6 z-50 flex items-center p-4 w-full max-w-xs text-slate-800 bg-white rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out
      ${isSuccess ? 'border-green-500' : 'border-red-500'}
      ${isVisible ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}`}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg 
        ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isSuccess ? <IconCheck className="w-5 h-5" /> : <IconX className="w-5 h-5" />}
      </div>
      <div className="ml-3 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-slate-400 hover:text-slate-900 rounded-lg focus:ring-2 focus:ring-slate-300 p-1.5 hover:bg-slate-100 inline-flex items-center justify-center h-8 w-8"
        onClick={onClose}
        aria-label="Close"
      >
        <IconX className="w-5 h-5" />
      </button>
    </div>
  );
};