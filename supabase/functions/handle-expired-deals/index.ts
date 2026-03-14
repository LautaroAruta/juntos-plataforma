import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()

  // 1. Fetch expired active deals
  const { data: expiredDeals, error: fetchError } = await supabase
    .from('group_deals')
    .select('id, participantes_actuales, min_participantes')
    .eq('estado', 'activo')
    .lte('fecha_vencimiento', now)

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (const deal of expiredDeals || []) {
    if (deal.participantes_actuales >= deal.min_participantes) {
      // Deal successful!
      const { error } = await supabase
        .from('group_deals')
        .update({ estado: 'finalizado' })
        .eq('id', deal.id)
      
      if (error) results.errors.push(`Error finishing deal ${deal.id}: ${error.message}`)
      else results.successful++
    } else {
      // Deal failed to reach quorum
      const { error } = await supabase
        .from('group_deals')
        .update({ estado: 'cancelado' })
        .eq('id', deal.id)
      
      if (error) {
        results.errors.push(`Error cancelling deal ${deal.id}: ${error.message}`)
      } else {
        // 1. Fetch orders for this deal to refund
        const { data: dealOrders } = await supabase
            .from('orders')
            .select('id, user_id, rewards_used')
            .eq('group_deal_id', deal.id);

        for (const order of dealOrders || []) {
            // Restore wallet balance if used
            if (Number(order.rewards_used) > 0) {
                await supabase.rpc('process_delivery_rewards', {
                    target_user_id: order.user_id,
                    saved_amount: order.rewards_used, // Restore actually means "add back"
                    zone: 'Caballito/Almagro' // Dummy zone for stats
                });
            }

            // Trigger MP Refund (Placeholder for real implementation)
            // Fetch payment ID first
            const { data: payment } = await supabase
                .from('payments')
                .select('mp_payment_id')
                .eq('order_id', order.id)
                .single();

            if (payment?.mp_payment_id) {
                try {
                    await fetch(`https://api.mercadopago.com/v1/payments/${payment.mp_payment_id}/refunds`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`
                        }
                    });
                } catch (err) {
                    results.errors.push(`Refund error for order ${order.id}: ${err.message}`);
                }
            }
        }
        results.failed++
      }
    }
  }

  return new Response(JSON.stringify({ 
    message: "Expired deals processed", 
    results 
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
