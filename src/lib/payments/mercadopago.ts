import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN!, 
  options: { timeout: 5000 } 
});

export const mpPayment = new Payment(client);

// Utility to generate MP OAuth URL
export function getMercadoPagoOAuthUrl(state: string) {
  const url = new URL('https://auth.mercadopago.com.ar/authorization');
  url.searchParams.append('client_id', process.env.MP_CLIENT_ID!);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('platform_id', 'mp');
  url.searchParams.append('redirect_uri', `${process.env.NEXTAUTH_URL}/api/provider/mp-callback`);
  url.searchParams.append('state', state);
  return url.toString();
}
