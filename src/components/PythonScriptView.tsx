import React, { useState } from 'react';
import { HardwareProfile, InferenceParams, ModelProfile, QuantProfile, CalculationResult } from '../types';
import { generatePythonScript } from '../lib/pythonGenerator';
import { Terminal, Copy, Check, Download, Play, RefreshCw, FileCode, Sparkles } from 'lucide-react';

interface PythonScriptViewProps {
  model: ModelProfile;
  hardware: HardwareProfile;
  quant: QuantProfile;
  params: InferenceParams;
  result: CalculationResult;
  onDownloadScript: () => void;
}

export const PythonScriptView: React.FC<PythonScriptViewProps> = ({
  model,
  hardware,
  quant,
  params,
  result,
  onDownloadScript,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'code'>('simulator');
  const [copied, setCopied] = useState(false);
  const [cliArgs, setCliArgs] = useState(`--model ${model.id} --quant ${quant.id.toLowerCase()} --context ${params.contextLength}`);
  const [isRunning, setIsRunning] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState<'normal' | 'json' | 'autodetect'>('normal');

  const fullPythonCode = generatePythonScript(model, hardware, quant, params);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = (mode: 'normal' | 'json' | 'autodetect') => {
    setIsRunning(true);
    setSimulatedMode(mode);
    setTimeout(() => {
      setIsRunning(false);
    }, 250);
  };

  // Render simulated terminal output
  const renderTerminalOutput = () => {
    if (simulatedMode === 'json') {
      const jsonOutput = {
        model: {
          name: model.name,
          family: model.family,
          parameters_b: model.parametersB,
          context_max: model.contextMaxTokens,
          layers: model.layers,
          hidden_size: model.hiddenSize,
          kv_heads: model.kvHeads,
        },
        quantization: {
          name: quant.name,
          bits_per_weight: quant.bitsPerWeight,
          bytes_per_param: quant.bytesPerParam,
          quality_retention: quant.qualityRetention,
        },
        hardware: {
          name: hardware.name,
          total_ram_gb: hardware.totalRamGB,
          vram_gb: hardware.vramGB,
          is_unified: hardware.isUnifiedMemory,
          bandwidth_gb_s: hardware.memoryBandwidthGBs,
        },
        context_length: params.contextLength,
        results: {
          status: result.status.toUpperCase(),
          verdict_text: result.statusTitle,
          weights_gb: result.weightsMemoryGB,
          kv_cache_gb: result.kvCacheMemoryGB,
          activations_gb: result.activationsMemoryGB,
          runtime_buffers_gb: result.runtimeOverheadGB,
          total_required_gb: result.totalModelRequiredGB,
          usable_vram_gb: result.usableVramGB,
          total_usable_gb: result.totalUsableMemoryGB,
          gpu_layers: result.gpuLayers,
          cpu_layers: result.cpuLayers,
          pct_gpu: result.percentageInGpu,
          real_tps: result.estimatedRealTokensPerSec,
          theo_tps: result.theoreticalMaxTokensPerSec,
        },
      };
      return (
        <pre className="text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
          {JSON.stringify(jsonOutput, null, 2)}
        </pre>
      );
    }

    return (
      <div className="font-mono text-xs space-y-3 leading-relaxed">
        <div className="text-cyan-400 font-bold">
          ┌────────────────────────────────────────────────────────────────────────┐<br />
          │         AI EDGE ESTIMATOR // VIABILIDADE DE LLM LOCAL (CLI)           │<br />
          │         Engenharia de Memória, KV Cache e Throughput de Hardware       │<br />
          └────────────────────────────────────────────────────────────────────────┘
        </div>

        <div>
          <div className="text-slate-200 font-bold">CONFIGURAÇÃO ANALISADA:</div>
          <div className="text-slate-300">
            {'  • Modelo:      '}<span className="text-white font-semibold">{model.name}</span> ({model.parametersB}B parâmetros, {model.layers} layers)<br />
            {'  • Quantização: '}<span className="text-cyan-300 font-semibold">{quant.name}</span> [{quant.qualityRetention} fidelidade]<br />
            {'  • Janela Ctx:  '}<span className="text-white font-semibold">{params.contextLength.toLocaleString()} tokens</span><br />
            {'  • Hardware:    '}<span className="text-white font-semibold">{hardware.name}</span><br />
            {'  • Banda Mem:   '}<span className="text-slate-300">{hardware.memoryBandwidthGBs} GB/s ({hardware.isUnifiedMemory ? 'Unified Memory' : 'Discrete VRAM'})</span>
          </div>
        </div>

        <div>
          <div className="text-slate-200 font-bold">BREAKDOWN DE CONSUMO DE MEMÓRIA:</div>
          <div className="text-slate-300">
            {'  ├─ Pesos do Modelo:       '}<span className="text-cyan-400 font-semibold">{result.weightsMemoryGB.toFixed(2).padStart(6, ' ')} GB</span><br />
            {'  ├─ KV Cache ('}{params.contextLength.toString().padStart(5, ' ')}{' ctx): '}<span className="text-indigo-400 font-semibold">{result.kvCacheMemoryGB.toFixed(2).padStart(6, ' ')} GB</span><br />
            {'  ├─ Buffers de Ativação:   '}<span className="text-amber-400 font-semibold">{result.activationsMemoryGB.toFixed(2).padStart(6, ' ')} GB</span><br />
            {'  ├─ Overhead Runtime:      '}<span className="text-slate-400 font-semibold">{result.runtimeOverheadGB.toFixed(2).padStart(6, ' ')} GB</span><br />
            {'  └─ '}<span className="text-white font-bold">TOTAL NECESSÁRIO:      {result.totalModelRequiredGB.toFixed(2).padStart(6, ' ')} GB</span>
          </div>
        </div>

        <div>
          <div className="text-slate-200 font-bold">VEREDITO DE ARQUITETURA:</div>
          <div className={`font-bold ${result.status === 'full_gpu' ? 'text-emerald-400' : result.status === 'oom' ? 'text-rose-500' : 'text-amber-400'}`}>
            {'  ▶ '}{result.statusTitle.toUpperCase()}
          </div>
          <div className="text-slate-300">
            {'  • Capacidade Utilizável: '}{result.usableVramGB} GB VRAM / {result.totalUsableMemoryGB} GB Total<br />
            {'  • Divisão de Camadas:    '}<span className="text-cyan-300 font-semibold">{result.gpuLayers}/{result.totalLayers} layers na GPU</span> ({result.percentageInGpu}%), {result.cpuLayers} na CPU<br />
            {'  • Throughput Estimado:   '}<span className="text-emerald-400 font-bold">{result.estimatedRealTokensPerSec} tokens/segundo</span> (Teórico máximo: {result.theoreticalMaxTokensPerSec} T/s)
          </div>
        </div>

        <div>
          <div className="text-slate-200 font-bold">COMANDO RECOMENDADO PARA INFERÊNCIA:</div>
          {result.status === 'full_gpu' ? (
            <div className="text-slate-400">
              <span className="text-slate-500"># llama.cpp (100% offload GPU)</span><br />
              <span className="text-cyan-300">llama-server -m {model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.{quant.id.toLowerCase()}.gguf -c {params.contextLength} -ngl 99</span><br />
              <span className="text-slate-500"># Ollama</span><br />
              <span className="text-cyan-300">ollama run {model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}:{quant.id.toLowerCase()}</span>
            </div>
          ) : result.status === 'hybrid_offload' ? (
            <div className="text-slate-400">
              <span className="text-slate-500"># llama.cpp com offload exato de layers calculados</span><br />
              <span className="text-cyan-300">llama-server -m {model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.gguf -c {params.contextLength} -ngl {result.gpuLayers} --threads 8</span>
            </div>
          ) : result.status === 'cpu_only' ? (
            <div className="text-slate-400">
              <span className="text-slate-500"># Execução em CPU com threads otimizadas</span><br />
              <span className="text-cyan-300">llama-server -m {model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.gguf -c {params.contextLength} -ngl 0 --threads 6</span>
            </div>
          ) : (
            <div className="text-rose-400">
              Hardware insuficiente para este modelo e contexto. Tente quantização &apos;q4_k_m&apos; ou reduza o contexto para 4096 tokens.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner introducing the Python Script */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Script Python CLI Standalone (ai_edge_estimator.py)
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Script em Python puro e portável para ser executado no terminal da sua máquina local, servidor edge ou pipeline de CI/CD.
            Detecta automaticamente GPU NVIDIA, Apple Silicon, memória RAM e formata relatórios ricos com tabelas ANSI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
          </button>
          <button
            onClick={onDownloadScript}
            className="px-3.5 py-2 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar ai_edge_estimator.py</span>
          </button>
        </div>
      </div>

      {/* View Switcher: Simulator vs Code */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'simulator'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Simulador de Terminal CLI
          </button>
          <button
            onClick={() => setActiveSubTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'code'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Código Fonte Python (350+ linhas)
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
          Python 3.8+ · Zero dependências obrigatórias
        </span>
      </div>

      {activeSubTab === 'simulator' ? (
        <div className="space-y-4">
          {/* Simulated CLI execution toolbar */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-cyan-400 font-mono text-xs select-none">$ python ai_edge_estimator.py</span>
              <input
                type="text"
                value={cliArgs}
                onChange={(e) => setCliArgs(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => runSimulation('normal')}
                className="px-2.5 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 rounded transition-colors flex items-center gap-1"
                title="Executar simulação"
              >
                <Play className="w-3 h-3" />
                <span>Executar</span>
              </button>
              <button
                onClick={() => {
                  setCliArgs('--auto-detect');
                  runSimulation('autodetect');
                }}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 rounded transition-colors"
              >
                --auto-detect
              </button>
              <button
                onClick={() => {
                  setCliArgs(`--model ${model.id} --quant ${quant.id.toLowerCase()} --json`);
                  runSimulation('json');
                }}
                className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 rounded transition-colors"
              >
                --json
              </button>
            </div>
          </div>

          {/* Terminal Window Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Terminal Window Title Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  bash - python ai_edge_estimator.py {cliArgs}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                UTF-8 · ANSI Color Mode
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 overflow-x-auto min-h-[380px]">
              {isRunning ? (
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs py-8">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Calculando parâmetros de inferência e mapeamento de memória...</span>
                </div>
              ) : (
                renderTerminalOutput()
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Source Code View */
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              ai_edge_estimator.py
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Script completo pronto para executar
            </span>
          </div>
          <div className="p-4 max-h-[600px] overflow-y-auto">
            <pre className="text-slate-300 font-mono text-xs leading-relaxed">
              {fullPythonCode}
            </pre>
          </div>
        </div>
      )}

      {/* Execution Instructions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <h4 className="font-semibold text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Como executar no seu computador:
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
          <li>Baixe o arquivo <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">ai_edge_estimator.py</code> usando o botão acima.</li>
          <li>(Opcional) Instale <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">pip install psutil</code> para detecção automática precisa de RAM.</li>
          <li>Execute no terminal: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">python3 ai_edge_estimator.py --auto-detect</code></li>
          <li>Ou customize qualquer modelo: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300 font-mono">python3 ai_edge_estimator.py --model llama_3_1_8b --quant q4_k_m --context 16384</code></li>
        </ol>
      </div>
    </div>
  );
};
