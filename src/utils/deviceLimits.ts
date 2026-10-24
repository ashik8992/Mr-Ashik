/**
 * Device limits and connection status calculation utilities.
 */

export const MAX_DEVICES_PER_PARENT = 10;
export const HEARTBEAT_OFFLINE_THRESHOLD_MS = 60 * 1000; // 60s without heartbeat => offline
export const STALE_LOCATION_THRESHOLD_MS = 15 * 60 * 1000; // 15 mins without location update => stale

export function checkDeviceLimit(currentCount: number): {
  allowed: boolean;
  activeCount: number;
  maxAllowed: number;
  remainingSlots: number;
  formattedDisplay: string;
} {
  const allowed = currentCount < MAX_DEVICES_PER_PARENT;
  const remaining = Math.max(0, MAX_DEVICES_PER_PARENT - currentCount);
  return {
    allowed,
    activeCount: currentCount,
    maxAllowed: MAX_DEVICES_PER_PARENT,
    remainingSlots: remaining,
    formattedDisplay: `Active Devices: ${currentCount}/${MAX_DEVICES_PER_PARENT}`,
  };
}

export function evaluateDeviceConnection(
  lastHeartbeatIso: string,
  nowMs: number = Date.now()
): {
  isOnline: boolean;
  statusLabel: string;
  lastSeenTimeFormatted: string;
} {
  const lastHeartbeatMs = new Date(lastHeartbeatIso).getTime();
  const elapsed = Math.max(0, nowMs - lastHeartbeatMs);
  const isOnline = elapsed <= HEARTBEAT_OFFLINE_THRESHOLD_MS;

  const date = new Date(lastHeartbeatMs);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isOnline) {
    return {
      isOnline: true,
      statusLabel: 'Online — Connected',
      lastSeenTimeFormatted: timeStr,
    };
  }

  return {
    isOnline: false,
    statusLabel: `Offline — Last Seen ${timeStr}`,
    lastSeenTimeFormatted: timeStr,
  };
}

export function isLocationStale(locationTimestampIso: string, nowMs: number = Date.now()): boolean {
  const locationMs = new Date(locationTimestampIso).getTime();
  return (nowMs - locationMs) > STALE_LOCATION_THRESHOLD_MS;
}
