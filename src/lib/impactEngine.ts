import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

const defaultClient = createClient();

// Coefficient for CO2 emission (kg CO2 per km)
const CO2_COEFFICIENT = 0.12; 

export const ImpactEngine = {
  /**
   * Calculates the CO2 saved...
   */
  async calculateDealImpact(dealId: string, supabaseClient: SupabaseClient = defaultClient) {
    const { data: deal, error } = await supabaseClient
      .from('group_deals')
      .select('*, product:products(km_to_hub)')
      .eq('id', dealId)
      .single();

    if (error || !deal) return 0;

    const kmToHub = Number((deal.product as any).km_to_hub) || 0;
    const participants = deal.participantes_actuales;

    if (participants <= 1) return 0;

    // The savings come from avoiding N-1 individual trips
    const carbonSaved = (participants - 1) * kmToHub * CO2_COEFFICIENT;
    
    return carbonSaved;
  },

  /**
   * Updates a user profile with their share of the carbon saved.
   */
  async updateUserImpact(userId: string, amount: number, supabaseClient: SupabaseClient = defaultClient) {
    // 1. Fetch current total
    const { data: user } = await supabaseClient
      .from('users')
      .select('carbon_saved')
      .eq('id', userId)
      .single();

    const currentTotal = Number(user?.carbon_saved) || 0;

    // 2. Update with new total
    const { error } = await supabaseClient
      .from('users')
      .update({ carbon_saved: currentTotal + amount })
      .eq('id', userId);

    if (error) throw error;

    // 3. Potentially trigger Streak update if this is a recent purchase
    console.log(`User ${userId} saved ${amount}kg of CO2.`);
  },

  /**
   * Batch update impact for all participants of a completed deal.
   */
  async processDealCompletionImpact(dealId: string, supabaseClient: SupabaseClient = defaultClient) {
    const totalImpact = await this.calculateDealImpact(dealId, supabaseClient);
    
    const { data: orders } = await supabaseClient
      .from('orders')
      .select('user_id')
      .eq('group_deal_id', dealId);

    if (!orders || orders.length === 0) return;

    // Distribute impact equally among participants
    const impactPerUser = totalImpact / orders.length;

    for (const order of orders) {
      if (order.user_id) {
        await this.updateUserImpact(order.user_id, impactPerUser, supabaseClient);
      }
    }
  },

  /**
   * Updates a Hub's total carbon saved metric.
   */
  async updateHubImpact(hubId: string, amount: number, supabaseClient: SupabaseClient = defaultClient) {
    const { data: hub } = await supabaseClient
      .from('pickup_points')
      .select('total_carbon_saved')
      .eq('id', hubId)
      .single();

    const currentTotal = Number(hub?.total_carbon_saved) || 0;

    await supabaseClient
      .from('pickup_points')
      .update({ total_carbon_saved: currentTotal + amount })
      .eq('id', hubId);
  },

  /**
   * Estimates CO2 saving for a single product if bought via group deal.
   */
  getProductCO2Saving(kmToHub: number): number {
    if (!kmToHub) return 0.5; // Default minimum saving based on generic logistics
    // We assume 1 individual trip (2 ways) vs 1/N-th of a shared delivery
    return kmToHub * 2 * CO2_COEFFICIENT;
  }
};
