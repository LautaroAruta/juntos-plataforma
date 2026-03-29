import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ message: "No se recibió el código de autorización" }, { status: 400 });
  }

  try {
    // Check environment variables first
    if (!process.env.MP_ACCESS_TOKEN || !process.env.MP_CLIENT_ID || !process.env.MP_CLIENT_SECRET) {
      console.error("Missing Mercado Pago credentials in .env.local");
      return NextResponse.json({ 
        message: "Faltan credenciales de Mercado Pago en el servidor (MP_ACCESS_TOKEN, MP_CLIENT_ID o MP_CLIENT_SECRET)" 
      }, { status: 500 });
    }

    // Exchange code for access token
    const response = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        client_id: process.env.MP_CLIENT_ID,
        client_secret: process.env.MP_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/provider/mp-callback`,
      }),
    });

    const mpData = await response.json();

    if (!response.ok) {
      console.error("MP OAuth Error:", mpData);
      return NextResponse.json({ message: "Error al conectar con Mercado Pago", detail: mpData }, { status: 500 });
    }

    // Recover provider form data from 'state' (if encoded) or handled via session
    // For this implementation, we expect the UI to have sent the data during the redirect
    // or we'll need to update an existing record if we created it before redirect.
    // Let's assume we create the provider RECORD now using the data from state if possible,
    // or redirect back to a finish page.
    
    // In a production app, decrypt/parse state
    // For now, let's redirect to a success page that will handle the final DB insert
    // with the MP credentials we just got.
    
    const providerData = {
      mp_user_id: mpData.user_id.toString(),
      mp_access_token: mpData.access_token,
    };

    // Parse state to get provider_id
    let providerId = null;
    if (state) {
      try {
        const decoded = JSON.parse(atob(state));
        providerId = decoded.provider_id;
      } catch (e) {}
    }

    if (providerId) {
      const { error: updateError } = await supabaseAdmin
        .from('providers')
        .update(providerData)
        .eq('id', providerId);
      
      if (updateError) console.error("Update provider error:", updateError);
    }

    // Redirect to a frontend page that says "Success, wait for admin"
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/provider/onboarding-complete?id=${providerId}`);
    
  } catch (error) {
    return NextResponse.json({ 
      message: "Error interno del servidor al procesar la vinculación",
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}
