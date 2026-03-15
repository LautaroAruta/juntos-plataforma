"use client";

import { useState } from "react";
import { Bell, X, CheckSquare, Package, Zap, ExternalLink } from "lucide-react";
import { useNotificationStore, Notification } from "@/store/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_status': return <Package className="w-4 h-4 text-blue-500" />;
      case 'deal_alert': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'system': return <CheckSquare className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="relative p-2 text-gray-500 hover:text-[#009EE3] transition-all rounded-full hover:bg-gray-50 group focus:outline-none">
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 md:w-96 p-0 mt-2 rounded-2xl shadow-xl border-gray-100 overflow-hidden" align="end">
        <div className="p-4 border-b border-gray-50 bg-white sticky top-0 z-10 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm tracking-tight flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && <Badge variant="secondary" className="bg-red-50 text-red-500 border-red-100 font-bold text-[10px]">{unreadCount} nuevas</Badge>}
          </h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest hover:underline"
            >
              Marcar todo como leído
            </button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 bg-gray-50/30">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Bell className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold text-sm">No tienes notificaciones aún</p>
              <p className="text-gray-300 text-xs mt-1">Te avisaremos por acá cuando haya novedades en tu barrio.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              <AnimatePresence initial={false}>
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      "p-4 transition-all hover:bg-slate-50 relative group border-l-4",
                      notif.read ? "border-transparent bg-white" : "border-[#009EE3] bg-blue-50/20"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex justify-between items-start mb-1">
                          <p className={cn("text-sm leading-tight line-clamp-1", notif.read ? "text-gray-700 font-medium" : "text-gray-900 font-black")}>
                            {notif.title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-snug mb-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                            {notif.link && (
                                <Link 
                                    href={notif.link} 
                                    className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    Ver detalle <ExternalLink size={10} />
                                </Link>
                            )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeNotification(notif.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <X size={14} />
                    </button>
                    
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#009EE3] shadow-[0_0_8px_rgba(0,158,227,0.5)]"
                        title="Marcar como leído"
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                <Link href="/dashboard" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#009EE3] transition-colors">
                    Ver todas las actividades
                </Link>
            </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
