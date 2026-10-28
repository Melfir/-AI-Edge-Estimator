# Caso de Uso: Comparar Hardware e Modelos, Casos de Borda (Edge Cases)

> Especificação de Casos de Borda (`edge-cases.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Dispositivos com 0 tokens/s (OOM) na Grade Comparativa
- **Cenário:** Em modelos 70B, dispositivos com pouca VRAM (ex: Raspberry Pi 5 ou RTX 4060) entram em OOM.
- **Comportamento no Código:** O componente trata graciosamente o valor zero, ocultando a barra de velocidade e substituindo a métrica por um badge explícito `"OOM - Memória Insuficiente"`.
- **Evidência:** `src/components/MatrixComparator.tsx:94`

---

## 2. Empate de Velocidade Máxima ou Dispositivo Único Válido
- **Cenário:** Se todos os dispositivos simulados entrarem em OOM (ex: modelo excessivamente pesado em contexto 128k).
- **Comportamento no Código:** `maxTokensPerSec` retorna 0; o código previne divisão por zero ao calcular o percentual de barra através de `Math.max(1, maxTokensPerSec)`.
- **Evidência:** `src/components/MatrixComparator.tsx:62`
