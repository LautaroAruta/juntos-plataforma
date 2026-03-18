import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export type EventType = 'deal_joined' | 'deal_closed' | 'review_posted' | 'milestone_reached' | 'cheer';

export interface CommunityEvent {
  id: string;
  neighborhood_id: string;
  product_id?: string;
  event_type: EventType;
  user_name: string;
  target_name: string;
  impact_text?: string;
  creado_en: string;
}

interface SocialState {
  events: CommunityEvent[];
  loading: boolean;
  addEvent: (event: CommunityEvent) => void;
  fetchInitialEvents: (neighborhoodId: string) => Promise<void>;
  subscribeToNeighborhood: (neighborhoodId: string) => () => void;
  sendEvent: (event: Omit<CommunityEvent, 'id' | 'creado_en'>) => Promise<void>;
}

const supabase = createClient();

export const useSocialStore = create<SocialState>((set, get) => ({
  events: [],
  loading: false,

  addEvent: (event) => {
    set((state) => {
      // Avoid duplicates if real-time fires for something we just inserted manually (though here we don't insert manually in state first)
      if (state.events.find(e => e.id === event.id)) return state;
      return {
        events: [event, ...state.events].slice(0, 20),
      };
    });
  },

  fetchInitialEvents: async (neighborhoodId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .eq('neighborhood_id', neighborhoodId)
      .order('creado_en', { ascending: false })
      .limit(10);

    if (!error && data) {
      set({ events: data });
    }
    set({ loading: false });
  },

  subscribeToNeighborhood: (neighborhoodId) => {
    const channel = supabase
      .channel(`neighborhood-${neighborhoodId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_events',
          filter: `neighborhood_id=eq.${neighborhoodId}`,
        },
        (payload) => {
          get().addEvent(payload.new as CommunityEvent);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  sendEvent: async (eventData) => {
    const { error } = await supabase
      .from('community_events')
      .insert([eventData]);
    
    if (error) {
      console.error("Error sending community event:", error);
    }
  },
}));
