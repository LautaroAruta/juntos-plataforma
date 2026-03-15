import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  frequency: SubscriptionFrequency;
  quantity: number;
  next_delivery_date: string;
  status: SubscriptionStatus;
  discount_applied: number;
  product?: {
    nombre: string;
    imagen_principal: string;
    precio_individual: number;
  };
}

interface SubscriptionState {
  subscriptions: Subscription[];
  loading: boolean;
  fetchSubscriptions: (userId: string) => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
  pauseSubscription: (id: string) => Promise<void>;
  resumeSubscription: (id: string) => Promise<void>;
  removeSubscription: (id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      loading: false,

      fetchSubscriptions: async (userId: string) => {
        set({ loading: true });
        const supabase = createClient();
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            product:products (
              nombre,
              imagen_principal,
              precio_individual
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          set({ subscriptions: data as Subscription[], loading: false });
        } else {
          set({ loading: false });
        }
      },

      addSubscription: async (subscription) => {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('subscriptions')
          .insert([subscription])
          .select()
          .single();

        if (!error && data) {
          const current = get().subscriptions;
          set({ subscriptions: [data as Subscription, ...current] });
        }
      },

      updateSubscription: async (id, updates) => {
        const supabase = createClient();
        const { error } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('id', id);

        if (!error) {
          const current = get().subscriptions;
          set({
            subscriptions: current.map((s) => (s.id === id ? { ...s, ...updates } : s)),
          });
        }
      },

      pauseSubscription: async (id) => {
        await get().updateSubscription(id, { status: 'paused' });
      },

      resumeSubscription: async (id) => {
        await get().updateSubscription(id, { status: 'active' });
      },

      removeSubscription: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('subscriptions').delete().eq('id', id);

        if (!error) {
          const current = get().subscriptions;
          set({ subscriptions: current.filter((s) => s.id !== id) });
        }
      },
    }),
    {
      name: 'bandha-subscriptions',
    }
  )
);
