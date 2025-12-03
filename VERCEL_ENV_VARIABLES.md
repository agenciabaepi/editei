# 🔐 Variáveis de Ambiente para Vercel

## 📋 Variáveis Obrigatórias

### 1. **DATABASE_URL** (Obrigatória)
Connection string do Supabase para o banco de dados PostgreSQL.

**Como obter:**
1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Database**
4. Role até **Connection string**
5. Selecione **URI** no dropdown
6. Copie a string completa

**Formato:**
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**OU (conexão direta):**
```
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

**⚠️ Importante:** Use a connection string com **pooler** (porta 6543) para produção no Vercel.

---

### 2. **NEXT_PUBLIC_APP_URL** (Obrigatória)
URL do seu app no Vercel.

**Valor:**
```
https://seu-projeto.vercel.app
```

**Exemplo:**
```
https://canvas-clone.vercel.app
```

---

### 3. **REPLICATE_API_TOKEN** (Obrigatória para remoção de fundo)
Token de API do Replicate para funcionalidades de IA (remoção de fundo, geração de imagens).

**Como obter:**
1. Acesse https://replicate.com
2. Faça login ou crie uma conta
3. Vá em **Account Settings** → **API Tokens**
4. Crie um novo token ou copie um existente

**Valor:**
```
r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Importante:** Mantenha este token seguro e não o compartilhe publicamente.

---

## 📋 Variáveis Opcionais (mas recomendadas)

### 4. **NEXTAUTH_URL** (Recomendada)
URL base para autenticação (geralmente igual ao NEXT_PUBLIC_APP_URL).

**Valor:**
```
https://seu-projeto.vercel.app
```

---

### 4. **STRIPE_SECRET_KEY** (Se usar Stripe)
Chave secreta da API do Stripe para pagamentos.

**Onde obter:**
- Dashboard do Stripe → Developers → API keys → Secret key

---

### 5. **STRIPE_WEBHOOK_SECRET** (Se usar Stripe)
Secret do webhook do Stripe.

**Onde obter:**
- Dashboard do Stripe → Developers → Webhooks → Add endpoint → Copy signing secret

---

### 6. **STRIPE_PRICE_ID** (Se usar Stripe)
ID do preço do produto no Stripe.

**Onde obter:**
- Dashboard do Stripe → Products → Seu produto → Pricing → Copy Price ID

---

### 7. **REPLICATE_API_TOKEN** (Se usar geração de imagens com IA)
Token da API do Replicate.

**Onde obter:**
- https://replicate.com/account/api-tokens

---

### 8. **PHOTOROOM_API_KEY** (Se usar remoção de fundo)
Chave da API do PhotoRoom.

**Onde obter:**
- https://www.photoroom.com/api/

---

### 9. **UNSPLASH_ACCESS_KEY** (Se usar busca de imagens)
Chave de acesso da API do Unsplash.

**Onde obter:**
- https://unsplash.com/developers

---

## 🚀 Como Adicionar no Vercel

### Passo a Passo:

1. **Acesse o Dashboard do Vercel**
   - Vá para https://vercel.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings**
   - Clique no projeto
   - No menu lateral, clique em **Settings**

3. **Abra Environment Variables**
   - No menu Settings, clique em **Environment Variables**

4. **Adicione cada variável:**
   - Clique em **Add New**
   - **Key**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (opcional)
   - Clique em **Save**

5. **Redeploy**
   - Após adicionar todas as variáveis, vá em **Deployments**
   - Clique nos 3 pontos (...) do último deployment
   - Selecione **Redeploy**

---

## ✅ Checklist Mínimo

Para o app funcionar no Vercel, você precisa de pelo menos:

- [ ] `DATABASE_URL` - Connection string do Supabase
- [ ] `NEXT_PUBLIC_APP_URL` - URL do seu app no Vercel

---

## 🔍 Verificar se está funcionando

Após adicionar as variáveis e fazer redeploy:

1. Acesse seu app no Vercel
2. Tente fazer login/cadastro
3. Verifique os logs no Vercel:
   - Vá em **Deployments** → Clique no deployment → **Functions** → Veja os logs

Se houver erros de conexão com o banco, verifique:
- ✅ A `DATABASE_URL` está correta
- ✅ A senha está correta (sem caracteres especiais não codificados)
- ✅ Está usando a connection string com **pooler** (porta 6543)

---

## 💡 Dica

Se você já tem um arquivo `.env.local` funcionando localmente, você pode copiar as variáveis de lá para o Vercel, mas **não** inclua:
- Variáveis que começam com `NEXT_PUBLIC_` que apontam para `localhost`
- Variáveis de desenvolvimento que não devem estar em produção

