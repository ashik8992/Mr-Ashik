/**
 * Pairing utilities for Safe Web & App
 * Generates short-lived, single-use pairing codes formatted as SAF-XXXX.
 */

export interface PairingCodeSession {
  code: string;
  createdAtMs: number;
  expiresAtMs: number;
  claimed: boolean;
  deviceId?: string;
}

export const PAIRING_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function generatePairingCode(): string {
  // Generate random 4-digit number (1000 - 9999)
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SAF-${num}`;
}

export function isPairingCodeValid(session: PairingCodeSession, nowMs: number = Date.now()): boolean {
  if (!session) return false;
  if (session.claimed) return false;
  if (nowMs > session.expiresAtMs) return false;
  return /^SAF-\d{4}$/.test(session.code);
}
