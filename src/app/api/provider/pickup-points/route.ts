import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== 'proveedor') {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    // 1. Get provider_id (search by user_id or id)
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!provider) {
      return NextResponse.json({ message: "Proveedor no encontrado" }, { status: 404 });
    }

    // 2. Fetch points
    const { data: points, error } = await supabase
      .from('pickup_points')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(points);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== 'proveedor') {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, address, latitude, longitude, active, horarios, telefono_contacto } = body;

    if (!name || !address) {
      return NextResponse.json({ message: "Nombre y dirección son requeridos" }, { status: 400 });
    }

    // 1. Get provider_id (search by user_id or id)
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .or(`user_id.eq.${session.user.id},id.eq.${session.user.id}`)
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!provider) {
      return NextResponse.json({ message: "Proveedor no encontrado" }, { status: 404 });
    }

    // 2. Insert point
    const { data, error } = await supabase
      .from('pickup_points')
      .insert({
        name,
        address,
        latitude: latitude || -34.6037,
        longitude: longitude || -58.3816,
        provider_id: provider.id,
        active: active !== undefined ? active : true,
        horarios,
        telefono_contacto,
        tipo: 'provider_site'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
