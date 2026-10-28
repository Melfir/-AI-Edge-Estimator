# Caso de Uso: Gerar Script Python CLI Autônomo

> Especificação de Requisitos Operacionais (`requirements.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Visão Geral

Permite ao desenvolvedor exportar e executar offline toda a inteligência e modelos de cálculo do AI Edge Estimator como um script autônomo em Python 3 puro, capaz de sondar o hardware da máquina em tempo de execução via chamadas de sistema.

---

## 2. Responsabilidades

- Sintetizar dinamicamente o código Python com os parâmetros atuais da UI como valores default.
- Incluir no script rotinas de auto-detecção para Linux, macOS e Windows (`nvidia-smi`, `sysctl`, `/proc/meminfo`).
- Suportar execução via linha de comando com flags (`--model`, `--quant`, `--context`, `--auto-detect`).
- Exibir relatório formatado com cores ANSI no terminal.
- Disponibilizar botão de cópia com um clique e download do arquivo `.py` na UI.

---

## 3. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|---|---|---|---|
| RF-01 | Gerar código Python sintaticamente válido | Must | `python3 -m py_compile` sem erros |
| RF-02 | Não exigir dependências de terceiros no Python | Must | Funcionar estritamente com a standard library |
| RF-03 | Auto-detectar GPUs Nvidia via `nvidia-smi` | Should | Extrair VRAM livre e modelo da placa |
| RF-04 | Auto-detectar Apple Silicon via `sysctl` | Should | Identificar total de memória unificada no macOS |
| RF-05 | Fornecer syntax highlighting e botão de download na Web | Should | Componente `PythonScriptView` funcional |
