"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Users, X, MapPin, ShoppingBag, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
  avatar: string;
  isMe?: boolean;
}

export default function CommunityChat({ neighborhood }: { neighborhood: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", user: "Martín", text: "¡Hola! ¿Alguien para las manzanas orgánicas?", time: "18:40", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Martin" },
    { id: "2", user: "Elena", text: "Yo me sumo si compramos el pack de 5kg.", time: "18:42", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
    { id: "3", user: "Lucas", text: "¡Dale, yo también!", time: "18:45", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas" },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      user: "Vos",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      isMe: true
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleQuickShare = (product: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      user: "Vos",
      text: `🚀 ¡Estoy por comprar ${product}! ¿Alguien más se suma para el descuento?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      isMe: true
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="mb-4 w-96 h-[550px] glass-dark rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,174,239,0.3)] flex flex-col overflow-hidden border border-white/20 relative"
          >
            {/* Mesh Background for chat */}
            <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none" />
            
            {/* Header — Command Style */}
            <div className="p-6 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#00AEEF] text-white flex items-center justify-center shadow-lg shadow-[#00AEEF]/30">
                    <MapPin size={20} className="text-glow-blue" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-0.5">Barrio Detectado</h4>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight leading-none text-glow-blue">{neighborhood}</h4>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors text-white/70">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold bg-black/10 w-fit px-3 py-1 rounded-full">
                <Users size={12} /> 12 vecinos activos
              </div>
            </div>

            {/* Messages — Glass Bubbles */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-sm overflow-hidden shrink-0 relative">
                      <Image src={msg.avatar} alt={msg.user} fill className="p-1" />
                    </div>
                    <div className={msg.isMe ? 'text-right' : 'text-left'}>
                      {!msg.isMe && <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5 ml-1">{msg.user}</p>}
                      <div className={`p-4 rounded-[1.5rem] text-xs font-medium backdrop-blur-3xl shadow-xl transition-all ${
                        msg.isMe 
                          ? 'bg-[#00AEEF] text-white rounded-tr-none border border-[#00AEEF]/30 shadow-[#00AEEF]/20' 
                          : 'bg-white/20 text-white rounded-tl-none border border-white/30'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[8px] font-black text-white/20 mt-2 uppercase tracking-widest ${msg.isMe ? 'mr-1' : 'ml-1'}`}>{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribí a tus vecinos..."
                className="flex-1 bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-[#00AEEF] transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 bg-[#00AEEF] text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-[#00AEEF]/20 transition-all shrink-0"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Quick Coordination Tools */}
            <div className="px-6 pb-6 pt-4 flex gap-3 overflow-x-auto no-scrollbar relative z-10">
               <button 
                 onClick={() => handleQuickShare("Frutas")}
                 className="whitespace-nowrap bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-black px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-2 transition-all"
               >
                 <ShoppingBag size={14} className="text-orange-400" /> COORDINAR COMPRA
               </button>
               <button 
                 onClick={() => handleQuickShare("Aceite")}
                 className="whitespace-nowrap bg-white/10 hover:bg-white/20 text-white/80 text-[10px] font-black px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-2 transition-all"
               >
                 <Zap size={14} className="text-blue-400" /> UNIRME A GRUPO
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#00AEEF] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#00AEEF]/30 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black animate-bounce">
            3
          </span>
        )}
      </motion.button>
    </div>
  );
}
