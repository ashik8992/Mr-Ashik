export type DeviceMode = 'personal' | 'managed';
export type DeviceConnectionStatus = 'online' | 'offline';

export interface DevicePermissions {
  usageAccess: boolean;
  backgroundLocation: boolean;
  mediaProjection: boolean;
  accessibilityService: boolean;
  overlayAlertWindow: boolean;
  ignoreBatteryOptimizations: boolean;
}

export interface LocationRecord {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: string; // ISO string
  address: string;
  isStale: boolean;
}

export interface AppUsageItem {
  packageName: string;
  appName: string;
  category: 'Social' | 'Games' | 'Education' | 'Entertainment' | 'Productivity' | 'System';
  durationMinutes: number;
  iconName: string;
  limitMinutes?: number;
  isBlocked?: boolean;
}

export interface DailyUsageRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  apps: AppUsageItem[];
  hourlyUsage: number[]; // 24 values
}

export interface OfflineSyncEvent {
  eventId: string;
  eventType: 'app_usage' | 'location_update' | 'permission_change' | 'device_reboot' | 'heartbeat';
  timestamp: string;
  summary: string;
  details?: Record<string, unknown>;
}

export interface OfflineSyncBatch {
  batchId: string;
  deviceId: string;
  receivedAt: string;
  recordsCount: number;
  status: 'synced' | 'pending';
  events: OfflineSyncEvent[];
}

export interface Device {
  id: string;
  name: string;
  model: string;
  androidVersion: string;
  childName: string;
  childAge: number;
  mode: DeviceMode;
  status: DeviceConnectionStatus;
  batteryLevel: number;
  isCharging: boolean;
  lastHeartbeat: string;
  lastSyncTime: string;
  lastLocation: LocationRecord;
  permissions: DevicePermissions;
  storageUsedGB: number;
  totalStorageGB: number;
  ramUsedGB: number;
  totalRamGB: number;
  dailyScreenTimeMinutes: number;
  weeklyScreenTimeMinutes: number;
  screenTimeLimitMinutes: number;
  isLocked: boolean;
  pairingCode?: string;
  pairedAt: string;
}

export type ScreenShareStatus = 
  | 'idle'
  | 'requesting'
  | 'waiting_consent'
  | 'connecting'
  | 'live'
  | 'interrupted'
  | 'ended'
  | 'denied';

export interface ScreenShareSession {
  sessionId: string;
  deviceId: string;
  parentId: string;
  status: ScreenShareStatus;
  startedAt?: string;
  endedAt?: string;
  token?: string;
  denialReason?: string;
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 
  | 'device_offline'
  | 'device_reconnected'
  | 'pairing_request'
  | 'missing_permissions'
  | 'limit_reached'
  | 'location_disabled'
  | 'screen_share_requested'
  | 'screen_share_consent_approved'
  | 'screen_share_consent_denied'
  | 'screen_share_ended'
  | 'sync_failure'
  | 'keyword_match';

export interface KeywordRule {
  id: string;
  phrase: string;
  category: 'Gambling' | 'Adult' | 'Violence' | 'Cyberbullying' | 'Suspicious' | 'Custom';
  severity: AlertSeverity;
  notifyPush: boolean;
  enabled: boolean;
  matchCount: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

export interface SafetyAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  resolved: boolean;
  matchedKeyword?: string;
  sourceUrl?: string;
  sourceApp?: string;
}

export interface DeviceSchedule {
  id: string;
  deviceId: string;
  name: string;
  type: 'bedtime' | 'school' | 'downtime' | 'weekend';
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  days: ('Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  enabled: boolean;
  blockApps: boolean;
}

export interface ParentAccount {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  maxDevices: number;
  retentionDays: number; // 30, 60, 90
  language: 'en' | 'bn';
  theme: 'light' | 'dark' | 'system';
}

export type ActivityEventType = 'app_usage' | 'connection_change' | 'safety_alert' | 'permission_change';

export interface ActivityEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  childName: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  severity?: AlertSeverity;
  metadata?: {
    app?: string;
    durationMinutes?: number;
    connectionStatus?: 'online' | 'offline';
    permissionName?: string;
    permissionGranted?: boolean;
    batteryLevel?: number;
  };
}

export type NotificationCategory = 'connection' | 'safety' | 'limit' | 'pairing' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  type: 
    | 'device_connected' 
    | 'device_disconnected' 
    | 'safety_alert' 
    | 'screen_time_limit' 
    | 'pairing_request' 
    | 'pairing_approved'
    | 'keyword_match'
    | 'permission_change'
    | 'offline_sync';
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  priority: NotificationPriority;
  deviceId?: string;
  deviceName?: string;
  childName?: string;
  actionPage?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  pushedToBrowser?: boolean;
}

