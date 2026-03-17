# 🎨 BANDHA — Design System

> Este documento es la **fuente de verdad** para todo el diseño visual de la plataforma.
> Cualquier agente de IA o desarrollador debe consultarlo antes de crear o modificar componentes.

---

## 1. Marca

| Propiedad     | Valor                    |
|---------------|--------------------------|
| **Nombre**    | BANDHA                   |
| **Dominio**   | bandha.com.ar            |
| **Slogan**    | Comprá en grupo, pagá menos |
| **País**      | Argentina 🇦🇷             |

> ⚠️ **NUNCA** usar "JUNTOS" en ningún lugar del código, metadata, ni interfaz.

---

## 2. Paleta de Colores

### Colores Principales

| Token                     | Hex       | CSS Variable              | Uso                                     |
|---------------------------|-----------|---------------------------|------------------------------------------|
| **Primary (Azul)**        | `#009EE3` | `var(--color-primary)`    | CTAs, links, acciones principales        |
| **Primary Hover**         | `#0077CC` | —                         | Hover de botones primarios               |
| **Secondary (Verde)**     | `#00A650` | `var(--color-secondary)`  | Éxito, precios grupales, badges          |
| **Danger (Rojo)**         | `#E3242B` | `var(--color-danger)`     | Errores, FOMO, alertas urgentes          |
| **Background Soft**       | `#FFF8E7` | `var(--color-background-soft)` | Fondo de TODAS las páginas principales |

### Fondos de Página

| Página                    | Fondo      | Razón                           |
|---------------------------|------------|----------------------------------|
| Home, productos, checkout | `#FFF8E7`  | Butter Yellow (calidez de marca) |
| Términos, Privacidad      | `bg-white` | Legibilidad de texto legal       |
| Scanner QR                | `bg-slate-900` | Interfaz oscura para cámara  |
| Provider Dashboard        | `#FFF9E6`  | Variante warm similar            |

### Gradientes

```css
/* Badge de descuento */
background: linear-gradient(135deg, #009EE3, #00A650);

/* Avatares confirmados */
background: linear-gradient(to bottom-right, #00A650, #009EE3);
```

### Reglas de Uso

1. **NUNCA** usar `text-red-600`, `text-blue-500`, etc. de Tailwind directamente para colores de marca
2. **SIEMPRE** usar los tokens definidos: `text-[#009EE3]`, `text-[#00A650]`, o las utilidades `text-brand-primary`, `text-brand-secondary`, `text-brand-danger`
3. **Backgrounds**: Toda página nueva → `bg-[#FFF8E7]` o `bg-brand-soft` (excepto las excepciones listadas)
4. **FOMO/Urgencia**: Usar `text-brand-danger` (no `text-red-600`)

---

## 3. Tipografía

### Fuentes

| Variable     | Fuente | Uso                       |
|-------------|--------|---------------------------|
| `font-sans` | Inter  | Todo el contenido         |
| `font-mono` | Geist  | Códigos, links de referidos |

### Escala Tipográfica

| Nivel           | Clase Tailwind                              | Ejemplo              |
|----------------|----------------------------------------------|----------------------|
| H1             | `text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter` | Nombre producto |
| H2             | `text-xl md:text-2xl font-black uppercase tracking-tighter`    | Secciones      |
| Precio grande  | `text-[22px] font-black tracking-tighter tabular-nums`         | $12.000        |
| Precio XL      | `text-4xl md:text-5xl font-black tracking-tighter tabular-nums`| Flash Sale     |
| Body           | `text-sm font-medium text-slate-600`                           | Descripciones  |
| Label/Badge    | `text-[11px] font-black uppercase tracking-widest`             | OFERTA GRUPAL  |
| Mínimo visible | `text-[11px]`                                                  | Note de pie    |

### Reglas Tipográficas

1. **MÍNIMO ABSOLUTO**: `11px` (`text-[11px]`). Nunca usar `text-[8px]`, `text-[9px]` ni `text-[10px]`
2. **Cifras tabulares**: Todo elemento con números (precios, timers, contadores) debe usar `tabular-nums`
3. **Peso**: Los labels usan `font-black`, el body usa `font-medium` o `font-bold`
4. **Tracking**: Títulos → `tracking-tighter`, Labels → `tracking-widest`

### Clases Utilidad de Tipografía (globals.css)

```css
.heading-1   /* text-2xl→4xl, font-black, tracking-tighter */
.heading-2   /* text-xl→2xl, font-black, uppercase, tracking-tighter */
.heading-3   /* text-lg→xl, font-black, tracking-tight */
.price-display /* font-black, tracking-tighter, tabular-nums */
.label-badge /* text-[11px], font-black, uppercase, tracking-widest */
.body-text    /* text-sm, font-medium, text-slate-600 */
```

### Clases Utilidad de Color de Marca

```css
.text-brand-primary   /* var(--color-primary)  = #009EE3 */
.text-brand-secondary /* var(--color-secondary) = #00A650 */
.text-brand-danger    /* var(--color-danger)   = #E3242B */
.bg-brand-soft        /* var(--color-background-soft) = #FFF8E7 */
```

> ⚠️ **Para urgencia/FOMO**: Usar `text-brand-danger` en vez de `text-red-600` de Tailwind.

---

## 4. Componentes Reutilizables

### GroupAvatars

```tsx
import GroupAvatars from "@/components/group-deals/GroupAvatars";

// En ProductCard (compacto, máx 3 círculos)
<GroupAvatars current={3} min={5} compact />

// En página de producto (máx 4 círculos)
<GroupAvatars current={3} min={5} />
```

**Smart overflow**: Cuando hay más participantes de los que caben, muestra un badge `+N` oscuro. Solo muestra 1 círculo punteado (Zeigarnik trigger), no todos los vacantes.

**Efecto Zeigarnik**: El slot vacío pulsa suavemente (animación breathing) para crear urgencia psicológica.

### CountdownTimer

```tsx
import CountdownTimer from "@/components/shared/CountdownTimer";

// Default (muestra días/horas/min con separadores)
<CountdownTimer targetDate={deal.fecha_vencimiento} />

// Simple (para cards, muestra "¡3 HORAS!")
<CountdownTimer targetDate={fecha} variant="simple" className="text-[10px]" />
```

### ProductCard

**Alineación perfecta (Layout Grid):**
Toda visualización de productos en grid debe garantizar alineación horizontal total de botones y precios.
- **Imagen**: Usar `aspect-square overflow-hidden flex-shrink-0`.
- **Título**: Usar `line-clamp-2 h-[2.6rem] overflow-hidden` para que el alto sea idéntico en todas las tarjetas de la fila.
- **Botón**: Usar `mt-auto` en el contenedor del botón de acción.

### Categorías (Glassmorphism)

**Look & Feel:**
- **Fondo**: `bg-white/40 backdrop-blur-md` (Premium Glassmorphism).
- **Hover**: `scale-110 hover:shadow-[color]/20 hover:bg-white/80`.
- **Iconos**: 
    - Fondo: Siempre usar `bg-[color]/15` para una opacidad sutil e idéntica en todos.
    - Contenedor: `w-14 h-14 rounded-2xl flex items-center justify-center`.

### Iconografía Unificada

- **Librería**: Lucide React.
- **Stroke Width**: **SIEMPRE** usar `strokeWidth={2.5}` en componentes de UI principales (Categorías, ProductCard, FlashSale) para mayor peso visual y legibilidad premium.
- **Metáforas**:
    - Tecnología → `Smartphone`
    - Moda → `ShoppingBag`
    - Hogar → `Armchair`


### AnimatedLogo

El logo de BANDHA con animación spring por letra y degradado:
```tsx
import AnimatedLogo from "@/components/layout/AnimatedLogo";

// En Header (uso por defecto)
<AnimatedLogo />

// Con clases extra
<AnimatedLogo className="my-custom-class" />
```

**Comportamiento:** Cada letra entra secuencialmente con spring physics. Al hover, el logo hace un sutil scale-up. Degradado azul→verde de marca.

### Trust Badges (Checkout)

Debajo del botón de pago, siempre incluir:
```tsx
<div className="flex items-center justify-center gap-4 py-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
  <span>🔒 Pago Seguro</span>
  <span className="text-slate-200">|</span>
  <span>🛡️ Mercado Pago</span>
  <span className="text-slate-200">|</span>
  <span>✓ SSL 256-bit</span>
</div>
```

---

## 5. Patrones de Layout

### Wrapper de Página

```tsx
<div className="min-h-screen bg-[#FFF8E7] pb-24">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* contenido */}
  </div>
</div>
```

### Cards

```tsx
<div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 p-6 md:p-10">
  {/* contenido */}
</div>
```

### Botón Primario

```tsx
<button className="w-full bg-[#009EE3] hover:bg-[#0077CC] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all uppercase tracking-widest text-sm">
  Texto del botón
</button>
```

### Botón Secundario

```tsx
<button className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold rounded-2xl border-2 border-gray-100 py-4 transition-all uppercase tracking-tight text-sm">
  Texto
</button>
```

---

## 6. Open Graph / SEO

### Metadata Dinámica (Páginas de Producto)

Toda página de producto **DEBE** tener `generateMetadata()`:

```tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  // Fetch producto
  // Generar título persuasivo con conteo de faltantes
  // Generar URL de OG image dinámica: /api/og?title=...&price=...&discount=...
  return { title, openGraph, twitter };
}
```

### Metadata Estática (Páginas Informativas)

```tsx
export const metadata: Metadata = {
  title: "Nombre de Página | BANDHA",
  description: "Descripción en español argentino",
  openGraph: {
    siteName: "BANDHA",
    locale: "es_AR",
  },
};
```

### API de OG Image Dinámica

Ruta: `/api/og` — genera imágenes 1200×630 para rich link previews.

Parámetros:
| Parámetro | Descripción |
|---|---|
| `title` | Nombre del producto |
| `price` | Precio grupal |
| `originalPrice` | Precio individual |
| `discount` | Porcentaje de descuento |
| `image` | URL de imagen del producto |
| `participants` | Participantes actuales |
| `minParticipants` | Mínimo requerido |

---

## 7. Animaciones

| Efecto               | Uso                                  | Implementación                       |
|----------------------|--------------------------------------|--------------------------------------|
| **Spring entry**     | Avatares al aparecer                 | `framer-motion` spring               |
| **Letter drop**      | Logo al cargar página                | `framer-motion` spring secuencial    |
| **Breathing pulse**  | Slots vacíos de grupo                | `framer-motion` scale+opacity cycle  |
| **Hover scale**      | Cards, botones, logo                 | `hover:scale-105 transition-all`     |
| **Active scale**     | Botones al presionar                 | `active:scale-95`                    |
| **Pulse fast**       | Alertas urgentes                     | `.animate-pulse-fast`                |

---

## 8. Stack Técnico

| Capa          | Tecnología        |
|---------------|--------------------|
| Framework     | Next.js 15.1       |
| Styling       | Tailwind CSS v4    |
| Animaciones   | Framer Motion      |
| Iconos        | Lucide React       |
| Backend       | Supabase           |
| Pagos         | Mercado Pago       |
| Auth          | NextAuth           |
| Fonts         | Inter + Geist      |

---

## 9. Workflow Profesional (Reglas de Oro)

Para mantener la calidad premium y el profesionalismo extremo, todo desarrollo en BANDHA debe seguir estrictamente el [**Protocolo Gravity**](file:///c:/Users/user/Downloads/JUNTOS/juntos-plataforma/GRAVITY_PROTOCOL.md).

### Reglas de Oro:
1. **Alineación Obsesiva**: Ningún elemento debe "saltar" o estar desalineado horizontalmente con sus vecinos en una fila.

2. **Design First**: Antes de tocar código, definir el diseño en `DESIGN_SYSTEM.md` si es un patrón nuevo.
3. **Glassmorphism & Depth**: Usar desenfoques de fondo (`backdrop-blur`) y sombras de color (`shadow-[color]/20`) para crear jerarquía y profundidad.
4. **Verificación Visual**: Probar SIEMPRE en navegador simulando títulos largos para asegurar que el layout sea irrompible.
5. **No Placeholders**: Usar imágenes reales de alta calidad (vía `generate_image`) para que la demo se sienta como un producto final.

