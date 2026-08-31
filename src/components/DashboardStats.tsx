import React from 'react';
import { BookOpen, Files, CheckCircle2, AlertTriangle, Clock, HardDrive, ArrowUpRight } from 'lucide-react';
import type { StatsSummary } from '../types';

interface DashboardStatsProps {
  stats: StatsSummary | null;
  onSelectUrgencyFilter: (urgency: string) => void;
  onSelectStatusFilter: (status: string) => void;
  currentUrgency: string;
  currentStatus: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  onSelectUrgencyFilter,
  onSelectStatusFilter,
  currentUrgency,
  currentStatus,
}) => {
  if (!stats) return null;

  const total = stats.totalAssignments || 0;
  const completedRate = total > 0 ? Math.round(((stats.completedCount + stats.evaluatedCount) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Total Assignments */}
      <div 
        onClick={() => {
          onSelectStatusFilter('todos');
          onSelectUrgencyFilter('todos');
        }}
        className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total de Trabalhos
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.totalAssignments}
          </span>
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:underline">
            Ver todos <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>{stats.pendingCount} pendentes • {stats.inProgressCount} em andamento</span>
        </div>
      </div>

      {/* Card 2: Attached Files & Storage */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Arquivos Armazenados
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Files className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {stats.totalFiles} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">arquivos</span>
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
            {stats.totalSizeMB} MB
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <HardDrive className="w-3.5 h-3.5 text-blue-500" />
          <span>Banco de dados local sincronizado</span>
        </div>
      </div>

      {/* Card 3: Completed / Entregues */}
      <div 
        onClick={() => onSelectStatusFilter(currentStatus === 'entregue' ? 'todos' : 'entregue')}
        className={`bg-white dark:bg-slate-800/90 border rounded-2xl p-4 sm:p-5 shadow-xs transition-all cursor-pointer group ${
          currentStatus === 'entregue'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
            : 'border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Taxa de Entrega
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {completedRate}%
          </span>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {stats.completedCount + stats.evaluatedCount} entregues
          </span>
        </div>
        <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completedRate}%` }}
          />
        </div>
      </div>

      {/* Card 4: Overdue Alert / Prazos Críticos */}
      <div 
        onClick={() => onSelectUrgencyFilter(currentUrgency === 'atrasados' ? 'todos' : 'atrasados')}
        className={`bg-white dark:bg-slate-800/90 border rounded-2xl p-4 sm:p-5 shadow-xs transition-all cursor-pointer group ${
          currentUrgency === 'atrasados'
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30 dark:bg-rose-950/30'
            : stats.overdueCount > 0
              ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
              : 'border-slate-200/80 dark:border-slate-700/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Prazos & Urgência
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
            stats.overdueCount > 0
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            stats.overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
          }`}>
            {stats.overdueCount} <span className="text-sm font-normal text-slate-500">atrasados</span>
          </span>
          {stats.overdueCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              Ação necessária
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Filtro rápido de trabalhos com prazo vencido</span>
        </div>
      </div>

    </div>
  );
};
