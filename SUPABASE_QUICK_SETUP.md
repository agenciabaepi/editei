# ⚡ Configuração Rápida do Supabase

## 📋 Informações do Seu Projeto

- **URL do Projeto**: `https://hmapxmbfhblrfjoweoed.supabase.co`
- **Project Ref**: `hmapxmbfhblrfjoweoed`

## 🔑 Passo 1: Encontrar a Connection String do Banco

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** (⚙️) → **Database**
4. Role até a seção **Connection string**
5. Selecione **URI** no dropdown
6. Você verá algo como:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
   OU
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[ref].supabase.co:5432/postgres
   ```

7. **Copie essa string completa** (ela contém a senha do banco que você criou)

## 🔧 Passo 2: Atualizar .env.local

Atualize a linha `DATABASE_URL` no arquivo `.env.local` com a connection string que você copiou.

**Exemplo:**
```env
DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

⚠️ **Importante**: Substitua `[SUA-SENHA]` pela senha real do banco de dados que você criou ao criar o projeto.

## 📝 Passo 3: Executar o Script SQL

Você tem duas opções:

### Opção A: Via SQL Editor do Supabase (Recomendado)

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Abra o arquivo `database-setup.sql` do projeto
4. Copie TODO o conteúdo e cole no SQL Editor
5. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)
6. Você deve ver: "Database setup completed successfully!"

### Opção B: Via Terminal (se tiver psql instalado)

```bash
psql "postgresql://postgres:[SUA-SENHA]@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres" \
  --set ON_ERROR_STOP=1 \
  -f database-setup.sql
```

## ✅ Passo 4: Verificar

1. No Supabase, vá em **Table Editor**
2. Você deve ver as tabelas criadas:
   - ✅ `users`
   - ✅ `sessions`
   - ✅ `projects`
   - ✅ `subscriptions`
   - ✅ `images`

## 🚀 Passo 5: Testar

Reinicie o servidor:

```bash
npm run dev
```

Agora você pode:
- Acessar http://localhost:3000
- Criar uma conta em `/sign-up`
- Fazer login com o admin: `admin@admin.com` / `admin123`

## 🔐 Credenciais de Admin

Após executar o script, você terá:
- **Email**: `admin@admin.com`
- **Senha**: `admin123`

⚠️ Altere essa senha em produção!

## 💡 Dica

Se você esqueceu a senha do banco de dados:
1. Vá em **Settings** → **Database**
2. Role até **Database password**
3. Clique em **Reset database password**
4. Uma nova senha será gerada
5. Atualize o `.env.local` com a nova senha

