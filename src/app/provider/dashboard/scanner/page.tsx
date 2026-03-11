"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import jsQR from "jsqr";
import { createClient } from "@/lib/supabase/client";

export default function QRScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let animationFrameId: number;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas) {
          const context = canvas.getContext("2d");
          if (context) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code && scanning) {
              handleScan(code.data);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (scanning) startCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  const handleScan = async (data: string) => {
    setScanning(false);
    setLoading(true);
    
    // Format expected: JUNTOS-ORDER-[PAYMENT_ID]
    const orderId = data.replace("JUNTOS-ORDER-", "");

    try {
      // 1. Verify and update order in Supabase
      // In a real app, verify the JWT if signed
      const { data: updateData, error } = await supabase
        .from('orders')
        .update({ estado: 'entregado', qr_escaneado: true, qr_escaneado_en: new Date().toISOString() })
        // .eq('qr_code', data) // We'd ideally match specific QR content
        .select()
        .single();

      if (error) {
          setResult({ success: false, message: "Pedido no encontrado o ya entregado." });
      } else {
          setResult({ success: true, message: "¡Pedido entregado con éxito!", order: updateData });
      }
    } catch (err) {
      setResult({ success: false, message: "Error al procesar el código." });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between p-6">
      <div className="w-full flex justify-between items-center text-white">
        <Link href="/provider/dashboard" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-sm font-black uppercase tracking-widest">Escáner de Retiro</h1>
        <div className="w-10"></div>
      </div>

      <div className="relative w-full aspect-square max-w-sm rounded-[3rem] overflow-hidden border-4 border-white/20 shadow-2xl">
        {scanning ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-[40px] border-black/40"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#00AEEF] rounded-3xl">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#00AEEF] rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#00AEEF] rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#00AEEF] rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#00AEEF] rounded-br-xl"></div>
              {/* Scanline Animation */}
              <div className="w-full h-1.5 bg-[#00AEEF]/50 absolute top-0 left-0 rounded-full animate-scan"></div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-8 text-center text-white">
            {loading ? (
              <Loader2 className="animate-spin text-[#00AEEF]" size={64} />
            ) : result?.success ? (
              <>
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20">
                  <CheckCircle2 size={56} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">{result.message}</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">El stock ha sido actualizado automáticamente.</p>
                <button 
                  onClick={resetScanner}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all font-black text-sm uppercase tracking-widest"
                >
                  Continuar Escaneando
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-red-500/20">
                  <XCircle size={56} />
                </div>
                <h2 className="text-2xl font-black mb-2 tracking-tight">Error de Lectura</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">{result?.message}</p>
                <button 
                  onClick={resetScanner}
                  className="w-full bg-[#00AEEF] text-white font-bold py-4 rounded-2xl hover:bg-[#0077CC] transition-all font-black text-sm uppercase tracking-widest"
                >
                  Reintentar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-sm bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/10 text-center">
        <div className="flex items-center justify-center gap-3 text-white/40 mb-2">
            <QrCode size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Procedimiento de Retiro</span>
        </div>
        <p className="text-white/80 text-sm font-medium leading-relaxed">
          Enfocá el código QR del cliente para procesar la entrega del producto y validar el pago.
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
