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
    Internship: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Hackathon: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Scholarship: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Research: 'bg-green-500/20 text-green-300 border-green-500/30',
    Competition: 'bg-red-500/20 text-red-300 border-red-500/30',
    Workshop: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Fellowship: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Job: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };
  return map[category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-300',
    CLOSING_SOON: 'bg-yellow-500/20 text-yellow-300',
    EXPIRED: 'bg-red-500/20 text-red-300',
    UPCOMING: 'bg-blue-500/20 text-blue-300',
    APPLIED: 'bg-indigo-500/20 text-indigo-300',
    SELECTED: 'bg-green-500/20 text-green-300',
    REJECTED: 'bg-red-500/20 text-red-300',
  };
  return map[status] || 'bg-slate-500/20 text-slate-300';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
