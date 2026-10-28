# Caso de Uso: Gerar Receitas de Execução, Tarefas de Implementação

> Especificação de Tarefas Operacionais (`tasks.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Pré-requisitos
- [x] Contagem de `gpuLayers` e parâmetros de contexto calculados.

---

## 2. Tarefas de Implementação

- [ ] **T-01: Implementar Sintetizador de Flags para Llama.cpp**
  - Origem no legado: `src/components/EngineRecipe.tsx:35-60`
  - Critério de pronto: Gerar flags `-ngl`, `-c`, `-b` e `--cache-type-k/v` corretas.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-02: Implementar Sintetizador de Modelfile para Ollama**
  - Origem no legado: `src/components/EngineRecipe.tsx:65-85`
  - Critério de pronto: Gerar bloco de texto Modelfile válido.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-03: Implementar Sintetizador de Comando para vLLM e MLC-LLM**
  - Origem no legado: `src/components/EngineRecipe.tsx:90-120`
  - Critério de pronto: Configurar `--gpu-memory-utilization` e flags de AWQ.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-04: Implementar Cópia para Clipboard com Feedback Visual**
  - Origem no legado: `src/components/EngineRecipe.tsx:25-30`
  - Critério de pronto: Ícone muda temporariamente para check verde por 2 segundos.
  - Confiança: 🟢 CONFIRMADO
