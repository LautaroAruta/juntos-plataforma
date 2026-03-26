"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Banknote, 
  Bell, 
  Globe, 
  Clock, 
  Moon, 
  Sun,
  Camera,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  History,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCUIT, validateCUIT } from "@/lib/validators";

// --- Subcomponents ---

interface SectionProps {
  id: string;
  title: string;
  icon: any;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ id, title, icon: Icon, active, onClick }: SectionProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
      active 
        ? "bg-violet-600 text-white shadow-lg shadow-violet-200" 
        : "text-slate-500 hover:bg-violet-50 hover:text-violet-600"
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`text-sm font-bold ${active ? "" : "hidden lg:block"}`}>{title}</span>
  </button>
);

const InputField = ({ label, placeholder, type = "text", value, onChange, icon: Icon, error, success, mono }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-slate-50 border ${
          error ? "border-red-300 ring-2 ring-red-100" : success ? "border-green-400 ring-2 ring-green-50" : "border-slate-100"
        } rounded-2xl py-3.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all font-medium text-slate-700 placeholder:text-slate-300 ${
          mono ? "font-mono" : ""
        }`}
      />
      {success && !error && (
        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in zoom-in duration-300" size={18} strokeWidth={2.5} />
      )}
    </div>
    {error && (
      <p className="text-red-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

const Toggle = ({ active, onToggle, label, description }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div>
      <p className="text-sm font-bold text-slate-700">{label}</p>
      {description && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{description}</p>}
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${active ? "bg-violet-600" : "bg-slate-200"}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? "left-7" : "left-1"}`} />
    </button>
  </div>
);

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("personales");
  const [saving, setSaving] = useState(false);
  const isProvider = session?.user?.rol === "proveedor";

  const fullName = session?.user?.name || "";
  const nameParts = fullName.trim().split(/\s+/);
  const initialFirstName = nameParts[0] || "";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const [formData, setFormData] = useState({
    nombre: initialFirstName,
    apellido: initialLastName,
    email: session?.user?.email || "",
    telefono: "",
    nacimiento: "",
    direccion: "",
    // Provider specific
    empresa: "",
    rubro: "",
    descripcion: "",
    cuit: "",
    banco: "",
    cbu: "",
    // Notifications
    notifEmail: true,
    notifPush: true,
    notifSms: false,
    // Prefs
    idioma: "es",
    moneda: "ARS",
    tema: "light"
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user) {
      const fName = session.user.name?.trim().split(/\s+/)[0] || "";
      const lName = session.user.name?.trim().split(/\s+/).slice(1).join(" ") || "";
      
      setFormData(prev => ({
        ...prev,
        nombre: prev.nombre || fName,
        apellido: prev.apellido || lName,
        email: prev.email || session.user.email || "",
      }));
    }
  }, [session]);

  const updateField = (field: string, val: any) => {
    if (field === "cuit") {
      const formatted = formatCUIT(val);
      setFormData(prev => ({ ...prev, [field]: formatted }));
      
      const raw = formatted.replace(/-/g, "");
      if (raw.length === 11) {
        const result = validateCUIT(raw);
        if (!result.valid) {
          setFieldErrors(prev => ({ ...prev, cuit: result.message }));
        } else {
          setFieldErrors(prev => {
            const next = { ...prev };
            delete next.cuit;
            return next;
          });
        }
      } else {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.cuit;
          return next;
        });
      }
      return;
    }
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert("¡Cambios guardados con éxito!");
    }, 1500);
  };

  // Define sections based on role
  const sections = [
    { id: "personales", title: "Datos Personales", icon: User },
    { id: "contacto", title: "Contacto", icon: Mail },
    { id: "seguridad", title: "Seguridad", icon: ShieldCheck },
    ...(isProvider 
      ? [
          { id: "negocio", title: "Datos del Negocio", icon: Building2 },
          { id: "facturacion", title: "Facturación", icon: Banknote },
        ]
      : [
          { id: "direcciones", title: "Mis Direcciones", icon: MapPin },
          { id: "pagos", title: "Métodos de Pago", icon: CreditCard },
          { id: "pedidos", title: "Historial", icon: History },
        ]
    ),
    { id: "notificaciones", title: "Notificaciones", icon: Bell },
    { id: "preferencias", title: "Preferencias", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            Configuración <span className="text-violet-600">de Perfil</span>
          </h1>
          <p className="text-slate-400 font-medium">Gestioná tu cuenta, seguridad y preferencias.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              {sections.map(s => (
                <SidebarItem 
                  key={s.id} 
                  {...s} 
                  active={activeTab === s.id} 
                  onClick={() => setActiveTab(s.id)} 
                />
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-50 min-h-[600px]">
             
             <AnimatePresence mode="wait">
                {activeTab === "personales" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col items-center gap-4 mb-8">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-violet-100 flex items-center justify-center text-violet-600 overflow-hidden border-4 border-white shadow-xl">
                           {session?.user?.image ? (
                             <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <User size={48} strokeWidth={2.5} />
                           )}
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-violet-600 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform">
                          <Camera size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Foto de perfil editable</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField 
                        label="Nombre" 
                        placeholder="Tu nombre" 
                        value={formData.nombre} 
                        onChange={(v: any) => updateField("nombre", v)} 
                        icon={User}
                      />
                      <InputField 
                        label="Apellido" 
                        placeholder="Tu apellido" 
                        value={formData.apellido} 
                        onChange={(v: any) => updateField("apellido", v)} 
                        icon={User}
                      />
                      <InputField 
                        label="Fecha de Nacimiento" 
                        placeholder="DD/MM/AAAA" 
                        type="date"
                        value={formData.nacimiento} 
                        onChange={(v: any) => updateField("nacimiento", v)} 
                        icon={Clock}
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === "contacto" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <InputField 
                        label="Email" 
                        placeholder="usuario@ejemplo.com" 
                        value={formData.email} 
                        onChange={(v: any) => updateField("email", v)} 
                        icon={Mail}
                      />
                      <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                        * Podés vincular un correo distinto a tu cuenta de Google si lo preferís.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <InputField 
                        label="Teléfono / WhatsApp" 
                        placeholder="+54 9 11 1234-5678" 
                        value={formData.telefono} 
                        onChange={(v: any) => updateField("telefono", v)} 
                        icon={Phone}
                      />
                      <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                        * Usaremos este número para coordinar entregas y avisos importantes.
                      </p>
                    </div>

                    <InputField 
                      label="Dirección" 
                      placeholder="Calle 123, CABA" 
                      value={formData.direccion} 
                      onChange={(v: any) => updateField("direccion", v)} 
                      icon={MapPin}
                    />
                  </motion.div>
                )}

                {activeTab === "seguridad" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-6"
                  >
                    <div className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4">
                      <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Cambiar Contraseña</h3>
                      <InputField label="Contraseña Actual" type="password" icon={Lock} />
                      <InputField label="Nueva Contraseña" type="password" icon={Lock} />
                    </div>
                    
                    <Toggle 
                      label="Autenticación en dos pasos (2FA)" 
                      description="Protegé tu cuenta con un nivel extra de seguridad"
                      active={true}
                      onToggle={() => {}}
                    />

                    {!isProvider && (
                      <div className="p-6 rounded-3xl border border-slate-100 space-y-4">
                         <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Sesiones Activas</h3>
                         <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                           <span>Chrome en Windows - Buenos Aires, AR</span>
                           <span className="text-violet-600">Actual</span>
                         </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "negocio" && isProvider && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-6"
                  >
                    <InputField 
                      label="Nombre de la Empresa" 
                      value={formData.empresa} 
                      onChange={(v: any) => updateField("empresa", v)} 
                      icon={Building2}
                    />
                    <InputField 
                      label="Rubro / Categoría" 
                      value={formData.rubro} 
                      onChange={(v: any) => updateField("rubro", v)} 
                      icon={Briefcase}
                    />
                    <div className="space-y-2">
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Breve</label>
                       <textarea 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all font-medium text-slate-700 h-32 resize-none"
                        placeholder="Contanos sobre tu negocio..."
                        value={formData.descripcion}
                        onChange={(e) => updateField("descripcion", e.target.value)}
                       />
                    </div>
                  </motion.div>
                )}

                {activeTab === "facturacion" && isProvider && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-6"
                  >
                    <InputField 
                      label="CUIT" 
                      icon={Banknote} 
                      value={formData.cuit} 
                      onChange={(v: any) => updateField("cuit", v)} 
                      mono
                      error={fieldErrors.cuit}
                      success={formData.cuit.replace(/-/g, "").length === 11 && !fieldErrors.cuit}
                    />
                    <div className="p-6 bg-violet-50 rounded-3xl border border-violet-100 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-violet-900 uppercase tracking-tight">Cuenta de Cobro Verificada</p>
                        <p className="text-xs text-violet-700 font-medium mt-1">Tu cuenta bancaria está vinculada correctamente para recibir los pagos grupales.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "direcciones" && !isProvider && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Direcciones Guardadas</p>
                      <button className="text-[10px] font-black bg-violet-600 text-white px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform">
                        <Plus size={12} strokeWidth={3} /> Agregar
                      </button>
                    </div>
                    {[
                      { type: "Casa", addr: "Av. Corrientes 1234, CABA" },
                      { type: "Trabajo", addr: "Parque Patricios 456, CABA" }
                    ].map((d, i) => (
                      <div key={i} className="group p-5 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-violet-600 transition-colors">
                            <MapPin size={22} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 uppercase tracking-tighter text-sm">{d.type}</p>
                            <p className="text-xs text-slate-500 font-medium">{d.addr}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-300 hover:text-slate-600"><Edit2 size={16} /></button>
                          <button className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "notificaciones" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-4"
                  >
                    <Toggle 
                      label="Notificaciones por Email" 
                      description="Alertas de pedidos y seguridad"
                      active={formData.notifEmail}
                      onToggle={() => updateField("notifEmail", !formData.notifEmail)}
                    />
                    <Toggle 
                      label="Notificaciones Push" 
                      description="Estado de tus grupos en tiempo real"
                      active={formData.notifPush}
                      onToggle={() => updateField("notifPush", !formData.notifPush)}
                    />
                    <Toggle 
                      label="Alertas vía SMS" 
                      description="Solo para promociones exclusivas"
                      active={formData.notifSms}
                      onToggle={() => updateField("notifSms", !formData.notifSms)}
                    />
                  </motion.div>
                )}

                {activeTab === "preferencias" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Idioma</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold appearance-none outline-none focus:border-violet-500">
                             <option>Español (Ar)</option>
                             <option>English</option>
                             <option>Português</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Moneda</label>
                          <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold appearance-none outline-none focus:border-violet-500">
                             <option>Pesos Argentinos (ARS)</option>
                             <option>Dólares (USD)</option>
                          </select>
                       </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600">
                           {formData.tema === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800">Tema Visual</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{formData.tema === 'dark' ? 'Oscuro' : 'Claro'}</p>
                         </div>
                       </div>
                       <button 
                        onClick={() => updateField("tema", formData.tema === 'dark' ? 'light' : 'dark')}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                       >
                         Cambiar
                       </button>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

          </div>
        </div>

        {/* Fixed Save Button Container */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 md:p-6 z-[60]">
          <div className="max-w-6xl mx-auto flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-[280px] bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-violet-200 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-tight active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} strokeWidth={2.5} />
              ) : (
                <>
                  <Save size={20} strokeWidth={2.5} />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
