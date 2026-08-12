import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    const validStates = ['confirmado', 'preparando', 'listo_para_retiro', 'entregado', 'cancelado', 'completado'];

    if (!validStates.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // 1. Get order and verify permission (provider owner)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (nombre, email),
        provider:providers!inner (user_id),
        group_deal:group_deals (
          product:products (nombre)
        )
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (order.provider.user_id !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para actualizar este pedido" }, { status: 403 });
    }

    // 2. Update status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ estado: status })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Trigger Emails
    const { sendOrderReadyEmail, sendOrderDeliveredEmail } = await import("@/lib/notifications/resend");
    const productName = order.group_deal?.product?.nombre || "un producto";

    if (status === 'listo_para_retiro' && order.user?.email) {
      await sendOrderReadyEmail(order.user.email, order.id, productName);
    } else if ((status === 'entregado' || status === 'completado') && order.user?.email) {
      await sendOrderDeliveredEmail(order.user.email, order.id, productName);
    }

    // 4. In-app Notification
    const messages: Record<string, { title: string, body: string }> = {
      'preparando': { title: 'Pedido en preparación', body: `El proveedor está preparando tu pedido de ${productName}.` },
      'listo_para_retiro': { title: '¡Pedido listo!', body: `Tu pedido de ${productName} ya está listo para retirar.` },
      'entregado': { title: '¡Pedido entregado!', body: `Confirmamos que retiraste tu pedido de ${productName}.` },
      'cancelado': { title: 'Pedido cancelado', body: `Tu pedido de ${productName} ha sido cancelado.` }
    };

    if (messages[status]) {
      await supabase.from('notifications').insert({
        user_id: order.user_id,
        title: messages[status].title,
        message: messages[status].body,
        type: 'order',
        link: '/perfil/compras'
      });
    }

    return NextResponse.json({ success: true, message: `Estado actualizado a ${status}` });

  } catch (err: any) {
    console.error("Error updating order status:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
