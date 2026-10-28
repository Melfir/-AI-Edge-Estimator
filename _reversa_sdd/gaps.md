# Relatório de Lacunas e Inconsistências (Gaps) — ai-edge-estimator

> Gerado pelo Revisor (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Resumo Executivo de Lacunas

- **Lacunas Críticas (Bloqueantes):** 0
- **Lacunas Moderadas (Arquiteturais):** 2
- **Lacunas Cosméticas (Melhorias de Usabilidade):** 1

---

## 2. Detalhamento por Severidade

### 🔴 Crítico (Nenhum detectado)
*Todas as 4 units de casos de uso possuem contratos operacionais completos, consistentes e bidirecionalmente rastreáveis com o código.*

---

### 🟡 Moderado

#### GAP-01: Duplicação Isomórfica de Lógica (TypeScript $\leftrightarrow$ Python)
- **Localização:** `src/lib/calculator.ts` e `public/ai_edge_estimator.py` / `src/lib/pythonGenerator.ts`
- **Descrição:** O motor de cálculo de tensores, quantização de KV-cache e estimativa de vazão foi reimplementado em duas linguagens diferentes.
- **Risco:** Evoluções futuras no algoritmo TypeScript (ex: novas heurísticas de ativação ou suporte a MoE) podem esquecer de ser replicadas no script Python standalone, gerando divergência de resultados entre a Web e o terminal.
- **Sugestão de Resolução:** Criar um script de teste de paridade ou automatizar a geração do parser Python a partir de uma especificação unificada em JSON.

#### GAP-02: Ausência de Testes Automatizados no Legado
- **Localização:** Projeto raiz (`package.json`)
- **Descrição:** Não existem arquivos `*.test.ts` nem runner de testes configurado (`vitest`/`jest`).
- **Risco:** Refatorações ou atualizações de dependências (`react@19`, `vite@8`) podem introduzir regressões silenciosas nas fórmulas sem detecção prévia.
- **Sugestão de Resolução:** Implementar a suíte de testes proposta nos arquivos `tasks.md` de cada unit.

---

### 🟢 Cosmético

#### GAP-03: Catálogo Estático sem Importação Dinâmica
- **Localização:** `src/lib/presets.ts`
- **Descrição:** A adição de novos modelos (ex: Llama 4 ou Gemma 3) exige edição direta do arquivo TypeScript e rebuild do projeto.
- **Sugestão de Resolução:** Permitir que o usuário adicione perfis de modelos e hardwares customizados através de upload de arquivo JSON ou formulário na interface web.
