import React from 'react';
import {
  ShieldAlert,
  WifiOff,
  Wifi,
  Clock,
  UserCheck,
  Smartphone,
  X,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { AppNotification } from '../types/index.ts';

interface ToastContainerProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
  onActionClick: (notification: AppNotification) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onActionClick,
}) => {
  if (toasts.length === 0) return null;

  const getIcon = (notif: AppNotification) => {
    switch (notif.category) {
      case 'connection':
        return notif.type === 'device_disconnected' ? (
          <WifiOff className="w-5 h-5 text-amber-500" />
        ) : (
          <Wifi className="w-5 h-5 text-emerald-500" />
        );
      case 'limit':
        return <Clock className="w-5 h-5 text-rose-500" />;
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'pairing':
        return <UserCheck className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (notif: AppNotification) => {
    switch (notif.priority) {
      case 'urgent':
        return 'border-rose-500 ring-2 ring-rose-500/20';
      case 'high':
        return 'border-amber-500 ring-2 ring-amber-500/20';
      case 'normal':
        return 'border-indigo-500';
      default:
        return 'border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl bg-white dark:bg-slate-900 shadow-xl border ${getBorderColor(
            toast
          )} transition-all duration-300 transform translate-y-0 opacity-100 flex flex-col gap-2`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                {getIcon(toast)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {toast.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                  {toast.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {toast.message}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {toast.deviceName && (
              <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                <Smartphone className="w-3 h-3 text-indigo-500" />
                {toast.deviceName}
              </span>
            )}
            {toast.actionLabel && (
              <button
                onClick={() => onActionClick(toast)}
                className="ml-auto flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
              >
                {toast.actionLabel}
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
