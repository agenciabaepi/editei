# 🚀 Como Executar o Script SQL no Supabase

## 📍 Onde você está agora:
Você está na tela de "Postgres Modules" (Extensões). Isso é útil, mas não é onde executamos o script.

## ✅ O que fazer:

### 1. Ir para o SQL Editor
- No menu lateral esquerdo, procure por **"SQL Editor"** ou **"SQL"**
- Clique nele
- Você verá uma interface para escrever e executar queries SQL

### 2. Criar uma Nova Query
- Clique no botão **"New query"** ou **"+"**
- Uma nova aba/área de edição será aberta

### 3. Copiar o Script
- Abra o arquivo `database-setup.sql` do projeto
- Selecione TODO o conteúdo (Cmd/Ctrl + A)
- Copie (Cmd/Ctrl + C)

### 4. Colar e Executar
- Cole o conteúdo no SQL Editor do Supabase (Cmd/Ctrl + V)
- Clique no botão **"Run"** (ou pressione Cmd/Ctrl + Enter)
- Aguarde a execução

### 5. Verificar o Resultado
Você deve ver uma mensagem de sucesso ou verificar as tabelas em **"Table Editor"**

## 📝 Sobre as Extensões

O script precisa da extensão `uuid-ossp` para gerar UUIDs. 
- ✅ O Supabase geralmente já tem essa extensão habilitada por padrão
- ✅ O script usa `CREATE EXTENSION IF NOT EXISTS`, então não vai dar erro se já existir
- ⚠️ Se der erro sobre extensão, você pode habilitá-la manualmente, mas geralmente não é necessário

## 🎯 Resumo Rápido:
1. SQL Editor → New query
2. Copiar conteúdo de `database-setup.sql`
3. Colar e executar
4. Pronto! 🎉
