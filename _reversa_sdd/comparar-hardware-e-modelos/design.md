# Caso de Uso: Comparar Hardware e Modelos, Design Técnico

> Especificação de Design Técnico (`design.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Interface do Componente

```typescript
interface MatrixComparatorProps {
  currentModel: ModelProfile;
  currentHardware: HardwareProfile;
  currentQuant: QuantProfile;
  params: InferenceParams;
  onSelectHardware: (hw: HardwareProfile) => void;
  onSelectModel: (m: ModelProfile) => void;
}
```

---

## 2. Fluxo Principal

1. **Leitura de Coleções de Presets:** O componente seleciona uma amostragem curada de 8 dispositivos em `HARDWARE_PRESETS` e 8 modelos em `MODEL_PRESETS`.
2. **Loop de Mapeamento Analítico:**
   ```typescript
   const matrixData = items.map((item) => {
     const hw = mode === 'hardwares' ? item : currentHardware;
     const mdl = mode === 'models' ? item : currentModel;
     return {
       item,
       calc: calculateEdgeFeasibility(mdl, hw, currentQuant, params)
     };
   });
   ```
3. **Cálculo de Escala Relativa de Velocidade:** Encontra `maxTokensPerSec = Math.max(...results.map(r => r.calc.estimatedRealTokensPerSec))` para calibrar as barras visuais percentuais.
4. **Disparo de Callback:** Ao clicar no card, invoca `onSelectHardware(hw)` ou `onSelectModel(mdl)`.

---

## 3. Dependências

- `src/lib/calculator.ts`: Invocado 8 vezes em loop a cada ciclo de render.
- `src/lib/presets.ts`: Fornece a lista de amostragem.
