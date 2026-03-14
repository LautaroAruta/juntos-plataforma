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

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1); // E6 note

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleScan = async (data: string) => {
    setScanning(false);
    setLoading(true);
    
<<<<<<< HEAD
    // Format expected: BANDHA-ORDER-[PAYMENT_ID]
    const orderId = data.replace("BANDHA-ORDER-", "");

=======
    playSuccessSound();
    triggerHaptic();
    
>>>>>>> origin/main
    try {
      // Decode the premium format: JUNTOS|{paymentId}|{timestamp}
      // Or fallback to the old format for compatibility if needed
      let paymentId = data;
      if (data.includes("|")) {
          const decoded = atob(data);
          const parts = decoded.split("|");
          if (parts[0] === "JUNTOS") {
            paymentId = parts[1];
          }
      } else {
        paymentId = data.replace("JUNTOS-ORDER-", "");
      }

      // 1. Fetch order details with product info
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          users (nombre, apellido),
          group_deals (
            precio_actual,
            products (nombre, imagen_principal)
          )
        `)
        .eq('id', paymentId)
        .single();

      if (fetchError || !orderData) {
        setResult({ success: false, message: "Pedido no encontrado." });
        return;
      }

      if (orderData.estado === 'entregado') {
        setResult({ success: false, message: "Este pedido ya fue entregado.", order: orderData });
        return;
      }

      // 2. Update order in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          estado: 'entregado', 
          qr_escaneado: true, 
          qr_escaneado_en: new Date().toISOString() 
        })
        .eq('id', paymentId);

      if (updateError) {
        setResult({ success: false, message: "Error al registrar la entrega." });
        return;
      }

      // 3. Process Gamification Rewards (Atomic User + Neighborhood updates)
      await supabase.rpc('process_delivery_rewards', { 
        target_user_id: orderData.user_id,
        saved_amount: 1500, // Estimated saving
        zone: 'Caballito/Almagro'
      });

      setResult({ 
          success: true, 
          message: "¡Entrega Exitosa!", 
          order: orderData 
      });
    } catch (err) {
      setResult({ success: false, message: "Formato de código inválido." });
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#009EE3] rounded-3xl">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#009EE3] rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#009EE3] rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#009EE3] rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#009EE3] rounded-br-xl"></div>
              {/* Scanline Animation */}
              <div className="w-full h-1.5 bg-[#009EE3]/50 absolute top-0 left-0 rounded-full animate-scan"></div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-8 text-center text-white">
            {loading ? (
              <Loader2 className="animate-spin text-[#009EE3]" size={64} />
            ) : result?.success ? (
              <>
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20 relative">
                  <CheckCircle2 size={56} />
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                </div>
                
                <h2 className="text-2xl font-black mb-1 tracking-tight">{result.message}</h2>
                <p className="text-slate-400 text-xs mb-6 font-bold uppercase tracking-widest">Validado por JUNTOS</p>
                
                {result.order && (
                  <div className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-4 mb-8 flex items-center gap-4 text-left border border-white/10">
                    <img 
                      src={result.order.group_deals?.products?.imagen_principal || "/placeholder-product.jpg"} 
                      alt="Producto"
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#00AEEF] uppercase tracking-widest mb-0.5">Producto Entregado</p>
                      <h4 className="font-bold text-sm line-clamp-1">{result.order.group_deals?.products?.nombre}</h4>
                      <p className="text-sm font-black text-white mt-0.5">${result.order.group_deals?.precio_actual?.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <button 
                  onClick={resetScanner}
                  className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all font-black text-sm uppercase tracking-widest"
                >
                  Siguiente Cliente
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
                  className="w-full bg-[#009EE3] text-white font-bold py-4 rounded-2xl hover:bg-[#00A650] transition-all font-black text-sm uppercase tracking-widest"
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
