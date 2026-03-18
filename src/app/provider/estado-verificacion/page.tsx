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
    <div className="min-h-screen bg-[#FFF8E7] pb-24 px-4 pt-12">
      <div className="max-w-md mx-auto space-y-6">
        {/* Main Status Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${config.bg} ${config.color} mb-6 border-4 ${config.border} ring-8 ${config.ring}`}
          >
            <StatusIcon size={48} />
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight uppercase">{config.title}</h1>
          <p className="text-slate-400 font-bold text-sm mb-4">{config.subtitle}</p>
          <p className="text-slate-500 text-sm leading-relaxed">{config.description}</p>

          {kycData?.nombre_empresa && (
            <div className="mt-6 bg-slate-50 rounded-2xl px-5 py-3 inline-block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</span>
              <p className="text-slate-800 font-bold text-sm">{kycData.nombre_empresa}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {status !== "rechazado" && (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Progreso de Verificación
            </h3>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((tStep, i) => {
                const isActive = i === activeIndex;
                const isCompleted = i < activeIndex;
                const TimeIcon = tStep.icon;
                const isLast = i === TIMELINE_STEPS.length - 1;

                return (
                  <div key={tStep.key} className="flex items-start gap-4">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-[#00A650] text-white"
                            : isActive
                            ? "bg-[#009EE3] text-white shadow-lg shadow-[#009EE3]/30"
                            : "bg-slate-100 text-slate-300"
                        }`}
                      >
                        <TimeIcon size={18} strokeWidth={2.5} />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-8 rounded-full my-1 ${
                            isCompleted ? "bg-[#00A650]" : "bg-slate-100"
                          }`}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div className="pt-2">
                      <p
                        className={`text-sm font-bold ${
                          isActive ? "text-[#009EE3]" : isCompleted ? "text-[#00A650]" : "text-slate-300"
                        }`}
                      >
                        {tStep.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejection Notes */}
        {status === "rechazado" && kycData?.kyc_notas && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <h3 className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertCircle size={16} /> Motivo del Rechazo
            </h3>
            <p className="text-red-600 text-sm leading-relaxed">{kycData.kyc_notas}</p>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3">
          {status === "aprobado" ? (
            <Link
              href="/provider/dashboard"
              className="w-full bg-[#00A650] hover:bg-[#009EE3] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#00A650]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
            >
              Ir a mi Panel <ArrowRight size={20} />
            </Link>
          ) : status === "rechazado" ? (
            <Link
              href="/auth/registro/proveedor"
              className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
            >
              Corregir y Reenviar <ArrowRight size={20} />
            </Link>
          ) : (
            <button
              onClick={fetchKYCStatus}
              className="w-full bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm"
            >
              <RefreshCw size={18} /> Actualizar Estado
            </button>
          )}

          <Link
            href="/"
            className="w-full bg-white text-slate-400 font-bold py-4 rounded-[2rem] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            Volver al Inicio
          </Link>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
          <Shield size={12} strokeWidth={2.5} />
          Verificación segura por BANDHA
        </div>
      </div>
    </div>
  );
}
