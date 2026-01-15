# ✅ Checklist de Melhorias - Projeto Oráculo

Use este checklist para acompanhar o progresso das melhorias sugeridas.

---

## 🔴 PRIORIDADE ALTA

### 1. Refatoração de Código

- [ ] **Criar cliente API centralizado**
  - [ ] Criar `src/lib/api/client.ts`
  - [ ] Mover lógica de fetch para o cliente
  - [ ] Adicionar tratamento de erros
  - [ ] Substituir chamadas diretas de fetch

- [ ] **Refatorar `resultados/page.tsx`**
  - [ ] Extrair `DecompositionChart` inline → usar componente separado
  - [ ] Extrair `KPICard` inline → usar componente separado
  - [ ] Extrair gráfico de previsão → usar `ForecastChart`
  - [ ] Extrair gráfico ACF → usar `ACFChart`
  - [ ] Reduzir arquivo para < 300 linhas
  - [ ] Testar funcionalidade após refatoração

- [ ] **Remover código duplicado**
  - [ ] Verificar todos os componentes duplicados
  - [ ] Manter apenas uma versão de cada
  - [ ] Atualizar imports
  - [ ] Remover arquivos não utilizados

- [ ] **Limpar componentes não usados**
  - [ ] Verificar `DecompositionChart.tsx` (parece ser demo)
  - [ ] Remover ou integrar componente demo
  - [ ] Limpar imports não utilizados

### 2. Gerenciamento de Estado

- [ ] **Implementar Context API ou Zustand**
  - [ ] Criar `AnalysisContext` ou store Zustand
  - [ ] Mover estado de `localStorage` para Context
  - [ ] Adicionar persistência opcional
  - [ ] Atualizar componentes para usar Context

### 3. Tratamento de Erros

- [ ] **Criar sistema de erros**
  - [ ] Criar `src/lib/errors/ErrorHandler.ts`
  - [ ] Criar `src/components/ErrorBoundary.tsx`
  - [ ] Adicionar logging estruturado
  - [ ] Implementar retry automático
  - [ ] Adicionar mensagens de erro mais claras

### 4. Testes

- [ ] **Setup de testes**
  - [ ] Instalar Jest + React Testing Library
  - [ ] Configurar `jest.config.js`
  - [ ] Criar testes para componentes principais
  - [ ] Criar testes para hooks customizados
  - [ ] Adicionar testes E2E (Playwright)

---

## 🟡 PRIORIDADE MÉDIA

### 5. TypeScript

- [ ] **Habilitar strict mode**
  - [ ] Mudar `strict: false` → `true` no `tsconfig.json`
  - [ ] Corrigir erros de tipo gradualmente
  - [ ] Remover todos os `any`
  - [ ] Adicionar tipos para props de componentes
  - [ ] Criar tipos compartilhados em `src/types/`

### 6. Validação

- [ ] **Implementar validação com Zod**
  - [ ] Instalar `zod`
  - [ ] Criar schemas de validação
  - [ ] Validar upload de arquivo
  - [ ] Validar payload de análise
  - [ ] Adicionar validação em formulários

### 7. Performance

- [ ] **Otimizações**
  - [ ] Lazy loading de componentes Plotly
  - [ ] Code splitting por rota
  - [ ] Memoização adequada com `useMemo` e `useCallback`
  - [ ] Virtualização de listas grandes (se necessário)
  - [ ] Otimizar re-renderizações

### 8. Custom Hooks

- [ ] **Extrair lógica para hooks**
  - [ ] Criar `useFileUpload` hook
  - [ ] Criar `useAnalysis` hook
  - [ ] Criar `useFileDetails` hook
  - [ ] Refatorar componentes para usar hooks

---

## 🟢 PRIORIDADE BAIXA

### 9. Documentação

- [ ] **Melhorar documentação**
  - [ ] Atualizar README.md com instruções completas
  - [ ] Documentar arquitetura do projeto
  - [ ] Adicionar JSDoc nos componentes principais
  - [ ] Criar guia de contribuição
  - [ ] Adicionar diagramas de fluxo

### 10. Acessibilidade

- [ ] **Melhorar acessibilidade**
  - [ ] Adicionar labels ARIA
  - [ ] Melhorar navegação por teclado
  - [ ] Verificar contraste de cores (WCAG AA)
  - [ ] Testar com screen reader
  - [ ] Adicionar atributos `alt` em imagens

### 11. UX/UI

- [ ] **Melhorias de interface**
  - [ ] Loading states mais informativos
  - [ ] Feedback visual melhor
  - [ ] Animações suaves
  - [ ] Mensagens de erro mais claras
  - [ ] Tooltips e ajuda contextual

### 12. CI/CD

- [ ] **Automação**
  - [ ] Configurar GitHub Actions
  - [ ] Linting automático
  - [ ] Testes automáticos
  - [ ] Build automático
  - [ ] Deploy automático (opcional)

---

## 📝 Notas de Implementação

### Ordem Recomendada

1. **Semana 1:** Itens de Prioridade Alta (1-4)
2. **Semana 2:** Itens de Prioridade Média (5-8)
3. **Semana 3:** Itens de Prioridade Baixa (9-12)

### Dicas

- ✅ Marque cada item como concluído após implementação
- ✅ Teste cada mudança antes de prosseguir
- ✅ Faça commits pequenos e frequentes
- ✅ Documente decisões importantes
- ✅ Revise código antes de merge

---

## 📊 Progresso Geral

**Concluído:** 0 / 48 itens (0%)

**Por Prioridade:**
- 🔴 Alta: 0 / 16 (0%)
- 🟡 Média: 0 / 16 (0%)
- 🟢 Baixa: 0 / 16 (0%)

---

**Última atualização:** 2025-01-27
