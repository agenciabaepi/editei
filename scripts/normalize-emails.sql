-- Script para normalizar emails no banco de dados
-- Este script atualiza todos os emails para lowercase e remove espaços

-- Atualizar emails para lowercase e trim
UPDATE users 
SET email = LOWER(TRIM(email))
WHERE email != LOWER(TRIM(email));

-- Verificar se há emails duplicados após normalização
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Verificar usuários sem senha (criados via OAuth)
SELECT id, email, name, 
       CASE WHEN password IS NULL THEN 'OAuth user' ELSE 'Password user' END as user_type
FROM users
ORDER BY created_at DESC;

