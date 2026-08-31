import React from 'react';
import { BookOpen, Plus, Activity, FileText, Database, LogOut, ShieldCheck, FolderPlus, Code2, Shield } from 'lucide-react';

interface NavbarProps {
  currentTab: 'assignments' | 'reports' | 'files';
  onTabChange: (tab: 'assignments' | 'reports' | 'files') => void;
  onOpenNewAssignment: () => void;
  onOpenNewCategory: () => void;
  onOpenDatabaseStatus: () => void;
  onOpenSecurityStatus: () => void;
  onLogout: () => void;
  userName: string;
  totalAssignments: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewAssignment,
  onOpenNewCategory,
  onOpenDatabaseStatus,
  onOpenSecurityStatus,
  onLogout,
  userName,
  totalAssignments,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Portal title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                  Portal de Trabalhos Escolares
                </span>
                <button 
                  onClick={onOpenSecurityStatus}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="Clique para abrir a Central de Segurança & Firewall"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Firewall Ativo
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Armazenamento Seguro de Trabalhos, Anexos, Código Java & Auditoria
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onTabChange('assignments')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentTab === 'assignments'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trabalhos</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                {totalAssignments}
              </span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentTab === 'reports'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Relatórios de Atividades</span>
            </button>

            <button
              onClick={() => onTabChange('files')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                currentTab === 'files'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Explorador de Arquivos</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Security Shield & Firewall button */}
            <button
              onClick={onOpenSecurityStatus}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              title="Central de Segurança, Rate Limiter & Firewall"
            >
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Segurança</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Database & Java Status button */}
            <button
              onClick={onOpenDatabaseStatus}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              title="Gerenciamento do Banco de Dados & Repositório Java"
            >
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden lg:inline">Banco de Dados</span>
            </button>

            <button
              onClick={onOpenNewCategory}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
              title="Adicionar Nova Disciplina / Categoria"
            >
              <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Adicionar Disciplina</span>
              <span className="sm:hidden">Disciplina</span>
            </button>

            <button
              onClick={onOpenNewAssignment}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Trabalho</span>
              <span className="sm:hidden">Trabalho</span>
            </button>

            {/* User badge and Logout */}
            <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 gap-2">
              <div className="hidden xl:block text-right">
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {userName}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                  Admin
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sair com Segurança"
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => onTabChange('assignments')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              currentTab === 'assignments' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Trabalhos</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
              currentTab === 'reports' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Relatórios</span>
          </button>

          <button
            onClick={onOpenSecurityStatus}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 font-semibold"
          >
            <Shield className="w-4 h-4" />
            <span>Segurança</span>
          </button>

          <button
            onClick={onOpenDatabaseStatus}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            <Database className="w-4 h-4" />
            <span>Banco</span>
          </button>
        </div>

      </div>
    </header>
  );
};
