"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Package, Gift, ChevronRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('realtime_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-bandha-subtle transition-all text-bandha-text-secondary group"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-bandha-danger text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-bandha-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-bandha-surface border border-bandha-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-4 border-b border-bandha-border flex items-center justify-between">
              <h3 className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest">Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-bandha-primary uppercase hover:underline"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-bandha-text-muted opacity-20 mb-2" size={32} />
                  <p className="text-xs text-bandha-text-muted font-medium">No tenés notificaciones todavía.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <Link 
                    key={n.id} 
                    href={n.link || '#'}
                    onClick={() => {
                      markAsRead(n.id);
                      setIsOpen(false);
                    }}
                    className={`block p-4 border-b border-bandha-border last:border-0 hover:bg-bandha-subtle transition-all relative ${!n.read ? 'bg-bandha-primary/5' : ''}`}
                  >
                    {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-bandha-primary rounded-full" />}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === 'reward' ? 'bg-green-100 text-green-600' : 
                        n.type === 'order' ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {n.type === 'reward' ? <Gift size={16} /> : n.type === 'order' ? <Package size={16} /> : <Bell size={16} />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-bandha-text leading-tight">{n.title}</p>
                        <p className="text-[11px] text-bandha-text-muted leading-tight line-clamp-2">{n.message}</p>
                        <p className="text-[9px] font-medium text-bandha-text-muted mt-1 uppercase tracking-tight">Hace un momento</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="p-3 bg-bandha-subtle border-t border-bandha-border text-center">
              <Link href="/perfil/notificaciones" className="text-[10px] font-black text-bandha-text-secondary uppercase tracking-widest hover:text-bandha-primary transition-colors flex items-center justify-center gap-1">
                Ver todo el historial <ChevronRight size={12} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
