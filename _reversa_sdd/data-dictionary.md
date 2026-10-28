# Dicionário de Dados — ai-edge-estimator

> Gerado pelo Arqueólogo (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Entidades de Domínio

### 1.1. `ModelProfile`
Representa os metadados e parâmetros estruturais de uma arquitetura de LLM.

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|---|---|---|---|---|
| `id` | `string` | Sim | Identificador único do modelo | `"deepseek_r1_distill_qwen_7b"` |
| `name` | `string` | Sim | Nome legível do modelo | `"DeepSeek R1 Distill Qwen 7B"` |
| `family` | `enum` | Sim | Família arquitetural | `'DeepSeek R1'`, `'Llama 3.x'`, etc. |
| `parametersB` | `number` | Sim | Contagem de parâmetros em bilhões | `7.0`, `70.0` |
| `contextMaxTokens` | `number` | Sim | Tamanho máximo da janela de contexto suportada | `131072` |
| `defaultContextTokens`| `number` | Sim | Contexto padrão pré-selecionado | `8192` |
| `layers` | `number` | Sim | Número total de camadas do transformer | `28`, `32`, `80` |
| `hiddenSize` | `number` | Sim | Dimensão oculta dos embeddings | `3584`, `4096` |
| `queryHeads` | `number` | Sim | Número de cabeças de atenção de consulta | `28`, `32` |
| `kvHeads` | `number` | Sim | Número de cabeças de atenção KV (GQA) | `4`, `8`, `32` |
| `headDim` | `number` | Sim | Dimensão de cada cabeça de atenção | `128` |
| `vocabSize` | `number` | Sim | Tamanho do vocabulário do tokenizer | `152064` |
| `description` | `string` | Sim | Descrição textual e recomendações de uso | `"Modelo com forte capacidade..."` |

---

### 1.2. `HardwareProfile`
Especificações físicas e restrições de arquitetura de memória do dispositivo.

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|---|---|---|---|---|
| `id` | `string` | Sim | Identificador único do hardware | `"apple_m3_max_36"` |
| `name` | `string` | Sim | Nome de mercado do dispositivo | `"Apple M3 Max (36 GB)"` |
| `category` | `enum` | Sim | Categoria de hardware | `'apple'`, `'nvidia_rtx'`, `'jetson'`, `'sbc_pc'` |
| `architecture` | `enum` | Sim | Tipo de arquitetura de processamento | `'apple_silicon'`, `'nvidia_discrete'`, `'cpu_unified'` |
| `totalRamGB` | `number` | Sim | Quantidade total de memória RAM física instalada | `36`, `64`, `16` |
| `vramGB` | `number` | Sim | VRAM dedicada (ou total compartilhado em unificado) | `36`, `24`, `0` |
| `isUnifiedMemory`| `boolean`| Sim | Flag indicando memória unificada (CPU/GPU integrados) | `true` (Apple/Jetson), `false` (PC com RTX) |
| `systemOsReserveGB`| `number`| Sim | Memória reservada para o sistema operacional / desktop | `4.0`, `1.5`, `0.8` |
| `memoryBandwidthGBs`| `number`| Sim | Largura de banda de memória teórica máxima em GB/s | `300`, `1008`, `17` |
| `busType` | `string` | Sim | Tipo de barramento | `"Unified Bus"`, `"PCIe 4.0 x16"` |
| `tflopsFp16` | `number` | Não | Poder de computação em TFLOPs FP16 | `15.0`, `82.6` |
| `description` | `string` | Sim | Notas sobre a máquina | `"Workstation com Apple Silicon..."` |

---

### 1.3. `QuantProfile`
Especificação do algoritmo e taxa de compressão dos pesos do modelo.

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|---|---|---|---|---|
| `id` | `QuantizationType`| Sim | Tipo de quantização | `'Q4_K_M'`, `'Q8_0'`, `'AWQ_4BIT'` |
| `name` | `string` | Sim | Nome completo de exibição | `"Q4_K_M (4-bit K-Quants Medium)"` |
| `bitsPerWeight` | `number` | Sim | Bits médios efetivos gastos por parâmetro | `4.5`, `8.5`, `16.0` |
| `bytesPerParam` | `number` | Sim | Bytes médios gastos por parâmetro (inclui scales) | `0.56`, `1.0625`, `2.0` |
| `qualityRetention`| `string` | Sim | Retenção de qualidade ou perplexidade relativa | `"97.2% Perplexidade"` |
| `description` | `string` | Sim | Explicação técnica da quantização | `"Padrão da indústria para Edge..."` |
| `recommended` | `boolean` | Sim | Flag indicando se é o formato ideal recomendado | `true`, `false` |

---

### 1.4. `InferenceParams`
Parâmetros dinâmicos informados pelo usuário na interface ou CLI.

| Campo | Tipo | Obrigatório | Descrição | Padrão |
|---|---|---|---|---|
| `contextLength` | `number` | Sim | Janela de contexto ativa em tokens | `8192` |
| `batchSize` | `number` | Sim | Número de prompts processados concorrentemente | `1` |
| `kvCacheQuant` | `KvCacheQuant` | Sim | Precisão do KV Cache (`'FP16'`, `'Q8_0'`, `'Q4_0'`) | `'FP16'` |
| `runner` | `enum` | Sim | Motor de execução alvo (`'llamacpp'`, `'ollama'`, `'vllm'`) | `'llamacpp'` |

---

### 1.5. `CalculationResult`
Resultado consolidado da análise de viabilidade e performance gerada pelo motor.

| Campo | Tipo | Descrição |
|---|---|---|
| `weightsMemoryGB` | `number` | Memória exigida apenas pelos tensores de pesos do modelo |
| `kvCacheMemoryGB` | `number` | Memória consumida pelos tensores de chave e valor do contexto |
| `activationsMemoryGB`| `number` | Memória temporária de ativações intermediárias |
| `runtimeOverheadGB` | `number` | Overhead de buffers e contexto do driver / biblioteca de inferência |
| `totalModelRequiredGB`| `number` | Soma total da memória requerida |
| `usableVramGB` | `number` | Quantidade de VRAM rápida utilizável |
| `usableSystemRamGB` | `number` | Quantidade de memória RAM do sistema utilizável |
| `totalUsableMemoryGB` | `number` | Total de memória disponível para offloading |
| `status` | `FeasibilityStatus`| `'full_gpu'` \| `'hybrid_offload'` \| `'cpu_only'` \| `'oom'` |
| `statusTitle` | `string` | Título legível do veredito |
| `statusBadge` | `string` | Texto do selo indicativo |
| `statusDescription` | `string` | Parecer detalhado e explicativo |
| `totalLayers` | `number` | Número total de camadas do modelo |
| `gpuLayers` | `number` | Quantidade calculada de camadas descarregadas na GPU |
| `cpuLayers` | `number` | Quantidade de camadas restantes na CPU |
| `percentageInGpu` | `number` | Porcentagem dos cálculos executados acelerados por hardware |
| `theoreticalMaxTokensPerSec`| `number` | Limite teórico de vazão imposto pela largura de banda |
| `estimatedRealTokensPerSec` | `number` | Taxa de geração estimada real em tokens por segundo |
| `prefillSpeedTokensPerSec` | `number` | Velocidade estimada no processamento inicial do prompt (TTFT) |
| `memoryPressurePct` | `number` | Porcentagem da memória utilizável ocupada pelo modelo |
| `memoryDeficitGB` | `number` | Déficit de memória em caso de Out of Memory (OOM) |
| `recommendations` | `string[]` | Lista de recomendações técnicas acionáveis |
| `bottleneck` | `enum` | Principal gargalo: `'memory_capacity'`, `'memory_bandwidth'`, `'pcie_bus'`, `'compute'` |
