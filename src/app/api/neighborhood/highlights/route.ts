import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const neighborhood = searchParams.get('neighborhood');
    
    const supabase = await createClient();
    
    // If no neighborhood provided, try to get from session
    let targetNeighborhood = neighborhood;
    if (!targetNeighborhood) {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const { data: user } = await supabase
          .from('users')
          .select('neighborhood')
          .eq('id', session.user.id)
          .single();
        targetNeighborhood = user?.neighborhood;
      }
    }

    if (!targetNeighborhood) {
      return NextResponse.json({ 
        message: "Neighborhood not found",
        products: [] 
      });
    }

    // Use the RPC to get top products in the neighborhood
    const { data: topProducts, error } = await supabase.rpc('get_top_products_by_neighborhood', {
      p_neighborhood: targetNeighborhood,
      p_limit: 4
    });

    if (error) throw error;

    return NextResponse.json({ 
      neighborhood: targetNeighborhood,
      products: topProducts || [] 
    });
  } catch (error) {
    console.error("Error fetching neighborhood highlights:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
