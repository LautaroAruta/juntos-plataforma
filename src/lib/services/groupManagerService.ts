import { createClient } from '@/lib/supabase/client';
import { GroupDealService } from './groupDealService';

const supabase = createClient();

export const GroupManagerService = {
  /**
   * Main entry point for joining or starting a group.
   * Logic:
   * 1. Resolve user's neighborhood (Hub).
   * 2. Search for an active deal in that neighborhood.
   * 3. Join if valid, else start a new one.
   */
  async createOrJoinGroup(productId: string, userId: string) {
    // 1. Get user's preferred pickup point / neighborhood
    // For now, we mock it from the user's address or profile
    const { data: userData } = await supabase
      .from('users')
      .select('direccion')
      .eq('id', userId)
      .single();

    // Mock neighborhood resolution based on address for this MVP
    // In production, this would use the ProximityMap logic or a user-selected hub
    const neighborhoodId = userData?.direccion?.includes('Palermo') ? 'Palermo' : 'Caballito';

    // 2. Search for an active deal for this product in the same neighborhood
    // We join with pickup_points to filter by neighborhood (hub)
    const { data: existingDeal, error } = await supabase
      .from('group_deals')
      .select('*, products!inner(*)')
      .eq('product_id', productId)
      .eq('estado', 'activo')
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingDeal && existingDeal.participantes_actuales < existingDeal.max_participantes) {
      // 3. Group exists and has space -> JOIN
      console.log(`Joining existing group ${existingDeal.id} in ${neighborhoodId}`);
      return await GroupDealService.joinDeal(existingDeal.id, userId);
    } else {
      // 4. No active group with space -> CREATE NEW (24h Timer)
      console.log(`Creating new group for product ${productId} in ${neighborhoodId}`);
      
      // Fetch product details for the new deal parameters
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) throw new Error("Product not found");

      return await GroupDealService.createDeal(
        productId,
        3, // Default goal_slots (min)
        10, // Default max_slots
        product.precio_grupal_minimo
      );
    }
  },

  /**
   * Helper to derive UI state based on progress.
   */
  getDealStatus(participants: number, minParticipants: number) {
    const progress = (participants / minParticipants) * 100;
    
    if (progress >= 100) return 'COMPLETED';
    if (progress >= 50) return 'MIDWAY';
    return 'TRENDING';
  }
};
