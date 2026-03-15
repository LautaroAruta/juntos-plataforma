"use client";

import { Star, CheckCircle2, User, ThumbsUp, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select(`
          *,
          user:users (nombre, avatar_url)
        `)
        .eq('product_id', productId)
        .order('fecha_publicacion', { ascending: false });
      
      if (data) setReviews(data);
      setLoading(false);
    }

    fetchReviews();
  }, [productId, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-50 rounded-2xl" />
        ))}
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-3">
            <MessageCircle className="text-[#009EE3]" size={28} />
            Lo que dicen tus vecinos
          </h2>
          <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-tight">
            Opiniones de compradores verificados en tu zona
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-center px-4 border-r border-gray-50">
              <div className="text-3xl font-black text-gray-800 tracking-tighter">{averageRating}</div>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={Number(averageRating) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                ))}
              </div>
            </div>
            <div className="px-2">
                <div className="text-xs font-bold text-gray-800">{reviews.length} Reseñas</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Participación Real</div>
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-slate-50 rounded-[2rem] p-12 text-center border-2 border-dashed border-gray-200">
          <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-500 font-black text-lg tracking-tight uppercase">¡Sé el primero en opinar!</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            Ayudá a otros vecinos a comprar con confianza compartiendo tu experiencia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 overflow-hidden">
                    {review.user?.avatar_url ? (
                      <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-800">{review.user?.nombre || "Vecino Anónimo"}</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={review.calificacion >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                </div>
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 gap-1 font-black text-[9px] uppercase tracking-widest py-1">
                    <CheckCircle2 size={10} /> Compra Verificada
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 text-sm font-medium leading-relaxed italic mb-4">
                "{review.comentario}"
              </p>

              <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {new Date(review.fecha_publicacion).toLocaleDateString()}
                </span>
                <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#009EE3] transition-colors">
                  <ThumbsUp size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Útil</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
