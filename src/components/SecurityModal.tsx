import React, { useState, useEffect } from 'react';
import { 
  X, Shield, ShieldCheck, ShieldAlert, Lock, Unlock, 
  RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, 
  Flame, Zap, Activity, Ban, KeyRound, Server
} from 'lucide-react';
import { api } from '../services/api';
import type { SecurityStatus } from '../types';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlockingIp, setUnlockingIp] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSecurityStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getSecurityStatus();
      setStatus(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar status da camada de segurança.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSecurityStatus();
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = async (ip: string) => {
    setUnlockingIp(ip);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.unlockIp(ip);
      setSuccessMsg(res.message);
      await loadSecurityStatus();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setErrorMsg(err.message || `Erro ao desbloquear IP ${ip}.`);
    } finally {
      setUnlockingIp(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Camada de Segurança & Firewall Ativo
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  PROTEGIDO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Limitador de chamadas, proteção anti-intrusão (WAF), anti-força bruta e integridade criptográfica
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Defense Modules Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  WAF Intrusion Shield
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                  ATIVO
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
                Filtra SQL Injection, XSS, Path Traversal e Command Injection em tempo real.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Rate Limiting
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold">
                  150 req/min
                </span>
              </div>
              <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300/80">
                Bloqueia DDoS, varreduras automatizadas e sobrecarga do servidor.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Anti-Força Bruta
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold">
                  5 Tentativas
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
                Bloqueia o IP por 15 minutos após 5 erros consecutivos de senha.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Tokens HMAC-256
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold">
                  ASSINADOS
                </span>
              </div>
              <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80">
                Sessões invioláveis com assinatura criptográfica gerada pelo servidor.
              </p>
            </div>

          </div>

          {/* Defense Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Requisições Analisadas</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {status?.totalRequestsChecked ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Ataques Neutralizados</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {status?.blockedAttemptsCount ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">IPs Bloqueados Atualmente</span>
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {status?.lockedOutIPs?.length ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Status do Firewall</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> Ativo
              </span>
            </div>
          </div>

          {/* Locked IPs Table */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Endereços IP Bloqueados por Suspeita ou Força Bruta</span>
            </h4>

            {(!status?.lockedOutIPs || status.lockedOutIPs.length === 0) ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum IP bloqueado no momento</p>
                <p className="text-[11px]">Todos os acessos estão em conformidade com as políticas de segurança.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {status.lockedOutIPs.map((lock) => (
                  <div key={lock.ip} className="p-3 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{lock.ip}</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold">
                          {lock.failedAttempts} tentativas incorretas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{lock.reason}</p>
                      <p className="text-[10px] text-slate-400">Bloqueado até: {new Date(lock.lockedUntil).toLocaleTimeString()}</p>
                    </div>

                    <button
                      onClick={() => handleUnlock(lock.ip)}
                      disabled={unlockingIp === lock.ip}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition-colors text-xs disabled:opacity-50"
                    >
                      {unlockingIp === lock.ip ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span>Desbloquear IP</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Security Rules Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Políticas e Regras de Limitação do Servidor</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Limite de API Geral:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">150 req / minuto por IP</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Tentativas de Login:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">Máx 5 falhas / 5 minutos</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Duração do Bloqueio:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">15 minutos (Automático)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40">
                <span className="text-slate-500 dark:text-slate-400">Execução de Código Java:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">25 compilações / minuto</span>
              </div>
            </div>
          </div>

          {/* Recent Security Incidents / Shield Events */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Eventos e Auditoria de Segurança Recentes</span>
            </h4>

            {(!status?.recentSecurityEvents || status.recentSecurityEvents.length === 0) ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-slate-500 text-center text-[11px]">
                Nenhum incidente crítico registrado recentemente.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {status.recentSecurityEvents.map((evt) => (
                  <div key={evt.id} className="p-2.5 bg-white dark:bg-slate-900/60 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          evt.threatLevel === 'critico' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                          evt.threatLevel === 'alto' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                          'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">{evt.ip}</span>
                        <span className="text-slate-400 text-[10px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 font-medium">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={loadSecurityStatus}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar Auditoria</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
