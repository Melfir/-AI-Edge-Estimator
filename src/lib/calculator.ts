import { CalculationResult, FeasibilityStatus, HardwareProfile, InferenceParams, ModelProfile, QuantProfile } from '../types';

export function calculateEdgeFeasibility(
  model: ModelProfile,
  hardware: HardwareProfile,
  quant: QuantProfile,
  params: InferenceParams
): CalculationResult {
  // 1. Model Weights Memory (GB)
  // P (billions) * 10^9 * bytesPerParam / (1024^3)
  const weightsBytes = model.parametersB * 1e9 * quant.bytesPerParam;
  const weightsMemoryGB = Number((weightsBytes / Math.pow(1024, 3)).toFixed(2));

  // 2. KV Cache Memory (GB)
  // 2 * layers * kv_heads * head_dim * bytes_per_element * context_length * batch_size
  let kvBytesPerElement = 2.0; // FP16 default
  if (params.kvCacheQuant === 'Q8_0') {
    kvBytesPerElement = 1.0;
  } else if (params.kvCacheQuant === 'Q4_0') {
    kvBytesPerElement = 0.5;
  }

  const kvBytesPerToken = 2 * model.layers * model.kvHeads * model.headDim * kvBytesPerElement;
  const totalKvBytes = kvBytesPerToken * params.contextLength * params.batchSize;
  const kvCacheMemoryGB = Number((totalKvBytes / Math.pow(1024, 3)).toFixed(2));

  // 3. Activations & Runtime Overhead (GB)
  // Activation memory scales with context length and batch size
  const activationBytes = model.hiddenSize * params.contextLength * params.batchSize * 2 * 4; // intermediate activations
  const activationsMemoryGB = Number(Math.max(0.15, activationBytes / Math.pow(1024, 3)).toFixed(2));

  // Base runtime overhead (CUDA context, Metal device buffers, llama.cpp scratch ring buffers)
  let baseRuntimeOverheadGB = 0.45;
  if (hardware.architecture === 'nvidia_discrete') {
    baseRuntimeOverheadGB = 0.65;
  } else if (hardware.architecture === 'apple_silicon') {
    baseRuntimeOverheadGB = 0.4;
  } else if (hardware.architecture === 'cpu_unified') {
    baseRuntimeOverheadGB = 0.3;
  }
  const runtimeOverheadGB = Number((baseRuntimeOverheadGB + activationsMemoryGB * 0.4).toFixed(2));

  // Total required memory
  const totalModelRequiredGB = Number(
    (weightsMemoryGB + kvCacheMemoryGB + activationsMemoryGB + runtimeOverheadGB).toFixed(2)
  );

  // 4. Usable Hardware Memory
  let usableVramGB = 0;
  let usableSystemRamGB = 0;
  let totalUsableMemoryGB = 0;

  if (hardware.isUnifiedMemory) {
    // Unified memory architecture (Apple Silicon, Jetson, Raspberry Pi, APU)
    // Usable pool is total RAM minus OS/system reserve
    const pool = Math.max(0, hardware.totalRamGB - hardware.systemOsReserveGB);
    // On Apple Silicon, Metal can address up to ~75% of unified RAM by default, or ~90% with sysctl
    usableVramGB = hardware.architecture === 'apple_silicon'
      ? Number((pool * 0.90).toFixed(1))
      : Number(pool.toFixed(1));
    usableSystemRamGB = Number(pool.toFixed(1));
    totalUsableMemoryGB = Number(pool.toFixed(1));
  } else {
    // Discrete GPU + Separate System RAM
    usableVramGB = Number(Math.max(0, hardware.vramGB - hardware.systemOsReserveGB).toFixed(1));
    // System RAM has separate OS consumption (~3GB for Windows/Linux desktop)
    usableSystemRamGB = Number(Math.max(0, hardware.totalRamGB - 3.5).toFixed(1));
    totalUsableMemoryGB = Number((usableVramGB + usableSystemRamGB).toFixed(1));
  }

  // 5. Feasibility Verdict & Layer Offload
  let status: FeasibilityStatus = 'full_gpu';
  let statusTitle = '';
  let statusBadge = '';
  let statusDescription = '';
  let gpuLayers = model.layers;
  let cpuLayers = 0;
  let memoryDeficitGB = 0;

  // Weight per layer
  const weightPerLayerGB = weightsMemoryGB / Math.max(1, model.layers);
  const contextAndOverheadGB = kvCacheMemoryGB + activationsMemoryGB + runtimeOverheadGB;

  if (hardware.architecture === 'cpu_unified' && !hardware.isUnifiedMemory) {
    // Pure CPU system without dedicated GPU
    if (totalModelRequiredGB <= usableSystemRamGB) {
      status = 'cpu_only';
      statusTitle = 'Viável em CPU (RAM do Sistema)';
      statusBadge = 'Execução em CPU';
      statusDescription = `O modelo cabe completamente na RAM (${usableSystemRamGB} GB utilizáveis), mas a inferência rodará 100% no processador x86/ARM via instruções AVX/NEON sem aceleração por GPU dedicada.`;
      gpuLayers = 0;
      cpuLayers = model.layers;
    } else {
      status = 'oom';
      memoryDeficitGB = Number((totalModelRequiredGB - usableSystemRamGB).toFixed(2));
      statusTitle = 'Inviável (Out of Memory - OOM)';
      statusBadge = 'Memória Insuficiente';
      statusDescription = `A máquina não possui RAM suficiente. São necessários ${totalModelRequiredGB} GB, mas restam apenas ${usableSystemRamGB} GB livres. Faltam ${memoryDeficitGB} GB.`;
      gpuLayers = 0;
      cpuLayers = 0;
    }
  } else if (totalModelRequiredGB <= usableVramGB) {
    // 100% fits in fast VRAM / Unified Metal Memory
    status = 'full_gpu';
    statusTitle = 'Totalmente Viável em VRAM (Full Offload)';
    statusBadge = '100% Acelerado em GPU';
    statusDescription = `Excelente! O modelo e o contexto de ${params.contextLength.toLocaleString()} tokens cabem com folga na memória rápida. Todos os ${model.layers} layers serão processados na GPU para máxima taxa de geração e menor latência.`;
    gpuLayers = model.layers;
    cpuLayers = 0;
  } else if (totalModelRequiredGB <= totalUsableMemoryGB) {
    // Fits across VRAM + System RAM (Offloading)
    status = 'hybrid_offload';
    statusTitle = 'Viabilidade Parcial (Offload Híbrido GPU + CPU)';
    statusBadge = 'Offload Dividido';

    // How many layers fit into usable VRAM after context and overhead?
    const availableVramForWeights = Math.max(0, usableVramGB - contextAndOverheadGB);
    gpuLayers = Math.min(model.layers - 1, Math.max(0, Math.floor(availableVramForWeights / weightPerLayerGB)));
    cpuLayers = model.layers - gpuLayers;

    statusDescription = `O modelo excede a VRAM dedicada (${usableVramGB} GB), mas cabe combinando VRAM e RAM do sistema. Você pode descarregar ${gpuLayers} de ${model.layers} layers para a GPU e os ${cpuLayers} restantes para a CPU. A taxa de geração será reduzida pelo barramento PCIe/RAM.`;
  } else {
    // Out of memory
    status = 'oom';
    memoryDeficitGB = Number((totalModelRequiredGB - totalUsableMemoryGB).toFixed(2));
    statusTitle = 'Inviável (Out of Memory - OOM)';
    statusBadge = 'Memória Insuficiente';
    statusDescription = `O modelo excede a capacidade total de memória do hardware. São necessários ${totalModelRequiredGB} GB, mas a máquina dispõe de ${totalUsableMemoryGB} GB utilizáveis. Faltam ${memoryDeficitGB} GB. Tente usar uma quantização mais agressiva (como Q4_K_M ou Q3_K_M) ou reduzir a janela de contexto.`;
    gpuLayers = 0;
    cpuLayers = 0;
  }

  const percentageInGpu = status === 'oom' ? 0 : Math.round((gpuLayers / Math.max(1, model.layers)) * 100);

  // 6. Performance Estimation (Tokens Per Second)
  // Generation is memory bandwidth bound: T/s ≈ Bandwidth (GB/s) / Model Size (GB)
  // Real world efficiency: ~75% for dedicated GPU, ~70% for Apple Silicon, ~40% for hybrid offload, ~55% for CPU
  const theoreticalMaxTokensPerSec = weightsMemoryGB > 0
    ? Number((hardware.memoryBandwidthGBs / weightsMemoryGB).toFixed(1))
    : 0;

  let estimatedRealTokensPerSec = 0;
  let prefillSpeedTokensPerSec = 0;

  if (status === 'full_gpu') {
    const efficiency = hardware.architecture === 'apple_silicon' ? 0.72 : 0.80;
    estimatedRealTokensPerSec = Number((theoreticalMaxTokensPerSec * efficiency).toFixed(1));
    // Prefill speed (approx based on TFLOPs and model size)
    prefillSpeedTokensPerSec = Number(Math.min(2500, Math.max(30, (hardware.tflopsFp16 || 20) * 45 / (model.parametersB * 0.4))).toFixed(0));
  } else if (status === 'hybrid_offload') {
    // Hybrid offload is throttled by PCIe transfer and CPU memory bandwidth (~30-60 GB/s)
    const hybridEffectiveBandwidth = Math.min(hardware.memoryBandwidthGBs * 0.35, 45);
    estimatedRealTokensPerSec = Number(Math.max(1.2, (hybridEffectiveBandwidth / weightsMemoryGB) * 0.65).toFixed(1));
    prefillSpeedTokensPerSec = Number(Math.max(15, (hardware.tflopsFp16 || 10) * 8 / model.parametersB).toFixed(0));
  } else if (status === 'cpu_only') {
    // Pure CPU memory bandwidth
    const cpuBandwidth = Math.min(hardware.memoryBandwidthGBs, 65);
    estimatedRealTokensPerSec = Number(Math.max(0.8, (cpuBandwidth / weightsMemoryGB) * 0.55).toFixed(1));
    prefillSpeedTokensPerSec = Number(Math.max(8, 25 / model.parametersB).toFixed(0));
  } else {
    estimatedRealTokensPerSec = 0;
    prefillSpeedTokensPerSec = 0;
  }

  // Memory Pressure (% of available target pool)
  const targetPool = status === 'full_gpu' ? usableVramGB : totalUsableMemoryGB;
  const memoryPressurePct = targetPool > 0
    ? Math.min(100, Math.round((totalModelRequiredGB / targetPool) * 100))
    : 100;

  // Bottleneck detection
  let bottleneck: CalculationResult['bottleneck'] = 'memory_bandwidth';
  if (status === 'oom') {
    bottleneck = 'memory_capacity';
  } else if (status === 'hybrid_offload') {
    bottleneck = 'pcie_bus';
  } else if (params.contextLength > 32768 && kvCacheMemoryGB > weightsMemoryGB * 0.5) {
    bottleneck = 'compute';
  }

  // Actionable architecture recommendations
  const recommendations: string[] = [];

  if (status === 'full_gpu') {
    recommendations.push(
      `Configuração ótima. Você pode usar ${params.runner === 'ollama' ? 'Ollama' : 'llama.cpp'} com '--n-gpu-layers 99' para descarregar 100% das operações.`
    );
    if (params.contextLength < 16384 && usableVramGB - totalModelRequiredGB > 4) {
      recommendations.push(
        `Há ${Number((usableVramGB - totalModelRequiredGB).toFixed(1))} GB livres de VRAM: você pode estender a janela de contexto para ${Math.min(model.contextMaxTokens, params.contextLength * 2).toLocaleString()} tokens sem risco de estouro.`
      );
    }
  } else if (status === 'hybrid_offload') {
    recommendations.push(
      `Defina exatamente '--n-gpu-layers ${gpuLayers}' no seu executável para não estourar a VRAM e evitar crash por CUDA Out of Memory.`
    );
    if (params.kvCacheQuant === 'FP16') {
      recommendations.push(
        `Ative a quantização do KV Cache para Q8_0 ou Q4_0 ('--cache-type-k q4_0 --cache-type-v q4_0'). Isso economiza ~${Number((kvCacheMemoryGB * 0.65).toFixed(2))} GB de VRAM e permite subir mais 2 a 4 layers para a GPU.`
      );
    }
    recommendations.push(
      `Considere testar uma quantização mais leve como Q4_K_M ou Q3_K_M para trazer todos os layers para a VRAM e multiplicar a velocidade por 3x.`
    );
  } else if (status === 'cpu_only') {
    recommendations.push(
      'Configure o número de threads do llama.cpp para igualar os núcleos físicos da sua CPU (ex: -t 4 no Raspberry Pi ou -t 8 em Intel/AMD).'
    );
    recommendations.push(
      'Instale bibliotecas aceleradas como OpenBLAS ou mkl para ganho de ~20% no prompt processing.'
    );
  } else {
    // OOM recommendations
    const diff = Number((totalModelRequiredGB - totalUsableMemoryGB).toFixed(1));
    recommendations.push(
      `Faltam ${diff} GB de memória física. Escolha uma quantização mais leve ou selecione um modelo com menor contagem de parâmetros (ex: 3B ou 7B).`
    );
    if (params.contextLength > 4096) {
      recommendations.push(
        `Reduzir a janela de contexto de ${params.contextLength} para 4096 tokens liberará ${Number((kvCacheMemoryGB * 0.7).toFixed(1))} GB de memória.`
      );
    }
  }

  return {
    weightsMemoryGB,
    kvCacheMemoryGB,
    activationsMemoryGB,
    runtimeOverheadGB,
    totalModelRequiredGB,
    usableVramGB,
    usableSystemRamGB,
    totalUsableMemoryGB,
    status,
    statusTitle,
    statusBadge,
    statusDescription,
    totalLayers: model.layers,
    gpuLayers,
    cpuLayers,
    percentageInGpu,
    theoreticalMaxTokensPerSec,
    estimatedRealTokensPerSec,
    prefillSpeedTokensPerSec,
    memoryPressurePct,
    memoryDeficitGB,
    recommendations,
    bottleneck,
  };
}
