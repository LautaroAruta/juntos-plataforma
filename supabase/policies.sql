-- supabase/policies.sql
-- Políticas Row Level Security (RLS) para la aplicación JUNTOS

-- Habilitar RLS en todas las tablas
ALTER TABLE commission_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 1. commission_config: solo admin puede modificar
CREATE POLICY "admin_can_modify_commission"
  ON commission_config
  FOR ALL
  USING (auth.role() = 'admin')
  WITH CHECK (auth.role() = 'admin');

-- 2. users: cada usuario solo ve/edita sus propios datos
CREATE POLICY "user_own_data"
  ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_own_update"
  ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. providers: cada proveedor gestiona sus propios productos y pedidos
CREATE POLICY "provider_own_products"
  ON products
  FOR ALL
  USING (auth.uid() = provider_id);
CREATE POLICY "provider_own_orders"
  ON orders
  FOR ALL
  USING (auth.uid() = provider_id);

-- 4. orders: cliente ve sus pedidos, proveedor ve los de sus productos
CREATE POLICY "client_view_own_orders"
  ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "provider_view_own_product_orders"
  ON orders
  FOR SELECT USING (auth.uid() = provider_id);

-- 5. products y group_deals activos: lectura pública
CREATE POLICY "public_read_products"
  ON products
  FOR SELECT USING (activo = true);
CREATE POLICY "public_read_group_deals"
  ON group_deals
  FOR SELECT USING (estado = 'activo');

-- 6. payments: solo admin y el proveedor correspondiente pueden ver
CREATE POLICY "admin_or_provider_view_payments"
  ON payments
  FOR SELECT USING (
    auth.role() = 'admin' OR auth.uid() = (
      SELECT provider_id FROM orders WHERE orders.id = payments.order_id
    )
  );

-- 7. reviews: cualquier usuario autenticado puede leer, solo el autor puede crear/editar su reseña
CREATE POLICY "public_read_reviews"
  ON reviews
  FOR SELECT USING (true);
CREATE POLICY "user_create_own_review"
  ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_update_own_review"
  ON reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
