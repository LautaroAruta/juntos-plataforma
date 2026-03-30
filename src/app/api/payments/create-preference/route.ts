import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    const { dealId, pickupPointId, useRewards, rewardsAmount } = await req.json();
    const supabase = await createClient();
    
    // 1. Fetch deal and product info
    const { data: deal, error } = await supabase
      .from('group_deals')
      .select(`
        *,
        product:products (*, provider:providers (*))
      `)
      .eq('id', dealId)
      .single();

    if (error || !deal) throw new Error("Deal no encontrado");
    
    // 1.5 Check if provider is connected (Bypass for testing/sandbox if needed)
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.MP_ACCESS_TOKEN?.includes('TEST');
    
    if (!deal.product.provider.mp_access_token && !isTestMode) {
      return NextResponse.json({ 
        message: "El proveedor no ha vinculado su cuenta de Mercado Pago. No se puede procesar el pago dividido." 
      }, { status: 400 });
    }

    // 2. Get platform commission
    const { data: config } = await supabase
      .from('commission_config')
      .select('porcentaje')
      .eq('activo', true)
      .single();
      
    const commissionPercent = config?.porcentaje || 0.50; // Default 0.5%
    const totalAmount = deal.precio_actual - (useRewards ? Number(rewardsAmount) : 0);
    const marketplaceFee = totalAmount * (commissionPercent / 100);

    // 3. Create MP Preference
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: deal.product.id,
            title: `BANDHA: ${deal.product.nombre}`,
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
        metadata: {
          pickup_point_id: pickupPointId,
          deal_id: deal.id,
          rewards_amount: useRewards ? rewardsAmount : 0
        }
      }
    });

    return NextResponse.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error("MP Preference error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
