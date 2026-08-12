import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handles wallet and referral logic when a purchase is approved.
 */
export async function processPurchaseRewards(userId: string, orderId: string, rewardsUsed: number) {
  console.log(`Processing rewards for user ${userId}, order ${orderId}, rewardsUsed: ${rewardsUsed}`);
  
  // 1. Handle Wallet Deduction (if rewards were used)
  if (rewardsUsed > 0) {
    // Record usage in history
    await supabaseAdmin.from('wallet_history').insert({
      user_id: userId,
      amount: -rewardsUsed,
      type: 'usage',
      description: 'Descuento aplicado en compra',
      order_id: orderId
    });

    // Update user balance
    const { data: user } = await supabaseAdmin.from('users').select('wallet_balance').eq('id', userId).single();
    const newBalance = (user?.wallet_balance || 0) - rewardsUsed;
    await supabaseAdmin.from('users').update({ wallet_balance: Math.max(0, newBalance) }).eq('id', userId);
  }

  // 2. Handle Referral Completion (Check if user was referred)
  const { data: referral } = await supabaseAdmin
    .from('referrals')
    .select('*')
    .eq('referred_id', userId)
    .eq('status', 'pending')
    .single();

  if (referral) {
    const REWARD_AMOUNT = 500; // Reward in ARS

    // Mark referral as completed
    await supabaseAdmin
      .from('referrals')
      .update({ 
        status: 'completed', 
        reward_amount: REWARD_AMOUNT,
        updated_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    // Credit the referrer
    const { data: referrer } = await supabaseAdmin.from('users').select('wallet_balance').eq('id', referral.referrer_id).single();
    const newReferrerBalance = (referrer?.wallet_balance || 0) + REWARD_AMOUNT;
    
    await supabaseAdmin.from('users').update({ wallet_balance: newReferrerBalance }).eq('id', referral.referrer_id);

    // Record reward in referrer's history
    await supabaseAdmin.from('wallet_history').insert({
      user_id: referral.referrer_id,
      amount: REWARD_AMOUNT,
      type: 'reward',
      description: 'Premio por referido completado',
      order_id: orderId
    });

    // 4. Send Notification to referrer
    await supabaseAdmin.from('notifications').insert({
      user_id: referral.referrer_id,
      title: "¡Ganaste $500! 🎁",
      message: "Tu referido completó su primera compra. El saldo ya está en tu billetera.",
      type: 'reward',
      link: '/perfil/billetera'
    });
    
    console.log(`Referral reward of ${REWARD_AMOUNT} granted to ${referral.referrer_id}`);
  }
}
