import {
  Device,
  ParentAccount,
  SafetyAlert,
  DeviceSchedule,
  OfflineSyncBatch,
  OfflineSyncEvent,
  DailyUsageRecord,
  ScreenShareSession
} from '../types/index.ts';

const STORAGE_KEY_DEVICES = 'safeweb_devices_v2';
const STORAGE_KEY_ACCOUNT = 'safeweb_account_v2';
const STORAGE_KEY_ALERTS = 'safeweb_alerts_v2';
const STORAGE_KEY_SCHEDULES = 'safeweb_schedules_v2';
const STORAGE_KEY_OFFLINE_BATCHES = 'safeweb_batches_v2';
const STORAGE_KEY_OFFLINE_EVENTS = 'safeweb_events_v2';

export const INITIAL_PARENT_ACCOUNT: ParentAccount = {
  id: 'parent_usr_99812',
  name: 'Ashikur Rahman (Parent Admin)',
  email: 'ashik.cvc.official@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  maxDevices: 10,
  retentionDays: 60,
  language: 'en',
  theme: 'light',
};

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-001',
    name: "Liam's Pixel 8",
    model: 'Google Pixel 8',
    androidVersion: 'Android 15 (Vanilla Ice Cream)',
    childName: 'Liam',
    childAge: 11,
    mode: 'personal',
    status: 'online',
    batteryLevel: 84,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
    lastSyncTime: new Date(Date.now() - 45000).toISOString(),
    lastLocation: {
      id: 'loc-001',
      deviceId: 'dev-001',
      latitude: 23.7937,
      longitude: 90.4066,
      accuracyMeters: 8,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      address: 'Gulshan 2, Dhaka, Bangladesh',
      isStale: false,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibilityService: true,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: true,
    },
    storageUsedGB: 42,
    totalStorageGB: 128,
    ramUsedGB: 4.8,
    totalRamGB: 8.0,
    dailyScreenTimeMinutes: 165,
    weeklyScreenTimeMinutes: 1120,
    screenTimeLimitMinutes: 180,
    isLocked: false,
    pairedAt: '2026-09-12T08:30:00.000Z',
  },
  {
    id: 'dev-002',
    name: "Aria's Galaxy Tab S9",
    model: 'Samsung Galaxy Tab S9',
    androidVersion: 'Android 14 (One UI 6.1)',
    childName: 'Aria',
    childAge: 9,
    mode: 'managed',
    status: 'online',
    batteryLevel: 92,
    isCharging: true,
    lastHeartbeat: new Date(Date.now() - 10000).toISOString(),
    lastSyncTime: new Date(Date.now() - 30000).toISOString(),
    lastLocation: {
      id: 'loc-002',
      deviceId: 'dev-002',
      latitude: 23.7808,
      longitude: 90.4192,
      accuracyMeters: 12,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      address: 'Banani Model Town, Dhaka, Bangladesh',
      isStale: false,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibilityService: true,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: true,
    },
    storageUsedGB: 68,
    totalStorageGB: 256,
    ramUsedGB: 6.1,
    totalRamGB: 12.0,
    dailyScreenTimeMinutes: 110,
    weeklyScreenTimeMinutes: 790,
    screenTimeLimitMinutes: 120,
    isLocked: false,
    pairedAt: '2026-09-20T14:15:00.000Z',
  },
  {
    id: 'dev-003',
    name: "Noah's Galaxy S23",
    model: 'Samsung Galaxy S23',
    androidVersion: 'Android 14',
    childName: 'Noah',
    childAge: 14,
    mode: 'personal',
    status: 'offline', // Offline device to demonstrate 5.1 & 5.2!
    batteryLevel: 41,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 75 mins ago
    lastSyncTime: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
    lastLocation: {
      id: 'loc-003',
      deviceId: 'dev-003',
      latitude: 23.8103,
      longitude: 90.4125,
      accuracyMeters: 15,
      timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      address: 'Baridhara Diplomatic Zone, Dhaka, Bangladesh',
      isStale: true,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: false,
      accessibilityService: true,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: false,
    },
    storageUsedGB: 95,
    totalStorageGB: 256,
    ramUsedGB: 5.4,
    totalRamGB: 8.0,
    dailyScreenTimeMinutes: 245,
    weeklyScreenTimeMinutes: 1680,
    screenTimeLimitMinutes: 210,
    isLocked: false,
    pairedAt: '2026-08-05T11:00:00.000Z',
  },
  {
    id: 'dev-004',
    name: "Maya's OnePlus 11",
    model: 'OnePlus 11 5G',
    androidVersion: 'Android 14 (OxygenOS)',
    childName: 'Maya',
    childAge: 12,
    mode: 'personal',
    status: 'online',
    batteryLevel: 68,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 25000).toISOString(),
    lastSyncTime: new Date(Date.now() - 50000).toISOString(),
    lastLocation: {
      id: 'loc-004',
      deviceId: 'dev-004',
      latitude: 23.7508,
      longitude: 90.3934,
      accuracyMeters: 6,
      timestamp: new Date(Date.now() - 90000).toISOString(),
      address: 'Dhanmondi Lake Park, Dhaka, Bangladesh',
      isStale: false,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibilityService: false,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: true,
    },
    storageUsedGB: 54,
    totalStorageGB: 128,
    ramUsedGB: 7.2,
    totalRamGB: 16.0,
    dailyScreenTimeMinutes: 140,
    weeklyScreenTimeMinutes: 980,
    screenTimeLimitMinutes: 180,
    isLocked: false,
    pairedAt: '2026-09-01T09:40:00.000Z',
  },
  {
    id: 'dev-005',
    name: "Ethan's Pixel 7a",
    model: 'Google Pixel 7a',
    androidVersion: 'Android 14',
    childName: 'Ethan',
    childAge: 10,
    mode: 'managed',
    status: 'online',
    batteryLevel: 55,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 18000).toISOString(),
    lastSyncTime: new Date(Date.now() - 40000).toISOString(),
    lastLocation: {
      id: 'loc-005',
      deviceId: 'dev-005',
      latitude: 23.7644,
      longitude: 90.3587,
      accuracyMeters: 10,
      timestamp: new Date(Date.now() - 110000).toISOString(),
      address: 'Mohammadpur Housing, Dhaka, Bangladesh',
      isStale: false,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibilityService: true,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: true,
    },
    storageUsedGB: 38,
    totalStorageGB: 128,
    ramUsedGB: 5.1,
    totalRamGB: 8.0,
    dailyScreenTimeMinutes: 95,
    weeklyScreenTimeMinutes: 620,
    screenTimeLimitMinutes: 120,
    isLocked: false,
    pairedAt: '2026-10-02T16:20:00.000Z',
  },
  {
    id: 'dev-006',
    name: "Sophia's Moto G",
    model: 'Motorola Moto G84',
    androidVersion: 'Android 13',
    childName: 'Sophia',
    childAge: 8,
    mode: 'personal',
    status: 'online',
    batteryLevel: 77,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 32000).toISOString(),
    lastSyncTime: new Date(Date.now() - 55000).toISOString(),
    lastLocation: {
      id: 'loc-006',
      deviceId: 'dev-006',
      latitude: 23.8759,
      longitude: 90.3795,
      accuracyMeters: 14,
      timestamp: new Date(Date.now() - 140000).toISOString(),
      address: 'Uttara Sector 4, Dhaka, Bangladesh',
      isStale: false,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: false,
      accessibilityService: true,
      overlayAlertWindow: true,
      ignoreBatteryOptimizations: true,
    },
    storageUsedGB: 31,
    totalStorageGB: 128,
    ramUsedGB: 4.2,
    totalRamGB: 8.0,
    dailyScreenTimeMinutes: 80,
    weeklyScreenTimeMinutes: 510,
    screenTimeLimitMinutes: 90,
    isLocked: false,
    pairedAt: '2026-10-10T10:10:00.000Z',
  },
  {
    id: 'dev-007',
    name: "Oliver's Xiaomi 13",
    model: 'Xiaomi 13T Pro',
    androidVersion: 'Android 14 (HyperOS)',
    childName: 'Oliver',
    childAge: 13,
    mode: 'personal',
    status: 'offline', // Offline device
    batteryLevel: 23,
    isCharging: false,
    lastHeartbeat: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hours ago
    lastSyncTime: new Date(Date.now() - 185 * 60 * 1000).toISOString(),
    lastLocation: {
      id: 'loc-007',
      deviceId: 'dev-007',
      latitude: 23.7099,
      longitude: 90.4071,
      accuracyMeters: 18,
      timestamp: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
      address: 'Old Dhaka Historical Quarter, Dhaka, Bangladesh',
      isStale: true,
    },
    permissions: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibilityService: false,
      overlayAlertWindow: false,
      ignoreBatteryOptimizations: false,
    },
    storageUsedGB: 112,
    totalStorageGB: 256,
    ramUsedGB: 6.9,
    totalRamGB: 12.0,
    dailyScreenTimeMinutes: 190,
    weeklyScreenTimeMinutes: 1340,
    screenTimeLimitMinutes: 180,
    isLocked: false,
    pairedAt: '2026-08-18T13:45:00.000Z',
  },
];

export const INITIAL_ALERTS: SafetyAlert[] = [
  {
    id: 'alt-001',
    deviceId: 'dev-003',
    deviceName: "Noah's Galaxy S23",
    type: 'device_offline',
    title: 'Device went offline',
    message: 'Lost network heartbeat at 10:42 AM. Displaying last known safe location.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: 'alt-002',
    deviceId: 'dev-003',
    deviceName: "Noah's Galaxy S23",
    type: 'limit_reached',
    title: 'Daily Screen Time Limit Exceeded',
    message: 'Daily allowance of 210 minutes exceeded (245m recorded).',
    severity: 'high',
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: 'alt-003',
    deviceId: 'dev-007',
    deviceName: "Oliver's Xiaomi 13",
    type: 'missing_permissions',
    title: 'Overlay Permission Revoked',
    message: 'Display over other apps permission was turned off on device.',
    severity: 'medium',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    resolved: false,
  },
  {
    id: 'alt-004',
    deviceId: 'dev-001',
    deviceName: "Liam's Pixel 8",
    type: 'device_reconnected',
    title: 'Device Reconnected & Synced',
    message: 'Heartbeat restored. 4 offline usage events successfully synchronized.',
    severity: 'low',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resolved: true,
  },
];

export const INITIAL_SCHEDULES: DeviceSchedule[] = [
  {
    id: 'sch-001',
    deviceId: 'dev-001',
    name: 'Bedtime Downtime',
    type: 'bedtime',
    startTime: '21:30',
    endTime: '06:30',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    enabled: true,
    blockApps: true,
  },
  {
    id: 'sch-002',
    deviceId: 'dev-001',
    name: 'Study & Homework Hours',
    type: 'school',
    startTime: '16:00',
    endTime: '18:00',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
    enabled: true,
    blockApps: true,
  },
  {
    id: 'sch-003',
    deviceId: 'dev-002',
    name: 'Tablet Rest Time',
    type: 'downtime',
    startTime: '20:00',
    endTime: '07:00',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    enabled: true,
    blockApps: true,
  },
];

export const INITIAL_OFFLINE_EVENTS: Record<string, OfflineSyncEvent[]> = {
  'dev-003': [
    {
      eventId: 'evt-noah-101',
      eventType: 'app_usage',
      timestamp: new Date(Date.now() - 78 * 60 * 1000).toISOString(),
      summary: 'Duolingo French lesson completed (25m)',
    },
    {
      eventId: 'evt-noah-102',
      eventType: 'location_update',
      timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      summary: 'Location updated: Baridhara Diplomatic Zone',
    },
    {
      eventId: 'evt-noah-103',
      eventType: 'heartbeat',
      timestamp: new Date(Date.now() - 82 * 60 * 1000).toISOString(),
      summary: 'Last successful sync before connectivity loss',
    },
    {
      eventId: 'evt-noah-104',
      eventType: 'permission_change',
      timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      summary: 'Background location check verified',
    },
  ],
  'dev-001': [
    {
      eventId: 'evt-liam-201',
      eventType: 'app_usage',
      timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      summary: 'Khan Academy Math Practice (40m)',
    },
    {
      eventId: 'evt-liam-202',
      eventType: 'heartbeat',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      summary: 'Periodic sync batch ack received',
    },
  ]
};

export const INITIAL_APP_USAGE: Record<string, DailyUsageRecord> = {
  'dev-001': {
    date: new Date().toISOString().slice(0, 10),
    totalMinutes: 165,
    hourlyUsage: [0, 0, 0, 0, 0, 0, 5, 12, 10, 0, 0, 0, 15, 20, 10, 25, 30, 20, 18, 0, 0, 0, 0, 0],
    apps: [
      { packageName: 'org.khanacademy.android', appName: 'Khan Academy', category: 'Education', durationMinutes: 52, iconName: 'GraduationCap', limitMinutes: 90 },
      { packageName: 'com.google.android.youtube.kids', appName: 'YouTube Kids', category: 'Entertainment', durationMinutes: 45, iconName: 'PlayCircle', limitMinutes: 45 },
      { packageName: 'com.duolingo', appName: 'Duolingo', category: 'Education', durationMinutes: 30, iconName: 'Languages' },
      { packageName: 'com.roblox.client', appName: 'Roblox', category: 'Games', durationMinutes: 25, iconName: 'Gamepad2', limitMinutes: 30 },
      { packageName: 'com.google.android.apps.messaging', appName: 'Google Messages', category: 'Social', durationMinutes: 13, iconName: 'MessageSquare' },
    ],
  },
  'dev-002': {
    date: new Date().toISOString().slice(0, 10),
    totalMinutes: 110,
    hourlyUsage: [0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 15, 15, 20, 10, 15, 10, 15, 0, 0, 0, 0, 0, 0, 0],
    apps: [
      { packageName: 'com.toca.boca.world', appName: 'Toca Life World', category: 'Games', durationMinutes: 40, iconName: 'Sparkles', limitMinutes: 45 },
      { packageName: 'com.pbskids.video', appName: 'PBS Kids Video', category: 'Entertainment', durationMinutes: 35, iconName: 'Film', limitMinutes: 40 },
      { packageName: 'com.google.android.apps.books', appName: 'Google Play Books', category: 'Education', durationMinutes: 25, iconName: 'BookOpen' },
      { packageName: 'com.google.android.googlequicksearchbox', appName: 'Google Assistant', category: 'Productivity', durationMinutes: 10, iconName: 'Search' },
    ],
  },
  'dev-003': {
    date: new Date().toISOString().slice(0, 10),
    totalMinutes: 245,
    hourlyUsage: [0, 0, 0, 0, 0, 0, 0, 15, 25, 30, 40, 35, 30, 40, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    apps: [
      { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok (Restricted)', category: 'Social', durationMinutes: 75, iconName: 'Video', limitMinutes: 60, isBlocked: true },
      { packageName: 'com.instagram.android', appName: 'Instagram', category: 'Social', durationMinutes: 65, iconName: 'Camera', limitMinutes: 45, isBlocked: true },
      { packageName: 'com.dts.freefireth', appName: 'Free Fire', category: 'Games', durationMinutes: 55, iconName: 'Crosshair', limitMinutes: 40, isBlocked: true },
      { packageName: 'com.duolingo', appName: 'Duolingo', category: 'Education', durationMinutes: 30, iconName: 'Languages' },
      { packageName: 'com.spotify.music', appName: 'Spotify Kids', category: 'Entertainment', durationMinutes: 20, iconName: 'Headphones' },
    ],
  },
};

// Storage helpers
export function loadDevices(): Device[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(INITIAL_DEVICES));
      return INITIAL_DEVICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEVICES;
  }
}

export function saveDevices(devices: Device[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to save devices to storage:', e);
  }
}

export function loadAccount(): ParentAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(INITIAL_PARENT_ACCOUNT));
      return INITIAL_PARENT_ACCOUNT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PARENT_ACCOUNT;
  }
}

export function saveAccount(account: ParentAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNT, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save account:', e);
  }
}

export function loadAlerts(): SafetyAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ALERTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(INITIAL_ALERTS));
      return INITIAL_ALERTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ALERTS;
  }
}

export function saveAlerts(alerts: SafetyAlert[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts:', e);
  }
}

export function loadSchedules(): DeviceSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
      return INITIAL_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SCHEDULES;
  }
}

export function saveSchedules(schedules: DeviceSchedule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Failed to save schedules:', e);
  }
}

export function loadOfflineEvents(deviceId: string): OfflineSyncEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_EVENTS);
    const map: Record<string, OfflineSyncEvent[]> = raw ? JSON.parse(raw) : INITIAL_OFFLINE_EVENTS;
    return map[deviceId] || [];
  } catch {
    return INITIAL_OFFLINE_EVENTS[deviceId] || [];
  }
}

export function saveOfflineEvents(deviceId: string, events: OfflineSyncEvent[]): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_EVENTS);
    const map: Record<string, OfflineSyncEvent[]> = raw ? JSON.parse(raw) : { ...INITIAL_OFFLINE_EVENTS };
    map[deviceId] = events;
    localStorage.setItem(STORAGE_KEY_OFFLINE_EVENTS, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save offline events:', e);
  }
}

const STORAGE_KEY_NOTIFICATIONS = 'safeweb_notifications_v2';

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    category: 'connection',
    type: 'device_disconnected',
    title: "Noah's Galaxy S23 Disconnected",
    message: 'Heartbeat signal lost. Preserving last known safe GPS position and queuing offline activity.',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    deviceId: 'dev-003',
    deviceName: "Noah's Galaxy S23",
    childName: 'Noah',
    actionPage: 'offlineHistory',
    actionLabel: 'View Offline History',
  },
  {
    id: 'notif-002',
    category: 'limit',
    type: 'screen_time_limit',
    title: 'Daily Screen Limit Reached: Noah',
    message: 'Allowance of 210m reached (245m recorded, +35m over). Restrictive overlay activated on device.',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    deviceId: 'dev-003',
    deviceName: "Noah's Galaxy S23",
    childName: 'Noah',
    actionPage: 'screenTime',
    actionLabel: 'Review Screen Time',
  },
  {
    id: 'notif-003',
    category: 'pairing',
    type: 'pairing_request',
    title: 'Pending Pairing Request: Galaxy Tab A9',
    message: 'Single-use code entered for child profile "Lucas". Parent approval required to link.',
    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    read: false,
    priority: 'urgent',
    actionPage: 'myDevices',
    actionLabel: 'Approve Pairing',
  },
  {
    id: 'notif-004',
    category: 'connection',
    type: 'device_connected',
    title: "Aria's Galaxy Tab S9 Reconnected",
    message: 'Device has restored 5GHz Wi-Fi connection (Battery: 92%). Live monitoring active.',
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    read: true,
    priority: 'low',
    deviceId: 'dev-002',
    deviceName: "Aria's Galaxy Tab S9",
    childName: 'Aria',
    actionPage: 'deviceDetails',
    actionLabel: 'View Device',
  },
  {
    id: 'notif-005',
    category: 'safety',
    type: 'keyword_match',
    title: 'Restricted Content Blocked',
    message: 'Triggered safe browsing filter on Liam\'s Pixel 8 (Blocked URL: casino-bonus-online.com).',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    read: true,
    priority: 'urgent',
    deviceId: 'dev-001',
    deviceName: "Liam's Pixel 8",
    childName: 'Liam',
    actionPage: 'safetyAlerts',
    actionLabel: 'Review Alert',
  },
];

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: unknown[]) {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

