# Caso de Uso: Gerar Receitas de Execução, Design Técnico

> Especificação de Design Técnico (`design.md`)  
> Nível de Documentação: **Detalhado (3)**

---

## 1. Interface do Componente

```typescript
interface EngineRecipeProps {
  model: ModelProfile;
  hardware: HardwareProfile;
  quant: QuantProfile;
  params: InferenceParams;
  calculation: CalculationResult;
}
```

---

## 2. Padrões de Geração de Comandos por Runner

### 1. `llama.cpp` (Server & CLI):
```bash
llama-server \
  -m ./models/${model.id}.${quant.id}.gguf \
  -c ${params.contextLength} \
  -b ${params.batchSize} \
  -ngl ${calculation.gpuLayers} \
  ${params.kvCacheQuant !== 'FP16' ? `--cache-type-k ${params.kvCacheQuant.toLowerCase()} --cache-type-v ${params.kvCacheQuant.toLowerCase()}` : ''} \
  --host 0.0.0.0 --port 8080
```

### 2. `Ollama` (Modelfile & Run):
```dockerfile
FROM ./models/${model.id}.${quant.id}.gguf
PARAMETER num_ctx ${params.contextLength}
PARAMETER num_gpu ${calculation.gpuLayers}
```

### 3. `vLLM` (Servidor OpenAI-Compatible):
```bash
python3 -m vllm.entrypoints.openai.api_server \
  --model ${model.id} \
  --gpu-memory-utilization 0.90 \
  --max-model-len ${params.contextLength} \
  ${quant.id === 'AWQ_4BIT' ? '--quantization awq' : ''}
```

---

## 3. Dependências
- `src/components/EngineRecipe.tsx`: Renderização, highlight e clipboard logic.
- `navigator.clipboard.writeText()`: API assíncrona de cópia do navegador.
