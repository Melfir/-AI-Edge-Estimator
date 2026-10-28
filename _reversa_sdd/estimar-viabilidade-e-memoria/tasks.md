# Caso de Uso: Estimar Viabilidade e Memória, Tarefas de Implementação

> Especificação de Tarefas Operacionais (`tasks.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Pré-requisitos
- [x] Tipagens de `ModelProfile`, `HardwareProfile`, `QuantProfile` e `InferenceParams` definidas.
- [x] Módulos de preset com parâmetros arquiteturais validados.

---

## 2. Tarefas de Implementação

- [ ] **T-01: Implementar Cálculo de Memória dos Pesos**
  - Origem no legado: `src/lib/calculator.ts:9-12`
  - Critério de pronto: Validar que 7B em Q4_K_M resulta em ~3.65 GB.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-02: Implementar Cálculo de KV-Cache com Suporte a GQA**
  - Origem no legado: `src/lib/calculator.ts:14-25`
  - Critério de pronto: Validar que FP16 usa 2 bytes, Q8_0 usa 1 byte e Q4_0 usa 0.5 byte multiplicado por `kvHeads`.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-03: Implementar Dimensionamento de Ativações e Overhead de Driver**
  - Origem no legado: `src/lib/calculator.ts:27-41`
  - Critério de pronto: Diferenciar base overhead de Nvidia (0.65 GB), Apple (0.40 GB) e CPU (0.30 GB).
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-04: Implementar Algoritmo de Avaliação de Hardware e Reserva de SO**
  - Origem no legado: `src/lib/calculator.ts:48-69`
  - Critério de pronto: Aplicar fator de 90% em Apple Silicon e desconto de 3.5 GB na RAM de PCs x86.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-05: Implementar Máquina de Estado e Particionamento de Layers**
  - Origem no legado: `src/lib/calculator.ts:71-131`
  - Critério de pronto: Emitir status correto (`full_gpu`, `hybrid_offload`, `cpu_only`, `oom`) com contagem exata de layers.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-06: Implementar Modelo de Vazão em Tokens/s Baseado em Largura de Banda**
  - Origem no legado: `src/lib/calculator.ts:135-163`
  - Critério de pronto: Validar throughput teórico e aplicar fatores de eficiência por barramento.
  - Confiança: 🟢 CONFIRMADO

- [ ] **T-07: Implementar Motor de Recomendações e Diagnóstico de Gargalos**
  - Origem no legado: `src/lib/calculator.ts:171-223`
  - Critério de pronto: Gerar avisos textuais acionáveis específicos para cada status.
  - Confiança: 🟢 CONFIRMADO

---

## 3. Tarefas de Teste

- [ ] **TT-01: Teste Unitário — Full GPU em Apple Silicon**
  - Validar Llama 3 8B Q4_K_M em M3 Max 36GB. Esperado: `full_gpu`, 32 gpu layers, 0 deficit.
- [ ] **TT-02: Teste Unitário — Hybrid Offload em GPU Discreta**
  - Validar Qwen 2.5 14B Q4_K_M em RTX 4060 8GB + 32GB RAM. Esperado: `hybrid_offload`, split parcial de layers.
- [ ] **TT-03: Teste Unitário — Out Of Memory**
  - Validar DeepSeek 70B FP16 em Raspberry Pi 5 8GB. Esperado: `oom`, deficit calculado.
- [ ] **TT-04: Teste Unitário — Transição por Quantização do KV-Cache**
  - Validar economia exata ao comutar de FP16 para Q4_0.
