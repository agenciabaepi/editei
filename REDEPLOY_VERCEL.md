# 🔄 Como Fazer Redeploy no Vercel (Mesmo Projeto)

## Passo 1: Limpar Cache e Redeployar

1. Acesse o dashboard do Vercel: https://vercel.com/dashboard
2. Vá no projeto **editei**
3. Clique em **Deployments**
4. Encontre o último deployment
5. Clique nos **três pontos** (⋯) do deployment
6. Selecione **Redeploy**
7. **IMPORTANTE**: Desmarque a opção **"Use existing Build Cache"**
8. Clique em **Redeploy**

## Passo 2: Verificar Configurações do Projeto

Enquanto o deploy roda, verifique:

1. Vá em **Settings** → **General**
   - Framework Preset: Deve estar como **Next.js**
   - Se não estiver, defina manualmente

2. Vá em **Settings** → **Build & Development Settings**
   - Build Command: `npm run build`
   - Output Directory: (deixe vazio)
   - Install Command: `npm install`
   - Root Directory: `./`

3. Vá em **Settings** → **Environment Variables**
   - Verifique se `DATABASE_URL` está configurada
   - Verifique outras variáveis necessárias

## Passo 3: Verificar Logs do Build

1. Durante o deploy, clique no deployment
2. Veja os **Build Logs**
3. Procure por:
   - `Route (app)` - deve mostrar `┌ ○ /`
   - Erros ou warnings
   - Se o build completou com sucesso

## Passo 4: Testar

Após o deploy completar:
1. Acesse a URL do deployment
2. Teste a rota raiz `/`
3. Se ainda der 404, verifique os logs de runtime

## ✅ Checklist

- [ ] Build Command: `npm run build`
- [ ] Framework Preset: Next.js
- [ ] Output Directory: vazio (Next.js detecta automaticamente)
- [ ] Variáveis de ambiente configuradas
- [ ] Build cache desabilitado no redeploy
- [ ] Logs do build mostram rota `/` sendo gerada

