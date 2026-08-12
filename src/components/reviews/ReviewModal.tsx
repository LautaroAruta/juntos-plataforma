'use client';

import React, { useState } from 'react';
import { Star, Camera, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, orderId, productId, productName, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor, seleccioná una calificación.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('productId', productId);
      formData.append('rating', rating.toString());
      formData.append('comment', comment);
      images.forEach((img, i) => formData.append(`image_${i}`, img));

      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al enviar la reseña');
      }
    } catch (err) {
      toast.error('Problema de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-none"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative bg-white border-4 border-black rounded-none p-10 md:p-14 w-full max-w-xl shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            {isSuccess ? (
              <div className="text-center py-14 space-y-8">
                 <div className="w-28 h-28 bg-[#FF5C00] text-black border-4 border-black rounded-none flex items-center justify-center mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle2 size={56} strokeWidth={3} className="animate-bounce" />
                 </div>
                 <h2 className="text-4xl font-black text-black uppercase tracking-[-0.05em] leading-none italic">
                    TRANSACCIÓN_CONFIRMADA
                 </h2>
                 <p className="text-black/50 font-black uppercase text-xs tracking-[0.2em] leading-relaxed">
                    TU RESEÑA HA SIDO INTEGRADA AL PROTOCOLO DE CONFIANZA.<br/>
                    <span className="text-[#FF5C00] bg-black px-2 py-1 mt-2 inline-block">STAKE_REWARD: +$150_CREDITS</span>
                 </p>
              </div>
            ) : (
              <>
                <button onClick={onClose} className="absolute top-8 right-8 text-black hover:text-[#FF5C00] transition-colors z-20">
                  <X size={32} strokeWidth={3} />
                </button>

                <div className="mb-10 relative">
                  <p className="text-[10px] font-black text-[#FF5C00] uppercase tracking-[0.3em] mb-3">NODE_FEEDBACK_v1.0</p>
                  <h2 className="text-4xl md:text-5xl font-black text-black uppercase tracking-[-0.05em] leading-[0.85] mb-4">
                    CALIFICAR_<br/>TRANSACCIÓN
                  </h2>
                  <div className="bg-black/5 border-l-4 border-black p-3 translate-x-1">
                    <p className="text-black/40 font-mono text-[9px] uppercase tracking-widest leading-none mb-1">PRODUCT_ENTITY</p>
                    <p className="text-black font-black text-sm uppercase tracking-tighter">{productName}</p>
                  </div>
                </div>

                <div className="space-y-10">
                  {/* Rating Selector */}
                  <div className="flex justify-between items-center bg-[#F5F5F5] border-2 border-black p-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/30">SCORE_VALUE:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                            rating >= star ? 'bg-[#FF5C00] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5' : 'bg-white text-black/10'
                          }`}
                        >
                          <Star size={18} fill={rating >= star ? 'currentColor' : 'none'} strokeWidth={3} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                       <div className="w-2 h-2 bg-[#FF5C00]"></div> INPUT_LOG: COMENTARIO
                    </label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="ESCRIBA SU REPORTE DE EXPERIENCIA AQUÍ..."
                      className="w-full bg-[#F5F5F5] border-2 border-black focus:bg-white p-6 text-[11px] font-black uppercase tracking-widest min-h-[140px] outline-none transition-all resize-none placeholder:text-black/10"
                    />
                  </div>

                  {/* Photos */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">VISUAL_DATA_LEAK</label>
                      <span className="text-[8px] font-mono text-[#FF5C00] uppercase tracking-widest animate-pulse">BOUNTY: +$100_CREDITS</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-24 h-24 border-2 border-black rounded-none overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                           <img src={src} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                           <button 
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-[#FF5C00]/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={24} strokeWidth={4} />
                           </button>
                        </div>
                      ))}
                      {previews.length < 3 && (
                        <label className="w-24 h-24 border-2 border-dashed border-black/20 flex flex-col items-center justify-center text-black/20 cursor-pointer hover:border-[#FF5C00] hover:text-[#FF5C00] hover:bg-black/5 transition-all">
                           <Camera size={32} strokeWidth={2} />
                           <span className="text-[8px] font-black uppercase mt-2 tracking-widest">UPLOAD_IMG</span>
                           <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || rating === 0}
                    className="w-full bg-black text-white py-6 border-2 border-black font-black uppercase tracking-[0.3em] text-[11px] shadow-[8px_8px_0px_0px_rgba(255,92,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : (
                      <>
                        PUSH_NETWORK_LOG
                        <div className="w-2 h-2 bg-[#FF5C00]"></div>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
