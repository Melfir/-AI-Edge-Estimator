/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ModelSelector } from './components/ModelSelector';
import { HardwareSelector } from './components/HardwareSelector';
import { ResultsDashboard } from './components/ResultsDashboard';
import { PythonScriptView } from './components/PythonScriptView';
import { MatrixComparator } from './components/MatrixComparator';
import { EngineRecipe } from './components/EngineRecipe';
import { MODEL_PRESETS, HARDWARE_PRESETS, QUANT_PROFILES } from './lib/presets';
import { calculateEdgeFeasibility } from './lib/calculator';
import { generatePythonScript } from './lib/pythonGenerator';
import { HardwareProfile, ModelProfile, QuantProfile, KvCacheQuant, InferenceParams } from './types';
import { Cpu, Terminal, ArrowRight, Zap, Info, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'python' | 'engine'>('calculator');

  // Core selection states
  const [selectedModel, setSelectedModel] = useState<ModelProfile>(
    MODEL_PRESETS.find((m) => m.id === 'deepseek_r1_distill_qwen_7b') || MODEL_PRESETS[0]
  );
  const [selectedHardware, setSelectedHardware] = useState<HardwareProfile>(
    HARDWARE_PRESETS.find((h) => h.id === 'apple_m3_max_36') || HARDWARE_PRESETS[0]
  );
  const [selectedQuant, setSelectedQuant] = useState<QuantProfile>(
    QUANT_PROFILES.find((q) => q.id === 'Q4_K_M') || QUANT_PROFILES[4]
  );
  const [contextLength, setContextLength] = useState<number>(8192);
  const [kvCacheQuant, setKvCacheQuant] = useState<KvCacheQuant>('FP16');
  const [batchSize, setBatchSize] = useState<number>(1);

  const inferenceParams: InferenceParams = useMemo(() => ({
    contextLength,
    batchSize,
    kvCacheQuant,
    runner: 'llamacpp',
  }), [contextLength, batchSize, kvCacheQuant]);

  // Real-time calculation
  const calculationResult = useMemo(() => {
    return calculateEdgeFeasibility(
      selectedModel,
      selectedHardware,
      selectedQuant,
      inferenceParams
    );
  }, [selectedModel, selectedHardware, selectedQuant, inferenceParams]);

  // Trigger file download of Python CLI script
  const handleDownloadPythonScript = () => {
    const scriptContent = generatePythonScript(
      selectedModel,
      selectedHardware,
      selectedQuant,
      inferenceParams
    );
    const blob = new Blob([scriptContent], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ai_edge_estimator.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadScript={handleDownloadPythonScript}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1.5">
              <span>Edge Computing Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Inference Physics &amp; Memory Bounds</span>
              <span aria-hidden="true">·</span>
              <span>GGUF / Metal / CUDA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Edge Estimator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Calculadora arquitetural para determinar se um modelo de linguagem (LLM) cabe e roda com fluidez na sua máquina local.
              Calcula pesos de tensores, dimensionamento de KV Cache, alocação de camadas na GPU/CPU e velocidade em tokens por segundo.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('python')}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-2 font-mono"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Ver Script Python CLI</span>
            </button>
          </div>
        </div>

        {/* Dynamic View rendering based on activeTab */}
        {activeTab === 'calculator' && (
          <div className="space-y-8">
            {/* Top Analysis Verdict & Results */}
            <ResultsDashboard
              result={calculationResult}
              model={selectedModel}
              hardware={selectedHardware}
              quant={selectedQuant}
              contextLength={contextLength}
            />

            {/* Inputs: 2 Columns on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedQuant={selectedQuant}
                setSelectedQuant={setSelectedQuant}
                contextLength={contextLength}
                setContextLength={setContextLength}
                kvCacheQuant={kvCacheQuant}
                setKvCacheQuant={setKvCacheQuant}
                batchSize={batchSize}
                setBatchSize={setBatchSize}
              />

              <HardwareSelector
                selectedHardware={selectedHardware}
                setSelectedHardware={setSelectedHardware}
              />
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <MatrixComparator
            currentHardware={selectedHardware}
            currentModel={selectedModel}
            currentQuant={selectedQuant}
            onSelectModel={(m) => {
              setSelectedModel(m);
              setActiveTab('calculator');
            }}
            onSelectHardware={(hw) => {
              setSelectedHardware(hw);
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'engine' && (
          <EngineRecipe
            model={selectedModel}
            hardware={selectedHardware}
            quant={selectedQuant}
            params={inferenceParams}
            result={calculationResult}
          />
        )}

        {activeTab === 'python' && (
          <PythonScriptView
            model={selectedModel}
            hardware={selectedHardware}
            quant={selectedQuant}
            params={inferenceParams}
            result={calculationResult}
            onDownloadScript={handleDownloadPythonScript}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AI Edge Estimator</span>
            <span aria-hidden="true">·</span>
            <span>Viabilidade de LLM Local em Edge Devices</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Fórmulas baseadas em GQA e Llama.cpp Memory Layout</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleDownloadPythonScript}
              className="text-cyan-400 hover:underline font-mono"
            >
              ai_edge_estimator.py
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
