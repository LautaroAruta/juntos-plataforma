import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { telefono } = await req.json();

    if (!telefono) {
      return NextResponse.json({ message: "Teléfono requerido" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ telefono })
      .eq("id", session.user.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Perfil actualizado" }, { status: 200 });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
