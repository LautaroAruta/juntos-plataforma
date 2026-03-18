"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  Tag,
  ChevronLeft,
  Loader2,
  Clock,
  Briefcase,
  Search,
  MapPin,
  Map as MapIcon,
  Navigation,
  Info,
  Hash,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Shield,
  Store,
  UserCircle,
  Package
} from "lucide-react";
import dynamic from "next/dynamic";

const PickupMap = dynamic(() => import("@/components/shared/PickupMap"), { ssr: false });

import { FormStepper } from "@/components/providers/FormStepper";
import { FormTooltip } from "@/components/providers/FormTooltip";
import {
  validateCUIT,
  formatCUIT,
  validateCBU,
  formatCBU,
  validatePhoneAR,
  PROVINCIAS_AR,
  CATEGORIES,
} from "@/lib/validators";

const TOTAL_STEPS = 5;

// ─── INPUT HELPER ─────────────────────────────────────────
interface InputFieldProps {
  label: string;
  name: string;
  icon: any;
  placeholder: string;
  tooltip?: string;
  type?: string;
  mono?: boolean;
  value: string;
  onChange: (val: string) => void;
  fieldErrors: Record<string, string>;
}

const InputField = ({
  label,
  name,
  icon: Icon,
  placeholder,
  tooltip,
  type = "text",
  mono = false,
  value,
  onChange,
  fieldErrors,
}: InputFieldProps) => (
  <div>
    <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
      {label}
      {tooltip && <FormTooltip text={tooltip} />}
    </label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={2.5} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border ${
          fieldErrors[name] ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
        } rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#009EE3]/5 focus:border-[#009EE3] transition-all ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
    {fieldErrors[name] && (
      <p className="text-red-500 text-[11px] font-bold mt-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
        ⚠️ {fieldErrors[name]}
      </p>
    )}
  </div>
);

export default function RegisterProveedor() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    tipoCuenta: "" as "persona_fisica" | "empresa" | "",
    nombreEmpresa: "",
    razonSocial: "",
    nombreContacto: session?.user?.name || "",
    email: session?.user?.email || "",
    telefono: "",
    cuit: "",
    categoria: "",
    descripcion: "",
    domicilioFiscal: "",
    direccion: "",
    provincia: "",
    localidad: "",
    calle: "",
    altura: "",
    codigo_postal: "",
    codigoPostal: "",
    cbuCvu: "",
    titularCuenta: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        nombreContacto: prev.nombreContacto || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Sync CP fields
      if (field === "codigo_postal") newData.codigoPostal = value;
      if (field === "codigoPostal") newData.codigo_postal = value;
      return newData;
    });
    // Limpiar error del campo al editar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddressSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocoding/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Address search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (result: any) => {
    const { address } = result;
    const data = {
      ...formData,
      direccion: result.display_name,
      provincia: address?.state || address?.province || "",
      localidad: address?.city || address?.town || address?.village || address?.suburb || "",
      calle: address?.road || "",
      altura: address?.house_number || "",
      codigo_postal: address?.postcode || "",
      codigoPostal: address?.postcode || "",
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };
    setFormData(data);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  // ─── Validación por paso ─────────────────────────────────
  const validateStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};

    switch (stepNum) {
      case 1:
        if (!formData.tipoCuenta) errors.tipoCuenta = "Seleccioná un tipo de cuenta";
        break;

      case 2:
        if (!formData.nombreEmpresa.trim()) errors.nombreEmpresa = "Ingresá el nombre de tu empresa";
        if (formData.tipoCuenta === "empresa" && !formData.razonSocial.trim())
          errors.razonSocial = "La razón social es obligatoria para empresas";
        if (!formData.nombreContacto.trim()) errors.nombreContacto = "Ingresá tu nombre";
        if (!formData.categoria) errors.categoria = "Seleccioná una categoría";
        break;

      case 3: {
        if (!formData.cuit.trim()) {
          errors.cuit = "El CUIT es obligatorio";
        } else {
          const cuitResult = validateCUIT(formData.cuit);
          if (!cuitResult.valid) errors.cuit = cuitResult.message;
        }
        if (!formData.telefono.trim()) {
          errors.telefono = "El teléfono es obligatorio";
        } else {
          const phoneResult = validatePhoneAR(formData.telefono);
          if (!phoneResult.valid) errors.telefono = phoneResult.message;
        }
        if (!formData.domicilioFiscal.trim()) errors.domicilioFiscal = "El domicilio fiscal es obligatorio";
        if (!formData.provincia.trim()) errors.provincia = "La provincia es obligatoria";
        if (!formData.localidad.trim()) errors.localidad = "La localidad es obligatoria";
        if (!formData.calle.trim()) errors.calle = "La calle es obligatoria";
        if (!formData.altura.trim()) errors.altura = "El número es obligatorio";
        if (!formData.codigoPostal.trim() && !formData.codigo_postal.trim()) {
          errors.codigoPostal = "El código postal es obligatorio";
          errors.codigo_postal = "El código postal es obligatorio";
        }
        break;
      }

      case 4: {
        if (!formData.cbuCvu.trim()) {
          errors.cbuCvu = "El CBU/CVU es obligatorio";
        } else {
          const cbuClean = formData.cbuCvu.replace(/\s/g, "");
          if (cbuClean.length === 22) {
            const cbuResult = validateCBU(cbuClean);
            if (!cbuResult.valid) errors.cbuCvu = cbuResult.message;
          } else if (cbuClean.length !== 22) {
            errors.cbuCvu = "El CBU debe tener 22 dígitos";
          }
        }
        if (!formData.titularCuenta.trim()) errors.titularCuenta = "El titular es obligatorio";
        break;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError("");
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return; // Validar hasta el paso actual

    setLoading(true);
    setError("");

    try {
      const endpoint = "/api/provider/onboarding";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      if (session) {
        await update({ rol: "proveedor" });
      }

      router.push("/provider/estado-verificacion");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] pb-24 px-4 pt-8">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <Link
          href="/elegir-rol"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            Registro Proveedor
          </h1>
          <p className="text-slate-500 font-medium">Impulsá tu negocio con BANDHA.</p>
        </div>

        {/* Stepper */}
        <FormStepper currentStep={step} totalSteps={TOTAL_STEPS} />

        {/* ─── STEP 1: Tipo de Cuenta ───────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">¿Qué tipo de cuenta tenés?</h2>
              <p className="text-slate-400 text-sm mb-8">
                Esto nos ayuda a configurar tu perfil fiscal correctamente.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  onClick={() => updateField("tipoCuenta", "persona_fisica")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                    formData.tipoCuenta === "persona_fisica"
                      ? "border-[#009EE3] bg-[#009EE3]/5 shadow-lg shadow-[#009EE3]/10"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        formData.tipoCuenta === "persona_fisica"
                          ? "bg-[#009EE3] text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      }`}
                    >
                      <UserCircle size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg tracking-tight">Persona Física</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Monotributista o autónomo. Usás tu DNI y CUIT personal.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("tipoCuenta", "empresa")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all group ${
                    formData.tipoCuenta === "empresa"
                      ? "border-[#009EE3] bg-[#009EE3]/5 shadow-lg shadow-[#009EE3]/10"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        formData.tipoCuenta === "empresa"
                          ? "bg-[#009EE3] text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                      }`}
                    >
                      <Store size={28} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg tracking-tight">Empresa</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        SA, SRL, SAS u otra razón social. Requiere CUIT de empresa y datos del representante legal.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {fieldErrors.tipoCuenta && (
                <p className="text-red-500 text-[11px] font-bold mt-4 px-1 animate-in fade-in duration-200">
                  ⚠️ {fieldErrors.tipoCuenta}
                </p>
              )}
            </div>

            <button
              onClick={nextStep}
              className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 text-base uppercase tracking-tight active:scale-95"
            >
              Siguiente <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Datos del Negocio ────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-5">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Datos del Negocio</h2>

              <InputField
                label="Nombre Comercial"
                name="nombreEmpresa"
                icon={Building2}
                placeholder="Ej: Mi Tienda Online"
                tooltip="El nombre con el que tus clientes te conocen"
                value={formData.nombreEmpresa}
                onChange={(v) => updateField("nombreEmpresa", v)}
                fieldErrors={fieldErrors}
              />

              {formData.tipoCuenta === "empresa" && (
                <InputField
                  label="Razón Social"
                  name="razonSocial"
                  icon={Briefcase}
                  placeholder="Ej: Juntos S.A."
                  tooltip="Nombre legal de la empresa tal como figura en AFIP"
                  value={formData.razonSocial}
                  onChange={(v) => updateField("razonSocial", v)}
                  fieldErrors={fieldErrors}
                />
              )}

              <InputField
                label="Nombre del Responsable"
                name="nombreContacto"
                icon={User}
                placeholder="Nombre y Apellido"
                tooltip="Persona de contacto principal para la cuenta"
                value={formData.nombreContacto}
                onChange={(v) => updateField("nombreContacto", v)}
                fieldErrors={fieldErrors}
              />

              <div>
                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Categoría Principal
                  <FormTooltip text="Elegí la categoría que mejor representa tus productos" />
                </label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} strokeWidth={2.5} />
                  <select
                    value={formData.categoria}
                    onChange={(e) => updateField("categoria", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#009EE3]/5 focus:border-[#009EE3] transition-all appearance-none"
                  >
                    <option value="">Seleccionar categoría...</option>
                    <option value="alimentos">Alimentos y Bebidas</option>
                    <option value="hogar">Hogar y Bazar</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="mascotas">Mascotas</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                  Descripción del Negocio
                  <FormTooltip text="Contanos qué vendés para que podamos destacar tu perfil" />
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-4 text-slate-300" size={18} strokeWidth={2.5} />
                  <textarea
                    placeholder="Contanos brevemente qué vendés..."
                    value={formData.descripcion}
                    onChange={(e) => updateField("descripcion", e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#009EE3]/5 focus:border-[#009EE3] transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-tight active:scale-95"
              >
                Siguiente <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Datos Fiscales ───────────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-5">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Datos Fiscales</h2>

              <InputField
                label="CUIT"
                name="cuit"
                icon={FileText}
                placeholder="XX-XXXXXXXX-X"
                tooltip="Tu Clave Única de Identificación Tributaria. Necesario para facturación electrónica y cumplimiento fiscal."
                mono
                value={formData.cuit}
                onChange={(v) => updateField("cuit", formatCUIT(v))}
                fieldErrors={fieldErrors}
              />

              <InputField
                label="Teléfono de Contacto"
                name="telefono"
                icon={Phone}
                placeholder="+54 9 11 1234-5678"
                tooltip="Tu teléfono celular. Lo usaremos para contactarte sobre tus ventas."
                mono
                value={formData.telefono}
                onChange={(v) => updateField("telefono", v)}
                fieldErrors={fieldErrors}
              />

              <InputField
                label="Domicilio Fiscal"
                name="domicilioFiscal"
                icon={MapPin}
                placeholder="Av. Corrientes 1234, Piso 3"
                tooltip="La dirección que figura en tu constancia de inscripción en AFIP."
                value={formData.domicilioFiscal}
                onChange={(v) => updateField("domicilioFiscal", v)}
                fieldErrors={fieldErrors}
              />

              <div className="pt-4 pb-2">
                <div className="flex items-center gap-4 mb-6 px-1">
                  <div className="w-10 h-10 rounded-xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">Ubicación para Entregas</h2>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Donde los clientes retiran</p>
                  </div>
                </div>

                <div className="relative group mb-6">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Buscador Rápido</label>
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:text-[#009EE3] transition-colors" size={20} strokeWidth={2.5} />
                    <input
                      type="text"
                      placeholder="Busca tu calle, ciudad o pueblo..."
                      value={searchQuery}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-8 focus:ring-[#009EE3]/5 focus:border-[#009EE3] focus:bg-white transition-all placeholder:text-slate-300"
                    />
                    {isSearching && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-[#009EE3]" size={20} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectAddress(result)}
                          className="w-full p-5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all flex items-start gap-4 group/item"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover/item:bg-[#009EE3]/10 group-hover/item:text-[#009EE3] transition-all">
                            <MapPin size={16} strokeWidth={2.5} />
                          </div>
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight leading-relaxed group-hover/item:text-slate-800">{result.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Provincia</label>
                    <input
                      type="text"
                      value={formData.provincia}
                      onChange={(e) => updateField("provincia", e.target.value)}
                      placeholder="Ej: Buenos Aires"
                      className={`w-full bg-slate-50 border ${
                        fieldErrors.provincia ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
                      } rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-[#009EE3] focus:bg-white transition-all placeholder:text-slate-200`}
                    />
                    {fieldErrors.provincia && (
                      <p className="text-red-500 text-[9px] font-bold mt-1 px-1">⚠️ {fieldErrors.provincia}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Localidad</label>
                    <input
                      type="text"
                      value={formData.localidad}
                      onChange={(e) => updateField("localidad", e.target.value)}
                      placeholder="Ej: CABA"
                      className={`w-full bg-slate-50 border ${
                        fieldErrors.localidad ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
                      } rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-[#009EE3] focus:bg-white transition-all placeholder:text-slate-200`}
                    />
                    {fieldErrors.localidad && (
                      <p className="text-red-500 text-[9px] font-bold mt-1 px-1">⚠️ {fieldErrors.localidad}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Calle</label>
                    <input
                      type="text"
                      value={formData.calle}
                      onChange={(e) => updateField("calle", e.target.value)}
                      placeholder="Nombre de calle"
                      className={`w-full bg-slate-50 border ${
                        fieldErrors.calle ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
                      } rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-[#009EE3] focus:bg-white transition-all placeholder:text-slate-200`}
                    />
                    {fieldErrors.calle && (
                      <p className="text-red-500 text-[9px] font-bold mt-1 px-1">⚠️ {fieldErrors.calle}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Número</label>
                    <input
                      type="text"
                      value={formData.altura}
                      onChange={(e) => updateField("altura", e.target.value)}
                      placeholder="1234"
                      className={`w-full bg-slate-50 border ${
                        fieldErrors.altura ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
                      } rounded-xl py-3 px-4 text-xs font-black focus:outline-none focus:border-[#009EE3] focus:bg-white transition-all font-mono placeholder:text-slate-200 tabular-nums`}
                    />
                    {fieldErrors.altura && (
                      <p className="text-red-500 text-[9px] font-bold mt-1 px-1">⚠️ {fieldErrors.altura}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => updateField("codigo_postal", e.target.value)}
                    placeholder="Ej: C1425"
                    className={`w-full bg-slate-50 border ${
                      fieldErrors.codigoPostal || fieldErrors.codigo_postal ? "border-red-300 ring-2 ring-red-100" : "border-slate-100"
                    } rounded-xl py-3 px-4 text-xs font-black focus:outline-none focus:border-[#009EE3] focus:bg-white transition-all font-mono placeholder:text-slate-200 tabular-nums uppercase`}
                  />
                  {(fieldErrors.codigoPostal || fieldErrors.codigo_postal) && (
                    <p className="text-red-500 text-[9px] font-bold mt-1 px-1">⚠️ {fieldErrors.codigoPostal || fieldErrors.codigo_postal}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Navigation size={12} strokeWidth={2.5} className="text-[#009EE3]" /> Marcá tu local exacto
                    </label>
                  </div>
                  <div className="h-[250px] rounded-[2rem] overflow-hidden border-2 border-slate-50 shadow-inner relative">
                    <PickupMap 
                      points={[]} 
                      isPicker={true}
                      center={formData.latitude !== null && formData.longitude !== null 
                        ? [formData.latitude, formData.longitude] 
                        : [-34.6037, -58.3816]
                      }
                      onLocationSelect={handleLocationSelect}
                      showSearch={false}
                    />
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                    <Info size={14} strokeWidth={2.5} className="text-slate-300" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                      Arrastrá el marcador o hacé click para precisión.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <Shield className="text-blue-500 shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
              <div>
                <p className="text-blue-800 font-bold text-xs">Tus datos están protegidos</p>
                <p className="text-blue-600 text-[11px] mt-0.5 leading-relaxed">
                  Usamos cifrado de extremo a extremo. Tu información fiscal solo se comparte con AFIP según lo requiera la ley.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-tight active:scale-95"
              >
                Siguiente <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Datos Bancarios ──────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-5">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Datos Bancarios</h2>
              <p className="text-slate-400 text-sm -mt-1">
                Para poder transferirte el dinero de tus ventas.
              </p>

              <InputField
                label="CBU / CVU"
                name="cbuCvu"
                icon={Landmark}
                placeholder="0000 0000 0000 0000 0000 00"
                tooltip="Tu Clave Bancaria Uniforme (22 dígitos). Lo encontrás en tu homebanking o billetera virtual."
                mono
                value={formData.cbuCvu}
                onChange={(v) => updateField("cbuCvu", formatCBU(v))}
                fieldErrors={fieldErrors}
              />

              <InputField
                label="Titular de la Cuenta"
                name="titularCuenta"
                icon={User}
                placeholder="Nombre tal como aparece en el banco"
                tooltip="Debe coincidir con el titular de la cuenta bancaria asociada al CBU/CVU."
                value={formData.titularCuenta}
                onChange={(v) => updateField("titularCuenta", v)}
                fieldErrors={fieldErrors}
              />
            </div>

            {/* Security badges */}
            <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-2xl p-4">
              <Landmark className="text-green-500 shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
              <div>
                <p className="text-green-800 font-bold text-xs">Pagos seguros con Mercado Pago</p>
                <p className="text-green-600 text-[11px] mt-0.5 leading-relaxed">
                  BANDHA utiliza el sistema de split de pagos oficial de Mercado Pago. Tus cobros se acreditan automáticamente.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 uppercase tracking-tight active:scale-95"
              >
                Revisar Datos <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 5: Resumen y Confirmación ───────────── */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 space-y-6">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Revisá tus datos</h2>

              {/* Summary sections */}
              <SummarySection
                title="Tipo de Cuenta"
                items={[
                  {
                    label: "Tipo",
                    value: formData.tipoCuenta === "persona_fisica" ? "Persona Física" : "Empresa",
                  },
                ]}
              />

              <SummarySection
                title="Datos del Negocio"
                items={[
                  { label: "Nombre Comercial", value: formData.nombreEmpresa },
                  ...(formData.razonSocial ? [{ label: "Razón Social", value: formData.razonSocial }] : []),
                  { label: "Responsable", value: formData.nombreContacto },
                  { label: "Categoría", value: formData.categoria },
                  ...(formData.descripcion ? [{ label: "Descripción", value: formData.descripcion }] : []),
                ]}
              />

              <SummarySection
                title="Datos Fiscales"
                items={[
                  { label: "CUIT", value: formData.cuit },
                  { label: "Teléfono", value: formData.telefono },
                  { label: "Domicilio", value: formData.domicilioFiscal },
                  { label: "Provincia", value: formData.provincia },
                  { label: "Localidad", value: formData.localidad },
                  { label: "Código Postal", value: formData.codigo_postal || formData.codigoPostal },
                ]}
              />

              <SummarySection
                title="Datos Bancarios"
                items={[
                  { label: "CBU/CVU", value: formData.cbuCvu },
                  { label: "Titular", value: formData.titularCuenta },
                ]}
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <Info className="text-amber-500 shrink-0 mt-0.5" size={18} strokeWidth={2.5} />
              <p className="text-amber-700 text-[11px] leading-relaxed">
                Al confirmar, aceptás los{" "}
                <Link href="/terminos-y-condiciones" className="underline font-bold">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" className="underline font-bold">
                  Política de Privacidad
                </Link>{" "}
                de BANDHA. Tu información será verificada por nuestro equipo.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-shake">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                disabled={loading}
                className="flex-1 bg-slate-100 text-slate-600 font-black py-5 rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm disabled:opacity-50"
              >
                <ArrowLeft size={18} /> Volver
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-[#00A650] hover:bg-[#009EE3] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#00A650]/20 transition-all flex items-center justify-center gap-3 text-base uppercase tracking-tight active:scale-95 disabled:grayscale"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>Confirmar y Registrar</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SUMMARY SECTION COMPONENT ──────────────────────────────
function SummarySection({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="border border-slate-100 rounded-2xl p-5">
      <h3 className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-baseline">
            <span className="text-slate-400 text-xs font-medium">{item.label}</span>
            <span className="text-slate-800 text-sm font-bold text-right max-w-[60%] truncate">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
