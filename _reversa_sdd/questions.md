# Perguntas para Validação Humana — ai-edge-estimator

> Gerado pelo Revisor (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## Questões Estratégicas para o Product Owner / Engenharia:

### Q-01: Paridade Contínua de Algoritmos entre Web e CLI
- **Contexto:** Atualmente o código em Python replica fielmente o TypeScript.
- **Pergunta:** Você deseja unificar a fonte da verdade criando um schema JSON compartilhado de onde ambos os códigos derivam suas regras, ou manter a duplicação controlada via suíte de testes de paridade?

### Q-02: Suporte Futuro a MoE (Mixture of Experts)
- **Contexto:** Modelos como Mixtral 8x7B ou DeepSeek V3 possuem contagem total de parâmetros alta, mas ativam apenas uma fração dos pesos por token (ex: 37B ativos de 671B totais).
- **Pergunta:** Para o cálculo de tokens por segundo em MoE, o sistema deve considerar a banda consumida pelo modelo inteiro em VRAM ou apenas pelos parâmetros ativados na camada de roteamento?

### Q-03: Rastreamento Opcional de Telemetria
- **Contexto:** O projeto opera com zero telemetria e 100% dos dados ficam no cliente.
- **Pergunta:** Esse princípio deve permanecer rígido como compromisso de privacidade para sempre, mesmo se forem adicionadas opções de compartilhamento de benchmarks?
