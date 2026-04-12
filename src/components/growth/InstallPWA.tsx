'use client';

import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Show prompt after a delay (e.g., 10 seconds or on second visit)
    const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
    if (!hasSeenPrompt) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_seen', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:hidden"
        >
          <div className="bg-bandha-text text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Glossy background effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <button 
              onClick={closePrompt}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                 <img src="/icons/icon-192x192.png" alt="BANDHA" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-lg font-black tracking-tighter uppercase leading-none mb-1">Instalá BANDHA</h3>
                <p className="text-[11px] font-medium text-white/70 leading-snug">
                  Accedé más rápido a tus ofertas y comprá sin internet.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              {isIOS ? (
                <div className="flex items-center gap-3 text-xs font-bold text-white/90">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Share size={16} />
                  </div>
                  <span>Tocá "Compartir" y luego</span>
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <PlusSquare size={16} />
                  </div>
                  <span>"Agregar a Inicio"</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-xs font-bold text-white/90">
                   <Smartphone size={18} className="text-bandha-primary" />
                   <span>Agregalo desde el menú de tu navegador para una experiencia premium.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
