import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

async function sendEmail(to: string, subject: string, title: string, body: string, buttonText?: string, buttonLink?: string) {
  if (!RESEND_API_KEY) return;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
          .header { background: #0f172a; padding: 40px 20px; text-align: center; }
          .content { padding: 40px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-top: 0; text-transform: uppercase; letter-spacing: -0.025em; }
          p { margin-bottom: 20px; font-size: 16px; color: #475569; }
          .button { display: inline-block; background: #009EE3; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em; box-shadow: 0 4px 6px -1px rgba(0, 158, 227, 0.2); }
          .logo { color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; margin: 0; }
          .accent { color: #009EE3; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">BANDHA<span class="accent">.</span></h1>
          </div>
          <div class="content">
            <h1>${title}</h1>
            ${body}
            ${buttonText ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${buttonLink}" class="button">${buttonText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p style="margin: 0;">© 2026 BANDHA. Plataforma de Compras Comunitarias.</p>
            <p style="margin: 5px 0;">Recoleta • Palermo • Belgrano</p>
            <div style="margin-top: 15px; border-top: 1px solid #e2e8f0; pt-15px;">
              <p style="font-size: 10px;">Este mensaje es automático. Según la ley argentina, tenés derecho de arrepentimiento por 10 días desde la entrega.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

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

    // Fetch all orders for this deal with wallet usage data
    const { data: dealOrders } = await supabase
      .from('orders')
      .select('id, user_id, total, rewards_used, user:users(email, nombre)')
      .eq('group_deal_id', deal.id)

    for (const order of dealOrders || []) {
      const user = (order.user as any)
      if (!user?.email) continue

      if (isSuccess) {
        // Success: Update order status to 'pendiente_retiro'
        await supabase
          .from('orders')
          .update({ estado: 'pendiente_retiro' })
          .eq('id', order.id)

        // Add In-app notification
        await supabase.from('notifications').insert({
          user_id: order.user_id,
          title: "¡Tu pedido está listo! 📦",
          message: `El grupo para "${productName}" se completó. Ya podés pasar a retirarlo.`,
          type: 'order',
          link: `/pedidos`
        })

        // Success notification
        await sendEmail(
          user.email,
          `¡Buenas noticias! Se completó el grupo de ${productName}`,
          `¡Éxito Total! 🎉`,
          `<p>Hola ${user.nombre},</p>
           <p>El grupo para <strong>${productName}</strong> alcanzó el objetivo de vecinos necesarios.</p>
           <p>Ya podés retirar tu producto en el punto de entrega seleccionado. Recordá mostrar tu código QR desde la sección "Mis Pedidos".</p>`,
          "Ver mi pedido",
          "https://bandha.com.ar/pedidos"
        )
      } else {
        // Failure: Refund and notify
        
        // 1. Fetch Mercado Pago payment info
        const { data: payment } = await supabase
          .from('payments')
          .select('mp_payment_id')
          .eq('order_id', order.id)
          .single()

        if (payment?.mp_payment_id && MP_ACCESS_TOKEN) {
          try {
            const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment.mp_payment_id}/refunds`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            })
            if (!mpRes.ok) {
               const errData = await mpRes.json();
               console.error(`MP Refund failed for ${payment.mp_payment_id}:`, errData);
            }
          } catch (err: any) {
            results.errors.push(`Refund connection error for MP ${payment.mp_payment_id}: ${err.message}`)
          }
        }

        // 2. Wallet Refund (Reversal)
        if (order.rewards_used && order.rewards_used > 0) {
           try {
             // Return balance to user
             await supabase.rpc('increment_wallet_balance', { 
               user_id_param: order.user_id, 
               amount_param: order.rewards_used 
             });

             // Record history
             await supabase.from('wallet_history').insert({
               user_id: order.user_id,
               amount: order.rewards_used,
               type: 'refund',
               description: `Reintegro por oferta fallida: ${productName}`,
               order_id: order.id
             });
           } catch (walletErr: any) {
             console.error("Wallet refund error:", walletErr);
           }
        }

        // 3. Mark order as cancelled
        await supabase
          .from('orders')
          .update({ estado: 'cancelado' })
          .eq('id', order.id)

        // 4. Notify failure
        await sendEmail(
          user.email,
          `La oferta de ${productName} ha sido cancelada`,
          `Lo sentimos, ${user.nombre} 😔`,
          `<p>Lamentablemente no llegamos al mínimo de vecinos para la oferta de <strong>${productName}</strong>.</p>
           <p>Tu dinero ha sido devuelto automáticamente a tu medio de pago original. Si usaste saldo de tu billetera, también ha sido reintegrado.</p>
           <p>¡No te desanimes! Siempre hay nuevas ofertas grupales activas.</p>`,
          "Explorar nuevas ofertas",
          "https://bandha.com.ar/productos"
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
