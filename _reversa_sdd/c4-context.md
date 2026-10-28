# Diagrama C4 — Contexto (Nível 1)

> Gerado pelo Arquiteto (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

```mermaid
C4Context
    title Diagrama de Contexto de Sistema — AI Edge Estimator

    Person(user, "Engenheiro de IA / Desenvolvedor", "Profissional que necessita planejar o dimensionamento e a viabilidade de modelos LLM em hardware local.")
    
    System(ai_edge_estimator, "AI Edge Estimator", "Sistema analítico que calcula a pegada de VRAM/RAM, KV-cache, taxa de geração de tokens/s e particionamento de camadas.")
    
    System_Ext(inference_runners, "Runtimes Locais (Llama.cpp, Ollama, vLLM)", "Motores externos de inferência instalados na máquina do usuário que recebem as receitas e parâmetros calculados.")
    System_Ext(gemini_api, "Google Gemini API (Opcional)", "API em nuvem acessível opcionalmente via SDK @google/genai para suporte inteligente.")
    
    Rel(user, ai_edge_estimator, "Interage via interface Web (SPA) ou linha de comando (CLI)", "HTTP / Terminal")
    Rel(ai_edge_estimator, inference_runners, "Gera scripts e linhas de comando otimizadas com flags (--n-gpu-layers, etc.)", "CLI flags / Shell script")
    Rel(ai_edge_estimator, gemini_api, "Consultas pontuais autenticadas", "REST / HTTPS")
```
