import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStepProgression, ONBOARDING_STEPS, OnboardingFormState } from './onboarding.ts';

test('onboarding steps progression validation enforces required fields', () => {
  const baseState: OnboardingFormState = {
    parentEmail: 'ashik.cvc.official@gmail.com',
    childName: 'Aiden',
    childAge: 11,
    deviceModel: 'Pixel 8',
    supervisionMode: 'personal',
    pairingCode: 'SAF-4819',
    pairingClaimed: false,
    permissionsAcknowledged: {
      usageAccess: true,
      backgroundLocation: true,
      mediaProjection: true,
      accessibility: true,
      overlay: true,
    },
  };

  // Welcome step
  assert.equal(validateStepProgression('welcome', baseState).canProceed, true);
  assert.equal(
    validateStepProgression('welcome', { ...baseState, parentEmail: '' }).canProceed,
    false
  );

  // Child profile step
  assert.equal(validateStepProgression('child_profile', baseState).canProceed, true);
  assert.equal(
    validateStepProgression('child_profile', { ...baseState, childName: '' }).canProceed,
    false
  );
  assert.equal(
    validateStepProgression('child_profile', { ...baseState, childAge: 2 }).canProceed,
    false
  );

  // Pairing step
  assert.equal(validateStepProgression('pairing', baseState).canProceed, true);
  assert.equal(
    validateStepProgression('pairing', { ...baseState, pairingCode: 'INVALID' }).canProceed,
    false
  );

  // Permissions step
  assert.equal(validateStepProgression('permissions', baseState).canProceed, true);
  assert.equal(
    validateStepProgression('permissions', {
      ...baseState,
      permissionsAcknowledged: { ...baseState.permissionsAcknowledged, usageAccess: false },
    }).canProceed,
    false
  );
});

test('onboarding defines 5 structured sequential phases', () => {
  assert.equal(ONBOARDING_STEPS.length, 5);
  assert.equal(ONBOARDING_STEPS[0].id, 'welcome');
  assert.equal(ONBOARDING_STEPS[1].id, 'child_profile');
  assert.equal(ONBOARDING_STEPS[2].id, 'pairing');
  assert.equal(ONBOARDING_STEPS[3].id, 'permissions');
  assert.equal(ONBOARDING_STEPS[4].id, 'complete');
});
