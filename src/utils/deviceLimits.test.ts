import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDeviceLimit, evaluateDeviceConnection, isLocationStale, MAX_DEVICES_PER_PARENT } from './deviceLimits.ts';
import { generatePairingCode, isPairingCodeValid, PAIRING_CODE_TTL_MS } from './pairing.ts';

test('device limits enforce max 10 active devices', () => {
  assert.equal(MAX_DEVICES_PER_PARENT, 10);

  const sevenDevices = checkDeviceLimit(7);
  assert.equal(sevenDevices.allowed, true);
  assert.equal(sevenDevices.remainingSlots, 3);
  assert.equal(sevenDevices.formattedDisplay, 'Active Devices: 7/10');

  const nineDevices = checkDeviceLimit(9);
  assert.equal(nineDevices.allowed, true);
  assert.equal(nineDevices.remainingSlots, 1);

  const tenDevices = checkDeviceLimit(10);
  assert.equal(tenDevices.allowed, false);
  assert.equal(tenDevices.remainingSlots, 0);
  assert.equal(tenDevices.formattedDisplay, 'Active Devices: 10/10');

  const overflowDevices = checkDeviceLimit(11);
  assert.equal(overflowDevices.allowed, false);
  assert.equal(overflowDevices.remainingSlots, 0);
});

test('heartbeat connection evaluator distinguishes online vs offline', () => {
  const baseNow = 1700000000000;
  
  // 10 seconds ago -> online
  const recentHeartbeat = new Date(baseNow - 10000).toISOString();
  const onlineResult = evaluateDeviceConnection(recentHeartbeat, baseNow);
  assert.equal(onlineResult.isOnline, true);
  assert.match(onlineResult.statusLabel, /^Online — Connected/);

  // 90 seconds ago -> offline (>60s)
  const oldHeartbeat = new Date(baseNow - 90000).toISOString();
  const offlineResult = evaluateDeviceConnection(oldHeartbeat, baseNow);
  assert.equal(offlineResult.isOnline, false);
  assert.match(offlineResult.statusLabel, /^Offline — Last Seen/);
});

test('stale location checker flags locations older than 15 minutes', () => {
  const baseNow = 1700000000000;
  
  // 5 minutes ago -> fresh
  const freshLocation = new Date(baseNow - 5 * 60 * 1000).toISOString();
  assert.equal(isLocationStale(freshLocation, baseNow), false);

  // 20 minutes ago -> stale
  const oldLocation = new Date(baseNow - 20 * 60 * 1000).toISOString();
  assert.equal(isLocationStale(oldLocation, baseNow), true);
});

test('pairing code generator generates SAF-XXXX format and validates TTL', () => {
  const code = generatePairingCode();
  assert.match(code, /^SAF-\d{4}$/);

  const now = Date.now();
  const session = {
    code,
    createdAtMs: now,
    expiresAtMs: now + PAIRING_CODE_TTL_MS,
    claimed: false,
  };

  assert.equal(isPairingCodeValid(session, now), true);
  
  // Expired code
  assert.equal(isPairingCodeValid(session, now + PAIRING_CODE_TTL_MS + 1000), false);

  // Already claimed code
  assert.equal(isPairingCodeValid({ ...session, claimed: true }, now), false);
});
