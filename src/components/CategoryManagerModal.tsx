import React, { useState } from 'react';
import { X, FolderPlus, Plus, Check, Tag, Trash2, AlertCircle } from 'lucide-react';
import type { CategoryItem } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onAddCategory: (name: string, color: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
}

const PRESET_COLORS = [
  '#2563EB', // Azul
  '#059669', // Esmeralda
  '#D97706', // Âmbar / Laranja
  '#DC2626', // Vermelho
  '#7C3AED', // Violeta
  '#DB2777', // Rosa
  '#0891B2', // Ciano
  '#4F46E5', // Índigo
  '#16A34A', // Verde
  '#EA580C', // Laranja Escuro
];

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Informe o nome da disciplina.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onAddCategory(name.trim(), color);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar disciplina.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!onDeleteCategory) return;
    if (!window.confirm(`Deseja realmente remover a disciplina "${catName}"?`)) {
      return;
    }

    setDeletingId(catId);
    setError(null);
    try {
      await onDeleteCategory(catId);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover disciplina.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Adicionar e Gerenciar Disciplinas
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Organize os trabalhos por matérias escolares
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

        <div className="p-6 space-y-5">
          
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form to Add New Category */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Cadastrar Nova Disciplina
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Disciplina <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Matemática, História, Física, Artes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cor de Destaque
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-2 px-4 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Salvar e Adicionar Disciplina</span>
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Disciplinas Cadastradas ({categories.length})
            </span>

            {categories.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                Nenhuma disciplina cadastrada ainda. Utilize o formulário acima para adicionar suas matérias.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-white dark:bg-slate-800/80 shadow-2xs"
                    style={{
                      borderColor: `${c.color}40`,
                      color: c.color,
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{c.name}</span>
                    {onDeleteCategory && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer ml-1"
                        title="Remover disciplina"
                      >
                        {deletingId === c.id ? (
                          <div className="w-3 h-3 border border-slate-400 border-t-rose-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
            >
              Concluir
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
