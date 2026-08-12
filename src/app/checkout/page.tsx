"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, ShieldCheck, ChevronLeft, MapPin, PackageCheck, Loader2, Gift, Check, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

const checkoutSchema = z.object({
  fullName: z.string().min(3, { message: "Ingresá tu nombre completo" }),
  email: z.string().email({ message: "Ingresá un correo electrónico válido" }),
  phone: z.string().min(8, { message: "Ingresá un teléfono válido" }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (data) setWalletBalance(data.wallet_balance || 0);
        });
    }
  }, [session?.user?.id]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getTotalPrice();
  const walletDiscount = useWallet ? Math.min(walletBalance, subtotal) : 0;
  const shippingCost = 0; 
  const total = subtotal - walletDiscount;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          rewardsUsed: walletDiscount,
          metadata: {
            phone: values.phone,
            address: `Punto de Retiro Comunidad`,
            deal_id: items[0]?.id, 
            is_group_deal: items[0]?.isGroupDeal ?? true,
            product_id: items[0]?.productId || items[0]?.id,
            product_name: items[0]?.name,
            provider_id: items[0]?.providerId
          }
        }),
      });

      if (!response.ok) throw new Error("Error al crear la preferencia");

      const data = await response.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("No se recibió el punto de inicio de pago");
      }
      
    } catch (error) {
      console.error("Error processing payment", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <PackageCheck className="w-16 h-16 text-gray-400/30 mb-8" />
        <h2 className="text-3xl font-black font-serif text-black mb-4">Tu bolsa está vacía</h2>
        <p className="text-slate-500 font-medium mb-12 max-w-xs">Explorá nuestras curadurías y seleccioná tus productos favoritos.</p>
        <Link href="/" className="bg-black text-white hover:bg-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] px-10 rounded-2xl h-14 flex items-center justify-center text-xs">
          Volver a la Galería
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFBFA] min-h-screen pb-24">
      {/* Checkout Minimal Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-6 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center text-black hover:text-gray-400 transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver
        </Link>
        <div className="text-xl font-black font-serif text-black tracking-tight">BANDHA<span className="text-gray-400 underline decoration-1 underline-offset-4 ml-1">PAY</span></div>
        <div className="hidden md:flex items-center text-slate-400 font-bold uppercase text-[9px] gap-2 tracking-[0.3em]">
          <ShieldCheck className="w-4 h-4 text-gray-400" /> 
          Pago Encriptado
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Columna Izquierda: Formulario */}
          <div className="lg:w-2/3 space-y-12">
            <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 sm:p-14 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <h2 className="text-2xl font-black font-serif text-black tracking-tighter flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm">
                    <MapPin size={22} />
                  </div>
                  Información de Retiro
                </h2>
              </div>
              
              <div className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100 relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <PackageCheck size={16} className="text-gray-400" />
                  <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Punto Comunidad</p>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Esta es una compra grupal con beneficio logístico. El retiro se coordina en puntos estratégicos de <span className="text-black font-bold">CABA</span> (Palermo, Recoleta, Belgrano) al completarse el lote.
                </p>
              </div>
              
              <Form {...form}>
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="EJ: MARTINA SOLER" className="bg-gray-50/50 border-gray-100 focus:border-gray-400 focus:ring-4 focus:ring-gray-400/5 h-14 rounded-xl font-bold text-xs transition-all uppercase" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-red-500 uppercase" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="EJ: HOLA@BOUTIQUE.COM" className="bg-gray-50/50 border-gray-100 focus:border-gray-400 focus:ring-4 focus:ring-gray-400/5 h-14 rounded-xl font-bold text-xs transition-all uppercase" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold text-red-500 uppercase" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teléfono de Contacto</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+54 9 11 ..." className="bg-gray-50/50 border-gray-100 focus:border-gray-400 focus:ring-4 focus:ring-gray-400/5 h-14 rounded-xl font-bold text-xs transition-all" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-red-500 uppercase" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-8 border-t border-gray-100 mt-12">
                    <div className="flex items-center gap-3 mb-2">
                      <Info size={14} className="text-gray-400" />
                      <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Verificación de Identidad</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
                      Presentar DNI al momento del retiro para validar la titularidad de la orden.
                    </p>
                  </div>
                </form>
              </Form>
            </div>

            <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 sm:p-14 mb-20 relative overflow-hidden">
               <h2 className="text-2xl font-black font-serif text-black tracking-tighter mb-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm">
                  <CreditCard size={22} />
                </div>
                Método de Pago
              </h2>
              
              <div className="bg-white border-2 border-gray-400 p-8 rounded-2xl flex items-center justify-between shadow-xl shadow-gray-400/5 group transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center p-1">
                    <div className="w-full h-full bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-black text-xs text-black uppercase tracking-widest">Mercado Pago</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mt-1">Tarjetas de crédito, débito y dinero en cuenta</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                  <span className="text-[10px] font-black italic text-blue-500">mercado</span>
                  <span className="text-[10px] font-black italic text-blue-900">pago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-10 sticky top-32 shadow-2xl shadow-black/5">
              <h3 className="font-serif font-black text-xl text-black mb-8 pb-4 border-b border-gray-100 tracking-tight">Tu Orden</h3>
              
              <ScrollArea className="h-[250px] pr-4 mb-8">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-20 h-20 rounded-2xl border border-gray-100 bg-gray-50 flex-shrink-0 overflow-hidden shadow-sm">
                        <Image src={item.image || "/images/placeholder.jpg"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
                        <p className="text-[11px] font-bold text-black uppercase tracking-tighter leading-tight mb-2 truncate">{item.name}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Cant: {item.quantity}</span>
                          <span className="text-xs font-black text-gray-400">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="space-y-4 mb-10 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {walletDiscount > 0 && (
                  <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Descuento Wallet</span>
                    <span>-{formatCurrency(walletDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Envío</span>
                  <span className="text-gray-400 font-bold">Bonificado</span>
                </div>
                
                <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-black tracking-widest">Total</span>
                  <span className="text-4xl font-black text-black tracking-tighter tabular-nums leading-none font-serif">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* WALLET TOGGLE */}
              {walletBalance > 0 && (
                <div className={`mb-10 p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${useWallet ? 'bg-gray-400/5 border-gray-400/30' : 'bg-gray-50 border-gray-100 hover:border-slate-200'}`}
                     onClick={() => setUseWallet(!useWallet)}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${useWallet ? 'bg-gray-400 text-white' : 'bg-white text-slate-300'}`}>
                      <Gift size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-black uppercase tracking-tight">Usar mi Saldo</span>
                      <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{formatCurrency(walletBalance)} disponibles</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useWallet ? 'bg-gray-400 border-gray-400' : 'border-gray-200'}`}>
                    {useWallet && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                </div>
              )}

              {/* LEGAL COMPLIANCE */}
              <div className="mb-10 space-y-6">
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">Arrepentimiento</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase leading-relaxed tracking-wider">
                      Ley 24.240: Tenés 10 días para revocar tu compra si no estás satisfecho.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-2">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="terms-acceptance"
                      required
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-200 checked:bg-black transition-all"
                    />
                    <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" strokeWidth={4} />
                  </div>
                  <label htmlFor="terms-acceptance" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer leading-tight">
                    Acepto los <Link href="/terminos" className="text-black underline underline-offset-2">Términos</Link> y la <Link href="/privacidad" className="text-black underline underline-offset-2">Privacidad</Link>.
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-black text-white hover:bg-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.15)] h-20 text-xs tracking-[0.2em] rounded-2xl shadow-2xl shadow-black/10"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Finalizar Compra"
                )}
              </Button>

              {/* TEST BYPASS BUTTON */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isProcessing) return;
                    setIsProcessing(true);
                    try {
                      const dealId = items[0]?.id; 
                      const res = await fetch('/api/payments/test-pay', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          dealId: dealId,
                          userId: null, 
                          amount: total,
                          providerId: items[0]?.providerId
                        })
                      });
                      if (res.ok) {
                        clearCart();
                        router.push("/checkout/success?payment_id=test_" + Date.now());
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="w-full mt-8 py-5 border border-dashed border-gray-200 text-slate-300 bg-transparent text-[9px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 hover:text-black transition-all rounded-2xl"
                >
                  Simular Pago Exitoso (Dev)
                </button>
              )}
              <p className="text-center text-[10px] text-slate-300 font-medium mt-8 leading-relaxed">
                Toda la transacción se encuentra protegida por cifrado de extremo a extremo.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
