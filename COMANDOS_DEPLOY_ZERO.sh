#!/bin/bash

# Script para fazer deploy do zero
# Execute este script após criar o novo repositório no GitHub

echo "🚀 Preparando para deploy do zero..."

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# 2. Verificar se o build funciona
echo "📦 Testando build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro: Build falhou. Corrija os erros antes de continuar."
    exit 1
fi

echo "✅ Build local funcionou!"

# 3. Instruções para conectar ao novo repositório
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Crie um novo repositório no GitHub: https://github.com/new"
echo "   - Nome: editei (ou outro)"
echo "   - NÃO inicialize com README, .gitignore ou license"
echo ""
echo "2. Execute estes comandos (substitua USERNAME pelo seu usuário):"
echo ""
echo "   git remote remove origin"
echo "   git remote add origin https://github.com/USERNAME/editei.git"
echo "   git push -u origin main"
echo ""
echo "3. No Vercel:"
echo "   - Vá em https://vercel.com/new"
echo "   - Importe o novo repositório"
echo "   - Configure Framework Preset como 'Next.js'"
echo "   - Adicione as variáveis de ambiente"
echo "   - Faça o deploy"
echo ""


