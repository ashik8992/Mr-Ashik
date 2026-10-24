import React from 'react';
import {
  UserCog,
  Mail,
  Shield,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ParentAccount, Device } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';

interface AccountSettingsViewProps {
  account: ParentAccount;
  devices: Device[];
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  onUpdateAccount: (updated: Partial<ParentAccount>) => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  account,
  devices,
  lang,
  setLang,
  theme,
  setTheme,
  onUpdateAccount,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <UserCog className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.nav.settings}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Google authenticated Parent Account, workspace device quotas, and interface localization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Parent Google Profile */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-500" />
            <span>Google Authentication Profile</span>
          </h2>

          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
            <img
              src={account.avatarUrl}
              alt={account.name}
              className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {account.name}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Verified Google OAuth
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {account.email}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Workspace ID: {account.id}
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>One primary Parent Account per workspace enforced. No cross-account data leakage.</span>
          </div>
        </div>

        {/* 10-Device Limit Quota */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>Workspace Device Allocation</span>
            </h2>
            <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Active Devices: {devices.length}/10
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Parent Accounts are strictly entitled to connect and manage up to 10 active Android companion devices simultaneously.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Slots Used: {devices.length}</span>
              <span className="text-slate-400">Available: {10 - devices.length}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(devices.length / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Total paired devices:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{devices.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Online devices:</span>
              <span className="font-bold text-emerald-500">
                {devices.filter((d) => d.status === 'online').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Offline devices:</span>
              <span className="font-bold text-amber-500">
                {devices.filter((d) => d.status === 'offline').length}
              </span>
            </div>
          </div>
        </div>

        {/* Localization & Preferences */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Language & Localization</span>
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setLang('en');
                onUpdateAccount({ language: 'en' });
              }}
              className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                lang === 'en'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
              }`}
            >
              English (US / Global)
            </button>
            <button
              onClick={() => {
                setLang('bn');
                onUpdateAccount({ language: 'bn' });
              }}
              className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                lang === 'bn'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
              }`}
            >
              বাংলা (Bengali)
            </button>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Theme Preference</span>
          </h2>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'system', label: 'System Theme', icon: Laptop },
            ].map((th) => {
              const Icon = th.icon;
              return (
                <button
                  key={th.id}
                  onClick={() => {
                    setTheme(th.id as any);
                    onUpdateAccount({ theme: th.id as any });
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    theme === th.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{th.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
