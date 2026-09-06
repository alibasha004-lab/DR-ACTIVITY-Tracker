import React from 'react';
import {
  ActivityStatus,
  CriticalityType,
  EnvironmentType,
  EvidenceStatus,
  RtoStatus,
} from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileCheck,
  FileWarning,
  FileX,
  Server,
} from 'lucide-react';

export function RtoStatusBadge({ status, showIcon = true }: { status: RtoStatus; showIcon?: boolean }) {
  switch (status) {
    case 'Within RTO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span>Within RTO</span>
        </span>
      );
    case 'Near RTO':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
          <span>Near RTO</span>
        </span>
      );
    case 'RTO Breached':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
          <span>RTO Breached</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          {showIcon && <Clock className="w-3.5 h-3.5 text-slate-500" />}
          <span>Not Started</span>
        </span>
      );
  }
}

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          In Progress
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          Failed
        </span>
      );
    case 'Partially Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          Partial
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          Not Started
        </span>
      );
  }
}

export function CriticalityBadge({ criticality }: { criticality: CriticalityType }) {
  switch (criticality) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
          Tier-1 Critical
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Medium
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          Low
        </span>
      );
  }
}

export function EvidenceStatusBadge({
  status,
  hasDown,
  hasUp,
}: {
  status: EvidenceStatus;
  hasDown?: boolean;
  hasUp?: boolean;
}) {
  switch (status) {
    case 'Complete':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20"
          title="Down & Up screenshots verified"
        >
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Complete (2/2)</span>
        </span>
      );
    case 'Partial':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"
          title={hasDown ? 'Down screenshot uploaded, Up pending' : 'Up screenshot uploaded, Down pending'}
        >
          <FileWarning className="w-3.5 h-3.5 text-amber-400" />
          <span>Partial (1/2)</span>
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"
          title="No evidence screenshots uploaded"
        >
          <FileX className="w-3.5 h-3.5 text-rose-400" />
          <span>Missing</span>
        </span>
      );
  }
}

export function EnvironmentBadge({ env }: { env: EnvironmentType }) {
  const styles: Record<EnvironmentType, string> = {
    Production: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    DR: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    UAT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Other: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${styles[env] || styles.Other}`}>
      <Server className="w-3 h-3 opacity-70" />
      {env}
    </span>
  );
}
