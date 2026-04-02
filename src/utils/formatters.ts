// ─── BoxDesign AI — Formatters ────────────────────────────────────────────────
import { GST_RATE } from './constants';

/** Format INR currency */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Calculate GST amount */
export function calcGST(base: number): { gstAmount: number; totalAmount: number } {
  const gstAmount = Math.round(base * GST_RATE);
  const totalAmount = base + gstAmount;
  return { gstAmount, totalAmount };
}

/** Format file size */
export function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Relative time (e.g. "2 days ago") */
export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return new Date(isoString).toLocaleDateString('en-IN');
}

/** mm → display string with unit */
export function formatDimension(mm: number, unit: 'mm'|'cm'|'inches'): string {
  if (unit === 'cm')     return `${(mm / 10).toFixed(1)} cm`;
  if (unit === 'inches') return `${(mm / 25.4).toFixed(2)}"`;
  return `${mm} mm`;
}

/** Capitalise first letter */
export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
