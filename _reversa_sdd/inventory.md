# Inventário do Sistema — ai-edge-estimator

> Gerado pelo Scout (Reversa v1.3.6) em 2026-10-28

---

## 1. Visão Geral

- **Projeto:** `ai-edge-estimator`
- **Linguagem Principal:** TypeScript
- **Ecossistema:** React 19 + Vite 8 + TailwindCSS 4 + Python (CLI standalone)
- **Propósito:** Calculadora e estimador em tempo real de viabilidade, consumo de memória (VRAM/RAM), KV-cache, bandwidth e vazão (tokens/s) para execução de modelos de IA (LLMs) em dispositivos de borda (Edge / On-Device).

---

## 2. Estrutura de Arquivos

```
ai-edge-estimator/
├── index.html                    # Entrada HTML principal da SPA
├── package.json                  # Dependências e scripts npm
├── tsconfig.json                 # Configuração do TypeScript
├── vite.config.ts                # Configuração do Vite + plugins
├── metadata.json                 # Metadados de capabilities do projeto
├── public/
│   └── ai_edge_estimator.py      # Script autônomo CLI em Python para estimativa offline
└── src/
    ├── main.tsx                  # Ponto de montagem React DOM
    ├── App.tsx                   # Componente raiz, orquestrador de abas e estado reativo
    ├── index.css                 # Importação do TailwindCSS
    ├── types/
    │   └── index.ts              # Definições de tipos (Model, Hardware, Quant, Runner, etc.)
    ├── lib/
    │   ├── calculator.ts         # Fórmulas de estimativa de memória, KV cache e vazão
    │   ├── presets.ts            # Base de dados de modelos, hardware e perfis de quantização
    │   └── pythonGenerator.ts    # Gerador dinâmico de script Python CLI com os parâmetros ativos
    └── components/
        ├── Header.tsx            # Cabeçalho da aplicação e navegação de abas
        ├── ModelSelector.tsx     # Seleção de modelos LLM e parâmetros de contexto/batch
        ├── HardwareSelector.tsx  # Seleção de chips, memória e barramento de hardware
        ├── ResultsDashboard.tsx  # Painel de métricas, gráficos de VRAM e selos de viabilidade
        ├── MatrixComparator.tsx  # Matriz de comparação multi-hardware / multi-modelo
        ├── PythonScriptView.tsx  # Visualizador e exportador do script Python gerado
        └── EngineRecipe.tsx      # Instruções de configuração para Llama.cpp, Ollama, etc.
```

---

## 3. Módulos Funcionais Identificados

1. **`calculator` (`src/lib/calculator.ts`)**
   - Cálculo de tamanho dos pesos quantizados (GGUF, AWQ, EXL2).
   - Cálculo de tamanho dinâmico de KV-Cache por camada, heads e precisão (FP16, Q8_0, Q4_0).
   - Cálculo de overhead de contexto e runtime.
   - Cálculo de vazão de geração estimada com base na largura de banda de memória (GB/s).
   - Classificação de viabilidade: *Ideal*, *Apertado (Tight)*, *Inviável (OOM)*.

2. **`presets` (`src/lib/presets.ts`)**
   - Perfis de hardware (Apple Silicon M-series, GPUs Nvidia RTX/datacenter, Raspberry Pi, etc.).
   - Perfis de modelos (Llama 3, DeepSeek, Mistral, Gemma, Phi, Qwen, etc.).
   - Tabela de bits por peso e perda de perplexidade aproximada para quantizações.

3. **`python-generator` (`src/lib/pythonGenerator.ts` / `public/ai_edge_estimator.py`)**
   - Transpilação da lógica de estimativa para execução via terminal Python puro sem dependências externas pesadas.

4. **`ui-components` (`src/components/*`)**
   - Interface reativa construída com TailwindCSS e animações Motion com painéis de métricas e comparadores visuais.

5. **`engine-recipe` (`src/components/EngineRecipe.tsx`)**
   - Geração de comandos CLI de inferência otimizados para Llama.cpp, Ollama, MLC-LLM e vLLM.

---

## 4. Banco de Dados e Integrações

- **Banco de Dados:** Nenhum (cálculo matemático 100% determinístico e local no cliente).
- **APIs Externas:** Suporte opcional a SDK `@google/genai` via variável `GEMINI_API_KEY`.
- **Testes Automatizados:** Não detectados no estado atual do projeto.
