import React from 'react';
import Link from 'next/link';
import { WifiOff, Home, ShoppingBag, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bandha-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-bandha-subtle rounded-full flex items-center justify-center mb-8 text-bandha-text-muted">
        <WifiOff size={48} />
      </div>
      
      <h1 className="text-3xl font-black text-bandha-text tracking-tighter uppercase mb-2">Sin conexión</h1>
      <p className="text-bandha-text-secondary font-medium mb-12 max-w-xs">
        Parece que no tenés internet. Pero no te preocupes, ¡BANDHA sigue con vos!
      </p>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-bandha-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-bandha-primary/20 flex items-center justify-center gap-3 uppercase tracking-tight transition-transform active:scale-95"
        >
          <RefreshCw size={20} /> Reintentar conexión
        </button>

        <Link 
          href="/perfil/compras"
          className="w-full bg-white border-2 border-bandha-border text-bandha-text font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase tracking-tight transition-transform active:scale-95"
        >
          <ShoppingBag size={20} /> Ver mis pedidos (offline)
        </Link>

        <Link 
          href="/"
          className="w-full text-bandha-text-muted font-bold py-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
        >
          <Home size={18} /> Volver al Inicio
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-bandha-border w-full max-w-xs">
        <p className="text-[10px] font-black text-bandha-text-muted uppercase tracking-[0.2em]">
          🐧 BANDHA Neighborhood App
        </p>
      </div>
    </div>
  );
}
