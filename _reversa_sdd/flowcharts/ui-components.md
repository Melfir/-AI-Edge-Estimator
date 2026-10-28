# Fluxograma — Módulo UI Components (Reatividade React)

> Gerado pelo Arqueólogo (Reversa v1.3.6) em 2026-10-28  
> Nível de Documentação: **Detalhado (3)**

```mermaid
flowchart TD
    subgraph Estado_Global [App.tsx - Estado Central]
        S1[selectedModel: ModelProfile]
        S2[selectedHardware: HardwareProfile]
        S3[selectedQuant: QuantProfile]
        S4[contextLength / batchSize / kvCacheQuant]
        S5[activeTab: 'calculator' | 'matrix' | 'python' | 'engine']
    end

    subgraph Calculo_Reativo [Hook useMemo]
        C1["calculateEdgeFeasibility(model, hardware, quant, inferenceParams)"]
    end

    subgraph Abas_e_Componentes [Renderização Dinâmica]
        T1["Tab 'calculator': ResultsDashboard + ModelSelector + HardwareSelector"]
        T2["Tab 'matrix': MatrixComparator (compara 8 hardwares ou 8 modelos)"]
        T3["Tab 'python': PythonScriptView (preview e download do script gerado)"]
        T4["Tab 'engine': EngineRecipe (comandos llama-server, ollama, vllm)"]
    end

    S1 --> C1
    S2 --> C1
    S3 --> C1
    S4 --> C1
    
    C1 --> T1
    C1 --> T2
    C1 --> T3
    C1 --> T4
```
