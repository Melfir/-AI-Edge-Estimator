# Matriz de Rastreabilidade Código $\leftrightarrow$ Especificação (Code/Spec Matrix)

> Gerado pelo Redator (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Rastreabilidade Arquivo por Arquivo

| Arquivo do Legado | Linhas | Módulo | Unit de Especificação (Caso de Uso) | Responsabilidade Coberta |
|---|---|---|---|---|
| `src/lib/calculator.ts` | 1-251 | `calculator` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Algoritmos de pesos, KV-cache, activations, offload e throughput |
| `src/lib/presets.ts` | 1-662 | `presets` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Catálogo de hardwares, LLMs e perfis de quantização |
| `src/types/index.ts` | 1-108 | `calculator` | Todas as units | Definições de entidades, contratos de domínio e enums |
| `src/App.tsx` | 1-208 | `ui-components` | Todas as units | Orquestração de abas, estado compartilhado e recálculo reativo |
| `src/components/ModelSelector.tsx` | 1-329 | `ui-components` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Interface de seleção de modelos, sliders de contexto e KV quant |
| `src/components/HardwareSelector.tsx` | 1-207 | `ui-components` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Abas por fabricante de chips e cards de dispositivos |
| `src/components/ResultsDashboard.tsx` | 1-337 | `ui-components` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Painel de métricas, barras de pressão de VRAM e alertas |
| `src/components/MatrixComparator.tsx` | 1-240 | `ui-components` | `_reversa_sdd/comparar-hardware-e-modelos/` | Grade cartesiana comparativa de 8 hardwares ou 8 modelos |
| `src/lib/pythonGenerator.ts` | 1-444 | `python-generator` | `_reversa_sdd/gerar-script-python-cli/` | Síntese de script Python autônomo baseado no estado ativo |
| `public/ai_edge_estimator.py` | 1-392 | `cli-standalone` | `_reversa_sdd/gerar-script-python-cli/` | Executável CLI offline com sondagem de sistema |
| `src/components/PythonScriptView.tsx`| 1-343 | `ui-components` | `_reversa_sdd/gerar-script-python-cli/` | Visualizador syntax-highlighted e gatilho de download |
| `src/components/EngineRecipe.tsx` | 1-152 | `ui-components` | `_reversa_sdd/gerar-receitas-de-execucao-de-engines/` | Geração de comandos CLI de runners de inferência |
| `src/components/Header.tsx` | 1-89 | `ui-components` | Todas as units | Cabeçalho e navegação de abas |
| `src/main.tsx` | 1-5 | `ui-components` | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Ponto de entrada React DOM |
| `index.html` | 1-21 | Core Web | `_reversa_sdd/estimar-viabilidade-e-memoria/` | Container HTML raiz |
| `vite.config.ts` | 1-22 | Build Tooling | Transversal | Configuração do Vite e plugins Tailwind |

---

## 2. Índice de Cobertura de Especificação

- **Total de Arquivos do Projeto Legado:** 16 arquivos de código-fonte
- **Arquivos Cobertos por Especificações:** 16 (100% de cobertura)
- **Nível de Rastreabilidade:** Bidirecional (Código $\leftrightarrow$ SDD)
