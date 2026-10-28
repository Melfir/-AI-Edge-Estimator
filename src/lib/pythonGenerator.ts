import { HardwareProfile, InferenceParams, ModelProfile, QuantProfile } from '../types';

export function generatePythonScript(
  currentModel?: ModelProfile,
  currentHardware?: HardwareProfile,
  currentQuant?: QuantProfile,
  currentParams?: InferenceParams
): string {
  const defaultModelId = currentModel?.id || 'qwen_2_5_7b';
  const defaultQuantId = currentQuant?.id.toLowerCase() || 'q4_k_m';
  const defaultContext = currentParams?.contextLength || 8192;

  return `#!/usr/bin/env python3
"""
AI Edge Estimator - Calculadora de Viabilidade de LLM Local
===========================================================
Resolve o problema de arquitetura de Edge Computing:
Determina com precisão matemática se um LLM cabe na sua máquina local,
calcula VRAM, KV Cache, divisão de layers GPU/CPU e velocidade em tokens/segundo.

Uso:
    python ai_edge_estimator.py --auto-detect
    python ai_edge_estimator.py --model ${defaultModelId} --quant ${defaultQuantId} --context ${defaultContext}
    python ai_edge_estimator.py --help
"""

import argparse
import json
import math
import os
import platform
import subprocess
import sys
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Tuple

# Cores ANSI para saída no terminal
class Colors:
    HEADER = '\\033[95m'
    BLUE = '\\033[94m'
    CYAN = '\\033[96m'
    GREEN = '\\033[92m'
    YELLOW = '\\033[93m'
    RED = '\\033[91m'
    BOLD = '\\033[1m'
    UNDERLINE = '\\033[4m'
    DIM = '\\033[2m'
    RESET = '\\033[0m'

@dataclass
class QuantizationSpec:
    name: str
    bits_per_weight: float
    bytes_per_param: float
    quality_retention: str
    description: str

QUANT_SPECS: Dict[str, QuantizationSpec] = {
    'fp16': QuantizationSpec('FP16 (Baseline)', 16.0, 2.00, '100.0%', 'Precisão total original sem compressão'),
    'bf16': QuantizationSpec('BF16 (Baseline)', 16.0, 2.00, '100.0%', 'Brain Floating Point de 16-bit'),
    'q8_0': QuantizationSpec('Q8_0 (8-bit)', 8.5, 1.06, '99.9%', 'Quase idêntico ao FP16 com metade do peso'),
    'q6_k': QuantizationSpec('Q6_K (6-bit)', 6.56, 0.82, '99.5%', 'Excelente fidelidade em raciocínio complexo'),
    'q5_k_m': QuantizationSpec('Q5_K_M (5-bit)', 5.5, 0.69, '98.8%', 'Ideal para coding e lógica detalhada'),
    'q4_k_m': QuantizationSpec('Q4_K_M (4-bit)', 4.5, 0.56, '97.2%', 'Padrão da indústria para Edge/GGUF'),
    'q4_0': QuantizationSpec('Q4_0 (4-bit Legacy)', 4.5, 0.56, '96.5%', 'Quantização simétrica rápida'),
    'q3_k_m': QuantizationSpec('Q3_K_M (3-bit)', 3.4, 0.43, '92.5%', 'Para hardware com VRAM muito apertada'),
    'q2_k': QuantizationSpec('Q2_K (2-bit)', 2.6, 0.33, '81.0%', 'Quantização extrema com degradação perceptual'),
    'awq_4bit': QuantizationSpec('AWQ 4-bit', 4.0, 0.50, '97.5%', 'Otimizado para GPUs NVIDIA e vLLM'),
}

@dataclass
class ModelSpec:
    name: str
    family: str
    parameters_b: float
    context_max: int
    layers: int
    hidden_size: int
    query_heads: int
    kv_heads: int
    head_dim: int

MODEL_DATABASE: Dict[str, ModelSpec] = {
    'deepseek_r1_distill_qwen_7b': ModelSpec('DeepSeek-R1-Distill-Qwen-7B', 'DeepSeek R1', 7.61, 131072, 28, 3584, 28, 4, 128),
    'deepseek_r1_distill_qwen_14b': ModelSpec('DeepSeek-R1-Distill-Qwen-14B', 'DeepSeek R1', 14.77, 131072, 48, 5120, 40, 8, 128),
    'deepseek_r1_distill_qwen_32b': ModelSpec('DeepSeek-R1-Distill-Qwen-32B', 'DeepSeek R1', 32.76, 131072, 64, 5120, 40, 8, 128),
    'deepseek_r1_distill_llama_70b': ModelSpec('DeepSeek-R1-Distill-Llama-70B', 'DeepSeek R1', 70.6, 131072, 80, 8192, 64, 8, 128),
    'qwen_2_5_7b': ModelSpec('Qwen 2.5 7B Instruct', 'Qwen 2.5', 7.61, 131072, 28, 3584, 28, 4, 128),
    'qwen_2_5_14b': ModelSpec('Qwen 2.5 14B Instruct', 'Qwen 2.5', 14.77, 131072, 48, 5120, 40, 8, 128),
    'qwen_2_5_32b': ModelSpec('Qwen 2.5 32B Instruct', 'Qwen 2.5', 32.76, 131072, 64, 5120, 40, 8, 128),
    'qwen_2_5_3b': ModelSpec('Qwen 2.5 3B Instruct', 'Qwen 2.5', 3.09, 32768, 36, 2048, 16, 2, 128),
    'llama_3_1_8b': ModelSpec('Meta Llama 3.1 8B Instruct', 'Llama 3.1', 8.03, 131072, 32, 4096, 32, 8, 128),
    'llama_3_1_70b': ModelSpec('Meta Llama 3.1 70B Instruct', 'Llama 3.1', 70.6, 131072, 80, 8192, 64, 8, 128),
    'llama_3_2_3b': ModelSpec('Meta Llama 3.2 3B Instruct', 'Llama 3.2', 3.21, 131072, 28, 3072, 24, 8, 128),
    'llama_3_2_1b': ModelSpec('Meta Llama 3.2 1B Instruct', 'Llama 3.2', 1.23, 131072, 16, 2048, 32, 8, 64),
    'mistral_nemo_12b': ModelSpec('Mistral NeMo 12B Instruct', 'Mistral', 12.24, 128000, 40, 5120, 32, 8, 128),
    'gemma_2_9b': ModelSpec('Google Gemma 2 9B Instruct', 'Gemma 2', 9.24, 8192, 42, 3584, 16, 8, 256),
    'gemma_2_27b': ModelSpec('Google Gemma 2 27B Instruct', 'Gemma 2', 27.23, 8192, 46, 4608, 32, 16, 128),
    'phi_3_5_mini': ModelSpec('Microsoft Phi-3.5 Mini (3.8B)', 'Phi', 3.82, 131072, 32, 3072, 32, 32, 96),
}

@dataclass
class HardwareSpec:
    name: str
    total_ram_gb: float
    vram_gb: float
    is_unified: bool
    bandwidth_gb_s: float
    os_reserve_gb: float

def detect_host_hardware() -> HardwareSpec:
    """Detecta automaticamente especificações de RAM, VRAM e arquitetura do computador local."""
    system_name = platform.system()
    machine_arch = platform.machine()
    is_apple_silicon = False
    total_ram_gb = 16.0
    vram_gb = 0.0
    is_unified = False
    bandwidth_gb_s = 60.0
    detected_gpu_name = "Nenhuma GPU dedicada detectada"

    # 1. Detectar RAM total
    try:
        import psutil
        total_ram_gb = round(psutil.virtual_memory().total / (1024**3), 1)
    except ImportError:
        if system_name == "Darwin":
            try:
                out = subprocess.check_output(["sysctl", "-n", "hw.memsize"]).decode().strip()
                total_ram_gb = round(int(out) / (1024**3), 1)
            except Exception:
                pass
        elif system_name == "Linux":
            try:
                with open("/proc/meminfo", "r") as f:
                    for line in f:
                        if "MemTotal" in line:
                            total_ram_gb = round(int(line.split()[1]) / (1024**2), 1)
                            break
            except Exception:
                pass

    # 2. Verificar Apple Silicon
    if system_name == "Darwin" and machine_arch in ("arm64", "aarch64"):
        is_apple_silicon = True
        is_unified = True
        try:
            chip = subprocess.check_output(["sysctl", "-n", "machdep.cpu.brand_string"]).decode().strip()
        except Exception:
            chip = "Apple Silicon Mac"

        # Estimativa de largura de banda aproximada da série Apple M
        chip_lower = chip.lower()
        if "ultra" in chip_lower:
            bandwidth_gb_s = 800.0
        elif "max" in chip_lower:
            bandwidth_gb_s = 350.0
        elif "pro" in chip_lower:
            bandwidth_gb_s = 200.0
        else:
            bandwidth_gb_s = 120.0

        os_reserve = 3.5 if total_ram_gb <= 16 else (6.0 if total_ram_gb <= 48 else 8.0)
        usable_vram = round(total_ram_gb * 0.85, 1)

        return HardwareSpec(
            name=f"{chip} ({total_ram_gb}GB Unified Memory)",
            total_ram_gb=total_ram_gb,
            vram_gb=usable_vram,
            is_unified=True,
            bandwidth_gb_s=bandwidth_gb_s,
            os_reserve_gb=os_reserve
        )

    # 3. Detectar GPU NVIDIA via nvidia-smi
    try:
        smi_out = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader,nounits"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        if smi_out:
            first_line = smi_out.splitlines()[0]
            gpu_name, mem_str = first_line.split(",")
            detected_gpu_name = gpu_name.strip()
            vram_gb = round(float(mem_str.strip()) / 1024.0, 1)
            # Bandwidth aproximado com base na VRAM
            if vram_gb >= 24:
                bandwidth_gb_s = 1008.0
            elif vram_gb >= 16:
                bandwidth_gb_s = 500.0
            elif vram_gb >= 12:
                bandwidth_gb_s = 360.0
            else:
                bandwidth_gb_s = 250.0

            return HardwareSpec(
                name=f"{detected_gpu_name} ({vram_gb}GB VRAM + {total_ram_gb}GB RAM)",
                total_ram_gb=total_ram_gb,
                vram_gb=vram_gb,
                is_unified=False,
                bandwidth_gb_s=bandwidth_gb_s,
                os_reserve_gb=1.5
            )
    except Exception:
        pass

    # 4. Fallback: Host CPU
    return HardwareSpec(
        name=f"CPU Host {platform.processor() or machine_arch} ({total_ram_gb}GB RAM)",
        total_ram_gb=total_ram_gb,
        vram_gb=0.0,
        is_unified=False,
        bandwidth_gb_s=55.0,
        os_reserve_gb=3.0
    )

def estimate_edge_feasibility(
    model: ModelSpec,
    quant: QuantizationSpec,
    hardware: HardwareSpec,
    context_length: int = 8192,
    batch_size: int = 1,
    kv_quant: str = 'fp16'
) -> Dict:
    """Executa o cálculo preciso de física de inferência e viabilidade."""
    # 1. Memória dos Pesos
    weights_bytes = model.parameters_b * 1e9 * quant.bytes_per_param
    weights_gb = round(weights_bytes / (1024**3), 2)

    # 2. KV Cache
    kv_bytes_per_elem = 2.0 if kv_quant == 'fp16' else (1.0 if kv_quant == 'q8_0' else 0.5)
    kv_bytes_per_token = 2 * model.layers * model.kv_heads * model.head_dim * kv_bytes_per_elem
    total_kv_bytes = kv_bytes_per_token * context_length * batch_size
    kv_cache_gb = round(total_kv_bytes / (1024**3), 2)

    # 3. Activations e Buffers de Execução
    activation_bytes = model.hidden_size * context_length * batch_size * 8
    activations_gb = round(max(0.15, activation_bytes / (1024**3)), 2)
    runtime_buffers_gb = round(0.5 + activations_gb * 0.35, 2)

    total_required_gb = round(weights_gb + kv_cache_gb + activations_gb + runtime_buffers_gb, 2)

    # 4. Usabilidade de Memória
    if hardware.is_unified:
        usable_vram_gb = round(max(0.0, hardware.total_ram_gb - hardware.os_reserve_gb), 1)
        total_usable_gb = usable_vram_gb
    else:
        usable_vram_gb = round(max(0.0, hardware.vram_gb - hardware.os_reserve_gb), 1)
        usable_ram_gb = round(max(0.0, hardware.total_ram_gb - 3.5), 1)
        total_usable_gb = round(usable_vram_gb + usable_ram_gb, 1)

    # 5. Status e Divisão de Camadas (Layers)
    status = ""
    status_color = Colors.GREEN
    verdict_text = ""
    gpu_layers = model.layers
    cpu_layers = 0
    deficit_gb = 0.0

    weight_per_layer = weights_gb / max(1, model.layers)
    overhead = kv_cache_gb + activations_gb + runtime_buffers_gb

    if hardware.vram_gb == 0 and not hardware.is_unified:
        if total_required_gb <= total_usable_gb:
            status = "CPU_ONLY"
            status_color = Colors.YELLOW
            verdict_text = "Viável em CPU (Sem Aceleração GPU)"
            gpu_layers = 0
            cpu_layers = model.layers
        else:
            status = "OOM"
            status_color = Colors.RED
            deficit_gb = round(total_required_gb - total_usable_gb, 2)
            verdict_text = f"INVIÁVEL - OUT OF MEMORY (Faltam {deficit_gb} GB)"
            gpu_layers = 0
            cpu_layers = 0
    elif total_required_gb <= usable_vram_gb:
        status = "FULL_GPU"
        status_color = Colors.GREEN
        verdict_text = "TOTALMENTE VIÁVEL EM VRAM (Full Offload)"
        gpu_layers = model.layers
        cpu_layers = 0
    elif total_required_gb <= total_usable_gb:
        status = "HYBRID_OFFLOAD"
        status_color = Colors.YELLOW
        verdict_text = "VIABILIDADE PARCIAL (Offload Híbrido GPU + CPU)"
        avail_for_weights = max(0.0, usable_vram_gb - overhead)
        gpu_layers = min(model.layers - 1, max(0, int(avail_for_weights / weight_per_layer)))
        cpu_layers = model.layers - gpu_layers
    else:
        status = "OOM"
        status_color = Colors.RED
        deficit_gb = round(total_required_gb - total_usable_gb, 2)
        verdict_text = f"INVIÁVEL - OUT OF MEMORY (Faltam {deficit_gb} GB)"
        gpu_layers = 0
        cpu_layers = 0

    # 6. Estimativa de Throughput (Tokens/s)
    # Bandwidth / Weights
    theo_tps = round(hardware.bandwidth_gb_s / max(0.1, weights_gb), 1)
    if status == "FULL_GPU":
        real_tps = round(theo_tps * (0.72 if hardware.is_unified else 0.80), 1)
    elif status == "HYBRID_OFFLOAD":
        real_tps = round(min(theo_tps, 40.0) * 0.35, 1)
    elif status == "CPU_ONLY":
        real_tps = round(max(0.8, (min(hardware.bandwidth_gb_s, 60.0) / weights_gb) * 0.55), 1)
    else:
        real_tps = 0.0

    pct_gpu = 0 if status == "OOM" else int((gpu_layers / max(1, model.layers)) * 100)

    return {
        "status": status,
        "status_color": status_color,
        "verdict_text": verdict_text,
        "weights_gb": weights_gb,
        "kv_cache_gb": kv_cache_gb,
        "activations_gb": activations_gb,
        "runtime_buffers_gb": runtime_buffers_gb,
        "total_required_gb": total_required_gb,
        "usable_vram_gb": usable_vram_gb,
        "total_usable_gb": total_usable_gb,
        "total_layers": model.layers,
        "gpu_layers": gpu_layers,
        "cpu_layers": cpu_layers,
        "pct_gpu": pct_gpu,
        "theo_tps": theo_tps,
        "real_tps": real_tps,
        "deficit_gb": deficit_gb,
    }

def print_banner():
    print(f"{Colors.CYAN}{Colors.BOLD}")
    print("┌────────────────────────────────────────────────────────────────────────┐")
    print("│         AI EDGE ESTIMATOR // VIABILIDADE DE LLM LOCAL (CLI)           │")
    print("│         Engenharia de Memória, KV Cache e Throughput de Hardware       │")
    print("└────────────────────────────────────────────────────────────────────────┘")
    print(f"{Colors.RESET}")

def print_report(model: ModelSpec, quant: QuantizationSpec, hw: HardwareSpec, ctx: int, res: Dict):
    print_banner()

    print(f"{Colors.BOLD}CONFIGURAÇÃO ANALISADA:{Colors.RESET}")
    print(f"  • Modelo:      {Colors.BOLD}{model.name}{Colors.RESET} ({model.parameters_b}B parâmetros, {model.layers} layers)")
    print(f"  • Quantização: {Colors.CYAN}{quant.name}{Colors.RESET} [{quant.quality_retention} fidelidade]")
    print(f"  • Janela Ctx:  {Colors.BOLD}{ctx:,} tokens{Colors.RESET}")
    print(f"  • Hardware:    {Colors.BOLD}{hw.name}{Colors.RESET}")
    print(f"  • Banda Mem:   {hw.bandwidth_gb_s} GB/s ({'Unified Memory' if hw.is_unified else 'Discrete VRAM'})")
    print()

    print(f"{Colors.BOLD}BREAKDOWN DE CONSUMO DE MEMÓRIA:{Colors.RESET}")
    print(f"  ├─ Pesos do Modelo:       {res['weights_gb']:>6.2f} GB")
    print(f"  ├─ KV Cache ({ctx:>5} ctx): {res['kv_cache_gb']:>6.2f} GB")
    print(f"  ├─ Buffers de Ativação:   {res['activations_gb']:>6.2f} GB")
    print(f"  ├─ Overhead Runtime:      {res['runtime_buffers_gb']:>6.2f} GB")
    print(f"  └─ {Colors.BOLD}TOTAL NECESSÁRIO:      {res['total_required_gb']:>6.2f} GB{Colors.RESET}")
    print()

    color = res['status_color']
    print(f"{Colors.BOLD}VEREDITO DE ARQUITETURA:{Colors.RESET}")
    print(f"  {color}{Colors.BOLD}▶ {res['verdict_text']}{Colors.RESET}")
    print(f"  • Capacidade Utilizável: {res['usable_vram_gb']} GB VRAM / {res['total_usable_gb']} GB Total")
    print(f"  • Divisão de Camadas:    {Colors.BOLD}{res['gpu_layers']}/{res['total_layers']} layers na GPU{Colors.RESET} ({res['pct_gpu']}%), {res['cpu_layers']} na CPU")
    print(f"  • Throughput Estimado:   {Colors.GREEN}{Colors.BOLD}{res['real_tps']} tokens/segundo{Colors.RESET} (Teórico máximo: {res['theo_tps']} T/s)")
    print()

    print(f"{Colors.BOLD}COMANDO RECOMENDADO PARA INFERÊNCIA:{Colors.RESET}")
    if res['status'] == "FULL_GPU":
        print(f"  {Colors.DIM}# llama.cpp (100% offload GPU){Colors.RESET}")
        print(f"  llama-server -m {model.name.lower().replace(' ', '-')}.{quant.name.split()[0].lower()}.gguf -c {ctx} -ngl 99")
        print(f"  {Colors.DIM}# Ollama{Colors.RESET}")
        print(f"  ollama run {model.name.lower().replace(' ', '-')}:{quant.name.split()[0].lower()}")
    elif res['status'] == "HYBRID_OFFLOAD":
        print(f"  {Colors.DIM}# llama.cpp com offload exato de layers calculados{Colors.RESET}")
        print(f"  llama-server -m {model.name.lower().replace(' ', '-')}.gguf -c {ctx} -ngl {res['gpu_layers']} --threads 8")
    elif res['status'] == "CPU_ONLY":
        print(f"  {Colors.DIM}# Execução em CPU com threads otimizadas{Colors.RESET}")
        print(f"  llama-server -m {model.name.lower().replace(' ', '-')}.gguf -c {ctx} -ngl 0 --threads 6")
    else:
        print(f"  {Colors.RED}Hardware insuficiente. Tente quantização 'q4_k_m' ou 'q3_k_m' ou reduza o contexto para 4096 tokens.{Colors.RESET}")
    print()

def main():
    parser = argparse.ArgumentParser(description="AI Edge Estimator - Calculadora de Viabilidade de LLM Local")
    parser.add_argument("--auto-detect", action="store_true", help="Detecta automaticamente hardware do computador host")
    parser.add_argument("--model", "-m", default="${defaultModelId}", help="ID do modelo (ex: qwen_2_5_7b, deepseek_r1_distill_qwen_14b, llama_3_1_8b)")
    parser.add_argument("--quant", "-q", default="${defaultQuantId}", help="Quantização (fp16, q8_0, q6_k, q5_k_m, q4_k_m, q3_k_m, q2_k)")
    parser.add_argument("--context", "-c", type=int, default=${defaultContext}, help="Janela de contexto em tokens (ex: 4096, 8192, 16384, 32768)")
    parser.add_argument("--ram", type=float, default=None, help="RAM total em GB (se customizado)")
    parser.add_argument("--vram", type=float, default=None, help="VRAM dedicada em GB (se customizado)")
    parser.add_argument("--json", action="store_true", help="Exporta resultado em formato JSON")

    args = parser.parse_args()

    # 1. Resolver Hardware
    if args.auto_detect or (args.ram is None and args.vram is None):
        hw = detect_host_hardware()
    else:
        ram = args.ram or 16.0
        vram = args.vram or 0.0
        is_unified = (vram == 0.0)
        hw = HardwareSpec(
            name=f"Custom ({ram}GB RAM, {vram}GB VRAM)",
            total_ram_gb=ram,
            vram_gb=vram,
            is_unified=is_unified,
            bandwidth_gb_s=400.0 if vram > 8 else 60.0,
            os_reserve_gb=2.0
        )

    # 2. Resolver Modelo
    model_id = args.model.lower().replace("-", "_")
    if model_id not in MODEL_DATABASE:
        print(f"{Colors.YELLOW}Modelo '{args.model}' não catalogado. Usando fallback padrão Qwen 2.5 7B.{Colors.RESET}")
        print(f"Modelos suportados: {', '.join(MODEL_DATABASE.keys())}")
        model_id = "qwen_2_5_7b"
    model = MODEL_DATABASE[model_id]

    # 3. Resolver Quantização
    quant_id = args.quant.lower()
    if quant_id not in QUANT_SPECS:
        quant_id = "q4_k_m"
    quant = QUANT_SPECS[quant_id]

    # 4. Calcular
    res = estimate_edge_feasibility(model, quant, hw, context_length=args.context)

    # 5. Saída
    if args.json:
        payload = {
            "model": asdict(model),
            "quantization": asdict(quant),
            "hardware": asdict(hw),
            "context_length": args.context,
            "results": {k: v for k, v in res.items() if k != "status_color"}
        }
        print(json.dumps(payload, indent=2))
    else:
        print_report(model, quant, hw, args.context, res)

if __name__ == "__main__":
    main()
`;
}
