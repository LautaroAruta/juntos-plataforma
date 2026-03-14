"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, QrCode, ArrowRight, Home, ShoppingBag, Download, Loader2 } from "lucide-react";
import QRCode from 'qrcode';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function generateQR() {
      if (paymentId) {
        try {
          // In a real production app, we would use a signed JWT or a hash from the server
          // For now, we'll create a more secure looking payload
          const secureToken = btoa(`JUNTOS|${paymentId}|${new Date().getTime()}`);
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
    <div className="min-h-screen bg-[#E8F7FF] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#00AEEF]/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#00AEEF]/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-green-50 rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 mb-8 ring-8 ring-green-50">
            <CheckCircle2 size={56} />
          </div>
          
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter uppercase">¡Pago Exitoso!</h1>
          <p className="text-slate-500 font-medium mb-8">Tu lugar en el grupo está asegurado.</p>

          <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 border border-slate-100 shadow-inner group transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tu pase de retiro</p>
            <div className="bg-white p-4 rounded-3xl shadow-lg inline-block border-2 border-slate-50 group-hover:scale-105 transition-transform duration-500">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-200">
                  <QrCode size={64} className="animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-slate-800 mt-6 flex items-center justify-center gap-2">
              ID: {paymentId?.substring(0, 12)}...
            </p>
            <button className="text-[#00AEEF] text-[10px] font-black uppercase mt-3 hover:underline flex items-center gap-1 mx-auto">
              <Download size={12} /> Descargar comprobante
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <Link href="/" className="bg-slate-100 text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
               <Home size={20} />
             </Link>
             <Link href="/orders" className="bg-[#00AEEF] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#00AEEF]/20 hover:bg-[#0077CC] transition-all">
               <ShoppingBag size={20} /> Ver Mis Compras
             </Link>
          </div>
          
          <p className="mt-10 text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest px-4">
            Mostrá este código al momento de retirar tu pedido. No lo compartas con nadie.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#E8F7FF]"><Loader2 className="animate-spin text-[#00AEEF]" size={48} /></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
