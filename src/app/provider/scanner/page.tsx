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
    <div className="min-h-screen bg-black pb-24 text-white">
      {/* Header Fijo */}
      <div className="bg-black border-b-4 border-[#FF5C00] p-8 sticky top-0 z-10 shadow-[0_8px_32px_rgba(255,92,0,0.2)]">
        <div className="max-w-md mx-auto flex items-center justify-between">
           <Link href="/provider/dashboard" className="w-14 h-14 border-2 border-white flex items-center justify-center text-white hover:bg-[#FF5C00] hover:text-black hover:border-[#FF5C00] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">
             <ChevronLeft size={28} strokeWidth={3} />
           </Link>
           <div className="text-center">
             <h1 className="text-2xl font-black uppercase tracking-[-0.05em] italic leading-none mb-1">SCAN_PROTOCOL</h1>
             <p className="text-[#FF5C00] text-[9px] font-black uppercase tracking-[0.4em]">VERIFY_DELIVERY // SYS_RDY</p>
           </div>
           <div className="w-14 h-14 border-2 border-[#FF5C00] bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00] shadow-[4px_4px_0px_0px_rgba(255,92,0,0.5)]">
             <ShieldCheck size={28} strokeWidth={3} />
           </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 pt-16">
        <AnimatePresence mode="wait">
          {!scanResult ? (
            <motion.div 
              key="scanner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-12"
            >
               <div className="relative group">
                 <div className="absolute -inset-4 border-2 border-[#FF5C00] opacity-20 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
                 <div className="border-4 border-white shadow-[16px_16px_0px_0px_rgba(255,92,0,1)] overflow-hidden bg-white/5">
                   <QRScanner onScan={handleScan} isVerifying={isVerifying} />
                 </div>
               </div>
               
               <div className="bg-white/5 p-8 border-2 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C00]/5 -mr-16 -mt-16 rotate-45" />
                  <div className="flex items-start gap-6 relative z-10">
                     <div className="w-12 h-12 border-2 border-[#FF5C00] flex items-center justify-center text-[#FF5C00] shrink-0 shadow-[4px_4px_0px_0px_rgba(255,92,0,0.3)]">
                        <Package size={24} strokeWidth={3} />
                     </div>
                     <div>
                        <p className="text-sm font-black uppercase tracking-widest text-[#FF5C00] mb-2 italic">SCAN_INSTRUCTIONS</p>
                        <p className="text-[10px] font-mono leading-relaxed text-white/60">
                          COLOQUE EL CÓDIGO QR DENTRO DEL LÍMITE DEL VISOR. EL SISTEMA PROCESARÁ EL TOKEN Y VALIDARÁ LA TRANSACCIÓN CONTRA EL LIBRO MAYOR DE BANDHA EN TIEMPO REAL.
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
              className={`border-4 p-12 text-center shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] bg-white ${scanResult.success ? 'border-[#FF5C00]' : 'border-red-600'}`}
            >
              <div className={`w-24 h-24 border-4 mx-auto mb-10 flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${scanResult.success ? 'bg-[#FF5C00] border-black text-black' : 'bg-red-600 border-black text-white'}`}>
                {scanResult.success ? <CheckCircle2 size={56} strokeWidth={3} /> : <XCircle size={56} strokeWidth={3} />}
              </div>

              <h2 className="text-4xl font-black text-black mb-6 tracking-tight leading-none uppercase italic">
                {scanResult.success ? "DELIVERY_OK" : "VALIDATION_ERR"}
              </h2>
              
              <p className="text-xs font-mono font-black text-black/60 mb-12 uppercase tracking-widest px-4">
                {scanResult.message}
              </p>

              {scanResult.orderDetails && (
                <div className="bg-black/5 p-8 border-2 border-black mb-12 text-left space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 border-2 border-black bg-white overflow-hidden shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {scanResult.orderDetails.productImage ? (
                        <img src={scanResult.orderDetails.productImage} alt="" className="w-full h-full object-cover grayscale contrast-125" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/20"><Package size={32} strokeWidth={3} /></div>
                      )}
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-[#FF5C00] uppercase tracking-widest mb-1 italic">PRODUCT_IDENT</span>
                      <span className="text-lg font-black text-black leading-none uppercase tracking-tighter italic">{scanResult.orderDetails.productName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 pt-4 border-t-2 border-black/10">
                    <div className="flex justify-between items-center bg-black/5 p-4 border border-black/10">
                      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest italic">CLIENT_ID</span>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">{scanResult.orderDetails.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/5 p-4 border border-black/10">
                      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest italic">SOURCE_NODE</span>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest truncate max-w-[150px]">{scanResult.orderDetails.pickupPointName}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <button 
                  onClick={resetScanner}
                  className={`w-full py-6 border-2 border-black font-black uppercase tracking-widest text-sm italic flex items-center justify-center gap-4 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 ${scanResult.success ? 'bg-[#FF5C00] text-black' : 'bg-red-600 text-white'}`}
                >
                  <RefreshCcw size={20} strokeWidth={3} />
                  {scanResult.success ? "NEW_SCAN" : "RETRY_PROTOCOL"}
                </button>
                
                <Link 
                  href="/provider/dashboard"
                  className="w-full py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/40 hover:text-[#FF5C00] transition-colors italic"
                >
                  ABORT_TO_DASHBOARD
                  <ArrowRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-10 left-0 right-0 text-center pointer-events-none opacity-40">
         <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[#FF5C00] italic">BANDHA_SECURE_SCAN // v9.0.4</p>
      </div>
    </div>
  );
}
