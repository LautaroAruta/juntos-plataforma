import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { awardXp, checkAndAwardBadges, XP_REWARDS } from "@/lib/gamification";

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

      // E. GAMIFICACIÓN: Otorgar XP y verificar medallas
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id, total')
        .eq('id', orderId)
        .single();

      if (orderData) {
        // En JUNTOS, el ahorro es aproximadamente el 30-50% del total. 
        // Por simplicidad, otorgamos 1 XP por cada peso del total pagado, 
        // asumiendo que el valor ahorrado es proporcional.
        const xpAmount = Math.floor(Number(orderData.total) * XP_REWARDS.PER_PESO_SAVED);
        await awardXp(supabase, orderData.user_id, xpAmount);

        // Verificar medallas de 'deals_joined'
        const { count: dealsCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', orderData.user_id)
          .eq('estado', 'pagado');
        
        await checkAndAwardBadges(supabase, orderData.user_id, 'deals_joined', dealsCount || 0);
        
        // Verificar medallas de 'savings'
        const { data: userStats } = await supabase
          .from('users')
          .select('total_saved')
          .eq('id', orderData.user_id)
          .single();

        if (userStats) {
          await checkAndAwardBadges(supabase, orderData.user_id, 'savings', Number(userStats.total_saved) || 0);
        }

        // F. SOSTENIBILIDAD: Calcular CO2 ahorrado (0.5kg por orden local pickup)
        const CO2_PER_ORDER = 0.5;
        const { data: userData } = await supabase
          .from('users')
          .select('id, neighborhood, carbon_saved')
          .eq('id', orderData.user_id)
          .single();

        if (userData) {
          // Update user CO2 metrics
          const newCarbonSaved = (Number(userData.carbon_saved) || 0) + CO2_PER_ORDER;
          await supabase.from('users').update({ carbon_saved: newCarbonSaved }).eq('id', userData.id);

          // Update neighborhood metrics
          if (userData.neighborhood) {
            const { data: nhImpact } = await supabase
              .from('neighborhood_impact')
              .select('*')
              .eq('zone_name', userData.neighborhood)
              .maybeSingle();

            if (nhImpact) {
              await supabase.from('neighborhood_impact')
                .update({ 
                  carbon_saved_total: (Number(nhImpact.carbon_saved_total) || 0) + CO2_PER_ORDER,
                  total_collective_savings: (Number(nhImpact.total_collective_savings) || 0) + (Number(orderData.total) * 0.3) // Estimación ahorro
                })
                .eq('zone_name', userData.neighborhood);
            } else {
              // Create neighborhood entry if not exists
              await supabase.from('neighborhood_impact').insert({
                zone_name: userData.neighborhood,
                carbon_saved_total: CO2_PER_ORDER,
                total_collective_savings: (Number(orderData.total) * 0.3),
                active_users_count: 1
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Webhook Mercado Pago Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
