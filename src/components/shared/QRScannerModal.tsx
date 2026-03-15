"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2, QrCode } from "lucide-react";
import jsQR from "jsqr";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (orderId: string) => Promise<void>;
}

export default function QRScannerModal({ isOpen, onClose, onVerify }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (!cameraActive || isVerifying) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScanResult(code.data);
            return; // Stop scanning once we find a code
          }
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    if (isOpen && cameraActive && !isVerifying) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, cameraActive, isVerifying]);

  const handleScanResult = async (data: string) => {
    // Look for our specific format: BANDHA_ORDER_<uuid>
    if (data.startsWith("BANDHA_ORDER_")) {
      const orderId = data.replace("BANDHA_ORDER_", "");
      setIsVerifying(true);
      try {
        await onVerify(orderId);
        onClose();
        toast.success("¡Entrega Verificada!");
      } catch (err: any) {
        toast.error(err.message || "Error al verificar");
        setIsVerifying(false);
      }
    } else {
      // It's a QR but not ours
      setError("Código QR no reconocido como una orden de BANDHA.");
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
              <QrCode size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Validar Entrega</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escaneá el código del cliente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-square bg-black overflow-hidden group">
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Overlay scanning effect */}
           <div className="absolute inset-0 border-[4rem] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-[#009EE3] rounded-2xl relative shadow-[0_0_0_100vmax_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#009EE3]/20 to-transparent h-1.5 w-full animate-scan-line" />
              </div>
           </div>

           {isVerifying && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#009EE3]" size={48} />
                <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Verificando Orden...</p>
             </div>
           )}

           {error && (
             <div className="absolute bottom-10 left-10 right-10 bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-xl animate-bounce">
                <AlertCircle size={20} />
                <p className="text-xs font-bold">{error}</p>
             </div>
           )}
        </div>

        {/* Footer info */}
        <div className="p-8 text-center bg-slate-50/50">
           <div className="flex justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cámara Activa</span>
           </div>
           <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
             Asegurate de que el QR esté bien iluminado y dentro del cuadro de escaneo.
           </p>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
