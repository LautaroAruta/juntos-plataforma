import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || session.user.rol !== 'admin') {
      return NextResponse.json({ message: "No autorizado. Solo administradores." }, { status: 401 });
    }

    const { userId, amount, reason } = await req.json();

    if (!userId || !amount || !reason) {
      return NextResponse.json({ message: "Faltan datos obligatorios" }, { status: 400 });
    }

    const supabase = await createClient();
    const adjustmentAmount = Number(amount);

    // 1. Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    const newBalance = (user.wallet_balance || 0) + adjustmentAmount;

    // 2. Perform transaction (using regular client since RLS/session should allow admin access or we use service role if needed)
    // For manual adjustment, we want to update both tables
    
    // Update balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Insert history
    const { error: historyError } = await supabase
      .from('wallet_history')
      .insert([{
        user_id: userId,
        amount: adjustmentAmount,
        type: 'system_adjustment',
        description: `AJUSTE ADMIN: ${reason}`,
        created_at: new Date().toISOString()
      }]);

    if (historyError) throw historyError;

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: "Ajuste aplicado correctamente" 
    });

  } catch (error: any) {
    console.error("Admin adjustment error:", error);
    return NextResponse.json({ message: "Error interno", error: error.message }, { status: 500 });
  }
}
