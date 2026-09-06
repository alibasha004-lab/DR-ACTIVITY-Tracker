import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { DRApplication } from '../../types';
import {
  FileCheck,
  FileWarning,
  FileX,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface QuickSummaryChartsProps {
  applications: DRApplication[];
  onFilterEvidence?: (status: string) => void;
  onFilterRto?: (status: string) => void;
}

export function QuickSummaryCharts({
  applications,
  onFilterEvidence,
  onFilterRto,
}: QuickSummaryChartsProps) {
  const total = applications.length;
  const completed = applications.filter((a) => a.activityStatus === 'Completed').length;
  const inProgress = applications.filter((a) => a.activityStatus === 'In Progress').length;
  const pending = applications.filter((a) => a.activityStatus === 'Not Started').length;
  const failed = applications.filter((a) => a.activityStatus === 'Failed').length;

  const completedWithRto = applications.filter((a) => a.actualRtoMinutes !== null);
  const withinRto = applications.filter((a) => a.rtoStatus === 'Within RTO').length;
  const nearRto = applications.filter((a) => a.rtoStatus === 'Near RTO').length;
  const breachedRto = applications.filter((a) => a.rtoStatus === 'RTO Breached').length;
  const notStartedRto = applications.filter((a) => a.rtoStatus === 'Not Started').length;

  const completeEvidence = applications.filter((a) => a.evidenceStatus === 'Complete').length;
  const partialEvidence = applications.filter((a) => a.evidenceStatus === 'Partial').length;
  const missingEvidence = applications.filter((a) => a.evidenceStatus === 'Missing').length;

  const rtoAchievedPercent = completedWithRto.length > 0
    ? Math.round((withinRto / completedWithRto.length) * 100)
    : 0;
  const rtoBreachedPercent = completedWithRto.length > 0
    ? Math.round((breachedRto / completedWithRto.length) * 100)
    : 0;

  const evidenceCompletePercent = total > 0 ? Math.round((completeEvidence / total) * 100) : 0;
  const evidencePendingPercent = 100 - evidenceCompletePercent;

  // Pie chart data for compliance
  const distributionData = [
    { name: 'Within RTO', value: withinRto, color: '#10b981' },
    { name: 'Near RTO (80%)', value: nearRto, color: '#f59e0b' },
    { name: 'RTO Breached', value: breachedRto, color: '#ef4444' },
    { name: 'Not Started / Pending', value: notStartedRto, color: '#475569' },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
      {/* 1. Management Executive Summary Card */}
      <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              DR Execution Summary
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">
              Audit Ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Total Apps</span>
              <p className="text-xl font-bold text-slate-100 mt-0.5">{total}</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Completed</span>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{completed}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/40">
              <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">In Progress</span>
              <p className="text-xl font-bold text-blue-400 mt-0.5">{inProgress + pending}</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
              <span className="text-[10px] font-medium text-rose-400 uppercase tracking-wider">Failed</span>
              <p className="text-xl font-bold text-rose-400 mt-0.5">{failed}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 font-medium">RTO Achieved Rate</span>
              <span className="font-bold text-emerald-400 font-mono">{rtoAchievedPercent}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 font-medium">RTO Breached Rate</span>
              <span className="font-bold text-rose-400 font-mono">{rtoBreachedPercent}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Evidence Verified</span>
              <span className="font-bold text-teal-400 font-mono">{evidenceCompletePercent}%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="text-slate-400 font-medium">Evidence Pending</span>
              <span className="font-bold text-amber-400 font-mono">{evidencePendingPercent}%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Drill Status: Active Execution</span>
          <span className="font-mono text-blue-400 font-semibold">100 Apps Max</span>
        </div>
      </div>

      {/* 2. RTO Compliance Distribution (Donut Chart) */}
      <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            RTO Compliance Distribution
          </h3>
          <span className="text-xs text-slate-400">Breakdown</span>
        </div>

        <div className="h-44 sm:h-48 mt-2">
          {distributionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} Applications`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              No RTO data recorded yet
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onFilterRto?.('Within RTO')}
            className="flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Within RTO
            </span>
            <span className="font-bold text-emerald-400 font-mono">{withinRto}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterRto?.('Near RTO')}
            className="flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Near (80%)
            </span>
            <span className="font-bold text-amber-400 font-mono">{nearRto}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterRto?.('RTO Breached')}
            className="flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Breached
            </span>
            <span className="font-bold text-rose-400 font-mono">{breachedRto}</span>
          </button>
          <button
            type="button"
            onClick={() => onFilterRto?.('Not Started')}
            className="flex items-center justify-between p-2 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Pending
            </span>
            <span className="font-bold text-slate-400 font-mono">{notStartedRto}</span>
          </button>
        </div>
      </div>

      {/* 3. Evidence Compliance Summary & Audit Readiness */}
      <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400" />
              Evidence Compliance Vault
            </h3>
            <span className="text-xs text-slate-400">Filter Table</span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Click an evidence tier to filter the application register:
          </p>

          <div className="space-y-2 mt-3">
            {/* Complete */}
            <button
              type="button"
              onClick={() => onFilterEvidence?.('Complete')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-teal-300 group-hover:text-teal-200">
                    Complete Evidence
                  </h4>
                  <p className="text-[10px] text-teal-400/80">Both Down &amp; Up attached</p>
                </div>
              </div>
              <span className="text-sm font-bold text-teal-400 bg-teal-500/20 px-2.5 py-0.5 rounded-full font-mono">
                {completeEvidence}
              </span>
            </button>

            {/* Partial */}
            <button
              type="button"
              onClick={() => onFilterEvidence?.('Partial')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <FileWarning className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-amber-300 group-hover:text-amber-200">
                    Partial Evidence
                  </h4>
                  <p className="text-[10px] text-amber-400/80">1 of 2 screenshots verified</p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
                {partialEvidence}
              </span>
            </button>

            {/* Missing */}
            <button
              type="button"
              onClick={() => onFilterEvidence?.('Missing')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <FileX className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-rose-300 group-hover:text-rose-200">
                    Missing Evidence
                  </h4>
                  <p className="text-[10px] text-rose-400/80">No screenshots attached</p>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
                {missingEvidence}
              </span>
            </button>
          </div>
        </div>

        {/* Audit Readiness bottom banner matching Design HTML */}
        <div className="mt-3 p-3 rounded-lg bg-blue-900/10 border border-blue-500/30">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Audit Readiness</span>
            <span className="text-[11px] font-mono text-blue-300 font-bold">{completeEvidence}/{total} verified</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${total > 0 ? (completeEvidence / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
