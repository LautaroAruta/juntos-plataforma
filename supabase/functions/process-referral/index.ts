import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const REWARD_AMOUNT = 500; // Define your reward amount here

serve(async (req) => {
  const { userId, paymentId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Check if the user has a pending referral
  const { data: referral, error: refError } = await supabase
    .from('referrals')
    .select('id, referrer_id, status')
    .eq('referred_id', userId)
    .eq('status', 'pending')
    .single()

  if (refError || !referral) {
    return new Response(JSON.stringify({ message: "No pending referral found for this user" }), { status: 200 })
  }

  // 2. Check if this is the user's first approved payment
  const { count, error: countError } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'approved');

  // 3. Update referral status to 'completed' and set reward
  const { error: updateError } = await supabase
    .from('referrals')
    .update({ 
      status: 'completed',
      reward_amount: REWARD_AMOUNT,
      updated_at: new Date().toISOString()
    })
    .eq('id', referral.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
  }

  // 4. Send Reward Notification Email
  const { data: referrer } = await supabase
    .from('users')
    .select('email')
    .eq('id', referral.referrer_id)
    .single();

  if (referrer?.email) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
        },
        body: JSON.stringify({
          from: 'JUNTOS <premios@juntos.com.ar>',
          to: [referrer.email],
          subject: '¡Ganaste una recompensa en JUNTOS!',
          html: `
            <h1 style="color: #F59E0B; font-family: sans-serif;">🎉 ¡Nuevos créditos disponibles!</h1>
            <p>Tu amigo ya realizó su primera compra y ganaste <strong>$${REWARD_AMOUNT}</strong>.</p>
            <p>Podés usarlos en tu próxima compra grupal para ahorrar aún más.</p>
          `
        })
      });
    } catch (err) {
      console.error("Error sending reward email:", err);
    }
  }

  return new Response(JSON.stringify({ 
    message: "Referral processed successfully", 
    referrerId: referral.referrer_id,
    reward: REWARD_AMOUNT 
  }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  })
})
