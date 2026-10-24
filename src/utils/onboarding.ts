export type OnboardingStep = 'welcome' | 'child_profile' | 'pairing' | 'permissions' | 'complete';

export interface OnboardingFormState {
  parentEmail: string;
  childName: string;
  childAge: number;
  deviceModel: string;
  supervisionMode: 'personal' | 'managed';
  pairingCode: string;
  pairingClaimed: boolean;
  permissionsAcknowledged: {
    usageAccess: boolean;
    backgroundLocation: boolean;
    mediaProjection: boolean;
    accessibility: boolean;
    overlay: boolean;
  };
}

export const ONBOARDING_STEPS: Array<{ id: OnboardingStep; title: string; subtitle: string }> = [
  { id: 'welcome', title: 'Parent Account', subtitle: 'Google Authentication & Privacy Guarantee' },
  { id: 'child_profile', title: 'Child Device Profile', subtitle: 'Device Mode & Supervision Policy' },
  { id: 'pairing', title: 'Secure Device Pairing', subtitle: 'Single-Use 6-Digit Linking Code' },
  { id: 'permissions', title: 'Android System Permissions', subtitle: 'Transparent Disclosures & Consent' },
  { id: 'complete', title: 'Protection Active', subtitle: 'Workspace Setup Complete' },
];

export function validateStepProgression(
  step: OnboardingStep,
  state: OnboardingFormState
): { canProceed: boolean; error?: string } {
  switch (step) {
    case 'welcome':
      if (!state.parentEmail || !state.parentEmail.includes('@')) {
        return { canProceed: false, error: 'Valid Google parent account email is required.' };
      }
      return { canProceed: true };
    case 'child_profile':
      if (!state.childName.trim()) {
        return { canProceed: false, error: 'Please enter child name.' };
      }
      if (state.childAge < 3 || state.childAge > 18) {
        return { canProceed: false, error: 'Child age must be between 3 and 18.' };
      }
      return { canProceed: true };
    case 'pairing':
      if (!state.pairingCode || !/^SAF-\d{4}$/.test(state.pairingCode)) {
        return { canProceed: false, error: 'Valid 6-digit pairing code is required.' };
      }
      return { canProceed: true };
    case 'permissions':
      // At minimum usage access & background location must be acknowledged
      if (!state.permissionsAcknowledged.usageAccess || !state.permissionsAcknowledged.backgroundLocation) {
        return { canProceed: false, error: 'Please acknowledge Usage Access and Background Location permissions.' };
      }
      return { canProceed: true };
    case 'complete':
      return { canProceed: true };
  }
}
