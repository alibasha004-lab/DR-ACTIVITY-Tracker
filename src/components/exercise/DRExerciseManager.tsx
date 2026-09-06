import React, { useState } from 'react';
import {
  DRExerciseConfig,
  DRApplication,
} from '../../types';
import {
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Save,
  Activity,
} from 'lucide-react';

interface DRExerciseManagerProps {
  exerciseConfig: DRExerciseConfig;
  onUpdateConfig: (config: DRExerciseConfig) => void;
  applications: DRApplication[];
  onBatchStatusUpdate?: (status: 'Completed' | 'In Progress') => void;
}

export function DRExerciseManager({
  exerciseConfig,
  onUpdateConfig,
  applications,
}: DRExerciseManagerProps) {
  const [exerciseName, setExerciseName] = useState(exerciseConfig.exerciseName);
  const [exerciseDate, setExerciseDate] = useState(exerciseConfig.exerciseDate);
  const [startTime, setStartTime] = useState(exerciseConfig.startTime);
  const [endTime, setEndTime] = useState(exerciseConfig.endTime);
  const [drLocation, setDrLocation] = useState(exerciseConfig.drLocation);
  const [coordinator, setCoordinator] = useState(exerciseConfig.coordinator);
  const [status, setStatus] = useState(exerciseConfig.status);
  const [notes, setNotes] = useState(exerciseConfig.notes || '');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      exerciseName,
      exerciseDate,
      startTime,
      endTime,
      drLocation,
      coordinator,
      status,
      notes,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const completedCount = applications.filter((a) => a.activityStatus === 'Completed').length;
  const inProgressCount = applications.filter((a) => a.activityStatus === 'In Progress').length;
  const pendingCount = applications.filter((a) => a.activityStatus === 'Not Started').length;
  const failedCount = applications.filter((a) => a.activityStatus === 'Failed').length;
  const progressPercent = applications.length > 0 ? Math.round((completedCount / applications.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0f172a] text-white rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Drill Session</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">{exerciseConfig.exerciseName}</h2>
          <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {exerciseConfig.exerciseDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {exerciseConfig.startTime} – {exerciseConfig.endTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              {exerciseConfig.drLocation}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              {exerciseConfig.coordinator}
            </span>
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Exercise Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'In Progress'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                  : status === 'Completed'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {progressPercent}% Drill Completion ({completedCount}/{applications.length} Apps)
          </div>
        </div>
      </div>

      {/* Drill Progress Bar */}
      <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
          <span>Drill Execution Progress</span>
          <span>{completedCount} of {applications.length} Applications Restored</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${applications.length > 0 ? (completedCount / applications.length) * 100 : 0}%` }}
            title={`Completed: ${completedCount}`}
          />
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${applications.length > 0 ? (inProgressCount / applications.length) * 100 : 0}%` }}
            title={`In Progress: ${inProgressCount}`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${applications.length > 0 ? (failedCount / applications.length) * 100 : 0}%` }}
            title={`Failed: ${failedCount}`}
          />
        </div>
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-emerald-400 font-medium">🟢 {completedCount} Completed</span>
          <span className="text-blue-400 font-medium">🔵 {inProgressCount} In Progress</span>
          <span className="text-slate-400 font-medium">⚪ {pendingCount} Pending</span>
          <span className="text-rose-400 font-medium">🔴 {failedCount} Failed</span>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            DR Exercise Drill Configuration &amp; Parameters
          </h3>
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Exercise Saved Successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exercise Name */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Exercise Drill Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g. Annual DR Drill – 2026"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Overall Exercise Status */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Overall Exercise Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Exercise Date */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Exercise Date</label>
              <input
                type="date"
                value={exerciseDate}
                onChange={(e) => setExerciseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DR Location */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">DR Location / Site</label>
              <input
                type="text"
                value={drLocation}
                onChange={(e) => setDrLocation(e.target.value)}
                placeholder="e.g. Secondary Data Center / Cloud Region East"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Exercise Coordinator */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Exercise Coordinator</label>
              <input
                type="text"
                value={coordinator}
                onChange={(e) => setCoordinator(e.target.value)}
                placeholder="e.g. Alex Morgan (Resilience Lead)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Drill Objectives &amp; Executive Scope
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scope of drill, audit guidelines, critical failover procedures..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Exercise Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
