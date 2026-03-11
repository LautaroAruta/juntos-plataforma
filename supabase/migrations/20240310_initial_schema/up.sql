-- up.sql
-- Migration: initial schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('cliente', 'admin');
CREATE TYPE order_status AS ENUM ('pendiente_pago','pagado','pendiente_retiro','entregado','cancelado');
CREATE TYPE group_deal_state AS ENUM ('activo','completado','vencido','cancelado');

CREATE TABLE commission_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  porcentaje numeric DEFAULT 0.50,
  fecha_inicio timestamp NOT NULL,
  fecha_fin timestamp,
  activo boolean DEFAULT true,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  direccion text,
  avatar_url text,
  rol user_role NOT NULL,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_empresa text NOT NULL,
  nombre_contacto text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  cuit_rut text,
  categoria text,
  descripcion text,
  logo_url text,
  verificado boolean DEFAULT false,
  mp_user_id text,
  mp_access_token text,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  precio_individual numeric NOT NULL,
  precio_grupal_minimo numeric NOT NULL,
  imagenes text[],
  imagen_principal text,
  categoria text,
  stock integer DEFAULT 0,
  activo boolean DEFAULT true,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE group_deals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  precio_actual numeric NOT NULL,
  min_participantes integer NOT NULL,
  max_participantes integer NOT NULL,
  participantes_actuales integer DEFAULT 0,
  fecha_vencimiento timestamp NOT NULL,
  estado group_deal_state NOT NULL,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  group_deal_id uuid REFERENCES group_deals(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  cantidad integer NOT NULL,
  total numeric NOT NULL,
  estado order_status NOT NULL,
  qr_code text,
  qr_escaneado boolean DEFAULT false,
  qr_escaneado_en timestamp,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  mp_payment_id text,
  monto_total numeric NOT NULL,
  monto_proveedor numeric NOT NULL,
  monto_comision numeric NOT NULL,
  porcentaje_comision numeric NOT NULL,
  estado text,
  creado_en timestamp DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  calificacion integer CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario text,
  creado_en timestamp DEFAULT now()
);
