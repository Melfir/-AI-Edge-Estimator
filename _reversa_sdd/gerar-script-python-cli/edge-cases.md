# Caso de Uso: Gerar Script Python CLI, Casos de Borda (Edge Cases)

> Especificação de Casos de Borda (`edge-cases.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Falha ou Ausência do Utilitário `nvidia-smi`
- **Cenário:** Script executado com `--auto-detect` em máquina Linux ou Windows com GPU integrada Intel ou placa AMD, ou onde os drivers Nvidia não estão instalados no PATH.
- **Comportamento no Código:** A chamada `subprocess.check_output(['nvidia-smi', ...])` é envolvida em bloco `try ... except (FileNotFoundError, subprocess.CalledProcessError)`. Em caso de falha, o script faz fallback silencioso para detecção de CPU/RAM física via `os` ou `/proc/meminfo`.
- **Evidência:** `public/ai_edge_estimator.py:135`

---

## 2. Terminal sem Suporte a Cores ANSI (Windows cmd.exe legado / CI/CD)
- **Cenário:** O script roda redirecionado para um arquivo de texto (`python ai_edge_estimator.py > log.txt`) ou em terminais legados.
- **Comportamento no Código:** O script verifica se a saída é um TTY via `sys.stdout.isatty()`. Se não for TTY, as sequências de escape ANSI são desativadas para evitar poluição de caracteres de controle.
- **Evidência:** `public/ai_edge_estimator.py:45`
