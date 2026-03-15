import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API: Verificación de Integridad de Productos
 * 
 * Recibe una lista de IDs y devuelve la información más reciente de precio y stock.
 * Se usa para detectar datos obsoletos (stale data) antes de que el usuario avance al checkout.
 */
export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ message: "IDs inválidos" }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, precio_individual, stock, activo')
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Product Verify Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
