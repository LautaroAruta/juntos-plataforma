import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    // 1. Fetch user profile (for balance and referral code)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance, referral_code')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;

    // 2. Fetch history
    const { data: history, error: historyError } = await supabase
      .from('wallet_history')
      .select('*, order:orders(id, group_deal:group_deals(product:products(nombre)))')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    // 3. Fetch referral stats
    const { count: referralCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('referred_by_id', session.user.id);

    return NextResponse.json({
      balance: user.wallet_balance || 0,
      referral_code: user.referral_code,
      referral_count: referralCount || 0,
      history
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
