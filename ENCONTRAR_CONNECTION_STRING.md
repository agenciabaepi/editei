# 🔍 Como Encontrar a Connection String no Supabase

## 📍 Onde você está:
Você está na tela de "Vault" (Integrations). Precisamos ir para Settings.

## ✅ Passo a Passo:

### 1. Ir para Settings
- No menu lateral esquerdo, procure pelo ícone de **⚙️ Settings** (geralmente no final da lista)
- Clique nele

### 2. Ir para Database
- Dentro de Settings, procure por **"Database"** no menu
- Clique em **"Database"**

### 3. Encontrar Connection String
Na página de Database Settings, procure por uma das opções:

**Opção A: Connection string (seção visível)**
- Role a página para baixo
- Procure por uma seção chamada **"Connection string"** ou **"Connection info"**
- Deve ter um campo com texto tipo: `postgresql://...`
- Selecione **"URI"** no dropdown (se houver)
- **COPIE a string completa**

**Opção B: Connection pooling**
- Procure por **"Connection pooling"**
- Deve mostrar uma connection string com formato:
  ```
  postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```

**Opção C: Se não encontrar**
- Procure por **"Database password"** (você já viu isso antes)
- A connection string pode estar próxima a essa seção
- Ou pode estar em **"Connection info"** ou **"Database connection"**

### 4. Copiar a Connection String
- A string deve ter este formato:
  ```
  postgresql://postgres.[ALGO]:[SENHA]@[HOST]:[PORTA]/postgres
  ```
- **COPIE TUDO**, incluindo a senha que já está na string

### 5. Atualizar .env.local
- Abra o arquivo `.env.local` do projeto
- Substitua a linha `DATABASE_URL=` pela connection string que você copiou
- Salve o arquivo

## 🎯 Formato Esperado:

A connection string deve ser algo como:

```
postgresql://postgres.hmapxmbfhblrfjoweoed:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

OU

```
postgresql://postgres:SUA_SENHA@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

## ⚠️ Importante:
- A connection string JÁ CONTÉM a senha
- Não precisa substituir nada, só copiar e colar
- Se a senha tiver caracteres especiais (@, #, etc), eles já estarão codificados na string

## 🔄 Depois de Atualizar:
1. Reinicie o servidor: `npm run dev`
2. Tente criar a conta novamente
