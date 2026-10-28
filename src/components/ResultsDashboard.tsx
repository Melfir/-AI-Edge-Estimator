import React from 'react';
import { CalculationResult, HardwareProfile, ModelProfile, QuantProfile } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Zap, Cpu, Server, Activity, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ResultsDashboardProps {
  result: CalculationResult;
  model: ModelProfile;
  hardware: HardwareProfile;
  quant: QuantProfile;
  contextLength: number;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  model,
  hardware,
  quant,
  contextLength,
}) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'full_gpu':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />;
      case 'hybrid_offload':
      case 'cpu_only':
        return <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />;
      case 'oom':
        return <XCircle className="w-6 h-6 text-rose-500 shrink-0" />;
    }
  };

  const getStatusBorderBg = () => {
    switch (result.status) {
      case 'full_gpu':
        return 'border-emerald-500/40 bg-emerald-950/20';
      case 'hybrid_offload':
      case 'cpu_only':
        return 'border-amber-500/40 bg-amber-950/20';
      case 'oom':
        return 'border-rose-500/40 bg-rose-950/20';
    }
  };

  const getSpeedRating = (tps: number) => {
    if (tps >= 50) return { label: 'Ultra Rápido', color: 'text-emerald-400', desc: 'Superior à velocidade de leitura humana' };
    if (tps >= 25) return { label: 'Excelente', color: 'text-emerald-400', desc: 'Fluxo interativo fluido e imediato' };
    if (tps >= 12) return { label: 'Bom / Interativo', color: 'text-cyan-400', desc: 'Perfeito para assistentes locais e chat' };
    if (tps >= 5) return { label: 'Aceitável', color: 'text-amber-400', desc: 'Leitura cadenciada, viável para tarefas em segundo plano' };
    if (tps > 0) return { label: 'Lento', color: 'text-amber-500', desc: 'Geração demorada, útil apenas para batch offline' };
    return { label: 'Inviável', color: 'text-rose-500', desc: 'Não executará devido à falta de memória' };
  };

  const speedRating = getSpeedRating(result.estimatedRealTokensPerSec);

  // Percentages for stacked memory bar
  const totalBarTarget = Math.max(result.totalModelRequiredGB, result.totalUsableMemoryGB, 1);
  const weightsPct = (result.weightsMemoryGB / totalBarTarget) * 100;
  const kvPct = (result.kvCacheMemoryGB / totalBarTarget) * 100;
  const actPct = (result.activationsMemoryGB / totalBarTarget) * 100;
  const overheadPct = (result.runtimeOverheadGB / totalBarTarget) * 100;

  return (
    <div className="space-y-6">
      {/* 1. Dominant Feasibility Verdict Banner */}
      <div className={`p-5 rounded-xl border ${getStatusBorderBg()} backdrop-blur-sm transition-all`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {getStatusIcon()}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {result.statusTitle}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {result.statusDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Memória Necessária</span>
              <span className="text-lg font-bold text-slate-100 tabular-nums">
                {result.totalModelRequiredGB} <span className="text-xs font-normal text-slate-400">GB</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Disponível</span>
              <span className="text-lg font-bold text-cyan-400 tabular-nums">
                {hardware.isUnifiedMemory ? result.usableVramGB : result.totalUsableMemoryGB} <span className="text-xs font-normal text-slate-400">GB</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row: Speed, Layer Offload, Memory Pressure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tokens Per Second */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Velocidade Estimada</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {result.estimatedRealTokensPerSec}
              </span>
              <span className="text-xs text-slate-400 font-sans">tokens / seg</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-xs font-semibold ${speedRating.color}`}>{speedRating.label}</span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-[11px] text-slate-400 truncate">{speedRating.desc}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Máx teórico:</span>
            <span className="text-slate-300 font-medium tabular-nums">{result.theoreticalMaxTokensPerSec} T/s</span>
          </div>
        </div>

        {/* Metric 2: GPU Layer Offload */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Offload de Camadas</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {result.gpuLayers}
              </span>
              <span className="text-xs text-slate-400 font-sans">de {result.totalLayers} layers</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${result.percentageInGpu}%` }}
                />
              </div>
              <span className="text-xs font-mono text-cyan-300 font-semibold tabular-nums shrink-0">
                {result.percentageInGpu}%
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Layers na CPU:</span>
            <span className="text-slate-300 font-medium tabular-nums">{result.cpuLayers} layers</span>
          </div>
        </div>

        {/* Metric 3: Context KV Cache Footprint */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tamanho do KV Cache</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {result.kvCacheMemoryGB}
              </span>
              <span className="text-xs text-slate-400 font-sans">GB</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Janela de <span className="text-slate-200 font-mono font-medium">{contextLength.toLocaleString()}</span> tokens
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Atenção:</span>
            <span className="text-cyan-400 font-medium">{model.kvHeads < model.queryHeads ? 'GQA (Eficiente)' : 'MHA'}</span>
          </div>
        </div>

        {/* Metric 4: Prefill Latency / TTFT */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Prefill (TTFT)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {result.prefillSpeedTokensPerSec}
              </span>
              <span className="text-xs text-slate-400 font-sans">tokens / seg</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Processamento inicial do prompt
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between font-mono">
            <span>Gargalo:</span>
            <span className="text-slate-300 font-medium">
              {result.bottleneck === 'memory_bandwidth' ? 'Banda de Memória' : result.bottleneck === 'pcie_bus' ? 'Barramento PCIe' : 'Capacidade RAM'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Memory Allocation Breakdown Stacked Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Decomposição de Consumo de Memória (VRAM / RAM)
          </h4>
          <span className="text-xs font-mono text-slate-400">
            Total Exigido: <strong className="text-slate-100 font-bold">{result.totalModelRequiredGB} GB</strong> / Disponível: {result.totalUsableMemoryGB} GB
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full bg-slate-950 rounded-lg h-5 p-0.5 border border-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${weightsPct}%` }}
            className="bg-cyan-500 h-full rounded-l transition-all duration-300"
            title={`Pesos do Modelo: ${result.weightsMemoryGB} GB`}
          />
          <div
            style={{ width: `${kvPct}%` }}
            className="bg-indigo-500 h-full transition-all duration-300"
            title={`KV Cache: ${result.kvCacheMemoryGB} GB`}
          />
          <div
            style={{ width: `${actPct}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title={`Ativações: ${result.activationsMemoryGB} GB`}
          />
          <div
            style={{ width: `${overheadPct}%` }}
            className="bg-slate-600 h-full rounded-r transition-all duration-300"
            title={`Overhead de Runtime: ${result.runtimeOverheadGB} GB`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">Pesos ({quant.id})</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">{result.weightsMemoryGB} GB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">KV Cache ({contextLength.toLocaleString()} ctx)</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">{result.kvCacheMemoryGB} GB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">Ativações &amp; Scratch</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">{result.activationsMemoryGB} GB</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[11px]">Overhead Driver/CUDA</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">{result.runtimeOverheadGB} GB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Layer Offloading Map Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Mapeamento de Camadas ({model.layers} Transformer Layers)
          </h4>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> GPU: {result.gpuLayers} layers
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> CPU: {result.cpuLayers} layers
            </span>
          </div>
        </div>

        {/* Visual blocks for each layer */}
        <div className="grid grid-cols-8 sm:grid-cols-16 md:grid-cols-20 lg:grid-cols-32 gap-1.5 p-3 bg-slate-950 rounded-lg border border-slate-800">
          {Array.from({ length: model.layers }).map((_, i) => {
            const isGpu = i < result.gpuLayers;
            return (
              <div
                key={i}
                className={`h-6 rounded text-[9px] font-mono flex items-center justify-center font-semibold transition-all ${
                  result.status === 'oom'
                    ? 'bg-rose-950/40 text-rose-500 border border-rose-900/60'
                    : isGpu
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
                title={`Camada ${i + 1}: ${isGpu ? 'Acelerada em GPU' : 'Processada em CPU'}`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">
          {result.status === 'full_gpu'
            ? 'Todos os layers são processados na GPU via Metal/CUDA com zero tráfego no barramento PCIe.'
            : result.status === 'hybrid_offload'
            ? `O llama.cpp executará os primeiros ${result.gpuLayers} layers na GPU e transferirá tensores intermediários para a CPU processar os ${result.cpuLayers} layers restantes.`
            : 'Processamento integral em threads de CPU com vetorização AVX/NEON.'}
        </p>
      </div>

      {/* 5. Actionable Architectural Recommendations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Recomendações de Otimização para este Cenário
        </h4>
        <div className="space-y-2">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
              <span className="text-cyan-400 font-mono font-bold mt-0.5">0{index + 1}.</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
