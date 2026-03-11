import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const { dealId } = await req.json();
    const supabase = await createClient();
    
    // 1. Get user session
    // (Actual auth check would go here)
    
    // 2. Fetch deal and product info
    const { data: deal, error } = await supabase
      .from('group_deals')
      .select(`
        *,
        product:products (*, provider:providers (*))
      `)
      .eq('id', dealId)
      .single();

    if (error || !deal) throw new Error("Deal no encontrado");

    // 3. Get platform commission
    const { data: config } = await supabase
      .from('commission_config')
      .select('porcentaje')
      .eq('activo', true)
      .single();
      
    const commissionPercent = config?.porcentaje || 0.50; // Default 0.5%
    const totalAmount = deal.precio_actual;
    const marketplaceFee = totalAmount * (commissionPercent / 100);

    // 4. Create MP Preference with split payment (Marketplace fee)
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: deal.product.id,
            title: `JUNTOS: ${deal.product.nombre}`,
            quantity: 1,
            unit_price: totalAmount,
            currency_id: 'ARS',
          }
        ],
        marketplace_fee: marketplaceFee,
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/checkout/success`,
          failure: `${process.env.NEXTAUTH_URL}/checkout/failure`,
          pending: `${process.env.NEXTAUTH_URL}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
        external_reference: deal.id,
        // In MP Marketplace, the payment goes to the collector (provider)
        // We need to use the collector_id from the provider's connected account
        // but for initial integration we use the platform's credentials.
        // marketplace_fee only works if the app is configured as a Marketplace.
      }
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error("MP Preference error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
