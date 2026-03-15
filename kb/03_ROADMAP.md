# 03_ROADMAP: Plataforma JUNTOS

Este documento sirve como hoja de ruta ("Roadmap") para el proyecto "JUNTOS". 
Debemos mantenerlo actualizado y tachar (`[x]`) los hitos a medida que se completen.

## 🎯 Fase 1: MVP (Producto Mínimo Viable)
- [x] Configuración inicial del proyecto (Next.js, Tailwind, NextAuth).
- [x] Conexión base a Supabase y configuración de Auth.
- [x] Diseño estático de Landing Page y listado básico de "Terminan pronto" (Group Deals).
- [x] Esquemas iniciales de Base de Datos para Productos y Ofertas Grupales (`schema.sql`).
- [x] Listado dinámico interactivo y filtros del catálogo (`/catalogo`).
- [x] Detalle de producto y botón de unirse a compra (`/products/[id]`).

## 🛒 Fase 2: Checkout & Pagos
- [x] Integración de Flujo de Pago con WebCheckout MercadoPago.
- [ ] Validación de Stock y confirmación temporal de plaza.
- [x] Gestión de estado de "Pago Pendiente", "Aprobado", "Rechazado".
- [x] Webhook de MercadoPago para actualizar el progreso del `Group Deal`.

## 🧑‍💻 Fase 3: Perfil de Usuario & Administración
- [ ] Vista `/auth/*` (Login/Registro full con Supabase/Google/Email).
- [ ] Dashboard de Usuario: Ver mis compras grupales, códigos QR de retiro.
- [ ] Dashboard de Administrador (`/admin/dashboard`): Gestión de Productos, Ofertas y Usuarios.
- [ ] Dashboard de Proveedores (`/provider`): Carga de productos y visualización de ventas en masa.

## 🚀 Fase 4: Notificaciones y Entrega
- [ ] Creación de Código QR para validar entregas.
- [ ] Escaneo de código QR y cambio de estado del producto a "Entregado".
- [x] Emails transaccionales con Resend (Confirmación de compra, oferta completada, retiro listo).
- [x] Cierre automático o reembolso si no se llega al objetivo de la oferta grupal.
