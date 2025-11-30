# 📝 Como Adicionar Mais Fontes ao Editei

## 📍 Localização

O arquivo principal onde você adiciona fontes é:
```
src/features/editor/utils/font-loader.ts
```

## 🔧 Como Adicionar

Edite o array `PROFESSIONAL_FONTS` no arquivo `font-loader.ts`.

### Estrutura de uma Fonte

Cada fonte precisa ter esta estrutura:

```typescript
{
  name: 'Nome da Fonte',           // Nome exato da fonte
  category: 'sans-serif',          // Categoria: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace' | 'system'
  weights: [400, 500, 700],        // Pesos disponíveis (300, 400, 500, 600, 700, 800, 900)
  fallback: 'Nome, Arial, sans-serif',  // Fontes de fallback
  googleFont: true,                // true se for Google Font, false se for fonte do sistema
  preload: false,                  // true para pré-carregar (apenas fontes muito usadas)
  popular: false                    // true para aparecer na aba "Populares"
}
```

## 📚 Exemplos

### Google Font (Mais Comum)

```typescript
{ 
  name: 'DM Sans', 
  category: 'sans-serif', 
  weights: [400, 500, 700], 
  fallback: 'DM Sans, Arial, sans-serif', 
  googleFont: true,
  popular: true 
}
```

### Fonte do Sistema (Já instalada no computador)

```typescript
{ 
  name: 'Arial', 
  category: 'sans-serif', 
  weights: [400, 700], 
  fallback: 'Arial, sans-serif',
  // Não precisa de googleFont, preload ou popular
}
```

## 🎨 Categorias Disponíveis

- **`sans-serif`**: Fontes sem serifa (Arial, Helvetica, Roboto, etc.)
- **`serif`**: Fontes com serifa (Times New Roman, Georgia, etc.)
- **`display`**: Fontes para títulos e chamadas (Oswald, Bebas Neue, etc.)
- **`handwriting`**: Fontes manuscritas (Dancing Script, Caveat, etc.)
- **`monospace`**: Fontes monoespaçadas (Courier, Source Code Pro, etc.)
- **`system`**: Fontes do sistema

## ✅ Fontes Adicionadas Recentemente

Adicionei estas fontes populares como exemplo:
- DM Sans
- Manrope
- Space Grotesk
- Outfit
- Sora
- Plus Jakarta Sans
- Figtree
- Rubik
- Quicksand
- Comfortaa

## 🔍 Onde Encontrar Fontes

1. **Google Fonts**: https://fonts.google.com
   - Todas as fontes do Google Fonts podem ser adicionadas
   - Use o nome exato da fonte como aparece no site

2. **Fontes do Sistema**: 
   - Arial, Helvetica, Times New Roman, Georgia, etc.
   - Não precisam de `googleFont: true`

## ⚠️ Importante

1. **Nome da Fonte**: Deve ser exatamente como aparece no Google Fonts (com maiúsculas/minúsculas)
2. **Pesos**: Verifique quais pesos estão disponíveis na fonte escolhida
3. **Fallback**: Sempre inclua uma fonte de fallback caso a fonte não carregue
4. **Performance**: Marque `preload: true` apenas para fontes muito usadas (máximo 3-5)

## 🚀 Após Adicionar

1. Salve o arquivo
2. Reinicie o servidor (`npm run dev`)
3. As novas fontes aparecerão automaticamente no seletor de fontes do editor!

## 📖 Exemplo Completo

```typescript
export const PROFESSIONAL_FONTS: FontDefinition[] = [
  // ... fontes existentes ...
  
  // Sua nova fonte aqui
  { 
    name: 'Sua Fonte', 
    category: 'sans-serif', 
    weights: [400, 500, 700], 
    fallback: 'Sua Fonte, Arial, sans-serif', 
    googleFont: true,
    popular: true  // Opcional: aparece na aba "Populares"
  },
];
```

