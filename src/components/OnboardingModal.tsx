import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Mail,
  Lock,
  QrCode,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  Cpu,
} from 'lucide-react';
import { Device, ParentAccount, DeviceMode } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { requestPairingCode } from '../services/api.ts';
import { ONBOARDING_STEPS, OnboardingStep, validateStepProgression } from '../utils/onboarding.ts';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ParentAccount;
  currentDeviceCount: number;
  onCompleteOnboarding: (newDevice: Device) => void;
  lang: Language;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  account,
  currentDeviceCount,
  onCompleteOnboarding,
  lang,
}) => {
  const t = translations[lang];

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [childName, setChildName] = useState('Leo');
  const [childAge, setChildAge] = useState(11);
  const [deviceModel, setDeviceModel] = useState('Google Pixel 8');
  const [supervisionMode, setSupervisionMode] = useState<DeviceMode>('personal');
  const [pairingCode, setPairingCode] = useState<string>('SAF-8492');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Permissions checklist state
  const [permissionsState, setPermissionsState] = useState({
    usageAccess: true,
    backgroundLocation: true,
    mediaProjection: true,
    accessibility: true,
    overlay: true,
  });

  // Fetch live code when entering pairing step
  useEffect(() => {
    if (currentStep === 'pairing') {
      setIsGeneratingCode(true);
      requestPairingCode(currentDeviceCount).then((res) => {
        if (res.code) setPairingCode(res.code);
        setIsGeneratingCode(false);
      });
    }
  }, [currentStep, currentDeviceCount]);

  if (!isOpen) return null;

  const currentStepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    setErrorMessage('');
    const validation = validateStepProgression(currentStep, {
      parentEmail: account.email,
      childName,
      childAge,
      deviceModel,
      supervisionMode,
      pairingCode,
      pairingClaimed: false,
      permissionsAcknowledged: permissionsState,
    });

    if (!validation.canProceed) {
      setErrorMessage(validation.error || 'Please check the required inputs.');
      return;
    }

    if (currentStep === 'welcome') setCurrentStep('child_profile');
    else if (currentStep === 'child_profile') setCurrentStep('pairing');
    else if (currentStep === 'pairing') setCurrentStep('permissions');
    else if (currentStep === 'permissions') setCurrentStep('complete');
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep === 'child_profile') setCurrentStep('welcome');
    else if (currentStep === 'pairing') setCurrentStep('child_profile');
    else if (currentStep === 'permissions') setCurrentStep('pairing');
    else if (currentStep === 'complete') setCurrentStep('permissions');
  };

  const handleFinish = () => {
    const newPairedDevice: Device = {
      id: `dev-${Date.now().toString().slice(-4)}`,
      name: `${childName}’s ${deviceModel.split(' ')[0]}`,
      model: deviceModel,
      androidVersion: 'Android 15 (Vanilla Ice Cream)',
      childName,
      childAge,
      mode: supervisionMode,
      status: 'online',
      batteryLevel: 92,
      isCharging: false,
      lastHeartbeat: new Date().toISOString(),
      lastSyncTime: new Date().toISOString(),
      lastLocation: {
        id: `loc-${Date.now()}`,
        deviceId: `dev-${Date.now().toString().slice(-4)}`,
        latitude: 23.7937,
        longitude: 90.4066,
        accuracyMeters: 6,
        timestamp: new Date().toISOString(),
        address: 'Gulshan 2, Dhaka, Bangladesh',
        isStale: false,
      },
      permissions: {
        usageAccess: permissionsState.usageAccess,
        backgroundLocation: permissionsState.backgroundLocation,
        mediaProjection: permissionsState.mediaProjection,
        accessibilityService: permissionsState.accessibility,
        overlayAlertWindow: permissionsState.overlay,
        ignoreBatteryOptimizations: true,
      },
      storageUsedGB: 28,
      totalStorageGB: 128,
      ramUsedGB: 3.8,
      totalRamGB: 8.0,
      dailyScreenTimeMinutes: 45,
      weeklyScreenTimeMinutes: 380,
      screenTimeLimitMinutes: 120,
      isLocked: false,
      pairingCode,
      pairedAt: new Date().toISOString(),
    };

    onCompleteOnboarding(newPairedDevice);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-emerald-400 border border-white/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">
                  Welcome to Safe Web & App v2.0
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Setup Wizard
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                4-step onboarding guide for parent authentication, secure pairing, and permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close setup wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-5 pb-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            {ONBOARDING_STEPS.slice(0, 4).map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={s.id} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPast
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                        {s.title}
                      </p>
                    </div>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: WELCOME & GOOGLE AUTH */}
          {currentStep === 'welcome' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Step 1: Parent Workspace & Google Authentication
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Your Parent Account has been securely provisioned with Google OAuth credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <img
                  src={account.avatarUrl}
                  alt={account.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {account.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Primary Workspace Owner
                    </span>
                  </div>
                  <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    {account.email}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Workspace Quota: Max 10 Supervised Android Devices (Current: {currentDeviceCount}/10)
                  </p>
                </div>
              </div>

              {/* Zero-Spyware Charter */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Google Play & COPPA Transparent Privacy Charter</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Safe Web & App is engineered purely for transparent child safety and healthy screen-time habits. We strictly never log private messaging chats, phone keystrokes, passwords, or hidden camera feeds.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: CHILD PROFILE & SUPERVISION MODE */}
          {currentStep === 'child_profile' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Step 2: Add Child Profile & Select Supervision Mode
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure the child's identity and choose the appropriate Android enforcement model.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Child's First Name
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Leo"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Child's Age
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="18"
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Android Device Model
                </label>
                <select
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Google Pixel 8">Google Pixel 8 (Android 15)</option>
                  <option value="Samsung Galaxy S24">Samsung Galaxy S24 (Android 14)</option>
                  <option value="Samsung Galaxy Tab S9">Samsung Galaxy Tab S9 (Tablet)</option>
                  <option value="Motorola Moto G84">Motorola Moto G84 (Android 14)</option>
                  <option value="OnePlus 12">OnePlus 12 (Android 14)</option>
                </select>
              </div>

              {/* Supervision Mode Selection */}
              <div className="space-y-2 pt-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Supervision Policy Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSupervisionMode('personal')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      supervisionMode === 'personal'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Personal Android Mode
                      </span>
                      {supervisionMode === 'personal' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Standard installation without root or factory reset. Uses normal Android Accessibility & Usage Access permissions.
                    </p>
                  </div>

                  <div
                    onClick={() => setSupervisionMode('managed')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      supervisionMode === 'managed'
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Managed Android Mode
                      </span>
                      {supervisionMode === 'managed' && (
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Enterprise Device Owner policy for tamper-proof lockdown, strict uninstall prevention, and mandatory app blocking.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SECURE DEVICE PAIRING */}
          {currentStep === 'pairing' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Step 3: Secure Device Pairing
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Launch the Safe Web Companion APK on {childName}’s device and enter this short-lived pairing code.
                </p>
              </div>

              {/* Live Pairing Code Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-850 border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-center space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Single-Use Pairing Code (Valid 15 Minutes)
                </span>

                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  {isGeneratingCode ? 'Generating...' : pairingCode}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-50"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>
                  Tip: In our preview environment, you can also use the interactive <strong>Android Companion Phone emulator</strong> on the right to simulate pairing instantly.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: PERMISSIONS DISCLOSURE & GRANTING */}
          {currentStep === 'permissions' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Step 4: Android Companion Permissions Checklist
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm the authorized permissions required by Android OS for transparent monitoring:
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'usageAccess',
                    title: 'Usage Access (PACKAGE_USAGE_STATS)',
                    desc: 'Enables monitoring of screen time durations and app-by-app analytics without reading private data.',
                    val: permissionsState.usageAccess,
                  },
                  {
                    id: 'backgroundLocation',
                    title: 'Background Location (ACCESS_BACKGROUND_LOCATION)',
                    desc: 'Enables safe periodic location check-ins so last known location is preserved when offline.',
                    val: permissionsState.backgroundLocation,
                  },
                  {
                    id: 'mediaProjection',
                    title: 'Transparent MediaProjection Screen Capture',
                    desc: 'Allows live screen streaming ONLY after explicit child approval on device per session with persistent notification.',
                    val: permissionsState.mediaProjection,
                  },
                  {
                    id: 'accessibility',
                    title: 'Accessibility Service (BIND_ACCESSIBILITY_SERVICE)',
                    desc: 'Detects launch of restricted applications and enforces scheduled bedtimes.',
                    val: permissionsState.accessibility,
                  },
                  {
                    id: 'overlay',
                    title: 'Display Over Other Apps (SYSTEM_ALERT_WINDOW)',
                    desc: 'Renders time limit expired reminder overlays over blocked apps.',
                    val: permissionsState.overlay,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      setPermissionsState((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id as keyof typeof prev],
                      }))
                    }
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 cursor-pointer hover:border-slate-300"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={item.val}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-indigo-600 shrink-0 mt-1 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: ONBOARDING COMPLETE */}
          {currentStep === 'complete' && (
            <div className="text-center py-4 space-y-4 text-xs">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Device Setup & Protection Ready!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  <strong>{childName}’s {deviceModel}</strong> has been linked to your Parent Admin workspace ({account.email}).
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Child:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{childName} (Age {childAge})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Device Model:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{deviceModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Supervision Mode:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                    {supervisionMode} Android Mode
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Live Status:</span>
                  <span className="text-emerald-500 font-bold">Online & Synchronized</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {currentStep !== 'welcome' && currentStep !== 'complete' ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep !== 'complete' ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all ml-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Parent Dashboard</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
