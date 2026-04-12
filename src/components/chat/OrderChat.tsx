"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, MapPin, MessageCircle } from "lucide-react";

interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_type: "cliente" | "proveedor" | "sistema";
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
  userRole: "cliente" | "proveedor";
}

export default function OrderChat({ orderId, currentUserId, userRole }: OrderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pickupPoint, setPickupPoint] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // 1. Fetch historical messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("creado_en", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    // 3. Fetch Pickup Point for quick share
    const fetchPickupPoint = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          pickup_point:pickup_points (
            name,
            address
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (!error && data?.pickup_point) {
        setPickupPoint(data.pickup_point);
      }
    };
    fetchPickupPoint();

    // 2. Subscribe to new messages in real-time
    const channel = supabase
      .channel(`chat_order_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, supabase]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Optimistic UI clear

    const { error } = await supabase.from("chat_messages").insert([
      {
        order_id: orderId,
        sender_id: currentUserId,
        sender_type: userRole,
        mensaje: messageText,
      },
    ]);

    if (error) {
      console.error("Error sending message:", error);
      // Opcional: Mostrar un toast de error o devolver el mensaje al input
    }
  };

  return (
    <div className="flex flex-col bg-white border-4 border-black rounded-none overflow-hidden h-[500px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
      {/* Header */}
      <div className="bg-black text-white px-6 py-4 flex flex-col gap-1 border-b-2 border-black">
        <h3 className="font-black text-xs tracking-[0.3em] uppercase flex items-center gap-2">
          <MessageCircle size={14} className="text-[#FF5C00]" strokeWidth={3} />
          COMMUNICATION_LINK // {userRole.toUpperCase()}
        </h3>
        <p className="text-[8px] font-mono opacity-50 uppercase tracking-widest">
          ESTABLISHED_ENCRYPTION: AES_256 // ID: {orderId.slice(0, 8)}
        </p>
      </div>

      {/* Messages View */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#F5F5F5] space-y-6 scrollbar-thin scrollbar-thumb-black">
        {loading ? (
          <div className="h-full flex items-center justify-center text-black/20 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
            SYNCHRONIZING_BUFFER...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-black/10 text-center px-10 gap-4">
            <Send size={40} strokeWidth={1} className="opacity-10" />
            <div>
              <p className="font-black text-[11px] uppercase tracking-widest mb-1 italic">NO_RECORDS_FOUND</p>
              <p className="text-[9px] font-mono leading-relaxed">INICIÁ EL PROTOCOLO DE CONVERSACIÓN PARA RESOLVER DUDAS SOBRE EL ENVÍO.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            const isSystem = msg.sender_type === "sistema" || msg.mensaje.startsWith("SISTEMA:");

            if (isSystem) {
              return (
                <div key={msg.id} className="w-full flex justify-center py-2">
                  <div className="bg-[#FF5C00] border-2 border-black px-6 py-2 text-[9px] font-black text-black text-center uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[90%] relative">
                    {msg.mensaje.replace("SISTEMA: ", "")}
                    <div className="absolute -left-1 -top-1 w-2 h-2 bg-white border border-black"></div>
                    <div className="absolute -right-1 -bottom-1 w-2 h-2 bg-white border border-black"></div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] border-2 border-black p-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    isMine
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <p className="text-[11px] font-black uppercase tracking-tight leading-relaxed">{msg.mensaje}</p>
                  <div className={`flex items-center gap-2 mt-3 pt-2 border-t border-current/10 text-[8px] font-mono ${
                    isMine ? "text-white/40" : "text-black/40"
                  }`}>
                    <span>{new Date(msg.creado_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="w-1 h-1 bg-current opacity-20 rounded-full"></span>
                    <span>{isMine ? "ME" : "REMOTE"}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t-2 border-black">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="ESCRBI_TU_MENSAJE..."
              className="w-full bg-[#F5F5F5] border-2 border-black px-5 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:bg-white placeholder:text-black/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {userRole === "proveedor" && pickupPoint && (
               <button
                  type="button"
                  onClick={async () => {
                     const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupPoint.address)}`;
                     const text = `📍 PUNTO_RETIRO: ${pickupPoint.name} // DIR: ${pickupPoint.address} // MAPS: ${mapsUrl}`;
                     
                     await supabase.from("chat_messages").insert([{
                       order_id: orderId,
                       sender_id: currentUserId,
                       sender_type: userRole,
                       mensaje: text,
                     }]);
                  }}
                  className="bg-white border-2 border-black text-black hover:bg-[#FF5C00] p-4 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  title="SHARE_PICKUP_LOCATION"
               >
                  <MapPin size={20} strokeWidth={3} />
               </button>
            )}
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-[#FF5C00] text-black border-2 border-black p-4 disabled:opacity-20 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none group"
            >
              <Send size={20} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
