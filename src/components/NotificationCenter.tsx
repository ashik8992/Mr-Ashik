import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  ExternalLink,
  WifiOff,
  Wifi,
  Clock,
  ShieldAlert,
  UserCheck,
  Smartphone,
  Send,
  Sparkles,
  Search,
} from 'lucide-react';
import {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
} from '../types/index.ts';
import {
  filterNotifications,
  getUnreadCount,
  requestBrowserNotificationPermission,
  sendBrowserPushNotification,
  playNotificationSound,
} from '../utils/notificationSystem.ts';
import { Language, translations } from '../i18n/translations.ts';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onActionClick: (notification: AppNotification) => void;
  onSimulateEvent: (
    type:
      | 'device_disconnected'
      | 'device_connected'
      | 'screen_time_limit'
      | 'safety_alert'
      | 'pairing_request'
  ) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  lang: Language;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onClearAll,
  onActionClick,
  onSimulateEvent,
  soundEnabled,
  onToggleSound,
  lang,
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<
    NotificationCategory | 'all' | 'unread'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  if (!isOpen) return null;

  const unreadCount = getUnreadCount(notifications);

  const filtered = filterNotifications(notifications, {
    category:
      selectedCategory === 'all' || selectedCategory === 'unread'
        ? undefined
        : selectedCategory,
    unreadOnly: selectedCategory === 'unread',
    search: searchQuery,
  });

  const handleRequestPushPermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPushPermission(res);
    if (res === 'granted') {
      sendBrowserPushNotification({
        id: `test-push-${Date.now()}`,
        category: 'system',
        type: 'safety_alert',
        title: 'Safe Web & App Push Enabled',
        message: 'You will now receive instant push alerts for critical device events.',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
      });
      if (soundEnabled) playNotificationSound('high');
    }
  };

  const handleTestBrowserPush = () => {
    const testNotif: AppNotification = {
      id: `test-${Date.now()}`,
      category: 'safety',
      type: 'safety_alert',
      title: 'Real-Time Alert: Noah\'s Galaxy S23',
      message: 'Suspicious domain blocked in safe browsing filter. Immediate parent review recommended.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'urgent',
      deviceName: "Noah's Galaxy S23",
      childName: 'Noah',
    };

    if (pushPermission === 'granted') {
      sendBrowserPushNotification(testNotif);
    }
    if (soundEnabled) playNotificationSound('urgent');
    onSimulateEvent('safety_alert');
  };

  const formatRelativeTime = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (lang === 'bn') {
      if (diffMins < 1) return 'এইমাত্র';
      if (diffMins < 60) return `${diffMins} মিনিট আগে`;
      if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
      return `${diffDays} দিন আগে`;
    }

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getCategoryIcon = (category: NotificationCategory, type: string) => {
    switch (category) {
      case 'connection':
        return type === 'device_disconnected' ? (
          <WifiOff className="w-4 h-4 text-amber-500" />
        ) : (
          <Wifi className="w-4 h-4 text-emerald-500" />
        );
      case 'limit':
        return <Clock className="w-4 h-4 text-rose-500" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'pairing':
        return <UserCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            High
          </span>
        );
      case 'normal':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Normal
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-all duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Notification Center"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.notifications.centerTitle}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                    {unreadCount} {t.notifications.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.notifications.centerSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                  : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={soundEnabled ? 'Mute alert sounds' : 'Enable alert sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Push Banner & Quick Simulation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  pushPermission === 'granted'
                    ? 'bg-emerald-500 animate-pulse'
                    : pushPermission === 'denied'
                    ? 'bg-rose-500'
                    : 'bg-amber-500'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lang === 'bn' ? 'ব্রাউজার পুশ নোটিফিকেশন' : 'Browser Push Notifications'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pushPermission === 'granted'
                    ? lang === 'bn' ? 'সক্রিয় — তাত্ক্ষণিক সতর্কতা আসবে' : 'Active — Instant push delivery enabled'
                    : pushPermission === 'denied'
                    ? lang === 'bn' ? 'ব্রাউজারে ব্লক করা' : 'Blocked in browser permissions'
                    : lang === 'bn' ? 'অনুমতি প্রয়োজন' : 'Requires permission approval'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {pushPermission !== 'granted' && (
                <button
                  onClick={handleRequestPushPermission}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                >
                  {lang === 'bn' ? 'সক্রিয় করুন' : 'Enable Push'}
                </button>
              )}
              <button
                onClick={handleTestBrowserPush}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Send a sample test notification"
              >
                <Send className="w-3 h-3 text-indigo-500" />
                <span>{lang === 'bn' ? 'টেস্ট পুশ' : 'Test Push'}</span>
              </button>
            </div>
          </div>

          {/* Quick Simulation Bar for Required Events */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {lang === 'bn' ? 'রিয়েল-টাইম নোটিফিকেশন পরীক্ষা:' : 'Test Real-Time Event Trigger:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onSimulateEvent('device_disconnected')}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors"
              >
                Disconnect
              </button>
              <button
                onClick={() => onSimulateEvent('device_connected')}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                Reconnect
              </button>
              <button
                onClick={() => onSimulateEvent('screen_time_limit')}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors"
              >
                Screen Limit
              </button>
              <button
                onClick={() => onSimulateEvent('safety_alert')}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors"
              >
                Safety Alert
              </button>
              <button
                onClick={() => onSimulateEvent('pairing_request')}
                className="px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                Pairing Request
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'বিজ্ঞপ্তি খুঁজুন...' : 'Filter notifications by keyword or device...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterAll} ({notifications.length})
            </button>
            <button
              onClick={() => setSelectedCategory('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterUnread} ({unreadCount})
            </button>
            <button
              onClick={() => setSelectedCategory('connection')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'connection'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterConnection}
            </button>
            <button
              onClick={() => setSelectedCategory('safety')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'safety'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterSafety}
            </button>
            <button
              onClick={() => setSelectedCategory('limit')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'limit'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterLimits}
            </button>
            <button
              onClick={() => setSelectedCategory('pairing')}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'pairing'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t.notifications.filterPairing}
            </button>
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t.notifications.noNotifications}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {t.notifications.allOperatingNormally}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.read
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-850 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-2xs border border-slate-200 dark:border-slate-700">
                      {getCategoryIcon(item.category, item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {getPriorityBadge(item.priority)}
                        <span className="text-[10px] text-slate-400">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!item.read && (
                      <button
                        onClick={() => onMarkRead(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotification(item.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed my-1.5">
                  {item.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    {item.deviceName && (
                      <span className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                        <Smartphone className="w-3 h-3 text-indigo-500" />
                        {item.deviceName}
                      </span>
                    )}
                    {item.childName && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                        Child: {item.childName}
                      </span>
                    )}
                  </div>

                  {item.actionLabel && (
                    <button
                      onClick={() => {
                        onActionClick(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>{item.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <span className="text-[11px] text-slate-400">
            {notifications.length} total events recorded
          </span>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline"
            >
              {t.notifications.clearAll}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
