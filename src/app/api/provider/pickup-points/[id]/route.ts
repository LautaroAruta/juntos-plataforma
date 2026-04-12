import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== 'proveedor') {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    
    // 1. Get provider_id
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!provider) {
      return NextResponse.json({ message: "Proveedor no encontrado" }, { status: 404 });
    }

    // 2. Update point
    const { data, error } = await supabase
      .from('pickup_points')
      .update(body)
      .eq('id', id)
      .eq('provider_id', provider.id) // Ensure ownership
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol !== 'proveedor') {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = params;

  try {
    // 1. Get provider_id
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (!provider) {
      return NextResponse.json({ message: "Proveedor no encontrado" }, { status: 404 });
    }

    // 2. Delete point
    const { error } = await supabase
      .from('pickup_points')
      .delete()
      .eq('id', id)
      .eq('provider_id', provider.id);

    if (error) throw error;

    return NextResponse.json({ message: "Punto de retiro eliminado" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
