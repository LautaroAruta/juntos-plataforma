import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API: Verify QR Order
 * 
 * Este endpoint es llamado por el proveedor al escanear un QR.
 * Valida:
 * 1. Que la orden exista.
 * 2. Que el estado sea 'pagado' o 'pendiente_retiro'.
 * 3. Que el proveedor que escanea tenga productos en esa orden.
 * 4. Actualiza el estado a 'entregado'.
 */
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const supabase = await createClient();

    // 0. Obtener el usuario autenticado (debe ser el proveedor)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    // 1. Buscar el provider_id del usuario logueado
    const { data: provider, error: pError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (pError || !provider) {
      return NextResponse.json({ message: "No se encontró perfil de proveedor para este usuario." }, { status: 403 });
    }

    // 2. Verificar la orden y si pertenece a este proveedor (vía order_items)
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        order:orders (id, estado)
      `)
      .eq('order_id', orderId)
      .eq('provider_id', provider.id);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: "La orden no existe o no contiene productos de tu tienda." }, { status: 404 });
    }

    const orderData: any = orderItems[0].order;
    const orderStatus = Array.isArray(orderData) ? orderData[0].estado : orderData.estado;

    // 3. Validar estado para entrega
    if (orderStatus === 'entregado') {
      return NextResponse.json({ message: "Esta orden ya fue entregada anteriormente." }, { status: 400 });
    }

    if (orderStatus === 'pendiente_pago') {
      return NextResponse.json({ message: "La orden aún no ha sido pagada. No se puede entregar." }, { status: 400 });
    }

    // 4. Marcar como entregado (Solo los items del proveedor o la orden completa si es multicarrito?)
    // Por simplicidad en esta fase, si el proveedor valida su parte, marcamos la orden como entregada.
    // En una fase futura más compleja, podríamos tener estados por item.
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        estado: 'entregado',
        qr_escaneado: true,
        qr_escaneado_en: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 5. Registrar en log de entregas
    await supabase.from('order_deliveries').insert({
      order_id: orderId,
      verification_method: 'qr',
      notes: `Entregado por proveedor: ${provider.id}`
    });

    return NextResponse.json({ 
      success: true, 
      message: "¡Orden verificada y entregada con éxito!" 
    });

  } catch (error: any) {
    console.error("❌ QR Verification Error:", error.message);
    return NextResponse.json({ message: "Error interno al verificar el QR." }, { status: 500 });
  }
}
