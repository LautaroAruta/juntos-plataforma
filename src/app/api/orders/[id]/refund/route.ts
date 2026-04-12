import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const orderId = params.id;

    // 1. Verificar sesión del usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener la orden y verificar que pertenezca al usuario
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, payments (*)")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }

    if (order.arrepentimiento_solicitado) {
      return NextResponse.json({ message: "La devolución ya fue solicitada" }, { status: 400 });
    }

    // 3. Validar ventana de 10 días para pedidos entregados
    if (order.estado === 'entregado' && order.qr_escaneado_en) {
      const deliveryDate = new Date(order.qr_escaneado_en);
      const now = new Date();
      const diffTime = now.getTime() - deliveryDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays > 10) {
        return NextResponse.json({ message: "El plazo legal de 10 días para el arrepentimiento ha expirado" }, { status: 400 });
      }
    } else if (!['pagado', 'pendiente_retiro', 'entregado'].includes(order.estado)) {
      return NextResponse.json({ message: "Esta orden no se puede cancelar por arrepentimiento en su estado actual" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "No se especificó un motivo.";

    // 4. Marcar la orden como devuelta en la BD
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        arrepentimiento_solicitado: true,
        fecha_arrepentimiento: new Date().toISOString(),
        motivo_arrepentimiento: reason,
        estado: 'cancelado' 
      })
      .eq("id", orderId);

    if (updateError) {
      throw new Error("Error actualizando la orden");
    }

    // 5. Insertar mensaje de sistema en el chat para avisar al proveedor
    await supabase.from('chat_messages').insert([{
      order_id: orderId,
      sender_id: user.id,
      sender_type: 'sistema',
      mensaje: `SISTEMA: El cliente ha solicitado la cancelación de la orden amparado por el Derecho de Arrepentimiento. \n\nMotivo: ${reason}\n\nEl proceso de reembolso ha sido iniciado.`
    }]);

    // 6. Intentar reembolso automático en Mercado Pago
    // Buscar el payment_id asociado (si la orden ya fue pagada)
    const payment = order.payments?.[0];
    // Ya validamos arriba que el estado es elegible para MP si tenía pago
    
    if (payment && payment.mp_payment_id) {
      try {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${payment.mp_payment_id}/refunds`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.MP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({})
          }
        );

        if (!mpResponse.ok) {
          const errorData = await mpResponse.json();
          console.error("Error en reembolso MP:", errorData);
          
          // Persistent logging
          const { logError } = await import("@/lib/utils/logger");
          await logError({
            service: 'mercadopago',
            eventType: 'refund_failed',
            severity: 'critical',
            message: `Failed to refund payment ${payment.mp_payment_id}: ${errorData.message || 'Unknown error'}`,
            payload: errorData,
            orderId: orderId,
            userId: user.id
          });
        }
      } catch (mpError: any) {
        console.error("Error de Red al intentar reembolso en MP:", mpError);
        const { logError } = await import("@/lib/utils/logger");
        await logError({
            service: 'mercadopago',
            eventType: 'refund_network_error',
            message: mpError.message || "Network error during refund",
            payload: { error: mpError },
            orderId: orderId,
            userId: user.id
        });
      }
    }

    return NextResponse.json({ success: true, message: "Devolución procesada correctamente" });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
