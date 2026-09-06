import React, { useState, useEffect, useMemo } from 'react';
import {
  DRApplication,
  DRExerciseConfig,
  PortalSettings,
  TabType,
  FilterState,
} from './types';
import {
  generateFull100ApplicationsRoster,
  DEFAULT_EXERCISE_CONFIG,
  DEFAULT_SETTINGS,
} from './data/initialData';
import { exportApplicationsToCsv } from './utils/dataTransfer';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { KPICards } from './components/dashboard/KPICards';
import { QuickSummaryCharts } from './components/dashboard/QuickSummaryCharts';
import { ApplicationTable } from './components/applications/ApplicationTable';
import { ApplicationModal } from './components/applications/ApplicationModal';
import { ApplicationDetailModal } from './components/applications/ApplicationDetailModal';
import { DRQuickRecorder } from './components/recorder/DRQuickRecorder';
import { DRExerciseManager } from './components/exercise/DRExerciseManager';
import { ReportAuditView } from './components/reports/ReportAuditView';
import { SettingsModal } from './components/settings/SettingsModal';
import { CsvImportModal } from './components/modals/CsvImportModal';
import { ImagePreviewModal } from './components/modals/ImagePreviewModal';
import { CheckCircle2, ShieldCheck, Zap, Plus } from 'lucide-react';

const STORAGE_KEY_APPS = 'dr_portal_apps_v3';
const STORAGE_KEY_EXERCISE = 'dr_portal_exercise_v3';
const STORAGE_KEY_SETTINGS = 'dr_portal_settings_v3';

export function App() {
  // 1. Applications State with LocalStorage
  const [applications, setApplications] = useState<DRApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading applications from localStorage', e);
    }
    return generateFull100ApplicationsRoster(20);
  });

  // 2. DR Exercise Config State
  const [exerciseConfig, setExerciseConfig] = useState<DRExerciseConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXERCISE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading exercise config from localStorage', e);
    }
    return DEFAULT_EXERCISE_CONFIG;
  });

  // 3. Portal Settings State
  const [settings, setSettings] = useState<PortalSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter state for Application Table
  const [tableFilter, setTableFilter] = useState<Partial<FilterState>>({});

  // Modals & Drawers
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<DRApplication | null>(null);
  const [detailApp, setDetailApp] = useState<DRApplication | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [recorderAppId, setRecorderAppId] = useState<string | undefined>(undefined);

  // High-Res Image Preview State
  const [previewImageState, setPreviewImageState] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string | null;
  }>({
    isOpen: false,
    title: '',
    imageUrl: null,
  });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Sync to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
    } catch (e) {
      console.error('Failed to persist applications to localStorage', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXERCISE, JSON.stringify(exerciseConfig));
    } catch (e) {
      console.error('Failed to persist exerciseConfig to localStorage', e);
    }
  }, [exerciseConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings to localStorage', e);
    }
  }, [settings]);

  // Set of existing Application IDs
  const existingAppIds = useMemo(() => {
    return new Set(applications.map((a) => a.appId.toUpperCase()));
  }, [applications]);

  // Handlers for Application CRUD
  const handleSaveApplication = (savedApp: DRApplication) => {
    setApplications((prev) => {
      const existsIndex = prev.findIndex((a) => a.id === savedApp.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedApp;
        return updated;
      } else {
        return [savedApp, ...prev];
      }
    });
    setIsAppModalOpen(false);
    setEditingApp(null);
    showToast(`Application ${savedApp.appId} (${savedApp.appName}) saved successfully.`);
  };

  const handleDeleteApplication = (appToDelete: DRApplication) => {
    if (confirm(`Are you sure you want to delete ${appToDelete.appId} - ${appToDelete.appName}?`)) {
      setApplications((prev) => prev.filter((a) => a.id !== appToDelete.id));
      showToast(`Application ${appToDelete.appId} removed from register.`);
    }
  };

  const handleOpenAddApp = () => {
    setEditingApp(null);
    setIsAppModalOpen(true);
  };

  const handleOpenEditApp = (app: DRApplication) => {
    setEditingApp(app);
    setIsAppModalOpen(true);
  };

  const handleOpenQuickRecorder = (app?: DRApplication) => {
    if (app) {
      setRecorderAppId(app.id);
    } else if (applications.length > 0) {
      setRecorderAppId(applications[0].id);
    }
    setActiveTab('recorder');
  };

  const handleKpiFilterClick = (filterType: string, filterValue: string) => {
    if (filterValue === 'ALL') {
      setTableFilter({});
    } else if (filterType === 'activityStatus') {
      setTableFilter({ activityStatus: filterValue });
    } else if (filterType === 'rtoStatus') {
      setTableFilter({ rtoStatus: filterValue });
    }
    setActiveTab('applications');
  };

  const handleFilterEvidence = (evidenceStatus: string) => {
    setTableFilter({ evidenceStatus });
    setActiveTab('applications');
  };

  const handleFilterRto = (rtoStatus: string) => {
    setTableFilter({ rtoStatus });
    setActiveTab('applications');
  };

  const handleImportApplications = (importedApps: DRApplication[], overwrite: boolean) => {
    if (overwrite) {
      setApplications(importedApps);
      showToast(`Successfully imported ${importedApps.length} applications (Register overwritten).`);
    } else {
      setApplications((prev) => {
        const map = new Map<string, DRApplication>();
        prev.forEach((a) => map.set(a.appId.toUpperCase(), a));
        importedApps.forEach((a) => map.set(a.appId.toUpperCase(), a));
        return Array.from(map.values());
      });
      showToast(`Successfully merged ${importedApps.length} applications into register.`);
    }
    setActiveTab('applications');
  };

  const handlePopulateFullRoster = () => {
    const roster20 = generateFull100ApplicationsRoster(20);
    setApplications(roster20);
    showToast(`Loaded 20-application enterprise dataset.`);
  };

  const handleResetAllData = () => {
    const roster20 = generateFull100ApplicationsRoster(20);
    setApplications(roster20);
    setExerciseConfig(DEFAULT_EXERCISE_CONFIG);
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_APPS);
    localStorage.removeItem(STORAGE_KEY_EXERCISE);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    showToast('Reset all portal records to default 20-application drill.');
  };

  const handlePreviewImage = (title: string, dataUrl: string) => {
    setPreviewImageState({
      isOpen: true,
      title,
      imageUrl: dataUrl,
    });
  };

  const handleTablePreviewEvidence = (app: DRApplication, type: 'down' | 'up') => {
    const item = type === 'down' ? app.downEvidence : app.upEvidence;
    if (item?.dataUrl) {
      handlePreviewImage(
        `${app.appId} - ${type === 'down' ? 'Server Down' : 'Server Up'} Screenshot Evidence`,
        item.dataUrl
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col font-sans text-slate-200 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Header */}
      <Header
        exerciseConfig={exerciseConfig}
        applications={applications}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onNewApp={handleOpenAddApp}
        onOpenQuickRecorder={() => handleOpenQuickRecorder()}
        onOpenReport={() => setActiveTab('reports')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onGenerateRoster={handlePopulateFullRoster}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          applications={applications}
          onOpenNewApp={handleOpenAddApp}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportCsv={() => exportApplicationsToCsv(applications, exerciseConfig.exerciseName)}
          onOpenImportCsv={() => setIsCsvImportOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic Center Stage Views */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* VIEW 1: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Executive Welcome & Quick Action Bar */}
              <div className="bg-[#0f172a] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-100 tracking-tight flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                    <span>DR Activity &amp; RTO Reporting Portal</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Live drill recording, evidence tracking, and automatic RTO SLA variance analysis
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenQuickRecorder()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shadow-xs cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>9-Step Quick Recorder</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddApp}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add App</span>
                  </button>
                </div>
              </div>

              {/* 1. KPI Cards */}
              <KPICards
                applications={applications}
                settings={settings}
                onFilterClick={handleKpiFilterClick}
              />

              {/* 2. Visual Management Charts */}
              <QuickSummaryCharts
                applications={applications}
                onFilterEvidence={handleFilterEvidence}
                onFilterRto={handleFilterRto}
              />

              {/* 3. Embedded Application Register Table Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Application Disaster Recovery Register
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    View Full Table &rarr;
                  </button>
                </div>

                <ApplicationTable
                  applications={applications}
                  onViewDetails={(app) => setDetailApp(app)}
                  onEditApp={handleOpenEditApp}
                  onDeleteApp={handleDeleteApplication}
                  onQuickRecord={handleOpenQuickRecorder}
                  onNewApp={handleOpenAddApp}
                  onExportCsv={() => exportApplicationsToCsv(applications, exerciseConfig.exerciseName)}
                  onOpenImportCsv={() => setIsCsvImportOpen(true)}
                  onGenerateRoster={handlePopulateFullRoster}
                  onPreviewEvidence={handleTablePreviewEvidence}
                  activeFilter={tableFilter}
                  onClearFilter={() => setTableFilter({})}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: Full Application Register */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold text-slate-100">
                    Application Disaster Recovery Register ({applications.length} Apps)
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search, filter, record downtime/uptime timestamps, and review auditor screenshot evidence.
                  </p>
                </div>
              </div>

              <ApplicationTable
                applications={applications}
                onViewDetails={(app) => setDetailApp(app)}
                onEditApp={handleOpenEditApp}
                onDeleteApp={handleDeleteApplication}
                onQuickRecord={handleOpenQuickRecorder}
                onNewApp={handleOpenAddApp}
                onExportCsv={() => exportApplicationsToCsv(applications, exerciseConfig.exerciseName)}
                onOpenImportCsv={() => setIsCsvImportOpen(true)}
                onGenerateRoster={handlePopulateFullRoster}
                onPreviewEvidence={handleTablePreviewEvidence}
                activeFilter={tableFilter}
                onClearFilter={() => setTableFilter({})}
              />
            </div>
          )}

          {/* VIEW 3: 9-Step Guided DR Activity Recorder */}
          {activeTab === 'recorder' && (
            <DRQuickRecorder
              applications={applications}
              selectedAppId={recorderAppId}
              onSave={handleSaveApplication}
              settings={settings}
              onPreviewImage={handlePreviewImage}
            />
          )}

          {/* VIEW 4: Active Exercise Drill Manager */}
          {activeTab === 'exercise' && (
            <DRExerciseManager
              exerciseConfig={exerciseConfig}
              onUpdateConfig={(cfg) => {
                setExerciseConfig(cfg);
                showToast('Exercise drill settings updated.');
              }}
              applications={applications}
            />
          )}

          {/* VIEW 5: Management Reports & Audit Brief */}
          {activeTab === 'reports' && (
            <ReportAuditView
              applications={applications}
              exerciseConfig={exerciseConfig}
              settings={settings}
              onOpenImportModal={() => setIsCsvImportOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Floating Action / Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-slate-100 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => {
          setIsAppModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApplication}
        initialApp={editingApp}
        existingAppIds={existingAppIds}
        settings={settings}
        onPreviewImage={handlePreviewImage}
      />

      {/* Drill-down Application Detail Modal */}
      <ApplicationDetailModal
        application={detailApp}
        isOpen={!!detailApp}
        onClose={() => setDetailApp(null)}
        onEdit={(app) => {
          setDetailApp(null);
          handleOpenEditApp(app);
        }}
        onQuickRecord={(app) => {
          setDetailApp(null);
          handleOpenQuickRecorder(app);
        }}
        onPreviewImage={handlePreviewImage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Portal configuration updated.');
        }}
        onResetAllData={handleResetAllData}
        onPopulateFullRoster={handlePopulateFullRoster}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onImport={handleImportApplications}
        existingCount={applications.length}
      />

      {/* High-Resolution Screenshot Zoom Modal */}
      <ImagePreviewModal
        isOpen={previewImageState.isOpen}
        onClose={() => setPreviewImageState({ isOpen: false, title: '', imageUrl: null })}
        title={previewImageState.title}
        imageUrl={previewImageState.imageUrl}
      />
    </div>
  );
}

export default App;
