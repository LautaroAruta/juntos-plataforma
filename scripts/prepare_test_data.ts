import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const USER_ID = '5c1c2f3c-9cf2-4fa2-91eb-a074f743ef7a'; // test_refund@juntos.com
const PRODUCT_ID = '5ed88dd1-f270-4f69-861b-7fff24b86a5b';
const PROVIDER_ID = '5666ecd1-19b3-4bd2-890b-2d5b54476130';
const PICKUP_POINT_ID = '9ecbaf67-676e-46b0-867d-9cec92fc4350';

async function prepareData() {
  console.log('🚀 Preparando datos de prueba...');

  try {
    // 1. Crear Group Deal
    const { data: groupDeal, error: gdError } = await supabase
      .from('group_deals')
      .insert({
        product_id: PRODUCT_ID,
        precio_actual: 1000,
        min_participantes: 10,
        max_participantes: 20,
        participantes_actuales: 5,
        estado: 'activo',
        fecha_vencimiento: new Date(Date.now() + 86400000).toISOString() // 24h from now
      })
      .select()
      .single();

    if (gdError) throw gdError;
    console.log('✅ Group Deal creado:', groupDeal.id);

    // 2. Crear Orden
    const { data: order, error: oError } = await supabase
      .from('orders')
      .insert({
          user_id: USER_ID,
          group_deal_id: groupDeal.id,
          provider_id: PROVIDER_ID,
          pickup_point_id: PICKUP_POINT_ID,
          cantidad: 1,
          total: 1000,
          estado: 'pagado',
          delivery_token: 'test-token-' + Math.random().toString(36).substring(7)
      })
      .select()
      .single();

    if (oError) throw oError;
    console.log('✅ Orden creada:', order.id);

    // 3. Crear Pago
    const { data: payment, error: pError } = await supabase
      .from('payments')
      .insert({
          order_id: order.id,
          mp_payment_id: 'test-mp-payment-' + Math.random().toString(36).substring(7),
          monto_total: 1000,
          monto_proveedor: 950,
          monto_comision: 50,
          porcentaje_comision: 5,
          estado: 'approved'
      })
      .select()
      .single();

    if (pError) throw pError;
    console.log('✅ Pago creado:', payment.id);

    console.log('\n--- DATOS DE PRUEBA LISTOS ---');
    console.log('Email:', 'cliente@juntos.com');
    console.log('Password:', 'password123');
    console.log('Order ID:', order.id);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

prepareData();
