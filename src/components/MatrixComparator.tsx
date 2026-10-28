import React, { useState } from 'react';
import { HardwareProfile, ModelProfile, QuantProfile } from '../types';
import { HARDWARE_PRESETS, MODEL_PRESETS, QUANT_PROFILES } from '../lib/presets';
import { calculateEdgeFeasibility } from '../lib/calculator';
import { Grid, Laptop, Database, CheckCircle2, AlertTriangle, XCircle, ArrowUpDown } from 'lucide-react';

interface MatrixComparatorProps {
  currentHardware: HardwareProfile;
  currentModel: ModelProfile;
  currentQuant: QuantProfile;
  onSelectModel: (m: ModelProfile) => void;
  onSelectHardware: (hw: HardwareProfile) => void;
}

export const MatrixComparator: React.FC<MatrixComparatorProps> = ({
  currentHardware,
  currentModel,
  currentQuant,
  onSelectModel,
  onSelectHardware,
}) => {
  const [matrixMode, setMatrixMode] = useState<'hardware_perspective' | 'model_perspective'>('hardware_perspective');

  const representativeModels = MODEL_PRESETS.filter((m) => m.id !== 'custom_model');
  const representativeHardware = HARDWARE_PRESETS.filter((h) => h.id !== 'custom_hardware');

  const keyQuants = QUANT_PROFILES.filter((q) => ['FP16', 'Q8_0', 'Q5_K_M', 'Q4_K_M', 'Q3_K_M'].includes(q.id));

  return (
    <div className="space-y-6">
      {/* Perspective Toggle */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-4 h-4 text-cyan-400" />
            Matriz de Viabilidade e Comparativo Arquitetural
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare o comportamento de múltiplos modelos e tipos de hardware em lote para planejar sua infraestrutura edge.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMatrixMode('hardware_perspective')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              matrixMode === 'hardware_perspective'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quais modelos cabem na minha máquina?
          </button>
          <button
            onClick={() => setMatrixMode('model_perspective')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              matrixMode === 'model_perspective'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Qual máquina roda meu modelo alvo?
          </button>
        </div>
      </div>

      {matrixMode === 'hardware_perspective' ? (
        /* Perspective 1: Fixed current hardware, show all models vs quants */
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                Máquina Atual Selecionada:{' '}
                <strong className="text-cyan-300 font-bold">{currentHardware.name}</strong>
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {currentHardware.isUnifiedMemory ? `${currentHardware.totalRamGB}GB Unificada` : `${currentHardware.vramGB}GB VRAM + ${currentHardware.totalRamGB}GB RAM`} · {currentHardware.memoryBandwidthGBs} GB/s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Modelo</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Parâmetros</th>
                  {keyQuants.map((q) => (
                    <th key={q.id} className="py-2.5 px-3 font-semibold text-center text-slate-300">
                      {q.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {representativeModels.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onSelectModel(m)}
                          className="font-sans font-medium text-slate-200 hover:text-cyan-300 text-left transition-colors"
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        {m.parametersB}B
                      </td>
                      {keyQuants.map((q) => {
                        const res = calculateEdgeFeasibility(m, currentHardware, q, {
                          contextLength: 8192,
                          batchSize: 1,
                          kvCacheQuant: 'FP16',
                          runner: 'llamacpp',
                        });

                        let badgeColor = 'bg-slate-900 text-slate-400 border-slate-800';
                        let icon = null;
                        if (res.status === 'full_gpu') {
                          badgeColor = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40';
                          icon = <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />;
                        } else if (res.status === 'hybrid_offload' || res.status === 'cpu_only') {
                          badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-500/40';
                          icon = <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
                        } else {
                          badgeColor = 'bg-rose-950/30 text-rose-400 border-rose-900/40';
                          icon = <XCircle className="w-3 h-3 text-rose-500 shrink-0" />;
                        }

                        return (
                          <td key={q.id} className="py-2 px-2 text-center">
                            <div className={`inline-flex flex-col items-center justify-center py-1 px-2 rounded border ${badgeColor} min-w-[70px]`}>
                              <div className="flex items-center gap-1 font-semibold text-[10px]">
                                {icon}
                                <span>{res.status === 'full_gpu' ? 'Viável' : res.status === 'oom' ? 'OOM' : 'Híbrido'}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 tabular-nums">
                                {res.status === 'oom' ? `-${res.memoryDeficitGB}GB` : `${res.estimatedRealTokensPerSec} T/s`}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Perspective 2: Fixed target model, show across hardware */
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-200">
                Modelo Alvo Selecionado:{' '}
                <strong className="text-cyan-300 font-bold">{currentModel.name}</strong> ({currentModel.parametersB}B Params, {currentQuant.id})
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Contexto Padrão: 8.192 tokens
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Dispositivo Hardware</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-300">VRAM / RAM</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Largura de Banda</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-300">Layers na GPU</th>
                  <th className="py-2.5 px-3 font-semibold text-right text-slate-300">Velocidade Estimada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {representativeHardware.map((hw) => {
                  const res = calculateEdgeFeasibility(currentModel, hw, currentQuant, {
                    contextLength: 8192,
                    batchSize: 1,
                    kvCacheQuant: 'FP16',
                    runner: 'llamacpp',
                  });

                  return (
                    <tr key={hw.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onSelectHardware(hw)}
                          className="font-sans font-medium text-slate-200 hover:text-cyan-300 text-left transition-colors"
                        >
                          {hw.name}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-300 tabular-nums">
                        {hw.isUnifiedMemory ? `${hw.totalRamGB}GB Unif.` : `${hw.vramGB}GB / ${hw.totalRamGB}GB`}
                      </td>
                      <td className="py-3 px-3 text-slate-400 tabular-nums">
                        {hw.memoryBandwidthGBs} GB/s
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            res.status === 'full_gpu'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                              : res.status === 'oom'
                              ? 'bg-rose-950/30 text-rose-400 border-rose-900/40'
                              : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {res.status === 'full_gpu' ? 'Totalmente Viável' : res.status === 'oom' ? 'OOM (Sem Memória)' : 'Offload Híbrido'}
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums">
                        <span className="text-cyan-400 font-semibold">{res.gpuLayers}</span>
                        <span className="text-slate-500"> / {res.totalLayers}</span>
                        <span className="text-[10px] text-slate-400 ml-1.5">({res.percentageInGpu}%)</span>
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums">
                        <span className={`font-bold text-sm ${res.status === 'oom' ? 'text-slate-500' : 'text-emerald-400'}`}>
                          {res.status === 'oom' ? '0' : res.estimatedRealTokensPerSec}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans ml-1">T/s</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
