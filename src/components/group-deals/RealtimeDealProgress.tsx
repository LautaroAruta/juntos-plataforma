"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CountdownTimer from "@/components/shared/CountdownTimer";
import GroupAvatars from "@/components/group-deals/GroupAvatars";
import { ShieldCheck } from "lucide-react";

interface Props {
  dealId: string;
  initialParticipants: number;
  minParticipants: number;
  targetDate: string;
}

export default function RealtimeDealProgress({ dealId, initialParticipants, minParticipants, targetDate }: Props) {
  const [currentParticipants, setCurrentParticipants] = useState(initialParticipants);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`public:group_deals:id=eq.${dealId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_deals', filter: `id=eq.${dealId}` },
        (payload) => {
          if (payload.new && typeof payload.new.participantes_actuales === 'number') {
            setCurrentParticipants(payload.new.participantes_actuales);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, supabase]);

  const progress = Math.max(0, (currentParticipants / minParticipants) * 100);

  return (
    <div className="bg-bandha-surface rounded-[1.25rem] p-4 md:p-5 mb-8 border border-bandha-border shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group/progress">
      <div className="flex flex-col gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-black text-bandha-text tracking-tighter uppercase shrink-0">
            ¡FINALIZA EN:
          </span>
          <CountdownTimer
            targetDate={targetDate}
            className="text-xl md:text-2xl font-black"
            iconSize={18}
          />
        </div>

        <GroupAvatars
          current={currentParticipants}
          min={minParticipants}
        />

        <div className="space-y-2.5">
          <div className="h-2.5 w-full bg-bandha-subtle rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-bandha-secondary via-bandha-secondary to-bandha-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
            >
              <div className="absolute inset-0 bg-white/10 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold text-bandha-text-secondary bg-bandha-primary/5 py-1.5 px-3 rounded-lg border border-bandha-primary/5 self-start">
            <ShieldCheck size={13} className="text-bandha-primary shrink-0" />
            <span className="leading-tight">Si no hay quórum, se reintegra el dinero automáticamente.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
