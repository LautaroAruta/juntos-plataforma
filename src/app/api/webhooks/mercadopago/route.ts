import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

/**
 * WEBHOOK: Mercado Pago IPN / Notifications
 * 
 * Este endpoint recibe las notificaciones de cambio de estado de los pagos.
 * Aquí es donde completamos el ciclo:
 * 1. Verificamos el pago en MP.
 * 2. Marcamos la orden como 'pagada' en nuestra DB.
 * 3. Descontamos el stock de los productos vendidos.
 */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("data.id");

    // Solo procesamos notificaciones de tipo 'payment'
    if (type !== "payment" || !id) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();

    // 1. Consultar el pago detallado en Mercado Pago para mayor seguridad
    const mpPayment = new Payment(client);
    const paymentData = await mpPayment.get({ id });

    // 2. Extraer el external_reference (que es nuestro ORDER_ID)
    const orderId = paymentData.external_reference;
    const status = paymentData.status;

    if (!orderId) {
      console.warn("⚠️ Webhook MP: No se encontró external_reference en el pago", id);
      return NextResponse.json({ received: true });
    }

    // 3. Si el pago está aprobado, actualizamos nuestra base de datos
    if (status === "approved") {
      console.log(`✅ Pago Aprobado: Orden ${orderId}. Procesando stock y estado...`);

      // A. Cambiar estado de la orden
      const { error: orderError } = await supabase
        .from('orders')
        .update({ estado: 'pagado' })
        .eq('id', orderId);

      if (orderError) throw new Error(`Error actualizando orden: ${orderError.message}`);

      // B. Obtener ítems de la orden para descontar stock
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (itemsError || !items) throw new Error("Error obteniendo ítems de la orden");

      // C. Descontar stock (Batch update simulado con loops por ahora)
      // Nota: En producción masiva, se recomienda usar una RPC o Stored Procedure para evitar race conditions.
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          row_id: item.product_id,
          count: item.quantity
        });
        
        if (stockError) {
          console.error(`❌ Error descontando stock para ${item.product_id}:`, stockError);
          // Opcional: registrar en tabla de errores pero continuar
        }
      }
      
      // D. Registrar pago en tabla payments
      await supabase.from('payments').insert({
        order_id: orderId,
        mp_payment_id: id,
        monto_total: paymentData.transaction_amount,
        // Calcular comisiones si es necesario aquí o usar info de metadata
        monto_proveedor: paymentData.transaction_amount, 
        monto_comision: 0, 
        porcentaje_comision: 0,
        estado: status
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Webhook Mercado Pago Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
