# Caso de Uso: Gerar Receitas de Execução de Engines (Runners)

> Especificação de Requisitos Operacionais (`requirements.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Visão Geral

Gera comandos de terminal prontos para cópia e execução imediata calibrados especificamente para runtimes de inferência modernos (`llama.cpp`, `Ollama`, `vLLM`, `MLC-LLM`), injetando os argumentos exatos calculados de offload de camadas, tamanho de contexto, batch size e tipo de quantização do KV-Cache.

---

## 2. Responsabilidades

- Construir comandos de inicialização específicos para cada runner.
- Mapear a quantidade calculada de `gpuLayers` para a flag correspondente (ex: `-ngl <N>` no llama.cpp ou `num_gpu: <N>` no Modelfile do Ollama).
- Injetar flags de contexto (`-c <contextLength>`).
- Configurar quantização do KV Cache (`--cache-type-k <quant> --cache-type-v <quant>`).
- Fornecer botão de cópia com feedback visual ("Copiado!").

---

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|---|---|---|---|
| RF-01 | Suportar múltiplos motores de inferência | Must | Abas para llama.cpp (`llama-server`, `llama-cli`), Ollama, vLLM e MLC-LLM |
| RF-02 | Injetar parâmetros calculados dinamicamente | Must | Substituir flags numéricas pelos valores de `CalculationResult` e `InferenceParams` |
| RF-03 | Suportar comando de servidor HTTP e CLI interativo | Should | Gerar receita para modo server API e modo terminal |
| RF-04 | Cópia com um clique para a área de transferência | Should | Integração com a Clipboard API do navegador |
