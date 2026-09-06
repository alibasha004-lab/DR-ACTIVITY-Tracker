import {
  DRApplication,
  EvidenceItem,
  EvidenceStatus,
  RtoStatus,
} from '../types';

/**
 * Parses date string (YYYY-MM-DD) and time string (HH:MM or HH:MM:SS) into Date object
 */
export function parseDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  
  // Clean time string - support HH:MM or HH:MM:SS
  const timeParts = timeStr.trim().split(':');
  if (timeParts.length < 2) return null;

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) return null;

  const dateParts = dateStr.trim().split('-');
  if (dateParts.length !== 3) return null;

  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
  const day = parseInt(dateParts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const date = new Date(year, month, day, hours, minutes, seconds);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Format total seconds into "02h 35m 30s" or "45m 12s" or "30s"
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) return '00s';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  }
  return `${pad(mins)}m ${pad(secs)}s`;
}

/**
 * Validate timestamps and target RTO
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage: string | null;
  downDateTime?: Date;
  upDateTime?: Date;
}

export function validateTimestamps(
  downDate: string,
  downTime: string,
  upDate: string,
  upTime: string,
  targetRto: number
): ValidationResult {
  if (targetRto <= 0) {
    return {
      isValid: false,
      errorMessage: 'Target RTO must be greater than zero.',
    };
  }

  const downDt = parseDateTime(downDate, downTime);
  const upDt = parseDateTime(upDate, upTime);

  if (!downDt && !upDt) {
    return {
      isValid: true,
      errorMessage: null,
    };
  }

  if (downDt && !upDt) {
    // In progress state - valid
    return {
      isValid: true,
      errorMessage: null,
      downDateTime: downDt,
    };
  }

  if (!downDt && upDt) {
    return {
      isValid: false,
      errorMessage: 'Server Down timestamp must be entered if Server Up timestamp is provided.',
    };
  }

  if (downDt && upDt) {
    if (upDt.getTime() < downDt.getTime()) {
      return {
        isValid: false,
        errorMessage: 'Server Up Time cannot be earlier than Server Down Time.',
      };
    }

    return {
      isValid: true,
      errorMessage: null,
      downDateTime: downDt,
      upDateTime: upDt,
    };
  }

  return { isValid: true, errorMessage: null };
}

/**
 * Computes Actual RTO, variance, and RTO status
 */
export function computeRtoResult(
  downDate: string,
  downTime: string,
  upDate: string,
  upTime: string,
  targetRtoMinutes: number,
  nearThresholdPercent: number = 80
): {
  actualRtoSeconds: number | null;
  actualRtoMinutes: number | null;
  actualRtoFormatted: string | null;
  rtoStatus: RtoStatus;
  rtoVarianceMinutes: number | null;
} {
  const downDt = parseDateTime(downDate, downTime);
  const upDt = parseDateTime(upDate, upTime);

  if (!downDt || !upDt || upDt.getTime() < downDt.getTime()) {
    return {
      actualRtoSeconds: null,
      actualRtoMinutes: null,
      actualRtoFormatted: null,
      rtoStatus: 'Not Started',
      rtoVarianceMinutes: null,
    };
  }

  const diffMs = upDt.getTime() - downDt.getTime();
  const totalSeconds = Math.round(diffMs / 1000);
  const totalMinutes = parseFloat((totalSeconds / 60).toFixed(2));
  const formatted = formatDuration(totalSeconds);

  // Variance: actual - target (+ means breach, - means beat target)
  const varianceMinutes = parseFloat((totalMinutes - targetRtoMinutes).toFixed(2));

  let rtoStatus: RtoStatus = 'Within RTO';
  const nearThresholdMinutes = (targetRtoMinutes * nearThresholdPercent) / 100;

  if (totalMinutes > targetRtoMinutes) {
    rtoStatus = 'RTO Breached';
  } else if (totalMinutes >= nearThresholdMinutes) {
    rtoStatus = 'Near RTO';
  } else {
    rtoStatus = 'Within RTO';
  }

  return {
    actualRtoSeconds: totalSeconds,
    actualRtoMinutes: totalMinutes,
    actualRtoFormatted: formatted,
    rtoStatus,
    rtoVarianceMinutes: varianceMinutes,
  };
}

/**
 * Determine evidence status
 */
export function calculateEvidenceStatus(
  downEvidence: EvidenceItem | null,
  upEvidence: EvidenceItem | null
): EvidenceStatus {
  const hasDown = !!downEvidence;
  const hasUp = !!upEvidence;

  if (hasDown && hasUp) return 'Complete';
  if (hasDown || hasUp) return 'Partial';
  return 'Missing';
}

/**
 * Generates an SVG Data URI for realistic demo evidence screenshots
 */
export function generateDemoEvidenceSvg(
  appName: string,
  serverName: string,
  type: 'DOWN' | 'UP',
  timestamp: string,
  details: string
): string {
  const isDown = type === 'DOWN';
  const bgColor = isDown ? '#1e1e24' : '#0f241d';
  const headerBg = isDown ? '#8b0000' : '#065f46';
  const badgeBg = isDown ? '#ef4444' : '#10b981';
  const badgeText = isDown ? 'SERVER OFFLINE / DR INITIATED' : 'SERVICES RESTORED & HEALTHY';
  const icon = isDown ? '⚠️ CRITICAL ALERT' : '✅ HEALTH CHECK PASSED';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="380" viewBox="0 0 640 380">
    <rect width="640" height="380" fill="${bgColor}" rx="10"/>
    <rect width="640" height="42" fill="${headerBg}" rx="10 10 0 0"/>
    <circle cx="20" cy="21" r="6" fill="#ff5f56"/>
    <circle cx="38" cy="21" r="6" fill="#ffbd2e"/>
    <circle cx="56" cy="21" r="6" fill="#27c93f"/>
    <text x="80" y="26" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">TERMINAL MONITOR: ${serverName} - [${type} EVIDENCE]</text>
    
    <!-- Status Badge -->
    <rect x="30" y="65" width="280" height="28" fill="${badgeBg}" rx="6"/>
    <text x="40" y="84" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">${badgeText}</text>
    
    <!-- System info box -->
    <rect x="30" y="105" width="580" height="150" fill="rgba(0,0,0,0.4)" rx="6" stroke="#374151" stroke-width="1"/>
    <text x="45" y="130" fill="#9ca3af" font-family="monospace" font-size="12">Timestamp: <tspan fill="#f3f4f6">${timestamp}</tspan></text>
    <text x="45" y="152" fill="#9ca3af" font-family="monospace" font-size="12">Target Host: <tspan fill="#60a5fa">${serverName}</tspan> (${appName})</text>
    <text x="45" y="174" fill="#9ca3af" font-family="monospace" font-size="12">Event Status: <tspan fill="${isDown ? '#f87171' : '#4ade80'}">${icon}</tspan></text>
    <text x="45" y="196" fill="#9ca3af" font-family="monospace" font-size="12">Telemetry Details: <tspan fill="#e5e7eb">${details}</tspan></text>
    <text x="45" y="218" fill="#9ca3af" font-family="monospace" font-size="12">Auditor Hash Verification: <tspan fill="#a78bfa">SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}</tspan></text>

    <!-- Console Output Simulation -->
    <rect x="30" y="268" width="580" height="85" fill="#111827" rx="6"/>
    <text x="45" y="292" fill="${isDown ? '#ef4444' : '#10b981'}" font-family="monospace" font-size="11">$ dr-probe --host ${serverName} --action verify</text>
    <text x="45" y="312" fill="#9ca3af" font-family="monospace" font-size="11">[SYS-RESILIENCE] ${isDown ? 'FAIL: Connection refused on port 443 / 8080 (Primary Site Down)' : 'SUCCESS: HTTP 200 OK - DR Node Active, DB synced (RTO verified)'}</text>
    <text x="45" y="332" fill="#6b7280" font-family="monospace" font-size="10">Automated DR Evidence Stamp • Authorized Drill Session 2026</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Date display formatter helper
 */
export function formatDate(dateStr: string, format: 'DD-MMM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY' = 'DD-MMM-YYYY'): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, monthIndex, day);
    
    if (isNaN(date.getTime())) return dateStr;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n: number) => n.toString().padStart(2, '0');

    if (format === 'DD-MMM-YYYY') {
      return `${pad(day)}-${months[monthIndex]}-${year}`;
    } else if (format === 'MM/DD/YYYY') {
      return `${pad(monthIndex + 1)}/${pad(day)}/${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
