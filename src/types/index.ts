export type QuantizationType =
  | 'FP16'
  | 'BF16'
  | 'Q8_0'
  | 'Q6_K'
  | 'Q5_K_M'
  | 'Q4_K_M'
  | 'Q4_0'
  | 'Q3_K_M'
  | 'Q2_K'
  | 'AWQ_4BIT'
  | 'EXL2_4BPW';

export interface QuantProfile {
  id: QuantizationType;
  name: string;
  bitsPerWeight: number;
  bytesPerParam: number; // includes quantization overhead/scales
  qualityRetention: string; // e.g. "99.8% Perplexity"
  description: string;
  recommended: boolean;
}

export type HardwareArchitecture = 'apple_silicon' | 'nvidia_discrete' | 'nvidia_jetson' | 'cpu_unified' | 'amd_discrete';

export interface HardwareProfile {
  id: string;
  name: string;
  category: 'apple' | 'nvidia_rtx' | 'jetson' | 'sbc_pc' | 'custom';
  architecture: HardwareArchitecture;
  totalRamGB: number;
  vramGB: number; // If unified, represents max allocatable or total shared pool
  isUnifiedMemory: boolean;
  systemOsReserveGB: number; // Memory reserved by macOS, Windows display driver, Linux desktop
  memoryBandwidthGBs: number; // Memory bandwidth in GB/s
  busType: string; // e.g. "Unified Bus", "PCIe 4.0 x16", "LPDDR5X-7500"
  tflopsFp16?: number;
  description: string;
}

export interface ModelProfile {
  id: string;
  name: string;
  family: 'Qwen 2.5' | 'Llama 3.x' | 'DeepSeek R1' | 'Mistral' | 'Gemma 2' | 'Phi' | 'Custom';
  parametersB: number; // Parameters in Billions (e.g. 7.0, 8.0, 70.0)
  contextMaxTokens: number;
  defaultContextTokens: number;
  layers: number;
  hiddenSize: number;
  queryHeads: number;
  kvHeads: number; // For GQA (Grouped-Query Attention)
  headDim: number;
  vocabSize: number;
  description: string;
}

export type KvCacheQuant = 'FP16' | 'Q8_0' | 'Q4_0';

export interface InferenceParams {
  contextLength: number;
  batchSize: number;
  kvCacheQuant: KvCacheQuant;
  runner: 'ollama' | 'llamacpp' | 'vllm' | 'exllamav2';
}

export type FeasibilityStatus = 'full_gpu' | 'hybrid_offload' | 'cpu_only' | 'oom';

export interface CalculationResult {
  // Model weights
  weightsMemoryGB: number;

  // Context & Cache
  kvCacheMemoryGB: number;
  activationsMemoryGB: number;
  runtimeOverheadGB: number;
  totalModelRequiredGB: number;

  // Hardware usability
  usableVramGB: number;
  usableSystemRamGB: number;
  totalUsableMemoryGB: number;

  // Feasibility status
  status: FeasibilityStatus;
  statusTitle: string;
  statusBadge: string;
  statusDescription: string;

  // Layer offload breakdown
  totalLayers: number;
  gpuLayers: number;
  cpuLayers: number;
  percentageInGpu: number;

  // Performance estimations
  theoreticalMaxTokensPerSec: number;
  estimatedRealTokensPerSec: number;
  prefillSpeedTokensPerSec: number; // Time To First Token approximation
  memoryPressurePct: number; // percentage of target pool used

  // Memory deficit if OOM
  memoryDeficitGB: number;

  // Architecture insight & recommendations
  recommendations: string[];
  bottleneck: 'memory_capacity' | 'memory_bandwidth' | 'pcie_bus' | 'compute';
}
