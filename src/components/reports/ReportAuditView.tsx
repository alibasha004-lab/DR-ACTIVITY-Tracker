import React, { useState } from 'react';
import {
  DRApplication,
  DRExerciseConfig,
  PortalSettings,
} from '../../types';
import {
  Download,
  Upload,
  Printer,
  FileText,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  RtoStatusBadge,
  CriticalityBadge,
  EvidenceStatusBadge,
} from '../ui/StatusBadges';
import {
  exportApplicationsToCsv,
  exportPortalToJson,
} from '../../utils/dataTransfer';

interface ReportAuditViewProps {
  applications: DRApplication[];
  exerciseConfig: DRExerciseConfig;
  settings: PortalSettings;
  onOpenImportModal: () => void;
}

export function ReportAuditView({
  applications,
  exerciseConfig,
  settings,
  onOpenImportModal,
}: ReportAuditViewProps) {
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');

  // Stats calculation
  const totalApps = applications.length;
  const completedApps = applications.filter((a) => a.activityStatus === 'Completed');
  const withinRto = applications.filter((a) => a.rtoStatus === 'Within RTO');
  const nearRto = applications.filter((a) => a.rtoStatus === 'Near RTO');
  const breachedRto = applications.filter((a) => a.rtoStatus === 'RTO Breached');

  const evaluatedCount = withinRto.length + nearRto.length + breachedRto.length;
  const complianceRate = evaluatedCount > 0
    ? Math.round(((withinRto.length + nearRto.length) / evaluatedCount) * 100)
    : 0;

  // Average calculations
  const totalTargetMinutes = applications.reduce((acc, a) => acc + a.targetRtoMinutes, 0);
  const avgTargetRto = totalApps > 0 ? Math.round(totalTargetMinutes / totalApps) : 0;

  const validActualApps = applications.filter((a) => a.actualRtoMinutes !== null);
  const totalActualMinutes = validActualApps.reduce((acc, a) => acc + (a.actualRtoMinutes || 0), 0);
  const avgActualRto = validActualApps.length > 0 ? Math.round(totalActualMinutes / validActualApps.length) : 0;

  // Evidence audit stats
  const completeEvidence = applications.filter((a) => a.evidenceStatus === 'Complete').length;
  const partialEvidence = applications.filter((a) => a.evidenceStatus === 'Partial').length;
  const missingEvidence = applications.filter((a) => a.evidenceStatus === 'Missing').length;

  const handlePrint = () => {
    window.print();
  };

  const filteredApps = selectedCriticality === 'ALL'
    ? applications
    : applications.filter((a) => a.criticality === selectedCriticality);

  return (
    <div className="space-y-6">
      {/* Executive Actions & Export Toolbar */}
      <div className="bg-[#0f172a] rounded-xl p-4 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Executive DR Audit &amp; Management Reports
          </h2>
          <p className="text-xs text-slate-400">
            Generate audit-compliant reports, export evidence registers, or print summary briefs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => exportApplicationsToCsv(applications, exerciseConfig.exerciseName)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xs cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => exportPortalToJson(applications, exerciseConfig, settings)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Import / Restore</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Report Card */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-6 sm:p-8 shadow-sm space-y-8 text-slate-300">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono font-bold text-xs">
                OFFICIAL DR AUDIT REPORT
              </span>
              <span className="text-xs text-slate-500 font-mono">
                GENERATED: {new Date().toISOString().substring(0, 10)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {exerciseConfig.exerciseName}
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
              <span>Organization: <strong className="text-slate-200">{settings.organizationName}</strong></span>
              <span>•</span>
              <span>Site: <strong className="text-slate-200">{exerciseConfig.drLocation}</strong></span>
              <span>•</span>
              <span>Drill Date: <strong className="text-slate-200">{exerciseConfig.exerciseDate}</strong></span>
              <span>•</span>
              <span>Coordinator: <strong className="text-slate-200">{exerciseConfig.coordinator}</strong></span>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center shrink-0 min-w-[150px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Overall Compliance
            </span>
            <p className="text-3xl font-extrabold font-mono text-blue-400 mt-0.5">
              {complianceRate}%
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {withinRto.length + nearRto.length} of {evaluatedCount} Apps Met SLA
            </p>
          </div>
        </div>

        {/* Executive Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Total Systems</span>
            <p className="text-2xl font-bold font-mono text-slate-100 mt-1">{totalApps}</p>
            <p className="text-xs text-slate-500">{completedApps.length} Restored in Drill</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <span className="text-xs font-semibold text-emerald-400">Within RTO</span>
            <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">{withinRto.length}</p>
            <p className="text-xs text-emerald-500">
              {totalApps > 0 ? Math.round((withinRto.length / totalApps) * 100) : 0}% of fleet
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <span className="text-xs font-semibold text-amber-400">Near RTO (&ge;80%)</span>
            <p className="text-2xl font-bold font-mono text-amber-300 mt-1">{nearRto.length}</p>
            <p className="text-xs text-amber-500">Require SLA tuning</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
            <span className="text-xs font-semibold text-rose-400">RTO SLA Breached</span>
            <p className="text-2xl font-bold font-mono text-rose-300 mt-1">{breachedRto.length}</p>
            <p className="text-xs text-rose-500">Action items required</p>
          </div>
        </div>

        {/* SLA Benchmark Comparison & Evidence Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target vs Actual Average */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              SLA Time Performance Benchmarking
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Average Target RTO SLA</span>
                <p className="text-xl font-bold font-mono text-slate-100 mt-1">{avgTargetRto} min</p>
                <p className="text-[11px] text-slate-500">Target allowed downtime</p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400">Average Actual RTO</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">{avgActualRto} min</p>
                <p className="text-[11px] text-slate-500">Mean recovery duration</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-200">Net Fleet Performance: </span>
              {avgActualRto <= avgTargetRto ? (
                <span className="text-emerald-400 font-semibold">
                  Fleet recovered on average {avgTargetRto - avgActualRto} minutes faster than SLA target.
                </span>
              ) : (
                <span className="text-rose-400 font-semibold">
                  Fleet recovery averaged {avgActualRto - avgTargetRto} minutes beyond target SLA.
                </span>
              )}
            </div>
          </div>

          {/* Evidence Completeness Audit */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Auditor Screenshot Evidence Readiness
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-xs text-emerald-400 font-bold">Complete</span>
                <p className="text-xl font-bold font-mono text-slate-100 mt-1">{completeEvidence}</p>
                <p className="text-[10px] text-slate-500">Both 2/2 Shots</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-xs text-amber-400 font-bold">Partial</span>
                <p className="text-xl font-bold font-mono text-slate-100 mt-1">{partialEvidence}</p>
                <p className="text-[10px] text-slate-500">1 of 2 Shots</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-xs text-rose-400 font-bold">Missing</span>
                <p className="text-xl font-bold font-mono text-slate-100 mt-1">{missingEvidence}</p>
                <p className="text-[10px] text-slate-500">0 Shots</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-slate-200">Audit Status: </strong>
              {missingEvidence === 0 && partialEvidence === 0
                ? '100% of applications have complete verification evidence attached.'
                : `${missingEvidence + partialEvidence} applications have incomplete screenshot evidence.`}
            </p>
          </div>
        </div>

        {/* Detailed Application Audit Roster */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">
              Application Disaster Recovery Register
            </h3>

            {/* Filter by criticality */}
            <div className="flex items-center gap-2 print:hidden">
              <span className="text-xs text-slate-400 font-medium">Filter Tier:</span>
              <select
                value={selectedCriticality}
                onChange={(e) => setSelectedCriticality(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200"
              >
                <option value="ALL">All Applications ({applications.length})</option>
                <option value="Critical">Critical Only</option>
                <option value="High">High Only</option>
                <option value="Medium">Medium Only</option>
                <option value="Low">Low Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-[#0f172a] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">App ID</th>
                  <th className="py-2.5 px-3">Application Name</th>
                  <th className="py-2.5 px-3">Server</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Target RTO</th>
                  <th className="py-2.5 px-3">Down Time</th>
                  <th className="py-2.5 px-3">Up Time</th>
                  <th className="py-2.5 px-3">Actual RTO</th>
                  <th className="py-2.5 px-3">RTO Status</th>
                  <th className="py-2.5 px-3">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{app.appId}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-100">{app.appName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{app.serverName}</td>
                    <td className="py-2.5 px-3">
                      <CriticalityBadge criticality={app.criticality} />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">{app.targetRtoMinutes}m</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{app.downTime || '—'}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{app.upTime || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                      {app.actualRtoFormatted || 'Pending'}
                    </td>
                    <td className="py-2.5 px-3">
                      <RtoStatusBadge status={app.rtoStatus} />
                    </td>
                    <td className="py-2.5 px-3">
                      <EvidenceStatusBadge
                        status={app.evidenceStatus}
                        hasDown={!!app.downEvidence}
                        hasUp={!!app.upEvidence}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Sign-Off Section */}
        <div className="border-t border-slate-800 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-400">
          <div className="space-y-3">
            <span className="font-semibold text-slate-300">DR Drill Coordinator:</span>
            <div className="border-b border-slate-700 pb-1 font-semibold text-slate-200">
              {exerciseConfig.coordinator}
            </div>
            <p className="text-[10px] text-slate-500">Signature &amp; Date</p>
          </div>

          <div className="space-y-3">
            <span className="font-semibold text-slate-300">Lead Infrastructure Architect:</span>
            <div className="border-b border-slate-700 pb-1 font-semibold text-slate-200">
              David Sterling (Cloud Operations)
            </div>
            <p className="text-[10px] text-slate-500">Signature &amp; Date</p>
          </div>

          <div className="space-y-3">
            <span className="font-semibold text-slate-300">IT Compliance / Internal Auditor:</span>
            <div className="border-b border-slate-700 pb-1 font-semibold text-slate-200">
              Auditor Sign-off Pending
            </div>
            <p className="text-[10px] text-slate-500">Signature &amp; Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}
