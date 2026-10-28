# Caso de Uso: Estimar Viabilidade e Memória, Casos de Borda (Edge Cases)

> Especificação de Casos de Borda (`edge-cases.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Contexto Maior que a VRAM Total mas Menor que a RAM
- **Cenário:** Modelo 8B quantizado em Q4_K_M (pesos ~4.5 GB) em GPU de 8GB de VRAM, com janela de contexto estendida para 64.000 tokens (KV-Cache consumindo ~6.0 GB).
- **Comportamento no Código:** A soma dos pesos (4.5 GB) + KV (6.0 GB) + Overhead (1.2 GB) = 11.7 GB. Como 11.7 GB > 8.0 GB, o sistema transita automaticamente para `hybrid_offload`.
- **Efeito:** Como o contexto e overhead (7.2 GB) ocupam quase toda a VRAM utilizável (7.0 GB livre), `availableVramForWeights` resulta em zero, empurrando praticamente 100% dos layers para a CPU/RAM via PCIe.
- **Evidência:** `src/lib/calculator.ts:117`

---

## 2. Janela de Contexto Mínima (512 tokens) vs Máxima Suportada
- **Cenário:** O usuário move o slider para o extremo esquerdo (512 tokens) ou extremo direito (`contextMaxTokens`, ex: 131.072 tokens).
- **Comportamento no Código:** O cálculo de ativações intermediárias possui um piso rígido de segurança: `Math.max(0.15, activationBytes / 1024^3)`, garantindo que mesmo com 512 tokens o consumo de ativações nunca caia para zero, preservando fidelidade com buffers mínimos de inferência.
- **Evidência:** `src/lib/calculator.ts:30`

---

## 3. Modelo com Contagem Impar ou Fracionada de Layers
- **Cenário:** Modelos compactados ou customizados com número ímpar de camadas (ex: 27 ou 28 layers).
- **Comportamento no Código:** A divisão de camadas utiliza `Math.floor(availableVramForWeights / weightPerLayerGB)` com teto em `model.layers - 1`, garantindo que `gpuLayers` e `cpuLayers` sejam sempre números inteiros exatos cuja soma iguala `model.layers`.
- **Evidência:** `src/lib/calculator.ts:118`
