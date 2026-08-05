
import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, CloseIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center w-full max-w-xs p-4 text-white ${bgColor} rounded-lg shadow-lg`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        <Icon />
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" onClick={onClose} aria-label="Close">
        <span className="sr-only">Close</span>
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;
