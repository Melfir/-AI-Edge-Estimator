# Caso de Uso: Comparar Hardware e Modelos em Matriz Cartesiana

> Especificação de Requisitos Operacionais (`requirements.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Visão Geral

Permite a comparação simultânea em grade cruzada multidimensional de uma seleção de modelo ou hardware contra múltiplos dispositivos ou modelos alternativos, exibindo status de viabilidade, tokens/s e uso de memória em paralelo.

---

## 2. Responsabilidades

- Modo "Fixar Modelo": compara 8 hardwares representativos da indústria para o modelo e quantização selecionados.
- Modo "Fixar Hardware": compara 8 modelos de diferentes contagens de parâmetros (1B a 70B) para a máquina atual do usuário.
- Calcular em paralelo o `CalculationResult` de cada célula da grade.
- Destacar a máquina ou modelo atualmente selecionado com borda e badge distintivo.
- Permitir ao usuário clicar em qualquer card da matriz para adotá-lo imediatamente como configuração ativa no sistema.

---

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|---|---|---|---|
| RF-01 | Alternar entre visão "Comparar Hardwares" e "Comparar Modelos" | Must | Toggle reativo atualizando os 8 cards da grade |
| RF-02 | Calcular métricas de cada item com os mesmos parâmetros ativos | Must | Compartilhar `contextLength`, `batchSize` e `kvCacheQuant` |
| RF-03 | Exibir comparativo visual de tokens/s com barra de preenchimento | Should | Normalizar tamanho da barra em relação ao dispositivo mais veloz |
| RF-04 | Permitir seleção rápida por clique na matriz | Should | Ao clicar, atualizar o estado global em `App.tsx` |

---

## 4. Requisitos Não Funcionais

| Tipo | Requisito | Evidência | Confiança |
|---|---|---|---|
| Usabilidade | Layout responsivo em grid com scroll horizontal em telas estreitas | `src/components/MatrixComparator.tsx:28` | 🟢 |
| Performance | Renderização sem travamento ao recalcular 8 permutações síncronas | `src/components/MatrixComparator.tsx:42` | 🟢 |
