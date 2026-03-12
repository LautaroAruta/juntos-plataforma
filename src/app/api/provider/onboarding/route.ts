import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
       return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { 
      nombreEmpresa, 
      nombreContacto, 
      telefono, 
      cuit, 
      categoria, 
      descripcion 
    } = await req.json();

    const { error: providerError } = await supabaseAdmin
      .from('providers')
      .insert({
        id: session.user.id,
        nombre_empresa: nombreEmpresa,
        nombre_contacto: nombreContacto,
        email: session.user.email,
        telefono: telefono,
        cuit_rut: cuit,
        categoria: categoria,
        descripcion: descripcion,
        verificado: false
      });

    if (providerError) {
      console.error("Provider insertion error:", providerError);
      return NextResponse.json({ message: "Error al crear perfil de proveedor" }, { status: 500 });
    }

    // Actualizar el rol en la tabla users
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ rol: 'proveedor' })
      .eq('id', session.user.id);

    if (userUpdateError) {
      console.error("User role update error:", userUpdateError);
      return NextResponse.json({ message: "Perfil guardado, pero hubo un error al asignar el rol." }, { status: 500 });
    }

    return NextResponse.json({ message: "Proveedor completado exitosamente" }, { status: 201 });
  } catch (error) {
    console.error("Provider onboarding error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
