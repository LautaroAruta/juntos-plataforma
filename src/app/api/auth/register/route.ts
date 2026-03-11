import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, nombre, apellido, telefono, direccion, rol = 'cliente' } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 });
    }

    // Register user in Supabase Auth
    // We pass user_metadata so the trigger can pick it up for public.users
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          apellido,
          telefono,
          direccion,
          rol
        },
      },
    });

    if (error) {
      // Professional error messages in Spanish
      let message = error.message;
      if (message.includes("User already registered")) message = "El usuario ya se encuentra registrado.";
      return NextResponse.json({ message }, { status: 400 });
    }

    return NextResponse.json({ message: "Usuario creado exitosamente", user: data.user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
