# ADR 001: Estimativa Analítica Determinística vs Benchmarking em Tempo Real

- **Status:** Aceito (Retroativo)
- **Data:** 2026-10-28
- **Decisores:** Time de Engenharia do AI Edge Estimator
- **Nível de Confiança:** 🟢 CONFIRMADO

---

## Contexto

Para que engenheiros e desenvolvedores saibam se um LLM rodará em seu hardware local, existem duas abordagens primárias:
1. Baixar o modelo real dezenas de gigabytes e executar benchmarks empíricos.
2. Formular um modelo analítico matemático baseado na física dos chips e nas equações dos tensores da arquitetura Transformer.

## Decisão

Adotou-se uma formulação analítica determinística estática baseada nas dimensões da rede (`layers`, `hiddenSize`, `heads`, `parametersB`), esquemas de quantização e largura de banda de memória do hardware.

## Alternativas Consideradas

1. **Download e Benchmark Real via WebGPU:**
   - *Descartado:* Inviável para modelos grandes (7B a 70B), requer download de muitos gigabytes de dados e sobrecarrega a máquina do usuário apenas para responder se seria viável.
2. **Consulta a Tabela Estática de Resultados Pré-Gravados:**
   - *Descartado:* Não permitiria ao usuário ajustar dinamicamente o tamanho do contexto de 512 até 131.072 tokens nem variar a quantização do KV-Cache em tempo real.

## Consequências

- **Positivas:**
  - Resposta instantânea (< 1 milissegundo) a cada movimento de slider na interface.
  - Zero consumo de banda de rede do usuário.
  - Funciona totalmente offline.
- **Negativas:**
  - Pequena margem de erro ($\pm 5\%$) em relação a overheads dinâmicos de drivers específicos ou fragmentação de memória da GPU.
