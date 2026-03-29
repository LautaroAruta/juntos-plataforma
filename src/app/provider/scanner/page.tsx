"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Package,
  ArrowRight,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import QRScanner from "@/components/provider/QRScanner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function ProviderScannerPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    orderDetails?: any;
  } | null>(null);

  const handleScan = async (token: string) => {
    if (isVerifying || scanResult?.success) return;

    setIsVerifying(true);
    try {
      const res = await fetch("/api/orders/verify-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setScanResult({
          success: true,
          message: data.message,
          orderDetails: data.orderDetails
        });
        toast.success("¡Pedido verificado!");
      } else {
        setScanResult({
          success: false,
          message: data.error || "Error al verificar el código"
        });
        toast.error(data.error || "Error de validación");
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: "Error de conexión con el servidor"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsVerifying(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Fijo */}
      <div className="bg-white border-b border-slate-100 p-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
           <Link href="/provider/dashboard" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
             <ChevronLeft size={20} />
           </Link>
           <div className="text-center">
             <h1 className="text-sm font-black uppercase tracking-widest text-slate-800">Validar Entrega</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase">Escanea el código del cliente</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-bandha-primary/10 flex items-center justify-center text-bandha-primary">
             <ShieldCheck size={18} />
           </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 pt-12">
        <AnimatePresence mode="wait">
          {!scanResult ? (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
               <QRScanner onScan={handleScan} isVerifying={isVerifying} />
               
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-start gap-4 text-slate-500">
                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                        <Package size={16} />
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase tracking-tight text-slate-800 mb-1">Instrucciones</p>
                        <p className="text-[10px] font-bold leading-relaxed">
                          Encuadrá el código QR del celular del cliente. El sistema lo detectará automáticamente y validará la entrega en tiempo real.
                        </p>
                     </div>
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-[3rem] p-10 text-center shadow-2xl ${scanResult.success ? 'border-4 border-bandha-primary/20' : 'border-4 border-red-50'}`}
            >
              <div className={`w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center ${scanResult.success ? 'bg-bandha-primary text-white shadow-xl shadow-bandha-primary/30' : 'bg-red-500 text-white'}`}>
                {scanResult.success ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
              </div>

              <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight leading-tight uppercase">
                {scanResult.success ? "¡Entrega Validada!" : "Error de Validación"}
              </h2>
              
              <p className="text-sm font-bold text-slate-500 mb-10 leading-relaxed px-4">
                {scanResult.message}
              </p>

              {scanResult.orderDetails && (
                <div className="bg-slate-50 p-6 rounded-3xl mb-10 border border-slate-100 text-left">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Detalle del Pedido</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-700">{scanResult.orderDetails.productName}</span>
                    <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-400">#{scanResult.orderDetails.id.slice(0, 8)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button 
                  onClick={resetScanner}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 ${scanResult.success ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-red-500 text-white hover:bg-red-600'}`}
                >
                  <RefreshCcw size={16} />
                  {scanResult.success ? "Escanear Siguiente" : "Reintentar Escaneo"}
                </button>
                
                <Link 
                  href="/provider/dashboard"
                  className="w-full py-5 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Volver al Panel
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 left-0 right-0 text-center pointer-events-none opacity-20">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Bandha Secure Delivery System</p>
      </div>
    </div>
  );
}
