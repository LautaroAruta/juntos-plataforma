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
        const dealId = payment.external_reference;
        
        // 2. Update order/payment in our DB
        // (Assuming we created a pending order record before redirect, 
        // or we create it now on webhook)
        
        // 3. Atomically increment participation
        const { error: rpcError } = await supabase.rpc('join_group_deal', { target_deal_id: dealId });
        
        if (rpcError) throw rpcError;
        
        // 4. Record the payment record
        await supabase.from('payments').insert([{
          mp_payment_id: payment.id.toString(),
          monto_total: payment.transaction_amount,
          monto_proveedor: payment.transaction_amount - payment.fee_details.find((f: any) => f.type === 'marketplace_fee')?.amount || 0,
          monto_comision: payment.fee_details.find((f: any) => f.type === 'marketplace_fee')?.amount || 0,
          porcentaje_comision: 0.5, // should be dynamic
          estado: payment.status,
          // order_id would be here too
        }]);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
