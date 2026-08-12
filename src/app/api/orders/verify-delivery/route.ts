import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 });
    }

    // 1. Find the order with this token
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (nombre, apellido),
        pickup_point:pickup_points (name, address),
        group_deal:group_deals (
          product:products (nombre, imagen_principal)
        ),
        provider:providers!inner(id, user_id)
      `)
      .eq('delivery_token', token)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Pedido no encontrado o código inválido" }, { status: 404 });
    }

    // 2. Verify the authenticated user is the provider owner
    if (order.provider.user_id !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para entregar este pedido" }, { status: 403 });
    }

    // 3. Verify order state
    if (order.estado === 'entregado') {
      return NextResponse.json({ error: "El pedido ya fue entregado previamente" }, { status: 400 });
    }
    
    if (order.estado === 'pendiente_pago' || order.estado === 'cancelado') {
      return NextResponse.json({ error: `El pedido está en estado: ${order.estado}` }, { status: 400 });
    }

    // 4. Update order to 'entregado'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        estado: 'entregado',
        qr_escaneado: true,
        qr_escaneado_en: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) throw updateError;
    
    // 5. Send delivery confirmation email
    if (order.user?.email) {
      const { sendOrderDeliveredEmail } = await import("@/lib/notifications/resend");
      const productName = order.group_deal?.product?.nombre || "un producto";
      await sendOrderDeliveredEmail(order.user.email, order.id, productName);
    }

    // 6. Push In-app Notification
    await supabase.from('notifications').insert({
      user_id: order.user_id,
      title: '¡Pedido Entregado!',
      message: `Confirmamos la entrega de: ${order.group_deal?.product?.nombre || 'Producto'}`,
      type: 'order',
      link: '/perfil/compras'
    });

    return NextResponse.json({ 
      success: true, 
      message: "Pedido entregado con éxito",
      orderDetails: {
          id: order.id,
          productName: order.group_deal?.product?.nombre || "Producto",
          productImage: order.group_deal?.product?.imagen_principal,
          customerName: `${order.user?.nombre} ${order.user?.apellido}`,
          pickupPointName: order.pickup_point?.name || "Proveedor (Directo)",
          total: order.total
      }
    });

  } catch (err: any) {
    console.error("Error verifying delivery:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
