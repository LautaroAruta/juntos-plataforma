import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'BANDHA <comunidad@bandha.com.ar>',
        to: [to],
        subject: subject,
        html: html
      })
    })
  } catch (err) {
    console.error("Error sending email:", err)
  }
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const now = new Date().toISOString()

  // 1. Fetch expired active deals with product data (for the email)
  const { data: expiredDeals, error: fetchError } = await supabase
    .from('group_deals')
    .select('id, participantes_actuales, min_participantes, product:products(nombre)')
    .eq('estado', 'activo')
    .lte('fecha_vencimiento', now)

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
  }

  const results = { successful: 0, failed: 0, errors: [] as string[] }

  for (const deal of expiredDeals || []) {
    const isSuccess = deal.participantes_actuales >= deal.min_participantes
    const newState = isSuccess ? 'finalizado' : 'cancelado'
    const productName = (deal.product as any)?.nombre || "tu producto"

    // Update deal state
    const { error: updateError } = await supabase
      .from('group_deals')
      .update({ estado: newState })
      .eq('id', deal.id)
    
    if (updateError) {
      results.errors.push(`Error updating deal ${deal.id}: ${updateError.message}`)
      continue
    }

    // Fetch all orders for this deal
    const { data: dealOrders } = await supabase
      .from('orders')
      .select('id, user_id, total, user:users(email, nombre)')
      .eq('group_deal_id', deal.id)

    for (const order of dealOrders || []) {
      const user = (order.user as any)
      if (!user?.email) continue

      if (isSuccess) {
        // Success notification
        await sendEmail(
          user.email,
          `¡Buenas noticias! Se completó el grupo de ${productName}`,
          `<h1>¡Felicidades, ${user.nombre}!</h1>
           <p>El grupo para <strong>${productName}</strong> alcanzó el objetivo.</p>
           <p>Ya podés retirar tu producto en el punto de entrega con tu código QR.</p>`
        )
      } else {
        // Failure: Refund and notify
        // 1. MP Refund
        const { data: payment } = await supabase
          .from('payments')
          .select('mp_payment_id')
          .eq('order_id', order.id)
          .single()

        if (payment?.mp_payment_id && MP_ACCESS_TOKEN) {
          try {
            await fetch(`https://api.mercadopago.com/v1/payments/${payment.mp_payment_id}/refunds`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            })
          } catch (err) {
            results.errors.push(`Refund error for MP ${payment.mp_payment_id}: ${err.message}`)
          }
        }

        // 2. Notify failure
        await sendEmail(
          user.email,
          `La oferta de ${productName} ha sido cancelada`,
          `<h1>Lo sentimos, ${user.nombre}</h1>
           <p>Lamentablemente no llegamos al mínimo de vecinos para la oferta de <strong>${productName}</strong>.</p>
           <p>Tu dinero ha sido devuelto automáticamente a tu medio de pago original.</p>`
        )
      }
    }

    if (isSuccess) results.successful++
    else results.failed++
  }

  return new Response(JSON.stringify({ message: "Expired deals processed", results }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
