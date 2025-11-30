#!/bin/bash
# Testar diferentes regiões do Session Pooler

REGIONS=("us-east-1" "us-west-1" "eu-west-1" "ap-southeast-1" "ap-northeast-1")
PASSWORD="%40Deusefiel7"
PROJECT_REF="hmapxmbfhblrfjoweoed"

echo "🧪 Testando regiões do Session Pooler..."
echo ""

for region in "${REGIONS[@]}"; do
  CONN_STRING="postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${region}.pooler.supabase.com:6543/postgres"
  echo "Testando: ${region}"
  
  node -e "
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: '${CONN_STRING}',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    pool.query('SELECT NOW()')
      .then(() => {
        console.log('  ✅ ${region} FUNCIONA!');
        process.exit(0);
      })
      .catch(err => {
        if (err.code === 'XX000' || err.message.includes('Tenant')) {
          console.log('  ⚠️  ${region} - Erro de autenticação (região pode estar correta)');
        } else {
          console.log('  ❌ ${region} - ' + err.code);
        }
        process.exit(1);
      });
  " 2>&1 | grep -E "(✅|⚠️)" && break
done
