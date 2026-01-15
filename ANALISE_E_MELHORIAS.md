# 📊 Análise Completa do Projeto Oráculo

## 🎯 Visão Geral

**Oráculo** é uma aplicação Next.js para análise preditiva de dados de evasão estudantil, com visualizações interativas usando Plotly.js.

---

## 🔍 Análise Detalhada

### ✅ Pontos Positivos

1. **Arquitetura Next.js 15** - Uso de App Router e React Server Components
2. **TypeScript** - Tipagem em todo o projeto
3. **Componentes UI** - Biblioteca shadcn/ui bem estruturada
4. **Visualizações** - Gráficos interativos com Plotly.js
5. **Responsividade** - Layout adaptável com Tailwind CSS

---

## 🚨 Problemas Críticos Identificados

### 1. **Duplicação de Código** ⚠️ CRÍTICO

**Localização:** `src/app/resultados/page.tsx`

- **DecompositionChart** definido inline (linhas 45-284) + arquivo separado não usado
- **KPICard** definido inline (linhas 373-414) + arquivo separado não usado
- **ForecastChart** e **ACFChart** existem como componentes, mas código está inline

**Impacto:**
- Manutenção duplicada
- Risco de inconsistências
- Código desnecessário

**Solução:** Refatorar para usar componentes separados

---

### 2. **Arquivo Monolítico** ⚠️ ALTO

**Problema:** `page.tsx` com 897 linhas

**Impacto:**
- Difícil manutenção
- Baixa reutilização
- Testes complexos

**Solução:** Quebrar em componentes menores

---

### 3. **Gerenciamento de Estado** ⚠️ MÉDIO

**Problemas:**
- Uso excessivo de `localStorage` para dados críticos
- Sem gerenciamento de estado global
- Estados duplicados entre componentes

**Impacto:**
- Perda de dados ao limpar cache
- Sincronização complexa
- Performance degradada

**Solução:** Implementar Context API ou Zustand

---

### 4. **Tratamento de Erros** ⚠️ MÉDIO

**Problemas:**
- Erros genéricos sem contexto
- Falta de retry automático
- Sem logging estruturado
- Validação inconsistente

**Exemplo:**
```typescript
catch (error: any) {
  setError(error.message || 'Erro desconhecido');
}
```

**Solução:** Criar sistema de tratamento de erros centralizado

---

### 5. **Configuração de API** ⚠️ MÉDIO

**Problema:** URL da API hardcoded em múltiplos lugares

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
```

**Impacto:**
- Código duplicado
- Difícil manutenção
- Sem validação de URL

**Solução:** Criar cliente API centralizado

---

### 6. **TypeScript Configuração** ⚠️ BAIXO

**Problema:** `strict: false` no `tsconfig.json`

**Impacto:**
- Perda de benefícios do TypeScript
- Bugs potenciais não detectados
- Uso de `any` sem restrições

**Solução:** Habilitar strict mode gradualmente

---

### 7. **Performance** ⚠️ MÉDIO

**Problemas:**
- Componentes Plotly carregados mesmo quando não usados
- Falta de lazy loading em alguns componentes
- Re-renderizações desnecessárias

**Solução:** Otimizar imports e memoização

---

### 8. **Acessibilidade** ⚠️ BAIXO

**Problemas:**
- Falta de labels ARIA
- Navegação por teclado limitada
- Contraste de cores não verificado

**Solução:** Adicionar atributos ARIA e melhorar navegação

---

### 9. **Testes** ⚠️ CRÍTICO

**Problema:** Nenhum teste encontrado

**Impacto:**
- Regressões não detectadas
- Refatoração arriscada
- Qualidade não garantida

**Solução:** Implementar testes unitários e E2E

---

### 10. **Documentação** ⚠️ BAIXO

**Problema:** README genérico do Next.js

**Solução:** Documentar arquitetura, APIs e fluxos

---

## 📋 Sugestões de Melhorias por Prioridade

### 🔴 PRIORIDADE ALTA

#### 1. Refatorar `resultados/page.tsx`
- [ ] Extrair componentes inline para arquivos separados
- [ ] Usar `ForecastChart`, `ACFChart`, `KPICard` existentes
- [ ] Remover código duplicado
- [ ] Reduzir arquivo para ~200-300 linhas

#### 2. Criar Cliente API Centralizado
```typescript
// src/lib/api/client.ts
class ApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    if (!this.baseUrl) throw new Error('API URL não configurada');
  }
  
  async upload(file: File) { ... }
  async getFileDetails(fileId: string) { ... }
  async analyze(payload: AnalysisPayload) { ... }
}
```

#### 3. Implementar Gerenciamento de Estado
```typescript
// src/contexts/AnalysisContext.tsx
// ou usar Zustand para estado global
```

#### 4. Sistema de Tratamento de Erros
```typescript
// src/lib/errors/ErrorHandler.ts
// src/lib/errors/ErrorBoundary.tsx
```

---

### 🟡 PRIORIDADE MÉDIA

#### 5. Otimizar Performance
- [ ] Lazy loading de componentes pesados
- [ ] Code splitting por rota
- [ ] Memoização adequada
- [ ] Virtualização de listas grandes

#### 6. Melhorar TypeScript
- [ ] Habilitar `strict: true` gradualmente
- [ ] Remover todos os `any`
- [ ] Criar tipos compartilhados
- [ ] Validar tipos em runtime (Zod)

#### 7. Adicionar Validação
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const FileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 16 * 1024 * 1024, 'Arquivo muito grande')
    .refine(f => f.name.endsWith('.csv'), 'Apenas CSV')
});
```

#### 8. Melhorar UX
- [ ] Loading states mais informativos
- [ ] Feedback visual melhor
- [ ] Animações suaves
- [ ] Mensagens de erro mais claras

---

### 🟢 PRIORIDADE BAIXA

#### 9. Testes
- [ ] Setup Jest + React Testing Library
- [ ] Testes unitários de componentes
- [ ] Testes de integração de fluxos
- [ ] Testes E2E com Playwright

#### 10. Documentação
- [ ] README completo
- [ ] Documentação de componentes
- [ ] Guia de contribuição
- [ ] Diagramas de arquitetura

#### 11. Acessibilidade
- [ ] Audit com axe-core
- [ ] Navegação por teclado
- [ ] Screen reader support
- [ ] Contraste WCAG AA

#### 12. CI/CD
- [ ] GitHub Actions
- [ ] Linting automático
- [ ] Testes automáticos
- [ ] Deploy automático

---

## 🏗️ Estrutura Sugerida

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Upload (refatorado)
│   ├── ajustes/
│   │   └── [fileId]/
│   │       └── page.tsx   # Ajustes (refatorado)
│   └── resultados/
│       ├── page.tsx       # Resultados (simplificado)
│       └── components/    # Componentes específicos
│
├── components/            # Componentes reutilizáveis
│   ├── ui/               # shadcn/ui
│   ├── charts/           # Componentes de gráficos
│   │   ├── ForecastChart.tsx
│   │   ├── ACFChart.tsx
│   │   ├── PACFChart.tsx
│   │   └── DecompositionChart.tsx
│   └── layout/           # Layout components
│
├── lib/                  # Utilitários e lógica
│   ├── api/             # Cliente API
│   │   └── client.ts
│   ├── hooks/           # Custom hooks
│   │   ├── useAnalysis.ts
│   │   └── useFileUpload.ts
│   ├── utils/           # Funções utilitárias
│   ├── validation/      # Schemas de validação
│   └── errors/          # Tratamento de erros
│
├── contexts/            # React Contexts
│   └── AnalysisContext.tsx
│
├── types/               # TypeScript types
│   └── index.ts
│
└── constants/           # Constantes
    └── config.ts
```

---

## 🔧 Melhorias Técnicas Específicas

### 1. Cliente API com Retry e Cache

```typescript
// src/lib/api/client.ts
export class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(error.message || 'Erro na requisição', response.status);
    }
    
    return response.json();
  }
}
```

### 2. Custom Hooks

```typescript
// src/lib/hooks/useAnalysis.ts
export function useAnalysis() {
  const [data, setData] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const analyze = useCallback(async (payload: AnalysisPayload) => {
    // Lógica centralizada
  }, []);
  
  return { data, loading, error, analyze };
}
```

### 3. Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  // Implementar tratamento de erros React
}
```

### 4. Validação com Zod

```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod';

export const AnalysisPayloadSchema = z.object({
  params: z.object({
    selectedUnidades: z.array(z.string()).min(1),
    selectedSemestre: z.string().min(1),
  }),
  data: z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
  }),
});
```

---

## 📊 Métricas Atuais vs. Esperadas

| Métrica | Atual | Esperado | Melhoria |
|---------|-------|----------|----------|
| Linhas em `resultados/page.tsx` | 897 | 200-300 | -70% |
| Componentes duplicados | 4 | 0 | -100% |
| Cobertura de testes | 0% | 80%+ | +80% |
| TypeScript strict | false | true | +100% |
| Arquivos de configuração | 0 | 3+ | +3 |
| Documentação | Básica | Completa | +100% |

---

## 🎯 Plano de Ação Recomendado

### Semana 1: Refatoração Crítica
1. ✅ Criar cliente API centralizado
2. ✅ Refatorar `resultados/page.tsx`
3. ✅ Remover duplicações

### Semana 2: Estado e Erros
1. ✅ Implementar Context API
2. ✅ Sistema de tratamento de erros
3. ✅ Validação com Zod

### Semana 3: Qualidade
1. ✅ Habilitar TypeScript strict
2. ✅ Adicionar testes básicos
3. ✅ Melhorar documentação

### Semana 4: Otimização
1. ✅ Performance optimization
2. ✅ Acessibilidade
3. ✅ CI/CD setup

---

## 📝 Notas Finais

Este projeto tem uma base sólida, mas precisa de refatoração para escalabilidade e manutenibilidade. As melhorias sugeridas seguem as melhores práticas do ecossistema React/Next.js e melhorarão significativamente a qualidade do código.

**Próximos Passos:**
1. Revisar e priorizar melhorias
2. Criar issues no GitHub para tracking
3. Implementar melhorias gradualmente
4. Documentar mudanças

---

**Data da Análise:** 2025-01-27
**Versão Analisada:** 0.1.0
