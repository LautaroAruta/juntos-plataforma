import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de Mercado Pago con el Access Token de entorno
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

/**
 * API: Checkout Multi-producto (Enterprise-level)
 * 
 * Este endpoint recibe los IDs y cantidades del carrito del cliente,
 * pero RECALCULA todos los precios consultando la base de datos de Supabase.
 * Esto evita que usuarios malintencionados modifiquen precios en el navegador.
 */
export async function POST(req: Request) {
  try {
    const { items, shippingData } = await req.json();
    const supabase = await createClient();

    // Validaciones iniciales
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "El carrito está vació o el formato es incorrecto." }, { status: 400 });
    }

    // 1. Obtener IDs únicos para consulta masiva
    const productIds = Array.from(new Set(items.map(item => item.id)));

    // 2. Consultar precios y stock vigentes en la base de datos
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, nombre, precio_individual, stock, imagen_principal')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      console.error("Database query error:", dbError);
      return NextResponse.json({ message: "Error al verificar productos en el servidor." }, { status: 500 });
    }

    // 3. Validar y construir los ítems para Mercado Pago
    const verifiedItemsForMP = items.map(cartItem => {
      const dbProduct = dbProducts.find(p => p.id === cartItem.id);
      
      if (!dbProduct) {
        throw new Error(`Producto no encontrado: ${cartItem.id}`);
      }

      // Validación de stock en tiempo real
      if (dbProduct.stock < cartItem.quantity) {
        throw new Error(`Stock insuficiente para "${dbProduct.nombre}". Disponible: ${dbProduct.stock}`);
      }

      return {
        id: dbProduct.id,
        title: `BANDHA: ${dbProduct.nombre}${cartItem.variant ? ` (${cartItem.variant})` : ''}`,
        quantity: cartItem.quantity,
        unit_price: Number(dbProduct.precio_individual),
        currency_id: 'ARS',
        picture_url: dbProduct.imagen_principal || undefined
      };
    });

    // 4. Calcular comisiones de plataforma
    const subtotal = verifiedItemsForMP.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    
    const { data: config } = await supabase
      .from('commission_config')
      .select('porcentaje')
      .eq('activo', true)
      .maybeSingle();
      
    const commissionPercent = config?.porcentaje || 0.50; // Default 0.5% si no hay config
    const marketplaceFee = subtotal * (commissionPercent / 100);

    // 5. Crear la preferencia de Mercado Pago
    const preference = new Preference(client);
    
    // Configuración de redirección segura
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const result = await preference.create({
      body: {
        items: verifiedItemsForMP,
        marketplace_fee: Math.round(marketplaceFee * 100) / 100, // Round to 2 decimal places
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        // Referencia externa para trazabilidad
        external_reference: `MULTICART-${Date.now()}`,
        metadata: {
          original_payload: items,
          shipping_info: shippingData,
          server_verified_total: subtotal
        }
      }
    });

    return NextResponse.json({ 
      id: result.id, 
      init_point: result.init_point,
      total_verified: subtotal 
    });

  } catch (error: any) {
    console.error("❌ Checkout Multi Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Error interno al procesar el checkout." }, 
      { status: 500 }
    );
  }
}
