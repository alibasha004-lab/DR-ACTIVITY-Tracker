import { DRApplication, DRExerciseConfig, PortalSettings } from '../types';
import { computeRtoResult, calculateEvidenceStatus } from './rtoCalculator';

/**
 * Generates CSV string for applications and optionally triggers browser download
 */
export function exportApplicationsToCsv(
  applications: DRApplication[],
  exerciseName?: string
): string {
  const headers = [
    'Application ID',
    'Application Name',
    'Server Name',
    'Environment',
    'Application Owner',
    'Criticality',
    'Target RTO (Min)',
    'DR Date',
    'Server Down Date',
    'Server Down Time',
    'Server Up Date',
    'Server Up Time',
    'Actual RTO Formatted',
    'Actual RTO (Minutes)',
    'RTO Variance (Minutes)',
    'RTO Status',
    'Activity Status',
    'Evidence Status',
    'Created Date',
    'Last Updated Date',
    'Remarks',
  ];

  const rows = applications.map((app) => [
    `"${app.appId}"`,
    `"${app.appName.replace(/"/g, '""')}"`,
    `"${app.serverName}"`,
    `"${app.environment}"`,
    `"${app.appOwner.replace(/"/g, '""')}"`,
    `"${app.criticality}"`,
    app.targetRtoMinutes,
    `"${app.drDate || ''}"`,
    `"${app.downDate || ''}"`,
    `"${app.downTime || ''}"`,
    `"${app.upDate || ''}"`,
    `"${app.upTime || ''}"`,
    `"${app.actualRtoFormatted || 'N/A'}"`,
    app.actualRtoMinutes !== null ? app.actualRtoMinutes : '',
    app.rtoVarianceMinutes !== null ? app.rtoVarianceMinutes : '',
    `"${app.rtoStatus}"`,
    `"${app.activityStatus}"`,
    `"${app.evidenceStatus}"`,
    `"${app.createdDate || ''}"`,
    `"${app.lastUpdatedDate || ''}"`,
    `"${(app.remarks || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const filename = `${(exerciseName || 'DR_Exercise').replace(/\s+/g, '_')}_Applications_Report_${new Date().toISOString().substring(0, 10)}.csv`;
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

  return csvContent;
}

/**
 * Triggers JSON export download of all applications, drill configurations, and settings
 */
export function exportPortalToJson(
  applications: DRApplication[],
  exerciseConfig: DRExerciseConfig,
  settings: PortalSettings
): string {
  const data = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    organization: settings.organizationName,
    exerciseConfig,
    settings,
    applications,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `${(exerciseConfig.exerciseName || 'DR_Portal').replace(/\s+/g, '_')}_Backup_${new Date().toISOString().substring(0, 10)}.json`;
  downloadFile(jsonStr, filename, 'application/json;charset=utf-8;');

  return jsonStr;
}

/**
 * Triggers file download in browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/csv;charset=utf-8;'
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * CSV Template for bulk import
 */
export function getCsvTemplate(): string {
  const headers = [
    'Application ID',
    'Application Name',
    'Server Name',
    'Environment',
    'Application Owner',
    'Criticality',
    'Target RTO',
    'Target RTO Unit',
  ];

  const sampleRows = [
    ['APP-101', 'Payments Mobile Node', 'PRD-PAY-MOB-01', 'Production', 'Sarah Jenkins', 'Critical', '30', 'Minutes'],
    ['APP-102', 'Customer Vault Service', 'PRD-VAULT-02', 'Production', 'David Chen', 'High', '60', 'Minutes'],
    ['APP-103', 'Compliance Reporter', 'PRD-COMP-03', 'UAT', 'Lisa Wong', 'Medium', '2', 'Hours'],
    ['APP-104', 'Employee Portal', 'PRD-EMP-04', 'Other', 'Mark Davis', 'Low', '240', 'Minutes'],
  ];

  return [
    headers.join(','),
    ...sampleRows.map((r) => r.map((f) => `"${f}"`).join(',')),
  ].join('\r\n');
}

export function downloadCsvTemplate() {
  const template = getCsvTemplate();
  downloadFile(template, 'DR_Applications_Import_Template.csv', 'text/csv;charset=utf-8;');
}

/**
 * Parse and validate CSV imported text
 */
export function parseCsvToApplications(csvText: string): DRApplication[] {
  const importedApps: DRApplication[] = [];
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length <= 1) {
    throw new Error('CSV file contains no data rows.');
  }

  // Parse header line
  const headerLine = lines[0];
  const headers = splitCsvLine(headerLine).map((h) => h.toLowerCase().trim().replace(/['"]/g, ''));

  const appIdIdx = headers.findIndex((h) => h.includes('app') && h.includes('id'));
  const nameIdx = headers.findIndex((h) => h.includes('app') && h.includes('name'));
  const serverIdx = headers.findIndex((h) => h.includes('server'));
  const envIdx = headers.findIndex((h) => h.includes('env'));
  const ownerIdx = headers.findIndex((h) => h.includes('owner'));
  const critIdx = headers.findIndex((h) => h.includes('crit'));
  const targetIdx = headers.findIndex((h) => h.includes('target') && h.includes('rto'));
  const unitIdx = headers.findIndex((h) => h.includes('unit'));
  const downDateIdx = headers.findIndex((h) => h.includes('down') && h.includes('date'));
  const downTimeIdx = headers.findIndex((h) => h.includes('down') && h.includes('time'));
  const upDateIdx = headers.findIndex((h) => h.includes('up') && h.includes('date'));
  const upTimeIdx = headers.findIndex((h) => h.includes('up') && h.includes('time'));
  const remarksIdx = headers.findIndex((h) => h.includes('remark') || h.includes('note'));

  if (appIdIdx === -1 || nameIdx === -1) {
    throw new Error('Missing required columns: "Application ID" and "Application Name" are mandatory.');
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;
    const cols = splitCsvLine(rawLine);

    const appId = (cols[appIdIdx] || '').trim();
    const appName = (cols[nameIdx] || '').trim();

    if (!appId || !appName) continue;

    const serverName = serverIdx !== -1 && cols[serverIdx] ? cols[serverIdx].trim() : `SRV-${appId}`;
    const envRaw = envIdx !== -1 && cols[envIdx] ? cols[envIdx].trim() : 'Production';
    const env = (['Production', 'DR', 'UAT', 'Other'].includes(envRaw) ? envRaw : 'Production') as any;
    const owner = ownerIdx !== -1 && cols[ownerIdx] ? cols[ownerIdx].trim() : 'Unassigned';
    const critRaw = critIdx !== -1 && cols[critIdx] ? cols[critIdx].trim() : 'Medium';
    const crit = (['Critical', 'High', 'Medium', 'Low'].includes(critRaw) ? critRaw : 'Medium') as any;

    let targetRto = targetIdx !== -1 && cols[targetIdx] ? parseFloat(cols[targetIdx].trim()) : 60;
    if (isNaN(targetRto) || targetRto <= 0) targetRto = 60;

    let targetUnit = unitIdx !== -1 && cols[unitIdx] ? cols[unitIdx].trim() : 'Minutes';
    if (!['Minutes', 'Hours'].includes(targetUnit)) targetUnit = 'Minutes';

    const targetMinutes = targetUnit === 'Hours' ? targetRto * 60 : targetRto;

    const downDate = downDateIdx !== -1 && cols[downDateIdx] ? cols[downDateIdx].trim() : '';
    const downTime = downTimeIdx !== -1 && cols[downTimeIdx] ? cols[downTimeIdx].trim() : '';
    const upDate = upDateIdx !== -1 && cols[upDateIdx] ? cols[upDateIdx].trim() : '';
    const upTime = upTimeIdx !== -1 && cols[upTimeIdx] ? cols[upTimeIdx].trim() : '';
    const remarks = remarksIdx !== -1 && cols[remarksIdx] ? cols[remarksIdx].trim() : 'Imported via CSV.';

    const rtoCalc = computeRtoResult(downDate, downTime, upDate, upTime, targetMinutes, 80);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    importedApps.push({
      id: `app-imp-${Date.now()}-${i}`,
      appId: appId.toUpperCase(),
      appName,
      serverName,
      environment: env,
      appOwner: owner,
      criticality: crit,
      targetRto,
      targetRtoUnit: targetUnit as any,
      targetRtoMinutes: targetMinutes,
      drDate: '2026-09-05',
      downDate,
      downTime,
      upDate,
      upTime,
      actualRtoSeconds: rtoCalc.actualRtoSeconds,
      actualRtoMinutes: rtoCalc.actualRtoMinutes,
      actualRtoFormatted: rtoCalc.actualRtoFormatted,
      rtoStatus: rtoCalc.rtoStatus,
      rtoVarianceMinutes: rtoCalc.rtoVarianceMinutes,
      downEvidence: null,
      upEvidence: null,
      evidenceStatus: 'Missing',
      activityStatus: upDate && upTime ? 'Completed' : downDate && downTime ? 'In Progress' : 'Not Started',
      remarks,
      timelineEvents: [
        {
          id: `t-${Date.now()}-1`,
          time: 'Created',
          title: 'Application Registered',
          description: 'Added to DR application registry via CSV import.',
          status: 'completed',
        },
      ],
      createdDate: nowStr,
      lastUpdatedDate: nowStr,
    });
  }

  return importedApps;
}

/**
 * Split CSV line respecting quotes
 */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
