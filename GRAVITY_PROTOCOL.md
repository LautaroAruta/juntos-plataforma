# 🚀 Protocolo Gravity: Estándar de Colaboración Profesional

Este documento define el **"Modo Gravity"**: la metodología de trabajo profesional, analítica y visual que garantiza la excelencia en el desarrollo de **BANDHA**.

---

## 1. Análisis y Planificación Primaria
- **Análisis Exhaustivo**: Antes de cualquier cambio, se deben analizar los documentos de requisitos (PDFs, reportes) y el código existente.
- **Plan de Implementación**: Nunca ejecutar cambios complejos sin un `implementation_plan.md` previo que detalle:
    - Cambios propuestos por componente.
    - Impacto en el diseño.
    - Plan de verificación.
- **Solicitud de Aprobación**: El usuario debe aprobar el plan antes de pasar a la ejecución (`EXECUTION`).

## 2. Gestión de Tareas y Sprints
- **Sprint Management**: El trabajo se divide en Sprints numerados dentro de `task.md`.
- **Visibilidad en Tiempo Real**: Usar `task_boundary` para comunicar exactamente qué se está haciendo (ej. "Auditing", "Refining", "Verifying").
- **Trazabilidad**: Cada tarea debe marcarse como `[x]` solo después de ser verificada visualmente.

## 3. Verificación Visual (Proof of Work)
- **Cero Suposiciones**: Todo cambio visual **DEBE** ser verificado mediante el navegador.
- **Evidencia Gráfica**:
    - Capturar screenshots (`.png`) de los estados iniciales y finales.
    - Realizar grabaciones de pantalla (`.webp`) para interacciones y animaciones.
- **Walkthrough Dinámico**: Mantener `walkthrough.md` actualizado con carruseles de imágenes y explicaciones del "por qué" de cada decisión estética.

## 4. Auditoría Proactiva
- **Detección de Errores**: Se utiliza el navegador para buscar proactivamente problemas de:
    - **Overflow**: Contenido que se sale de sus contenedores.
    - **Alineación**: Elementos que no coinciden horizontal o verticalmente.
    - **Contraste**: Incumplimiento de normas WCAG.
- **Refinamiento Continuo**: Si se detecta un detalle (ej. recorte de borde en hover), se corrige de inmediato sin esperar reporte del usuario.

## 5. Diseño Sistémico y Replicable
- **Fuente de Verdad**: Todo patrón nuevo (colores, sombras, strokes) debe ir directamente a `DESIGN_SYSTEM.md`.
- **Checklist de Diseño**: Antes de entregar, verificar contra el workflow `/design-system` para asegurar que el código sea consistente.
- **No Placeholders**: Las demos deben verse reales. Usar generación de imágenes para contenido de alta fidelidad.

## 6. Comunicación Profesional
- **Idioma**: Español nativo y profesional en todo momento.
- **Concisión**: Mensajes directos, enumerados y enfocados en el valor aportado.
- **Proactividad**: Sugerir mejoras que eleven el nivel del producto (ej. "Esto se vería más premium con glassmorphism").

---
*Este protocolo asegura que cada interacción sea tan profesional y meticulosa como la arquitectura que estamos construyendo.*
