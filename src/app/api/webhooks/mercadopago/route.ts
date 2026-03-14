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
        const dealId = payment.external_reference || metadata.deal_id;
        const pickupPointId = metadata.pickup_point_id;
        const rewardsAmount = Number(metadata.rewards_amount || 0);
        
        // 2. Create Order in our DB
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: payment.additional_info?.items?.[0]?.category_id || null, 
            group_deal_id: dealId,
            pickup_point_id: pickupPointId,
            cantidad: 1,
            total: payment.transaction_amount,
            rewards_used: rewardsAmount,
            estado: 'pagado'
          }])
          .select()
          .single();

        if (orderError) console.error("Error creating order:", orderError);

        // 2b. Deduct rewards from wallet if used
        if (rewardsAmount > 0 && order?.user_id) {
           await supabase.rpc('use_wallet_balance', { 
             target_user_id: order.user_id, 
             amount: rewardsAmount 
           });
        }

        // 3. Atomically increment participation
        const { error: rpcError } = await supabase.rpc('join_group_deal', { target_deal_id: dealId });
        
        if (rpcError) throw rpcError;
        
        // 4. Record the payment record
        await supabase.from('payments').insert([{
          order_id: order?.id,
          mp_payment_id: payment.id.toString(),
          monto_total: payment.transaction_amount,
          monto_proveedor: payment.transaction_amount - (payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0),
          monto_comision: payment.fee_details?.find((f: any) => f.type === 'marketplace_fee')?.amount || 0,
          porcentaje_comision: 0.5,
          estado: payment.status,
        }]);

        // 5. Trigger Referral Processing (Edge Function)
        if (order) {
            // Send Order Confirmation Email
            const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', order.user_id)
                .single();

            if (userData?.email) {
                const { sendOrderConfirmationEmail } = await import("@/lib/notifications/resend");
                sendOrderConfirmationEmail(userData.email, order.id, order.total);
            }

            fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-referral`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ userId: order.user_id })
            }).catch(err => console.error("Referral trigger error:", err));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
