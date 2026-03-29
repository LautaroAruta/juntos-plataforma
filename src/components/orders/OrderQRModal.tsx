"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { 
  X, 
  Download, 
  ShieldCheck, 
  Info,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  deliveryToken: string;
  productName: string;
}

export default function OrderQRModal({ 
  isOpen, 
  onClose, 
  orderId, 
  deliveryToken, 
  productName 
}: OrderQRModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && deliveryToken) {
      setLoading(true);
      QRCode.toDataURL(deliveryToken, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      .then(url => {
        setQrDataUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error generating QR:", err);
        setLoading(false);
      });
    }
  }, [isOpen, deliveryToken]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-bandha-primary/10 flex items-center justify-center text-bandha-primary">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Puntaje Seguro</span>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 text-center">
            <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">Tu código de retiro</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-1">{productName}</p>

            {/* QR Container */}
            <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-slate-50 rounded-3xl p-4 border-2 border-slate-100 flex items-center justify-center overflow-hidden">
              {loading ? (
                <Loader2 className="animate-spin text-bandha-primary" size={40} />
              ) : (
                <img src={qrDataUrl} alt="Order QR code" className="w-full h-full object-contain" />
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 bg-[#FFF8E7] p-4 rounded-2xl text-left border border-[#FFD200]/20">
                <Info size={18} className="text-[#009EE3] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                  Mostrá este código al proveedor en el punto de retiro para validar tu compra. No lo compartas con nadie.
                </p>
              </div>

              <button 
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = qrDataUrl;
                  link.download = `bandha-order-${orderId}.png`;
                  link.click();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95"
              >
                <Download size={16} />
                Descargar Imagen
              </button>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="h-2 bg-gradient-to-r from-bandha-primary to-bandha-secondary" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
