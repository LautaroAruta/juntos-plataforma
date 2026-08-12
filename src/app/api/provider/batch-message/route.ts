import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { dealId, message } = await req.json();

    if (!dealId || !message) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify provider permission
    const { data: deal, error: dealError } = await supabase
      .from('group_deals')
      .select('id, product:products(provider_id)')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ message: "Oferta no encontrada" }, { status: 404 });
    }

    const product: any = Array.isArray(deal.product) ? deal.product[0] : deal.product;

    if (product.provider_id !== session.user.id && session.user.rol !== 'admin') {
      return NextResponse.json({ message: "No tenés permiso" }, { status: 403 });
    }

    // 2. Get all orders for this deal
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('group_deal_id', dealId)
      .in('estado', ['pagado', 'pendiente_retiro', 'entregado'])
      .eq('arrepentimiento_solicitado', false);

    if (ordersError) throw ordersError;

    // 3. Insert messages batch
    const messagesToInsert = orders.map(order => ({
      order_id: order.id,
      sender_id: session.user.id,
      mensaje: message, // Unified field name
      sender_type: 'proveedor', // Unified field name
      leido: false
    }));

    if (messagesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('chat_messages') // Unified table name
        .insert(messagesToInsert);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: messagesToInsert.length });

  } catch (error: any) {
    console.error("Batch message error:", error);
    return NextResponse.json({ message: "Error al enviar mensajes", error: error.message }, { status: 500 });
  }
}
