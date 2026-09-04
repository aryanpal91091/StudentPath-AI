import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function daysUntil(dateStr?: string | null): number {
  if (!dateStr) return 999;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    Internship: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    Hackathon: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    Scholarship: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    Research: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    Competition: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    Workshop: 'bg-cyan-50 text-cyan-800 border-cyan-200 font-semibold',
    Fellowship: 'bg-orange-50 text-orange-800 border-orange-200 font-semibold',
    Job: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
  };
  return map[category] || 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    CLOSING_SOON: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    APPLIED: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
