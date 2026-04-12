import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');
    const neighborhood = searchParams.get('neighborhood');

    if (!dealId || !neighborhood) {
      return NextResponse.json({ count: 0 });
    }

    const supabase = await createClient();

    // Use the RPC to get the count
    const { data: count, error: rpcError } = await supabase.rpc('get_neighborhood_deal_count', {
        p_deal_id: dealId,
        p_neighborhood: neighborhood
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Error fetching deal neighborhood stats:", error);
    return NextResponse.json({ count: 0 });
  }
}
