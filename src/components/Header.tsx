import React from 'react';
import { Cpu, Terminal, Layers, ArrowDownToLine, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'matrix' | 'python' | 'engine';
  setActiveTab: (tab: 'calculator' | 'matrix' | 'python' | 'engine') => void;
  onDownloadScript: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onDownloadScript,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              AI Edge Estimator
            </a>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Calculadora de Viabilidade
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Matriz Comparativa
            </button>
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'engine'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Receitas de Execução
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'python'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Script Python CLI
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onDownloadScript}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
              title="Baixar script standalone ai_edge_estimator.py"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span>Baixar .py</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
