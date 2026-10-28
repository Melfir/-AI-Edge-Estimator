import React, { useState } from 'react';
import { ModelProfile, QuantProfile, QuantizationType, KvCacheQuant } from '../types';
import { MODEL_PRESETS, QUANT_PROFILES } from '../lib/presets';
import { Sliders, Search, Sparkles, Database, Info } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: ModelProfile;
  setSelectedModel: (model: ModelProfile) => void;
  selectedQuant: QuantProfile;
  setSelectedQuant: (quant: QuantProfile) => void;
  contextLength: number;
  setContextLength: (ctx: number) => void;
  kvCacheQuant: KvCacheQuant;
  setKvCacheQuant: (kv: KvCacheQuant) => void;
  batchSize: number;
  setBatchSize: (batch: number) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  selectedQuant,
  setSelectedQuant,
  contextLength,
  setContextLength,
  kvCacheQuant,
  setKvCacheQuant,
  batchSize,
  setBatchSize,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  const [isCustomEditing, setIsCustomEditing] = useState(selectedModel.id === 'custom_model');

  const families = ['all', 'DeepSeek R1', 'Qwen 2.5', 'Llama 3.x', 'Mistral', 'Gemma 2', 'Phi'];

  const filteredModels = MODEL_PRESETS.filter((m) => {
    const matchesFamily = familyFilter === 'all' || m.family === familyFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  const contextPresets = [2048, 4096, 8192, 16384, 32768, 65536, 131072];

  const handleCustomParamChange = (field: keyof ModelProfile, value: number) => {
    setSelectedModel({
      ...selectedModel,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            1. Modelo e Parâmetros de Inferência
          </h2>
        </div>
        <span className="text-xs text-slate-400 tabular-nums font-mono">
          {selectedModel.parametersB}B Params · {selectedModel.layers} Layers · {selectedModel.kvHeads} KV Heads
        </span>
      </div>

      {/* Model Family Filter and Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelo (ex: DeepSeek, Qwen 2.5, 7B, 70B)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {families.map((fam) => (
              <button
                key={fam}
                onClick={() => setFamilyFilter(fam)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  familyFilter === fam
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {fam === 'all' ? 'Todos' : fam}
              </button>
            ))}
          </div>
        </div>

        {/* Model Presets List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredModels.map((model) => {
            const isSelected = selectedModel.id === model.id;
            return (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModel(model);
                  setIsCustomEditing(model.id === 'custom_model');
                  if (contextLength > model.contextMaxTokens) {
                    setContextLength(model.defaultContextTokens);
                  }
                }}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {model.name}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400/90 shrink-0 font-medium tabular-nums">
                    {model.parametersB}B
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Model Parameters Drawer if custom is selected */}
      {isCustomEditing && (
        <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">Especificações de Arquitetura do Modelo Custom</span>
            <span className="text-[11px] text-slate-400">Insira valores conforme config.json</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Parâmetros (Bilh)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                value={selectedModel.parametersB}
                onChange={(e) => handleCustomParamChange('parametersB', parseFloat(e.target.value) || 7)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Camadas (Layers)</label>
              <input
                type="number"
                step="1"
                min="4"
                max="128"
                value={selectedModel.layers}
                onChange={(e) => handleCustomParamChange('layers', parseInt(e.target.value) || 32)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">KV Heads (GQA)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="64"
                value={selectedModel.kvHeads}
                onChange={(e) => handleCustomParamChange('kvHeads', parseInt(e.target.value) || 8)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Hidden Size</label>
              <input
                type="number"
                step="256"
                min="512"
                max="16384"
                value={selectedModel.hiddenSize}
                onChange={(e) => handleCustomParamChange('hiddenSize', parseInt(e.target.value) || 4096)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Quantization Picker */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            Formato de Quantização de Pesos
          </label>
          <span className="text-xs text-cyan-400 font-mono font-medium">
            {selectedQuant.bytesPerParam} B/param ({selectedQuant.bitsPerWeight} bits) · {selectedQuant.qualityRetention}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {QUANT_PROFILES.map((quant) => {
            const isSelected = selectedQuant.id === quant.id;
            return (
              <button
                key={quant.id}
                onClick={() => setSelectedQuant(quant)}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {quant.recommended && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">
                    Recomendado
                  </span>
                )}
                <div className="text-xs font-bold">{quant.id}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{quant.qualityRetention}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Context Length Slider & Presets */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-200">
            Janela de Contexto (Context Window)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {contextLength.toLocaleString()} tokens
            </span>
            <span className="text-[11px] text-slate-500">
              (Máx nativo: {selectedModel.contextMaxTokens.toLocaleString()})
            </span>
          </div>
        </div>

        <input
          type="range"
          min={1024}
          max={Math.min(131072, selectedModel.contextMaxTokens)}
          step={1024}
          value={contextLength}
          onChange={(e) => setContextLength(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 mr-1">Atalhos rápidos:</span>
          {contextPresets
            .filter((p) => p <= selectedModel.contextMaxTokens)
            .map((preset) => (
              <button
                key={preset}
                onClick={() => setContextLength(preset)}
                className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                  contextLength === preset
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {preset >= 1024 ? `${preset / 1024}k` : preset}
              </button>
            ))}
        </div>
      </div>

      {/* KV Cache Quantization and Batch Size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Quantização de KV Cache
            </label>
            <span className="text-[11px] text-slate-400">Economiza VRAM em contextos longos</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['FP16', 'Q8_0', 'Q4_0'] as KvCacheQuant[]).map((kv) => (
              <button
                key={kv}
                onClick={() => setKvCacheQuant(kv)}
                className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                  kvCacheQuant === kv
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {kv} {kv === 'FP16' ? '(2B)' : kv === 'Q8_0' ? '(1B)' : '(0.5B)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Tamanho do Lote (Batch Size)
            </label>
            <span className="text-[11px] text-slate-400">1 para chat/interativo, &gt;1 para agentes</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 4, 8].map((b) => (
              <button
                key={b}
                onClick={() => setBatchSize(b)}
                className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                  batchSize === b
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
