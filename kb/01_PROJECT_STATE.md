# 01_PROJECT_STATE

## Propósito del Proyecto: "JUNTOS"
"JUNTOS" es una plataforma web orientada a la **compra grupal**. Su lema es *"Comprá en grupo, pagá menos"*.
El objetivo de la plataforma es permitir a los usuarios unirse a "ofertas grupales" (Group Deals) de productos. Cuantos más usuarios se suman a la compra de un producto, mayor es el descuento (precio de fábrica o subsidiado). Beneficia tanto al consumidor final (ahorro) como al proveedor (venta en volumen).

## Estado Actual (Descubierto)
El proyecto está construido usando tecnologías modernas y se encuentra en una etapa inicial-media de desarrollo:

### 1. Stack Tecnológico
- **Framework Front/Back:** Next.js 15 (App Router) + React 19.
- **Estilos:** Tailwind CSS v4.
- **Base de Datos & Backend:** Supabase (PostgreSQL, Autenticación, RLS).
- **Autenticación Frontend:** NextAuth v4 (con `@auth/supabase-adapter`).
- **Pagos:** MercadoPago SDK.
- **Utilidades adicionales:** Componentes visuales de Lucide-React, manejo de códigos QR (`jsqr`, `qrcode`).

### 2. Estructura de Rutas Base Existentes
- **`/` (Home):** Landing page mostrando las ofertas grupales activas (`group_deals` unidos a `products`).
- **`/admin/*`:** Panel de administración para gestionar la plataforma.
- **`/provider/*`:** Panel dedicado a los proveedores/vendedores.
- **`/auth/*`:** Vistas de autenticación (login, registro).
- **`/products/*`:** Vistas de detalle de un producto específico.
- **`/checkout/*`:** Flujo de pago.

### 3. Modelo de Datos Simplificado (Supabase)
Basado en las queries detectadas:
- `products`: Catálogo de productos disponibles con su precio individual e información.
- `group_deals`: Ofertas temporales con `min_participantes`, `precio_actual`, y `estado`.
- Usuarios/Sesiones (vía NextAuth y Supabase).

## Próximos Pasos Inmediatos
Pactar con el equipo/usuario la hoja de ruta y definir el próximo "sector" a desarrollar.
