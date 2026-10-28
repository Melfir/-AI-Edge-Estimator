# Caso de Uso: Estimar Viabilidade e Memória de Inferência Edge

> Especificação de Requisitos Operacionais (`requirements.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Visão Geral

Calcula matematicamente com latência sub-milissegundo a pegada de memória (VRAM/RAM), a alocação de KV-Cache com suporte a GQA, a divisão de camadas entre GPU e CPU e a velocidade estimada em tokens/segundo para execução de LLMs em dispositivos locais.

---

## 2. Responsabilidades

- Calcular o consumo de memória dos tensores de peso baseado na contagem de parâmetros e formato de quantização.
- Dimensionar o KV-Cache levando em conta o tamanho do contexto (tokens), batch size, precisão (FP16, Q8_0, Q4_0) e arquitetura de atenção (Grouped-Query Attention).
- Estimar a sobrecarga de memória de ativações intermediárias e runtime (drivers CUDA, Metal buffers, scratchpads do llama.cpp).
- Avaliar a capacidade física utilizável do hardware descontando a reserva operacional do sistema operacional.
- Determinar o status de viabilidade (`full_gpu`, `hybrid_offload`, `cpu_only`, `oom`).
- Calcular a vazão teórica máxima e estimada real em tokens/s baseada na largura de banda de memória ($GB/s$).
- Gerar recomendações técnicas acionáveis para mitigação de OOM ou expansão de contexto.

---

## 3. Regras de Negócio

- **RN-01 (Pesos do Modelo):** $\text{Weights} = (P \times 10^9 \times \text{bytesPerParam}) / 1024^3$. 🟢
- **RN-02 (KV-Cache com GQA):** $\text{KV} = (2 \times \text{layers} \times \text{kvHeads} \times \text{headDim} \times \text{bytesPerElement} \times \text{contextLength} \times \text{batchSize}) / 1024^3$. 🟢
- **RN-03 (Reserva OS):** Descontar `systemOsReserveGB` da VRAM ou memória unificada. Em Apple Silicon, limitar alocação máxima a $90\%$ do pool livre. 🟢
- **RN-04 (Particionamento de Layers):** Priorizar contexto e overhead na GPU; os layers restantes que couberem no saldo de VRAM são atribuídos à GPU, e o restante à CPU. 🟢
- **RN-05 (Modelo Memory-Bandwidth-Bound):** $\text{Tokens/s} \approx \text{Bandwidth (GB/s)} / \text{Weights (GB)} \times \text{Eficiência}$. Em offload híbrido, limitar a banda efetiva a $\min(\text{BW} \times 0.35, 45\text{ GB/s})$. 🟢

---

## 4. Requisitos Funcionais

| ID | Requisito | Prioridade (MoSCoW) | Critério de Aceite |
|---|---|---|---|
| RF-01 | Selecionar modelo e extrair seus hiperparâmetros | Must | Carregar `parametersB`, `layers`, `kvHeads`, `headDim` e `contextMaxTokens` |
| RF-02 | Selecionar perfil de quantização de pesos | Must | Multiplicar parâmetros pelos `bytesPerParam` correspondentes |
| RF-03 | Configurar dinamicamente o tamanho do contexto | Must | Aceitar slider de 512 até `contextMaxTokens` com recálculo reativo |
| RF-04 | Alternar quantização de KV-Cache (FP16, Q8_0, Q4_0) | Must | Recalcular imediatamente o consumo do cache |
| RF-05 | Emitir veredito de viabilidade com badge de cor | Must | Exibir `full_gpu` (verde), `hybrid_offload` (âmbar), `cpu_only` (azul), `oom` (vermelho) |
| RF-06 | Calcular layers GPU vs CPU | Must | Informar exatamente a contagem inteira de camadas descarregadas |
| RF-07 | Emitir lista de recomendações | Should | Exibir comandos e dicas contextuais dependendo do status emitido |

---

## 5. Requisitos Não Funcionais

| Tipo | Requisito | Evidência no Código | Confiança |
|---|---|---|---|
| Performance | Tempo de resposta do cálculo < 5ms na interface | `src/App.tsx:45` (`useMemo`) | 🟢 |
| Confiabilidade | Ausência de divisões por zero ou valores NaN | `src/lib/calculator.ts:81` (`Math.max(1, model.layers)`) | 🟢 |
| Determinismo | Resultados idênticos para os mesmos inputs | `src/lib/calculator.ts:3` | 🟢 |
| Portabilidade | Fórmulas executáveis em JS e Python sem libs pesadas | `public/ai_edge_estimator.py` | 🟢 |

---

## 6. Critérios de Aceitação (Gherkin BDD)

```gherkin
Cenário: Modelo Llama 3 8B Q4_K_M em Apple M3 Max 36GB com 8k tokens
  Dado que o usuário selecionou o modelo "Llama 3.1 8B"
  E selecionou a quantização "Q4_K_M" (0.56 bytes/param)
  E selecionou o hardware "Apple M3 Max (36 GB)"
  E definiu o contexto para 8192 tokens com KV-Cache em FP16
  Quando o cálculo de viabilidade for executado
  Então o status deve ser "full_gpu"
  E os layers em GPU devem ser iguais ao total de layers (32)
  E a taxa estimada de tokens/s deve ser superior a 30 tokens/s

Cenário: Modelo DeepSeek 70B em Nvidia RTX 4060 8GB
  Dado que o usuário selecionou um modelo de 70B parâmetros
  E selecionou uma placa "Nvidia GeForce RTX 4060 (8 GB)"
  Quando o cálculo de viabilidade for executado
  Então o status deve ser "oom"
  E a VRAM deve reportar déficit de memória
  E o sistema deve sugerir quantização menor ou modelo reduzido
```

---

## 7. Rastreabilidade de Código

| Arquivo | Função / Componente | Papel no Caso de Uso |
|---|---|---|
| `src/lib/calculator.ts` | `calculateEdgeFeasibility()` | Execução de todas as fórmulas matemáticas |
| `src/types/index.ts` | `CalculationResult`, `InferenceParams` | Contratos e tipos de dados |
| `src/components/ResultsDashboard.tsx` | `ResultsDashboard` | Renderização visual dos resultados e alertas |
