import React from 'react';
import {
  HelpCircle,
  Download,
  Terminal,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations.ts';

interface HelpSupportViewProps {
  lang: Language;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.nav.help}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Android companion APK setup manual, enterprise device owner guides, and Google Play compliance documentation
        </p>
      </div>

      {/* 3-Step Setup Guide */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-500" />
          <span>Setting Up Child Android Companion App (v2.0)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white">Download APK</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Install the lightweight Safe Web Companion APK directly on your child’s Android smartphone or tablet.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                Build: safe-companion-v2.0.apk (12.4 MB)
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white">Grant Authorized Permissions</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Open the app and grant Usage Access and Background Location when prompted by the Android OS setup wizard.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Transparent system disclosures
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white">Pair with Single-Use Code</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Enter the 6-digit code (e.g. SAF-4912) generated from this Parent Dashboard to link and authenticate.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-slate-400 font-mono">
                Code expires in 15 mins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Managed Device Mode (ADB Setup) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Managed Android Mode (Device Owner Enrollment)
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          For total tamper-resistance and strict hardware schedule lockouts, enroll the child’s device as a Managed Device using Android DevicePolicyManager via ADB:
        </p>

        <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
          <p className="text-slate-500"># 1. Connect phone via USB with USB Debugging enabled</p>
          <p className="text-emerald-400">adb devices</p>
          <p className="text-slate-500 mt-2"># 2. Provision Safe Web as Device Owner</p>
          <p className="text-purple-300">
            adb shell dpm set-device-owner com.safeweb.companion/.receiver.AdminReceiver
          </p>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Note: Managed Android Mode requires that no user accounts are registered on the device prior to command execution (typically after a factory reset).
        </p>
      </div>

      {/* Google Play Compliance */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Google Play Families Policy Compliance</span>
        </h2>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Safe Web & App strictly complies with Google Play’s Families Policy and Accessibility Services guidelines.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
            <li>Does not operate as covert stalkerware or hidden spyware.</li>
            <li>Prominently displays persistent foreground notifications during live screen capture.</li>
            <li>Restricts data collection exclusively to safety and parental management.</li>
            <li>Keystrokes, phone calls, and private messages are never intercepted.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};
