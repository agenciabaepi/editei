# 🆕 Conectar Novo Projeto "canva" no Vercel

## Passo 1: Conectar o Repositório

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Você já criou o projeto **canva**
3. Agora precisa conectar o repositório:
   - Clique no projeto **canva**
   - Vá em **Settings** → **Git**
   - Clique em **Connect Git Repository**
   - Selecione **GitHub**
   - Procure pelo repositório: `agenciabaepi/editei`
   - Clique em **Import**

## Passo 2: Configurar o Projeto (IMPORTANTE!)

Após conectar, configure manualmente:

### Settings → General
- **Project Name**: `canva` (ou deixe como está)
- **Framework Preset**: Selecione **Next.js** manualmente (não deixe em "Auto")

### Settings → Build & Development Settings
- **Framework Preset**: **Next.js**
- **Build Command**: `npm run build`
- **Output Directory**: (deixe vazio - Next.js detecta automaticamente)
- **Install Command**: `npm install`
- **Root Directory**: `./` (raiz do projeto)

### Settings → Environment Variables
Adicione todas as variáveis necessárias:

- `DATABASE_URL` - Connection string do Supabase
- `NEXTAUTH_SECRET` - Chave secreta aleatória
- `NEXTAUTH_URL` - `https://canva.vercel.app` (ou a URL que o Vercel gerar)
- Outras variáveis que você usa (Stripe, UploadThing, etc.)

## Passo 3: Fazer o Deploy

1. Após configurar tudo, o Vercel deve iniciar o deploy automaticamente
2. Se não iniciar, vá em **Deployments** e clique em **Redeploy**
3. Aguarde o build completar

## Passo 4: Verificar os Logs

Durante o build, verifique os logs:

1. Clique no deployment em andamento
2. Veja os **Build Logs**
3. Procure por:
   ```
   Route (app)                              Size     First Load JS
   ┌ ○ /                                    185 B          94.5 kB
   ```
   - Se aparecer `┌ ○ /`, a rota raiz está sendo gerada corretamente!

## Passo 5: Testar

Após o deploy completar:
1. Acesse a URL fornecida pelo Vercel (ex: `https://canva.vercel.app`)
2. Teste a rota raiz `/`
3. Deve funcionar agora! 🎉

## ✅ Checklist

- [ ] Repositório conectado ao projeto "canva"
- [ ] Framework Preset: **Next.js** (definido manualmente)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: vazio
- [ ] Root Directory: `./`
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy iniciado
- [ ] Logs mostram rota `/` sendo gerada
- [ ] Site funcionando na URL do Vercel

## 🔍 Se Ainda Não Funcionar

Se após tudo isso ainda der 404:

1. Verifique os logs de build completos
2. Verifique se há erros durante o build
3. Verifique se a rota `/` aparece nos logs: `┌ ○ /`
4. Se não aparecer, pode ser um problema com a versão do Next.js
5. Nesse caso, podemos tentar atualizar o Next.js ou verificar outras configurações

## 📝 Nota

O código atual está usando um Server Component simples na rota raiz (sem "use client"). Isso deve funcionar perfeitamente no Vercel. Se funcionar, podemos restaurar o conteúdo completo da landing page gradualmente.

