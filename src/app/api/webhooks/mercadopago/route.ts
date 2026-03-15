import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;
    const supabase = await createClient();

    if (type === "payment" && data.id) {
      // 1. Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      const payment = await mpResponse.json();

      if (payment.status === "approved") {
        const metadata = payment.metadata || {};
        // Priorizar external_reference si está presente, fallback a metadata
        const dealId = payment.external_reference || metadata.deal_id;
        const pickupPointId = metadata.pickup_point_id;
        const rewardsAmount = Number(metadata.rewards_amount || 0);
        
        // El user_id debería venir en los metadatos o buscarse por email del pagador
        let userId = metadata.user_id;

        if (!userId && payment.payer?.email) {
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', payment.payer.email)
            .single();
          userId = user?.id;
        }
        
        // 2. Create Order in our DB
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: userId || null, 
            group_deal_id: dealId,
            // pickup_point_id: pickupPointId, // Asegurarse que la columna existe en el esquema
            cantidad: 1,
            total: payment.transaction_amount,
            // rewards_used: rewardsAmount, // Asegurarse que la columna existe en el esquema
            estado: 'pagado'
          }])
          .select()
          .single();

        if (orderError) console.error("Error creating order:", orderError);

        // 3. Increment participation in Group Deal
        const { error: rpcError } = await supabase.rpc('join_group_deal', { target_deal_id: dealId });
        
        if (rpcError) console.error("RPC Error (join_group_deal):", rpcError);
        
        // 4. Record the payment record
        await supabase.from('payments').insert([{
          order_id: order?.id,
          mp_payment_id: payment.id.toString(),
          monto_total: payment.transaction_amount,
          // Cálculo de comisiones basado en fee_details si está disponible
          monto_proveedor: payment.transaction_amount - (payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0),
          monto_comision: payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0,
          porcentaje_comision: 0.5,
          estado: payment.status,
        }]);

        // 5. Send order confirmation email
        if (order && userId) {
            const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

            if (userData?.email) {
                const { sendOrderConfirmationEmail } = await import("@/lib/notifications/resend");
                await sendOrderConfirmationEmail(userData.email, order.id, order.total);
            }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
