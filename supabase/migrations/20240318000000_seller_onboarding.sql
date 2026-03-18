-- Migration: seller_onboarding
-- Extends providers table with KYC fields and creates provider_documents table

-- Enum para tipo de cuenta
DO $$ BEGIN
  CREATE TYPE account_type AS ENUM ('persona_fisica', 'empresa');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Enum para estado KYC
DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('pendiente', 'en_revision', 'aprobado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Nuevas columnas en providers
ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS tipo_cuenta account_type DEFAULT 'persona_fisica',
  ADD COLUMN IF NOT EXISTS razon_social text,
  ADD COLUMN IF NOT EXISTS dni_representante text,
  ADD COLUMN IF NOT EXISTS domicilio_fiscal text,
  ADD COLUMN IF NOT EXISTS codigo_postal text,
  ADD COLUMN IF NOT EXISTS provincia text,
  ADD COLUMN IF NOT EXISTS cbu_cvu text,
  ADD COLUMN IF NOT EXISTS titular_cuenta text,
  ADD COLUMN IF NOT EXISTS estado_kyc kyc_status DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS kyc_notas text,
  ADD COLUMN IF NOT EXISTS kyc_actualizado_en timestamp;

-- Tabla de documentos del proveedor
CREATE TABLE IF NOT EXISTS provider_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  tipo_documento text NOT NULL,
  url text NOT NULL,
  estado text DEFAULT 'pendiente',
  creado_en timestamp DEFAULT now()
);

-- Index para búsquedas rápidas por provider
CREATE INDEX IF NOT EXISTS idx_provider_documents_provider_id ON provider_documents(provider_id);
CREATE INDEX IF NOT EXISTS idx_providers_estado_kyc ON providers(estado_kyc);
