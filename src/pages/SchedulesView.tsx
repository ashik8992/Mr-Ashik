import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  PlusCircle,
  Moon,
  GraduationCap,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { Device, DeviceSchedule } from '../types/index.ts';
import { Language, translations } from '../i18n/translations.ts';
import { loadSchedules, saveSchedules } from '../services/storage.ts';

interface SchedulesViewProps {
  devices: Device[];
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  lang: Language;
}

export const SchedulesView: React.FC<SchedulesViewProps> = ({
  devices,
  selectedDevice,
  onSelectDevice,
  lang,
}) => {
  const t = translations[lang];
  const [schedules, setSchedules] = useState<DeviceSchedule[]>(loadSchedules());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'bedtime' | 'school' | 'downtime'>('bedtime');
  const [newStartTime, setNewStartTime] = useState('21:00');
  const [newEndTime, setNewEndTime] = useState('07:00');

  const filtered = schedules.filter((s) => s.deviceId === selectedDevice.id);

  const toggleSchedule = (id: string) => {
    const updated = schedules.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setSchedules(updated);
    saveSchedules(updated);
  };

  const deleteSchedule = (id: string) => {
    const updated = schedules.filter((s) => s.id !== id);
    setSchedules(updated);
    saveSchedules(updated);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSch: DeviceSchedule = {
      id: `sch-${Date.now()}`,
      deviceId: selectedDevice.id,
      name: newName,
      type: newType,
      startTime: newStartTime,
      endTime: newEndTime,
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      enabled: true,
      blockApps: true,
    };

    const updated = [newSch, ...schedules];
    setSchedules(updated);
    saveSchedules(updated);
    setShowAddForm(false);
    setNewName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.nav.schedules}: {selectedDevice.name}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bedtime lockouts, study downtime, and scheduled application access rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDevice.id}
            onChange={(e) => {
              const d = devices.find((dev) => dev.id === e.target.value);
              if (d) onSelectDevice(d);
            }}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Schedule</span>
          </button>
        </div>
      </div>

      {/* Add Schedule Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddSchedule} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-300 dark:border-indigo-800 shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Create New Downtime Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Schedule Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Night Rest"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="bedtime">Bedtime Downtime</option>
                <option value="school">Study / Homework Hours</option>
                <option value="downtime">General Downtime</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Start Time</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            No active schedules configured for this device yet. Click "New Schedule" to add bedtime or study routines.
          </div>
        ) : (
          filtered.map((sch) => (
            <div
              key={sch.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    {sch.type === 'bedtime' ? (
                      <Moon className="w-4 h-4" />
                    ) : sch.type === 'school' ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sch.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {sch.type} routine
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSchedule(sch.id)}
                    className="text-indigo-600 dark:text-indigo-400"
                  >
                    {sch.enabled ? (
                      <ToggleRight className="w-6 h-6" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSchedule(sch.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Active Hours:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {sch.startTime} — {sch.endTime}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <span>Active on:</span>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <span
                    key={d}
                    className={`px-1.5 py-0.5 rounded-md ${
                      sch.days.includes(d as any)
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
