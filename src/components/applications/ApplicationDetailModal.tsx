import React from 'react';
import { DRApplication } from '../../types';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  Camera,
  ShieldCheck,
  Edit,
  Zap,
  Eye,
} from 'lucide-react';
import {
  RtoStatusBadge,
  ActivityStatusBadge,
  CriticalityBadge,
  EvidenceStatusBadge,
  EnvironmentBadge,
} from '../ui/StatusBadges';

interface ApplicationDetailModalProps {
  application: DRApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: DRApplication) => void;
  onQuickRecord: (app: DRApplication) => void;
  onPreviewImage?: (title: string, dataUrl: string) => void;
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
  onEdit,
  onQuickRecord,
  onPreviewImage,
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

  const targetMinutes = application.targetRtoMinutes;
  const actualMinutes = application.actualRtoMinutes;
  const variance = application.rtoVarianceMinutes;

  // Percentage of target RTO used
  const percentUsed = actualMinutes !== null && targetMinutes > 0
    ? Math.round((actualMinutes / targetMinutes) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] rounded-xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs">
              {application.appId.replace('APP-', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">{application.appName}</h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {application.appId}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Server: <strong className="text-slate-300 font-mono">{application.serverName}</strong></span>
                <span>•</span>
                <span>Owner: <strong className="text-slate-300">{application.appOwner}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(application);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Top Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Environment
              </span>
              <div className="mt-1.5">
                <EnvironmentBadge env={application.environment} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Criticality Tier
              </span>
              <div className="mt-1.5">
                <CriticalityBadge criticality={application.criticality} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Activity Status
              </span>
              <div className="mt-1.5">
                <ActivityStatusBadge status={application.activityStatus} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Evidence Status
              </span>
              <div className="mt-1.5">
                <EvidenceStatusBadge
                  status={application.evidenceStatus}
                  hasDown={!!application.downEvidence}
                  hasUp={!!application.upEvidence}
                />
              </div>
            </div>
          </div>

          {/* RTO Visual Comparison & Variance */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  RTO Performance &amp; SLA Breakdown
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparison between Target Recovery Time and Actual Restored Duration
                </p>
              </div>
              <RtoStatusBadge status={application.rtoStatus} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Target RTO */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target RTO SLA</span>
                <p className="text-xl font-bold font-mono text-slate-100 mt-1">
                  {application.targetRtoMinutes} min
                </p>
                <p className="text-[11px] text-slate-500">
                  {application.targetRto} {application.targetRtoUnit.toLowerCase()}
                </p>
              </div>

              {/* Actual RTO */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actual RTO Achieved</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-1">
                  {application.actualRtoFormatted || 'In Progress / Pending'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {application.actualRtoMinutes !== null ? `${application.actualRtoMinutes} total minutes` : 'Timestamps required'}
                </p>
              </div>

              {/* RTO Variance */}
              <div
                className={`p-3.5 rounded-lg border ${
                  application.rtoStatus === 'RTO Breached'
                    ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    : application.rtoStatus === 'Near RTO'
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  SLA Variance
                </span>
                <p className="text-xl font-bold font-mono mt-1">
                  {variance !== null ? `${variance > 0 ? '+' : ''}${variance} min` : '—'}
                </p>
                <p className="text-[11px] font-medium mt-0.5">
                  {variance !== null ? (
                    variance <= 0 ? (
                      `🟢 ${Math.abs(variance)}m under target SLA`
                    ) : (
                      `🔴 Breached target by ${variance}m`
                    )
                  ) : (
                    'Awaiting drill completion'
                  )}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            {actualMinutes !== null && targetMinutes > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>RTO Budget Consumed: {percentUsed}%</span>
                  <span className="font-mono">Threshold (100% = {targetMinutes}m)</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed > 100
                        ? 'bg-rose-500'
                        : percentUsed >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                  {/* Near Threshold marker (80%) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-500"
                    style={{ left: '80%' }}
                    title="80% Near-Breach Warning Line"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visual Timeline Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              DR Activity Execution Timeline
            </h3>

            <div className="space-y-3 pl-2">
              {application.timelineEvents.map((evt, idx) => {
                const isLast = idx === application.timelineEvents.length - 1;
                return (
                  <div key={evt.id} className="relative flex items-start gap-3">
                    {/* Line connecting */}
                    {!isLast && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-800" />
                    )}

                    {/* Dot */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white ${
                        evt.status === 'completed'
                          ? 'bg-emerald-500'
                          : evt.status === 'in_progress'
                          ? 'bg-blue-500 animate-pulse'
                          : evt.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-slate-700'
                      }`}
                    >
                      {evt.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : evt.status === 'failed' ? (
                        <XCircle className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1 bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{evt.title}</h4>
                        <span className="text-[11px] font-mono font-bold text-slate-300 px-2 py-0.5 bg-slate-950 rounded border border-slate-700">
                          {evt.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{evt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Evidence Screenshots Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Camera className="w-4 h-4 text-teal-400" />
              Auditor Screenshot Evidence (Down vs Up)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Down-Time Evidence */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Server Down Evidence
                  </span>
                  {application.downEvidence ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold">Missing</span>
                  )}
                </div>

                {application.downEvidence ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => onPreviewImage?.('Server Down Evidence Screenshot', application.downEvidence!.dataUrl)}
                      className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group relative"
                    >
                      <img
                        src={application.downEvidence.dataUrl}
                        alt="Down Evidence"
                        className="w-full h-32 object-cover group-hover:scale-102 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5">
                        <Eye className="w-4 h-4" /> Click to Enlarge
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="font-mono truncate max-w-[150px]">{application.downEvidence.name}</span>
                      <span>{application.downEvidence.uploadedAt}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-7 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950">
                    No Down-time screenshot uploaded yet.
                  </div>
                )}
              </div>

              {/* Up-Time Evidence */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Server Up Evidence
                  </span>
                  {application.upEvidence ? (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-rose-400 font-semibold">Missing</span>
                  )}
                </div>

                {application.upEvidence ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => onPreviewImage?.('Server Up Evidence Screenshot', application.upEvidence!.dataUrl)}
                      className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer group relative"
                    >
                      <img
                        src={application.upEvidence.dataUrl}
                        alt="Up Evidence"
                        className="w-full h-32 object-cover group-hover:scale-102 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1.5">
                        <Eye className="w-4 h-4" /> Click to Enlarge
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="font-mono truncate max-w-[150px]">{application.upEvidence.name}</span>
                      <span>{application.upEvidence.uploadedAt}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-7 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-950">
                    No Up-time screenshot uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail Stamp */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-300">Audit Stamp: </span>
              <span>Created {application.createdDate} • Last Updated: <strong className="text-slate-200">{application.lastUpdatedDate}</strong></span>
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              HASH: SHA256-DR{application.appId.replace('-', '')}V1
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#020617] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onQuickRecord(application);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Launch Quick DR Recorder</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
