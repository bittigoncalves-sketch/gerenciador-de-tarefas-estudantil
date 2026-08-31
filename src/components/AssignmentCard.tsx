import React from 'react';
import { 
  Calendar, User, Download, Trash2, Edit3, Award, 
  Code2, Play, FileCode 
} from 'lucide-react';
import type { Assignment, AssignmentStatus, AssignmentFile } from '../types';
import { formatDate, formatFileSize, getDueDateStatus, getStatusBadge, getFileIcon, downloadFile } from '../utils/formatters';

interface AssignmentCardProps {
  assignment: Assignment;
  categoryColor?: string;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onDeleteFile: (assignmentId: string, fileId: string, fileName: string) => void;
  onStatusChange: (assignmentId: string, newStatus: AssignmentStatus) => void;
  onOpenFileViewer?: (file: AssignmentFile, assignmentTitle: string) => void;
  onOpenCodeViewer?: (code: string, language: string, fileName: string, title: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  categoryColor = '#4F46E5',
  onEdit,
  onDelete,
  onDeleteFile,
  onStatusChange,
  onOpenFileViewer,
  onOpenCodeViewer,
}) => {
  const dueStatus = getDueDateStatus(assignment.dueDate, assignment.status);
  const statusBadge = getStatusBadge(assignment.status);

  // Check if there is code
  const hasDirectCode = !!assignment.codeSnippet;
  const javaFile = assignment.files.find(f => f.name.endsWith('.java') || f.language === 'java');
  const otherCodeFile = assignment.files.find(f => f.isCode && !f.name.endsWith('.java'));
  const isJava = (assignment.codeLanguage === 'java' || (assignment.codeFileName && assignment.codeFileName.endsWith('.java'))) || !!javaFile;

  const handleOpenCode = () => {
    if (onOpenCodeViewer) {
      if (assignment.codeSnippet) {
        onOpenCodeViewer(
          assignment.codeSnippet,
          assignment.codeLanguage || 'java',
          assignment.codeFileName || 'Main.java',
          assignment.title
        );
      } else if (javaFile && javaFile.content) {
        onOpenCodeViewer(
          javaFile.content,
          'java',
          javaFile.name,
          assignment.title
        );
      } else if (otherCodeFile && otherCodeFile.content) {
        onOpenCodeViewer(
          otherCodeFile.content,
          otherCodeFile.language || 'text',
          otherCodeFile.name,
          assignment.title
        );
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span 
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border text-slate-800 dark:text-slate-100 flex items-center gap-1.5"
              style={{ 
                backgroundColor: `${categoryColor}15`, 
                borderColor: `${categoryColor}40`,
                color: categoryColor 
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
              {assignment.category}
            </span>

            {isJava ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <span>☕</span> JAVA
              </span>
            ) : (hasDirectCode || otherCodeFile) ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Code2 className="w-3 h-3" /> CÓDIGO
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={assignment.status}
              onChange={(e) => onStatusChange(assignment.id, e.target.value as AssignmentStatus)}
              className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${statusBadge.bg}`}
            >
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="entregue">Entregue</option>
              <option value="avaliado">Avaliado</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {assignment.title}
        </h3>

        {/* Student & Class Grade */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-300 mb-3">
          <div className="flex items-center gap-1 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{assignment.studentName}</span>
          </div>
          {assignment.classGrade && (
            <>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 dark:text-slate-400">{assignment.classGrade}</span>
            </>
          )}
        </div>

        {/* Description if present */}
        {assignment.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            {assignment.description}
          </p>
        )}

        {/* Code Runner / Snippet Banner */}
        {(hasDirectCode || (javaFile && javaFile.content) || (otherCodeFile && otherCodeFile.content)) && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-amber-400">{isJava ? '☕' : '💻'}</span>
              <div className="truncate">
                <span className="text-slate-200 font-semibold truncate block">
                  {assignment.codeFileName || javaFile?.name || otherCodeFile?.name || 'codigo-fonte'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {assignment.codeSnippet ? `${assignment.codeSnippet.split('\n').length} linhas` : 'Arquivo de código indexado'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCode}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              title="Abrir no Visualizador e Compilador Virtual"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Ver / Executar</span>
            </button>
          </div>
        )}

        {/* Due Date & Grade Banner */}
        <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px]">DATA DE ENTREGA</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(assignment.dueDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {assignment.grade !== null && assignment.grade !== undefined && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                Nota: {assignment.grade}
              </span>
            )}
            <span className={`text-[11px] px-2 py-0.5 rounded-md border ${dueStatus.badgeClass}`}>
              {dueStatus.label}
            </span>
          </div>
        </div>

        {/* Files section */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Arquivos Anexados ({assignment.files.length})</span>
          </div>

          {assignment.files.length === 0 ? (
            <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
              Nenhum arquivo anexado
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {assignment.files.map((file) => {
                const IconComponent = getFileIcon(file.name, file.type);
                const isJavaFile = file.name.endsWith('.java');

                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors group/file ${
                      isJavaFile 
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/40' 
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-700/60'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer"
                      onClick={() => {
                        if (file.content && onOpenCodeViewer) {
                          onOpenCodeViewer(file.content, file.language || 'java', file.name, assignment.title);
                        } else {
                          downloadFile(file.name, file.dataUrl);
                        }
                      }}
                      title={file.content ? `Ver código de ${file.name}` : `Clique para baixar: ${file.name}`}
                    >
                      {isJavaFile ? (
                        <span className="text-xs">☕</span>
                      ) : (
                        <IconComponent className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate hover:text-indigo-600">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {file.content && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCodeViewer) {
                              onOpenCodeViewer(file.content!, file.language || 'java', file.name, assignment.title);
                            }
                          }}
                          title="Inspecionar / Executar Código"
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => downloadFile(file.name, file.dataUrl)}
                        title="Baixar arquivo"
                        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteFile(assignment.id, file.id, file.name)}
                        title="Remover arquivo deste trabalho"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions: Edit & Delete Assignment */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">
          ID: <span className="font-mono">{assignment.id.substring(0, 10)}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(assignment)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(assignment)}
            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs transition-colors cursor-pointer"
            title="Excluir trabalho"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
