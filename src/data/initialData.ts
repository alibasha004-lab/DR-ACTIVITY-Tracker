import {
  DRApplication,
  DRExerciseConfig,
  PortalSettings,
  TimelineEvent,
} from '../types';
import {
  computeRtoResult,
  calculateEvidenceStatus,
  generateDemoEvidenceSvg,
} from '../utils/rtoCalculator';

export const DEFAULT_EXERCISE_CONFIG: DRExerciseConfig = {
  exerciseName: 'Annual Enterprise DR Drill – 2026',
  exerciseDate: '2026-09-05',
  startTime: '08:00',
  endTime: '18:00',
  drLocation: 'Secondary DR Facility (Cloud Region East / Backup DC)',
  coordinator: 'Alex Morgan (Resilience Lead)',
  status: 'In Progress',
  notes: 'Tier-1 & Tier-2 critical banking and enterprise systems failover exercise with real-time RTO monitoring and evidence archival.',
};

export const DEFAULT_SETTINGS: PortalSettings = {
  defaultTargetRtoMinutes: 60,
  nearRtoThresholdPercent: 80,
  dateFormat: 'DD-MMM-YYYY',
  timeFormat: '24h',
  organizationName: 'Global Enterprise Financial Services Corp.',
  drTeamName: 'IT Resilience, BCM & Disaster Recovery Operations',
  autoValidateOnInput: true,
};

function createTimeline(
  drStart: string,
  downTime: string,
  recStart: string,
  upTime: string,
  isFailed: boolean = false
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: 't1',
      time: drStart,
      title: 'DR Activity Initiated',
      description: 'Disaster Recovery authorization received and drill phase triggered.',
      status: 'completed',
    },
  ];

  if (downTime) {
    events.push({
      id: 't2',
      time: downTime,
      title: 'Server Shutdown Confirmed',
      description: 'Primary instance unmounted and network cutover started.',
      status: 'completed',
    });
  }

  if (recStart) {
    events.push({
      id: 't3',
      time: recStart,
      title: 'DR Recovery Process Started',
      description: 'Storage replication verified and secondary host booting.',
      status: isFailed ? 'failed' : 'completed',
    });
  }

  if (upTime) {
    events.push({
      id: 't4',
      time: upTime,
      title: isFailed ? 'Recovery Failed / Aborted' : 'Server & Services Restored',
      description: isFailed ? 'Errors encountered during database synchronization.' : 'All health checks green and sanity tests passed.',
      status: isFailed ? 'failed' : 'completed',
    });
    events.push({
      id: 't5',
      time: upTime,
      title: 'RTO Verification Completed',
      description: 'Auditor screenshot evidence verified and logged.',
      status: isFailed ? 'failed' : 'completed',
    });
  }

  return events;
}

export const INITIAL_APPLICATIONS: DRApplication[] = [
  {
    id: 'app-001',
    appId: 'APP-001',
    appName: 'Core Banking Ledger',
    serverName: 'PRD-SRV-CORE-01',
    environment: 'Production',
    appOwner: 'Sarah Jenkins',
    criticality: 'Critical',
    targetRto: 60,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 60,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '09:00:00',
    upDate: '2026-09-05',
    upTime: '09:48:30',
    ...computeRtoResult('2026-09-05', '09:00:00', '2026-09-05', '09:48:30', 60, 80),
    downEvidence: {
      id: 'ev-001-down',
      name: 'APP001_Server_Down_Log.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Core Banking Ledger', 'PRD-SRV-CORE-01', 'DOWN', '09:00:00', 'Primary Oracle RAC unmounted - failover active'),
      uploadedAt: '2026-09-05 09:02:15',
      size: 245000,
      notes: 'Clean shutdown of primary ledger cluster confirmed.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-001-up',
      name: 'APP001_Server_Up_Verified.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Core Banking Ledger', 'PRD-SRV-CORE-01', 'UP', '09:48:30', 'Secondary cluster active - 10,000 TPS verified'),
      uploadedAt: '2026-09-05 09:50:02',
      size: 278000,
      notes: 'All transaction queues healthy. Integrity check 100%.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'DR drill executed smoothly within the 1-hour target threshold.',
    timelineEvents: createTimeline('08:50', '09:00', '09:18', '09:48:30'),
    createdDate: '2026-09-01 10:00:00',
    lastUpdatedDate: '2026-09-05 09:50:02',
  },
  {
    id: 'app-002',
    appId: 'APP-002',
    appName: 'Internet Banking Web Portal',
    serverName: 'PRD-SRV-INET-02',
    environment: 'Production',
    appOwner: 'David Chen',
    criticality: 'Critical',
    targetRto: 60,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 60,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '09:15:00',
    upDate: '2026-09-05',
    upTime: '10:04:00',
    ...computeRtoResult('2026-09-05', '09:15:00', '2026-09-05', '10:04:00', 60, 80),
    downEvidence: {
      id: 'ev-002-down',
      name: 'APP002_Nginx_Down_Evidence.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Internet Banking Portal', 'PRD-SRV-INET-02', 'DOWN', '09:15:00', 'Cloudflare DNS switched to DR maintenance page'),
      uploadedAt: '2026-09-05 09:16:30',
      size: 198000,
      notes: 'Customer portal put into maintenance.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-002-up',
      name: 'APP002_Portal_Restored.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Internet Banking Portal', 'PRD-SRV-INET-02', 'UP', '10:04:00', 'Kubernetes ingress online in DR cloud pod'),
      uploadedAt: '2026-09-05 10:05:40',
      size: 215000,
      notes: 'Portal responsive, SSL certificates intact.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Recovered in 49 minutes, within 60 min target.',
    timelineEvents: createTimeline('09:05', '09:15', '09:32', '10:04:00'),
    createdDate: '2026-09-01 10:05:00',
    lastUpdatedDate: '2026-09-05 10:05:40',
  },
  {
    id: 'app-003',
    appId: 'APP-003',
    appName: 'Mobile Banking API Gateway',
    serverName: 'PRD-API-GW-03',
    environment: 'Production',
    appOwner: 'Elena Rostova',
    criticality: 'Critical',
    targetRto: 45,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 45,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '09:30:00',
    upDate: '2026-09-05',
    upTime: '10:08:45',
    ...computeRtoResult('2026-09-05', '09:30:00', '2026-09-05', '10:08:45', 45, 80),
    downEvidence: {
      id: 'ev-003-down',
      name: 'APP003_Gateway_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Mobile Banking API Gateway', 'PRD-API-GW-03', 'DOWN', '09:30:00', 'Kong API Gateway drain connection pool'),
      uploadedAt: '2026-09-05 09:31:10',
      size: 180000,
      notes: 'Gateway offline confirmation.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-003-up',
      name: 'APP003_Gateway_Up.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Mobile Banking API Gateway', 'PRD-API-GW-03', 'UP', '10:08:45', 'Gateway cluster healthy - latency 12ms'),
      uploadedAt: '2026-09-05 10:10:00',
      size: 210000,
      notes: 'OAuth token validation passed.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Actual 38m 45s is near the 45m threshold (86% consumed). Flagged as Near RTO.',
    timelineEvents: createTimeline('09:20', '09:30', '09:44', '10:08:45'),
    createdDate: '2026-09-01 10:10:00',
    lastUpdatedDate: '2026-09-05 10:10:00',
  },
  {
    id: 'app-004',
    appId: 'APP-004',
    appName: 'Enterprise CRM System',
    serverName: 'PRD-SRV-CRM-04',
    environment: 'Production',
    appOwner: 'Marcus Vance',
    criticality: 'High',
    targetRto: 90,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 90,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '10:00:00',
    upDate: '2026-09-05',
    upTime: '11:55:20',
    ...computeRtoResult('2026-09-05', '10:00:00', '2026-09-05', '11:55:20', 90, 80),
    downEvidence: {
      id: 'ev-004-down',
      name: 'APP004_CRM_Down_Log.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Enterprise CRM System', 'PRD-SRV-CRM-04', 'DOWN', '10:00:00', 'Postgres primary shut down for failover test'),
      uploadedAt: '2026-09-05 10:02:00',
      size: 204000,
      notes: 'CRM background worker paused.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-004-up',
      name: 'APP004_CRM_Recovered.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Enterprise CRM System', 'PRD-SRV-CRM-04', 'UP', '11:55:20', 'Secondary Postgres node promoted after WAL catch-up'),
      uploadedAt: '2026-09-05 11:57:00',
      size: 230000,
      notes: 'Extended WAL playback caused delay.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Breached target RTO by 25m 20s due to database index rebuild latency.',
    timelineEvents: createTimeline('09:45', '10:00', '10:35', '11:55:20'),
    createdDate: '2026-09-01 10:15:00',
    lastUpdatedDate: '2026-09-05 11:57:00',
  },
  {
    id: 'app-005',
    appId: 'APP-005',
    appName: 'Payment Gateway & Settlement',
    serverName: 'PRD-SRV-PAY-05',
    environment: 'Production',
    appOwner: 'Priya Sharma',
    criticality: 'Critical',
    targetRto: 30,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 30,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '10:30:00',
    upDate: '2026-09-05',
    upTime: '10:52:15',
    ...computeRtoResult('2026-09-05', '10:30:00', '2026-09-05', '10:52:15', 30, 80),
    downEvidence: {
      id: 'ev-005-down',
      name: 'APP005_Payment_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Payment Gateway', 'PRD-SRV-PAY-05', 'DOWN', '10:30:00', 'ISO8583 switch unlinked from primary zone'),
      uploadedAt: '2026-09-05 10:31:00',
      size: 195000,
      notes: 'Settlement engine detached.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-005-up',
      name: 'APP005_Payment_Up.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Payment Gateway', 'PRD-SRV-PAY-05', 'UP', '10:52:15', 'Hot-standby switch confirmed active with Visa/Mastercard endpoints'),
      uploadedAt: '2026-09-05 10:54:00',
      size: 260000,
      notes: 'End-to-end synthetic micro-payment passed.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Achieved in 22m 15s against 30m target.',
    timelineEvents: createTimeline('10:20', '10:30', '10:38', '10:52:15'),
    createdDate: '2026-09-01 10:20:00',
    lastUpdatedDate: '2026-09-05 10:54:00',
  },
  {
    id: 'app-006',
    appId: 'APP-006',
    appName: 'HR & Payroll Management',
    serverName: 'PRD-SRV-HR-06',
    environment: 'DR',
    appOwner: 'Chloe Bennett',
    criticality: 'Medium',
    targetRto: 3,
    targetRtoUnit: 'Hours',
    targetRtoMinutes: 180,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '11:00:00',
    upDate: '2026-09-05',
    upTime: '13:15:00',
    ...computeRtoResult('2026-09-05', '11:00:00', '2026-09-05', '13:15:00', 180, 80),
    downEvidence: {
      id: 'ev-006-down',
      name: 'APP006_HR_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('HR & Payroll System', 'PRD-SRV-HR-06', 'DOWN', '11:00:00', 'App services taken offline for restore'),
      uploadedAt: '2026-09-05 11:03:00',
      size: 175000,
      notes: 'Backup snapshot restore initialized.',
      isDemo: true,
    },
    upEvidence: null,
    evidenceStatus: 'Partial',
    activityStatus: 'Completed',
    remarks: 'RTO achieved in 2h 15m. Up-time screenshot pending audit verification.',
    timelineEvents: createTimeline('10:50', '11:00', '11:45', '13:15:00'),
    createdDate: '2026-09-01 10:25:00',
    lastUpdatedDate: '2026-09-05 13:16:00',
  },
  {
    id: 'app-007',
    appId: 'APP-007',
    appName: 'SAP Finance & General Ledger',
    serverName: 'PRD-SAP-ERP-07',
    environment: 'Production',
    appOwner: 'Robert Mueller',
    criticality: 'High',
    targetRto: 2,
    targetRtoUnit: 'Hours',
    targetRtoMinutes: 120,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '11:30:00',
    upDate: '2026-09-05',
    upTime: '13:40:00',
    ...computeRtoResult('2026-09-05', '11:30:00', '2026-09-05', '13:40:00', 120, 80),
    downEvidence: {
      id: 'ev-007-down',
      name: 'APP007_SAP_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('SAP Finance ERP', 'PRD-SAP-ERP-07', 'DOWN', '11:30:00', 'SAP HANA DB system replication takeover'),
      uploadedAt: '2026-09-05 11:32:00',
      size: 210000,
      notes: 'HANA replication triggered.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-007-up',
      name: 'APP007_SAP_Up.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('SAP Finance ERP', 'PRD-SAP-ERP-07', 'UP', '13:40:00', 'SAP HANA Secondary active - GL tables unlocked'),
      uploadedAt: '2026-09-05 13:42:00',
      size: 220000,
      notes: 'Memory preload completed in 2h 10m.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Breached by 10 minutes due to HANA in-memory preload times.',
    timelineEvents: createTimeline('11:15', '11:30', '12:05', '13:40:00'),
    createdDate: '2026-09-01 10:30:00',
    lastUpdatedDate: '2026-09-05 13:42:00',
  },
  {
    id: 'app-008',
    appId: 'APP-008',
    appName: 'Document Management & Records',
    serverName: 'PRD-DOC-ARCH-08',
    environment: 'DR',
    appOwner: 'Lisa Wong',
    criticality: 'Low',
    targetRto: 4,
    targetRtoUnit: 'Hours',
    targetRtoMinutes: 240,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '12:00:00',
    upDate: '2026-09-05',
    upTime: '14:15:00',
    ...computeRtoResult('2026-09-05', '12:00:00', '2026-09-05', '14:15:00', 240, 80),
    downEvidence: null,
    upEvidence: null,
    evidenceStatus: 'Missing',
    activityStatus: 'Completed',
    remarks: 'Recovered in 2h 15m. Evidence screenshots still need to be captured and uploaded.',
    timelineEvents: createTimeline('11:50', '12:00', '12:45', '14:15:00'),
    createdDate: '2026-09-01 10:35:00',
    lastUpdatedDate: '2026-09-05 14:16:00',
  },
  {
    id: 'app-009',
    appId: 'APP-009',
    appName: 'Customer Self-Service Portal',
    serverName: 'PRD-SRV-CUST-09',
    environment: 'Production',
    appOwner: 'Amina Al-Mansoor',
    criticality: 'High',
    targetRto: 60,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 60,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '14:00:00',
    upDate: '',
    upTime: '',
    actualRtoSeconds: null,
    actualRtoMinutes: null,
    actualRtoFormatted: null,
    rtoStatus: 'Not Started',
    rtoVarianceMinutes: null,
    downEvidence: {
      id: 'ev-009-down',
      name: 'APP009_Customer_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Customer Self-Service Portal', 'PRD-SRV-CUST-09', 'DOWN', '14:00:00', 'Service cluster down - failover ongoing'),
      uploadedAt: '2026-09-05 14:01:30',
      size: 190000,
      notes: 'Currently undergoing failover restoration.',
      isDemo: true,
    },
    upEvidence: null,
    evidenceStatus: 'Partial',
    activityStatus: 'In Progress',
    remarks: 'Server down recorded at 14:00. DR recovery team currently mounting storage volumes.',
    timelineEvents: createTimeline('13:50', '14:00', '14:10', ''),
    createdDate: '2026-09-01 10:40:00',
    lastUpdatedDate: '2026-09-05 14:01:30',
  },
  {
    id: 'app-010',
    appId: 'APP-010',
    appName: 'Executive BI & Reporting Data Warehouse',
    serverName: 'PRD-DWH-BI-10',
    environment: 'UAT',
    appOwner: 'Kevin O’Connor',
    criticality: 'Medium',
    targetRto: 120,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 120,
    drDate: '2026-09-05',
    downDate: '',
    downTime: '',
    upDate: '',
    upTime: '',
    actualRtoSeconds: null,
    actualRtoMinutes: null,
    actualRtoFormatted: null,
    rtoStatus: 'Not Started',
    rtoVarianceMinutes: null,
    downEvidence: null,
    upEvidence: null,
    evidenceStatus: 'Missing',
    activityStatus: 'Not Started',
    remarks: 'Scheduled for afternoon drill batch (Batch 3).',
    timelineEvents: [
      {
        id: 't1',
        time: 'Pending',
        title: 'DR Schedule Assigned',
        description: 'Waiting for upstream database failover signoff.',
        status: 'pending',
      },
    ],
    createdDate: '2026-09-01 10:45:00',
    lastUpdatedDate: '2026-09-01 10:45:00',
  },
  {
    id: 'app-011',
    appId: 'APP-011',
    appName: 'Enterprise Directory & SSO (Active Directory)',
    serverName: 'PRD-IAM-DC-01',
    environment: 'Production',
    appOwner: 'Nathan Cole',
    criticality: 'Critical',
    targetRto: 30,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 30,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '08:30:00',
    upDate: '2026-09-05',
    upTime: '08:54:10',
    ...computeRtoResult('2026-09-05', '08:30:00', '2026-09-05', '08:54:10', 30, 80),
    downEvidence: {
      id: 'ev-011-down',
      name: 'APP011_AD_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Active Directory & IAM', 'PRD-IAM-DC-01', 'DOWN', '08:30:00', 'Domain controller node 1 isolated'),
      uploadedAt: '2026-09-05 08:31:00',
      size: 210000,
      notes: 'AD forest replication paused.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-011-up',
      name: 'APP011_AD_Up.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Active Directory & IAM', 'PRD-IAM-DC-01', 'UP', '08:54:10', 'DR Domain controller promoted - Kerberos tickets issued'),
      uploadedAt: '2026-09-05 08:55:00',
      size: 220000,
      notes: 'Global catalog available.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Achieved in 24m 10s against 30m target.',
    timelineEvents: createTimeline('08:20', '08:30', '08:38', '08:54:10'),
    createdDate: '2026-09-01 10:50:00',
    lastUpdatedDate: '2026-09-05 08:55:00',
  },
  {
    id: 'app-012',
    appId: 'APP-012',
    appName: 'Automated Fraud Detection Engine',
    serverName: 'PRD-ML-FRAUD-12',
    environment: 'Production',
    appOwner: 'Siddharth Rao',
    criticality: 'Critical',
    targetRto: 30,
    targetRtoUnit: 'Minutes',
    targetRtoMinutes: 30,
    drDate: '2026-09-05',
    downDate: '2026-09-05',
    downTime: '14:30:00',
    upDate: '2026-09-05',
    upTime: '15:12:00',
    ...computeRtoResult('2026-09-05', '14:30:00', '2026-09-05', '15:12:00', 30, 80),
    downEvidence: {
      id: 'ev-012-down',
      name: 'APP012_Fraud_Down.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Fraud Detection Engine', 'PRD-ML-FRAUD-12', 'DOWN', '14:30:00', 'ML Model inference node taken down'),
      uploadedAt: '2026-09-05 14:31:00',
      size: 200000,
      notes: 'Inference streaming halted.',
      isDemo: true,
    },
    upEvidence: {
      id: 'ev-012-up',
      name: 'APP012_Fraud_Up.png',
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg('Fraud Detection Engine', 'PRD-ML-FRAUD-12', 'UP', '15:12:00', 'GPU inference cluster online in DR region'),
      uploadedAt: '2026-09-05 15:13:00',
      size: 240000,
      notes: 'Model weights reloaded in 42 minutes.',
      isDemo: true,
    },
    evidenceStatus: 'Complete',
    activityStatus: 'Completed',
    remarks: 'Breached by 12 minutes due to large model weights warm-up.',
    timelineEvents: createTimeline('14:15', '14:30', '14:48', '15:12:00'),
    createdDate: '2026-09-01 10:55:00',
    lastUpdatedDate: '2026-09-05 15:13:00',
  },
];

/**
 * Generator helper to create realistic batch applications up to 100
 */
export function generateFullRoster(count: number = 100): DRApplication[] {
  const existing = [...INITIAL_APPLICATIONS];
  if (existing.length >= count) return existing.slice(0, count);

  const owners = [
    'Sarah Jenkins', 'David Chen', 'Elena Rostova', 'Marcus Vance', 'Priya Sharma',
    'Chloe Bennett', 'Robert Mueller', 'Lisa Wong', 'Amina Al-Mansoor', 'Kevin O’Connor',
    'Nathan Cole', 'Siddharth Rao', 'Tanya Adams', 'George Sterling', 'Maya Lin',
    'Jason Patel', 'Fiona Gallagher', 'Carlos Mendez', 'Deepak Verma', 'Grace Hopper'
  ];

  const categories = [
    { prefix: 'FX-TRD', name: 'Foreign Exchange Trading System', crit: 'Critical', target: 30, unit: 'Minutes' },
    { prefix: 'ATM-SW', name: 'ATM Switch & Cash Management', crit: 'Critical', target: 45, unit: 'Minutes' },
    { prefix: 'KYC-AML', name: 'AML & Customer Screening Engine', crit: 'High', target: 60, unit: 'Minutes' },
    { prefix: 'LOAN-LOS', name: 'Commercial Loan Origination', crit: 'Medium', target: 120, unit: 'Minutes' },
    { prefix: 'SEC-LOG', name: 'SIEM & SOC Security Vault', crit: 'High', target: 60, unit: 'Minutes' },
    { prefix: 'NOTIF-GW', name: 'Customer SMS & Email Notifications', crit: 'Medium', target: 90, unit: 'Minutes' },
    { prefix: 'TAX-FIN', name: 'Regulatory Tax Reporting System', crit: 'Low', target: 240, unit: 'Minutes' },
    { prefix: 'INV-PORT', name: 'Wealth Management Portfolio Portal', crit: 'High', target: 60, unit: 'Minutes' },
    { prefix: 'SUP-TKT', name: 'IT ServiceDesk & Incident Management', crit: 'Medium', target: 120, unit: 'Minutes' },
    { prefix: 'EDI-GATE', name: 'SWIFT & Interbank EDI Gateway', crit: 'Critical', target: 30, unit: 'Minutes' },
    { prefix: 'AUD-REPO', name: 'Compliance Audit Document Repository', crit: 'Low', target: 360, unit: 'Minutes' },
    { prefix: 'API-EXT', name: 'Open Banking Third-Party API', crit: 'Critical', target: 45, unit: 'Minutes' },
  ];

  const envs: Array<'Production' | 'DR' | 'UAT' | 'Other'> = ['Production', 'Production', 'DR', 'UAT', 'Other'];

  for (let i = existing.length + 1; i <= count; i++) {
    const padId = i.toString().padStart(3, '0');
    const cat = categories[(i - 1) % categories.length];
    const owner = owners[(i - 1) % owners.length];
    const env = envs[i % envs.length];
    const appId = `APP-${padId}`;
    const serverName = `PRD-SRV-${cat.prefix}-${padId}`;
    const appName = `${cat.name} (${padId})`;
    
    // Distribute realistic statuses: 60% completed, 15% in progress, 15% not started, 10% failed
    const mod = i % 10;
    let activityStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Failed' | 'Partially Completed' = 'Completed';
    let downTime = '';
    let upTime = '';
    let downDate = '';
    let upDate = '';
    let isFailed = false;

    const baseHour = 8 + (i % 8);
    const padHour = baseHour.toString().padStart(2, '0');

    if (mod === 0) {
      activityStatus = 'Not Started';
    } else if (mod === 1 || mod === 2) {
      activityStatus = 'In Progress';
      downDate = '2026-09-05';
      downTime = `${padHour}:15:00`;
    } else if (mod === 9) {
      activityStatus = 'Failed';
      downDate = '2026-09-05';
      downTime = `${padHour}:00:00`;
      upDate = '2026-09-05';
      upTime = `${(baseHour + 2).toString().padStart(2, '0')}:30:00`;
      isFailed = true;
    } else {
      activityStatus = 'Completed';
      downDate = '2026-09-05';
      downTime = `${padHour}:00:00`;
      
      // Calculate actual RTO (some within target, some near, some breached)
      let actualMinutes = cat.target * (0.5 + (i % 6) * 0.15);
      if (mod === 7) actualMinutes = cat.target * 1.35; // breach
      if (mod === 8) actualMinutes = cat.target * 0.85; // near target
      
      const upHour = baseHour + Math.floor(actualMinutes / 60);
      const upMin = Math.floor(actualMinutes % 60);
      const upSec = (i * 7) % 60;
      upDate = '2026-09-05';
      upTime = `${upHour.toString().padStart(2, '0')}:${upMin.toString().padStart(2, '0')}:${upSec.toString().padStart(2, '0')}`;
    }

    const rtoRes = downDate && upTime ? computeRtoResult(downDate, downTime, upDate, upTime, cat.target, 80) : {
      actualRtoSeconds: null,
      actualRtoMinutes: null,
      actualRtoFormatted: null,
      rtoStatus: 'Not Started' as const,
      rtoVarianceMinutes: null,
    };

    const hasDown = !!downDate;
    const hasUp = !!upTime;

    const downEv = hasDown ? {
      id: `ev-${padId}-down`,
      name: `${appId}_Down_Evidence.png`,
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg(appName, serverName, 'DOWN', downTime, `Automated failover event logged for ${appName}`),
      uploadedAt: `2026-09-05 ${downTime}`,
      size: 210000,
      notes: 'Auto-captured during drill sequence.',
      isDemo: true,
    } : null;

    const upEv = hasUp ? {
      id: `ev-${padId}-up`,
      name: `${appId}_Up_Evidence.png`,
      type: 'image/png',
      dataUrl: generateDemoEvidenceSvg(appName, serverName, 'UP', upTime, `DR instance validated and active for ${appName}`),
      uploadedAt: `2026-09-05 ${upTime}`,
      size: 230000,
      notes: 'Auto-captured health check verification.',
      isDemo: true,
    } : null;

    const evStatus = calculateEvidenceStatus(downEv, upEv);

    existing.push({
      id: `app-${padId}`,
      appId,
      appName,
      serverName,
      environment: env,
      appOwner: owner,
      criticality: cat.crit as any,
      targetRto: cat.target,
      targetRtoUnit: cat.unit as any,
      targetRtoMinutes: cat.target,
      drDate: '2026-09-05',
      downDate,
      downTime,
      upDate,
      upTime,
      ...rtoRes,
      downEvidence: downEv,
      upEvidence: upEv,
      evidenceStatus: evStatus,
      activityStatus,
      remarks: isFailed ? 'Failover halted due to network timeout during replica mount.' : `Drill batch completed for ${cat.name}.`,
      timelineEvents: hasDown ? createTimeline(`${padHour}:00`, downTime, `${padHour}:15`, upTime, isFailed) : [
        {
          id: 't1',
          time: 'Pending',
          title: 'Scheduled in Queue',
          description: 'Awaiting coordinator start signal.',
          status: 'pending',
        }
      ],
      createdDate: '2026-09-01 11:00:00',
      lastUpdatedDate: `2026-09-05 ${upTime || downTime || '11:00:00'}`,
    });
  }

  return existing;
}

export const generateFull100ApplicationsRoster = (count: number = 100) => generateFullRoster(count);
