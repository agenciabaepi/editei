#!/bin/bash
REGIONS=("us-east-1" "us-west-1" "us-west-2" "eu-west-1" "eu-central-1" "ap-southeast-1" "ap-northeast-1" "ap-south-1" "sa-east-1")
PASSWORD="%40Deusefiel7"
PROJECT_REF="hmapxmbfhblrfjoweoed"

echo "🔍 Testando TODAS as regiões do Session Pooler..."
echo ""

for region in "${REGIONS[@]}"; do
  echo -n "Testando $region... "
  
  node -e "
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: 'postgres://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${region}.pooler.supabase.com:5432/postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000
    });
    
    pool.query('SELECT NOW()')
      .then(() => {
        console.log('✅ FUNCIONA!');
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  " 2>&1 | grep -q "✅" && echo "✅ $region FUNCIONA!" && REGION_ENCONTRADA=$region && break || echo "❌"
done

if [ ! -z "$REGION_ENCONTRADA" ]; then
  echo ""
  echo "🎉 Região encontrada: $REGION_ENCONTRADA"
  echo "Connection string:"
  echo "postgres://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${REGION_ENCONTRADA}.pooler.supabase.com:5432/postgres"
else
  echo ""
  echo "⚠️  Nenhuma região funcionou. Pode ser problema de autenticação."
fi
