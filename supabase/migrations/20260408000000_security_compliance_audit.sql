-- Migration: Security and Compliance Audit
-- Date: 2026-04-08
-- Description: Consolidates RLS, fixes provider-user link, and adds webhook idempotency table.

-- 1. FIX PROVIDER-USER LINK
-- Add user_id to providers if it doesn't exist
ALTER TABLE providers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- 2. ENHANCED ORDER STATES
-- Add new states to order_status enum (Next.js/Supabase doesn't support easy enum modification in some versions, 
-- but we can add them with ALTER TYPE)
DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'preparando';
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'listo_para_retiro';
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'completado';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create a function to get the provider_id for the current user
CREATE OR REPLACE FUNCTION get_my_provider_id()
RETURNS uuid AS $$
  SELECT id FROM providers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') 
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- 3. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  -- Checks if user has 'admin' in their metadata or is the specific platform owner email
  SELECT (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR (auth.jwt() ->> 'email' = 'juntosplataforma@gmail.com');
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. POLICIES RECONCILIATION
-- Drop existing policies to avoid conflicts
DO $$ 
DECLARE 
  pol record;
BEGIN
  FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Table: users
CREATE POLICY "users_own_data" ON users FOR ALL USING (auth.uid() = id);

-- Table: providers
CREATE POLICY "providers_own_profile" ON providers FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "providers_update_own" ON providers FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Table: products
CREATE POLICY "public_view_active_products" ON products FOR SELECT USING (activo = true);
CREATE POLICY "providers_manage_own_products" ON products FOR ALL USING (provider_id = get_my_provider_id());

-- Table: group_deals
CREATE POLICY "public_view_active_deals" ON group_deals FOR SELECT USING (estado = 'activo');
CREATE POLICY "providers_manage_own_deals" ON group_deals FOR ALL USING (product_id IN (SELECT id FROM products WHERE provider_id = get_my_provider_id()));

-- Table: orders
CREATE POLICY "clients_view_own_orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "providers_view_received_orders" ON orders FOR SELECT USING (provider_id = get_my_provider_id());
CREATE POLICY "providers_update_order_status" ON orders FOR UPDATE USING (provider_id = get_my_provider_id());

-- Table: payments
CREATE POLICY "admin_view_all_payments" ON payments FOR SELECT USING (is_admin());
CREATE POLICY "providers_view_own_payments" ON payments FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE provider_id = get_my_provider_id()));

-- Table: reviews
CREATE POLICY "public_view_reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "auth_users_create_reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. WEBHOOK IDEMPOTENCY
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider text NOT NULL, -- e.g. 'mercadopago'
  provider_event_id text UNIQUE NOT NULL,
  payload jsonb,
  processed_at timestamp DEFAULT now()
);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_webhooks" ON webhook_events FOR ALL USING (is_admin());
