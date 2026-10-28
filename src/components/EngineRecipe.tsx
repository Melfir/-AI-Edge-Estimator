import React, { useState } from 'react';
import { CalculationResult, HardwareProfile, InferenceParams, ModelProfile, QuantProfile } from '../types';
import { Terminal, Copy, Check, Server, Cpu, Layers, Sparkles } from 'lucide-react';

interface EngineRecipeProps {
  model: ModelProfile;
  hardware: HardwareProfile;
  quant: QuantProfile;
  params: InferenceParams;
  result: CalculationResult;
}

export const EngineRecipe: React.FC<EngineRecipeProps> = ({
  model,
  hardware,
  quant,
  params,
  result,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modelCleanName = model.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const quantClean = quant.id.toLowerCase();

  // 1. llama.cpp CLI / server command
  const llamacppCommand = `llama-server \\
  --model ./${modelCleanName}.${quantClean}.gguf \\
  --ctx-size ${params.contextLength} \\
  --n-gpu-layers ${result.status === 'full_gpu' ? 99 : result.gpuLayers} \\
  --threads ${hardware.architecture === 'apple_silicon' ? 8 : 6} \\
  --flash-attn \\
  --port 8080`;

  // 2. Ollama Modelfile & Run Command
  const ollamaModelfile = `FROM ./${modelCleanName}.${quantClean}.gguf
PARAMETER num_ctx ${params.contextLength}
PARAMETER num_gpu ${result.status === 'full_gpu' ? 99 : result.gpuLayers}
PARAMETER temperature 0.7
PARAMETER top_p 0.9
SYSTEM "Você é um assistente de IA especialista em engenharia e raciocínio profundo executando localmente via Edge Computing."`;

  const ollamaCommand = `ollama run ${modelCleanName}:${quantClean}`;

  // 3. vLLM (for NVIDIA GPU)
  const vllmCommand = `python3 -m vllm.entrypoints.openai.api_server \\
  --model ${model.id} \\
  --max-model-len ${params.contextLength} \\
  --gpu-memory-utilization 0.90 \\
  --dtype ${quant.id === 'FP16' ? 'float16' : 'auto'} \\
  --port 8000`;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-1">
          <Server className="w-4 h-4 text-cyan-400" />
          Receitas de Execução Otimizadas para seu Hardware
        </h2>
        <p className="text-xs text-slate-400">
          Comandos prontos para rodar no seu ambiente local (llama.cpp, Ollama ou vLLM) com a quantidade exata de layers e contexto calculados.
        </p>
      </div>

      {/* Recipe 1: llama.cpp (The Gold Standard for Edge) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-bold text-slate-200">1. llama.cpp / llama-server (Recomendado para Edge)</span>
          </div>
          <button
            onClick={() => handleCopy(llamacppCommand, 'llamacpp')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors font-mono"
          >
            {copiedKey === 'llamacpp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'llamacpp' ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950/70">
          <pre className="text-xs font-mono text-cyan-300 leading-relaxed overflow-x-auto">
            {llamacppCommand}
          </pre>
          <div className="mt-3 text-[11px] text-slate-400 space-y-1">
            <div>• <strong className="text-slate-300">--n-gpu-layers {result.status === 'full_gpu' ? '99 (todos)' : result.gpuLayers}</strong>: Garante que exatamente a quantidade viável de camadas seja alocada na GPU sem risco de estouro de memória.</div>
            <div>• <strong className="text-slate-300">--flash-attn</strong>: Ativa FlashAttention para acelerar processamento de tokens e reduzir uso de memória temporária.</div>
          </div>
        </div>
      </div>

      {/* Recipe 2: Ollama Modelfile */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs font-bold text-slate-200">2. Ollama (CLI / Modelfile Customizado)</span>
          </div>
          <button
            onClick={() => handleCopy(ollamaModelfile, 'ollama')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors font-mono"
          >
            {copiedKey === 'ollama' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'ollama' ? 'Copiado Modelfile!' : 'Copiar Modelfile'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950/70 space-y-3">
          <div className="text-[11px] text-slate-400">
            Crie um arquivo chamado <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">Modelfile</code> com o conteúdo abaixo:
          </div>
          <pre className="text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto p-3 bg-slate-950 rounded border border-slate-800">
            {ollamaModelfile}
          </pre>
          <div className="text-[11px] text-slate-400">
            Em seguida, crie e execute no terminal:
            <div className="mt-1 font-mono text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
              ollama create meu-modelo-edge -f ./Modelfile && ollama run meu-modelo-edge
            </div>
          </div>
        </div>
      </div>

      {/* Recipe 3: vLLM (For NVIDIA CUDA servers) */}
      {hardware.architecture === 'nvidia_discrete' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-slate-200">3. vLLM (Máximo Throughput em GPUs NVIDIA)</span>
            </div>
            <button
              onClick={() => handleCopy(vllmCommand, 'vllm')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors font-mono"
            >
              {copiedKey === 'vllm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'vllm' ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <div className="p-4 bg-slate-950/70">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
              {vllmCommand}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
