import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, action, id: webhookId } = body;
    const supabase = await createClient(true); // Use service role for webhooks

    // 0. Idempotency check
    const eventId = webhookId || data?.id?.toString() || body.id?.toString();
    if (eventId) {
      const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('id')
        .eq('provider_event_id', eventId)
        .single();
      
      if (existingEvent) {
        console.log(`Webhook event ${eventId} already processed.`);
        return NextResponse.json({ received: true, status: 'already_processed' });
      }

      // Track the event
      await supabase.from('webhook_events').insert({
        provider: 'mercadopago',
        provider_event_id: eventId,
        payload: body
      });
    }

    if (type === "payment" && data.id) {
      // 1. Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });
      const payment = await mpResponse.json();
      const mpStatus = payment.status;

      if (mpStatus === "approved") {
        const metadata = payment.metadata || {};
        const isGroupDeal = metadata.is_group_deal === true || metadata.is_group_deal === 'true';
        const dealId = isGroupDeal ? (payment.external_reference || metadata.deal_id) : null;
        const productId = !isGroupDeal ? (payment.external_reference || metadata.product_id) : metadata.product_id;
        const providerId = metadata.provider_id;
        
        // 2. Create Order in our DB (if not already exists for this mp_payment_id)
        const { data: existingPayment } = await supabase
          .from('payments')
          .select('id, order_id')
          .eq('mp_payment_id', data.id.toString())
          .single();

        let orderId = existingPayment?.order_id;

        if (!orderId) {
          let userId = metadata.user_id;
          if (!userId && payment.payer?.email) {
            const { data: user } = await supabase
              .from('users')
              .select('id')
              .eq('email', payment.payer.email)
              .single();
            userId = user?.id;
          }

            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert([{
                user_id: userId || null, 
                group_deal_id: dealId,
                product_id: productId,
                provider_id: providerId,
                cantidad: 1,
                total: payment.transaction_amount,
                estado: 'pagado'
              }])
              .select()
              .single();

          if (orderError) console.error("Error creating order:", orderError);
          orderId = order?.id;

          if (orderId && userId) {
            const { processPurchaseRewards } = await import("@/lib/services/rewardService");
            const rewardsAmount = metadata.rewards_used || 0;
            await processPurchaseRewards(userId, orderId, Number(rewardsAmount));
          }

          // Send confirmation email
          if (orderId && userId) {
            // (existing email logic)
            const { data: userData } = await supabase.from('users').select('email, nombre, barrio').eq('id', userId).single();
            
            // Log community event
            if (isGroupDeal) {
              const { data: deal } = await supabase.from('group_deals').select('products(nombre)').eq('id', dealId).single();
              const productName = (deal?.products as any)?.[0]?.nombre || 'un producto';
              
              await supabase.from('community_events').insert({
                user_name: userData?.nombre || 'Alguien',
                target_name: productName,
                event_type: 'deal_joined',
                neighborhood_id: userData?.barrio || 'su barrio',
                product_id: dealId
              });
            }

            if (userData?.email) {
              const { sendOrderConfirmationEmail } = await import("@/lib/notifications/resend");
              await sendOrderConfirmationEmail(userData.email, orderId, payment.transaction_amount);
            }
          }
        }
        
        // 3. Upsert the payment record
        await supabase.from('payments').upsert([{
          order_id: orderId,
          mp_payment_id: payment.id.toString(),
          monto_total: payment.transaction_amount,
          monto_proveedor: payment.transaction_amount - (payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0),
          monto_comision: payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0,
          porcentaje_comision: 0.5,
          estado: mpStatus,
        }], { onConflict: 'mp_payment_id' });

      } else if (mpStatus === "refunded" || mpStatus === "cancelled" || mpStatus === "rejected") {
        // Update payment status for existing record
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({ estado: mpStatus })
          .eq('mp_payment_id', data.id.toString())
          .select('order_id')
          .single();

        if (updateError) {
          console.error(`Error updating payment to ${mpStatus}:`, updateError);
        } else if (updatedPayment && (mpStatus === "refunded" || mpStatus === "cancelled")) {
          // If payment was refunded or cancelled, ensure order is marked as cancelado
          await supabase
            .from('orders')
            .update({ estado: 'cancelado' })
            .eq('id', updatedPayment.order_id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
