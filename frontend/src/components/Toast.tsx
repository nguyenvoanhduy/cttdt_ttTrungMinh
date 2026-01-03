import { useEffect } from 'react';
import * as Icons from './Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = ({ message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const icons = {
    success: <Icons.CheckCircle className="w-5 h-5 text-green-600" />,
    error: <Icons.AlertTriangle className="w-5 h-5 text-red-600" />,
    warning: <Icons.AlertTriangle className="w-5 h-5 text-yellow-600" />,
    info: <Icons.Info className="w-5 h-5 text-blue-600" />
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] max-w-md w-full animate-in slide-in-from-right duration-300`}>
      <div className={`${styles[type]} border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <Icons.X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast container component
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
