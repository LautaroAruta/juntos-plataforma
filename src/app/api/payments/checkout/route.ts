import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items, total, metadata, rewardsUsed = 0 } = await req.json();
    const supabase = await createClient();
    
    // Validar sesión del usuario (opcional si es anónimo)
    const { data: { user } } = await supabase.auth.getUser();

    const preference = new Preference(client);

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:3000';
    
    const publicUrl = process.env.NEXT_PUBLIC_NGROK_URL || appUrl;
    
    const body = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
      })),
      back_urls: {
        success: `${publicUrl}/checkout/success`,
        failure: `${publicUrl}/checkout/error`,
        pending: `${publicUrl}/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/webhooks/mercadopago`,
      external_reference: items[0]?.id, // Referencia al Deal o Producto
      metadata: {
        ...metadata,
        user_id: user?.id || null,
        rewards_used: rewardsUsed
      },
    };

    // If rewards were used, add a discount item
    if (rewardsUsed > 0) {
      body.items.push({
        id: "discount",
        title: "Descuento Billetera BANDHA",
        quantity: 1,
        unit_price: -rewardsUsed,
        currency_id: "ARS",
      } as any);
    }

    const response = await preference.create({ body });

    return NextResponse.json({ 
      id: response.id, 
      init_point: response.init_point 
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    return NextResponse.json({ message: "Error al procesar el pago" }, { status: 500 });
  }
}
