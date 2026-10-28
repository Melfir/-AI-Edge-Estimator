# Domínio e Regras de Negócio — ai-edge-estimator

> Gerado pelo Detetive (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Glossário de Domínio

- **LLM (Large Language Model):** Modelo fundacional baseado na arquitetura Transformer composto por camadas densas de atenção e feed-forward com bilhões de parâmetros ponderados.
- **Edge Computing / On-Device AI:** Execução local de inferência em dispositivos finais (PCs domésticos, workstations, notebooks e placas embarcadas) sem dependência de APIs em nuvem.
- **Quantização (Quantization):** Técnica de compressão numérica dos pesos do modelo, reduzindo a precisão de 16-bit de ponto flutuante (FP16/BF16) para 8, 6, 5, 4, 3 ou 2 bits inteiros (K-quants GGUF, AWQ, EXL2).
- **KV-Cache (Key-Value Cache):** Estrutura de tensores dinâmicos acumulada em memória durante a atenção autorregressiva, guardando representações passadas para evitar recálculo de tokens anteriores.
- **GQA (Grouped-Query Attention):** Otimização arquitetural presente em modelos modernos (Llama 3, Qwen 2.5, DeepSeek) onde múltiplos query heads compartilham os mesmos key/value heads, reduzindo drasticamente o consumo de VRAM do KV-Cache.
- **Unified Memory (Memória Unificada):** Arquitetura de hardware onde CPU, GPU e Neural Engine compartilham um barramento e um único pool de memória física (ex: Apple Silicon SoC M-series e Nvidia Jetson).
- **VRAM Discreta (Dedicated VRAM):** Memória ultrarrápida (GDDR6X/HBM) exclusiva da placa de vídeo dedicada (ex: Nvidia GeForce RTX).
- **Offload Híbrido (Layer Offload):** Técnica suportada por runtimes como `llama.cpp` que particiona as camadas do modelo, enviando $N$ camadas para a GPU e retendo o restante na CPU/RAM via barramento PCIe.
- **Memory Bandwidth Bound:** Regime operacional onde o gargalo da inferência não é a capacidade de cálculo (FLOPs), mas sim a velocidade com que a memória transfere os pesos para os núcleos de computação ($GB/s$).
- **TTFT (Time To First Token) / Prefill:** Fase de processamento onde o prompt inteiro é ingerido em paralelo (regime Compute-bound).
- **Throughput / Generation Speed:** Fase autorregressiva onde o modelo gera um token de cada vez (regime Memory-bandwidth-bound).

---

## 2. Regras de Negócio e Engenharia

### RN-01: Cálculo Determinístico de Pesos
- **Descrição:** O tamanho bruto dos pesos em Gigabytes é o produto do número de parâmetros ($P \times 10^9$) pelo número de bytes médios por parâmetro da quantização selecionada, dividido por $1024^3$.
- **Evidência:** `src/lib/calculator.ts:11`
- **Confiança:** 🟢 CONFIRMADO

### RN-02: Dimensionamento de KV-Cache com Proporção GQA
- **Descrição:** O cálculo do KV-Cache deve obrigatoriamente utilizar `kvHeads` (e não `queryHeads`) multiplicado por $2 \times \text{layers} \times \text{headDim} \times \text{bytesPerElement} \times \text{contextLength} \times \text{batchSize}$.
- **Evidência:** `src/lib/calculator.ts:23`
- **Confiança:** 🟢 CONFIRMADO

### RN-03: Desconto de Reserva Operacional do Sistema (OS Reserve)
- **Descrição:** A memória utilizável nunca é igual à memória física instalada. Para VRAM discreta, desconta-se a VRAM ocupada pelo compositor gráfico do Windows/Linux (`systemOsReserveGB`). Para Apple Silicon, desconta-se a reserva do macOS e aplica-se um teto de alocação de $90\%$ do pool livre. Para PCs x86, desconta-se $3.5\text{ GB}$ da RAM do sistema para o SO.
- **Evidência:** `src/lib/calculator.ts:56-68`
- **Confiança:** 🟢 CONFIRMADO

### RN-04: Prioridade de Alocação de VRAM no Offload Híbrido
- **Descrição:** Quando o modelo não cabe integralmente na VRAM, o contexto e overheads de runtime devem ser alocados prioritariamente no espaço disponível da GPU antes de calcular quantas camadas de pesos podem ser descarregadas. As camadas restantes são empurradas para a RAM da CPU.
- **Evidência:** `src/lib/calculator.ts:117-119`
- **Confiança:** 🟢 CONFIRMADO

### RN-05: Penalidade de Barramento no Regime Híbrido
- **Descrição:** A taxa de geração em regime híbrido sofre uma penalidade severa devido à latência do barramento PCIe e à baixa largura de banda da RAM DDR da CPU, limitando a banda efetiva calculada a $\min(\text{Bandwidth} \times 0.35, 45\text{ GB/s})$.
- **Evidência:** `src/lib/calculator.ts:152`
- **Confiança:** 🟢 CONFIRMADO

### RN-06: Sugestão Proativa de Quantização do KV-Cache
- **Descrição:** Se o modelo estiver em regime híbrido (`hybrid_offload`) com KV-Cache em `FP16`, o sistema deve emitir recomendação direta de conversão para `Q8_0` ou `Q4_0` com cálculo exato de GBs economizados e estimativa de layers adicionais que poderão subir para a GPU.
- **Evidência:** `src/lib/calculator.ts:197-201`
- **Confiança:** 🟢 CONFIRMADO

### RN-07: Detecção de Gargalo Predominante
- **Descrição:** O sistema classifica o gargalo da máquina em um de quatro estados:
  - `memory_capacity`: Quando o modelo entra em OOM.
  - `pcie_bus`: Quando a inferência requer trânsito de tensores entre GPU e CPU via PCIe.
  - `compute`: Quando a janela de contexto excede 32.768 tokens e o KV-cache supera 50% do peso do modelo.
  - `memory_bandwidth`: Quando a geração autorregressiva é limitada pela velocidade de barramento de memória da GPU.
- **Evidência:** `src/lib/calculator.ts:172-179`
- **Confiança:** 🟢 CONFIRMADO

---

## 3. Lacunas e Inferências 🔴 / 🟡

- 🟡 **INFERIDO:** Os valores de TFLOPs FP16 de placas antigas ou SBCs são aproximações de especificações de fabricantes e podem variar com térmicas/throttling.
- 🟡 **INFERIDO:** O multiplicador de prefill speed ($\text{TFLOPs} \times 45 / (P \times 0.4)$) é uma heurística aproximada empírica para estimativa de TTFT.
- 🔴 **LACUNA:** O sistema não considera concorrência multi-usuário avançada (ex: PagedAttention dinâmica do vLLM sob carga contínua de múltiplos clientes simultâneos com prefix caching compartilhado).
