import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeOfflineEvents, processOfflineSyncBatch } from './offlineSync.ts';
import { OfflineSyncEvent } from '../types/index.ts';

test('mergeOfflineEvents deduplicates events with identical eventIds', () => {
  const existingEvents: OfflineSyncEvent[] = [
    {
      eventId: 'evt-001',
      eventType: 'app_usage',
      timestamp: '2026-10-23T10:00:00.000Z',
      summary: 'YouTube Kids 30m',
    },
    {
      eventId: 'evt-002',
      eventType: 'location_update',
      timestamp: '2026-10-23T10:15:00.000Z',
      summary: 'Central Library',
    },
  ];

  const incomingEvents: OfflineSyncEvent[] = [
    {
      eventId: 'evt-002', // duplicate
      eventType: 'location_update',
      timestamp: '2026-10-23T10:15:00.000Z',
      summary: 'Central Library duplicate',
    },
    {
      eventId: 'evt-003', // brand new
      eventType: 'permission_change',
      timestamp: '2026-10-23T10:30:00.000Z',
      summary: 'Location permission granted',
    },
  ];

  const result = mergeOfflineEvents(existingEvents, incomingEvents);
  assert.equal(result.addedCount, 1);
  assert.equal(result.duplicateCount, 1);
  assert.equal(result.merged.length, 3);
  // Should sort newest first: evt-003 (10:30) -> evt-002 (10:15) -> evt-001 (10:00)
  assert.equal(result.merged[0].eventId, 'evt-003');
  assert.equal(result.merged[1].eventId, 'evt-002');
  assert.equal(result.merged[2].eventId, 'evt-001');
});

test('processOfflineSyncBatch generates verified batch receipt with idempotent counts', () => {
  const existing: OfflineSyncEvent[] = [];
  const incoming: OfflineSyncEvent[] = [
    {
      eventId: 'sync-101',
      eventType: 'heartbeat',
      timestamp: new Date().toISOString(),
      summary: 'Device woke up from sleep',
    },
  ];

  const result = processOfflineSyncBatch('dev-test-1', incoming, existing);
  assert.ok(result.batch.batchId.startsWith('BATCH-'));
  assert.equal(result.batch.recordsCount, 1);
  assert.equal(result.batch.status, 'synced');
  assert.equal(result.addedCount, 1);
  assert.equal(result.duplicateCount, 0);
});
