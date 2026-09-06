import React, { useState } from 'react';
import { PortalSettings } from '../../types';
import {
  X,
  Settings,
  Save,
  CheckCircle2,
  Trash2,
  Building,
  Clock,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PortalSettings;
  onSaveSettings: (settings: PortalSettings) => void;
  onResetAllData: () => void;
  onPopulateFullRoster: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetAllData,
  onPopulateFullRoster,
}: SettingsModalProps) {
  const [organizationName, setOrganizationName] = useState(settings.organizationName);
  const [defaultTargetRtoMinutes, setDefaultTargetRtoMinutes] = useState(settings.defaultTargetRtoMinutes);
  const [nearRtoThresholdPercent, setNearRtoThresholdPercent] = useState(settings.nearRtoThresholdPercent);
  const [auditMode, setAuditMode] = useState(settings.auditMode);
  const [allowOverlappingEvents, setAllowOverlappingEvents] = useState(settings.allowOverlappingEvents);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      organizationName,
      defaultTargetRtoMinutes: Number(defaultTargetRtoMinutes),
      nearRtoThresholdPercent: Number(nearRtoThresholdPercent),
      auditMode,
      allowOverlappingEvents,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] rounded-xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Portal Configuration &amp; Settings</h2>
              <p className="text-xs text-slate-400">Customize SLA thresholds, organization defaults, and persistence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs text-slate-300">
          {savedSuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Settings saved successfully!</span>
            </div>
          )}

          {/* Org Name */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Organization / Enterprise Name
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Enterprise Cloud Financial Inc."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-semibold text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Target RTO */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Default Target RTO (Minutes)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  required
                  value={defaultTargetRtoMinutes}
                  onChange={(e) => setDefaultTargetRtoMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-bold font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Near RTO Warning Threshold */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Near RTO Warning Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="99"
                required
                value={nearRtoThresholdPercent}
                onChange={(e) => setNearRtoThresholdPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-bold font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">Triggers amber badge when actual RTO &ge; threshold (e.g. 80%)</p>
            </div>
          </div>

          {/* Audit Mode Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200">Strict Audit Evidence Enforcement</span>
              <p className="text-[11px] text-slate-400">Flag applications missing screenshots as incomplete</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={auditMode}
                onChange={(e) => setAuditMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Data Reset & Roster Generation Box */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">
              Data Management &amp; Population
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Load standard 20-application enterprise dataset?')) {
                    onPopulateFullRoster();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition-colors cursor-pointer"
              >
                Load Standard 20 Applications
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all portal data to initial sample state? This clears custom entries.')) {
                    onResetAllData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Portal Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
