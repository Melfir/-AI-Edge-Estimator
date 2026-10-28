# ADR 003: Modelagem de Vazão (Tokens/s) Baseada na Largura de Banda de Memória

- **Status:** Aceito (Retroativo)
- **Data:** 2026-10-28
- **Decisores:** Time de Engenharia do AI Edge Estimator
- **Nível de Confiança:** 🟢 CONFIRMADO

---

## Contexto

A velocidade com que um modelo gera texto na fase autorregressiva (um token por vez) é fundamental para a viabilidade de uso interativo (chat, coding assist). Há uma confusão comum entre TFLOPs de computação e largura de banda de memória.

## Decisão

Basear o cálculo de tokens por segundo na física do regime Memory-Bandwidth-Bound:
$$\text{Tokens/s} \approx \frac{\text{Bandwidth (GB/s)}}{\text{Model Weights Size (GB)}} \times \text{Eficiência}$$
Onde a eficiência é calibrada por arquitetura:
- Dedicated GPU (Nvidia RTX): ~80%
- Apple Silicon (Metal Unified): ~72%
- Hybrid Offload (PCIe limitado): ~35-40% (com teto em 45 GB/s)
- Pure CPU: ~55% da banda do barramento DDR4/DDR5.

## Alternativas Consideradas

1. **Estimar velocidade exclusivamente por TFLOPs:**
   - *Descartado:* Erro clássico; na inferência de batch=1, a GPU passa a maior parte do tempo ociosa esperando os pesos chegarem da memória, tornando TFLOPs quase irrelevantes para a geração.
2. **Ignorar velocidade e mostrar apenas sim/não para memória:**
   - *Descartado:* Um modelo pode caber na RAM da CPU, mas rodar a 0.5 tokens/s, o que é inviável para uso produtivo. O usuário precisa da velocidade projetada.

## Consequências

- **Positivas:**
  - Estimativas realistas de tokens/s alinhadas com benchmarks reais da comunidade de LLM local.
  - Deixa clara a vantagem das GPUs com barramento largo (RTX 4090 a 1008 GB/s ou Apple Ultra a 800 GB/s) versus placas com barramento de 128-bit.
- **Negativas:**
  - Não reflete eventuais gargalos de CPU single-thread na orquestração do runtime.
