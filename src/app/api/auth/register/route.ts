import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateReferralCode } from "@/lib/utils";
import { sendPremiumEmail } from "@/lib/services/emailService";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
  apellido: z.string().min(2),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  rol: z.enum(['cliente', 'proveedor']).default('cliente'),
  referralCode: z.string().optional(),
  documento_tipo: z.string().optional(),
  documento_numero: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  registration_step: z.number().optional(),
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const json = await req.json();
    
    // 0. Validation
    const result = registerSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ message: "Datos de registro inválidos", errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      telefono, 
      direccion, 
      rol, 
      referralCode,
      documento_tipo,
      documento_numero,
      fecha_nacimiento,
      registration_step = 0
    } = result.data;

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // 1. Check if user already exists in Auth (e.g. from OTP flow)
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = listData.users.find(u => u.email === email);

    let authUser = null;

    if (existingAuthUser) {
      // Update existing user with password and metadata
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { 
          password,
          user_metadata: {
            nombre,
            apellido,
            telefono,
            direccion,
            rol,
            documento_tipo,
            documento_numero,
            fecha_nacimiento,
            registration_step
          }
        }
      );
      if (updateError) throw updateError;
      authUser = updateData.user;
    } else {
      // Traditional Register user in Supabase Auth
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido,
            telefono,
            direccion,
            rol,
            documento_tipo,
            documento_numero,
            fecha_nacimiento,
            registration_step
          },
        },
      });

      if (error) {
        let message = error.message;
        
        // Error especial para bypass en desarrollo
        if (message.includes("Email rate limit exceeded") && process.env.NODE_ENV === 'development') {
          console.warn("Rate limit exceeded, fallback to admin.createUser");
          const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              nombre,
              apellido,
              telefono,
              direccion,
              rol,
              documento_tipo,
              documento_numero,
              fecha_nacimiento,
              registration_step
            }
          });
          if (adminError) throw adminError;
          authUser = adminData.user;
        } else {
          if (message.includes("User already registered")) message = "El usuario ya se encuentra registrado.";
          if (message.includes("Email rate limit exceeded")) message = "Límite de correos excedido. Por favor, intenta de nuevo en una hora o contacta a soporte.";
          return NextResponse.json({ message }, { status: 400 });
        }
      } else {
        authUser = data.user;
      }
    }

    let referredById = null;
    if (referralCode) {
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      if (referrer) referredById = referrer.id;
    }

    if (authUser) {
      // 2. Generate referral code for the new user
      const userReferralCode = generateReferralCode();

      // Upsert record in public.users
      const { error: dbError } = await supabaseAdmin.from('users').upsert({
        id: authUser.id,
        nombre,
        apellido,
        email,
        telefono,
        rol,
        fecha_nacimiento,
        documento_tipo,
        documento_numero,
        registration_step,
        referral_code: userReferralCode,
        referred_by_id: referredById // Link the referrer here
      }, { onConflict: 'email' });

      if (dbError) {
        console.error("Error creating public user record:", dbError);
      } else {
        // 2.1 Send Welcome Email
        try {
          await sendPremiumEmail({
            to: email,
            subject: "¡Bienvenido a BANDHA! 🐧",
            title: `¡Hola ${nombre}!`,
            body: `<p>Estamos felices de tenerte con nosotros. BANDHA es la forma más inteligente de comprar: <strong>juntos</strong>.</p>
                   <p>Tu cuenta ya está activa. Empezá a ahorrar uniéndote a ofertas grupales en tu barrio o invitando a tus amigos para ganar saldo.</p>
                   <p>Tu código de referido es: <strong>${userReferralCode}</strong></p>`,
            buttonText: "Explorar Ofertas",
            buttonLink: "https://bandha.com.ar/productos"
          });
        } catch (emailErr) {
          console.error("Error sending welcome email:", emailErr);
        }
      }
    }

    // The referred_by_id is already handled in the upsert above, 
    // and the tr_referral_bonus trigger awards the $500 automatically.

    return NextResponse.json({ message: "Usuario creado exitosamente", user: authUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
