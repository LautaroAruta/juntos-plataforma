"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const PickupMap = dynamic(() => import("@/components/shared/PickupMap"), {
  loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />,
  ssr: false,
});

export default function PickupPointsPage() {
  const { data: session } = useSession();
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [geocoding, setGeocoding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: -34.6037,
    longitude: -58.3816,
    active: true,
    horarios: "",
    telefono_contacto: ""
  });

  useEffect(() => {
    fetchPoints();
  }, [session]);

  const fetchPoints = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/provider/pickup-points");
      const data = await res.json();
      if (res.ok) setPoints(data);
    } catch (err) {
      toast.error("Error al cargar puntos de retiro");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPoint(null);
    setFormData({
      name: "",
      address: "",
      latitude: -34.6037,
      longitude: -58.3816,
      active: true,
      horarios: "",
      telefono_contacto: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (point: any) => {
    setEditingPoint(point);
    setFormData({
      name: point.name,
      address: point.address,
      latitude: typeof point.latitude === 'string' ? parseFloat(point.latitude) : point.latitude,
      longitude: typeof point.longitude === 'string' ? parseFloat(point.longitude) : point.longitude,
      active: point.active,
      horarios: point.horarios || "",
      telefono_contacto: point.telefono_contacto || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingPoint 
        ? `/api/provider/pickup-points/${editingPoint.id}` 
        : "/api/provider/pickup-points";
      
      const res = await fetch(url, {
        method: editingPoint ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingPoint ? "Punto actualizado" : "Punto creado exitosamente");
        setIsModalOpen(false);
        fetchPoints();
      } else {
        const error = await res.json();
        toast.error(error.message || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setGeocoding(true);
    
    try {
      // Usamos Nominatim de OpenStreetMap para Reverse Geocoding gratuito
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'es'
        }
      });
      const data = await res.json();
      
      if (data && data.display_name) {
        // Limpiamos un poco la dirección (Nominatim suele ser muy largo)
        const parts = data.display_name.split(',');
        const simplified = parts.slice(0, 3).join(',').trim();
        setFormData(prev => ({ ...prev, address: simplified || data.display_name }));
      }
    } catch (error) {
      console.error("Error en geocoding:", error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este punto de retiro?")) return;
    
    try {
      const res = await fetch(`/api/provider/pickup-points/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Punto eliminado");
        fetchPoints();
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const toggleActive = async (point: any) => {
    try {
      const res = await fetch(`/api/provider/pickup-points/${point.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !point.active }),
      });
      if (res.ok) {
        toast.success(point.active ? "Punto desactivado" : "Punto activado");
        fetchPoints();
      }
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-black pb-10">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-[-0.05em] uppercase leading-none italic">
              LGT_OPERATIONS
            </h1>
            <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] pl-1">
              GESTIÓN DE NODOS Y PUNTOS DE RETIRO // v4.0.2
            </p>
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="group relative bg-[#FF5C00] text-black border-2 border-black px-10 py-5 font-black text-sm uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center gap-3"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" strokeWidth={3} /> 
            CREAR_NUEVO_NODO
          </button>
        </div>

        {/* Content */}
        <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-10 border-b-4 border-black bg-black flex items-center gap-6">
            <div className="w-16 h-16 bg-[#FF5C00] border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                <MapPin size={32} strokeWidth={3} />
            </div>
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">PUNTOS_REGISTRADOS</h2>
                <p className="text-[#FF5C00] font-black text-[9px] uppercase tracking-[0.3em]">ACTIVE_NODES: {points.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] border-b-2 border-black text-black/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="px-10 py-6">IDENT_UBICACION</th>
                  <th className="px-10 py-6">OPS_SCHEDULE / CMMS</th>
                  <th className="px-10 py-6">NODE_STATUS</th>
                  <th className="px-10 py-6 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/5">
                {loading ? (
                  <tr><td colSpan={4} className="px-10 py-32 text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-[#FF5C00] border-t-transparent mx-auto" />
                  </td></tr>
                ) : points.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center bg-[#F5F5F5]">
                      <div className="flex flex-col items-center gap-6">
                        <MapPin className="text-black/10" size={80} strokeWidth={1} />
                        <p className="text-black/30 font-black uppercase text-sm tracking-widest italic">ZERO_NODES_CONFIGURED</p>
                      </div>
                    </td>
                  </tr>
                ) : points.map((point) => (
                  <tr key={point.id} className="hover:bg-[#F5F5F5] transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-8">
                        <div className={`w-16 h-16 border-2 border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${point.active ? 'bg-black text-[#FF5C00]' : 'bg-[#F5F5F5] text-black/20'}`}>
                          <MapPin size={28} strokeWidth={3} />
                        </div>
                        <div className="space-y-2">
                          <div className="font-black text-black text-xl uppercase tracking-tighter leading-none italic">{point.name}</div>
                          <div className="text-[10px] font-mono text-black/40 uppercase tracking-widest line-clamp-1">
                            {point.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-3">
                        {point.horarios && (
                          <div className="flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-tight italic">
                            <Clock size={16} className="text-[#FF5C00]" strokeWidth={3} /> {point.horarios}
                          </div>
                        )}
                        {point.telefono_contacto && (
                          <div className="flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-tight italic">
                            <Phone size={16} className="text-[#FF5C00]" strokeWidth={3} /> {point.telefono_contacto}
                          </div>
                        )}
                        {!point.horarios && !point.telefono_contacto && (
                          <span className="text-black/20 text-[9px] font-black uppercase tracking-widest italic border-2 border-dashed border-black/10 px-3 py-1">UNSPECIFIED_DATA</span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button 
                        onClick={() => toggleActive(point)}
                        className={`inline-flex items-center gap-3 border-2 border-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${point.active ? 'bg-black text-white' : 'bg-white text-black opacity-40'}`}
                      >
                        <div className={`w-2 h-2 ${point.active ? 'bg-[#FF5C00] animate-pulse' : 'bg-black'}`} />
                        {point.active ? 'ONLINE_READY' : 'OFFLINE_HALT'}
                      </button>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => handleOpenEdit(point)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                          title="EDIT_PARAMS"
                        >
                          <Edit2 size={24} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => handleDelete(point.id)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-red-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                          title="DELETE_RECORD"
                        >
                          <Trash2 size={24} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal / Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !saving && setIsModalOpen(false)}
          />
          <div className="relative bg-white border-4 border-black w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-[32px_32px_0px_0px_rgba(255,92,0,1)] animate-in zoom-in-95 duration-300">
            <div className="p-10 md:p-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-black pb-12 mb-12">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black text-black uppercase tracking-tighter italic leading-none">
                    {editingPoint ? "EDIT_PARAMS" : "NEW_NODE"}
                  </h2>
                  <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] pl-1">LOGISTICS_CONFIGURATION_PANEL</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-16 h-16 bg-black text-white border-2 border-black flex items-center justify-center font-black text-2xl hover:bg-[#FF5C00] hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Column 1: Info */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic pl-1">DATA_NOMBRE_NODO</label>
                    <input 
                      required
                      type="text" 
                      placeholder="ENTRY_VALUE..."
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#F5F5F5] border-2 border-black focus:border-[#FF5C00] py-6 px-8 text-sm font-black uppercase tracking-widest italic transition-all outline-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic pl-1">DATA_DIRECCION_COORD</label>
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        placeholder="MAP_PROTOCOL_ENTRY..."
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className={`w-full bg-[#F5F5F5] border-2 border-black focus:border-[#FF5C00] py-6 px-8 text-sm font-black uppercase tracking-widest italic transition-all outline-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 ${geocoding ? 'pr-20' : ''}`}
                      />
                      {geocoding && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <Loader2 size={24} className="animate-spin text-[#FF5C00]" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic pl-1">DATA_SCHEDULE</label>
                      <input 
                        type="text" 
                        placeholder="WINDOW_TIME..."
                        value={formData.horarios}
                        onChange={e => setFormData({...formData, horarios: e.target.value})}
                        className="w-full bg-[#F5F5F5] border-2 border-black focus:border-[#FF5C00] py-5 px-6 text-[10px] font-black uppercase tracking-widest italic transition-all outline-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic pl-1">DATA_COMMS</label>
                      <input 
                        type="text" 
                        placeholder="PHONE_PROTO..."
                        value={formData.telefono_contacto}
                        onChange={e => setFormData({...formData, telefono_contacto: e.target.value})}
                        className="w-full bg-[#F5F5F5] border-2 border-black focus:border-[#FF5C00] py-5 px-6 text-[10px] font-black uppercase tracking-widest italic transition-all outline-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1"
                      />
                    </div>
                  </div>

                  <div className="p-8 bg-black border-2 border-black text-[#FF5C00] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,92,0,0.1),transparent)]" />
                    <div className="flex items-start gap-6 relative z-10">
                        <AlertCircle size={32} strokeWidth={3} className="shrink-0" />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-loose italic">
                          MARCÁ LA UBICACIÓN EXACTA DEL NODO EN LA GRLLA GEOGRÁFICA PARA SINCRONIZAR EL MAPA DE RETIRO DEL USUARIO.
                        </p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Map Picker */}
                <div className="space-y-8">
                   <div className="h-[400px] md:h-[500px] w-full bg-[#F5F5F5] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
                      <PickupMap 
                        isPicker={true}
                        center={[formData.latitude, formData.longitude]}
                        onLocationSelect={handleLocationSelect}
                        points={[{
                          id: 'preview',
                          name: formData.name || 'ENTRY_NODO',
                          address: formData.address,
                          latitude: formData.latitude,
                          longitude: formData.longitude
                        }]}
                      />
                   </div>
                   <div className="flex items-center justify-between px-2">
                      <div className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic">
                        GEOLOC_COORD: <span className="text-[#FF5C00]">{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</span>
                      </div>
                   </div>
                </div>

                {/* Footer buttons */}
                <div className="lg:col-span-2 flex flex-col md:flex-row gap-8 pt-12 border-t-4 border-black mt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#FF5C00] text-black border-2 border-black font-black py-6 uppercase tracking-widest italic text-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-6"
                  >
                    {saving ? <Loader2 className="animate-spin" size={32} strokeWidth={3} /> : (
                      <>
                        <CheckCircle2 size={32} strokeWidth={3} />
                        {editingPoint ? "APPLY_CONFIG_CHANGES" : "INITIALIZE_NODO_PROTOCOL"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                    className="px-16 py-6 bg-black text-white border-2 border-black font-black uppercase tracking-widest text-sm hover:bg-[#FF5C00] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    ABORT_X
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
