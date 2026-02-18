-- ==============================================================================
-- DIAGNOSE ADMIN USER - Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. Check what auth users exist
SELECT 
  id as auth_user_id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check what's in btl_usuarios
SELECT 
  id,
  auth_user_id,
  email,
  nombre,
  rol,
  estado_aprobacion,
  activo,
  created_at
FROM btl_usuarios
ORDER BY created_at DESC;

-- 3. Check if auth_user_id in btl_usuarios matches auth.users
SELECT 
  u.email as auth_email,
  u.id as auth_id,
  b.email as btl_email,
  b.auth_user_id as btl_auth_user_id,
  b.rol,
  b.estado_aprobacion,
  CASE 
    WHEN u.id = b.auth_user_id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as id_match
FROM auth.users u
LEFT JOIN btl_usuarios b ON b.auth_user_id = u.id
ORDER BY u.created_at DESC;

-- 4. Fix: Ensure admin user exists with correct data
-- Replace 'YOUR_AUTH_USER_ID' with the actual ID from query 1
-- and 'your@email.com' with your actual email

-- UNCOMMENT AND RUN THIS IF THE USER IS MISSING OR HAS WRONG DATA:
/*
INSERT INTO btl_usuarios (auth_user_id, email, nombre, rol, estado_aprobacion, activo)
VALUES (
  'YOUR_AUTH_USER_ID',  -- from auth.users.id
  'franco.l.repetti@gmail.com',
  'Super Admin',
  'admin',
  'approved',
  true
)
ON CONFLICT (auth_user_id) DO UPDATE SET
  rol = 'admin',
  estado_aprobacion = 'approved',
  activo = true;
*/

-- 5. Check RLS policies are applied correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'btl_usuarios'
ORDER BY policyname;
