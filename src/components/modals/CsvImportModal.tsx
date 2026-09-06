import React, { useState } from 'react';
import { DRApplication } from '../../types';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
} from 'lucide-react';
import { parseCsvToApplications, downloadCsvTemplate } from '../../utils/dataTransfer';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedApps: DRApplication[], overwrite: boolean) => void;
  existingCount: number;
}

export function CsvImportModal({
  isOpen,
  onClose,
  onImport,
  existingCount,
}: CsvImportModalProps) {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState<DRApplication[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overwriteMode, setOverwriteMode] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      try {
        const apps = parseCsvToApplications(text);
        if (apps.length === 0) {
          setErrorMessage('No valid application rows detected in the provided CSV file.');
          setParsedPreview([]);
        } else {
          setParsedPreview(apps);
          setErrorMessage(null);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse CSV file.');
        setParsedPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleTextareaChange = (text: string) => {
    setCsvContent(text);
    if (!text.trim()) {
      setParsedPreview([]);
      setErrorMessage(null);
      return;
    }
    try {
      const apps = parseCsvToApplications(text);
      setParsedPreview(apps);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid CSV syntax.');
      setParsedPreview([]);
    }
  };

  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) {
      setErrorMessage('Please upload or paste a valid CSV file before importing.');
      return;
    }
    onImport(parsedPreview, overwriteMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0f172a] rounded-xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#020617] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Bulk Import Applications via CSV</h2>
              <p className="text-xs text-slate-400">Upload multiple applications and server records in bulk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-300">
          {/* Template download helper */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-blue-300 font-medium">Need the correct column structure?</span>
            </div>
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 border border-blue-600/40 text-blue-300 font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Box */}
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 hover:bg-slate-900 transition-colors cursor-pointer text-center bg-slate-950">
              <Upload className="w-7 h-7 text-slate-500 mb-1.5" />
              <span className="text-xs font-bold text-blue-400">
                {fileName ? fileName : 'Click to browse or drop CSV file here'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">Supports standard UTF-8 CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Or Paste CSV */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Or Paste Raw CSV Data</label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => handleTextareaChange(e.target.value)}
              placeholder="Application ID,Application Name,Server Name,Environment,Application Owner,Criticality,Target RTO,Target RTO Unit,DR Date,Down Date,Down Time,Up Date,Up Time,Activity Status,Remarks"
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-md font-mono text-[11px] text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Parsed {parsedPreview.length} Applications
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-[#0f172a] text-slate-400 border-b border-slate-800 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Server</th>
                      <th className="p-2">Target RTO</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {parsedPreview.slice(0, 15).map((app, i) => (
                      <tr key={i} className="hover:bg-slate-900/60">
                        <td className="p-2 font-mono font-bold text-slate-200">{app.appId}</td>
                        <td className="p-2 font-medium">{app.appName}</td>
                        <td className="p-2 font-mono text-slate-400">{app.serverName}</td>
                        <td className="p-2">{app.targetRtoMinutes}m</td>
                        <td className="p-2">{app.activityStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedPreview.length > 15 && (
                <p className="text-[10px] text-slate-500 italic">
                  Showing first 15 of {parsedPreview.length} entries...
                </p>
              )}
            </div>
          )}

          {/* Overwrite mode radio */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={!overwriteMode}
                onChange={() => setOverwriteMode(false)}
                className="text-blue-500"
              />
              <span>
                <strong className="text-slate-200">Append / Merge:</strong> Add to existing {existingCount} applications
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={overwriteMode}
                onChange={() => setOverwriteMode(true)}
                className="text-rose-500"
              />
              <span className="text-rose-400">
                <strong>Replace All:</strong> Clear current register
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#020617] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleExecuteImport}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import {parsedPreview.length} Applications</span>
          </button>
        </div>
      </div>
    </div>
  );
}
