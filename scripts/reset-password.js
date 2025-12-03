// Script para resetar senha de um usuário
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function resetPassword() {
  const client = await pool.connect();
  
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];
    
    if (!email || !newPassword) {
      console.log('Uso: node scripts/reset-password.js <email> <nova_senha>');
      process.exit(1);
    }
    
    console.log('='.repeat(50));
    console.log('RESET DE SENHA');
    console.log('='.repeat(50));
    console.log('Email:', email);
    console.log('');
    
    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Buscar usuário
    const result = await client.query(
      'SELECT * FROM users WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário encontrado:', user.email);
    console.log('');
    
    // Hash nova senha
    console.log('Gerando hash da nova senha...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Atualizar senha
    await client.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    console.log('✅ Senha atualizada com sucesso!');
    console.log('');
    console.log('Agora você pode fazer login com:');
    console.log('  Email:', user.email);
    console.log('  Senha:', newPassword);
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

resetPassword();

