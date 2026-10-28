# Diagrama C4 — Containers (Nível 2)

> Gerado pelo Arquiteto (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

```mermaid
C4Container
    title Diagrama de Containers — AI Edge Estimator

    Person(user, "Usuário", "Desenvolvedor ou Engenheiro de IA")

    System_Boundary(c1, "AI Edge Estimator System") {
        Container(web_app, "Single Page Application (SPA)", "React 19, TypeScript, TailwindCSS 4, Vite", "Interface gráfica rica com sliders de contexto, dashboard de memória e matriz comparativa.")
        Container(cli_tool, "Python Standalone CLI", "Python 3 Standard Library", "Ferramenta de terminal autônoma com rotinas de auto-detecção de hardware do sistema operacional.")
        Container(presets_db, "Catálogo de Presets em Memória", "TypeScript Data Modules", "Especificações estáticas de dezenas de GPUs, Apple Silicon SoCs, modelos LLM e tabelas de quantização.")
        Container(calc_engine, "Motor Matemático de Inferência", "Pure TypeScript / Pure Python", "Implementação de equações de tensores, GQA KV-Cache, offload de layers e modelo de vazão por largura de banda.")
    }

    Rel(user, web_app, "Usa no navegador", "HTTPS / Localhost")
    Rel(user, cli_tool, "Executa via terminal", "CLI args / STDIN")
    Rel(web_app, calc_engine, "Invoca a cada mudança de estado reativo", "Função em memória")
    Rel(web_app, presets_db, "Lê modelos e hardware padrão", "Imports estáticos")
    Rel(cli_tool, calc_engine, "Executa lógica analítica", "Funções embutidas")
```
