// Script para testar login diretamente no banco
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function testLogin() {
  const client = await pool.connect();
  
  try {
    const email = process.argv[2] || 'ana@gmail.com';
    const password = process.argv[3] || 'test123';
    
    console.log('='.repeat(50));
    console.log('TESTE DE LOGIN DIRETO');
    console.log('='.repeat(50));
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    
    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Email normalizado:', normalizedEmail);
    console.log('');
    
    // Buscar usuário
    console.log('1. Buscando usuário no banco...');
    const result = await client.query(
      'SELECT * FROM users WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ ERRO: Usuário não encontrado!');
      console.log('');
      console.log('Tentando buscar sem normalização...');
      const result2 = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      if (result2.rows.length > 0) {
        console.log('⚠️  Usuário encontrado sem normalização!');
        console.log('Email no banco:', result2.rows[0].email);
        console.log('Isso indica que o email no banco não está normalizado.');
      }
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.name);
    console.log('   Tem senha:', !!user.password);
    console.log('   Tamanho do hash:', user.password?.length || 0);
    console.log('');
    
    if (!user.password) {
      console.log('❌ ERRO: Usuário não tem senha (OAuth user)');
      return;
    }
    
    // Verificar senha
    console.log('2. Verificando senha...');
    console.log('   Hash prefix:', user.password.substring(0, 20) + '...');
    console.log('');
    
    const isValid = await bcrypt.compare(password, user.password);
    
    console.log('3. Resultado:');
    if (isValid) {
      console.log('✅ SENHA VÁLIDA!');
      console.log('');
      console.log('O login deveria funcionar. Se não está funcionando,');
      console.log('pode ser um problema com:');
      console.log('  - Cookies não sendo enviados');
      console.log('  - Sessão não sendo criada');
      console.log('  - Middleware bloqueando');
    } else {
      console.log('❌ SENHA INVÁLIDA!');
      console.log('');
      console.log('Possíveis causas:');
      console.log('  1. A senha digitada está incorreta');
      console.log('  2. O hash no banco está corrompido');
      console.log('  3. A senha foi criada com algoritmo diferente');
      console.log('');
      console.log('Para resetar a senha, você pode executar:');
      console.log('  node scripts/reset-password.js ' + email + ' nova_senha');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testLogin();

