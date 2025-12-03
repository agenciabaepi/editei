# 🎨 Sistema de Upload de Fontes - Guia de Configuração

## 📋 O que foi criado

1. **Tabela no banco de dados** para armazenar fontes customizadas
2. **API endpoints** para upload, listagem e gerenciamento de fontes
3. **Interface no admin dashboard** para gerenciar fontes
4. **Sistema de upload** de arquivos de fonte

## 🚀 Como Configurar

### 1. Executar a Migração do Banco de Dados

Execute o arquivo SQL no seu banco de dados Supabase:

```sql
-- Arquivo: migrations/add-fonts-table.sql
```

**Via Supabase Dashboard:**
1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `migrations/add-fonts-table.sql`
4. Execute a query

**Ou via terminal:**
```bash
psql [SUA_CONNECTION_STRING] < migrations/add-fonts-table.sql
```

### 2. Criar Diretório para Fontes

O sistema salvará as fontes em `public/fonts/`. O diretório será criado automaticamente, mas você pode criar manualmente:

```bash
mkdir -p public/fonts
```

### 3. Reiniciar o Servidor

Após executar a migração, reinicie o servidor:

```bash
npm run dev
```

## 📖 Como Usar

### No Admin Dashboard

1. Acesse `/admin`
2. Clique na aba **"Fontes"**
3. Preencha o formulário:
   - **Nome da Fonte**: Nome exibido (ex: "Minha Fonte Personalizada")
   - **Nome da Família**: Nome usado no CSS, sem espaços (ex: "MinhaFonte")
   - **Categoria**: Escolha a categoria (Sans Serif, Serif, Display, etc.)
   - **Arquivo**: Selecione o arquivo da fonte (.woff, .woff2, .ttf, .otf)
   - **Popular**: Marque se quiser que apareça na aba "Populares"
4. Clique em **"Enviar Fonte"**

### Gerenciar Fontes

- **Ativar/Desativar**: Use o switch "Ativa" para mostrar/ocultar a fonte
- **Marcar como Popular**: Use o switch "Popular" para destacar
- **Excluir**: Clique no botão de lixeira para remover

## 🔧 Formatos Suportados

- **WOFF** (Web Open Font Format) - Recomendado
- **WOFF2** (Web Open Font Format 2) - Mais compacto, recomendado
- **TTF** (TrueType Font)
- **OTF** (OpenType Font)

**Limite de tamanho**: 5MB por arquivo

## 📝 Próximos Passos

As fontes customizadas precisam ser integradas no `font-loader.ts` para aparecerem no editor. Isso será feito automaticamente quando você acessar o editor, carregando as fontes do banco de dados.

## ⚠️ Notas Importantes

1. **Nome da Família**: Deve ser único e sem espaços (use CamelCase)
2. **Arquivos**: As fontes são salvas em `public/fonts/`
3. **Performance**: Fontes grandes podem afetar o carregamento
4. **Compatibilidade**: WOFF2 tem melhor suporte em navegadores modernos

## 🐛 Troubleshooting

**Erro ao fazer upload:**
- Verifique se o arquivo é menor que 5MB
- Confirme que o formato é suportado
- Verifique se o nome da família é único

**Fonte não aparece no editor:**
- Certifique-se de que a fonte está marcada como "Ativa"
- Verifique se o `font-loader.ts` está carregando fontes do banco (próxima etapa)


