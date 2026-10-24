import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  Lock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { ParentAccount } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { purgeDataOnServer } from '../services/api.ts';

interface PrivacyDataViewProps {
  account: ParentAccount;
  onUpdateAccount: (updated: Partial<ParentAccount>) => void;
  lang: Language;
}

export const PrivacyDataView: React.FC<PrivacyDataViewProps> = ({
  account,
  onUpdateAccount,
  lang,
}) => {
  const t = translations[lang];
  const [retentionDays, setRetentionDays] = useState(account.retentionDays || 60);
  const [purgeSuccess, setPurgeSuccess] = useState('');

  const handleUpdateRetention = (days: number) => {
    setRetentionDays(days);
    onUpdateAccount({ retentionDays: days });
  };

  const handlePurge = async (target: 'location' | 'usage' | 'all') => {
    const res = await purgeDataOnServer(target);
    setPurgeSuccess(`Purge confirmed: ${res.message}`);
    setTimeout(() => setPurgeSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.nav.privacy}</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Zero-spyware pledge, GDPR & COPPA compliant retention policies, and permanent data deletion controls
        </p>
      </div>

      {purgeSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{purgeSuccess}</span>
        </div>
      )}

      {/* Strict Privacy Shield Commitments */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
            Child Privacy & Protection Charter (Section 15 Policy)
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Safe Web & App is engineered as a responsible parental aid tool, strictly abiding by Google Play Families Policy and international COPPA regulations. We guarantee:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-rose-500 block">✖ Zero Keystroke Logging</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              We never record keyboard inputs, passwords, credit cards, or text typed in any field.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-rose-500 block">✖ Zero Message Content Ingestion</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Private chats, SMS, WhatsApp conversations, and personal emails are never read or stored.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">✔ Transparent Screen Capture Only</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live screen streaming requires child explicit prompt approval per session and displays an Android status indicator.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">✔ TLS / AES-256 Encryption</span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All telemetry, heartbeat records, and streaming signaling are encrypted in transit and at rest.
            </p>
          </div>
        </div>
      </div>

      {/* Retention Period Setting */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Data Retention Period</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically purge historical location pings and app usage events older than the selected threshold.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
            {retentionDays} Days Retention
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => handleUpdateRetention(days)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                retentionDays === days
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Permanent Deletion & Purge Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <Trash2 className="w-5 h-5" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">
            Permanent Data Purge & Account Deletion
          </h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Exercise your GDPR / COPPA Right to be Forgotten. Purging permanently removes recorded history from our databases.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handlePurge('location')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            Purge All Location History
          </button>
          <button
            onClick={() => handlePurge('usage')}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700"
          >
            Purge All App Usage Records
          </button>
          <button
            onClick={() => handlePurge('all')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Purge Entire Account & Reset Workspace
          </button>
        </div>
      </div>

    </div>
  );
};
