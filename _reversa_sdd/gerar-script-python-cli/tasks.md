# Caso de Uso: Gerar Script Python CLI, Tarefas de Implementação

> Especificação de Tarefas Operacionais (`tasks.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Pré-requisitos
- [x] Lógica de estimativa de inferência modelada e estável.
- [x] Identificadores de presets padronizados.

---

## 2. Tarefas de Implementação

- [ ] **T-01: Implementar Template Generator em TypeScript**
  - Origem no legado: `src/lib/pythonGenerator.ts:1-25`
  - Critério de pronto: Gerar template com valores default sincronizados com a UI.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-02: Implementar Sondagem de Hardware (Hardware Probing) em Python**
  - Origem no legado: `public/ai_edge_estimator.py:115-180`
  - Critério de pronto: Auto-detecção de VRAM de Nvidia e Apple Silicon sem crash.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-03: Implementar CLI Parser com `argparse`**
  - Origem no legado: `public/ai_edge_estimator.py:280-350`
  - Critério de pronto: Todas as flags CLI funcionam com `--help` claro.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-04: Implementar Visualizador com Download de Arquivo na UI**
  - Origem no legado: `src/components/PythonScriptView.tsx:40-80`
  - Critério de pronto: Clique em "Baixar Script" faz download de `ai_edge_estimator.py`.
  - Confiança: 🟢 CONFIRMADO
