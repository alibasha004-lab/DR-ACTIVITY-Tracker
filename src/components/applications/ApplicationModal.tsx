import React, { useState, useEffect } from 'react';
import {
  DRApplication,
  EnvironmentType,
  CriticalityType,
  TargetRtoUnit,
  ActivityStatus,
  EvidenceItem,
  PortalSettings,
} from '../../types';
import {
  X,
  Clock,
  Upload,
  Camera,
  Trash2,
  AlertTriangle,
  FileCheck,
  Eye,
  Server,
  Zap,
} from 'lucide-react';
import {
  computeRtoResult,
  validateTimestamps,
  calculateEvidenceStatus,
  generateDemoEvidenceSvg,
} from '../../utils/rtoCalculator';
import { RtoStatusBadge } from '../ui/StatusBadges';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: DRApplication) => void;
  initialApp?: DRApplication | null;
  existingAppIds: Set<string>;
  settings: PortalSettings;
  onPreviewImage?: (title: string, dataUrl: string) => void;
}

export function ApplicationModal({
  isOpen,
  onClose,
  onSave,
  initialApp,
  existingAppIds,
  settings,
  onPreviewImage,
}: ApplicationModalProps) {
  const isEdit = !!initialApp;

  // Form states
  const [appId, setAppId] = useState('');
  const [appName, setAppName] = useState('');
  const [serverName, setServerName] = useState('');
  const [environment, setEnvironment] = useState<EnvironmentType>('Production');
  const [appOwner, setAppOwner] = useState('');
  const [criticality, setCriticality] = useState<CriticalityType>('Critical');
  const [targetRto, setTargetRto] = useState<number>(60);
  const [targetRtoUnit, setTargetRtoUnit] = useState<TargetRtoUnit>('Minutes');

  const [drDate, setDrDate] = useState('2026-09-05');
  const [downDate, setDownDate] = useState('');
  const [downTime, setDownTime] = useState('');
  const [upDate, setUpDate] = useState('');
  const [upTime, setUpTime] = useState('');

  const [activityStatus, setActivityStatus] = useState<ActivityStatus>('Not Started');
  const [remarks, setRemarks] = useState('');

  // Evidence states
  const [downEvidence, setDownEvidence] = useState<EvidenceItem | null>(null);
  const [upEvidence, setUpEvidence] = useState<EvidenceItem | null>(null);

  // Validation message
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form when opened
  useEffect(() => {
    if (initialApp) {
      setAppId(initialApp.appId);
      setAppName(initialApp.appName);
      setServerName(initialApp.serverName);
      setEnvironment(initialApp.environment);
      setAppOwner(initialApp.appOwner);
      setCriticality(initialApp.criticality);
      setTargetRto(initialApp.targetRto);
      setTargetRtoUnit(initialApp.targetRtoUnit);
      setDrDate(initialApp.drDate || '2026-09-05');
      setDownDate(initialApp.downDate || '');
      setDownTime(initialApp.downTime || '');
      setUpDate(initialApp.upDate || '');
      setUpTime(initialApp.upTime || '');
      setActivityStatus(initialApp.activityStatus);
      setRemarks(initialApp.remarks || '');
      setDownEvidence(initialApp.downEvidence || null);
      setUpEvidence(initialApp.upEvidence || null);
    } else {
      // Defaults for new application
      setAppId('');
      setAppName('');
      setServerName('');
      setEnvironment('Production');
      setAppOwner('');
      setCriticality('Critical');
      setTargetRto(60);
      setTargetRtoUnit('Minutes');
      setDrDate('2026-09-05');
      setDownDate('');
      setDownTime('');
      setUpDate('');
      setUpTime('');
      setActivityStatus('Not Started');
      setRemarks('');
      setDownEvidence(null);
      setUpEvidence(null);
    }
    setValidationError(null);
  }, [initialApp, isOpen]);

  const targetRtoMinutes = targetRtoUnit === 'Hours' ? Number(targetRto) * 60 : Number(targetRto);

  // Live validation of timestamps
  const timeValidation = validateTimestamps(downDate, downTime, upDate, upTime, targetRtoMinutes);

  // Live RTO calculation
  const rtoCalc = computeRtoResult(
    downDate,
    downTime,
    upDate,
    upTime,
    targetRtoMinutes,
    settings.nearRtoThresholdPercent
  );

  // File Upload Handlers (converts image to Base64 data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'down' | 'up'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      const newItem: EvidenceItem = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        type: file.type || 'image/png',
        uploadedAt: new Date().toLocaleTimeString('en-GB'),
        dataUrl,
        size: Math.round(file.size / 1024),
      };

      if (type === 'down') {
        setDownEvidence(newItem);
      } else {
        setUpEvidence(newItem);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateDemoEvidence = (type: 'down' | 'up') => {
    const defaultApp = appName || appId || 'Core Banking Application';
    const defaultSrv = serverName || 'PRD-SRV-CORE-01';
    const svgUrl = generateDemoEvidenceSvg(
      defaultApp,
      defaultSrv,
      type === 'down' ? 'DOWN' : 'UP',
      type === 'down' ? downTime || '10:00:00' : upTime || '10:45:00',
      type === 'down' ? 'Database instance shutdown' : 'All pods healthy & synced'
    );

    const item: EvidenceItem = {
      id: `ev-${Date.now()}`,
      name: `${type.toUpperCase()}_Screenshot_${appId || 'APP'}.svg`,
      type: 'image/svg+xml',
      uploadedAt: new Date().toLocaleTimeString('en-GB'),
      dataUrl: svgUrl,
      size: 24,
    };

    if (type === 'down') setDownEvidence(item);
    else setUpEvidence(item);
  };

  // Quick timestamp setter
  const handleQuickTimestamp = (type: 'down' | 'up') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    if (type === 'down') {
      setDownDate(dateStr);
      setDownTime(timeStr);
      if (activityStatus === 'Not Started') {
        setActivityStatus('In Progress');
      }
    } else {
      setUpDate(dateStr);
      setUpTime(timeStr);
      if (!downDate) setDownDate(dateStr);
      setActivityStatus('Completed');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanAppId = appId.trim().toUpperCase();
    const cleanAppName = appName.trim();
    const cleanServerName = serverName.trim();

    if (!cleanAppId) {
      setValidationError('Application ID is required (e.g. APP-001).');
      return;
    }

    if (!cleanAppName) {
      setValidationError('Application Name is required.');
      return;
    }

    if (!cleanServerName) {
      setValidationError('Server Name is required.');
      return;
    }

    // Check duplicate App ID on create
    if (!isEdit && existingAppIds.has(cleanAppId)) {
      setValidationError(`An application with ID "${cleanAppId}" already exists in the DR register.`);
      return;
    }

    // Check timestamp chronological validity if both are present
    if (!timeValidation.isValid) {
      setValidationError(timeValidation.errorMessage || 'Invalid downtime / uptime timestamps.');
      return;
    }

    const calculatedEvStatus = calculateEvidenceStatus(downEvidence, upEvidence);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const targetMinutes = targetRtoUnit === 'Hours' ? targetRto * 60 : targetRto;

    const savedApp: DRApplication = {
      id: initialApp?.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      appId: cleanAppId,
      appName: cleanAppName,
      serverName: cleanServerName,
      environment,
      appOwner: appOwner.trim() || 'Unassigned',
      criticality,
      targetRto: Number(targetRto),
      targetRtoUnit,
      targetRtoMinutes: targetMinutes,

      drDate,
      downDate: downDate || undefined,
      downTime: downTime || undefined,
      upDate: upDate || undefined,
      upTime: upTime || undefined,

      actualRtoSeconds: rtoCalc.actualRtoSeconds,
      actualRtoMinutes: rtoCalc.actualRtoMinutes,
      actualRtoFormatted: rtoCalc.actualRtoFormatted,
      rtoStatus: rtoCalc.rtoStatus,
      rtoVarianceMinutes: rtoCalc.rtoVarianceMinutes,

      downEvidence,
      upEvidence,
      evidenceStatus: calculatedEvStatus,

      activityStatus,
      remarks: remarks.trim(),
      timelineEvents: initialApp?.timelineEvents || [
        {
          id: `t-${Date.now()}-1`,
          time: downTime || '09:00',
          title: 'DR Activity Logged',
          description: 'Timestamps & configuration updated by operator.',
          status: 'completed',
        },
      ],
      createdDate: initialApp?.createdDate || nowStr,
      lastUpdatedDate: nowStr,
    };

    onSave(savedApp);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] rounded-xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617] shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {isEdit ? `Edit Application: ${initialApp?.appId}` : 'Add New Application to DR Register'}
            </h2>
            <p className="text-xs text-slate-400">
              Record server downtime, recovery timestamp evidence, and target SLA
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {/* Validation Error Alert */}
          {(validationError || !timeValidation.isValid) && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Validation Error</p>
                <p>{validationError || timeValidation.errorMessage}</p>
              </div>
            </div>
          )}

          {/* Section 1: Application Specifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              1. Application &amp; Server Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Application ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Application ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appId}
                  onChange={(e) => setAppId(e.target.value.toUpperCase())}
                  placeholder="e.g. APP-001"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono font-bold text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Application Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Application Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Core Banking System"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-medium text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Server Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Server Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="e.g. PRD-SRV-CORE-01"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Environment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Production">Production</option>
                  <option value="DR">DR</option>
                  <option value="UAT">UAT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Application Owner */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Application Owner</label>
                <input
                  type="text"
                  value={appOwner}
                  onChange={(e) => setAppOwner(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Business Criticality */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Criticality</label>
                <select
                  value={criticality}
                  onChange={(e) => setCriticality(e.target.value as CriticalityType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Critical">Tier-1 Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Target RTO Value */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target RTO <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={targetRto}
                  onChange={(e) => setTargetRto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Target RTO Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target RTO Unit</label>
                <select
                  value={targetRtoUnit}
                  onChange={(e) => setTargetRtoUnit(e.target.value as TargetRtoUnit)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: DR Activity Details & Timestamps */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                2. DR Timestamps &amp; Execution Details
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Format: 24-Hour (HH:MM:SS)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* DR Activity Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">DR Exercise Date</label>
                <input
                  type="date"
                  value={drDate}
                  onChange={(e) => setDrDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Activity Status */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Overall Activity Status</label>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value as ActivityStatus)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-semibold text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Partially Completed">Partially Completed</option>
                </select>
              </div>
            </div>

            {/* Server Down & Up Timestamps Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              {/* Server Down Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Server Down Timestamp
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickTimestamp('down')}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" /> Set to Now
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={downDate}
                    onChange={(e) => setDownDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                  />
                  <input
                    type="time"
                    step="1"
                    value={downTime}
                    onChange={(e) => setDownTime(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono font-bold text-slate-200"
                  />
                </div>
              </div>

              {/* Server Up Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Server Up Timestamp
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickTimestamp('up')}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" /> Set to Now
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={upDate}
                    onChange={(e) => setUpDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                  />
                  <input
                    type="time"
                    step="1"
                    value={upTime}
                    onChange={(e) => setUpTime(e.target.value)}
                    placeholder="HH:MM:SS"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono font-bold text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Automatic RTO Calculation Preview */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">
                3. Real-Time RTO Calculation Engine
              </span>
              <RtoStatusBadge status={rtoCalc.rtoStatus} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Target RTO SLA</span>
                <p className="text-base font-bold font-mono text-slate-100 mt-0.5">
                  {targetRtoUnit === 'Hours' ? targetRto * 60 : targetRto} min
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Actual RTO Calculated</span>
                <p className="text-base font-bold font-mono text-blue-400 mt-0.5">
                  {rtoCalc.actualRtoFormatted || 'Pending timestamps'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 font-semibold text-[10px] uppercase">Variance</span>
                <p className="text-base font-bold font-mono text-slate-200 mt-0.5">
                  {rtoCalc.rtoVarianceMinutes !== null
                    ? `${rtoCalc.rtoVarianceMinutes > 0 ? '+' : ''}${rtoCalc.rtoVarianceMinutes} min`
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Screenshot Evidence Upload */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-teal-400" />
                4. Auditor Evidence Screenshots
              </h3>
              <span className="text-[11px] text-slate-400">Supports PNG, JPG, SVG, WebP</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Down Screenshot */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Server Down Evidence
                  </span>
                  {downEvidence && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                {downEvidence ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => onPreviewImage?.('Down-Time Screenshot', downEvidence.dataUrl)}
                      className="h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative group cursor-pointer"
                    >
                      <img
                        src={downEvidence.dataUrl}
                        alt="Down Evidence"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[140px] font-mono">{downEvidence.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPreviewImage?.('Down-Time Screenshot', downEvidence.dataUrl)}
                          className="p-1 rounded text-blue-400 hover:bg-slate-800"
                          title="View Full Screenshot"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDownEvidence(null)}
                          className="p-1 rounded text-rose-400 hover:bg-slate-800"
                          title="Remove Screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-3 hover:bg-slate-950/70 transition-colors cursor-pointer text-center">
                      <Upload className="w-5 h-5 text-slate-500 mb-1" />
                      <span className="text-xs font-semibold text-blue-400">Upload Down Screenshot</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Click or drag &amp; drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'down')}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDemoEvidence('down')}
                      className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1 bg-slate-950 border border-slate-800 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      + Generate Simulated Down Evidence
                    </button>
                  </div>
                )}
              </div>

              {/* Up Screenshot */}
              <div className="border border-slate-800 rounded-xl p-4 bg-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Server Up Evidence
                  </span>
                  {upEvidence && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <FileCheck className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                {upEvidence ? (
                  <div className="space-y-2">
                    <div
                      onClick={() => onPreviewImage?.('Up-Time Screenshot', upEvidence.dataUrl)}
                      className="h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative group cursor-pointer"
                    >
                      <img
                        src={upEvidence.dataUrl}
                        alt="Up Evidence"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                        <Eye className="w-4 h-4" /> Preview
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[140px] font-mono">{upEvidence.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onPreviewImage?.('Up-Time Screenshot', upEvidence.dataUrl)}
                          className="p-1 rounded text-blue-400 hover:bg-slate-800"
                          title="View Full Screenshot"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpEvidence(null)}
                          className="p-1 rounded text-rose-400 hover:bg-slate-800"
                          title="Remove Screenshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-lg p-3 hover:bg-slate-950/70 transition-colors cursor-pointer text-center">
                      <Upload className="w-5 h-5 text-slate-500 mb-1" />
                      <span className="text-xs font-semibold text-teal-400">Upload Up Screenshot</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Click or drag &amp; drop</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'up')}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleGenerateDemoEvidence('up')}
                      className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1 bg-slate-950 border border-slate-800 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      + Generate Simulated Up Evidence
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Remarks / Audit Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Auditor Remarks &amp; Failover Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Storage cutover executed smoothly; database index rebuild took 8 minutes; SAN replica synced."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
            >
              {isEdit ? 'Save Application Changes' : 'Save Application Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
