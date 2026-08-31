import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Upload, FileText, Trash2, Calendar, User, BookOpen, 
  CheckCircle, Award, AlertCircle, Code2, Sparkles, Terminal, FileCode
} from 'lucide-react';
import type { Assignment, AssignmentFile, AssignmentStatus, CategoryItem } from '../types';
import { formatFileSize, getFileIcon } from '../utils/formatters';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Assignment>) => Promise<void>;
  editingAssignment?: Assignment | null;
  categories: CategoryItem[];
  onAddNewCategory?: (name: string) => Promise<CategoryItem>;
}

const JAVA_TEMPLATES = [
  {
    name: 'Java: Hello World & Main',
    fileName: 'Main.java',
    language: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Olá, Sistema de Trabalhos Escolares!");
        System.out.println("Execução de código Java com OpenJDK 21.");
    }
}`
  },
  {
    name: 'Java: POO (Classe Aluno & Notas)',
    fileName: 'Aluno.java',
    language: 'java',
    code: `public class Aluno {
    private String nome;
    private double nota1;
    private double nota2;

    public Aluno(String nome, double nota1, double nota2) {
        this.nome = nome;
        this.nota1 = nota1;
        this.nota2 = nota2;
    }

    public double calcularMedia() {
        return (nota1 + nota2) / 2.0;
    }

    public boolean estaAprovado() {
        return calcularMedia() >= 6.0;
    }

    public static void main(String[] args) {
        Aluno aluno = new Aluno("Mariana Costa", 8.5, 9.0);
        System.out.println("Aluno: " + aluno.nome);
        System.out.println("Média final: " + aluno.calcularMedia());
        System.out.println("Situação: " + (aluno.estaAprovado() ? "APROVADO" : "REPROVADO"));
    }
}`
  },
  {
    name: 'Java: Algoritmo de Ordenação (BubbleSort)',
    fileName: 'Ordenacao.java',
    language: 'java',
    code: `public class Ordenacao {
    public static void main(String[] args) {
        int[] notas = { 7, 3, 9, 2, 8, 5 };
        System.out.println("Array original: ");
        for (int n : notas) System.out.print(n + " ");
        System.out.println();

        // Bubble Sort
        for (int i = 0; i < notas.length - 1; i++) {
            for (int j = 0; j < notas.length - i - 1; j++) {
                if (notas[j] > notas[j + 1]) {
                    int temp = notas[j];
                    notas[j] = notas[j + 1];
                    notas[j + 1] = temp;
                }
            }
        }

        System.out.println("Array ordenado em Java:");
        for (int n : notas) System.out.print(n + " ");
        System.out.println();
    }
}`
  },
  {
    name: 'Python: Análise de Dados Escolar',
    fileName: 'analise.py',
    language: 'python',
    code: `def calcular_estatisticas(notas):
    media = sum(notas) / len(notas)
    maior = max(notas)
    menor = min(notas)
    return media, maior, menor

notas_turma = [8.5, 7.0, 9.5, 6.0, 10.0, 8.0]
media, maior, menor = calcular_estatisticas(notas_turma)
print(f"Média da turma: {media:.2f}")
print(f"Maior nota: {maior}")
print(f"Menor nota: {menor}")`
  },
  {
    name: 'SQL: Criação de Tabela Escolar',
    fileName: 'escola_schema.sql',
    language: 'sql',
    code: `CREATE TABLE tb_alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    turma VARCHAR(50),
    data_matricula DATE DEFAULT CURRENT_DATE
);

CREATE TABLE tb_trabalhos (
    id SERIAL PRIMARY KEY,
    aluno_id INT REFERENCES tb_alunos(id),
    disciplina VARCHAR(80) NOT NULL,
    nota DECIMAL(4,2),
    data_entrega DATE
);

INSERT INTO tb_alunos (nome, turma) VALUES ('Lucas Oliveira', '3º Ano Informática');`
  }
];

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAssignment,
  categories,
  onAddNewCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'codigo' | 'arquivos'>('geral');
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [classGrade, setClassGrade] = useState('3º Ano - Ensino Médio');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<AssignmentStatus>('pendente');
  const [grade, setGrade] = useState<string>('');
  const [teacherNotes, setTeacherNotes] = useState('');
  
  // Code-specific state
  const [hasCodeSection, setHasCodeSection] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('java');
  const [codeFileName, setCodeFileName] = useState('Main.java');

  const [files, setFiles] = useState<AssignmentFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form on open / assignment change
  useEffect(() => {
    if (isOpen) {
      setActiveTab('geral');
      if (editingAssignment) {
        setTitle(editingAssignment.title || '');
        setCategory(editingAssignment.category || (categories[0]?.name || ''));
        setStudentName(editingAssignment.studentName || '');
        setClassGrade(editingAssignment.classGrade || '');
        setDueDate(editingAssignment.dueDate || new Date().toISOString().split('T')[0]);
        setDescription(editingAssignment.description || '');
        setStatus(editingAssignment.status || 'pendente');
        setGrade(editingAssignment.grade !== null && editingAssignment.grade !== undefined ? String(editingAssignment.grade) : '');
        setTeacherNotes(editingAssignment.teacherNotes || '');
        setFiles(editingAssignment.files || []);
        setShowCustomCategory(categories.length === 0 || !categories.some(c => c.name.toLowerCase() === (editingAssignment.category || '').toLowerCase()));
        setCustomCategory(editingAssignment.category || '');

        if (editingAssignment.codeSnippet) {
          setHasCodeSection(true);
          setCodeSnippet(editingAssignment.codeSnippet);
          setCodeLanguage(editingAssignment.codeLanguage || 'java');
          setCodeFileName(editingAssignment.codeFileName || 'Main.java');
        } else {
          setHasCodeSection(false);
          setCodeSnippet('');
          setCodeLanguage('java');
          setCodeFileName('Main.java');
        }
      } else {
        // Defaults for new assignment
        setTitle('');
        setCategory(categories[0]?.name || '');
        setStudentName('');
        setClassGrade('');
        
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 5);
        setDueDate(nextWeek.toISOString().split('T')[0]);
        
        setDescription('');
        setStatus('pendente');
        setGrade('');
        setTeacherNotes('');
        setFiles([]);
        setShowCustomCategory(categories.length === 0);
        setCustomCategory('');

        setHasCodeSection(false);
        setCodeSnippet('');
        setCodeLanguage('java');
        setCodeFileName('Main.java');
      }
      setError(null);
    }
  }, [isOpen, editingAssignment, categories]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof JAVA_TEMPLATES[0]) => {
    setCodeSnippet(tmpl.code);
    setCodeLanguage(tmpl.language);
    setCodeFileName(tmpl.fileName);
    setHasCodeSection(true);
  };

  const processIncomingFiles = async (fileList: File[]) => {
    setUploadingFiles(true);
    setError(null);

    const newFiles: AssignmentFile[] = [];

    for (const file of fileList) {
      try {
        const base64Data = await readFileAsBase64(file);
        const fileName = file.name;
        const isJava = fileName.endsWith('.java') || fileName.endsWith('.class') || fileName.endsWith('.jar');
        const isOtherCode = fileName.endsWith('.py') || fileName.endsWith('.cpp') || fileName.endsWith('.c') || fileName.endsWith('.sql') || fileName.endsWith('.js') || fileName.endsWith('.ts');

        let textContent: string | undefined = undefined;
        let lineCount: number | undefined = undefined;

        if (isJava || isOtherCode || fileName.endsWith('.txt') || fileName.endsWith('.json') || fileName.endsWith('.md')) {
          try {
            textContent = await readFileAsText(file);
            lineCount = textContent.split('\n').length;
            
            // If user hasn't typed code yet and this is a code file, auto-populate snippet
            if (!codeSnippet && (isJava || isOtherCode)) {
              setCodeSnippet(textContent);
              setCodeFileName(fileName);
              setCodeLanguage(isJava ? 'java' : (fileName.split('.').pop() || 'text'));
              setHasCodeSection(true);
            }
          } catch (e) {
            console.error('Error reading text content:', e);
          }
        }

        newFiles.push({
          id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: base64Data,
          uploadedAt: new Date().toISOString(),
          content: textContent,
          isCode: isJava || isOtherCode,
          language: isJava ? 'java' : (isOtherCode ? fileName.split('.').pop() : undefined),
          lineCount
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setUploadingFiles(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files) as File[];
    await processIncomingFiles(selectedFiles);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const droppedFiles = Array.from(e.dataTransfer.files) as File[];
    await processIncomingFiles(droppedFiles);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título do trabalho.');
      return;
    }
    if (!studentName.trim()) {
      setError('Por favor, informe o nome do aluno ou grupo.');
      return;
    }
    if (!dueDate) {
      setError('Por favor, defina a data de entrega.');
      return;
    }

    let finalCategory = category;
    if (showCustomCategory && customCategory.trim()) {
      finalCategory = customCategory.trim();
      if (onAddNewCategory) {
        try {
          await onAddNewCategory(finalCategory);
        } catch (err) {
          // ignore
        }
      }
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        category: finalCategory,
        studentName: studentName.trim(),
        classGrade: classGrade.trim(),
        dueDate,
        description: description.trim(),
        status,
        grade: grade !== '' ? parseFloat(grade) : null,
        teacherNotes: teacherNotes.trim(),
        files,
        codeSnippet: hasCodeSection && codeSnippet.trim() ? codeSnippet : undefined,
        codeLanguage: hasCodeSection && codeSnippet.trim() ? codeLanguage : undefined,
        codeFileName: hasCodeSection && codeSnippet.trim() ? codeFileName : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar trabalho escolar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingAssignment ? 'Editar Trabalho Escolar' : 'Cadastrar Novo Trabalho'}</span>
                {hasCodeSection && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    ☕ {codeLanguage.toUpperCase()}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Armazenamento de trabalhos acadêmicos, anexos e código-fonte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'geral'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dados Gerais & Prazos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('codigo')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'codigo'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Código-Fonte (Java / Multi)</span>
            {(hasCodeSection || codeSnippet) && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arquivos')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'arquivos'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload de Arquivos</span>
            {files.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
                {files.length}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: DADOS GERAIS */}
          {activeTab === 'geral' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Título do Trabalho <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Projeto POO em Java - Sistema de Biblioteca Escolar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category & Custom Category toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Disciplina / Categoria <span className="text-rose-500">*</span>
                    </label>
                    {categories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowCustomCategory(!showCustomCategory)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        {showCustomCategory ? 'Selecionar existente' : '+ Nova disciplina'}
                      </button>
                    )}
                  </div>

                  {showCustomCategory || categories.length === 0 ? (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Ex: Programação Java, Matemática, Física..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-600 bg-indigo-50/20 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      autoFocus={showCustomCategory || categories.length === 0}
                      required={categories.length === 0}
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Class / Grade */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Turma / Série
                  </label>
                  <input
                    type="text"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    placeholder="Ex: 3º Ano B - Técnico em Informática"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Student & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Aluno(s) ou Grupo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Ex: Camila Silva, João Pedro e Beatriz"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Data de Entrega <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Status & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Status do Trabalho
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="entregue">Entregue</option>
                    <option value="avaliado">Avaliado / Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nota / Avaliação (0.0 a 10.0)
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Ex: 9.5 (Opcional)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Descrição e Instruções
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o conteúdo do trabalho, temas abordados, critérios de avaliação..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Teacher Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Observações do Professor / Admin
                </label>
                <input
                  type="text"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Ex: Código Java deve compilar sem erros com OpenJDK 21"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CÓDIGO-FONTE (JAVA & OUTROS) */}
          {activeTab === 'codigo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-base">☕</span>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Armazenamento de Código Java & Programação
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-mono text-[10px] font-bold">
                    OpenJDK 21
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Digite ou cole o código Java do aluno diretamente aqui, ou selecione um modelo pronto para testes. O banco de dados armazena classes, pacotes e métodos estruturados com destaque de sintaxe.
                </p>

                {/* Templates Selector */}
                <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Inserir Modelo:
                  </span>
                  {JAVA_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code File Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Arquivo Fonte
                  </label>
                  <div className="relative">
                    <FileCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={codeFileName}
                      onChange={(e) => setCodeFileName(e.target.value)}
                      placeholder="Ex: Main.java, Calculadora.java"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Linguagem de Programação
                  </label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="java">☕ Java (.java)</option>
                    <option value="python">🐍 Python (.py)</option>
                    <option value="cpp">⚙️ C++ (.cpp / .h)</option>
                    <option value="c">💻 C (.c)</option>
                    <option value="sql">🗄️ SQL Script (.sql)</option>
                    <option value="javascript">⚡ JavaScript (.js)</option>
                    <option value="typescript">🔷 TypeScript (.ts)</option>
                    <option value="html">🌐 HTML / CSS</option>
                  </select>
                </div>
              </div>

              {/* Code Textarea Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Código-Fonte
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {codeSnippet ? `${codeSnippet.split('\n').length} linhas` : '0 linhas'}
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs shadow-inner">
                  <textarea
                    rows={12}
                    value={codeSnippet}
                    onChange={(e) => {
                      setCodeSnippet(e.target.value);
                      if (e.target.value.trim()) setHasCodeSection(true);
                    }}
                    placeholder={`// Cole ou digite seu código ${codeLanguage.toUpperCase()} aqui...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Trabalho escolar");\n    }\n}`}
                    className="w-full p-4 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none leading-relaxed resize-none selection:bg-amber-500/30 selection:text-white"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD DE ARQUIVOS */}
          {activeTab === 'arquivos' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".java,.class,.jar,.py,.c,.cpp,.sql,.js,.ts,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar,.txt"
                />
                <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Arraste e solte arquivos aqui, ou <span className="text-indigo-600 dark:text-indigo-400 underline">clique para selecionar</span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Suporta arquivos de código Java (<span className="font-mono text-amber-500 font-bold">.java</span>, <span className="font-mono">.class</span>, <span className="font-mono">.jar</span>), Python, SQL, PDF, Word, PowerPoint, Imagens e ZIP
                </p>
              </div>

              {uploadingFiles && (
                <div className="mt-2 text-xs text-indigo-600 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <span>Processando e indexando arquivos no banco de dados...</span>
                </div>
              )}

              {/* Uploaded File List */}
              {files.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                    Arquivos anexados a este trabalho ({files.length}):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {files.map((file) => {
                      const IconComp = getFileIcon(file.name, file.type);
                      const isJavaFile = file.name.endsWith('.java');
                      return (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                            isJavaFile 
                              ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40' 
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            {isJavaFile ? (
                              <span className="text-base shrink-0">☕</span>
                            ) : (
                              <IconComp className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                            <div className="truncate flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {file.name}
                                </span>
                                {file.isCode && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                                    CÓDIGO {file.language?.toUpperCase() || ''}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {formatFileSize(file.size)} {file.lineCount ? `• ${file.lineCount} linhas` : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-center text-xs text-slate-400">
                  Nenhum arquivo anexado ainda.
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-slate-400 hidden sm:block">
              {files.length} anexo(s) {codeSnippet ? '+ 1 snippet de código' : ''}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gravando no Banco de Dados...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{editingAssignment ? 'Salvar Alterações' : 'Gravar Trabalho Escolar'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
