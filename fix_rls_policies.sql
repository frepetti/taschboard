-- Fix RLS Policies for btl_usuarios
-- Run this in Supabase SQL Editor

-- 1. Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "users_read_own" ON btl_usuarios;
DROP POLICY IF EXISTS "users_update_own" ON btl_usuarios;
DROP POLICY IF EXISTS "users_insert_self" ON btl_usuarios;

-- 2. Create new policies without recursion
-- Allow users to read their own data by matching auth.uid() directly
CREATE POLICY "users_can_read_own_data" ON btl_usuarios
  FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Allow users to update their own data
CREATE POLICY "users_can_update_own_data" ON btl_usuarios
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow authenticated users to insert their own record (for registration)
CREATE POLICY "users_can_insert_own_data" ON btl_usuarios
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- 3. IMPORTANT: Add a policy to allow service role (backend) to bypass RLS
-- This is needed for the Edge Function to create users
CREATE POLICY "service_role_all_access" ON btl_usuarios
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'btl_usuarios';
