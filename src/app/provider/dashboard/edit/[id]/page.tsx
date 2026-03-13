"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Package, 
  Tag, 
  DollarSign, 
  Hash, 
  FileText,
  X,
  Loader2,
  Trash2,
  Save,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import imageCompression from 'browser-image-compression';
import { toast } from "sonner";

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<{file?: File, url: string, existing?: boolean}[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio_individual: "",
    precio_grupal_minimo: "",
    stock: "",
    categoria: "tecnologia",
    activo: true
  });

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error("Producto no encontrado");
        router.push("/provider/dashboard");
        return;
      }

      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        precio_individual: data.precio_individual.toString(),
        precio_grupal_minimo: data.precio_grupal_minimo.toString(),
        stock: data.stock.toString(),
        categoria: data.categoria || "tecnologia",
        activo: data.activo
      });

      if (data.imagenes) {
        setImages(data.imagenes.map((url: string) => ({ url, existing: true })));
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const previewUrl = URL.createObjectURL(compressedFile);
        setImages([...images, { file: compressedFile, url: previewUrl, existing: false }]);
      } catch (error) {
        console.error("Compression error:", error);
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    if (!newImages[index].existing) {
        URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append("nombre", formData.nombre);
      payload.append("descripcion", formData.descripcion);
      payload.append("precio_individual", formData.precio_individual);
      payload.append("precio_grupal_minimo", formData.precio_grupal_minimo);
      payload.append("stock", formData.stock);
      payload.append("categoria", formData.categoria);
      payload.append("activo", formData.activo.toString());

      const existingUrls = images.filter(img => img.existing).map(img => img.url);
      payload.append("existing_images", JSON.stringify(existingUrls));

      images.forEach((img) => {
        if (img.file) {
          payload.append("images", img.file);
        }
      });

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el producto.");
      }

      toast.success("Producto actualizado correctamente");
      router.push("/provider/dashboard");
      router.refresh();

    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#009EE3]" size={48} />
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      <Link 
        href="/provider/dashboard"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al Panel
      </Link>

      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#009EE3] flex items-center justify-center shadow-inner">
          <Package size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Editar Producto</h1>
          <p className="text-slate-500">Actualizá los datos de tu producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 space-y-6 border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Nombre del Producto</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#009EE3]/10 focus:border-[#009EE3] transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Descripción</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  name="descripcion"
                  rows={4}
                  required
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#009EE3]/10 focus:border-[#009EE3] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Categoría</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm font-medium focus:ring-4 focus:ring-[#009EE3]/10 focus:border-[#009EE3] transition-all"
              >
                <option value="tecnologia">Tecnología</option>
                <option value="hogar">Hogar</option>
                <option value="alimentos">Alimentos</option>
                <option value="moda">Moda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Stock</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  name="stock"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#009EE3]/10 focus:border-[#009EE3] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
                type="checkbox" 
                name="activo" 
                id="activo"
                checked={formData.activo}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300 text-[#009EE3] focus:ring-[#009EE3]"
            />
            <label htmlFor="activo" className="text-sm font-bold text-slate-700">Producto Visible (Activo)</label>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 space-y-6 border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
            <DollarSign className="text-green-500" size={20} /> Precios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Precio Individual (PVP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  name="precio_individual"
                  required
                  step="0.01"
                  value={formData.precio_individual}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-10 pr-4 text-sm font-black focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#009EE3] uppercase tracking-widest mb-3 px-1">Precio Grupal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#009EE3] font-bold">$</span>
                <input
                  type="number"
                  name="precio_grupal_minimo"
                  required
                  step="0.01"
                  value={formData.precio_grupal_minimo}
                  onChange={handleChange}
                  className="w-full bg-[#FFF8E7] border border-[#009EE3]/20 rounded-2xl py-4 pl-10 pr-4 text-sm font-black focus:ring-4 focus:ring-[#009EE3]/10 focus:border-[#009EE3] transition-all text-[#00A650]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 space-y-6 border border-slate-100 shadow-xl shadow-slate-200/50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-2">
            <ImageIcon className="text-purple-500" size={20} /> Imágenes
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-lg">
                <img src={img.url} className="w-full h-full object-cover" alt={`Prev ${index}`} />
                <button 
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {images.length < 8 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-[#009EE3] transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#FFF8E7] group-hover:text-[#009EE3] transition-colors">
                  <Upload size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-[#009EE3]">Subir Foto</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Máximo 8 imágenes por producto</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={24} /> Guardando...
            </>
          ) : (
            <>
              <Save size={24} /> Guardar Cambios
            </>
          )}
        </button>
      </form>
    </div>
  );
}
