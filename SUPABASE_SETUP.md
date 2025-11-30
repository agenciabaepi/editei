# 🚀 Guia de Configuração do Supabase

Este projeto é totalmente compatível com Supabase! O Supabase oferece um banco de dados PostgreSQL gerenciado, perfeito para desenvolvimento e produção.

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: `canvas-clone` (ou o nome que preferir)
   - **Database Password**: Escolha uma senha forte (salve ela!)
   - **Region**: Escolha a região mais próxima
   - **Pricing Plan**: Free tier é suficiente para começar

### 2. Obter Connection String

1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Role até a seção **Connection string**
3. Selecione **URI** no dropdown
4. Copie a connection string (formato: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. Substitua `[YOUR-PASSWORD]` pela senha que você criou

### 3. Configurar Variáveis de Ambiente

Atualize o arquivo `.env.local` com a connection string do Supabase:

```env
# Database - Supabase
DATABASE_URL=postgresql://postgres.xxxxx:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Ou use a connection string direta (sem pooler):
# DATABASE_URL=postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres
```

**Nota**: O Supabase oferece duas opções de connection:
- **Direct connection** (`db.xxxxx.supabase.co:5432`): Conexão direta, melhor para desenvolvimento
- **Connection pooling** (`pooler.supabase.com:6543`): Pool de conexões, melhor para produção

### 4. Executar Script de Setup do Banco

Você pode executar o script SQL diretamente no Supabase SQL Editor:

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Copie e cole o conteúdo do arquivo `database-setup.sql`
4. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

**OU** execute via terminal (se tiver `psql` instalado):

```bash
# Usando a connection string do Supabase
psql "postgresql://postgres:[SUA-SENHA]@db.xxxxx.supabase.co:5432/postgres" \
  --set ON_ERROR_STOP=1 \
  -f database-setup.sql
```

### 5. Verificar Configuração

Após executar o script, você pode verificar se as tabelas foram criadas:

1. No Supabase, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `users`
   - `sessions`
   - `projects`
   - `subscriptions`
   - `images`

### 6. Testar a Conexão

Reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

Agora você pode:
- Criar uma conta em `/sign-up`
- Fazer login em `/sign-in`
- Acessar o dashboard em `/dashboard`

## 🔐 Credenciais de Admin

Após executar o `database-setup.sql`, você terá um usuário admin criado:

- **Email**: `admin@admin.com`
- **Senha**: `admin123`

⚠️ **Importante**: Altere a senha do admin em produção!

## 🎯 Vantagens do Supabase

✅ **Gratuito** para começar (500MB de banco, 2GB de bandwidth)  
✅ **PostgreSQL completo** - 100% compatível  
✅ **Interface visual** para gerenciar dados  
✅ **Backups automáticos**  
✅ **SSL habilitado** por padrão  
✅ **Escalável** - fácil upgrade quando necessário  
✅ **API REST automática** (opcional, não usamos neste projeto)  
✅ **Real-time subscriptions** (pode ser útil para colaboração futura)  

## 🔧 Troubleshooting

### Erro: "SSL connection required"
- Certifique-se de que a connection string está correta
- O código já detecta automaticamente Supabase e habilita SSL

### Erro: "Connection timeout"
- Verifique se o IP do seu servidor está na whitelist do Supabase
- No Supabase: **Settings** → **Database** → **Connection pooling** → **Allowed IPs**

### Erro: "Password authentication failed"
- Verifique se a senha na connection string está correta
- Você pode resetar a senha em **Settings** → **Database** → **Reset database password**

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase PostgreSQL Guide](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

## 🚀 Próximos Passos (Opcional)

Você pode aproveitar outros recursos do Supabase:

1. **Storage**: Para armazenar imagens e arquivos
2. **Auth**: Substituir autenticação custom por Supabase Auth
3. **Realtime**: Para colaboração em tempo real
4. **Edge Functions**: Para lógica serverless

Mas por enquanto, apenas o banco de dados já é suficiente! 🎉

