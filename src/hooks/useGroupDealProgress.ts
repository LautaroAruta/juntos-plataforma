import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Hook to subscribe to real-time updates for a specific group deal.
 * Used in Home and Product pages to update progress bars instantly.
 */
export function useGroupDealProgress(dealId: string, initialParticipants: number) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    if (!dealId) return;

    // 1. Subscribe to the specific record in group_deals table
    const channel = supabase
      .channel(`deal-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_deals',
          filter: `id=eq.${dealId}`,
        },
        (payload) => {
          if (payload.new && payload.new.participantes_actuales !== undefined) {
            setParticipants(payload.new.participantes_actuales);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId]);

  return participants;
}
