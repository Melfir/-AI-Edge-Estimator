# ADR 002: Modelagem de KV-Cache com Suporte a Grouped-Query Attention (GQA)

- **Status:** Aceito (Retroativo)
- **Data:** 2026-10-28
- **Decisores:** Time de Engenharia do AI Edge Estimator
- **Nível de Confiança:** 🟢 CONFIRMADO

---

## Contexto

Calculadoras simplistas de VRAM na comunidade frequentemente utilizam a fórmula ingênua de Multi-Head Attention (MHA):
$$\text{KV} = 2 \times \text{layers} \times \text{heads} \times \text{dim} \times \text{tokens}$$
Isso superestima drasticamente a memória de KV-Cache em modelos modernos (como Llama 3, Qwen 2.5 e Mistral), que adotam Grouped-Query Attention (GQA), onde $8$ ou mais Query Heads compartilham apenas $1$ par de Key/Value Heads.

## Decisão

Implementar o cálculo separando formalmente `queryHeads` de `kvHeads`:
$$\text{KV Bytes} = 2 \times \text{layers} \times \text{kvHeads} \times \text{headDim} \times \text{bytesPerElement} \times \text{contextLength} \times \text{batchSize}$$
Além disso, permitir a quantização do KV Cache para `Q8_0` (1 byte) e `Q4_0` (0.5 byte).

## Alternativas Consideradas

1. **Assumir MHA tradicional (sem GQA):**
   - *Descartado:* Daria falso-positivo de Out of Memory para Llama 3 8B em janelas de 32k/64k tokens em placas de 12GB e 16GB.
2. **Ignorar KV-Cache e considerar apenas o peso do modelo:**
   - *Descartado:* Em contextos longos (>16k tokens), o KV-Cache pode ultrapassar o tamanho dos próprios pesos do modelo.

## Consequências

- **Positivas:**
  - Fidelidade máxima com o comportamento real do `llama.cpp` e `vLLM`.
  - Demonstração precisa de ganhos ao ativar `--cache-type-k q4_0`.
- **Negativas:**
  - O catálogo de modelos precisa registrar explicitamente o campo `kvHeads` e `headDim` para cada arquitetura.
