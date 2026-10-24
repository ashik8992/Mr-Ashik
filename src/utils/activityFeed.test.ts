import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sortActivityEventsChronological,
  filterActivityEvents,
  formatEventBadge,
} from './activityFeed.ts';
import { ActivityEvent } from '../types/index.ts';

test('sortActivityEventsChronological orders events newest first', () => {
  const events: ActivityEvent[] = [
    {
      id: '1',
      deviceId: 'dev-1',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      type: 'app_usage',
      title: 'YouTube Kids 30m',
      description: 'Used YouTube Kids',
      timestamp: '2026-10-23T10:00:00.000Z',
    },
    {
      id: '2',
      deviceId: 'dev-1',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      type: 'connection_change',
      title: 'Device Reconnected',
      description: 'Connected to home Wi-Fi',
      timestamp: '2026-10-23T10:30:00.000Z',
    },
    {
      id: '3',
      deviceId: 'dev-2',
      deviceName: "Aria's Galaxy Tab",
      childName: 'Aria',
      type: 'safety_alert',
      title: 'Limit Exceeded',
      description: 'Daily limit reached',
      timestamp: '2026-10-23T10:15:00.000Z',
    },
  ];

  const sorted = sortActivityEventsChronological(events);
  assert.equal(sorted[0].id, '2'); // 10:30
  assert.equal(sorted[1].id, '3'); // 10:15
  assert.equal(sorted[2].id, '1'); // 10:00
});

test('filterActivityEvents filters correctly by event type and deviceId', () => {
  const events: ActivityEvent[] = [
    {
      id: '1',
      deviceId: 'dev-001',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      type: 'app_usage',
      title: 'App used',
      description: '',
      timestamp: '2026-10-23T10:00:00.000Z',
    },
    {
      id: '2',
      deviceId: 'dev-002',
      deviceName: "Aria's Tab",
      childName: 'Aria',
      type: 'safety_alert',
      title: 'Alert',
      description: '',
      timestamp: '2026-10-23T10:05:00.000Z',
    },
    {
      id: '3',
      deviceId: 'dev-001',
      deviceName: "Liam's Pixel 8",
      childName: 'Liam',
      type: 'permission_change',
      title: 'Permission updated',
      description: '',
      timestamp: '2026-10-23T10:10:00.000Z',
    },
  ];

  // Filter by type: safety_alert
  const alertsOnly = filterActivityEvents(events, 'safety_alert');
  assert.equal(alertsOnly.length, 1);
  assert.equal(alertsOnly[0].id, '2');

  // Filter by device: dev-001
  const dev1Only = filterActivityEvents(events, 'all', 'dev-001');
  assert.equal(dev1Only.length, 2);

  // Filter by both
  const dev1Permissions = filterActivityEvents(events, 'permission_change', 'dev-001');
  assert.equal(dev1Permissions.length, 1);
  assert.equal(dev1Permissions[0].id, '3');
});

test('formatEventBadge provides distinct badge classes and labels', () => {
  const appBadge = formatEventBadge('app_usage');
  assert.equal(appBadge.label, 'App Usage');

  const connBadge = formatEventBadge('connection_change');
  assert.equal(connBadge.label, 'Connection');

  const alertBadge = formatEventBadge('safety_alert');
  assert.equal(alertBadge.label, 'Safety Alert');

  const permBadge = formatEventBadge('permission_change');
  assert.equal(permBadge.label, 'Permission');
});
