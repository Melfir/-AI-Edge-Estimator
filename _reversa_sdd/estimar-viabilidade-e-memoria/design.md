# Caso de Uso: Estimar Viabilidade e Memória, Design Técnico

> Especificação de Design Técnico (`design.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Interface do Módulo

### Função Central de Execução:
```typescript
function calculateEdgeFeasibility(
  model: ModelProfile,
  hardware: HardwareProfile,
  quant: QuantProfile,
  params: InferenceParams
): CalculationResult
```

### Contrato de Parâmetros e Retorno:
| Símbolo | Tipo | Papel |
|---|---|---|
| `model` | `ModelProfile` | Metadados do LLM (`parametersB`, `layers`, `kvHeads`, `headDim`, etc.) |
| `hardware` | `HardwareProfile` | Especificação física (`totalRamGB`, `vramGB`, `isUnifiedMemory`, `memoryBandwidthGBs`) |
| `quant` | `QuantProfile` | Perfil de quantização (`bytesPerParam`, `bitsPerWeight`) |
| `params` | `InferenceParams` | Variáveis dinâmicas (`contextLength`, `batchSize`, `kvCacheQuant`, `runner`) |
| **Retorno** | `CalculationResult` | Objeto consolidado com consumos de memória, veredito, divisão de layers e vazão |

---

## 2. Fluxo Principal de Processamento

1. **Cálculo de Pesos (`src/lib/calculator.ts:11`):** Multiplica `parametersB * 1e9 * quant.bytesPerParam / 1024^3`.
2. **Cálculo de KV-Cache (`src/lib/calculator.ts:23`):** Define `kvBytesPerElement` (FP16: 2.0, Q8_0: 1.0, Q4_0: 0.5) e multiplica pelas dimensões da atenção e pelo contexto.
3. **Ativações e Overhead (`src/lib/calculator.ts:29-41`):** Calcula ativações intermediárias proporcionais ao contexto e soma o overhead base do driver da arquitetura alvo.
4. **Reserva do SO e Pool Útil (`src/lib/calculator.ts:53-69`):** Determina se o hardware é unificado (aplica fator Metal de 90%) ou discreto (VRAM livre descontando driver + RAM do sistema descontando 3.5GB).
5. **Decisão de Status (`src/lib/calculator.ts:71-131`):** Compara a memória requerida contra VRAM útil e pool total, definindo o status e calculando `gpuLayers` e `cpuLayers`.
6. **Estimativa de Vazão (`src/lib/calculator.ts:138-163`):** Projeta os tokens/s aplicando eficiência empírica baseada na largura de banda da memória.
7. **Recomendações e Gargalo (`src/lib/calculator.ts:171-223`):** Constrói diagnósticos acionáveis (ex: expansão de contexto segura ou quantização de KV-Cache).

---

## 3. Fluxos Alternativos e de Borda

- **Hardware CPU Puro (`architecture === 'cpu_unified' && !isUnifiedMemory`):** O modelo é forçado a 0 layers na GPU (`gpuLayers = 0`, `cpuLayers = layers`) e o limite de veredito avalia apenas a RAM livre do sistema.
- **Offload Híbrido com VRAM Insuficiente para Contexto:** Se o contexto e o overhead excederem a VRAM útil, `gpuLayers` é cravado em 0 e todo o peso vai para a RAM do sistema.
- **Contexto Extremo (> 32k tokens):** Quando o KV-Cache ultrapassa 50% dos pesos do modelo, o gargalo operacional transita de `memory_bandwidth` para `compute`.

---

## 4. Dependências

- `src/types/index.ts`: Fornece os contratos de tipos.
- `src/lib/presets.ts`: Fornece os perfis padrão para fallback caso algum parâmetro não seja informado.

---

## 5. Decisões de Design Identificadas

| Decisão | Evidência no Código | Confiança |
|---|---|---|
| Cálculo estático puro sem efeitos colaterais (Função Pura) | `src/lib/calculator.ts:3` | 🟢 CONFIRMADO |
| Conversão de bytes para Gigabytes baseada em $1024^3$ (GiB) | `src/lib/calculator.ts:12` | 🟢 CONFIRMADO |
| Formatação de ponto flutuante com `.toFixed(2)` e conversão explícita para `Number` | `src/lib/calculator.ts:12, 25` | 🟢 CONFIRMADO |
