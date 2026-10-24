import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Globe,
  Sun,
  Moon,
  Laptop,
  Radio,
  Lock,
  Bell,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations.ts';
import { ParentAccount } from '../types/index.ts';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  account: ParentAccount;
  activeDeviceCount: number;
  maxDevices: number;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
  onOpenOnboarding: () => void;
  unreadNotificationCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  account,
  activeDeviceCount,
  maxDevices,
  simulatorOpen,
  setSimulatorOpen,
  onOpenOnboarding,
  unreadNotificationCount = 0,
  onOpenNotifications,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t.appTitle}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Center / Stats: Active Devices: 7/10 */}
        <div className="hidden md:flex items-center gap-3 bg-slate-100 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.activeDevicesCount}:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {activeDeviceCount}/{maxDevices}
            </span>
          </div>
          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeDeviceCount >= maxDevices
                  ? 'bg-amber-500'
                  : 'bg-indigo-600 dark:bg-indigo-500'
              }`}
              style={{ width: `${(activeDeviceCount / maxDevices) * 100}%` }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Setup Guide / Onboarding Launcher */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all shadow-2xs"
            title="Launch 4-Step Parent Onboarding Wizard"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Setup Wizard</span>
          </button>

          {/* Android Companion Simulator Toggle Button */}
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
              simulatorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
            title="Open Interactive Child Android Phone Simulator"
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span className="hidden lg:inline">
              {simulatorOpen ? t.closeSimulator : t.openSimulator}
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Language Switcher (EN / বাংলা) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                lang === 'bn'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Bengali"
            >
              BN (Bengali)
            </button>
          </div>

          {/* Notification Center Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Open Notification Center"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-extrabold ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              if (theme === 'light') setTheme('dark');
              else if (theme === 'dark') setTheme('system');
              else setTheme('light');
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title={`Current theme: ${theme}. Click to switch.`}
          >
            {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
            {theme === 'system' && <Laptop className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Parent User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img
              src={account.avatarUrl}
              alt={account.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {account.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                {account.email}
              </p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
