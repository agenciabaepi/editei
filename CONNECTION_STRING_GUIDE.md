# 🔗 Como Construir a Connection String do Supabase

Se você não vê a connection string na página de Settings, podemos construí-la manualmente!

## 📋 Informações que você precisa:

1. **Project Reference**: `hmapxmbfhblrfjoweoed` (já temos)
2. **Database Password**: A senha que você definiu ao criar o projeto (ou pode resetar)

## 🔧 Formato da Connection String:

### Opção 1: Conexão Direta (Recomendada para desenvolvimento)
```
postgresql://postgres:[SENHA]@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

### Opção 2: Connection Pooling (Recomendada para produção)
```
postgresql://postgres.hmapxmbfhblrfjoweoed:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
```

## 📝 Passo a Passo:

### 1. Obter/Resetar a Senha do Banco

Na página que você está vendo (Database Settings):
- Veja o campo "Database password"
- Se você não lembra a senha, clique em **"Reset database password"**
- **COPIE A NOVA SENHA** (você só verá ela uma vez!)

### 2. Construir a Connection String

Substitua `[SENHA]` pela senha do banco:

**Para desenvolvimento (use esta):**
```
postgresql://postgres:SUA_SENHA_AQUI@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

### 3. Verificar a Região (para pooling)

Se quiser usar connection pooling, você precisa saber a região:
- Vá em **Settings** → **General** (ou **Project Settings**)
- Procure por "Region" ou "Data center location"
- Regiões comuns: `us-east-1`, `us-west-1`, `eu-west-1`, etc.

**Connection string com pooling:**
```
postgresql://postgres.hmapxmbfhblrfjoweoed:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## ✅ Exemplo Completo:

Se sua senha for `minhasenha123`, a connection string seria:

```
postgresql://postgres:minhasenha123@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

## 🎯 Onde Colocar:

Atualize o arquivo `.env.local`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.hmapxmbfhblrfjoweoed.supabase.co:5432/postgres
```

## 🔍 Alternativa: Procurar em Outro Lugar

A connection string também pode estar em:
- **Settings** → **API** (às vezes mostra connection info)
- **Settings** → **Database** → Role para baixo (pode estar mais abaixo na página)
- **Project Settings** → **Database**

Mas se não encontrar, use o formato acima que funciona perfeitamente!
