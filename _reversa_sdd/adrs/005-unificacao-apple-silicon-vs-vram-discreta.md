# ADR 005: Tratamento Diferenciado de Memória Unificada (Apple Silicon) vs VRAM Discreta (Nvidia)

- **Status:** Aceito (Retroativo)
- **Data:** 2026-10-28
- **Decisores:** Time de Engenharia do AI Edge Estimator
- **Nível de Confiança:** 🟢 CONFIRMADO

---

## Contexto

A topologia de hardware de computação Edge divide-se fundamentalmente em:
1. **Memória Unificada (SoC):** Apple Silicon (M1 a M4) e Nvidia Jetson, onde a GPU compartilha a mesma memória física que a CPU e o sistema operacional através de um barramento unificado de alta velocidade.
2. **VRAM Discreta (PCIe):** Placas dedicadas (ex: Nvidia RTX 4090) com memória dedicada ultrarrápida (GDDR6X) conectadas a uma placa-mãe via slot PCIe x16.

Tratar ambas de forma idêntica levaria a estimativas incorretas de offload e estouro de memória.

## Decisão

Criar flags e caminhos de cálculo específicos para cada arquitetura:
1. Em memória unificada (`isUnifiedMemory: true`):
   - Não há divisão física entre VRAM e RAM.
   - Aplica-se a fórmula de alocação Metal com limite de $90\%$ do espaço livre após reserva do SO (`pool * 0.90`).
   - Não há penalidade de transferência por barramento PCIe.
2. Em GPU discreta (`isUnifiedMemory: false`):
   - O veredito avalia primeiro a VRAM isolada.
   - Caso falte VRAM mas haja RAM no sistema, ativa-se o regime híbrido com cálculo de penalidade de barramento PCIe e divisão explícita de camadas (`gpuLayers` vs `cpuLayers`).

## Alternativas Consideradas

1. **Tratar Apple Silicon como tendo VRAM igual à RAM total:**
   - *Descartado:* Causaria falha catastrófica de Out of Memory, pois o macOS precisa de memória para o sistema operacional e a API Metal limita alocações unitárias excessivas por padrão.
2. **Ignorar o suporte a offload híbrido em placas discretas:**
   - *Descartado:* Impediria usuários com GPUs de 8GB ou 12GB de rodar modelos 14B ou 32B em velocidade aceitável usando descarregamento parcial.

## Consequências

- **Positivas:**
  - Estimativa exata de flags para `llama-server` (`--n-gpu-layers 99` em Mac vs contagem específica em PC híbrido).
  - Alinhamento perfeito com as limitações reais de hardware.
- **Negativas:**
  - Requer que o perfil de hardware (`HardwareProfile`) contenha a flag booleana `isUnifiedMemory` e o enum `architecture`.
