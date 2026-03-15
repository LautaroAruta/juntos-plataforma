import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type ChallengeType = 'savings_goal' | 'volume_goal' | 'new_neighbors_goal';
export type ChallengeStatus = 'active' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  neighborhood_id: string;
  type: ChallengeType;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  deadline: string;
  status: ChallengeStatus;
  perk_description: string;
}

export interface Contributor {
  user_id: string;
  user_name: string;
  contribution_value: number;
  avatar_url?: string;
}

interface ChallengeState {
  activeChallenges: Challenge[];
  topContributors: Record<string, Contributor[]>; // challenge_id -> contributors
  loading: boolean;
  fetchNeighborhoodChallenges: (neighborhoodId: string) => Promise<void>;
  fetchTopContributors: (challengeId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>()((set, get) => ({
  activeChallenges: [],
  topContributors: {},
  loading: false,

  fetchNeighborhoodChallenges: async (neighborhoodId: string) => {
    set({ loading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from('neighborhood_challenges')
      .select('*')
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .order('deadline', { ascending: true });

    if (!error && data) {
      set({ activeChallenges: data as Challenge[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  fetchTopContributors: async (challengeId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('challenge_contributions')
      .select(`
        user_id,
        contribution_value,
        user:users (nombre, avatar_url)
      `)
      .eq('challenge_id', challengeId)
      .order('contribution_value', { ascending: false })
      .limit(5);

    if (!error && data) {
      const formatted = data.map((c: any) => ({
        user_id: c.user_id,
        user_name: c.user?.nombre || 'Vecino Anónimo',
        contribution_value: c.contribution_value,
        avatar_url: c.user?.avatar_url
      }));

      const current = get().topContributors;
      set({
        topContributors: { ...current, [challengeId]: formatted }
      });
    }
  },
}));
