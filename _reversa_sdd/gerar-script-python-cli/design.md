# Caso de Uso: Gerar Script Python CLI, Design Técnico

> Especificação de Design Técnico (`design.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Interface de Síntese

```typescript
function generatePythonScript(
  currentModel?: ModelProfile,
  currentHardware?: HardwareProfile,
  currentQuant?: QuantProfile,
  currentParams?: InferenceParams
): string
```

---

## 2. Arquitetura do Script Gerado (`ai_edge_estimator.py`)

1. **Módulo de Hardware Probing:**
   - `detect_nvidia_gpu()`: invoca `nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader,nounits`.
   - `detect_apple_silicon()`: invoca `sysctl -n hw.memsize` e consulta `platform.processor()`.
   - `detect_linux_ram()`: lê `/proc/meminfo` procurando `MemTotal` e `MemAvailable`.
2. **Dataclasses do Domínio:**
   - `@dataclass ModelSpec`: parâmetros estruturais dos LLMs embutidos no CLI.
   - `@dataclass HardwareSpec`: especificações da máquina.
   - `@dataclass QuantizationSpec`: dados dos formatos de quantização.
3. **Função Analítica em Python:**
   - Replicação exata da lógica de `src/lib/calculator.ts` em Python puro com operadores aritméticos padrão.
4. **Interface CLI via `argparse`:**
   - Suporte aos argumentos `--model`, `--quant`, `--context`, `--batch`, `--kv-quant`, `--auto-detect`, `--list-models`, `--list-hardware`.

---

## 3. Dependências
- `src/components/PythonScriptView.tsx`: Consome a string gerada e cuida da renderização com highlight e download acionado via `URL.createObjectURL(blob)`.
