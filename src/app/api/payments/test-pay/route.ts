import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { dealId, userId, amount, providerId } = await req.json();
    const supabase = await createClient();

    // 1. Crear la orden directamente como 'pagado'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId || null,
        group_deal_id: dealId,
        provider_id: providerId,
        cantidad: 1,
        total: amount,
        estado: 'pagado',
        delivery_token: btoa('order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9))
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Obtener configuración de comisión
    const { data: config } = await supabase
      .from('commission_config')
      .select('porcentaje')
      .eq('activo', true)
      .single();
    
    const commissionPercent = config?.porcentaje || 0.5;
    const commissionAmount = Number(amount) * (commissionPercent / 100);

    // 3. Registrar el pago en nuestra tabla (Simulando lo que haría el webhook)
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        order_id: order.id,
        mp_payment_id: 'test_' + Date.now(),
        monto_total: amount,
        monto_proveedor: amount - commissionAmount,
        monto_comision: commissionAmount,
        porcentaje_comision: commissionPercent,
        estado: 'approved'
      }]);

    if (paymentError) throw paymentError;

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("Test Pay Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
