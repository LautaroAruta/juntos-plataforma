---
description: Reglas de diseño y sistema visual de BANDHA. Consultar SIEMPRE antes de crear o modificar páginas, componentes o estilos.
---

# 🎨 Sistema de Diseño BANDHA

Antes de escribir cualquier código visual (páginas, componentes, estilos), **SIEMPRE** consultá este documento y el archivo `DESIGN_SYSTEM.md` en la raíz del proyecto.

## Checklist Obligatorio

Antes de crear/modificar cualquier componente visual:

// turbo-all

1. Leer `DESIGN_SYSTEM.md` en la raíz del proyecto para conocer todas las reglas
2. Verificar que los colores usados sean los del sistema (no hardcodear valores ad-hoc)
3. Verificar que los tamaños de texto cumplan el **mínimo de 11px**
4. Verificar que los precios y números usen la clase `tabular-nums` o `price-display`
5. Verificar que el fondo de página sea `bg-[#FFF8E7]` o `bg-brand-soft`
6. Verificar que el branding diga **BANDHA** (nunca "JUNTOS")
7. Usar `GroupAvatars` para mostrar progreso de grupo (no texto plano)
8. Páginas de producto deben tener `generateMetadata()` para OG dinámico
9. Para FOMO/urgencia usar `text-brand-danger` (no `text-red-600`)
10. En headers usar `AnimatedLogo` (no texto plano)
11. En checkout incluir Trust Badges de seguridad
12. Usar clases utilidad de tipografía (`heading-1`, `heading-2`, `label-badge`, etc.) cuando sea posible
13. **Iconos**: Usar `strokeWidth={2.5}` y fondos sutiles (`bg-color/15`)
14. **Tarjetas**: Asegurar alineación horizontal perfecta (títulos de altura fija + `mt-auto` en botones)
15. **Hover**: Implementar efectos de elevación (`scale-105` o `110`) y sombras de color suaves


## Referencia Rápida de Colores

| Token                  | Valor      | Uso                           |
|------------------------|------------|-------------------------------|
| `--color-primary`      | `#009EE3`  | Acciones, links, CTAs         |
| `--color-secondary`    | `#00A650`  | Éxito, precios grupales       |
| `--color-danger`       | `#E3242B`  | Errores, alertas, FOMO        |
| `--color-background-soft` | `#FFF8E7` | Fondo Butter Yellow        |
| Texto principal        | `text-slate-800` | Títulos, contenido        |
| Texto secundario       | `text-slate-400` | Labels, subtítulos        |

## Clases Utilidad (globals.css)

| Clase               | Uso                                   |
|---------------------|---------------------------------------|
| `.heading-1/2/3`    | Jerarquía tipográfica de títulos      |
| `.price-display`    | Precios (font-black, tabular-nums)    |
| `.label-badge`      | Labels y badges (11px, uppercase)     |
| `.body-text`        | Texto de cuerpo                       |
| `.text-brand-primary`| Color azul de marca                  |
| `.text-brand-secondary`| Color verde de marca               |
| `.text-brand-danger`| Color rojo de marca (FOMO/urgencia)   |
| `.bg-brand-soft`    | Fondo Butter Yellow                   |
| `.tabular-nums`     | Cifras tabulares para números         |

## Referencia Rápida de Tipografía

- **Fuente**: Inter (vía `font-sans`)
- **Mínimo absoluto**: `text-[11px]` (no usar 8px, 9px, 10px)
- **Labels/badges**: `text-[11px] font-black uppercase tracking-widest`
- **Precios**: `font-black tracking-tighter tabular-nums`
- **Títulos**: `font-black tracking-tighter uppercase`

## Componentes Clave

- **GroupAvatars**: Para progreso de grupo. Props: `current`, `min`, `compact?`
- **CountdownTimer**: Para temporizadores. Siempre con `tabular-nums`
- **ProductCard**: Tarjeta de producto en grids
- **ProductShareActions**: Botones compartir con OG dinámico

## Estructura de Páginas

Toda página nueva debe seguir este patrón:

```tsx
// Wrapper con Butter Yellow
<div className="min-h-screen bg-[#FFF8E7] pb-24">
  {/* Contenido */}
</div>
```

## Excepciones

- Páginas legales (`/privacidad`, `/terminos-y-condiciones`): usan `bg-white`
- Scanner QR: usa `bg-slate-900` (modo oscuro para cámara)
- Provider dashboard: usa `bg-[#FFF9E6]` (variante similar)
