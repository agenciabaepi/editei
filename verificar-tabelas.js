// Script para verificar se as tabelas existem no Supabase
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verificarTabelas() {
  const client = await pool.connect();
  try {
    console.log('🔍 Verificando tabelas no banco de dados...\n');
    
    // Listar todas as tabelas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tabelasEsperadas = ['users', 'sessions', 'projects', 'subscriptions', 'images'];
    const tabelasExistentes = result.rows.map(r => r.table_name);
    
    console.log('📊 Tabelas encontradas:');
    tabelasExistentes.forEach(t => console.log(`  ✅ ${t}`));
    
    console.log('\n📋 Tabelas esperadas:');
    tabelasEsperadas.forEach(t => {
      const existe = tabelasExistentes.includes(t);
      console.log(`  ${existe ? '✅' : '❌'} ${t}`);
    });
    
    // Verificar se a tabela users tem dados
    if (tabelasExistentes.includes('users')) {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`\n👥 Usuários no banco: ${userCount.rows[0].count}`);
      
      // Verificar se existe o admin
      const admin = await client.query("SELECT * FROM users WHERE email = 'admin@admin.com'");
      if (admin.rows.length > 0) {
        console.log('✅ Usuário admin encontrado');
      } else {
        console.log('⚠️  Usuário admin NÃO encontrado');
      }
    }
    
    if (tabelasExistentes.length === 0) {
      console.log('\n❌ NENHUMA TABELA ENCONTRADA!');
      console.log('   Você precisa executar o script database-setup.sql no Supabase SQL Editor');
    } else if (tabelasEsperadas.some(t => !tabelasExistentes.includes(t))) {
      console.log('\n⚠️  Algumas tabelas estão faltando!');
      console.log('   Execute o script database-setup.sql novamente no Supabase SQL Editor');
    } else {
      console.log('\n✅ Todas as tabelas estão criadas!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarTabelas();
