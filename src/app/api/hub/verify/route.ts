import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API: Hub Operations (Receive/Deliver)
 * 
 * Este endpoint es llamado por el encargado de un Punto JUNTOS (Hub).
 * Lógica:
 * 1. Si la orden está 'pagada', el hub la recibe del proveedor -> estado 'pendiente_retiro' y hub_reception 'recibido'.
 * 2. Si la orden está 'pendiente_retiro' y en el hub, se entrega al cliente -> estado 'entregado' y hub_reception 'entregado'.
 */
export async function POST(req: Request) {
  try {
    const { orderId, action } = await req.json(); // action: 'receive' | 'deliver'
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    // 1. Verificar que el usuario sea manager de algún hub
    const { data: hub, error: hError } = await supabase
      .from('pickup_points')
      .select('id, name')
      .eq('manager_id', user.id)
      .eq('tipo', 'juntos_hub')
      .maybeSingle();

    if (hError || !hub) {
      return NextResponse.json({ message: "No tenés permisos de encargado de Hub." }, { status: 403 });
    }

    // 2. Obtener la orden
    const { data: order, error: oError } = await supabase
      .from('orders')
      .select('id, estado, pickup_point_id')
      .eq('id', orderId)
      .single();

    if (oError || !order) {
      return NextResponse.json({ message: "Orden no encontrada." }, { status: 404 });
    }

    if (order.pickup_point_id !== hub.id) {
       return NextResponse.json({ message: "Esta orden no pertenece a este Punto de Retiro." }, { status: 400 });
    }

    if (action === 'receive') {
      if (order.estado !== 'pagado') {
        return NextResponse.json({ message: "Solo se pueden recibir órdenes pagadas." }, { status: 400 });
      }

      await supabase.from('orders').update({ estado: 'pendiente_retiro' }).eq('id', orderId);
      await supabase.from('hub_receptions').insert({
        order_id: orderId,
        hub_id: hub.id,
        estado: 'recibido',
        notas: `Recibido en Hub ${hub.name} por manager ${user.id}`
      });

      return NextResponse.json({ success: true, message: "¡Pedido recibido en el Hub!" });

    } else if (action === 'deliver') {
      if (order.estado !== 'pendiente_retiro') {
        return NextResponse.json({ message: "La orden no está lista para retiro." }, { status: 400 });
      }

      await supabase.from('orders').update({ 
        estado: 'entregado',
        qr_escaneado: true,
        qr_escaneado_en: new Date().toISOString()
      }).eq('id', orderId);

      await supabase.from('hub_receptions').insert({
        order_id: orderId,
        hub_id: hub.id,
        estado: 'entregado',
        notas: `Entregado al cliente en Hub ${hub.name}`
      });

      // Registrar en log general
      await supabase.from('order_deliveries').insert({
        order_id: orderId,
        verification_method: 'qr_hub',
        notes: `Entregado en Hub: ${hub.id}`
      });

      return NextResponse.json({ success: true, message: "¡Entrega al cliente exitosa!" });
    }

    return NextResponse.json({ message: "Acción no válida." }, { status: 400 });

  } catch (error: any) {
    console.error("❌ Hub API Error:", error.message);
    return NextResponse.json({ message: "Error interno en el Hub." }, { status: 500 });
  }
}
