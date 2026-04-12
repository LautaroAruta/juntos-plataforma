"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Gift, Package, ChevronLeft, CheckCheck, Loader2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificacionesPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAllAsRead = async () => {
    if (!session?.user?.id) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id);
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF5C00]" size={40} strokeWidth={3} />
      </div>
    );
  }

  // GROUPING LOGIC
  const groups = notifications.reduce((acc: any, n) => {
    const date = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let group = 'HISTORY_RECORDS';
    if (date.toDateString() === today.toDateString()) group = 'TODAY_ACTIVE';
    else if (date.toDateString() === yesterday.toDateString()) group = 'YESTERDAY_LOG';
    else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) group = 'THIS_WEEK_METRICS';

    if (!acc[group]) acc[group] = [];
    acc[group].push(n);
    return acc;
  }, {});

  const groupOrder = ['TODAY_ACTIVE', 'YESTERDAY_LOG', 'THIS_WEEK_METRICS', 'HISTORY_RECORDS'];

  return (
    <div className="min-h-screen bg-white pb-24 pt-12">
      <div className="max-w-2xl mx-auto px-4">
        
        <Link href="/" className="inline-flex items-center gap-2 text-black/40 hover:text-black font-black text-[10px] uppercase tracking-[0.2em] mb-8 transition-colors group">
          <ChevronLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> VOLVER_CORE
        </Link>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-black pb-8">
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-black text-black tracking-[-0.05em] uppercase leading-none italic">NOTIFICACIONES</h1>
            <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.3em] pl-1">DATA_STREAMING: LIVE_UPDATES // v3.0</p>
          </div>
          {notifications.some(n => !n.read) && (
            <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 border-2 border-black text-[9px] font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
                <CheckCheck size={14} strokeWidth={3} /> MARK_ALL_SYNC
            </button>
          )}
        </header>

        <div className="space-y-16">
          {notifications.length === 0 ? (
            <div className="bg-white border-4 border-black p-20 text-center shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-24 h-24 bg-[#F5F5F5] border-2 border-dashed border-black/20 flex items-center justify-center mx-auto mb-8 text-black/10">
                <Bell size={48} strokeWidth={1} />
              </div>
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-2 italic">ENCRYPTED_IDLE</h3>
              <p className="text-black/40 font-black uppercase text-[10px] tracking-widest">NO SE REGISTRARON NUEVOS EVENTOS EN EL FLUJO.</p>
            </div>
          ) : (
            groupOrder.map(group => groups[group] && (
              <section key={group} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-[10px] font-black text-black uppercase tracking-[0.3em] bg-black text-white px-3 py-1 flex-shrink-0">{group}</h2>
                  <div className="h-[2px] w-full bg-black/5" />
                </div>
                <div className="space-y-4">
                  {groups[group].map((n: any) => (
                    <NotificationCard key={n.id} notification={n} onRead={() => markAsRead(n.id)} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

function NotificationCard({ notification, onRead }: { notification: any, onRead: () => void }) {
  const Icon = notification.type === 'reward' ? Gift : notification.type === 'order' ? Package : Bell;
  const isReward = notification.type === 'reward';
  
  return (
    <motion.div
        layout
        className={`relative bg-white p-6 border-2 border-black flex gap-6 items-start shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(255,92,0,1)] transition-all group ${
            !notification.read ? 'bg-[#FF5C00]/5 ring-1 ring-inset ring-[#FF5C00]/20' : ''
        }`}
    >
      <div className={`w-14 h-14 border-2 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all ${
          isReward ? 'bg-[#FF5C00] text-black' : 'bg-black text-white'
      }`}>
        <Icon size={28} strokeWidth={isReward ? 3 : 2} />
      </div>
      
      <div className="flex-1 space-y-2 pr-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
           <h4 className="text-sm font-black text-black uppercase tracking-tight italic">{notification.title}</h4>
           <span className="text-[9px] font-mono text-black/30 uppercase tracking-widest tabular-nums">
              [{new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
           </span>
        </div>
        <p className="text-[11px] text-black/60 font-black uppercase tracking-tight leading-relaxed">{notification.message}</p>
        
        {notification.link && (
          <div className="pt-2">
            <Link 
                href={notification.link} 
                onClick={onRead}
                className="bg-black text-white px-4 py-2 text-[8px] font-black uppercase tracking-[0.2em] border border-black hover:bg-[#FF5C00] hover:text-black transition-all inline-flex items-center gap-2 group/link"
            >
                VER_DETALLES <ChevronRight size={12} strokeWidth={3} className="group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {!notification.read && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRead();
          }}
          className="absolute right-4 top-4 w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-[#FF5C00] hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
          title="MARK_READ"
        >
          <Check size={20} strokeWidth={4} />
        </button>
      )}
    </motion.div>
  );
}
