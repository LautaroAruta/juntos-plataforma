# 02_ARCHITECTURE

## 2.1. Arquitectura General
El proyecto "JUNTOS" sigue un patrón de **Fullstack Serverless** centrado en React, utilizando Next.js App Router. Supabase actúa como el Backend as a Service (BaaS).

### Flujo de Datos
1. **Frontend (Next.js - React Client/Server Components):** Presenta la UI, corre en Vercel (o similar) y renderiza tanto del lado del servidor (SSR/SSG) como del lado del cliente.
2. **Backend Engine (Next.js API Routes / Server Actions):** Capa intermediaria en Next.js para lógica segura (ejemplo: validación de cobros de MercadoPago, Server Actions para escritura de datos).
3. **Database & Auth (Supabase):** 
   - Tablas PostgreSQL.
   - Seguridad mediante Row Level Security (RLS) policies.

## 2.2. Tecnologías Principales y Versiones
- **Core:** Next.js 15.1.6
- **UI & Estilos:** Tailwind CSS 4.0.0, Lucide React (Íconos).
- **Control de Estado:** React 19 (Hooks).
- **Database interact:** Supabase JS v2.99, Supabase SSR v0.9.
- **Autenticación:** NextAuth.js 4.24 con Adaptador de Supabase. Integración con perfiles de base de datos.
- **Fintech:** SDK de MercadoPago (NodeJS) v2.12.0 para links de pago y webhooks.
- **Notificaciones/Emails:** Resend v6.9 - API de mailing.

## 2.3. Convenciones de Desarrollo
- Uso de **Server Components** por defecto por rendimiento y seguridad, limitando los `"use client"` a componentes estrictamente interactivos.
- **Estilos:** Utilizar utilidades de Tailwind en lugar de CSS custom.
- **BBDD:** Tipado fuerte usando TypeGen de Supabase (`@supabase/supabase-js`). Las interacciones a DB deben hacerse mayormente en servidor (o con políticas fuertes en el cliente).
- **Estructura de Carpetas:**
  - `/src/app/`: Páginas y componentes de enrutamiento web.
  - `/src/components/`: Componentes reutilizables fragmentados (ej. `group-deals/`, `providers/`).
  - `/src/lib/`: Configuración e instancias de librerías globales (Supabase client, Utils, MercadoPago).
