# 🔍 Verificar Status do Projeto Supabase

## ❌ Problema Atual:
O erro "ENOTFOUND" significa que o hostname não está sendo resolvido.
Isso geralmente acontece quando o projeto está **pausado** no Supabase.

## ✅ O que fazer:

### 1. Verificar Status do Projeto
1. Acesse: https://supabase.com/dashboard/project/hmapxmbfhblrfjoweoed
2. Veja se há alguma mensagem sobre o projeto estar pausado
3. Procure por um botão "Resume" ou "Restore"

### 2. Se o Projeto Estiver Pausado
- Clique em **"Resume"** ou **"Restore"**
- Aguarde alguns minutos para o projeto reiniciar
- Depois teste novamente

### 3. Verificar Connection String
No Supabase:
1. Vá em **Settings** → **Database**
2. Procure por **"Connection string"** ou **"Connection info"**
3. Verifique se o hostname está correto
4. Pode ser que o formato tenha mudado

### 4. Alternativa: Usar Connection Pooling
Se a conexão direta não funcionar, tente o formato de pooling:
- No Supabase: Settings → Database → Connection pooling
- Copie a connection string de lá

## 🎯 Próximos Passos:
1. Verifique se o projeto está ativo no dashboard
2. Se estiver pausado, restaure-o
3. Depois me avise e testamos novamente
