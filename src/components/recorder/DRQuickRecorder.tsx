import React, { useState, useEffect } from 'react';
import {
  DRApplication,
  EvidenceItem,
  PortalSettings,
} from '../../types';
import {
  Zap,
  CheckCircle2,
  Upload,
  Camera,
  ArrowRight,
  ArrowLeft,
  Save,
  AlertTriangle,
  Server,
  FileCheck,
} from 'lucide-react';
import {
  computeRtoResult,
  validateTimestamps,
  calculateEvidenceStatus,
  generateDemoEvidenceSvg,
} from '../../utils/rtoCalculator';
import { RtoStatusBadge, CriticalityBadge, EnvironmentBadge } from '../ui/StatusBadges';

interface DRQuickRecorderProps {
  applications: DRApplication[];
  selectedAppId?: string;
  onSave: (application: DRApplication) => void;
  settings: PortalSettings;
  onPreviewImage?: (title: string, dataUrl: string) => void;
}

export function DRQuickRecorder({
  applications,
  selectedAppId,
  onSave,
  settings,
  onPreviewImage,
}: DRQuickRecorderProps) {
  const [selectedId, setSelectedId] = useState<string>(selectedAppId || (applications[0]?.id || ''));
  const currentApp = applications.find((a) => a.id === selectedId) || applications[0];

  // Active step (1 to 9)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Editable fields
  const [downDate, setDownDate] = useState('');
  const [downTime, setDownTime] = useState('');
  const [upDate, setUpDate] = useState('');
  const [upTime, setUpTime] = useState('');
  const [downEvidence, setDownEvidence] = useState<EvidenceItem | null>(null);
  const [upEvidence, setUpEvidence] = useState<EvidenceItem | null>(null);
  const [remarks, setRemarks] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync when currentApp changes
  useEffect(() => {
    if (currentApp) {
      setDownDate(currentApp.downDate || '2026-09-05');
      setDownTime(currentApp.downTime || '');
      setUpDate(currentApp.upDate || '2026-09-05');
      setUpTime(currentApp.upTime || '');
      setDownEvidence(currentApp.downEvidence || null);
      setUpEvidence(currentApp.upEvidence || null);
      setRemarks(currentApp.remarks || '');
      setSaveSuccess(false);
      setValidationError(null);
    }
  }, [currentApp]);

  if (!currentApp) {
    return (
      <div className="p-8 text-center bg-[#0f172a] rounded-xl border border-slate-800">
        <Server className="w-12 h-12 mx-auto text-slate-600" />
        <p className="mt-3 font-bold text-slate-300">No applications registered yet</p>
        <p className="text-xs text-slate-500">Add an application first to begin DR recording.</p>
      </div>
    );
  }

  const targetMinutes = currentApp.targetRtoMinutes;
  const rtoCalc = computeRtoResult(
    downDate,
    downTime,
    upDate,
    upTime,
    targetMinutes,
    settings.nearRtoThresholdPercent
  );

  const timeValidation = validateTimestamps(
    downDate,
    downTime,
    upDate,
    upTime,
    targetMinutes
  );

  const handleSetNow = (type: 'down' | 'up') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];

    if (type === 'down') {
      setDownDate(dateStr);
      setDownTime(timeStr);
    } else {
      setUpDate(dateStr);
      setUpTime(timeStr);
      if (!downDate) setDownDate(dateStr);
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'down' | 'up'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      const item: EvidenceItem = {
        id: `ev-${Date.now()}`,
        name: file.name,
        type: file.type || 'image/png',
        uploadedAt: new Date().toLocaleTimeString('en-GB'),
        dataUrl,
        size: Math.round(file.size / 1024),
      };

      if (type === 'down') setDownEvidence(item);
      else setUpEvidence(item);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulateEvidence = (type: 'down' | 'up') => {
    const svgUrl = generateDemoEvidenceSvg(
      currentApp.appName || currentApp.appId,
      currentApp.serverName,
      type === 'down' ? 'DOWN' : 'UP',
      type === 'down' ? downTime || '10:00:00' : upTime || '10:45:00',
      type === 'down' ? 'Service offline alert' : 'Service health check 200 OK'
    );
    const item: EvidenceItem = {
      id: `ev-${Date.now()}`,
      name: `${type.toUpperCase()}_Screenshot_${currentApp.appId}.svg`,
      type: 'image/svg+xml',
      uploadedAt: new Date().toLocaleTimeString('en-GB'),
      dataUrl: svgUrl,
      size: 24,
    };
    if (type === 'down') setDownEvidence(item);
    else setUpEvidence(item);
  };

  const handleSaveRecord = () => {
    setValidationError(null);

    if (downDate && downTime && upDate && upTime && !timeValidation.isValid) {
      setValidationError(timeValidation.errorMessage || 'Invalid timestamps.');
      return;
    }

    const calculatedEvStatus = calculateEvidenceStatus(downEvidence, upEvidence);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let finalActivityStatus = currentApp.activityStatus;
    if (downTime && upTime) finalActivityStatus = 'Completed';
    else if (downTime) finalActivityStatus = 'In Progress';

    const updated: DRApplication = {
      ...currentApp,
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
      activityStatus: finalActivityStatus,
      remarks: remarks || currentApp.remarks,
      lastUpdatedDate: nowStr,
    };

    onSave(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const stepsList = [
    { num: 1, title: 'Select App', subtitle: 'Target System & SLA' },
    { num: 2, title: 'Down Timestamp', subtitle: 'Server Shutdown Time' },
    { num: 3, title: 'Down Evidence', subtitle: 'Offline Screenshot' },
    { num: 4, title: 'Up Timestamp', subtitle: 'Recovery Time' },
    { num: 5, title: 'Up Evidence', subtitle: 'Online Proof' },
    { num: 6, title: 'Calculate RTO', subtitle: 'Calculated Duration' },
    { num: 7, title: 'Target vs Actual', subtitle: 'SLA Comparison' },
    { num: 8, title: 'Verify Status', subtitle: 'Compliance Badge' },
    { num: 9, title: 'Save Record', subtitle: 'Audit Persistence' },
  ];

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              9-Step Guided DR Activity Recorder
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time workflow for recording downtime/up-time evidence and verifying RTO compliance.
          </p>
        </div>

        {/* Quick App Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-400 shrink-0">Active App:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full md:w-64 text-xs font-semibold bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.appId} - {app.appName} ({app.targetRtoMinutes}m SLA)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 9-Step Progress Ribbon */}
      <div className="bg-[#0f172a] rounded-xl p-3 border border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[750px] gap-2">
          {stepsList.map((step) => {
            const isDone = activeStep > step.num;
            const isCurrent = activeStep === step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setActiveStep(step.num)}
                className={`flex-1 p-2 rounded-lg text-left transition-all cursor-pointer border ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/30'
                    : isDone
                    ? 'bg-emerald-950/40 border-emerald-800/60 hover:bg-emerald-900/30'
                    : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : step.num}
                  </span>
                  <span className={`text-xs font-bold truncate ${isCurrent ? 'text-blue-300' : isDone ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate pl-6">{step.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Panel */}
      <div className="bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-sm space-y-6">
        {validationError && (
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">
              Success! Application DR record and RTO calculations saved to register.
            </span>
          </div>
        )}

        {/* STEP 1: Select Application */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 1 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Select Target Application</h3>
              <p className="text-xs text-slate-400">Confirm application metadata, host, and target RTO SLA.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Application ID</span>
                <p className="text-base font-bold font-mono text-slate-100 mt-0.5">{currentApp.appId}</p>
                <p className="text-xs text-slate-300 font-medium">{currentApp.appName}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Host Server</span>
                <p className="text-base font-bold font-mono text-slate-100 mt-0.5">{currentApp.serverName}</p>
                <div className="mt-1">
                  <EnvironmentBadge env={currentApp.environment} />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Criticality &amp; Owner</span>
                <div className="mt-1">
                  <CriticalityBadge criticality={currentApp.criticality} />
                </div>
                <p className="text-xs text-slate-300 mt-1">{currentApp.appOwner}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target RTO SLA</span>
                <p className="text-xl font-bold font-mono text-blue-400 mt-0.5">{currentApp.targetRtoMinutes} min</p>
                <p className="text-[11px] text-slate-500">
                  ({currentApp.targetRto} {currentApp.targetRtoUnit.toLowerCase()})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Enter Down Timestamp */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 2 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Enter Server Down Date &amp; Time</h3>
              <p className="text-xs text-slate-400">Record exact timestamp when primary instance unmounted or shut down.</p>
            </div>

            <div className="max-w-md space-y-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Server Down Date &amp; Time</label>
                <button
                  type="button"
                  onClick={() => handleSetNow('down')}
                  className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-bold hover:bg-rose-900/60 flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Stamp Current Time
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    value={downDate}
                    onChange={(e) => setDownDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Time (HH:MM:SS)</label>
                  <input
                    type="time"
                    step="1"
                    value={downTime}
                    onChange={(e) => setDownTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono font-bold text-slate-100"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Current recorded down time:{' '}
                <strong className="font-mono text-slate-200">{downDate} {downTime || 'Not set'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Upload Down Evidence */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 3 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Upload Down-Time Screenshot Evidence</h3>
              <p className="text-xs text-slate-400">Attach screenshot or console log proving the server/service was down.</p>
            </div>

            <div className="max-w-xl">
              {downEvidence ? (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-4 h-4" /> Down Evidence Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setDownEvidence(null)}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Replace Screenshot
                    </button>
                  </div>
                  <img
                    src={downEvidence.dataUrl}
                    alt="Down Evidence"
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                  <p className="text-xs text-slate-400 font-mono">{downEvidence.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 hover:bg-slate-900 transition-colors cursor-pointer text-center bg-slate-950">
                    <Camera className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-sm font-bold text-blue-400">Upload Down-Time Screenshot</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'down')}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSimulateEvidence('down')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-xs font-semibold cursor-pointer"
                  >
                    + Generate Simulated Down Evidence Screenshot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Enter Up Timestamp */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 4 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Enter Server Up Date &amp; Time</h3>
              <p className="text-xs text-slate-400">Record timestamp when the application/server was restored and healthy.</p>
            </div>

            <div className="max-w-md space-y-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Server Up Date &amp; Time</label>
                <button
                  type="button"
                  onClick={() => handleSetNow('up')}
                  className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Stamp Current Time
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Date</label>
                  <input
                    type="date"
                    value={upDate}
                    onChange={(e) => setUpDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400">Time (HH:MM:SS)</label>
                  <input
                    type="time"
                    step="1"
                    value={upTime}
                    onChange={(e) => setUpTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono font-bold text-slate-100"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Current recorded up time:{' '}
                <strong className="font-mono text-slate-200">{upDate} {upTime || 'Not set'}</strong>
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Upload Up Evidence */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 5 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Upload Up-Time Screenshot Evidence</h3>
              <p className="text-xs text-slate-400">Attach screenshot proving successful recovery &amp; service restoration.</p>
            </div>

            <div className="max-w-xl">
              {upEvidence ? (
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <FileCheck className="w-4 h-4" /> Up Evidence Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setUpEvidence(null)}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Replace Screenshot
                    </button>
                  </div>
                  <img
                    src={upEvidence.dataUrl}
                    alt="Up Evidence"
                    className="w-full h-44 object-cover rounded-lg border border-slate-800"
                  />
                  <p className="text-xs text-slate-400 font-mono">{upEvidence.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 hover:bg-slate-900 transition-colors cursor-pointer text-center bg-slate-950">
                    <Camera className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-sm font-bold text-teal-400">Upload Up-Time Screenshot</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'up')}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSimulateEvidence('up')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-md text-xs font-semibold cursor-pointer"
                  >
                    + Generate Simulated Up Evidence Screenshot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: System Automatically Calculates Actual RTO */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 6 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Automatic RTO Calculation</h3>
              <p className="text-xs text-slate-400">
                Formula: Actual RTO = Server Up Timestamp - Server Down Timestamp
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span>Timestamp Delta Equation</span>
                <span className="font-mono text-amber-400">Up - Down</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Server Down</span>
                  <p className="text-base font-bold font-mono text-rose-400 mt-1">
                    {downTime || 'Not set'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400">Server Up</span>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-1">
                    {upTime || 'Not set'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-950/60 border border-blue-700/60">
                  <span className="text-xs text-blue-300">Calculated Actual RTO</span>
                  <p className="text-xl font-bold font-mono text-white mt-1">
                    {rtoCalc.actualRtoFormatted || 'Incomplete'}
                  </p>
                  <p className="text-[11px] text-blue-300">
                    {rtoCalc.actualRtoMinutes !== null ? `${rtoCalc.actualRtoMinutes} total minutes` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Compare Actual vs Target RTO */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 7 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Target SLA vs. Actual Recovery</h3>
              <p className="text-xs text-slate-400">Checking if Actual RTO &le; Target RTO SLA threshold.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Target RTO SLA</span>
                <p className="text-2xl font-bold font-mono text-slate-100">{targetMinutes} min</p>
                <p className="text-xs text-slate-500">Maximum allowed downtime</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase">Actual Restored Duration</span>
                <p className="text-2xl font-bold font-mono text-blue-400">
                  {rtoCalc.actualRtoFormatted || 'Pending'}
                </p>
                <p className="text-xs text-slate-500">
                  {rtoCalc.actualRtoMinutes !== null ? `${rtoCalc.actualRtoMinutes} min achieved` : 'Missing timestamps'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: RTO Status & Compliance Badge */}
        {activeStep === 8 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 8 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">RTO Compliance Status</h3>
              <p className="text-xs text-slate-400">Auditor classification based on SLA comparison.</p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 flex flex-col items-center justify-center text-center space-y-3">
              <div className="scale-125">
                <RtoStatusBadge status={rtoCalc.rtoStatus} />
              </div>

              <div className="max-w-md mt-2">
                <h4 className="text-base font-bold text-slate-100">
                  {rtoCalc.rtoStatus === 'Within RTO'
                    ? '🟢 RTO Achieved — Drill Passed'
                    : rtoCalc.rtoStatus === 'Near RTO'
                    ? '🟠 Near RTO Alert — Drill Warning (80%+ Budget Consumed)'
                    : rtoCalc.rtoStatus === 'RTO Breached'
                    ? '🔴 RTO Breached — Target SLA Exceeded'
                    : '⚪ Pending Completion'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {rtoCalc.rtoVarianceMinutes !== null
                    ? rtoCalc.rtoVarianceMinutes <= 0
                      ? `Application was successfully recovered with ${Math.abs(rtoCalc.rtoVarianceMinutes)} minutes of SLA buffer remaining.`
                      : `Application recovery exceeded the target SLA by ${rtoCalc.rtoVarianceMinutes} minutes.`
                    : 'Please enter both down and up timestamps to compute final status.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Save Record */}
        {activeStep === 9 && (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Step 9 of 9</span>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">Save Application DR Record</h3>
              <p className="text-xs text-slate-400">Final audit review and persistence to local register.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">App ID:</span>
                  <p className="font-bold font-mono text-slate-200">{currentApp.appId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Actual RTO:</span>
                  <p className="font-bold font-mono text-blue-400">{rtoCalc.actualRtoFormatted || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">RTO Status:</span>
                  <div className="mt-0.5">
                    <RtoStatusBadge status={rtoCalc.rtoStatus} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Evidence Status:</span>
                  <div className="mt-0.5">
                    <FileCheck className="w-4 h-4 text-teal-400 inline mr-1" />
                    <span className="font-semibold text-slate-200">
                      {calculateEvidenceStatus(downEvidence, upEvidence)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Notes regarding cutover, database recovery, and testing verification..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveRecord}
                className="px-6 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Application Record</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">Step {activeStep} / 9</span>

          {activeStep < 9 ? (
            <button
              type="button"
              onClick={() => setActiveStep((s) => Math.min(9, s + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveRecord}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Complete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
