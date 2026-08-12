"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Shield,
  FileText,
  Send,
} from "lucide-react";

type KYCStatus = "pendiente" | "en_revision" | "aprobado" | "rechazado";

interface KYCData {
  estado_kyc: KYCStatus;
  kyc_notas: string | null;
  nombre_empresa: string;
  creado_en: string;
}

const STATUS_CONFIG = {
  pendiente: {
    icon: Clock,
    title: "Registro Recibido",
    subtitle: "Tu solicitud fue enviada correctamente",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    ring: "ring-amber-50/50",
    description:
      "Nuestro equipo revisará tu información en las próximas 24-72 horas hábiles. Te enviaremos un email cuando tu cuenta sea aprobada.",
  },
  en_revision: {
    icon: AlertCircle,
    title: "En Revisión",
    subtitle: "Estamos verificando tus datos",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    ring: "ring-blue-50/50",
    description:
      "Un miembro de nuestro equipo está revisando tu documentación. Este proceso suele tardar entre 1 y 3 días hábiles.",
  },
  aprobado: {
    icon: CheckCircle,
    title: "¡Aprobado!",
    subtitle: "Tu cuenta está lista para vender",
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
    ring: "ring-green-50/50",
    description: "Tu cuenta de proveedor ha sido verificada. Ya podés empezar a publicar productos en BANDHA.",
  },
  rechazado: {
    icon: XCircle,
    title: "Verificación Rechazada",
    subtitle: "Necesitamos información adicional",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
    ring: "ring-red-50/50",
    description:
      "Encontramos un problema con tu documentación. Revisá las notas a continuación y volvé a intentar.",
  },
};

const TIMELINE_STEPS = [
  { key: "pendiente", label: "Recibido", icon: Send },
  { key: "en_revision", label: "En Revisión", icon: FileText },
  { key: "aprobado", label: "Aprobado", icon: CheckCircle },
];

export default function EstadoVerificacion() {
  const { data: session } = useSession();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchKYCStatus();
    }
  }, [session]);

  async function fetchKYCStatus() {
    try {
      const res = await fetch("/api/provider/kyc-status");
      if (res.ok) {
        const data = await res.json();
        setKycData(data);
      }
    } catch (err) {
      console.error("Error fetching KYC status:", err);
    } finally {
      setLoading(false);
    }
  }

  const status: KYCStatus = kycData?.estado_kyc || "pendiente";
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  // Get active step index for timeline
  const getTimelineIndex = (s: KYCStatus) => {
    if (s === "pendiente") return 0;
    if (s === "en_revision") return 1;
    if (s === "aprobado") return 2;
    return 0; // rechazado shows all as incomplete
  };
  const activeIndex = status === "rechazado" ? -1 : getTimelineIndex(status);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#009EE3] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 px-4 pt-16 text-black">
      <div className="max-w-xl mx-auto space-y-12">
        {/* Main Status Card */}
        <div className="bg-white border-4 border-black p-12 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#FF5C00]" />
          
          <div
            className={`inline-flex items-center justify-center w-28 h-28 border-4 border-black mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${config.bg.replace('bg-', 'bg-').replace('amber-50', '[#FF5C00]').replace('blue-50', 'black').replace('green-50', '[#00A650]').replace('red-50', 'white')} ${config.color.includes('text-white') ? 'text-white' : 'text-black'}`}
          >
            <StatusIcon size={56} strokeWidth={3} />
          </div>

          <h1 className="text-4xl font-black text-black mb-4 tracking-tighter uppercase italic leading-none">{config.title}</h1>
          <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] mb-8">{config.subtitle}</p>
          <div className="bg-black/5 p-6 border-2 border-black/10">
            <p className="text-xs font-mono font-black text-black/60 leading-relaxed uppercase">{config.description}</p>
          </div>

          {kycData?.nombre_empresa && (
            <div className="mt-10 pt-10 border-t-2 border-dashed border-black/10 flex flex-col items-center">
              <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.5em] mb-2">ORG_IDENTIFIER</span>
              <p className="text-black font-black text-xl uppercase italic tracking-tighter">{kycData.nombre_empresa}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {status !== "rechazado" && (
          <div className="bg-white border-4 border-black p-10 shadow-[16px_16px_0px_0px_rgba(255,92,0,1)]">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-10 italic">
              VERIFICATION_PIPELINE // PROGRESS_LOG
            </h3>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((tStep, i) => {
                const isActive = i === activeIndex;
                const isCompleted = i < activeIndex;
                const TimeIcon = tStep.icon;
                const isLast = i === TIMELINE_STEPS.length - 1;

                return (
                  <div key={tStep.key} className="flex items-start gap-8">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-14 h-14 border-2 border-black flex items-center justify-center transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          isCompleted
                            ? "bg-[#00A650] text-white"
                            : isActive
                            ? "bg-[#FF5C00] text-black animate-pulse"
                            : "bg-white text-black/20"
                        }`}
                      >
                        <TimeIcon size={24} strokeWidth={3} />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-1 h-12 my-2 ${
                            isCompleted ? "bg-[#00A650]" : "bg-black/10"
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-4">
                      <p
                        className={`text-sm font-black uppercase tracking-widest italic ${
                          isActive ? "text-[#FF5C00]" : isCompleted ? "text-[#00A650]" : "text-black/20"
                        }`}
                      >
                        {tStep.label}
                      </p>
                      {isActive && <span className="text-[9px] font-black text-[#FF5C00]/60 uppercase tracking-widest">CURRENT_STAGE</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejection Notes */}
        {status === "rechazado" && kycData?.kyc_notas && (
          <div className="bg-black text-[#FF5C00] border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(239,68,68,1)]">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 italic">
              <AlertCircle size={20} strokeWidth={3} /> SYSTEM_REJECTION_REASON
            </h3>
            <p className="text-xs font-mono font-black uppercase leading-loose">{kycData.kyc_notas}</p>
          </div>
        )}

        {/* CTA */}
        <div className="grid grid-cols-1 gap-6">
          {status === "aprobado" ? (
            <Link
              href="/provider/dashboard"
              className="w-full bg-[#00A650] text-white border-4 border-black font-black py-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 uppercase tracking-widest italic text-xl"
            >
              ACCESS_DASHBOARD <ArrowRight size={28} strokeWidth={3} />
            </Link>
          ) : status === "rechazado" ? (
            <Link
              href="/auth/registro/proveedor"
              className="w-full bg-[#FF5C00] text-black border-4 border-black font-black py-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 uppercase tracking-widest italic text-xl"
            >
              RESUBMIT_PROTOCOL <ArrowRight size={28} strokeWidth={3} />
            </Link>
          ) : (
            <button
              onClick={fetchKYCStatus}
              className="w-full bg-black text-white border-4 border-black font-black py-6 shadow-[12px_12px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-4 uppercase tracking-widest italic"
            >
              <RefreshCw size={24} strokeWidth={3} className="animate-spin" /> REFRESH_STATUS
            </button>
          )}

          <Link
            href="/"
            className="w-full bg-white text-black/40 border-4 border-black/10 font-black py-5 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] italic"
          >
            TERMINATE_SESSION_RETURN_HOME
          </Link>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-3 text-black/20 text-[9px] font-black uppercase tracking-[0.5em] italic">
          <Shield size={14} strokeWidth={3} />
          SECURE_VERIFICATION_BY_BANDHA_OS
        </div>
      </div>
    </div>
  );
}
