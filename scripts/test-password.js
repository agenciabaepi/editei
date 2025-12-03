// Script para testar se a senha está sendo verificada corretamente
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Use a mesma conexão do projeto
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function testPassword() {
  const client = await pool.connect();
  
  try {
    const email = 'ana@gmail.com';
    const testPassword = process.argv[2] || 'test123'; // Senha para testar
    
    console.log('Testing password for:', email);
    console.log('Test password:', testPassword);
    console.log('---');
    
    // Buscar usuário
    const result = await client.query(
      'SELECT id, email, password FROM users WHERE LOWER(TRIM(email)) = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ User found:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Has password:', !!user.password);
    console.log('  Password hash length:', user.password?.length || 0);
    console.log('  Password hash prefix:', user.password?.substring(0, 20) || 'N/A');
    console.log('---');
    
    if (!user.password) {
      console.log('❌ User has no password (OAuth user)');
      return;
    }
    
    // Testar senha
    console.log('Testing password verification...');
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('---');
    if (isValid) {
      console.log('✅ Password is VALID!');
    } else {
      console.log('❌ Password is INVALID');
      console.log('');
      console.log('Possible issues:');
      console.log('  1. The password you entered is incorrect');
      console.log('  2. The password hash in the database is corrupted');
      console.log('  3. The password was hashed with a different algorithm');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPassword();

