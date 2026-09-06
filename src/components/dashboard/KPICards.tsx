import React from 'react';
import {
  Server,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Timer,
  Target,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { DRApplication, PortalSettings } from '../../types';
import { formatDuration } from '../../utils/rtoCalculator';

interface KPICardsProps {
  applications: DRApplication[];
  settings: PortalSettings;
  onFilterClick?: (filterType: string, filterValue: string) => void;
}

export function KPICards({ applications, settings, onFilterClick }: KPICardsProps) {
  const total = applications.length;
  const completed = applications.filter((a) => a.activityStatus === 'Completed').length;
  const inProgress = applications.filter((a) => a.activityStatus === 'In Progress').length;
  const pending = applications.filter((a) => a.activityStatus === 'Not Started').length;
  const failed = applications.filter((a) => a.activityStatus === 'Failed').length;

  // Completed apps with valid RTO
  const completedWithRto = applications.filter(
    (a) => a.activityStatus === 'Completed' && a.actualRtoSeconds !== null
  );

  // Average RTO
  const totalRtoSeconds = completedWithRto.reduce(
    (acc, curr) => acc + (curr.actualRtoSeconds || 0),
    0
  );
  const avgRtoSeconds = completedWithRto.length > 0 ? Math.round(totalRtoSeconds / completedWithRto.length) : 0;
  const avgRtoFormatted = completedWithRto.length > 0 ? formatDuration(avgRtoSeconds) : '—';

  // RTO Compliance (% where actual RTO <= target RTO among completed)
  const compliantCount = completedWithRto.filter(
    (a) => a.actualRtoMinutes !== null && a.actualRtoMinutes <= a.targetRtoMinutes
  ).length;

  const breachedCount = completedWithRto.filter(
    (a) => a.actualRtoMinutes !== null && a.actualRtoMinutes > a.targetRtoMinutes
  ).length;

  const nearRtoCount = applications.filter((a) => a.rtoStatus === 'Near RTO').length;

  const compliancePercent =
    completedWithRto.length > 0
      ? Math.round((compliantCount / completedWithRto.length) * 100)
      : 100;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Applications */}
      <div
        onClick={() => onFilterClick?.('activityStatus', 'ALL')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-slate-700 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Registered Apps
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-colors">
            <Server className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-100">{total}</span>
          <span className="text-xs font-normal text-slate-500">/ 100 Units</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>Asset Inventory</span>
        </div>
      </div>

      {/* 2. Applications Completed */}
      <div
        onClick={() => onFilterClick?.('activityStatus', 'Completed')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-emerald-500/40 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            Completed
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-emerald-400">{completed}</span>
          <span className="text-xs font-normal text-slate-500">
            ({total > 0 ? Math.round((completed / total) * 100) : 0}% of drill)
          </span>
        </div>
        <div className="mt-2 text-xs text-emerald-400/90 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Recovery Verified</span>
        </div>
      </div>

      {/* 3. Applications In Progress */}
      <div
        onClick={() => onFilterClick?.('activityStatus', 'In Progress')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-blue-500/40 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">
            In Progress
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 animate-spin text-blue-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-blue-400">{inProgress}</span>
          <span className="text-xs font-normal text-slate-500">Active failover</span>
        </div>
        <div className="mt-2 text-xs text-blue-400/90 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          <span>Down Logged</span>
        </div>
      </div>

      {/* 4. Applications Failed */}
      <div
        onClick={() => onFilterClick?.('activityStatus', 'Failed')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-rose-500/40 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-rose-400 uppercase tracking-wider">
            Failed / Blocked
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-rose-400">{failed}</span>
          <span className="text-xs font-normal text-slate-500">
            {failed > 0 ? 'Requires attention' : 'Zero failures'}
          </span>
        </div>
        <div className="mt-2 text-xs text-rose-400/90 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Failover Halts</span>
        </div>
      </div>

      {/* 5. Applications Pending (Not Started) */}
      <div
        onClick={() => onFilterClick?.('activityStatus', 'Not Started')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-slate-700 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Pending Queue
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-200">{pending}</span>
          <span className="text-xs font-normal text-slate-500">In schedule</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
          <span>Awaiting Trigger</span>
        </div>
      </div>

      {/* 6. Average RTO Achievement */}
      <div
        onClick={() => onFilterClick?.('rtoStatus', 'ALL')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">
            Avg. RTO Achievement
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400 tracking-tight">
            {avgRtoFormatted}
          </span>
        </div>
        <div className="mt-2 text-xs text-indigo-300 flex items-center gap-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>v Target {settings.defaultTargetRtoMinutes}m Baseline</span>
        </div>
      </div>

      {/* 7. Target RTO Baseline */}
      <div className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Target RTO Baseline
          </span>
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-slate-100">
            {settings.defaultTargetRtoMinutes}m
          </span>
          <span className="text-xs font-normal text-slate-500">Default Target</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>Alert threshold: {settings.nearRtoThresholdPercent}%</span>
        </div>
      </div>

      {/* 8. RTO Compliance Rate */}
      <div
        onClick={() => onFilterClick?.('rtoStatus', 'Within RTO')}
        className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm hover:border-amber-500/40 hover:bg-slate-800/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
            RTO Compliance
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-amber-400">
            {compliancePercent}%
          </span>
          <span className="text-xs font-normal text-slate-500">
            ({breachedCount} Breaches)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="text-emerald-400 font-semibold">{compliantCount} Met SLA</span>
          <span className="text-amber-400 font-semibold">{nearRtoCount} Near</span>
          <span className="text-rose-400 font-semibold">{breachedCount} Breached</span>
        </div>
      </div>
    </div>
  );
}
