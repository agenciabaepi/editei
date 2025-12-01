# 🔧 Corrigir Erro de Conexão com Banco no Vercel

## ❌ Erro Atual:
```
connect ECONNREFUSED 127.0.0.1:5432
```

Isso significa que a aplicação está tentando conectar ao banco local ao invés do Supabase.

## ✅ Solução: Configurar DATABASE_URL no Vercel

### Passo 1: Obter a Connection String do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** (⚙️) → **Database**
4. Role até **Connection string**
5. Selecione **URI** no dropdown
6. Você verá algo como:
   ```
   postgresql://postgres.hmapxmbfhblrfjoweoed:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   OU
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
   ```

7. **Copie a string completa** (incluindo a senha)

### Passo 2: Configurar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto **canva**
3. Vá em **Settings** → **Environment Variables**
4. Procure por `DATABASE_URL`:
   - Se **NÃO existir**: Clique em **Add New** e adicione
   - Se **já existir**: Clique para editar
5. Cole a connection string completa do Supabase
6. **IMPORTANTE**: Selecione os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Clique em **Save**

### Passo 3: Redeploy

Após adicionar/atualizar a variável:

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Aguarde o deploy completar
5. Teste novamente

## 🔍 Verificar se Está Configurado Corretamente

A connection string deve:
- ✅ Começar com `postgresql://`
- ✅ Conter `supabase` no hostname
- ✅ Ter a senha do banco (não `[YOUR-PASSWORD]`)
- ✅ NÃO conter `127.0.0.1` ou `localhost`

**Exemplo correto:**
```
postgresql://postgres.hmapxmbfhblrfjoweoed:@Deusefiel7@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Exemplo incorreto:**
```
postgresql://postgres:senha@127.0.0.1:5432/postgres
```

## ⚠️ Se Não Lembrar a Senha do Banco

1. No Supabase: **Settings** → **Database**
2. Procure por **Database password**
3. Clique em **Reset database password**
4. **COPIE A NOVA SENHA** (você só verá ela uma vez!)
5. Use essa senha na connection string

## ✅ Após Configurar

O erro `ECONNREFUSED 127.0.0.1:5432` deve desaparecer e o login deve funcionar!

