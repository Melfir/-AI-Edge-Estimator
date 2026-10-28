# Histórias de Usuário (User Stories) — ai-edge-estimator

> Gerado pelo Redator (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## US-01: Estimativa Rápida de Viabilidade de Modelo
- **Como um:** Desenvolvedor de aplicações com IA Local
- **Quero:** Selecionar um modelo (ex: DeepSeek R1 14B) e meu laptop atual (ex: MacBook Pro M3 18GB)
- **Para que eu possa:** Saber em menos de 1 segundo se o modelo caberá na minha VRAM e quantos tokens por segundo posso esperar antes de baixar 10 GB de pesos.

**Critérios de Aceitação:**
1. A interface deve recalcular todas as métricas instantaneamente sem requisição de rede.
2. O veredito deve ser visualmente claro através de um selo colorido (`full_gpu`, `hybrid_offload`, `cpu_only` ou `oom`).
3. Uma barra de ocupação de memória deve indicar os GBs livres restantes ou faltantes.

---

## US-02: Comparação de Hardware para Tomada de Decisão de Compra
- **Como um:** Engenheiro de Machine Learning planejando compra de workstation
- **Quero:** Fixar um modelo alvo (ex: Llama 3.3 70B Q4_K_M) e abrir a matriz comparativa de hardwares
- **Para que eu possa:** Ver lado a lado como o modelo se comporta em uma RTX 4080 (16GB), RTX 4090 (24GB), M3 Max (36GB) e M3 Ultra (128GB).

**Critérios de Aceitação:**
1. A matriz deve exibir 8 dispositivos em paralelo com barras relativas de velocidade em tokens/s.
2. A matriz deve explicitar quais dispositivos sofrem estrangulamento por PCIe e quais conseguem rodar 100% em VRAM rápida.

---

## US-03: Auditoria Automatizada em Servidor Headless
- **Como um:** Administrador de infraestrutura / DevOps
- **Quero:** Baixar o script `ai_edge_estimator.py` e executá-lo com `--auto-detect` em uma instância remota via SSH
- **Para que eu possa:** Descobrir automaticamente a GPU instalada, VRAM livre e avaliar a viabilidade de hospedar um modelo sem instalar pacotes pip pesados.

**Critérios de Aceitação:**
1. O script deve rodar sem nenhuma dependência além do Python 3 padrão.
2. O script deve detectar a placa via `nvidia-smi` ou memória via `/proc/meminfo`.
3. A saída no terminal deve conter cores ANSI legíveis e formatação limpa.

---

## US-04: Geração de Linha de Comando Otimizada para Llama.cpp
- **Como um:** Entusiasta de LLMs open-source
- **Quero:** Acessar a aba "Engine Recipes" após configurar meu hardware e contexto
- **Para que eu possa:** Copiar com um clique o comando exato do `llama-server` com as flags `-ngl` e `--cache-type-k` calculadas perfeitamente para minha máquina.

**Critérios de Aceitação:**
1. O comando deve conter o número exato de `gpuLayers` calculado pelo motor.
2. O botão de cópia deve transferir o texto para a área de transferência com confirmação visual.
