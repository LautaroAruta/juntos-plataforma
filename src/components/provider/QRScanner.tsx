"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerProps {
  onScan: (token: string) => void;
  isVerifying: boolean;
}

export default function QRScanner({ onScan, isVerifying }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setIsActive(true);
        setScanError(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setScanError("No se pudo acceder a la cámara. Verificá los permisos.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsActive(false);
    }
  };

  useEffect(() => {
    let animationFrameId: number;

    const scan = () => {
      if (!isActive || !videoRef.current || !canvasRef.current || isVerifying) {
        animationFrameId = requestAnimationFrame(scan);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // Token found! 
          onScan(code.data);
          // Don't stop the camera yet, let the parent handle the verification UI
        }
      }
      animationFrameId = requestAnimationFrame(scan);
    };

    if (isActive) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, isVerifying, onScan]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-900 border-4 border-white shadow-2xl">
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md">
              <Camera size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Escáner de Retiro</h3>
            <p className="text-sm text-slate-400 font-medium mb-8">Necesitamos acceso a tu cámara para escanear el código QR del cliente.</p>
            <button 
              onClick={startCamera}
              className="px-8 py-4 bg-bandha-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all active:scale-95 shadow-xl shadow-bandha-primary/40"
            >
              Activar Cámara
            </button>
          </div>
        )}

        {isActive && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute inset-0 border-[40px] border-black/40" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-bandha-primary/50 rounded-3xl">
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-bandha-primary shadow-[0_0_15px_rgba(0,166,80,0.8)]"
                  />
               </div>
            </div>
            
            <button 
              onClick={stopCamera}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20"
            >
              <CameraOff size={20} />
            </button>
          </>
        )}

        {isVerifying && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="animate-spin text-bandha-primary mb-4" size={48} />
            <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">Verificando Pedido...</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {scanError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
          >
            <XCircle size={20} className="shrink-0" />
            <p className="text-xs font-bold">{scanError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
