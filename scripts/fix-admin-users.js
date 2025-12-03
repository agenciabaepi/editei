// Script para corrigir usuários criados pelo painel admin sem hash de senha
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function fixAdminUsers() {
  const client = await pool.connect();
  
  try {
    console.log('='.repeat(50));
    console.log('CORRIGINDO USUÁRIOS DO PAINEL ADMIN');
    console.log('='.repeat(50));
    console.log('');
    
    // Buscar todos os usuários
    const result = await client.query(
      'SELECT id, email, name, password FROM users ORDER BY created_at DESC'
    );
    
    console.log(`Total de usuários encontrados: ${result.rows.length}`);
    console.log('');
    
    const usersToFix = [];
    
    // Verificar quais usuários têm senhas inválidas
    for (const user of result.rows) {
      if (!user.password) {
        console.log(`⚠️  ${user.email} - Sem senha (OAuth user)`);
        continue;
      }
      
      // Um hash bcrypt válido tem pelo menos 60 caracteres e começa com $2a$, $2b$ ou $2y$
      const isValidHash = user.password.length >= 60 && 
                          (user.password.startsWith('$2a$') || 
                           user.password.startsWith('$2b$') || 
                           user.password.startsWith('$2y$'));
      
      if (!isValidHash) {
        console.log(`❌ ${user.email} - Senha inválida (${user.password.length} chars, prefix: ${user.password.substring(0, 10)})`);
        usersToFix.push(user);
      } else {
        console.log(`✅ ${user.email} - Senha válida`);
      }
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`Usuários que precisam ser corrigidos: ${usersToFix.length}`);
    console.log('='.repeat(50));
    console.log('');
    
    if (usersToFix.length === 0) {
      console.log('✅ Nenhum usuário precisa ser corrigido!');
      return;
    }
    
    // Perguntar se deve resetar as senhas
    const resetPassword = process.argv[2] === '--reset';
    
    if (!resetPassword) {
      console.log('Para resetar as senhas desses usuários, execute:');
      console.log('  node scripts/fix-admin-users.js --reset');
      console.log('');
      console.log('Isso irá resetar todas as senhas para: senha123');
      return;
    }
    
    console.log('Resetando senhas...');
    console.log('');
    
    // Resetar senhas
    const defaultPassword = 'senha123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    for (const user of usersToFix) {
      await client.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, user.id]
      );
      console.log(`✅ ${user.email} - Senha resetada para: ${defaultPassword}`);
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ CORREÇÃO CONCLUÍDA!');
    console.log('='.repeat(50));
    console.log('');
    console.log('Todos os usuários podem fazer login com:');
    console.log('  Senha: senha123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Peça para os usuários alterarem suas senhas após o primeiro login!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdminUsers();

