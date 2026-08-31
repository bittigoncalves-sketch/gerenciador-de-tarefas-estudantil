import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, Plus, Search, Filter, LayoutGrid, List, 
  AlertCircle, RefreshCw, CheckCircle2, 
  Tag, ArrowUpDown, Clock, FolderPlus, Database, Code2
} from 'lucide-react';
import { api, getAuthToken } from './services/api';
import type { Assignment, AssignmentStatus, CategoryItem, StatsSummary, AssignmentFile } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { AssignmentCard } from './components/AssignmentCard';
import { AssignmentTableView } from './components/AssignmentTableView';
import { AssignmentModal } from './components/AssignmentModal';
import { ActivityReports } from './components/ActivityReports';
import { FileExplorer } from './components/FileExplorer';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { SecurityModal } from './components/SecurityModal';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string }>({
    username: 'administrador',
    role: 'Administrador do Sistema',
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'assignments' | 'reports' | 'files'>('assignments');

  // Data states with immediate persistent hydration
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const cached = localStorage.getItem('cached_assignments');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const cached = localStorage.getItem('cached_categories');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [stats, setStats] = useState<StatsSummary | null>(() => {
    try {
      const cached = localStorage.getItem('cached_stats');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedUrgency, setSelectedUrgency] = useState('todos');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Code Viewer Modal State
  const [codeViewerState, setCodeViewerState] = useState<{
    isOpen: boolean;
    code: string;
    language: string;
    fileName: string;
    title: string;
  }>({
    isOpen: false,
    code: '',
    language: 'java',
    fileName: 'Main.java',
    title: 'Visualizador de Código',
  });

  // Database Status Modal State
  const [isDatabaseStatusOpen, setIsDatabaseStatusOpen] = useState(false);

  // Security & Firewall Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'assignment' | 'file';
    assignmentId?: string;
    fileId?: string;
    title: string;
    description: string;
    itemName: string;
  }>({
    isOpen: false,
    type: 'assignment',
    title: '',
    description: '',
    itemName: '',
  });
  const [deleting, setDeleting] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        const isValid = await api.verifyAuth();
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [assignmentsRes, categoriesRes, statsRes] = await Promise.all([
        api.getAssignments({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
          urgency: selectedUrgency,
          sort: sortBy,
        }),
        api.getCategories(),
        api.getStats(),
      ]);

      setAssignments(assignmentsRes.assignments || []);
      setCategories(categoriesRes || []);
      setStats(statsRes || null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Erro ao carregar dados do banco.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchTerm, selectedCategory, selectedStatus, selectedUrgency, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  // Auth Handlers
  const handleLoginSuccess = (userData: { username: string; role: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    showToast(`Bem-vindo, ${userData.username}! Acesso administrativo autenticado.`, 'success');
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    showToast('Sessão encerrada com segurança.', 'info');
  };

  // Assignment CRUD
  const handleSaveAssignment = async (data: Partial<Assignment>) => {
    try {
      if (editingAssignment) {
        await api.updateAssignment(editingAssignment.id, data);
        showToast(`Trabalho "${data.title}" atualizado com sucesso no banco de dados!`, 'success');
      } else {
        await api.createAssignment(data);
        showToast(`Novo trabalho "${data.title}" gravado no banco de dados com sucesso!`, 'success');
      }
      fetchData();
      setIsAssignmentModalOpen(false);
      setEditingAssignment(null);
    } catch (err: any) {
      throw err;
    }
  };

  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsAssignmentModalOpen(true);
  };

  // Open Code Viewer Handler
  const handleOpenCodeViewer = (code: string, language: string, fileName: string, title: string) => {
    setCodeViewerState({
      isOpen: true,
      code,
      language: language || 'java',
      fileName: fileName || 'Main.java',
      title: title || 'Código do Trabalho Escolar',
    });
  };

  const handleInlineStatusChange = async (assignmentId: string, newStatus: AssignmentStatus) => {
    try {
      await api.updateAssignment(assignmentId, { status: newStatus });
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, status: newStatus } : a))
      );
      // Refresh stats
      const statsRes = await api.getStats();
      setStats(statsRes);
      showToast('Status do trabalho atualizado no banco de dados!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status.', 'error');
    }
  };

  // Delete Handlers
  const promptDeleteAssignment = (assignment: Assignment) => {
    setDeleteModalState({
      isOpen: true,
      type: 'assignment',
      assignmentId: assignment.id,
      title: 'Excluir Trabalho Escolar',
      description: `Tem certeza que deseja excluir permanentemente o trabalho "${assignment.title}" e todos os ${assignment.files.length} arquivo(s) anexados do banco de dados?`,
      itemName: `${assignment.title} — ${assignment.studentName}`,
    });
  };

  const promptDeleteFile = (assignmentId: string, fileId: string, fileName: string) => {
    setDeleteModalState({
      isOpen: true,
      type: 'file',
      assignmentId,
      fileId,
      title: 'Excluir Arquivo Anexado',
      description: `Tem certeza que deseja remover este arquivo do trabalho escolar no banco de dados? Esta ação não pode ser desfeita.`,
      itemName: fileName,
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModalState.type === 'assignment' && deleteModalState.assignmentId) {
        await api.deleteAssignment(deleteModalState.assignmentId);
        showToast('Trabalho escolar excluído do banco de dados.', 'info');
      } else if (deleteModalState.type === 'file' && deleteModalState.assignmentId && deleteModalState.fileId) {
        await api.deleteFile(deleteModalState.assignmentId, deleteModalState.fileId);
        showToast('Arquivo removido do banco de dados.', 'info');
      }
      setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao realizar exclusão.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Category Add
  const handleAddCategory = async (name: string, color: string) => {
    const newCat = await api.createCategory(name, color);
    setCategories((prev) => [...prev, newCat]);
    showToast(`Disciplina "${name}" adicionada com sucesso!`, 'success');
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await api.deleteCategory(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    showToast('Disciplina removida do sistema.', 'info');
    fetchData();
  };

  // Backup
  const handleExportBackup = () => {
    window.location.href = '/api/backup';
    showToast('Download do backup completo do banco de dados iniciado.', 'success');
  };

  // Loading state
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-300">Inicializando ambiente escolar seguro e banco de dados...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-100 border-rose-800'
              : toastMessage.type === 'info'
                ? 'bg-slate-900/90 text-slate-100 border-slate-700'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewAssignment={handleOpenCreateModal}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        onOpenDatabaseStatus={() => setIsDatabaseStatusOpen(true)}
        onOpenSecurityStatus={() => setIsSecurityModalOpen(true)}
        onLogout={handleLogout}
        userName={currentUser.username}
        totalAssignments={assignments.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: ASSIGNMENTS (Trabalhos Escolares) */}
        {currentTab === 'assignments' && (
          <div className="space-y-6">
            
            {/* Dashboard KPI Stats */}
            <DashboardStats
              stats={stats}
              onSelectUrgencyFilter={setSelectedUrgency}
              onSelectStatusFilter={setSelectedStatus}
              currentUrgency={selectedUrgency}
              currentStatus={selectedStatus}
            />

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Pesquisar por título, aluno, código Java (.java), descrição ou arquivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Urgency / Due Dates filter */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      onClick={() => setSelectedUrgency('todos')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedUrgency === 'todos'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Todos Prazos
                    </button>
                    <button
                      onClick={() => setSelectedUrgency('atrasados')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedUrgency === 'atrasados'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                    >
                      Atrasados
                    </button>
                    <button
                      onClick={() => setSelectedUrgency('hoje')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedUrgency === 'hoje'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => setSelectedUrgency('proximos')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedUrgency === 'proximos'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Próx. 7 Dias
                    </button>
                  </div>

                  {/* Status selector */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="entregue">Entregue</option>
                    <option value="avaliado">Avaliado</option>
                  </select>

                  {/* Sort selector */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="newest">Mais recentes primeiro</option>
                    <option value="due_asc">Prazo de Entrega (Crescente)</option>
                    <option value="due_desc">Prazo de Entrega (Decrescente)</option>
                    <option value="title_asc">Título (A-Z)</option>
                    <option value="student_asc">Aluno (A-Z)</option>
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Visualização em Cards"
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="Visualização em Tabela"
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Category Pills Slider */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Disciplinas:
                  </span>

                  {categories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategory('todas')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        selectedCategory === 'todas'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Todas ({stats?.totalAssignments || 0})
                    </button>
                  )}

                  {categories.map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                    const count = assignments.filter(a => a.category.toLowerCase() === cat.name.toLowerCase()).length;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(isSelected ? 'todas' : cat.name)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-400 font-bold'
                            : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-slate-400">({count})</span>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Disciplina</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Gerenciar</span>
                </button>
              </div>

            </div>

            {/* Assignments List / Grid / Empty State */}
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs">Consultando banco de dados estruturado de trabalhos escolares...</span>
              </div>
            ) : assignments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Nenhum trabalho escolar cadastrado no banco de dados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                  {searchTerm || selectedCategory !== 'todas' || selectedStatus !== 'todos' || selectedUrgency !== 'todos'
                    ? 'Nenhum resultado para os filtros selecionados. Experimente limpar ou redefinir a busca.'
                    : 'O banco de dados está pronto para registrar trabalhos escolares, códigos Java (.java, POO, scripts), anexos e notas.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Adicionar Disciplina</span>
                  </button>
                  <button
                    onClick={handleOpenCreateModal}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Novo Trabalho</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {assignments.map((assignment) => {
                  const cat = categories.find(c => c.name.toLowerCase() === assignment.category.toLowerCase());
                  return (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      categoryColor={cat?.color || '#4F46E5'}
                      onEdit={handleOpenEditModal}
                      onDelete={promptDeleteAssignment}
                      onDeleteFile={promptDeleteFile}
                      onStatusChange={handleInlineStatusChange}
                      onOpenCodeViewer={handleOpenCodeViewer}
                    />
                  );
                })}
              </div>
            ) : (
              <AssignmentTableView
                assignments={assignments}
                categories={categories}
                onEdit={handleOpenEditModal}
                onDelete={promptDeleteAssignment}
                onDeleteFile={promptDeleteFile}
                onStatusChange={handleInlineStatusChange}
                onOpenCodeViewer={handleOpenCodeViewer}
              />
            )}

          </div>
        )}

        {/* TAB 2: REPORTS & RECENT ACTIVITY (Relatórios de Atividades & Segurança) */}
        {currentTab === 'reports' && (
          <ActivityReports
            stats={stats}
            categories={categories}
            onRefresh={fetchData}
            onExportBackup={handleExportBackup}
            onRestoreSuccess={() => {
              showToast('Banco de dados restaurado com sucesso!', 'success');
              fetchData();
            }}
          />
        )}

        {/* TAB 3: FILE EXPLORER (Repositório Geral de Arquivos & Código) */}
        {currentTab === 'files' && (
          <FileExplorer
            assignments={assignments}
            categories={categories}
            onDeleteFile={promptDeleteFile}
            onEditAssignment={handleOpenEditModal}
            onOpenCodeViewer={handleOpenCodeViewer}
          />
        )}

      </main>

      {/* Create / Edit Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        onSave={handleSaveAssignment}
        editingAssignment={editingAssignment}
        categories={categories}
        onAddNewCategory={async (name) => {
          const newCat = await api.createCategory(name);
          setCategories(prev => [...prev, newCat]);
          return newCat;
        }}
      />

      {/* Code Viewer & Java Runner Simulator Modal */}
      <CodeViewerModal
        isOpen={codeViewerState.isOpen}
        onClose={() => setCodeViewerState(prev => ({ ...prev, isOpen: false }))}
        code={codeViewerState.code}
        language={codeViewerState.language}
        fileName={codeViewerState.fileName}
        title={codeViewerState.title}
      />

      {/* Database Status & Health Modal */}
      <DatabaseStatusModal
        isOpen={isDatabaseStatusOpen}
        onClose={() => setIsDatabaseStatusOpen(false)}
        onRefreshData={() => {
          showToast('Banco de dados otimizado e atualizado!', 'success');
          fetchData();
        }}
      />

      {/* Security & Firewall Defense Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onRefreshData={() => {
          fetchData();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.title}
        description={deleteModalState.description}
        itemName={deleteModalState.itemName}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

    </div>
  );
}
