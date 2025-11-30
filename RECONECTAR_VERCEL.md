# 🔄 Como Reconectar o Repositório no Vercel

## Passo 1: Desconectar o Repositório no Vercel

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Vá no projeto **editei**
3. Vá em **Settings** → **Git**
4. Role até a seção **Connected Git Repository**
5. Clique em **Disconnect** ou **Disconnect Repository**
6. Confirme a desconexão

## Passo 2: Reconectar o Repositório

1. Ainda na página de **Settings** → **Git**
2. Clique em **Connect Git Repository**
3. Selecione **GitHub** (ou sua plataforma)
4. Procure pelo repositório: `agenciabaepi/editei`
5. Clique em **Import**

## Passo 3: Configurar o Projeto

Após reconectar, configure:

### Build & Development Settings:
- **Framework Preset**: Selecione **Next.js** manualmente
- **Root Directory**: `./` (raiz)
- **Build Command**: `npm run build`
- **Output Directory**: (deixe vazio - Next.js detecta automaticamente)
- **Install Command**: `npm install`

### Environment Variables:
Vá em **Settings** → **Environment Variables** e adicione/verifique:

- `DATABASE_URL` - Connection string do Supabase
- `NEXTAUTH_SECRET` - Chave secreta
- `NEXTAUTH_URL` - `https://editei.vercel.app`
- Outras variáveis que você usa

## Passo 4: Fazer o Deploy

1. Após configurar tudo, clique em **Deploy**
2. Aguarde o build completar
3. Verifique os logs do build:
   - Deve aparecer: `┌ ○ /    5.41 kB         108 kB`
   - Isso confirma que a rota raiz está sendo gerada

## Passo 5: Testar

1. Após o deploy completar, acesse a URL
2. Teste a rota raiz `/`
3. Deve funcionar agora!

## ✅ Checklist

- [ ] Repositório desconectado do Vercel
- [ ] Repositório reconectado
- [ ] Framework Preset: Next.js (definido manualmente)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: vazio
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy iniciado
- [ ] Logs mostram rota `/` sendo gerada

## 🔍 Se Ainda Não Funcionar

Se após reconectar ainda der 404:

1. Verifique os logs de build no Vercel
2. Verifique se há erros durante o build
3. Verifique se a rota `/` aparece nos logs: `┌ ○ /`
4. Se não aparecer, pode ser um problema com o Next.js no Vercel
5. Nesse caso, pode ser necessário atualizar o Next.js ou verificar a versão

