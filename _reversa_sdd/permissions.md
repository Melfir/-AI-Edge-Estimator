# Matriz de Permissões e Segurança (RBAC/ACL) — ai-edge-estimator

> Gerado pelo Detetive (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Modelo de Autorização

O projeto `ai-edge-estimator` opera como uma ferramenta puramente **Client-Side / Local Utility**.

- **Autenticação:** Inexistente por design. Não há login, cookies de sessão, OAuth ou gestão de senhas.
- **Autorização (RBAC):** Papel único universal (`Anonymous User`).
- **Privacidade de Dados:** 100% dos cálculos matemáticos de inferência, sliders e simulações são executados em memória no navegador web do usuário ou no terminal Python local. Nenhuma informação de hardware ou prompt é transmitida para servidores de telemetria.

---

## 2. Matriz de Acesso a Recursos

| Funcionalidade / Recurso | Papel: Usuário Anônimo (Web) | Papel: Operador de Terminal (CLI) | Restrição / Proteção |
|---|---|---|---|
| Selecionar Modelos e Hardwares | Permitido | Permitido | Somente leitura de presets |
| Ajustar Sliders de Contexto e Batch | Permitido | Permitido | Validação de limites numéricos |
| Visualizar Dashboard de Métricas | Permitido | Permitido | Acesso público |
| Visualizar e Baixar Script Python | Permitido | N/A | Download acionado via blob local |
| Executar Comandos de Hardware (`nvidia-smi`, `sysctl`) | **Bloqueado** (Sandbox Web do Browser) | **Permitido** (Processo do SO com permissão de usuário padrão) | O browser não tem acesso a chamadas de sistema |
| Chamadas à API Gemini (`@google/genai`) | Requer `GEMINI_API_KEY` válida | Requer variável de ambiente | Chave opcional configurada pelo operador |
