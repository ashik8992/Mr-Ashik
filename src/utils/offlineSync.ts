import { OfflineSyncBatch, OfflineSyncEvent } from '../types/index.ts';

/**
 * Deduplicates and merges new offline events into the known event list
 * based on unique eventId (idempotent synchronization).
 */
export function mergeOfflineEvents(
  existingEvents: OfflineSyncEvent[],
  incomingEvents: OfflineSyncEvent[]
): {
  merged: OfflineSyncEvent[];
  addedCount: number;
  duplicateCount: number;
} {
  const seenIds = new Set<string>(existingEvents.map((e) => e.eventId));
  const newUniqueEvents: OfflineSyncEvent[] = [];
  let duplicateCount = 0;

  for (const event of incomingEvents) {
    if (!event.eventId) continue;
    if (seenIds.has(event.eventId)) {
      duplicateCount++;
    } else {
      seenIds.add(event.eventId);
      newUniqueEvents.push(event);
    }
  }

  // Combine and sort by timestamp descending (newest first)
  const merged = [...newUniqueEvents, ...existingEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    merged,
    addedCount: newUniqueEvents.length,
    duplicateCount,
  };
}

/**
 * Creates an offline batch receipt confirming idempotent ingestion
 */
export function processOfflineSyncBatch(
  deviceId: string,
  incomingEvents: OfflineSyncEvent[],
  existingEvents: OfflineSyncEvent[]
): {
  batch: OfflineSyncBatch;
  updatedEvents: OfflineSyncEvent[];
  addedCount: number;
  duplicateCount: number;
} {
  const { merged, addedCount, duplicateCount } = mergeOfflineEvents(existingEvents, incomingEvents);
  
  const batch: OfflineSyncBatch = {
    batchId: `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    deviceId,
    receivedAt: new Date().toISOString(),
    recordsCount: addedCount,
    status: 'synced',
    events: incomingEvents,
  };

  return {
    batch,
    updatedEvents: merged,
    addedCount,
    duplicateCount,
  };
}
