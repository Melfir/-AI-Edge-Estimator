# ADR 004: Dupla Distribuição — Interface Web Reativa e Script CLI Python Puro

- **Status:** Aceito (Retroativo)
- **Data:** 2026-10-28
- **Decisores:** Time de Engenharia do AI Edge Estimator
- **Nível de Confiança:** 🟢 CONFIRMADO

---

## Contexto

Engenheiros precisam calcular viabilidade em dois cenários distintos:
1. No navegador, explorando visualmente modelos, hardwares e comparativos antes de comprar uma máquina ou alugar uma instância.
2. Em servidores remotos headless (SSH) sem interface gráfica, onde é necessário auditar a máquina real in loco.

## Decisão

Desenvolver o sistema em dois formatos equivalentes:
1. Uma Single Page Application (SPA) em React 19 + TailwindCSS 4 com reatividade instantânea.
2. Um gerador dinâmico de script Python CLI autônomo (`public/ai_edge_estimator.py` e gerador em `src/lib/pythonGenerator.ts`), capaz de auto-detectar o hardware local via `nvidia-smi` e `sysctl`.

## Alternativas Consideradas

1. **Apenas a aplicação Web:**
   - *Descartado:* Impossibilitaria a auditoria automatizada em servidores Linux headless via terminal.
2. **Depender de bibliotecas pesadas de terceiros no script Python (`torch`, `psutil`, `transformers`):**
   - *Descartado:* Exigiria criação de venv e pip install de gigabytes antes de poder rodar o script. O script Python foi projetado para usar estritamente a biblioteca padrão do Python 3 (`subprocess`, `dataclasses`, `platform`).

## Consequências

- **Positivas:**
  - O script Python pode ser executado instantaneamente com `python ai_edge_estimator.py --auto-detect` em qualquer máquina.
  - A interface web permite exportar e customizar o script com as variáveis pré-configuradas pelo usuário.
- **Negativas:**
  - Necessidade de manter as fórmulas matemáticas sincronizadas entre o TypeScript (`src/lib/calculator.ts`) e o Python (`public/ai_edge_estimator.py`).
