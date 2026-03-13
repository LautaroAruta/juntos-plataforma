"use client";

import { useState } from "react";
import { Store, Mail, Phone, MapPin, Building2, Briefcase, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function ProviderRegister() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    nombre_contacto: "",
    email: "",
    telefono: "",
    cuit_rut: "",
    categoria: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const startMPOAuth = async () => {
    setLoading(true);
    try {
      // 0. Get current user
      const { data: { user } } = await (await import("@/lib/supabase/client")).createClient().auth.getUser();
      
      // 1. Create initial provider record
      const res = await fetch("/api/provider/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id // Pass current user ID
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 2. Redirect to MP with provider_id in state
      const state = btoa(JSON.stringify({ provider_id: data.provider_id }));
      window.location.href = `/api/provider/mp-connect?state=${state}`;
    } catch (err: any) {
      alert("Error: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-card rounded-[2rem] p-8 lg:p-12">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00A650] text-white flex items-center justify-center shadow-lg">
              <Store size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Registro de Proveedores</h1>
              <p className="text-slate-500 text-sm">Convertite en socio de BANDHA</p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#00A650]" : "bg-slate-100"}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#00A650]" : "bg-slate-100"}`} />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">Nombre de la Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="nombre_empresa"
                    required
                    value={formData.nombre_empresa}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650]"
                    placeholder="Mayorista Central S.A."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">Nombre de Contacto</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="nombre_contacto"
                    required
                    value={formData.nombre_contacto}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650]"
                    placeholder="Carlos Rodríguez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">Email Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650]"
                    placeholder="ventas@empresa.com"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full bg-[#00A650] hover:bg-[#009EE3] text-white font-black py-4 rounded-xl shadow-xl shadow-[#00A650]/20 transition-all flex items-center justify-center gap-2 group"
            >
              Siguiente Paso <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">CUIT / RUT</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    name="cuit_rut"
                    required
                    value={formData.cuit_rut}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650]"
                    placeholder="30-12345678-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650] appearance-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="tecnologia">Tecnología</option>
                  <option value="hogar">Hogar</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="moda">Moda</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 px-1">Descripción del Negocio</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#00A650]/20 focus:border-[#00A650]"
                  placeholder="Contanos qué productos ofrecés..."
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <h3 className="text-blue-800 font-bold text-sm mb-1 flex items-center gap-2">
                <img src="https://www.mercadopago.com/instore/merchant/bundle/mptools/assets/logo-mp.png" alt="MP" className="h-4" />
                Vincular cuenta de Mercado Pago
              </h3>
              <p className="text-blue-600 text-xs leading-relaxed">
                Para recibir tus pagos de forma automática y desglosada, necesitás vincular tu cuenta de Mercado Pago. BANDHA utiliza el sistema de split de pagos oficial.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all font-bold"
              >
                Volver
              </button>
              <button
                onClick={startMPOAuth}
                className="flex-[2] bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-4 rounded-xl shadow-xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2"
              >
                Vincular Mercado Pago y Finalizar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
