# Arquitetura Geral do Sistema — ai-edge-estimator

> Gerado pelo Arquiteto (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Visão Arquitetural

O **ai-edge-estimator** foi concebido sob o padrão arquitetural **Client-Centric Analytical Engine (Isomorphic Logic)**.

```
+-----------------------------------------------------------------------+
|                             USER REALM                                |
|                                                                       |
|   +-----------------------+              +------------------------+   |
|   |  Browser SPA (React)  |              |  Terminal CLI (Python) |   |
|   |  - Visual Sliders     |              |  - OS Auto-Detection   |   |
|   |  - Matrix Comparator  |              |  - Headless Servers    |   |
|   |  - Real-time Badges   |              |  - JSON / ANSI output  |   |
|   +-----------+-----------+              +-----------+------------+   |
|               |                                      |                |
|               v                                      v                |
|   +---------------------------------------------------------------+   |
|   |             ANALYTICAL ENGINE (Deterministic Math)            |   |
|   |   - Weights Memory (P * 10^9 * bytesPerParam)                 |   |
|   |   - KV-Cache with GQA & Context Length                        |   |
|   |   - Offload Boundary & Layer Split Allocation                 |   |
|   |   - Memory Bandwidth Bound Throughput (Tokens/s)              |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

### Características Arquiteturais:
1. **Zero-Latency In-Memory Math:** Os cálculos não dependem de chamadas de API, bancos de dados relacionais ou workers em background; toda a árvore de dependências analíticas é síncrona.
2. **Dupla Interface Intercambiável:** A mesma matriz matemática é implementada em TypeScript (SPA) e Python 3 (CLI distribuível).
3. **Desacoplamento de Hardware Externo:** Em vez de depender do runtime real do `llama.cpp` ou CUDA instalados no navegador, o sistema opera como um oráculo de projeto (Architectural Design Aid) gerando inclusive a linha de comando ideal para inicialização dos runtimes externos.

---

## 2. Dívidas Técnicas Identificadas

1. **Duplicação Lógica TS $\leftrightarrow$ Python:** As fórmulas de cálculo de VRAM e vazão existem independentemente em `src/lib/calculator.ts` e `public/ai_edge_estimator.py` / `src/lib/pythonGenerator.ts`. Alterações em uma exigem edição manual na outra.
2. **Ausência de Suíte de Testes Unitários:** Não há testes em `jest`/`vitest` validando edge-cases numéricos (ex: batch size = 0, context length excedendo `contextMaxTokens`, hardware customizado com VRAM negativa).
3. **Catálogo Estático Hardcoded:** Novos modelos (ex: Llama 4, Mistral Large) ou GPUs (ex: RTX 5080) requerem alteração direta no código fonte (`presets.ts`). Não há suporte a importação de arquivos JSON externos pelo usuário na UI.
