"use client";

import Link from "next/link";
import { CheckCircle2, Package, QrCode, ArrowRight, ArrowLeft, MessageCircle, ShoppingBag, Download, Loader2, MapPin, Users, Share2 } from "lucide-react";
import QRCode from 'qrcode';
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function generateQR() {
      if (paymentId) {
        try {
          const secureToken = btoa(`BANDHA|${paymentId}|${new Date().getTime()}`);
          const url = await QRCode.toDataURL(secureToken);
          setQrDataUrl(url);
        } catch (err) {
          console.error(err);
        }
      }
    }
    generateQR();
  }, [paymentId]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-1000">
      {/* LUXURY RECEIPT CONTAINER */}
      <div className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-10 md:p-16 relative overflow-hidden shadow-2xl shadow-black/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-stone/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-40" />
        
        {/* SUCCESS HEADER */}
        <div className="text-center mb-16 relative z-10">
          <div className="w-20 h-20 bg-gray-50 border border-gray-400/20 shadow-xl shadow-gray-400/5 text-gray-400 flex items-center justify-center mx-auto mb-8 rounded-full">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-serif text-black tracking-tight mb-4 leading-none">
            ¡Pago <span className="text-gray-400 italic">Exitoso</span>!
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">
            Transacción Confirmada
          </p>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest font-mono">
            REF: {paymentId || "TXN_XXXXXXXXX"}
          </p>
        </div>
        
        <div className="space-y-10 mb-16 relative z-10">
          <p className="text-sm font-medium text-gray-500 leading-relaxed text-center max-w-md mx-auto">
            Tu orden ha sido procesada con éxito y se encuentra en nuestro protocolo de validación. Hemos enviado el comprobante digital a tu correo.
          </p>

          {qrDataUrl && (
            <div className="bg-gray-50/50 rounded-3xl p-10 border border-gray-100 space-y-8 flex flex-col items-center group hover:bg-white transition-colors">
              <div className="text-center">
                <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-3">
                  <QrCode size={16} className="text-gray-400" /> Tu Identificador de Retiro
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Presentá este código al momento de entrega</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-black/5 group-hover:scale-105 transition-transform duration-500">
                <img src={qrDataUrl} alt="QR de Retiro" className="w-48 h-48 opacity-80 mix-blend-multiply" />
              </div>
            </div>
          )}
        </div>

        {/* LOGISTICS & COMMUNITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-10">
          <div className="p-8 bg-[#F5F5F7] rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <MapPin size={20} className="text-gray-400" />
              <h3 className="font-black text-[10px] text-black uppercase tracking-widest">Punto de Entrega</h3>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed uppercase tracking-wider">
              Tu zona de influencia está habilitada. Recibirás una notificación cuando tu orden esté lista para ser retirada en el Hub designado.
            </p>
          </div>

          <div className="p-8 bg-black text-white rounded-2xl relative overflow-hidden group cursor-pointer"
               onClick={() => {
                   if (navigator.share) {
                      navigator.share({
                        title: '¡Sumate a esta oferta en BANDHA!',
                        text: 'Me acabo de unir al grupo para comprar esto más barato. ¡Sumate vos también!',
                        url: window.location.origin
                      });
                   }
                }}>
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={18} className="text-gray-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Acelerar Grupo</h4>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-6 leading-relaxed opacity-60">
                  Compartí para completar el lote más rápido.
                </p>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  Invitar Vecinos <Share2 size={12} />
                </div>
             </div>
             <Users className="absolute -right-6 -bottom-6 text-white/5 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        
        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <Link href="/perfil/compras" className="flex-[2] bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-gray-800 transition-all h-18 rounded-2xl flex items-center justify-center gap-3 text-xs tracking-widest group">
            Gestionar mis Compras <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href={`/perfil/compras?chat=true`} className="flex-1 h-18 flex items-center justify-center bg-white border border-gray-100 text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all">
            <MessageCircle className="mr-3 w-4 h-4 text-gray-400" /> Soporte
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-50 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-gray-400 transition-colors">
            « Volver a la Tienda
          </Link>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-6 text-gray-200 font-bold text-[9px] uppercase tracking-[0.6em] opacity-40">
        <span>BANDHA</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>PROTOCOL 2.1</span>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#FF5C00] animate-spin" strokeWidth={3} />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
