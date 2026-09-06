export type EnvironmentType = 'Production' | 'DR' | 'UAT' | 'Other';
export type CriticalityType = 'Critical' | 'High' | 'Medium' | 'Low';
export type TargetRtoUnit = 'Minutes' | 'Hours';
export type ActivityStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Failed' | 'Partially Completed';
export type RtoStatus = 'Within RTO' | 'Near RTO' | 'RTO Breached' | 'Not Started';
export type EvidenceStatus = 'Missing' | 'Partial' | 'Complete';

export interface EvidenceItem {
  id: string;
  name: string;
  type: 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf' | string;
  dataUrl: string; // Base64 data URL or mock URL
  uploadedAt: string;
  size?: number;
  notes?: string;
  isDemo?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

export interface DRApplication {
  id: string; // internal UUID or slug
  appId: string; // e.g. "APP-001"
  appName: string; // e.g. "Core Banking System"
  serverName: string; // e.g. "PRD-SRV-CORE-01"
  environment: EnvironmentType;
  appOwner: string; // e.g. "Sarah Jenkins"
  criticality: CriticalityType;
  targetRto: number; // in units specified by targetRtoUnit
  targetRtoUnit: TargetRtoUnit;
  targetRtoMinutes: number; // normalized to minutes for consistent math

  // DR Activity Details
  drDate: string; // YYYY-MM-DD
  downDate: string; // YYYY-MM-DD
  downTime: string; // HH:MM or HH:MM:SS
  upDate: string; // YYYY-MM-DD
  upTime: string; // HH:MM or HH:MM:SS

  // Calculated RTO
  actualRtoSeconds: number | null;
  actualRtoMinutes: number | null;
  actualRtoFormatted: string | null; // e.g. "02h 35m 30s"
  rtoStatus: RtoStatus;
  rtoVarianceMinutes: number | null; // actualRtoMinutes - targetRtoMinutes (+ is breach, - is safe)

  // Evidence
  downEvidence: EvidenceItem | null;
  upEvidence: EvidenceItem | null;
  evidenceStatus: EvidenceStatus;

  // Status & Audit
  activityStatus: ActivityStatus;
  remarks?: string;
  timelineEvents: TimelineEvent[];
  createdDate: string;
  lastUpdatedDate: string;
}

export interface DRExerciseConfig {
  exerciseName: string;
  exerciseDate: string;
  startTime: string;
  endTime: string;
  drLocation: string;
  coordinator: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
}

export type TabType = 'dashboard' | 'applications' | 'recorder' | 'exercise' | 'reports';

export interface PortalSettings {
  defaultTargetRtoMinutes: number;
  nearRtoThresholdPercent: number; // e.g. 80
  dateFormat: 'DD-MMM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  timeFormat: '24h' | '12h';
  organizationName: string;
  drTeamName: string;
  autoValidateOnInput: boolean;
  auditMode?: boolean;
  allowOverlappingEvents?: boolean;
}

export interface FilterState {
  search: string;
  owner: string;
  environment: string;
  criticality: string;
  activityStatus: string;
  rtoStatus: string;
  evidenceStatus: string;
  date: string;
}

export type SortField =
  | 'appId'
  | 'appName'
  | 'serverName'
  | 'environment'
  | 'appOwner'
  | 'criticality'
  | 'targetRtoMinutes'
  | 'actualRtoMinutes'
  | 'rtoVarianceMinutes'
  | 'rtoStatus'
  | 'activityStatus'
  | 'evidenceStatus'
  | 'drDate'
  | 'lastUpdatedDate';

export type SortDirection = 'asc' | 'desc';
