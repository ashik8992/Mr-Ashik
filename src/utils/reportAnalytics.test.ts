import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePeakUsageHours,
  calculateCategoryCorrelations,
  calculateAppUsageTrends,
  summarizeSafetyAlerts,
  generateReportsCSV,
} from './reportAnalytics.ts';
import { SafetyAlert, Device } from '../types/index.ts';

test('calculatePeakUsageHours detects highest single hour and 3-hour window', () => {
  const hourly = new Array(24).fill(0);
  hourly[14] = 20; // 2:00 PM
  hourly[15] = 45; // 3:00 PM
  hourly[16] = 50; // 4:00 PM (peak)
  hourly[17] = 40; // 5:00 PM
  hourly[22] = 15; // 10:00 PM (bedtime conflict)

  const result = calculatePeakUsageHours(hourly);
  assert.equal(result.peakHour, 16);
  assert.equal(result.peakMinutes, 50);
  assert.equal(result.peakHourFormatted, '4:00 PM');
  assert.equal(result.peakWindowFormatted, '3:00 PM – 6:00 PM');
  assert.equal(result.bedtimeConflictMinutes, 15);
  assert.equal(result.totalDailyMinutes, 170);
});

test('calculateCategoryCorrelations groups apps, sorts descending, and assigns percentage', () => {
  const apps = [
    { appName: 'Khan Academy', category: 'Education', durationMinutes: 60 },
    { appName: 'Duolingo', category: 'Education', durationMinutes: 30 },
    { appName: 'Roblox', category: 'Games', durationMinutes: 90 },
    { appName: 'Messages', category: 'Social', durationMinutes: 20 },
  ];

  const categories = calculateCategoryCorrelations(apps);
  assert.equal(categories.length, 3);
  // Total = 200. Games = 90 (45%), Education = 90 (45%), Social = 20 (10%)
  assert.equal(categories[0].category, 'Education');
  assert.equal(categories[0].totalMinutes, 90);
  assert.equal(categories[0].percentage, 45);
  assert.ok(categories[0].insight.length > 0);
});

test('calculateAppUsageTrends detects percentage change and direction', () => {
  const apps = [
    { appName: 'Roblox', packageName: 'com.roblox', category: 'Games', durationMinutes: 50 },
    { appName: 'Duolingo', packageName: 'com.duolingo', category: 'Education', durationMinutes: 40 },
  ];

  const trends = calculateAppUsageTrends(apps);
  assert.equal(trends.length, 2);
  assert.equal(trends[0].appName, 'Roblox');
  assert.ok(['up', 'down', 'steady'].includes(trends[0].trend));
});

test('summarizeSafetyAlerts computes severity breakdown and resolution rate', () => {
  const alerts: SafetyAlert[] = [
    {
      id: '1',
      deviceId: 'dev-1',
      deviceName: 'Pixel',
      type: 'limit_reached',
      title: 'Limit Exceeded',
      message: '',
      severity: 'high',
      timestamp: new Date().toISOString(),
      resolved: true,
    },
    {
      id: '2',
      deviceId: 'dev-2',
      deviceName: 'Galaxy',
      type: 'device_offline',
      title: 'Offline',
      message: '',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      resolved: false,
    },
    {
      id: '3',
      deviceId: 'dev-1',
      deviceName: 'Pixel',
      type: 'missing_permissions',
      title: 'Permission Missing',
      message: '',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      resolved: true,
    },
  ];

  const summary = summarizeSafetyAlerts(alerts);
  assert.equal(summary.totalAlerts, 3);
  assert.equal(summary.resolvedCount, 2);
  assert.equal(summary.pendingCount, 1);
  assert.equal(summary.resolutionRate, 67); // 2/3 = 67%
  assert.equal(summary.bySeverity.high, 1);
  assert.equal(summary.bySeverity.medium, 2);
  assert.equal(summary.byType['limit_reached'], 1);
  assert.equal(summary.byType['device_offline'], 1);
});

test('generateReportsCSV produces valid comma-separated content with headers', () => {
  const sampleDevice: Device = {
    id: 'dev-test-1',
    name: "Emma's Phone",
    model: 'Galaxy A54',
    androidVersion: 'Android 14',
    childName: 'Emma',
    childAge: 10,
    mode: 'personal',
    status: 'online',
    batteryLevel: 85,
    isCharging: false,
    lastHeartbeat: new Date().toISOString(),
    lastSyncTime: new Date().toISOString(),
    lastLocation: {
      id: 'loc-1',
      deviceId: 'dev-test-1',
      latitude: 23.7,
      longitude: 90.4,
      accuracyMeters: 10,
      timestamp: new Date().toISOString(),
      address: 'Central Park, Dhaka',
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
    storageUsedGB: 30,
    totalStorageGB: 128,
    ramUsedGB: 4,
    totalRamGB: 8,
    dailyScreenTimeMinutes: 120,
    weeklyScreenTimeMinutes: 840,
    screenTimeLimitMinutes: 150,
    isLocked: false,
    pairedAt: '2026-09-01T00:00:00Z',
  };

  const csv = generateReportsCSV([sampleDevice], 'daily');
  assert.ok(csv.includes('Device ID,Device Name,Child Name'));
  assert.ok(csv.includes('"dev-test-1","Emma\'s Phone","Emma"'));
  assert.ok(csv.includes('120')); // daily minutes
});
