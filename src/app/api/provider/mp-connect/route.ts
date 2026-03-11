import { NextResponse } from "next/server";
import { getMercadoPagoOAuthUrl } from "@/lib/payments/mercadopago";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state') || '';
  
  const url = getMercadoPagoOAuthUrl(state);
  
  return NextResponse.redirect(url);
}
