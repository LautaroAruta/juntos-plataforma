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

    // 0. Obtener el usuario autenticado (Opcional: permitir invitados pero con registro de mail)
    const { data: { user } } = await supabase.auth.getUser();

    // Validaciones iniciales
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "El carrito está vació o el formato es incorrecto." }, { status: 400 });
    }

    // 1. Obtener IDs únicos para consulta masiva
    const productIds = Array.from(new Set(items.map(item => item.id)));

    // 2. Consultar precios, stock y PROVIDER_ID vigentes en la base de datos
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, nombre, precio_individual, stock, imagen_principal, provider_id')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      console.error("Database query error:", dbError);
      return NextResponse.json({ message: "Error al verificar productos en el servidor." }, { status: 500 });
    }

    // 3. Validar y construir los ítems comprobados
    const verifiedItems = items.map(cartItem => {
      const dbProduct = dbProducts.find(p => p.id === cartItem.id);
      
      if (!dbProduct) {
        throw new Error(`Producto no encontrado: ${cartItem.id}`);
      }

      if (dbProduct.stock < cartItem.quantity) {
        throw new Error(`Stock insuficiente para "${dbProduct.nombre}". Disponible: ${dbProduct.stock}`);
      }

      return {
        ...cartItem,
        dbProduct // Guardamos la info de DB para el insert posterior
      };
    });

    const subtotal = verifiedItems.reduce((acc, item) => acc + (Number(item.dbProduct.precio_individual) * item.quantity), 0);
    
    // 4. Crear la Orden Maestro en Supabase (Transaccional)
    // Determinamos el provider_id: si todos los items son del mismo proveedor, lo seteamos. Si no, NULL.
    const uniqueProviders = Array.from(new Set(dbProducts.map(p => p.provider_id)));
    const mainProviderId = uniqueProviders.length === 1 ? uniqueProviders[0] : null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        provider_id: mainProviderId,
        cantidad: verifiedItems.reduce((acc, i) => acc + i.quantity, 0),
        total: subtotal,
        estado: 'pendiente_pago'
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Error al crear la orden: ${orderError?.message}`);
    }

    // 5. Insertar el desglose de productos (order_items)
    const orderItemsToInsert = verifiedItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      provider_id: item.dbProduct.provider_id,
      variant: item.variant || null,
      quantity: item.quantity,
      unit_price: Number(item.dbProduct.precio_individual)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      throw new Error(`Error al registrar ítems de la orden: ${itemsError.message}`);
    }

    // 6. Preparar Preferencia de Mercado Pago
    const verifiedItemsForMP = verifiedItems.map(item => ({
      id: item.id,
      title: `BANDHA: ${item.dbProduct.nombre}${item.variant ? ` (${item.variant})` : ''}`,
      quantity: item.quantity,
      unit_price: Number(item.dbProduct.precio_individual),
      currency_id: 'ARS',
      picture_url: item.dbProduct.imagen_principal || undefined
    }));

    const { data: config } = await supabase
      .from('commission_config')
      .select('porcentaje')
      .eq('activo', true)
      .maybeSingle();
      
    const commissionPercent = config?.porcentaje || 0.50;
    const marketplaceFee = subtotal * (commissionPercent / 100);

    const preference = new Preference(client);
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const result = await preference.create({
      body: {
        items: verifiedItemsForMP,
        marketplace_fee: Math.round(marketplaceFee * 100) / 100,
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        // 🚨 CRÍTICO: Vinculamos la compra de MP con nuestra Orden en DB
        external_reference: order.id,
        metadata: {
          order_id: order.id,
          user_id: user?.id,
          shipping_info: shippingData
        }
      }
    });

    return NextResponse.json({ 
      id: result.id, 
      init_point: result.init_point,
      order_id: order.id 
    });

  } catch (error: any) {
    console.error("❌ Checkout Multi Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Error interno al procesar el checkout." }, 
      { status: 500 }
    );
  }
}
