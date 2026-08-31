import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Download, RefreshCw, Filter, Search, 
  Calendar, UserCheck, AlertCircle, FileText, CheckCircle2, 
  Lock, HardDrive, Database, ArrowUpRight, Upload
} from 'lucide-react';
import { api } from '../services/api';
import type { ActivityLog, StatsSummary, CategoryItem } from '../types';
import { formatDateTime } from '../utils/formatters';

interface ActivityReportsProps {
  stats: StatsSummary | null;
  categories: CategoryItem[];
  onRefresh: () => void;
  onExportBackup: () => void;
  onRestoreSuccess: () => void;
}

export const ActivityReports: React.FC<ActivityReportsProps> = ({
  stats,
  categories,
  onRefresh,
  onExportBackup,
  onRestoreSuccess,
}) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [restoreFileError, setRestoreFileError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getActivities({
        action: actionFilter,
        search: searchTerm,
        limit: 100,
      });
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, searchTerm]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Data/Hora', 'Ação', 'Entidade', 'Descrição', 'Usuário', 'Endereço IP', 'Status', 'Hash de Segurança'];
    const rows = logs.map(l => [
      l.id,
      formatDateTime(l.timestamp),
      l.action,
      `"${l.entity.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      l.userName,
      l.ipAddress,
      l.status,
      l.securityHash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-atividades-seguranca-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setRestoring(true);
    setRestoreFileError(null);

    try {
      const fileText = await file.text();
      const jsonData = JSON.parse(fileText);
      await api.restoreBackup(jsonData);
      onRestoreSuccess();
      fetchLogs();
    } catch (err: any) {
      setRestoreFileError(err.message || 'Arquivo de backup inválido.');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  const getActionBadge = (action: ActivityLog['action']) => {
    switch (action) {
      case 'CREATE_ASSIGNMENT':
        return { label: 'Criação de Trabalho', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800' };
      case 'UPDATE_ASSIGNMENT':
        return { label: 'Edição de Dados', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800' };
      case 'DELETE_ASSIGNMENT':
      case 'DELETE_FILE':
        return { label: 'Exclusão Segura', color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800' };
      case 'UPLOAD_FILE':
        return { label: 'Upload de Arquivo', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' };
      case 'LOGIN':
        return { label: 'Login de Administrador', color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800' };
      case 'LOGIN_FAILED':
        return { label: 'Acesso Recusado', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800' };
      case 'EXPORT_DATA':
      case 'RESTORE_DB':
        return { label: 'Operação de Banco', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800' };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoria e Rastreabilidade 100% Segura</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Relatório de Atividades Recentes
            </h2>
            <p className="text-sm text-slate-300">
              Histórico cronológico de todos os acessos, criações, uploads, edições e exclusões de trabalhos escolares com carimbo de data, IP e hash de integridade criptográfica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Exportar Relatório CSV</span>
            </button>

            <button
              onClick={onExportBackup}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Backup do Banco de Dados</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      {stats && stats.categoryBreakdown && (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Distribuição de Trabalhos por Disciplina
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organização por categorias acadêmicas e taxa de conclusão
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {stats.categoryBreakdown.length} Disciplinas Cadastradas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.categoryBreakdown.map((cat) => {
              const percentage = stats.totalAssignments > 0 ? Math.round((cat.count / stats.totalAssignments) * 100) : 0;
              return (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#4F46E5' }}
                      />
                      {cat.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cat.count} {cat.count === 1 ? 'trabalho' : 'trabalhos'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{percentage}% do volume total</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {cat.completed} concluídos
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat.color || '#4F46E5',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs">
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por ação, entidade ou IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Todas as Ações</option>
              <option value="LOGIN">Logins</option>
              <option value="CREATE_ASSIGNMENT">Criação de Trabalhos</option>
              <option value="UPDATE_ASSIGNMENT">Edições</option>
              <option value="DELETE_ASSIGNMENT">Exclusões</option>
              <option value="UPLOAD_FILE">Uploads de Arquivo</option>
              <option value="DELETE_FILE">Remoção de Arquivos</option>
              <option value="EXPORT_DATA">Backups & Exportações</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Logs</span>
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Tipo de Ação</th>
                <th className="py-3 px-4">Detalhes da Operação</th>
                <th className="py-3 px-4">Usuário / IP</th>
                <th className="py-3 px-4 text-right">Hash Criptográfico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                      <span>Carregando logs de segurança...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum registro de atividade encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/40 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.entity}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {log.description}
                        </div>
                      </td>

                      {/* User & IP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{log.userName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {log.ipAddress}
                        </div>
                      </td>

                      {/* Security Hash */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-500" />
                          {log.securityHash}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Database Management & Restore Section */}
      <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Gerenciamento & Restauração do Banco de Dados</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Faça backup completo em arquivo JSON ou restaure uma cópia prévia de trabalhos e arquivos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExportBackup}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Baixar Backup</span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>{restoring ? 'Restaurando...' : 'Restaurar Banco'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
                disabled={restoring}
              />
            </label>
          </div>
        </div>

        {restoreFileError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{restoreFileError}</span>
          </div>
        )}
      </div>

    </div>
  );
};
