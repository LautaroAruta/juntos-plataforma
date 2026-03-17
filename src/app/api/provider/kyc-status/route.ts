import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { data: provider, error } = await supabaseAdmin
      .from("providers")
      .select("estado_kyc, kyc_notas, nombre_empresa, creado_en")
      .eq("id", session.user.id)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        { 
          estado_kyc: "pendiente", 
          kyc_notas: null, 
          nombre_empresa: null, 
          creado_en: null 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(provider, { status: 200 });
  } catch (error) {
    console.error("KYC status error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
