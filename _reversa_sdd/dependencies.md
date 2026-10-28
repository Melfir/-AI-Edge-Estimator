# Dependências do Sistema — ai-edge-estimator

> Gerado pelo Scout (Reversa v1.3.6) em 2026-10-28

---

## 1. Dependências de Produção (Runtime)

| Pacote | Versão Instalada | Finalidade |
|---|---|---|
| `react` | `^19.0.1` | Biblioteca base da interface reativa |
| `react-dom` | `^19.0.1` | Renderizador DOM para React |
| `vite` | `^8.3.0` | Build tool e servidor de desenvolvimento web moderno |
| `@tailwindcss/vite` | `^4.3.3` | Plugin oficial TailwindCSS 4 para Vite |
| `lucide-react` | `^0.546.0` | Conjunto de ícones SVG consistentes |
| `motion` | `^12.23.24` | Biblioteca de micro-animações fluidas e transições de abas |
| `@google/genai` | `^2.4.0` | SDK oficial do Google Gemini API |
| `express` | `^4.21.2` | Servidor Node.js opcional / runtime de utilitários |
| `dotenv` | `^17.2.3` | Carregamento de variáveis de ambiente locais |

---

## 2. Dependências de Desenvolvimento (Build & Tooling)

| Pacote | Versão | Finalidade |
|---|---|---|
| `typescript` | `^7.0.2` | Tipagem estática e compilação do TypeScript |
| `@types/react` | `^19.3.0` | Definições de tipos para React 19 |
| `@types/react-dom` | `^19.3.0` | Definições de tipos para React-DOM 19 |
| `@types/node` | `^22.14.0` | Tipagens para APIs nativas do Node.js |
| `@vitejs/plugin-react` | `^6.1.1` | Suporte a Fast Refresh e JSX do React no Vite |
| `tailwindcss` | `^4.3.3` | Framework CSS utilitário |
| `autoprefixer` | `^10.4.21` | Adição de vendor prefixes CSS automáticos |
| `esbuild` | `^0.25.0` | Bundler e minificador de ultra-alta performance |
| `tsx` | `^4.21.0` | Executor TypeScript para scripts Node sem build prévio |
| `@types/express` | `^4.17.21` | Tipagens para o Express |

---

## 3. Scripts NPM Disponíveis

- `npm run dev`: Inicializa o servidor Vite com HMR na porta 3000 (ou fallback automático).
- `npm run build`: Compila o bundle TypeScript e assets em `dist/`.
- `npm run preview`: Serve localmente a versão compilada em `dist/`.
- `npm run lint`: Executa verificação de tipos estáticos (`tsc --noEmit`).
- `npm run clean`: Remove artefatos de compilação anteriores (`dist/`).
