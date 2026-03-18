import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

const defaultClient = createClient();

export const LogisticsService = {
  /**
   * Generates a unique delivery token...
   */
  async generatePickupToken(orderId: string, supabaseClient: SupabaseClient = defaultClient) {
    const token = `PICKUP-${orderId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const { error } = await supabaseClient
      .from('orders')
      .update({ delivery_token: token })
      .eq('id', orderId);

    if (error) throw error;
    return token;
  },

  /**
   * Validates a pickup from the Hub perspective.
   * Scanned by the Hub manager.
   */
  async validatePickup(userToken: string, hubId: string, supabaseClient: SupabaseClient = defaultClient) {
    // 1. Find the order with this token
    const { data: order, error: fetchError } = await supabaseClient
      .from('orders')
      .select('*, products(*)')
      .eq('delivery_token', userToken)
      .eq('pickup_point_id', hubId)
      .single();

    if (fetchError || !order) {
      throw new Error("Token inválido o el pedido no pertenece a este Hub.");
    }

    if (order.estado === 'entregado') {
      throw new Error("Este pedido ya fue entregado.");
    }

    // 2. Mark as Delivered
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ 
        estado: 'entregado',
        qr_escaneado: true,
        qr_escaneado_en: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) throw updateError;

    // 3. Update stock
    await supabaseClient.rpc('decrement_product_stock', { p_id: order.product_id, amount: order.cantidad });

    // 4. Trigger Escrow Release
    await this.releaseEscrow(order.id, supabaseClient);

    // 5. Log delivery event
    await supabaseClient.from('order_deliveries').insert([{
      order_id: order.id,
      verified_at: new Date().toISOString(),
      verification_method: 'qr'
    }]);

    return { success: true, orderId: order.id };
  },

  /**
   * Releases funds to the provider.
   */
  async releaseEscrow(orderId: string, supabaseClient: SupabaseClient = defaultClient) {
    const { error } = await supabaseClient
      .from('payments')
      .update({ escrow_status: 'RELEASED' })
      .eq('order_id', orderId);

    if (error) throw error;
    console.log(`Funds released for order ${orderId}`);
  }
};
