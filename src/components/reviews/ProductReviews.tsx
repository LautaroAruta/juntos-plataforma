'use client';

import React, { useEffect, useState } from 'react';
import { Star, User, Camera, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface Review {
  id: string;
  rating: number;
  comentario: string;
  fotos: string[];
  creado_en: string;
  user: {
     nombre: string;
     apellido: string;
  }
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user:users (nombre, apellido)
        `)
        .eq('product_id', productId)
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
      setLoading(false);
    }

    fetchReviews();
  }, [productId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div className="h-40 flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-bandha-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-black pb-4">
        <div>
           <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-1">Lo que dicen tus vecinos</h2>
           <p className="text-[9px] font-black text-black/40 uppercase tracking-widest">Opiniones verificadas de compradores en tu zona.</p>
        </div>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-4 bg-white p-4 border border-black shadow-[4px_4px_0px_0px_rgba(255,100,0,1)]">
             <div className="text-center px-4 border-r border-black/10">
                <p className="text-3xl font-black text-black tracking-tighter tabular-nums">{averageRating}</p>
                <div className="flex text-[#FF7A00]">
                   {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={Number(averageRating) >= s ? 'currentColor' : 'none'} />)}
                </div>
             </div>
             <div className="pr-4">
                <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">SEGÚN</p>
                <p className="text-xs font-black text-black uppercase">{reviews.length} RESEÑAS</p>
             </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <p className="text-slate-400 font-bold italic">Aún no hay reseñas de este producto. ¡Sé el primero en opinar!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] flex flex-col h-full hover:shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F5F5] border border-black flex items-center justify-center text-black">
                       <User size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black text-black uppercase tracking-tight">
                          {review.user?.nombre} {review.user?.apellido?.charAt(0)}.
                       </p>
                       <div className="flex items-center gap-1.5 mt-1">
                          <CheckCircle2 size={12} className="text-[#00A650]" />
                          <span className="text-[9px] font-black text-[#00A650] uppercase tracking-widest">VERIFICADO</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex text-[#FF7A00]">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={review.rating >= s ? 'currentColor' : 'none'} />)}
                 </div>
              </div>

              <p className="text-sm font-bold text-black uppercase tracking-tight leading-relaxed mb-6 flex-1 italic">
                &quot;{review.comentario}&quot;
              </p>

              {review.fotos?.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {review.fotos.map((foto, i) => (
                    <div key={i} className="relative w-24 h-24 border border-black overflow-hidden shrink-0">
                       <img src={foto} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Neighbor" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-black/5 mt-auto">
                 <div className="flex items-center gap-1.5 text-[9px] font-black text-black/30 uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(review.creado_en).toLocaleDateString('es-AR')}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
