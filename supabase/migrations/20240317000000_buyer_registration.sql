-- Migration: buyer_registration_fields
-- Desc: Campos de registro de comprador basados en el PDF de ML
-- Ejecutar este script en el SQL Editor de Supabase (https://supabase.com/dashboard/project/gvweiyfjruviqozqkwck/sql/new)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS fecha_nacimiento date,
  ADD COLUMN IF NOT EXISTS documento_tipo text,
  ADD COLUMN IF NOT EXISTS documento_numero text,
  ADD COLUMN IF NOT EXISTS telefono_verificado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_verificado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_otp text,
  ADD COLUMN IF NOT EXISTS otp_expira timestamp,
  ADD COLUMN IF NOT EXISTS registration_step integer DEFAULT 0;
