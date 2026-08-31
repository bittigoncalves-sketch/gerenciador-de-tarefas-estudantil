import { FileText, FileSpreadsheet, Presentation, Image as ImageIcon, Archive, FileCode, File, CheckCircle2, Clock, AlertTriangle, CheckCheck } from 'lucide-react';
import React from 'react';
import type { AssignmentStatus } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Sem data';
  try {
    const [year, month, day] = dateString.split('T')[0].split('-');
    if (!year || !month || !day) return dateString;
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getDueDateStatus(dueDateString: string, status: AssignmentStatus): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
  colorClass: string;
  badgeClass: string;
} {
  if (status === 'avaliado') {
    return {
      label: 'Avaliado',
      isOverdue: false,
      isToday: false,
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
    };
  }

  if (status === 'entregue') {
    return {
      label: 'Entregue',
      isOverdue: false,
      isToday: false,
      colorClass: 'text-blue-700 dark:text-blue-300',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = dueDateString.split('T')[0].split('-');
  const due = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysLate = Math.abs(diffDays);
    return {
      label: `Atrasado (${daysLate}d)`,
      isOverdue: true,
      isToday: false,
      colorClass: 'text-rose-700 dark:text-rose-300',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 font-semibold'
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Entrega Hoje!',
      isOverdue: false,
      isToday: true,
      colorClass: 'text-amber-700 dark:text-amber-300',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 font-semibold animate-pulse'
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Amanhã',
      isOverdue: false,
      isToday: false,
      colorClass: 'text-amber-700 dark:text-amber-300',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
    };
  }

  return {
    label: `Em ${diffDays} dias`,
    isOverdue: false,
    isToday: false,
    colorClass: 'text-slate-600 dark:text-slate-300',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };
}

export function getStatusBadge(status: AssignmentStatus) {
  switch (status) {
    case 'pendente':
      return {
        label: 'Pendente',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock,
      };
    case 'em_andamento':
      return {
        label: 'Em Andamento',
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        icon: Clock,
      };
    case 'entregue':
      return {
        label: 'Entregue',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: CheckCircle2,
      };
    case 'avaliado':
      return {
        label: 'Avaliado & Concluído',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCheck,
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-100 text-slate-800 border-slate-200',
        icon: Clock,
      };
  }
}

export function getFileIcon(filename: string, mimeType?: string): React.ComponentType<{ className?: string }> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return FileText;
  }
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext) || mimeType?.includes('word')) {
    return FileText;
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mimeType?.includes('sheet') || mimeType?.includes('excel')) {
    return FileSpreadsheet;
  }
  if (['ppt', 'pptx', 'odp'].includes(ext) || mimeType?.includes('presentation')) {
    return Presentation;
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.includes('image')) {
    return ImageIcon;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip') || mimeType?.includes('compressed')) {
    return Archive;
  }
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'json', 'sql'].includes(ext)) {
    return FileCode;
  }
  return File;
}

export function downloadFile(name: string, dataUrl?: string, content?: string): void {
  const link = document.createElement('a');
  if (dataUrl && dataUrl.startsWith('data:')) {
    link.href = dataUrl;
  } else {
    // Generate dummy downloadable text or blob if simulated
    const blob = new Blob([content || `Documento Escolar: ${name}\nRegistro Oficial do Portal de Trabalhos Escolares.\nData: ${new Date().toISOString()}`], {
      type: 'text/plain;charset=utf-8'
    });
    link.href = URL.createObjectURL(blob);
  }
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
