import React, { useState } from 'react';
import { 
  FileText, Search, Download, Trash2, HardDrive, 
  ExternalLink, Filter, Calendar, User, Folder, Play, Code2
} from 'lucide-react';
import type { Assignment, AssignmentFile, CategoryItem } from '../types';
import { formatFileSize, formatDateTime, getFileIcon, downloadFile } from '../utils/formatters';

interface FileExplorerProps {
  assignments: Assignment[];
  categories: CategoryItem[];
  onDeleteFile: (assignmentId: string, fileId: string, fileName: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onOpenCodeViewer?: (code: string, language: string, fileName: string, title: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  assignments,
  categories,
  onDeleteFile,
  onEditAssignment,
  onOpenCodeViewer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Flatten all files with their parent assignment info
  const allFiles: {
    file: AssignmentFile;
    assignment: Assignment;
  }[] = [];

  assignments.forEach((assignment) => {
    // If assignment has inline codeSnippet, include as a virtual file too
    if (assignment.codeSnippet) {
      allFiles.push({
        file: {
          id: `snippet-${assignment.id}`,
          name: assignment.codeFileName || 'Main.java',
          size: assignment.codeSnippet.length,
          type: 'text/x-java-source',
          dataUrl: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(assignment.codeSnippet)))}`,
          uploadedAt: assignment.createdAt,
          content: assignment.codeSnippet,
          isCode: true,
          language: assignment.codeLanguage || 'java',
          lineCount: assignment.codeSnippet.split('\n').length
        },
        assignment
      });
    }

    assignment.files.forEach((file) => {
      allFiles.push({ file, assignment });
    });
  });

  const filteredFiles = allFiles.filter(({ file, assignment }) => {
    const matchesSearch = 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      categoryFilter === 'ALL' || assignment.category.toLowerCase() === categoryFilter.toLowerCase();

    let matchesType = true;
    if (typeFilter !== 'ALL') {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (typeFilter === 'JAVA') matchesType = ext === 'java' || ext === 'class' || ext === 'jar' || file.language === 'java';
      else if (typeFilter === 'CODE') matchesType = file.isCode || ['java', 'py', 'c', 'cpp', 'sql', 'js', 'ts', 'html', 'css'].includes(ext);
      else if (typeFilter === 'PDF') matchesType = ext === 'pdf';
      else if (typeFilter === 'DOC') matchesType = ['doc', 'docx', 'odt', 'txt'].includes(ext);
      else if (typeFilter === 'IMAGE') matchesType = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext);
      else if (typeFilter === 'SHEET') matchesType = ['xls', 'xlsx', 'csv'].includes(ext);
      else if (typeFilter === 'PRESENTATION') matchesType = ['ppt', 'pptx'].includes(ext);
      else if (typeFilter === 'ZIP') matchesType = ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalBytes = allFiles.reduce((acc, curr) => acc + (curr.file.size || 0), 0);
  const totalJava = allFiles.filter(f => f.file.name.endsWith('.java') || f.file.language === 'java').length;

  return (
    <div className="space-y-5">
      
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            <span>Repositório de Arquivos & Código-Fonte</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Armazenamento seguro de todos os {allFiles.length} arquivos e códigos Java indexados no banco de dados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {totalJava > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <span>☕</span> {totalJava} Java (.java)
            </span>
          )}
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
            {allFiles.length} arquivos • {formatFileSize(totalBytes)}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome do arquivo (.java, .py, .pdf), trabalho ou aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Todos os Formatos</option>
              <option value="JAVA">☕ Código Java (.java, .jar)</option>
              <option value="CODE">💻 Todos os Códigos (Java, Py, SQL...)</option>
              <option value="PDF">📄 PDF (.pdf)</option>
              <option value="DOC">📝 Documentos (.docx, .txt)</option>
              <option value="PRESENTATION">📊 Apresentações (.pptx)</option>
              <option value="SHEET">📈 Planilhas (.xlsx)</option>
              <option value="IMAGE">🖼️ Imagens (.png, .jpg)</option>
              <option value="ZIP">📦 Compactados (.zip)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Todas as Disciplinas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Files Grid / List */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            Nenhum arquivo encontrado no banco de dados
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Tente alterar os termos de busca ou filtros de formato.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(({ file, assignment }) => {
            const IconComp = getFileIcon(file.name, file.type);
            const category = categories.find(c => c.name.toLowerCase() === assignment.category.toLowerCase());
            const catColor = category?.color || '#4F46E5';
            const isJava = file.name.endsWith('.java') || file.language === 'java';

            return (
              <div
                key={file.id}
                className={`border rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isJava
                    ? 'bg-amber-50/20 dark:bg-slate-800/95 border-amber-200/80 dark:border-amber-800/40'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80'
                }`}
              >
                <div>
                  {/* File Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isJava 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 text-lg' 
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {isJava ? '☕' : <IconComp className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isJava && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          JAVA
                        </span>
                      )}
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                        style={{
                          backgroundColor: `${catColor}15`,
                          borderColor: `${catColor}30`,
                          color: catColor,
                        }}
                      >
                        {assignment.category}
                      </span>
                    </div>
                  </div>

                  {/* File Name */}
                  <h4 
                    onClick={() => {
                      if (file.content && onOpenCodeViewer) {
                        onOpenCodeViewer(file.content, file.language || 'java', file.name, assignment.title);
                      } else {
                        downloadFile(file.name, file.dataUrl);
                      }
                    }}
                    className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
                    title={file.name}
                  >
                    {file.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {formatFileSize(file.size)} {file.lineCount ? `• ${file.lineCount} linhas de código` : ''}
                  </div>

                  {/* Assignment context */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{assignment.studentName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Trabalho: {assignment.title}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onEditAssignment(assignment)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Trabalho</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    {file.content && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenCodeViewer) {
                            onOpenCodeViewer(file.content!, file.language || 'java', file.name, assignment.title);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Ver e Executar Código"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Executar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => downloadFile(file.name, file.dataUrl)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs transition-colors cursor-pointer"
                      title="Baixar arquivo"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                    </button>

                    {!file.id.startsWith('snippet-') && (
                      <button
                        type="button"
                        onClick={() => onDeleteFile(assignment.id, file.id, file.name)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs transition-colors cursor-pointer"
                        title="Excluir arquivo do banco de dados"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
