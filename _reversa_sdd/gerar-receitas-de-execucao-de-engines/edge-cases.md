# Caso de Uso: Gerar Receitas de Execução, Casos de Borda (Edge Cases)

> Especificação de Casos de Borda (`edge-cases.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Modelo em Status OOM
- **Cenário:** O usuário abre a aba de Engine Recipes quando o modelo selecionado está em status `oom`.
- **Comportamento no Código:** A receita ainda é gerada com `-ngl 0` para fins didáticos, mas o componente exibe um aviso superior de alerta indicando que o comando provavelmente falhará com erro de CUDA Out of Memory a menos que o contexto ou a quantização sejam ajustados.
- **Evidência:** `src/components/EngineRecipe.tsx:40`

---

## 2. Permissão de Clipboard Negada pelo Navegador
- **Cenário:** O usuário clica em "Copiar", mas o navegador bloqueia a API `navigator.clipboard` (ex: execução em iframe ou contexto sem HTTPS).
- **Comportamento no Código:** A promessa rejeitada é tratada com fallback para seleção textual automática do elemento `<pre>` para que o usuário possa usar `Ctrl+C` manualmente.
- **Evidência:** `src/components/EngineRecipe.tsx:28`
