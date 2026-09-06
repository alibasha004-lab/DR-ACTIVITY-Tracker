import React from 'react';
import {
  Shield,
  PlusCircle,
  Zap,
  Menu,
  X,
  Printer,
  Sparkles,
  Settings,
} from 'lucide-react';
import { DRExerciseConfig, DRApplication, TabType } from '../../types';

interface HeaderProps {
  exerciseConfig: DRExerciseConfig;
  applications: DRApplication[];
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onNewApp: () => void;
  onOpenQuickRecorder: () => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  onGenerateRoster: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({
  exerciseConfig,
  applications,
  activeTab,
  onSelectTab,
  onNewApp,
  onOpenQuickRecorder,
  onOpenReport,
  onOpenSettings,
  onGenerateRoster,
  mobileMenuOpen,
  setMobileMenuOpen,
}: HeaderProps) {
  const completedCount = applications.filter((a) => a.activityStatus === 'Completed').length;
  const progressPercent = applications.length > 0 ? Math.round((completedCount / applications.length) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-[#020617] border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Mobile menu trigger & Portal Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onSelectTab('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/20 shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest hidden sm:inline">
                    Exercise: {exerciseConfig.exerciseName.split('–')[0] || 'Drill 2026'}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-slate-100 truncate tracking-tight">
                  DR Activity &amp; RTO Monitoring Portal
                </h1>
              </div>
            </div>
          </div>

          {/* DR Exercise Info & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Exercise Indicator */}
            <div
              onClick={() => onSelectTab('exercise')}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 -ml-4" />
              <div>
                <span className="font-semibold text-slate-200">{exerciseConfig.exerciseName}</span>
                <span className="text-slate-600 mx-1.5">•</span>
                <span className="text-emerald-400 font-mono">
                  {progressPercent}% Done ({completedCount}/{applications.length})
                </span>
              </div>
            </div>

            {/* Quick DR Recorder Button */}
            <button
              type="button"
              onClick={onOpenQuickRecorder}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shadow-xs cursor-pointer"
              title="Launch 9-Step DR Activity Recorder Wizard"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="hidden xs:inline">Quick DR Record</span>
              <span className="xs:hidden">Record</span>
            </button>

            {/* Add Application Button */}
            <button
              type="button"
              onClick={onNewApp}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Application</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* Generate DR Report Button */}
            <button
              type="button"
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Generate comprehensive DR report and print to PDF"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Audit Report</span>
            </button>

            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
              title="Portal Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
