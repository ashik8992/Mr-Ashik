import { AppNotification, NotificationCategory, NotificationPriority, Device, SafetyAlert } from '../types/index.ts';

/**
 * Filter notifications by category, read status, and search query
 */
export function filterNotifications(
  notifications: AppNotification[],
  options?: {
    category?: NotificationCategory | 'all';
    unreadOnly?: boolean;
    search?: string;
  }
): AppNotification[] {
  let result = [...notifications];

  if (options?.category && options.category !== 'all') {
    result = result.filter((n) => n.category === options.category);
  }

  if (options?.unreadOnly) {
    result = result.filter((n) => !n.read);
  }

  if (options?.search && options.search.trim() !== '') {
    const q = options.search.toLowerCase().trim();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.deviceName && n.deviceName.toLowerCase().includes(q)) ||
        (n.childName && n.childName.toLowerCase().includes(q))
    );
  }

  // Newest first
  return result.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Calculate unread notification count
 */
export function getUnreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(
  notifications: AppNotification[]
): AppNotification[] {
  return notifications.map((n) => ({ ...n, read: true }));
}

/**
 * Remove a notification
 */
export function removeNotification(
  notifications: AppNotification[],
  id: string
): AppNotification[] {
  return notifications.filter((n) => n.id !== id);
}

/**
 * Factory: Device Connection / Disconnection Notification
 */
export function createDeviceConnectionNotification(
  device: Partial<Device> & { id: string; name: string },
  status: 'online' | 'offline',
  details?: { batteryLevel?: number; reason?: string }
): AppNotification {
  const isOnline = status === 'online';
  const timestamp = new Date().toISOString();

  if (isOnline) {
    return {
      id: `notif-conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: 'connection',
      type: 'device_connected',
      title: `${device.name} Connected`,
      message: details?.batteryLevel !== undefined
        ? `Device is online and synchronized (Battery: ${details.batteryLevel}%).`
        : `Device has reconnected to the server and resumed live monitoring.`,
      timestamp,
      read: false,
      priority: 'low',
      deviceId: device.id,
      deviceName: device.name,
      childName: device.childName,
      actionPage: 'deviceDetails',
      actionLabel: 'View Device',
      metadata: { status: 'online', batteryLevel: details?.batteryLevel },
    };
  } else {
    return {
      id: `notif-disconn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: 'connection',
      type: 'device_disconnected',
      title: `${device.name} Disconnected / Offline`,
      message: details?.reason || `Device heartbeat missed. Showing last known GPS location and offline history.`,
      timestamp,
      read: false,
      priority: 'high',
      deviceId: device.id,
      deviceName: device.name,
      childName: device.childName,
      actionPage: 'offlineHistory',
      actionLabel: 'View Offline History',
      metadata: { status: 'offline', reason: details?.reason },
    };
  }
}

/**
 * Factory: Screen Time Limit Reached Notification
 */
export function createScreenTimeLimitNotification(
  device: Partial<Device> & { id: string; name: string; screenTimeLimitMinutes?: number },
  minutesUsed: number,
  limitMinutes: number
): AppNotification {
  const overage = Math.max(0, minutesUsed - limitMinutes);
  return {
    id: `notif-limit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: 'limit',
    type: 'screen_time_limit',
    title: `Daily Screen Limit Reached: ${device.name}`,
    message: overage > 0
      ? `Allowance of ${limitMinutes}m reached (${minutesUsed}m recorded, +${overage}m over). App blocking overlay active.`
      : `Allowance of ${limitMinutes}m reached for today. Restrictive lock scheduled.`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'high',
    deviceId: device.id,
    deviceName: device.name,
    childName: device.childName,
    actionPage: 'screenTime',
    actionLabel: 'Review Screen Time',
    metadata: { minutesUsed, limitMinutes, overage },
  };
}

/**
 * Factory: Safety Alert Notification
 */
export function createSafetyAlertNotification(alert: SafetyAlert): AppNotification {
  const priorityMap: Record<string, NotificationPriority> = {
    critical: 'urgent',
    high: 'high',
    medium: 'normal',
    low: 'low',
  };

  return {
    id: `notif-safety-${alert.id}`,
    category: 'safety',
    type: alert.type === 'keyword_match' ? 'keyword_match' : 'safety_alert',
    title: `Safety Alert: ${alert.title}`,
    message: `${alert.deviceName}: ${alert.message}`,
    timestamp: alert.timestamp || new Date().toISOString(),
    read: false,
    priority: priorityMap[alert.severity] || 'normal',
    deviceId: alert.deviceId,
    deviceName: alert.deviceName,
    actionPage: 'safetyAlerts',
    actionLabel: 'Investigate Alert',
    metadata: {
      alertType: alert.type,
      matchedKeyword: alert.matchedKeyword,
      sourceUrl: alert.sourceUrl,
    },
  };
}

/**
 * Factory: Pairing Request Notification
 */
export function createPairingRequestNotification(
  pairingCode: string,
  deviceModel: string,
  childName: string
): AppNotification {
  return {
    id: `notif-pair-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: 'pairing',
    type: 'pairing_request',
    title: `New Pairing Request: ${deviceModel}`,
    message: `Code ${pairingCode} entered for child profile "${childName}". Approval required to link device.`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'urgent',
    actionPage: 'myDevices',
    actionLabel: 'Review Device',
    metadata: { pairingCode, deviceModel, childName },
  };
}

/**
 * Play a web notification chime synthesized via Web Audio API
 */
export function playNotificationSound(priority: NotificationPriority = 'normal'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (priority === 'urgent' || priority === 'high') {
      // High two-tone urgent chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Soft pleasant confirmation chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

/**
 * Request Browser Push Notification Permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

/**
 * Send a Browser Push Notification if permission granted
 */
export function sendBrowserPushNotification(
  notification: AppNotification,
  options?: { icon?: string; badge?: string }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(notification.title, {
        body: notification.message,
        icon: options?.icon || '/favicon.ico',
        tag: notification.id,
        badge: options?.badge,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
