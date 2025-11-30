# 🚀 Deploy do Zero - Guia Completo

## Passo 1: Criar Novo Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `editei` (ou outro nome)
3. Deixe como **Private** ou **Public** (sua escolha)
4. **NÃO** inicialize com README, .gitignore ou license
5. Clique em "Create repository"

## Passo 2: Conectar Repositório Local ao Novo Repositório

```bash
# Remover o remote atual
git remote remove origin

# Adicionar o novo remote (substitua USERNAME pelo seu usuário)
git remote add origin https://github.com/USERNAME/editei.git

# Fazer push para o novo repositório
git push -u origin main
```

## Passo 3: Criar Novo Projeto no Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione o novo repositório `editei`
4. Configure:
   - **Framework Preset**: Next.js (deve detectar automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build` (deve aparecer automaticamente)
   - **Output Directory**: (deixe vazio - Next.js detecta automaticamente)
   - **Install Command**: `npm install` (deve aparecer automaticamente)

## Passo 4: Configurar Variáveis de Ambiente no Vercel

No Vercel, vá em **Settings** → **Environment Variables** e adicione:

- `DATABASE_URL` - Sua connection string do Supabase
- `NEXTAUTH_SECRET` - Uma chave secreta aleatória
- `NEXTAUTH_URL` - `https://editei.vercel.app` (ou seu domínio)
- Outras variáveis que você usa (Stripe, UploadThing, etc.)

## Passo 5: Fazer Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Teste a URL fornecida

## ✅ Checklist Antes do Deploy

- [ ] Arquivo `src/app/page.tsx` existe e está correto
- [ ] Arquivo `src/app/layout.tsx` existe e está correto
- [ ] Middleware não intercepta a rota raiz (`/`)
- [ ] Build local funciona (`npm run build`)
- [ ] Nenhum erro no build
- [ ] Todas as variáveis de ambiente configuradas no Vercel

