import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "$0";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return "$0";
  }
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

export function isDealActive(deal: any): boolean {
  if (!deal || deal.estado !== 'activo') return false;
  if (!deal.fecha_vencimiento) return true;
  
  // Robust date parsing for strings like "2026-04-16 03:07:39.572"
  let dateStr = deal.fecha_vencimiento;
  if (typeof dateStr === 'string' && !dateStr.includes('T')) {
    dateStr = dateStr.replace(' ', 'T');
    if (!dateStr.includes('Z') && !dateStr.includes('+')) {
      dateStr += 'Z'; // Assume UTC if not specified
    }
  }
  
  const expirationDate = new Date(dateStr);
  return !isNaN(expirationDate.getTime()) && expirationDate.getTime() > Date.now();
}

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
