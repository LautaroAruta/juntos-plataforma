"use client";

import Link from "next/link";
import { CheckCircle2, Package, QrCode, ArrowRight, ArrowLeft, Home, ShoppingBag, Download, Loader2, Leaf } from "lucide-react";
import QRCode from 'qrcode';
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function generateQR() {
      const orderIdFromUrl = searchParams.get('order_id');
      const idToUse = orderIdFromUrl || paymentId;

      if (idToUse) {
        try {
          // Format for our Provider Scanner: BANDHA_ORDER_<id>
          const url = await QRCode.toDataURL(`BANDHA_ORDER_${idToUse}`);
          setQrDataUrl(url);
        } catch (err) {
          console.error("QR Generation error:", err);
        }
      }
    }
    generateQR();
  }, [paymentId, searchParams]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center mt-[-3rem]">
        
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 text-base mb-8">
          Tu orden fue procesada correctamente. Te enviamos un comprobante y los detalles para coordinar el retiro a tu e-mail.
        </p>

        {/* ECO IMPACT MESSAGE */}
        <div className="bg-[#00A650]/5 border border-[#00A650]/20 rounded-2xl p-4 mb-8 flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#00A650]/10 flex items-center justify-center text-[#00A650] shrink-0">
            <Leaf size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#00A650] uppercase tracking-widest leading-none mb-1">Impacto Eco</p>
            <p className="text-xs font-bold text-slate-700 leading-tight">
              Con esta compra de cercanía evitaste la emisión de <span className="text-[#00A650]">~0.5kg de CO2</span>. ¡Gracias por cuidar el barrio!
            </p>
          </div>
        </div>

        {qrDataUrl && (
          <div className="bg-white border-2 border-[#009EE3]/20 rounded-2xl p-6 mb-8 flex flex-col items-center gap-4 shadow-inner">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <QrCode className="text-[#009EE3]" size={18} /> Tu Código de Retiro
            </h3>
            <div className="bg-white p-3 rounded-xl border-4 border-slate-50 shadow-sm">
              <img src={qrDataUrl} alt="QR de Retiro" className="w-48 h-48" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center max-w-[200px]">
              Presentá este código al retirar o recibir tu pedido
            </p>
          </div>
        )}
        
        <div className="bg-gray-50 border rounded-lg p-6 mb-8 text-left">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-[#009EE3]" /> Preparando tu retiro
          </h3>
          <p className="text-sm text-gray-500">
            Los proveedores de tu orden ya fueron notificados y están empacando tus productos.
            El tiempo estimado de entrega suele ser de 2 a 5 días hábiles.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="w-full h-12 inline-flex items-center justify-center rounded-md bg-[#009EE3] hover:bg-[#00A650] text-white font-bold text-base transition-colors gap-2">
            Ver mis Compras <ArrowRight className="w-4 h-4 hidden sm:block" />
          </Link>
          
          <Link href="/" className="w-full h-12 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-base transition-colors gap-2">
            <ArrowLeft className="w-4 h-4 hidden sm:block" /> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#009EE3] animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
