-- supabase/migrations/20240317000000_dynamic_timer.sql
-- 1. Añadir columna duracion_horas a group_deals
ALTER TABLE group_deals ADD COLUMN IF NOT EXISTS duracion_horas integer DEFAULT 48;

-- 2. Asegurar que fecha_vencimiento sea requerida (o no, pero ya no se activa en el RPC)
ALTER TABLE group_deals ALTER COLUMN fecha_vencimiento DROP NOT NULL;

-- 3. Simplificar RPC join_group_deal (Solo incrementa el contador)
CREATE OR REPLACE FUNCTION join_group_deal(target_deal_id uuid)
RETURNS void AS $$
BEGIN
  -- Incrementar participación
  UPDATE group_deals
  SET participantes_actuales = participantes_actuales + 1
  WHERE id = target_deal_id;
END;
$$ LANGUAGE plpgsql;
