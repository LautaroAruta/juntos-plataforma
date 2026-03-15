import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API: Sincronización de Carrito (Cloud Sync)
 * 
 * GET: Recupera el carrito guardado en Supabase para el usuario logueado.
 * POST: Guarda el estado actual del carrito local en la base de datos.
 */

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Obtener sesión del usuario
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // Traer ítems del carrito con join a productos para tener datos frescos (precio/stock)
    const { data: items, error } = await supabase
      .from('cart_items')
      .select(`
        product_id,
        variant,
        quantity,
        products (
          id,
          nombre,
          precio_individual,
          imagen_principal,
          stock
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    // Formatear los datos para que coincidan con la interfaz CartItem de Zustand
    const formattedItems = items.map((item: any) => ({
      id: item.product_id,
      uniqueId: `${item.product_id}-${item.variant || 'default'}`,
      name: item.products.nombre,
      price: Number(item.products.precio_individual),
      image: item.products.imagen_principal,
      stock: item.products.stock,
      quantity: item.quantity,
      variant: item.variant
    }));

    return NextResponse.json(formattedItems);
  } catch (error: any) {
    console.error("Cart Sync GET Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    // 1. Limpiar carrito anterior del usuario (Atomic update simulation)
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // 2. Si el carrito nuevo tiene ítems, insertarlos
    if (items && items.length > 0) {
      const inserts = items.map((item: any) => ({
        user_id: user.id,
        product_id: item.id,
        variant: item.variant || null,
        quantity: item.quantity
      }));

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(inserts);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: items?.length || 0 });
  } catch (error: any) {
    console.error("Cart Sync POST Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
