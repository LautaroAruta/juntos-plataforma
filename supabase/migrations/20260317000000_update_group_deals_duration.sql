-- 1. Añade la columna de duración para los proveedores
ALTER TABLE group_deals ADD COLUMN IF NOT EXISTS duracion_horas integer DEFAULT 48;

-- 2. Permite que la fecha de vencimiento se maneje dinámicamente
ALTER TABLE group_deals ALTER COLUMN fecha_vencimiento DROP NOT NULL;

-- 3. Actualiza la función que maneja las uniones
CREATE OR REPLACE FUNCTION join_group_deal(target_deal_id uuid)
RETURNS void AS $$
BEGIN
  -- Simplemente incrementa el contador de participantes
  UPDATE group_deals
  SET participantes_actuales = participantes_actuales + 1
  WHERE id = target_deal_id;
END;
$$ LANGUAGE plpgsql;
