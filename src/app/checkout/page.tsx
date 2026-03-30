"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, ShieldCheck, ChevronLeft, Truck, PackageCheck, Loader2 } from "lucide-react";

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
  address: z.string().min(5, { message: "La dirección es muy corta" }),
  city: z.string().min(3, { message: "Ingresá tu ciudad" }),
  zipCode: z.string().min(4, { message: "Código postal requerido" }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 50000 ? 0 : 3500; // Envío gratis sobre 50k
  const total = subtotal + shippingCost;

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      zipCode: "",
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    setIsProcessing(true);
    
    try {
      // 1. Crear la preferencia de pago en nuestro backend
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          metadata: {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            address: `${values.address}, ${values.city}`,
            zipCode: values.zipCode,
            deal_id: items[0]?.id, // Suponiendo que el primer item es el deal
          }
        }),
      });

      if (!response.ok) throw new Error("Error al crear la preferencia");

      const data = await response.json();
      
      // 2. Redirigir al usuario al Checkout Pro de Mercado Pago
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <PackageCheck className="w-16 h-16 text-bandha-text-muted mb-4" />
        <h2 className="text-2xl font-bold text-bandha-text mb-2">Tu carrito está vacío</h2>
        <p className="text-bandha-text-secondary mb-6">No tenés productos para realizar el pago.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-bandha-primary hover:bg-bandha-secondary text-white transition-colors">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bandha-bg min-h-screen pb-12">
      {/* Checkout Minimal Header */}
      <header className="bg-bandha-surface border-b border-bandha-border py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center text-bandha-text-secondary hover:text-bandha-primary transition-colors font-medium text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" /> Volver
        </Link>
        <div className="text-xl font-black text-bandha-primary tracking-tighter">BANDHA</div>
        <div className="flex items-center text-bandha-secondary !text-xs font-semibold gap-1">
          <ShieldCheck className="w-4 h-4" /> Pago Seguro
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Columna Izquierda: Formulario */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-bandha-surface rounded-xl shadow-sm border border-bandha-border p-6 sm:p-8">
              <h2 className="text-xl font-bold text-bandha-text mb-6 flex items-center gap-2">
                <Truck className="text-bandha-primary w-5 h-5" />
                Datos de Envío
              </h2>
              
              <Form {...form}>
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Juan Pérez" className="bg-gray-50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Para recibir tu recibo" className="bg-gray-50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Teléfono</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Ej: 11 1234 5678" className="bg-gray-50 focus:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t border-bandha-border mt-6 mb-4">
                    <h3 className="text-sm font-bold text-bandha-text mb-4">Dirección de Entrega</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Calle y Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Av. Corrientes 1234, Piso 5A" className="bg-gray-50 focus:bg-white" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Ciudad</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: CABA" className="bg-gray-50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">CP</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 1043" className="bg-gray-50 focus:bg-white" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </form>
              </Form>
            </div>

            {/* Metodo de Pago Mock */}
            <div className="bg-bandha-surface rounded-xl shadow-sm border border-bandha-border p-6 sm:p-8">
               <h2 className="text-xl font-bold text-bandha-text mb-6 flex items-center gap-2">
                <CreditCard className="text-bandha-primary w-5 h-5" />
                Método de Pago
              </h2>
              
              <div className="border border-bandha-primary bg-bandha-primary/5 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-bandha-primary"></div>
                  <div>
                    <p className="font-bold text-bandha-text">Mercado Pago</p>
                    <p className="text-xs text-bandha-text-muted">Tarjetas, efectivo o dinero en cuenta</p>
                  </div>
                </div>
                <div className="bg-white px-2 py-1 rounded shadow-sm text-[10px] font-black italic text-blue-500 border">
                  mercado<span className="text-blue-900">pago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de Compra */}
          <div className="lg:w-1/3">
            <div className="bg-bandha-surface rounded-xl shadow-sm border border-bandha-border p-6 sticky top-24">
              <h3 className="font-bold text-lg text-bandha-text mb-4 pb-4 border-b border-bandha-border">Resumen de tu Orden</h3>
              
              <ScrollArea className="h-[250px] pr-4 mb-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded border bg-gray-50 flex-shrink-0 overflow-hidden">
                        <Image src={item.image || "/images/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <p className="text-sm font-medium text-bandha-text line-clamp-2 leading-tight">{item.name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-bandha-text-muted">Cant: {item.quantity}</span>
                          <span className="text-sm font-bold text-bandha-primary">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-bandha-text-secondary text-sm">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-bandha-text-secondary text-sm">
                  <span>Costo de Envío</span>
                  <span className={shippingCost === 0 ? "text-bandha-secondary font-medium" : ""}>
                    {shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}
                  </span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-bandha-text text-lg">Total a Pagar</span>
                  <span className="font-black text-2xl text-bandha-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[#009EE3] hover:bg-blue-600 text-white h-14 text-lg font-bold shadow-md transition-all active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Pagar con Mercado Pago"
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
                      // Get first item deal logic (since it's a simple cart for now)
                      const dealId = items[0]?.id; // Ensure this is a deal UUID
                      const res = await fetch('/api/payments/test-pay', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          dealId: dealId,
                          userId: null, // Anonymous for test
                          amount: total,
                          providerId: items[0]?.providerId // Should be in the item
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
                  className="w-full mt-4 py-3 border-2 border-dashed border-amber-200 text-amber-600 bg-amber-50 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                >
                  ⚡️ Simular Pago Éxito (Modo Test)
                </button>
              )}
              <p className="text-center text-xs text-gray-400 mt-4 px-2">
                Al hacer clic en &quot;Pagar&quot;, serás redirigido a la plataforma segura de Mercado Pago.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
