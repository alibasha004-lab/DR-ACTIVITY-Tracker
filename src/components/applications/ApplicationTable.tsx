import React, { useState, useMemo } from 'react';
import {
  DRApplication,
  FilterState,
  SortField,
  SortDirection,
} from '../../types';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2,
  Zap,
  Download,
  Upload,
  Plus,
  RotateCcw,
  Camera,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  RtoStatusBadge,
  ActivityStatusBadge,
  CriticalityBadge,
  EvidenceStatusBadge,
  EnvironmentBadge,
} from '../ui/StatusBadges';

interface ApplicationTableProps {
  applications: DRApplication[];
  onViewDetails: (app: DRApplication) => void;
  onEditApp: (app: DRApplication) => void;
  onDeleteApp: (app: DRApplication) => void;
  onQuickRecord: (app: DRApplication) => void;
  onNewApp: () => void;
  onExportCsv: () => void;
  onOpenImportCsv: () => void;
  onGenerateRoster: () => void;
  onPreviewEvidence: (app: DRApplication, type: 'down' | 'up') => void;
  activeFilter?: Partial<FilterState>;
  onClearFilter?: () => void;
}

export function ApplicationTable({
  applications,
  onViewDetails,
  onEditApp,
  onDeleteApp,
  onQuickRecord,
  onNewApp,
  onExportCsv,
  onOpenImportCsv,
  onGenerateRoster,
  onPreviewEvidence,
  activeFilter,
  onClearFilter,
}: ApplicationTableProps) {
  // Local search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOwner, setFilterOwner] = useState(activeFilter?.owner || 'ALL');
  const [filterEnv, setFilterEnv] = useState(activeFilter?.environment || 'ALL');
  const [filterCrit, setFilterCrit] = useState(activeFilter?.criticality || 'ALL');
  const [filterActivity, setFilterActivity] = useState(activeFilter?.activityStatus || 'ALL');
  const [filterRto, setFilterRto] = useState(activeFilter?.rtoStatus || 'ALL');
  const [filterEvidence, setFilterEvidence] = useState(activeFilter?.evidenceStatus || 'ALL');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('appId');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync when activeFilter prop changes
  React.useEffect(() => {
    if (activeFilter?.activityStatus) setFilterActivity(activeFilter.activityStatus);
    if (activeFilter?.rtoStatus) setFilterRto(activeFilter.rtoStatus);
    if (activeFilter?.evidenceStatus) setFilterEvidence(activeFilter.evidenceStatus);
    if (activeFilter?.environment) setFilterEnv(activeFilter.environment);
  }, [activeFilter]);

  // Unique owners for dropdown
  const uniqueOwners = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      if (a.appOwner) set.add(a.appOwner);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Filter logic
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          app.appId.toLowerCase().includes(q) ||
          app.appName.toLowerCase().includes(q) ||
          app.serverName.toLowerCase().includes(q) ||
          app.appOwner.toLowerCase().includes(q) ||
          (app.remarks && app.remarks.toLowerCase().includes(q));
        if (!match) return false;
      }

      if (filterOwner !== 'ALL' && app.appOwner !== filterOwner) return false;
      if (filterEnv !== 'ALL' && app.environment !== filterEnv) return false;
      if (filterCrit !== 'ALL' && app.criticality !== filterCrit) return false;
      if (filterActivity !== 'ALL' && app.activityStatus !== filterActivity) return false;
      if (filterRto !== 'ALL' && app.rtoStatus !== filterRto) return false;
      if (filterEvidence !== 'ALL' && app.evidenceStatus !== filterEvidence) return false;

      return true;
    });
  }, [
    applications,
    searchQuery,
    filterOwner,
    filterEnv,
    filterCrit,
    filterActivity,
    filterRto,
    filterEvidence,
  ]);

  // Sort logic
  const sortedApps = useMemo(() => {
    const list = [...filteredApps];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredApps, sortField, sortDir]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedApps.length / pageSize));
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedApps.slice(start, start + pageSize);
  }, [sortedApps, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterOwner('ALL');
    setFilterEnv('ALL');
    setFilterCrit('ALL');
    setFilterActivity('ALL');
    setFilterRto('ALL');
    setFilterEvidence('ALL');
    setCurrentPage(1);
    onClearFilter?.();
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    filterOwner !== 'ALL' ||
    filterEnv !== 'ALL' ||
    filterCrit !== 'ALL' ||
    filterActivity !== 'ALL' ||
    filterRto !== 'ALL' ||
    filterEvidence !== 'ALL';

  return (
    <div className="space-y-4">
      {/* Top Controls & Action Bar */}
      <div className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by App ID, Name, Server, Owner..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-md text-xs text-slate-200 placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={onNewApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Application</span>
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Export all filtered application records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Bulk import applications from CSV file"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>

            {applications.length === 0 && (
              <button
                type="button"
                onClick={onGenerateRoster}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition-colors shadow-xs cursor-pointer"
                title="Populate test roster with 20 default applications"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Load Sample (20 Apps)</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Environment */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Environment
            </label>
            <select
              value={filterEnv}
              onChange={(e) => {
                setFilterEnv(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Environments</option>
              <option value="Production">Production</option>
              <option value="DR">DR</option>
              <option value="UAT">UAT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Criticality */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Criticality
            </label>
            <select
              value={filterCrit}
              onChange={(e) => {
                setFilterCrit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Criticalities</option>
              <option value="Critical">Critical (Tier-1)</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Activity Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Activity Status
            </label>
            <select
              value={filterActivity}
              onChange={(e) => {
                setFilterActivity(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Activity</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
              <option value="Failed">Failed</option>
              <option value="Partially Completed">Partial</option>
            </select>
          </div>

          {/* RTO Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              RTO Status
            </label>
            <select
              value={filterRto}
              onChange={(e) => {
                setFilterRto(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All RTO Statuses</option>
              <option value="Within RTO">🟢 Within RTO</option>
              <option value="Near RTO">🟠 Near RTO (80%)</option>
              <option value="RTO Breached">🔴 RTO Breached</option>
              <option value="Not Started">⚪ Not Started</option>
            </select>
          </div>

          {/* Evidence Status */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Evidence
            </label>
            <select
              value={filterEvidence}
              onChange={(e) => {
                setFilterEvidence(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Evidence</option>
              <option value="Complete">Complete (2/2)</option>
              <option value="Partial">Partial (1/2)</option>
              <option value="Missing">Missing (0/2)</option>
            </select>
          </div>

          {/* Owner Filter / Reset */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Owner
            </label>
            <div className="flex items-center gap-1">
              <select
                value={filterOwner}
                onChange={(e) => {
                  setFilterOwner(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-blue-500 truncate"
              >
                <option value="ALL">All Owners</option>
                {uniqueOwners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Stats bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-slate-200 font-mono">{sortedApps.length}</span> of{' '}
          <span className="font-bold text-slate-200 font-mono">{applications.length}</span> registered applications
          {isFiltered && <span className="text-blue-400 font-medium ml-1.5">(Filtered)</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-slate-200"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Register Table */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-[#0f172a] text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                {/* 1. App ID */}
                <th
                  onClick={() => handleSort('appId')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>App ID</span>
                    {sortField === 'appId' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 2. Application Name */}
                <th
                  onClick={() => handleSort('appName')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Application Name</span>
                    {sortField === 'appName' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 3. Server Name */}
                <th className="py-3.5 px-4 whitespace-nowrap">Server</th>

                {/* 4. Environment */}
                <th className="py-3.5 px-3 whitespace-nowrap">Env</th>

                {/* 5. Owner */}
                <th
                  onClick={() => handleSort('appOwner')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Owner</span>
                    {sortField === 'appOwner' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 6. Criticality */}
                <th
                  onClick={() => handleSort('criticality')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Criticality</span>
                    {sortField === 'criticality' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 7. Target RTO */}
                <th
                  onClick={() => handleSort('targetRtoMinutes')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Target RTO</span>
                    {sortField === 'targetRtoMinutes' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 8. DR Down Time */}
                <th className="py-3.5 px-4 whitespace-nowrap">Down Time</th>

                {/* 9. DR Up Time */}
                <th className="py-3.5 px-4 whitespace-nowrap">Up Time</th>

                {/* 10. Actual RTO */}
                <th
                  onClick={() => handleSort('actualRtoMinutes')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Actual RTO</span>
                    {sortField === 'actualRtoMinutes' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 11. RTO Status */}
                <th
                  onClick={() => handleSort('rtoStatus')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    {sortField === 'rtoStatus' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 12. Evidence */}
                <th className="py-3.5 px-4 whitespace-nowrap">Evidence</th>

                {/* 13. Activity Status */}
                <th
                  onClick={() => handleSort('activityStatus')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-300 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Activity</span>
                    {sortField === 'activityStatus' ? (
                      sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                </th>

                {/* 14. Actions */}
                <th className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-[#0f172a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {paginatedApps.length > 0 ? (
                paginatedApps.map((app) => {
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      {/* 1. App ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDetails(app)}
                          className="hover:text-blue-400 hover:underline cursor-pointer font-bold"
                        >
                          {app.appId}
                        </button>
                      </td>

                      {/* 2. Application Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200 line-clamp-1">{app.appName}</div>
                        {app.remarks && (
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{app.remarks}</p>
                        )}
                      </td>

                      {/* 3. Server Name */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {app.serverName}
                      </td>

                      {/* 4. Environment */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <EnvironmentBadge env={app.environment} />
                      </td>

                      {/* 5. Owner */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {app.appOwner}
                      </td>

                      {/* 6. Criticality */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <CriticalityBadge criticality={app.criticality} />
                      </td>

                      {/* 7. Target RTO */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                        {app.targetRto} {app.targetRtoUnit.toLowerCase().startsWith('h') ? 'h' : 'm'}
                      </td>

                      {/* 8. Down Time */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {app.downTime ? (
                          <span className="text-slate-300">{app.downTime}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* 9. Up Time */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {app.upTime ? (
                          <span className="text-slate-300">{app.upTime}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* 10. Actual RTO */}
                      <td className="py-3.5 px-4 font-mono text-xs font-bold whitespace-nowrap">
                        {app.actualRtoFormatted ? (
                          <span
                            className={
                              app.rtoStatus === 'RTO Breached'
                                ? 'text-rose-400'
                                : app.rtoStatus === 'Near RTO'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {app.actualRtoFormatted}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">Pending</span>
                        )}
                      </td>

                      {/* 11. RTO Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <RtoStatusBadge status={app.rtoStatus} />
                      </td>

                      {/* 12. Evidence */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {/* D and U badges matching Design HTML */}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (app.downEvidence) onPreviewEvidence(app, 'down');
                              }}
                              className={`w-4 h-4 rounded-sm text-[8px] flex items-center justify-center font-bold ${
                                app.downEvidence
                                  ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                              title={app.downEvidence ? 'Down Screenshot Verified' : 'No Down Screenshot'}
                            >
                              D
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (app.upEvidence) onPreviewEvidence(app, 'up');
                              }}
                              className={`w-4 h-4 rounded-sm text-[8px] flex items-center justify-center font-bold ${
                                app.upEvidence
                                  ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400'
                                  : 'bg-slate-800 text-slate-500 border border-slate-700'
                              }`}
                              title={app.upEvidence ? 'Up Screenshot Verified' : 'No Up Screenshot'}
                            >
                              U
                            </button>
                          </div>
                          {app.downEvidence && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreviewEvidence(app, 'down');
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                              title="Preview Down screenshot"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {app.upEvidence && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPreviewEvidence(app, 'up');
                              }}
                              className="p-1 rounded text-teal-400 hover:text-teal-300 hover:bg-slate-800"
                              title="Preview Up screenshot"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 13. Activity Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <ActivityStatusBadge status={app.activityStatus} />
                      </td>

                      {/* 14. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap sticky right-0 bg-[#0f172a] group-hover:bg-slate-800/80 transition-colors">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Record */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickRecord(app);
                            }}
                            className="p-1.5 rounded-md text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                            title="Quick Record Timestamps & Evidence"
                          >
                            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </button>

                          {/* View Detail */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(app);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="View Detail & Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditApp(app);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Application Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteApp(app);
                            }}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-3">
                      <Clock className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">No matching applications found</p>
                      <p className="text-xs text-slate-500">
                        Try adjusting your filters, search term, or click Reset Filters.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        {isFiltered && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold text-blue-400 bg-slate-800 hover:bg-slate-700 border border-slate-700"
                          >
                            Reset Filters
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onNewApp}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500"
                        >
                          Add Application
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedApps.length > 0 && (
          <div className="py-3 px-4 bg-[#0f172a] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200 font-mono">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-200 font-mono">
                {Math.min(currentPage * pageSize, sortedApps.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-200 font-mono">{sortedApps.length}</span> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-3 py-1 font-mono font-medium text-slate-300">
                Page {currentPage} of {totalPages}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
