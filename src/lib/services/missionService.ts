import { createClient } from '@/lib/supabase/client';

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  progress: number;
  target: number;
}

const supabase = createClient();

export const MissionService = {
  /**
   * Retrieves daily missions for a user.
   * Mocked for now to demonstrate UI/UX.
   */
  async getDailyMissions(userId: string): Promise<Mission[]> {
    return [
      {
        id: 'm1',
        title: 'Invitador Serial',
        description: 'Toca el timbre a 3 vecinos en el carrito',
        xpReward: 150,
        icon: 'bell',
        progress: 1,
        target: 3
      },
      {
        id: 'm2',
        title: 'Explorador de Ofertas',
        description: 'Unite a 2 grupos de categorías diferentes',
        xpReward: 300,
        icon: 'map',
        progress: 0,
        target: 2
      },
      {
        id: 'm3',
        title: 'Ecologista Activo',
        description: 'Ahorrá tus primeros 2kg de CO2',
        xpReward: 500,
        icon: 'leaf',
        progress: 1.2,
        target: 2
      }
    ];
  },

  /**
   * Gets the collective goal for a neighborhood.
   */
  async getNeighborhoodGoal(neighborhoodId: string) {
    // In a real app, this would query aggregated orders for the current month
    return {
      neighborhoodId,
      name: neighborhoodId,
      currentOrders: 85,
      targetOrders: 100,
      reward: '5% OFF extra en todo el barrio',
      daysLeft: 12
    };
  }
};
