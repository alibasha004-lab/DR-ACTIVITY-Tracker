import React from 'react';
import {
  LayoutDashboard,
  Server,
  Zap,
  ShieldAlert,
  FileText,
  Settings,
  FileSpreadsheet,
  Upload,
  Plus,
} from 'lucide-react';
import { DRApplication, TabType } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  applications: DRApplication[];
  onOpenNewApp: () => void;
  onOpenSettings: () => void;
  onExportCsv: () => void;
  onOpenImportCsv: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  applications,
  onOpenNewApp,
  onOpenSettings,
  onExportCsv,
  onOpenImportCsv,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}: SidebarProps) {
  const totalApps = applications.length;
  const completedApps = applications.filter((a) => a.activityStatus === 'Completed').length;
  const inProgressApps = applications.filter((a) => a.activityStatus === 'In Progress').length;
  const breachedApps = applications.filter((a) => a.rtoStatus === 'RTO Breached').length;

  const navItems: Array<{
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: Server,
      badge: totalApps,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'recorder',
      label: '9-Step DR Recorder',
      icon: Zap,
      badge: inProgressApps > 0 ? `${inProgressApps} Active` : undefined,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    },
    {
      id: 'exercise',
      label: 'DR Exercise Drill',
      icon: ShieldAlert,
    },
    {
      id: 'reports',
      label: 'Audit Reports',
      icon: FileText,
      badge: breachedApps > 0 ? `${breachedApps} Breached` : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    },
  ];

  const handleItemClick = (id: TabType) => {
    onSelectTab(id);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-full md:w-64 bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl p-5 flex flex-col justify-between shrink-0 space-y-6 ${
          mobileMenuOpen ? 'fixed left-4 top-20 z-50 w-72 shadow-2xl block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-5">
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Navigation
            </div>

            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-blue-400 border border-slate-700/70 shadow-xs'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-blue-400' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions in Sidebar */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Quick Actions
            </div>

            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={onOpenNewApp}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Add Application</span>
              </button>

              <button
                type="button"
                onClick={onExportCsv}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV Report</span>
              </button>

              <button
                type="button"
                onClick={onOpenImportCsv}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bulk CSV Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* System & Drill Status in sidebar */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium">Completion Rate</span>
              <span className="font-bold text-emerald-400 font-mono">
                {totalApps > 0 ? Math.round((completedApps / totalApps) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${totalApps > 0 ? (completedApps / totalApps) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex justify-between font-mono">
              <span>{completedApps} complete</span>
              <span>{totalApps} total</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[10px] uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2 text-emerald-400 text-xs normal-case font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Monitoring Active
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Portal Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
