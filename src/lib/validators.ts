/**
 * Validadores para el formulario de alta de vendedor
 * Incluye: CUIT, CBU, teléfono AR, email
 */

// ─── CUIT ────────────────────────────────────────────────────

/**
 * Valida formato de CUIT argentino: XX-XXXXXXXX-X
 * Incluye validación del dígito verificador según algoritmo AFIP
 */
export function validateCUIT(cuit: string): { valid: boolean; message: string } {
  // Limpiar guiones y espacios
  const clean = cuit.replace(/[-\s]/g, "");

  if (!/^\d{11}$/.test(clean)) {
    return { valid: false, message: "El CUIT debe tener 11 dígitos" };
  }

  // Validar tipo (primeros 2 dígitos)
  const tipo = clean.substring(0, 2);
  const tiposValidos = ["20", "23", "24", "27", "30", "33", "34"];
  if (!tiposValidos.includes(tipo)) {
    return { valid: false, message: "Tipo de CUIT inválido" };
  }

  // Algoritmo de dígito verificador AFIP
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += parseInt(clean[i]) * multiplicadores[i];
  }
  const resto = suma % 11;
  const digitoCalculado = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
  const digitoReal = parseInt(clean[10]);

  if (digitoCalculado !== digitoReal) {
    return { valid: false, message: "Dígito verificador inválido" };
  }

  return { valid: true, message: "" };
}

/**
 * Auto-formatea CUIT mientras se escribe: XX-XXXXXXXX-X
 */
export function formatCUIT(input: string): string {
  const clean = input.replace(/\D/g, "").slice(0, 11);
  if (clean.length <= 2) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
}

// ─── CBU ─────────────────────────────────────────────────────

/**
 * Valida formato de CBU argentino (22 dígitos)
 * Verifica dígitos verificadores de ambos bloques
 */
export function validateCBU(cbu: string): { valid: boolean; message: string } {
  const clean = cbu.replace(/\s/g, "");

  if (!/^\d{22}$/.test(clean)) {
    return { valid: false, message: "El CBU debe tener exactamente 22 dígitos" };
  }

  // Bloque 1 (8 dígitos): banco (3) + sucursal (4) + dígito verificador (1)
  const bloque1 = clean.substring(0, 8);
  const mult1 = [7, 1, 3, 7, 1, 3, 7];
  let suma1 = 0;
  for (let i = 0; i < 7; i++) {
    suma1 += parseInt(bloque1[i]) * mult1[i];
  }
  const dv1 = (10 - (suma1 % 10)) % 10;
  if (dv1 !== parseInt(bloque1[7])) {
    return { valid: false, message: "CBU inválido (dígito verificador bloque 1)" };
  }

  // Bloque 2 (14 dígitos): cuenta (13) + dígito verificador (1)
  const bloque2 = clean.substring(8, 22);
  const mult2 = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3];
  let suma2 = 0;
  for (let i = 0; i < 13; i++) {
    suma2 += parseInt(bloque2[i]) * mult2[i];
  }
  const dv2 = (10 - (suma2 % 10)) % 10;
  if (dv2 !== parseInt(bloque2[13])) {
    return { valid: false, message: "CBU inválido (dígito verificador bloque 2)" };
  }

  return { valid: true, message: "" };
}

/**
 * Auto-formatea CBU con espacios cada 4 dígitos
 */
export function formatCBU(input: string): string {
  const clean = input.replace(/\D/g, "").slice(0, 22);
  return clean.replace(/(\d{4})(?=\d)/g, "$1 ");
}

// ─── TELÉFONO ────────────────────────────────────────────────

/**
 * Valida teléfono argentino (con o sin código de país)
 * Acepta: +54 9 11 XXXX-XXXX, 011 XXXX-XXXX, 11 XXXX XXXX, etc.
 */
export function validatePhoneAR(phone: string): { valid: boolean; message: string } {
  const clean = phone.replace(/[-\s()]/g, "");

  // Mínimo 10 dígitos (sin código de país)
  if (clean.replace(/\D/g, "").length < 10) {
    return { valid: false, message: "El teléfono debe tener al menos 10 dígitos" };
  }

  // Patrón flexible para Argentina
  const regex = /^(\+?54\s?9?\s?)?(\d{2,4})\s?(\d{4})\s?(\d{4})$/;
  if (!regex.test(clean) && clean.replace(/\D/g, "").length < 10) {
    return { valid: false, message: "Formato de teléfono inválido" };
  }

  return { valid: true, message: "" };
}

// ─── EMAIL ───────────────────────────────────────────────────

export function validateEmail(email: string): { valid: boolean; message: string } {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { valid: false, message: "Email inválido" };
  }
  return { valid: true, message: "" };
}

// ─── PROVINCIAS ARGENTINA ─────────────────────────────────────

export const PROVINCIAS_AR = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

// ─── CATEGORÍAS ──────────────────────────────────────────────

export const CATEGORIES = [
  "Electrónica",
  "Ropa y calzado",
  "Alimentos",
  "Hogar y decoración",
  "Deportes",
  "Belleza y cuidado personal",
  "Juguetes",
  "Automotriz",
  "Herramientas",
  "Otros",
] as const;
