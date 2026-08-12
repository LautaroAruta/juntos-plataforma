'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Star, Heart, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductHeaderActionsProps {
  productId: string;
  productName: string;
  price: number;
}

export default function ProductHeaderActions({ productId, productName, price }: ProductHeaderActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('bandha_favorites') || '[]');
    setIsFavorite(favorites.includes(productId));
  }, [productId]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('bandha_favorites') || '[]');
    let newFavorites;
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== productId);
      toast.success('Eliminado de favoritos');
    } else {
      newFavorites = [...favorites, productId];
      toast.success('Agregado a favoritos');
    }
    localStorage.setItem('bandha_favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const shareProduct = async () => {
    const url = `${window.location.origin}/productos/${productId}`;
    const shareData = {
      title: productName,
      text: `¡Mirá esta oferta en BANDHA! ${productName} a solo $${price.toLocaleString()}`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop: copy to clipboard
      navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
      toast.success('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="flex gap-3 text-bandha-text-muted relative">
      <button 
        onClick={shareProduct}
        className="hover:text-bandha-primary transition-colors active:scale-95 p-1"
        title="Compartir"
      >
        <Share2 size={20} />
      </button>
      <button 
        onClick={toggleFavorite}
        className={`transition-all active:scale-95 p-1 ${isFavorite ? 'text-red-500 fill-current' : 'hover:text-bandha-primary'}`}
        title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        {isFavorite ? <Heart size={20} fill="currentColor" /> : <Star size={20} />}
      </button>

      <AnimatePresence>
        {showShareToast && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 bg-bandha-text text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl z-20"
          >
            ¡Link Copiado!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
