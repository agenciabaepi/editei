// Script para limpar assinaturas duplicadas, mantendo apenas a mais recente por usuário
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function cleanupDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(50));
    console.log('LIMPEZA DE ASSINATURAS DUPLICADAS');
    console.log('='.repeat(50));
    console.log('');
    
    // Encontrar usuários com múltiplas assinaturas
    const duplicatesResult = await client.query(`
      SELECT 
        user_id,
        COUNT(*) as count
      FROM subscriptions
      GROUP BY user_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (duplicatesResult.rows.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!');
      return;
    }
    
    console.log(`Encontrados ${duplicatesResult.rows.length} usuários com assinaturas duplicadas:`);
    console.log('');
    
    for (const row of duplicatesResult.rows) {
      // Buscar informações do usuário
      const userResult = await client.query(
        'SELECT email, name FROM users WHERE id = $1',
        [row.user_id]
      );
      const user = userResult.rows[0];
      
      console.log(`  - ${user.email} (${user.name}): ${row.count} assinaturas`);
      
      // Buscar todas as assinaturas desse usuário
      const subscriptionsResult = await client.query(
        `SELECT id, status, created_at, stripe_subscription_id 
         FROM subscriptions 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [row.user_id]
      );
      
      // Manter apenas a mais recente
      const toKeep = subscriptionsResult.rows[0];
      const toDelete = subscriptionsResult.rows.slice(1);
      
      console.log(`    ✅ Mantendo: ${toKeep.stripe_subscription_id} (${toKeep.status}, criada em ${toKeep.created_at})`);
      
      for (const sub of toDelete) {
        console.log(`    ❌ Removendo: ${sub.stripe_subscription_id} (${sub.status}, criada em ${sub.created_at})`);
        await client.query('DELETE FROM subscriptions WHERE id = $1', [sub.id]);
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ LIMPEZA CONCLUÍDA!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDuplicates();

