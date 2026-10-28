# Análise de Código Detalhada — ai-edge-estimator

> Gerado pelo Arqueólogo (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Mapeamento dos Módulos e Arquitetura

O sistema é dividido em 5 módulos funcionais altamente acoplados por domínio matemático e fracamente acoplados por infraestrutura externa:

```
[UI Components (React/Tailwind)]
   │
   ├─► [Presets Catalog] ───► Modelos, Hardware & Quants
   │
   ├─► [Calculator Engine] ──► Fórmulas de VRAM, KV-Cache, Throughput & Offload
   │
   └─► [Python Generator] ──► Transpilação e Síntese de Script CLI Standalone
```

---

## 2. Análise Profunda por Módulo

### 2.1. Módulo `calculator` (`src/lib/calculator.ts`)

#### Propósito:
Determina a viabilidade física de carregar e executar inferência com um Large Language Model (LLM) em configurações de hardware locais (desktops, laptops Apple Silicon, placas dedicadas Nvidia e mini-PCs/SBCs).

#### Algoritmos e Fórmulas Centrais:

1. **Pegada de Memória dos Pesos (Weights Memory):**
   $$\text{Weights (GB)} = \frac{\text{Parameters (B)} \times 10^9 \times \text{bytesPerParam}}{1024^3}$$
   - *Exemplo Q4_K_M (7B):* $7 \times 10^9 \times 0.56 / 1024^3 \approx 3.65\text{ GB}$.

2. **Memória de Cache Chave-Valor (KV-Cache Footprint):**
   Para modelos com suporte a Grouped-Query Attention (GQA):
   $$\text{KV (GB)} = \frac{2 \times \text{layers} \times \text{kvHeads} \times \text{headDim} \times \text{bytesPerElement} \times \text{contextLength} \times \text{batchSize}}{1024^3}$$
   - *Quantização do KV-Cache:*
     - FP16: 2.0 bytes/elemento
     - Q8_0: 1.0 byte/elemento
     - Q4_0: 0.5 byte/elemento

3. **Memória de Ativações e Overhead de Runtime:**
   $$\text{Activations (GB)} = \max\left(0.15, \frac{\text{hiddenSize} \times \text{contextLength} \times \text{batchSize} \times 2 \times 4}{1024^3}\right)$$
   $$\text{Runtime Overhead} = \text{baseOverhead} + 0.4 \times \text{activationsMemory}$$
   - `baseOverhead`: Nvidia Discreta (0.65 GB), Apple Silicon (0.40 GB), CPU Unificada (0.30 GB).

4. **Alocação de Memória Utilizável do Hardware:**
   - **Apple Silicon (Unified):** Metal aloca até $90\%$ do pool livre ($\text{Total RAM} - \text{OS Reserve}$).
   - **Nvidia Discreta:** VRAM útil $= \text{VRAM} - \text{Display Driver Reserve}$; RAM do sistema com reserva de $3.5\text{ GB}$ para SO.

5. **Divisão de Layers (GPU vs CPU Offload):**
   Se o modelo não cabe integralmente na VRAM, o algoritmo calcula quantos layers cabem no espaço restante da GPU após alocar o contexto e overhead:
   $$\text{availableVramForWeights} = \max(0, \text{usableVram} - \text{contextAndOverhead})$$
   $$\text{gpuLayers} = \min\left(\text{layers}-1, \left\lfloor\frac{\text{availableVramForWeights}}{\text{weightPerLayer}}\right\rfloor\right)$$
   $$\text{cpuLayers} = \text{layers} - \text{gpuLayers}$$

6. **Modelagem de Vazão (Tokens/s):**
   A geração autorregressiva é delimitada pela largura de banda da memória (Memory Bandwidth Bound):
   $$\text{Max Throughput (tokens/s)} = \frac{\text{Bandwidth (GB/s)}}{\text{Weights (GB)}}$$
   - *Eficiência real:*
     - Full GPU: ~80% (Nvidia) ou ~72% (Apple Metal)
     - Hybrid Offload: throttled pelo barramento PCIe (banda efetiva limitada a $\min(\text{BW} \times 0.35, 45\text{ GB/s})$)
     - CPU Only: throttled pela controladora de RAM DDR4/DDR5 (~30-65 GB/s, 55% de eficiência).

---

### 2.2. Módulo `presets` (`src/lib/presets.ts`)

#### Modelos Catalogados:
- **DeepSeek R1 Distill:** Qwen 1.5B, 7B, 14B, 32B.
- **Llama 3.1 / 3.2 / 3.3:** 1B, 3B, 8B, 70B.
- **Qwen 2.5:** 3B, 7B, 14B, 32B, 72B.
- **Mistral:** NeMo 12B, Small 24B.
- **Gemma 2:** 2B, 9B, 27B.
- **Phi-4:** 14B.

#### Hardwares Catalogados:
- **Apple Silicon:** M1/M2/M3/M4 padrão, Pro, Max (até 128GB) e Ultra (192GB, 800 GB/s).
- **Nvidia GeForce RTX:** RTX 3060 (12GB), 4060 (8GB/16GB), 4070/Ti (12GB/16GB), 4080 (16GB), 4090 (24GB, 1008 GB/s), 5090 (32GB, 1792 GB/s).
- **Edge Embedded & SBC:** Nvidia Jetson Orin Nano (8GB), Jetson AGX Orin (64GB), Raspberry Pi 5 (8GB RAM, 17 GB/s), AMD Strix Point APU (LPDDR5X-7500).

#### Perfis de Quantização:
- FP16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (recomendado para Edge), Q3_K_M, Q2_K, AWQ_4BIT, EXL2_4BPW.

---

### 2.3. Módulo `python-generator` (`src/lib/pythonGenerator.ts`)

- Constrói via template strings em TypeScript um script executável autônomo em Python 3.
- Inclui auto-detecção em tempo de execução via chamadas `subprocess`:
  - `nvidia-smi` para listar contagem de GPUs, nomes e VRAM livre em MB.
  - `sysctl -n hw.memsize` no macOS para extrair RAM unificada total.
  - `/proc/meminfo` no Linux para extrair `MemTotal`.
- Contém réplica fiel em Python da função matemática de cálculo de viabilidade e gerador de comandos para `llama-server`.

---

### 2.4. Módulo `ui-components` (`src/components/`)

- **`Header.tsx`:** Navegação entre as 4 abas (`calculator`, `matrix`, `python`, `engine`).
- **`ModelSelector.tsx`:** Seleção do modelo, ajuste de tamanho do contexto via slider (512 a 131.072 tokens), batch size e quantização do KV Cache (FP16, Q8_0, Q4_0).
- **`HardwareSelector.tsx`:** Abas por categorias de fabricante e cards de dispositivos com métricas de VRAM, RAM, banda e arquitetura.
- **`ResultsDashboard.tsx`:** Feedback visual de viabilidade:
  - Veredito com badges coloridos (Verde = Full GPU, Âmbar = Hybrid Offload, Azul = CPU Only, Vermelho = OOM).
  - Barra de progresso de ocupação de memória e memória restante/déficit.
  - Ocupação por layer (GPU vs CPU).
  - Velocidade estimada em tokens/s e tempo até o primeiro token (TTFT).
  - Caixa de recomendações acionáveis.
- **`MatrixComparator.tsx`:** Renderização de matriz cartesiana comparativa:
  - Fixa o modelo e compara 8 hardwares diferentes simultaneamente; ou
  - Fixa o hardware e compara 8 modelos diferentes.
- **`EngineRecipe.tsx`:** Gera os comandos prontos para cópia com flags calibradas para `llama.cpp` (`llama-server`, `llama-cli`), `Ollama`, `vLLM` e `MLC-LLM`.
