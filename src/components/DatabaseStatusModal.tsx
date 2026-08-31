import React, { useState, useEffect } from 'react';
import { 
  X, Database, Server, HardDrive, CheckCircle2, 
  RefreshCw, FileCode, Code2, ShieldCheck, Download, 
  Upload, Sparkles, Layers, Activity, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { DatabaseStatus } from '../types';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getDatabaseStatus();
      setStatus(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao obter status do banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOptimize = async () => {
    setOptimizing(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.optimizeDatabase();
      setSuccessMsg(res.message || 'Banco de dados otimizado e reindexado.');
      await loadStatus();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao otimizar banco de dados.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleBackup = () => {
    window.location.href = '/api/backup';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Banco de Dados & Repositório de Código
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Armazenamento de trabalhos, anexos, disciplinas e código-fonte Java
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Engine & Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Trabalhos Escolares</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {status?.totalAssignments ?? '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Arquivos Anexados</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {status?.totalFiles ?? '-'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 block mb-1 flex items-center gap-1">
                <span>☕</span> Trabalhos Java
              </span>
              <span className="text-xl font-bold text-amber-900 dark:text-amber-300">
                {status?.totalJavaFiles ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40">
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 block mb-1 flex items-center gap-1">
                <Code2 className="w-3 h-3" /> Linhas de Código
              </span>
              <span className="text-xl font-bold text-indigo-900 dark:text-indigo-300">
                {status?.totalLinesOfCode ?? 0}
              </span>
            </div>
          </div>

          {/* Database Specs */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Especificações do Motor de Banco de Dados</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400">Motor:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{status?.engine || 'Structured DB Engine'}</span>
              </div>
              <div>
                <span className="text-slate-400">Arquivo Físico:</span> <span className="font-mono text-slate-800 dark:text-slate-200">{status?.filePath || 'data/database.json'}</span>
              </div>
              <div>
                <span className="text-slate-400">Espaço em Disco:</span> <span className="font-semibold text-slate-800 dark:text-slate-200">{status ? formatBytes(status.sizeBytes) : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400">Segurança & Auditoria:</span> <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Assinaturas SHA-256</span>
              </div>
            </div>
          </div>

          {/* Relational Tables Explorer */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Tabelas & Repositórios Estruturados</span>
            </h4>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              {status?.tables.map((tbl) => (
                <div key={tbl.name} className="p-3 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tbl.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                        {tbl.records} registro(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tbl.description}</p>
                  </div>
                  <div className="text-slate-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Storage Capabilities */}
          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800/50">
            <h4 className="font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Suporte a Código-Fonte e Linguagem Java</span>
            </h4>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
              O banco de dados armazena arquivos fonte e classes <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.java</code>, <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.class</code>, <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.jar</code>, <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.py</code>, <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.sql</code> e <code className="font-mono bg-amber-200/50 dark:bg-amber-900/50 px-1 rounded">.cpp</code> sem perdas, com indexação completa de linhas e inspeção de métodos principais.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
            >
              {optimizing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Otimizar e Reindexar</span>
            </button>

            <button
              onClick={handleBackup}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Backup (JSON)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
