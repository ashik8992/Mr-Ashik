import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  createDeviceConnectionNotification,
  createScreenTimeLimitNotification,
  createSafetyAlertNotification,
  createPairingRequestNotification,
} from './notificationSystem.ts';
import { AppNotification, SafetyAlert } from '../types/index.ts';

test('filterNotifications filters by category, unreadOnly, and search query', () => {
  const sampleNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      category: 'connection',
      type: 'device_connected',
      title: "Liam's Pixel 8 Connected",
      message: 'Device is online.',
      timestamp: '2026-10-23T10:00:00Z',
      read: false,
      priority: 'low',
      deviceName: "Liam's Pixel 8",
    },
    {
      id: 'notif-2',
      category: 'safety',
      type: 'safety_alert',
      title: 'Restricted App Accessed',
      message: 'Casino application blocked.',
      timestamp: '2026-10-23T11:00:00Z',
      read: true,
      priority: 'high',
      deviceName: "Noah's Galaxy S23",
    },
    {
      id: 'notif-3',
      category: 'limit',
      type: 'screen_time_limit',
      title: 'Daily Screen Limit Reached',
      message: 'Reached 180 minutes limit.',
      timestamp: '2026-10-23T12:00:00Z',
      read: false,
      priority: 'high',
      deviceName: "Liam's Pixel 8",
    },
  ];

  // Test category filter
  const connOnly = filterNotifications(sampleNotifications, { category: 'connection' });
  assert.equal(connOnly.length, 1);
  assert.equal(connOnly[0].id, 'notif-1');

  // Test unreadOnly filter
  const unreadOnly = filterNotifications(sampleNotifications, { unreadOnly: true });
  assert.equal(unreadOnly.length, 2);
  assert.ok(unreadOnly.every((n) => !n.read));

  // Test search filter
  const searchResults = filterNotifications(sampleNotifications, { search: 'casino' });
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 'notif-2');

  // Test sorted newest first
  const allSorted = filterNotifications(sampleNotifications);
  assert.equal(allSorted[0].id, 'notif-3'); // 12:00:00Z
  assert.equal(allSorted[2].id, 'notif-1'); // 10:00:00Z
});

test('getUnreadCount returns correct unread count', () => {
  const list: AppNotification[] = [
    { id: '1', category: 'connection', type: 'device_connected', title: 'A', message: 'M', timestamp: '', read: false, priority: 'low' },
    { id: '2', category: 'connection', type: 'device_connected', title: 'B', message: 'M', timestamp: '', read: true, priority: 'low' },
    { id: '3', category: 'safety', type: 'safety_alert', title: 'C', message: 'M', timestamp: '', read: false, priority: 'high' },
  ];
  assert.equal(getUnreadCount(list), 2);
});

test('markNotificationAsRead and markAllNotificationsAsRead update read flags correctly', () => {
  const list: AppNotification[] = [
    { id: '1', category: 'connection', type: 'device_connected', title: 'A', message: 'M', timestamp: '', read: false, priority: 'low' },
    { id: '2', category: 'connection', type: 'device_connected', title: 'B', message: 'M', timestamp: '', read: false, priority: 'low' },
  ];

  const singleRead = markNotificationAsRead(list, '1');
  assert.equal(singleRead[0].read, true);
  assert.equal(singleRead[1].read, false);

  const allRead = markAllNotificationsAsRead(list);
  assert.equal(allRead[0].read, true);
  assert.equal(allRead[1].read, true);
});

test('removeNotification removes item by id', () => {
  const list: AppNotification[] = [
    { id: '1', category: 'connection', type: 'device_connected', title: 'A', message: 'M', timestamp: '', read: false, priority: 'low' },
    { id: '2', category: 'safety', type: 'safety_alert', title: 'B', message: 'M', timestamp: '', read: false, priority: 'low' },
  ];
  const updated = removeNotification(list, '1');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, '2');
});

test('createDeviceConnectionNotification builds correct online vs offline notifications', () => {
  const device = { id: 'dev-001', name: "Liam's Pixel 8", childName: 'Liam' };

  const onlineNotif = createDeviceConnectionNotification(device, 'online', { batteryLevel: 88 });
  assert.equal(onlineNotif.category, 'connection');
  assert.equal(onlineNotif.type, 'device_connected');
  assert.ok(onlineNotif.title.includes("Liam's Pixel 8 Connected"));
  assert.ok(onlineNotif.message.includes('88%'));
  assert.equal(onlineNotif.priority, 'low');
  assert.equal(onlineNotif.actionPage, 'deviceDetails');

  const offlineNotif = createDeviceConnectionNotification(device, 'offline', { reason: 'Heartbeat missed for >15m' });
  assert.equal(offlineNotif.category, 'connection');
  assert.equal(offlineNotif.type, 'device_disconnected');
  assert.ok(offlineNotif.title.includes('Disconnected / Offline'));
  assert.equal(offlineNotif.priority, 'high');
  assert.equal(offlineNotif.actionPage, 'offlineHistory');
});

test('createScreenTimeLimitNotification computes overage and sets high priority', () => {
  const device = { id: 'dev-002', name: "Noah's Galaxy S23", childName: 'Noah' };
  const notif = createScreenTimeLimitNotification(device, 240, 180);

  assert.equal(notif.category, 'limit');
  assert.equal(notif.type, 'screen_time_limit');
  assert.ok(notif.message.includes('Allowance of 180m reached (240m recorded, +60m over)'));
  assert.equal(notif.priority, 'high');
  assert.equal(notif.actionPage, 'screenTime');
});

test('createSafetyAlertNotification maps alert severity to notification priority', () => {
  const alert: SafetyAlert = {
    id: 'alt-99',
    deviceId: 'dev-003',
    deviceName: "Oliver's Xiaomi",
    type: 'keyword_match',
    title: 'Suspicious Search Term Flagged',
    message: 'Monitored keyword "gambling" was detected in browser navigation.',
    severity: 'critical',
    timestamp: new Date().toISOString(),
    resolved: false,
    matchedKeyword: 'gambling',
  };

  const notif = createSafetyAlertNotification(alert);
  assert.equal(notif.category, 'safety');
  assert.equal(notif.priority, 'urgent');
  assert.equal(notif.type, 'keyword_match');
  assert.ok(notif.title.includes('Suspicious Search Term Flagged'));
  assert.equal(notif.actionPage, 'safetyAlerts');
});

test('createPairingRequestNotification structures urgent pairing approval request', () => {
  const notif = createPairingRequestNotification('SAF-8821', 'Google Pixel 9', 'Emma');
  assert.equal(notif.category, 'pairing');
  assert.equal(notif.priority, 'urgent');
  assert.ok(notif.title.includes('New Pairing Request: Google Pixel 9'));
  assert.ok(notif.message.includes('SAF-8821'));
  assert.ok(notif.message.includes('Emma'));
});
