import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      telefono, 
      direccion, 
      rol = 'cliente', 
      referralCode,
      documento_tipo,
      documento_numero,
      fecha_nacimiento,
      registration_step = 0
    } = await req.json();

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
        if (message.includes("User already registered")) message = "El usuario ya se encuentra registrado.";
        return NextResponse.json({ message }, { status: 400 });
      }
      authUser = data.user;
    }

    if (authUser) {
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
        registration_step
      }, { onConflict: 'email' });

      if (dbError) {
        console.error("Error creating public user record:", dbError);
        // We don't necessarily want to fail the whole request if signUp worked,
        // but it will cause issues later. For now, let's log it.
      }
    }

    // Handle referral if code provided
    if (referralCode && authUser) {
      const { data: referrer, error: referrerError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (!referrerError && referrer) {
        await supabaseAdmin.from('referrals').insert({
          referrer_id: referrer.id,
          referred_id: authUser.id,
          status: 'pending'
        });
      }
    }

    return NextResponse.json({ message: "Usuario creado exitosamente", user: authUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
