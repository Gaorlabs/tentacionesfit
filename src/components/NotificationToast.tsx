import React from 'react';
import { Bell, X, CheckCircle, Truck, Sparkles, ShoppingBag } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <Truck className="w-4 h-4 text-emerald-400" />;
      case 'promo':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'cart':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-neutral-900/95 dark:bg-neutral-800/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-neutral-700 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-neutral-800 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div>
              <h5 className="font-bold text-xs text-white leading-tight">
                {notification.title}
              </h5>
              <p className="text-[11px] text-neutral-300 mt-0.5 leading-snug">
                {notification.message}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
