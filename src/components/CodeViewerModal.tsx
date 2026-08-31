import React, { useState, useEffect } from 'react';
import { 
  X, Play, Copy, Check, Download, Terminal, 
  Code2, FileCode, CheckCircle2, AlertTriangle, 
  Sparkles, RefreshCw, Cpu
} from 'lucide-react';
import { api } from '../services/api';
import type { JavaAnalysisResult } from '../types';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  code: string;
  language?: string;
  fileName?: string;
  onSaveCode?: (newCode: string, language: string, fileName: string) => Promise<void>;
  readOnly?: boolean;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  code: initialCode,
  language: initialLanguage = 'java',
  fileName: initialFileName = 'Main.java',
  onSaveCode,
  readOnly = false,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [fileName, setFileName] = useState(initialFileName);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JavaAnalysisResult | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    stdout: string;
    stderr: string;
    durationMs: number;
    compiler: string;
    exitCode: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'analysis'>('editor');

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setLanguage(initialLanguage);
      setFileName(initialFileName);
      setExecutionResult(null);
      setActiveTab('editor');
      if (initialCode) {
        runAnalysis(initialCode, initialLanguage);
      }
    }
  }, [isOpen, initialCode, initialLanguage, initialFileName]);

  const runAnalysis = async (codeToAnalyze: string, lang: string) => {
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeCode(codeToAnalyze, lang);
      setAnalysis(res);
    } catch (err) {
      console.error('Error analyzing code:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || (language === 'java' ? 'Main.java' : `codigo.${language}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab('terminal');
    try {
      const result = await api.simulateCodeRun(code, language, fileName);
      setExecutionResult(result);
      if (result.analysis) {
        setAnalysis(result.analysis);
      }
    } catch (err: any) {
      setExecutionResult({
        stdout: '',
        stderr: err.message || 'Falha na execução do código.',
        durationMs: 0,
        compiler: 'Erro no Compilador',
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 rounded-2xl max-w-5xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              {language === 'java' ? <span className="font-mono text-xs font-black">☕</span> : <Code2 className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm truncate font-mono">
                  {fileName}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  {language}
                </span>
                {analysis?.className && (
                  <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
                    class {analysis.className}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {title} • {lines.length} linhas de código
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Compilar e Executar Código (Simulação JVM / Runtime)"
            >
              {isRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span className="hidden sm:inline">Executar {language === 'java' ? 'Java' : 'Código'}</span>
              <span className="sm:hidden">Run</span>
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copiar Código"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Baixar Arquivo"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Código Fonte</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console / Terminal</span>
              {executionResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analysis'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Diagnóstico & Estrutura</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            {analysis?.hasMainMethod && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> main() detectado
              </span>
            )}
            <span>UTF-8</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          
          {/* TAB 1: CODE EDITOR / VIEWER */}
          {activeTab === 'editor' && (
            <div className="flex-1 overflow-auto flex text-xs font-mono">
              {/* Line Numbers */}
              <div className="select-none text-slate-600 bg-slate-900/50 py-4 px-3 text-right font-mono border-r border-slate-800/80 min-w-[44px]">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5 text-[11px]">{i + 1}</div>
                ))}
              </div>

              {/* Code TextArea / Pre */}
              <div className="flex-1 p-4 overflow-auto">
                {readOnly ? (
                  <pre className="text-slate-200 font-mono leading-5 whitespace-pre selection:bg-amber-500/30 selection:text-white">
                    {code}
                  </pre>
                ) : (
                  <textarea
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      runAnalysis(e.target.value, language);
                    }}
                    className="w-full h-full bg-transparent text-slate-100 font-mono leading-5 resize-none focus:outline-none selection:bg-amber-500/30 selection:text-white min-h-[350px]"
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TERMINAL / EXECUTION OUTPUT */}
          {activeTab === 'terminal' && (
            <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-auto flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] ml-1 text-slate-300">
                    {executionResult?.compiler || 'Virtual Terminal Console'}
                  </span>
                </div>
                {executionResult && (
                  <span className="text-[11px] text-slate-400">
                    Tempo: {executionResult.durationMs}ms • Exit Code: {executionResult.exitCode}
                  </span>
                )}
              </div>

              {isRunning ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                  <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  <p className="text-xs">Compilando e executando programa {language === 'java' ? 'Java com OpenJDK...' : '...'}</p>
                </div>
              ) : executionResult ? (
                <div className="space-y-2 flex-1">
                  <div className="text-slate-500 text-[11px]">
                    $ javac {fileName} && java {analysis?.className || 'Main'}
                  </div>

                  {executionResult.stdout && (
                    <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                      {executionResult.stdout}
                    </pre>
                  )}

                  {executionResult.stderr && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 whitespace-pre-wrap leading-relaxed">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Avisos / Diagnóstico do Compilador:</span>
                      </div>
                      {executionResult.stderr}
                    </div>
                  )}

                  <div className="pt-3 text-slate-500 text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Processo finalizado com código {executionResult.exitCode} ({executionResult.durationMs}ms).</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 py-12 text-center">
                  <Terminal className="w-8 h-8 text-slate-700" />
                  <p className="text-xs">Nenhuma execução realizada ainda.</p>
                  <button
                    onClick={handleRunCode}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold cursor-pointer transition-all"
                  >
                    Executar Código Agora
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIAGNOSTICS & AST ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="flex-1 p-5 overflow-auto text-xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Classe Primária</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {analysis?.className || 'Não identificada'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Pacote (Package)</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {analysis?.packageName || 'default (sem pacote)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Método Principal</span>
                  <span className={`font-mono font-bold text-sm flex items-center gap-1.5 ${analysis?.hasMainMethod ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {analysis?.hasMainMethod ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Presente (Executável)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Ausente</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Imports */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Imports & Dependências Java ({analysis?.imports.length || 0})</span>
                </h4>
                {analysis?.imports && analysis.imports.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.imports.map((imp, i) => (
                      <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        import {imp};
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px]">Nenhum import externo detectado (usa pacote java.lang padrão).</p>
                )}
              </div>

              {/* Methods */}
              {analysis?.methods && analysis.methods.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-white mb-2">Métodos & Funções Declaradas ({analysis.methods.length})</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.methods.map((m, i) => (
                      <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        {m}()
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostics notes */}
              {analysis?.diagnostics && analysis.diagnostics.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <h4 className="font-bold text-white mb-2">Notas do Verificador de Sintaxe</h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {analysis.diagnostics.map((diag, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-amber-400 mt-0.5">•</span>
                        <span>{diag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px]">
            <span>Suporte completo a arquivos .java, .class, .jar, .py, .cpp, .sql e scripts de programação.</span>
          </div>

          <div className="flex items-center gap-2">
            {!readOnly && onSaveCode && (
              <button
                onClick={async () => {
                  await onSaveCode(code, language, fileName);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer transition-colors"
              >
                Salvar Alterações
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
