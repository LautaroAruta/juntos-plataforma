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
      nombreEmpresa, 
      nombreContacto, 
      telefono, 
      cuit, 
      categoria, 
      descripcion,
      direccion,
      provincia,
      localidad,
      calle,
      altura,
      codigo_postal,
      latitude,
      longitude
    } = await req.json();

    if (!email || !password || !nombreEmpresa) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    // 1. Register user in Supabase Auth with 'proveedor' role
    const { data, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombreContacto,
          rol: 'proveedor',
          telefono
        },
      },
    });

    if (authError || !data.user) {
      let message = authError?.message || "Error al crear cuenta";
      if (message.includes("User already registered")) message = "El email ya se encuentra registrado.";
      return NextResponse.json({ message }, { status: 400 });
    }

    // 2. Insert into public.providers
    // The trigger 'handle_new_user' will automatically create the record in public.users as well
    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .insert({
        id: data.user.id, // Use the same ID as auth.users
        nombre_empresa: nombreEmpresa,
        nombre_contacto: nombreContacto,
        email: email,
        telefono: telefono,
        cuit_rut: cuit,
        categoria: categoria,
        descripcion: descripcion,
        direccion: direccion,
        provincia: provincia,
        localidad: localidad,
        calle: calle,
        altura: altura,
        codigo_postal: codigo_postal,
        latitude: latitude,
        longitude: longitude,
        verificado: false
      });

    if (providerError) {
      console.error("Provider insertion error:", providerError);
      // Even if provider insertion fails, auth user is created. 
      // In a real app we might want to rollback, but for now we'll just log.
      return NextResponse.json({ message: "Error al crear perfil de proveedor" }, { status: 500 });
    }

    return NextResponse.json({ message: "Proveedor registrado exitosamente", user: data.user }, { status: 201 });
  } catch (error) {
    console.error("Registration provider error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
