import React from 'react';
import { Calendar, User, Download, Edit3, Trash2, Award, Paperclip, CheckCircle2, Clock, Play, Code2 } from 'lucide-react';
import type { Assignment, AssignmentStatus, AssignmentFile, CategoryItem } from '../types';
import { formatDate, formatFileSize, getDueDateStatus, getStatusBadge, getFileIcon, downloadFile } from '../utils/formatters';

interface AssignmentTableViewProps {
  assignments: Assignment[];
  categories: CategoryItem[];
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  onDeleteFile: (assignmentId: string, fileId: string, fileName: string) => void;
  onStatusChange: (assignmentId: string, newStatus: AssignmentStatus) => void;
  onOpenCodeViewer?: (code: string, language: string, fileName: string, title: string) => void;
}

export const AssignmentTableView: React.FC<AssignmentTableViewProps> = ({
  assignments,
  categories,
  onEdit,
  onDelete,
  onDeleteFile,
  onStatusChange,
  onOpenCodeViewer,
}) => {
  const getCategoryColor = (catName: string) => {
    return categories.find(c => c.name.toLowerCase() === catName.toLowerCase())?.color || '#6366F1';
  };

  if (assignments.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Disciplina</th>
              <th className="py-3.5 px-4">Título do Trabalho</th>
              <th className="py-3.5 px-4">Aluno / Turma</th>
              <th className="py-3.5 px-4">Data de Entrega</th>
              <th className="py-3.5 px-4">Status & Nota</th>
              <th className="py-3.5 px-4">Arquivos & Código</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {assignments.map((assignment) => {
              const catColor = getCategoryColor(assignment.category);
              const dueStatus = getDueDateStatus(assignment.dueDate, assignment.status);
              const statusBadge = getStatusBadge(assignment.status);

              const hasDirectCode = !!assignment.codeSnippet;
              const javaFile = assignment.files.find(f => f.name.endsWith('.java') || f.language === 'java');
              const otherCodeFile = assignment.files.find(f => f.isCode && !f.name.endsWith('.java'));
              const isJava = (assignment.codeLanguage === 'java' || (assignment.codeFileName && assignment.codeFileName.endsWith('.java'))) || !!javaFile;

              return (
                <tr
                  key={assignment.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors"
                >
                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}30`,
                          color: catColor,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                        {assignment.category}
                      </span>
                      {isJava && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          ☕ JAVA
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Title & Description preview */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {assignment.title}
                    </div>
                    {assignment.description && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {assignment.description}
                      </div>
                    )}
                  </td>

                  {/* Student & Class */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {assignment.studentName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {assignment.classGrade}
                    </div>
                  </td>

                  {/* Due Date & Urgency */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(assignment.dueDate)}
                    </div>
                    <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded border ${dueStatus.badgeClass}`}>
                      {dueStatus.label}
                    </span>
                  </td>

                  {/* Status & Grade */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={assignment.status}
                      onChange={(e) => onStatusChange(assignment.id, e.target.value as AssignmentStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${statusBadge.bg}`}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="entregue">Entregue</option>
                      <option value="avaliado">Avaliado</option>
                    </select>
                    {assignment.grade !== null && assignment.grade !== undefined && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mt-1 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" />
                        Nota: {assignment.grade}
                      </div>
                    )}
                  </td>

                  {/* Files & Code */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1.5 max-w-[240px]">
                      {/* Code Snippet Action */}
                      {(hasDirectCode || (javaFile && javaFile.content) || (otherCodeFile && otherCodeFile.content)) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenCodeViewer) {
                              if (assignment.codeSnippet) {
                                onOpenCodeViewer(assignment.codeSnippet, assignment.codeLanguage || 'java', assignment.codeFileName || 'Main.java', assignment.title);
                              } else if (javaFile && javaFile.content) {
                                onOpenCodeViewer(javaFile.content, 'java', javaFile.name, assignment.title);
                              } else if (otherCodeFile && otherCodeFile.content) {
                                onOpenCodeViewer(otherCodeFile.content, otherCodeFile.language || 'text', otherCodeFile.name, assignment.title);
                              }
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer w-fit"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Executar {isJava ? 'Java' : 'Código'}</span>
                        </button>
                      )}

                      {/* Attached Files list */}
                      {assignment.files.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {assignment.files.map((file) => {
                            const IconComp = getFileIcon(file.name, file.type);
                            const isJavaAttached = file.name.endsWith('.java');
                            return (
                              <button
                                key={file.id}
                                onClick={() => {
                                  if (file.content && onOpenCodeViewer) {
                                    onOpenCodeViewer(file.content, file.language || 'java', file.name, assignment.title);
                                  } else {
                                    downloadFile(file.name, file.dataUrl);
                                  }
                                }}
                                title={`${file.name} (${formatFileSize(file.size)})`}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-200 text-[10px] max-w-[120px] truncate transition-colors cursor-pointer border border-slate-200 dark:border-slate-600"
                              >
                                {isJavaAttached ? (
                                  <span className="text-[10px]">☕</span>
                                ) : (
                                  <IconComp className="w-3 h-3 text-indigo-500 shrink-0" />
                                )}
                                <span className="truncate">{file.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {assignment.files.length === 0 && !hasDirectCode && (
                        <span className="text-[11px] text-slate-400">Sem anexos</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onEdit(assignment)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Editar trabalho"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                      </button>

                      <button
                        onClick={() => onDelete(assignment)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Excluir trabalho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
