import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  PieChart,
  BarChart3,
  Moon,
  ChevronRight,
  Smartphone,
  Info,
} from 'lucide-react';
import { Device, SafetyAlert } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { INITIAL_APP_USAGE, loadAlerts } from '../services/storage.ts';
import {
  calculatePeakUsageHours,
  calculateCategoryCorrelations,
  calculateAppUsageTrends,
  summarizeSafetyAlerts,
  generateReportsCSV,
} from '../utils/reportAnalytics.ts';

interface ReportsViewProps {
  devices: Device[];
  lang: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ devices, lang }) => {
  const t = translations[lang];
  const [reportRange, setReportRange] = useState<'daily' | 'weekly'>('weekly');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  const [alerts] = useState<SafetyAlert[]>(() => loadAlerts());

  const targetDevices = selectedDeviceId === 'all'
    ? devices
    : devices.filter((d) => d.id === selectedDeviceId);

  // Cumulative screen time
  const totalMinutes = targetDevices.reduce(
    (acc, d) => acc + (reportRange === 'daily' ? d.dailyScreenTimeMinutes : d.weeklyScreenTimeMinutes),
    0
  );

  // App dataset for selected target
  const sampleDevice = targetDevices[0] || devices[0];
  const appData = INITIAL_APP_USAGE[sampleDevice.id] || INITIAL_APP_USAGE['dev-001'];
  
  // Analytics calculations
  const peakAnalysis = calculatePeakUsageHours(appData.hourlyUsage);
  const categoryCorrelations = calculateCategoryCorrelations(appData.apps);
  const appTrends = calculateAppUsageTrends(appData.apps);
  const alertSummary = summarizeSafetyAlerts(
    selectedDeviceId === 'all' ? alerts : alerts.filter((a) => a.deviceId === selectedDeviceId)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = generateReportsCSV(targetDevices, reportRange);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safe-web-report-${reportRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const reportData = {
      reportType: reportRange,
      generatedAt: new Date().toISOString(),
      parentAccount: 'ashik.cvc.official@gmail.com',
      deviceScope: selectedDeviceId,
      totalDevices: targetDevices.length,
      screenTimeMinutes: totalMinutes,
      peakHoursAnalysis: peakAnalysis,
      categoryCorrelations,
      appTrends,
      safetyAlertSummary: alertSummary,
      devicesSummary: targetDevices.map((d) => ({
        id: d.id,
        name: d.name,
        child: d.childName,
        screenTimeMinutes: reportRange === 'daily' ? d.dailyScreenTimeMinutes : d.weeklyScreenTimeMinutes,
        status: d.status,
        battery: d.batteryLevel,
        lastLocation: d.lastLocation.address,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safe-web-audit-${reportRange}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.nav.reports}: Comprehensive Analytics</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              v2.0 Advanced Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Usage trend curves, peak hours identification, app category correlations, and safety alert summaries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs">
            <button
              onClick={() => setReportRange('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                reportRange === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Report
            </button>
            <button
              onClick={() => setReportRange('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                reportRange === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly Report
            </button>
          </div>

          {/* Device selector */}
          <select
            value={selectedDeviceId}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Supervised Devices ({devices.length})</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.childName})
              </option>
            ))}
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            title="Download CSV Table"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            title="Download Full Audit JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Screen Time Volume</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-8.4% vs previous {reportRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Peak Usage Window</span>
          <div className="mt-2 text-xl font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
            {peakAnalysis.peakWindowFormatted}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Highest: {peakAnalysis.peakMinutes}m at {peakAnalysis.peakHourFormatted}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Late Night Screen Time</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {peakAnalysis.bedtimeConflictMinutes}m
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active after 9:00 PM curfew</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Safety Alert Resolution</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {alertSummary.resolutionRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {alertSummary.resolvedCount} of {alertSummary.totalAlerts} incidents cleared
          </div>
        </div>
      </div>

      {/* Row 2: Trend Analysis & Peak Usage Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. App Usage Trends Over Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                App Usage Trend Analysis
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              vs Previous Period
            </span>
          </div>

          <div className="space-y-3">
            {appTrends.map((app) => (
              <div
                key={app.packageName}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {app.appName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {app.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Prior: {app.previousMinutes}m → Current: {app.currentMinutes}m
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                      app.trend === 'up'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : app.trend === 'down'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {app.trend === 'up' ? '+' : ''}
                    {app.changePercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Peak Usage Hours 24h Heatmap */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Peak Usage Hours (24-Hour Distribution)
              </h2>
            </div>
            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Peak: {peakAnalysis.peakHourFormatted}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hourly activity timeline mapping when child devices are actively unlocked:
          </p>

          <div className="h-36 flex items-end gap-1.5 pt-4 pb-2 px-1">
            {appData.hourlyUsage.map((val, hour) => {
              const isPeak = hour === peakAnalysis.peakHour;
              const isLateNight = hour >= 21 || hour < 6;
              const heightPct = Math.min(100, Math.max(10, (val / (peakAnalysis.peakMinutes || 1)) * 100));

              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-24 rounded-t-md flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                          : isLateNight
                          ? 'bg-rose-400 dark:bg-rose-500'
                          : 'bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${hour}:00 — ${val} mins`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {hour % 4 === 0 ? `${hour}h` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Peak Window: {peakAnalysis.peakWindowFormatted}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              Late Curfew: {peakAnalysis.bedtimeConflictMinutes}m
            </span>
          </div>
        </div>

      </div>

      {/* Row 3: Category Correlations & Safety Alerts Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Screen Time vs App Category Correlations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Screen Time & Category Correlations
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Behavioral Insights
            </span>
          </div>

          <div className="space-y-3">
            {categoryCorrelations.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {cat.category}
                  </span>
                  <span className="font-mono text-slate-500">
                    {cat.totalMinutes}m ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Correlation: {cat.insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Safety Alerts Frequency & Type Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Safety Alerts Summary & Frequency
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              {alertSummary.totalAlerts} Incidents
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Critical</span>
              <span className="text-base font-extrabold text-rose-700 dark:text-rose-300">
                {alertSummary.bySeverity.critical}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
              <span className="text-[10px] uppercase font-bold text-orange-600 block">High</span>
              <span className="text-base font-extrabold text-orange-700 dark:text-orange-300">
                {alertSummary.bySeverity.high}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Medium</span>
              <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">
                {alertSummary.bySeverity.medium}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Low</span>
              <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">
                {alertSummary.bySeverity.low}
              </span>
            </div>
          </div>

          {/* Incident Type Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Incident Frequency by Category
            </span>
            {Object.entries(alertSummary.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center py-1">
                <span className="capitalize text-slate-700 dark:text-slate-300 font-medium">
                  {type.replace(/_/g, ' ')}
                </span>
                <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
                  {count} occurrences
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 4: Tabular Breakdown with Device Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <span>Supervised Device Usage & Policy Compliance Audit</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Export format: CSV / JSON
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {targetDevices.map((d) => (
            <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {d.name}
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                    {d.model}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Child: {d.childName} (Age {d.childAge}) • Mode: {d.mode === 'managed' ? 'Managed Android' : 'Personal Android'}
                </p>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="text-slate-400 text-[10px] block">Screen Time</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {Math.floor((reportRange === 'daily' ? d.dailyScreenTimeMinutes : d.weeklyScreenTimeMinutes) / 60)}h{' '}
                    {(reportRange === 'daily' ? d.dailyScreenTimeMinutes : d.weeklyScreenTimeMinutes) % 60}m
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Daily Allowance</span>
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {Math.floor(d.screenTimeLimitMinutes / 60)}h
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Last Known GPS</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[140px] block">
                    {d.lastLocation.address}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
