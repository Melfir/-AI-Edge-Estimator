import React, { useState } from 'react';
import { HardwareProfile } from '../types';
import { HARDWARE_PRESETS } from '../lib/presets';
import { HardDrive, Laptop, Cpu, ShieldCheck, Gauge } from 'lucide-react';

interface HardwareSelectorProps {
  selectedHardware: HardwareProfile;
  setSelectedHardware: (hw: HardwareProfile) => void;
}

export const HardwareSelector: React.FC<HardwareSelectorProps> = ({
  selectedHardware,
  setSelectedHardware,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'apple' | 'nvidia_rtx' | 'jetson' | 'sbc_pc'>('all');
  const [isCustomMode, setIsCustomMode] = useState(selectedHardware.id === 'custom_hardware');

  const categories = [
    { id: 'all', label: 'Todos os Dispositivos' },
    { id: 'apple', label: 'Apple Silicon (M1–M4)' },
    { id: 'nvidia_rtx', label: 'NVIDIA RTX (Desktop/Laptop)' },
    { id: 'jetson', label: 'NVIDIA Jetson (Edge AI)' },
    { id: 'sbc_pc', label: 'Mini PC / Raspberry Pi' },
  ];

  const filteredHardware = HARDWARE_PRESETS.filter((hw) => {
    if (categoryFilter === 'all') return true;
    return hw.category === categoryFilter;
  });

  const handleCustomFieldChange = (field: keyof HardwareProfile, value: any) => {
    setSelectedHardware({
      ...selectedHardware,
      [field]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            2. Hardware Edge e Recursos de Memória
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {selectedHardware.isUnifiedMemory ? 'Memória Unificada' : 'VRAM Dedicada'} · {selectedHardware.memoryBandwidthGBs} GB/s
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Hardware Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredHardware.map((hw) => {
          const isSelected = selectedHardware.id === hw.id;
          return (
            <button
              key={hw.id}
              onClick={() => {
                setSelectedHardware(hw);
                setIsCustomMode(hw.id === 'custom_hardware');
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                  {hw.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400/90 mb-1">
                <span>{hw.isUnifiedMemory ? `${hw.totalRamGB}GB RAM Unificada` : `${hw.vramGB}GB VRAM + ${hw.totalRamGB}GB RAM`}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{hw.memoryBandwidthGBs} GB/s</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {hw.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Hardware Form if selected */}
      {isCustomMode && (
        <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300">Configuração de Hardware Customizado</span>
            <span className="text-[11px] text-slate-400">Ajuste os valores para o seu computador</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">RAM Total (GB)</label>
              <input
                type="number"
                step="1"
                min="4"
                max="512"
                value={selectedHardware.totalRamGB}
                onChange={(e) => handleCustomFieldChange('totalRamGB', parseFloat(e.target.value) || 16)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">VRAM Dedicada (GB)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="96"
                value={selectedHardware.vramGB}
                onChange={(e) => handleCustomFieldChange('vramGB', parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Largura de Banda (GB/s)</label>
              <input
                type="number"
                step="10"
                min="10"
                max="2000"
                value={selectedHardware.memoryBandwidthGBs}
                onChange={(e) => handleCustomFieldChange('memoryBandwidthGBs', parseFloat(e.target.value) || 100)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Reserva do SO (GB)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="16"
                value={selectedHardware.systemOsReserveGB}
                onChange={(e) => handleCustomFieldChange('systemOsReserveGB', parseFloat(e.target.value) || 2)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={selectedHardware.isUnifiedMemory}
                onChange={(e) => handleCustomFieldChange('isUnifiedMemory', e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
              <span>Arquitetura de Memória Unificada (Apple Silicon, Jetson, APU)</span>
            </label>
          </div>
        </div>
      )}

      {/* Selected Hardware Summary Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-200">
            {selectedHardware.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Barramento: {selectedHardware.busType} · Reserva do SO: {selectedHardware.systemOsReserveGB} GB
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <div className="text-slate-400 text-[10px]">Memória Total</div>
            <div className="text-slate-100 font-bold tabular-nums">
              {selectedHardware.isUnifiedMemory
                ? `${selectedHardware.totalRamGB} GB Unif.`
                : `${selectedHardware.vramGB} GB VRAM + ${selectedHardware.totalRamGB} GB RAM`}
            </div>
          </div>
          <div className="text-right border-l border-slate-800 pl-4">
            <div className="text-slate-400 text-[10px]">Largura de Banda</div>
            <div className="text-cyan-400 font-bold tabular-nums">
              {selectedHardware.memoryBandwidthGBs} GB/s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
