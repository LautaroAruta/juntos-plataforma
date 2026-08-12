import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = session.user.id;

    // 1. Fetch Referrals with User Details (invited people)
    // We join referrals with public.users where id = referred_id
    const { data: referrals, error: refError } = await supabase
      .from('referrals')
      .select(`
        id,
        status,
        reward_amount,
        created_at,
        referred:referred_id (
          nombre,
          apellido
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (refError) throw refError;

    // 2. Fetch Wallet History
    const { data: walletHistory, error: walletError } = await supabase
      .from('wallet_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (walletError) throw walletError;

    return NextResponse.json({
      referrals: referrals || [],
      walletHistory: walletHistory || [],
      stats: {
        totalInvited: referrals?.length || 0,
        completedReferrals: referrals?.filter(r => r.status === 'completed').length || 0,
      }
    });
  } catch (error: any) {
    console.error("Error fetching growth data:", error);
    return NextResponse.json({ message: "Error interno", error: error.message }, { status: 500 });
  }
}
