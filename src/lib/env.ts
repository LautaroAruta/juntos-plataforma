import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(), // Solo servidor

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // Mercado Pago
  MP_ACCESS_TOKEN: z.string().min(1),
  MP_CLIENT_ID: z.string().min(1),
  MP_CLIENT_SECRET: z.string().min(1).optional(), // Algunos flujos lo requieren

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1),
  SYSTEM_EMAIL_SENDER: z.string().email().default('hola@bandha.com.ar'),

  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Para uso en cliente (solo variables NEXT_PUBLIC_*)
export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
