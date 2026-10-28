# Fluxograma — Módulo Python Generator & CLI

> Gerado pelo Arqueólogo (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

```mermaid
flowchart TD
    StartCLI[Execução do Script CLI ou Geração na UI] --> CheckMode{Modo de Execução}
    
    CheckMode -- Auto-Detect --> ProbeOS{Detecção de Sistema Operacional}
    ProbeOS -- Linux/Windows com GPU --> ProbeNvidia[Executar nvidia-smi\nExtrair VRAM livre e nome da GPU]
    ProbeOS -- macOS Apple Silicon --> ProbeApple[Executar sysctl -n hw.memsize\nIdentificar chip e RAM unificada]
    ProbeOS -- CPU / Generic --> ProbeCPU[Ler /proc/meminfo ou psutil\nExtrair RAM física livre]
    
    ProbeNvidia --> BuildHardware[Montar Perfil de Hardware Detectado]
    ProbeApple --> BuildHardware
    ProbeCPU --> BuildHardware
    
    CheckMode -- Manual / Argumentos CLI --> ParseArgs[Receber --model, --quant, --context, --batch]
    
    BuildHardware --> RunMath[Executar Lógica de Feasibility em Python]
    ParseArgs --> RunMath
    
    RunMath --> FormattedOutput[Imprimir Relatório com Cores ANSI no Terminal]
    FormattedOutput --> GenRunnerCommand[Exibir Comando Otimizado para Llama.cpp / Ollama]
    GenRunnerCommand --> EndCLI([Fim da Execução CLI])
```
