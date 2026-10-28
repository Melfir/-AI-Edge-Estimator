# Caso de Uso: Comparar Hardware e Modelos, Tarefas de Implementação

> Especificação de Tarefas Operacionais (`tasks.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Pré-requisitos
- [x] Motor `calculateEdgeFeasibility` disponível.
- [x] Listas curadas de hardware e modelos indexadas.

---

## 2. Tarefas de Implementação

- [ ] **T-01: Implementar Estado de Alternância de Modo (Hardware vs Modelo)**
  - Origem no legado: `src/components/MatrixComparator.tsx:21`
  - Critério de pronto: Alternar abas preservando seleções.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-02: Implementar Loop de Simulação Concorrente**
  - Origem no legado: `src/components/MatrixComparator.tsx:42-58`
  - Critério de pronto: Gerar array de 8 resultados analíticos independentes.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-03: Renderizar Cards Comparativos com Destaque de Seleção Ativa**
  - Origem no legado: `src/components/MatrixComparator.tsx:68-120`
  - Critério de pronto: Card do item ativo recebe anel colorido (`ring-2 ring-emerald-500`).
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-04: Implementar Callback de Troca Rápida de Configuração**
  - Origem no legado: `src/components/MatrixComparator.tsx:125`
  - Critério de pronto: Clique em card atualiza o estado global em `App.tsx`.
  - Confiança: 🟢 CONFIRMADO
