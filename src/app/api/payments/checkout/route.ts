import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@/lib/supabase/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items, total, metadata } = await req.json();
    const supabase = await createClient();
    
    // Validar sesión del usuario (opcional si es anónimo)
    const { data: { user } } = await supabase.auth.getUser();

    const preference = new Preference(client);

    const body = {
      items: items.map((item: any) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
      })),
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/checkout/success`,
        failure: `${process.env.NEXTAUTH_URL}/checkout/error`,
        pending: `${process.env.NEXTAUTH_URL}/checkout/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/webhooks/mercadopago`,
      external_reference: items[0]?.id, // Referencia al Deal o Producto
      metadata: {
        ...metadata,
        user_id: user?.id || null,
      },
    };

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
