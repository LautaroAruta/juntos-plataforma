"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, X, Plus, Minus, PackageOpen, AlertCircle, ArrowRight, Info, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Monto mínimo hipotético para la regla de negocio
const MIN_ORDER_AMOUNT = 15000;

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice, verifyItems } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Evitar problemas de hidratación (Next.js SSR vs Zustand persist)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Verificar ítems al montar o cuando cambian los ítems significativamente
  useEffect(() => {
    if (isMounted && items.length > 0) {
      const runVerification = async () => {
        setIsVerifying(true);
        const { changed, messages } = await verifyItems();
        if (changed) {
          messages.forEach(msg => toast.info(msg, { duration: 5000 }));
        }
        setIsVerifying(false);
      };
      
      // Corremos una verificación suave al abrir (podríamos dispararlo en el Sheet open)
      runVerification();
    }
  }, [isMounted, items.length, verifyItems]);

  // Cálculos seguros
  const totalItems = isMounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const subtotal = isMounted ? getTotalPrice() : 0;
  const isMinOrderMet = subtotal >= MIN_ORDER_AMOUNT;
  const progressToMinOrder = Math.min((subtotal / MIN_ORDER_AMOUNT) * 100, 100);

  const handleUpdateQuantity = async (uniqueId: string, currentQty: number, maxStock: number, newQty: number) => {
    if (newQty > maxStock) {
      toast.error(`Solo quedan ${maxStock} unidades disponibles.`, {
        description: "No es posible añadir más de este producto."
      });
      return;
    }
    updateQuantity(uniqueId, newQty);
    
    // Verificación rápida tras cambio manual
    const { changed, messages } = await verifyItems();
    if (changed) {
       messages.forEach(msg => toast.info(msg));
    }
  };

  return (
    <Sheet>
      <SheetTrigger className="relative group inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 hover:bg-[#F2FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#009EE3] transition-colors" />
        {isMounted && totalItems > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={totalItems}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm"
          >
            {totalItems}
          </motion.span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-0">
        <SheetHeader className="p-6 pb-4 border-b bg-white/80 backdrop-blur-xl sticky top-0 z-30 transition-all">
          <SheetTitle className="flex items-center justify-between gap-3 text-2xl font-black text-gray-900 tracking-tight">
            <div className="flex items-center gap-3">
              <div className="bg-[#009EE3]/10 p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-[#009EE3]" />
              </div>
              Tu Carrito
            </div>
            
            {isVerifying && (
              <Badge variant="secondary" className="bg-blue-50 text-[#009EE3] border-blue-100 flex items-center gap-1.5 animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[10px] uppercase tracking-wider font-black">Sincronizando</span>
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {!isMounted ? (
          // Skeleton Loader Premium
          <div className="flex-1 flex flex-col p-6 space-y-6 bg-slate-50/30">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Skeleton className="w-24 h-24 rounded-xl" />
                <div className="flex-1 space-y-3 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex justify-between items-end mt-auto">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          // Empty State persuasivo
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5 bg-gray-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-2 relative">
              <PackageOpen className="w-10 h-10 text-gray-300 relative z-10" />
              <div className="absolute inset-0 bg-[#009EE3]/5 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800 mb-1">Tu carrito está vacío</h3>
              <p className="text-gray-500 text-sm max-w-[280px] mx-auto">
                Las mejores ofertas grupales y mayoristas te están esperando.
              </p>
            </div>
            <SheetTrigger>
               <Button className="mt-4 bg-[#009EE3] hover:bg-[#009EE3]/90 text-white px-8 py-6 rounded-xl font-bold transition-all shadow-md shadow-[#009EE3]/20 hover:shadow-lg w-full max-w-[250px] group">
                  Ver oportunidades <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
               </Button>
            </SheetTrigger>
          </div>
        ) : (
          // Listado de Ítems
          <>
            <ScrollArea className="flex-1 px-6 bg-slate-50/30">
              <div className="space-y-4 py-6">
                <AnimatePresence mode="popLayout" initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.uniqueId}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -10 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30 
                      }}
                      className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-[#009EE3]/30 hover:shadow-md transition-all group overflow-hidden relative"
                    >
                      {/* Contenedor de Imagen con Overlay si hay poco stock */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50 group-hover:scale-105 transition-transform duration-500">
                        <Image
                          src={item.image || "/placeholder.svg"} 
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 96px) 100vw, 96px"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                        />
                        {item.stock <= 5 && (
                           <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-br-lg shadow-sm">
                             ¡STOCK CRÍTICO!
                           </div>
                        )}
                      </div>
                      
                      {/* Contenedor de Información */}
                      <div className="flex flex-col flex-1 min-w-0 py-0.5">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <div>
                             <h4 className="font-bold text-gray-800 line-clamp-2 text-sm leading-tight pr-4">
                               {item.name}
                             </h4>
                             {item.variant && (
                                <p className="text-[10px] text-[#009EE3] font-bold uppercase tracking-widest mt-1.5 bg-[#009EE3]/5 px-2 py-0.5 rounded-full w-fit">
                                  {item.variant}
                                </p>
                             )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 -mr-1 -mt-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                            onClick={() => {
                               removeItem(item.uniqueId);
                               toast.success("Producto removido");
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Controles y Precio en la parte inferior */}
                        <div className="mt-auto flex items-end justify-between gap-3">
                          <div className="flex items-center bg-gray-50/80 rounded-xl p-1 border border-gray-100 shadow-inner">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-white hover:text-[#009EE3] hover:shadow-sm"
                              onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity, item.stock, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>
                            <span className="w-7 text-center text-xs font-black text-gray-700">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-white hover:text-[#009EE3] hover:shadow-sm"
                              onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity, item.stock, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <p className="font-black text-gray-900 text-base leading-none">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-[10px] text-gray-400 font-medium mt-1">
                                {formatCurrency(item.price)} c/u
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
            
            {/* Resumen Final con Glassmorphism */}
            <div className="px-6 py-6 bg-white/90 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)] relative z-20">
               {!isMinOrderMet && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 bg-orange-50/50 border border-orange-100 rounded-2xl p-4 backdrop-blur-sm"
                  >
                     <div className="flex items-center gap-3 mb-3 text-orange-800">
                        <div className="bg-orange-100 p-1.5 rounded-lg">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="font-bold text-sm tracking-tight">Faltan {formatCurrency(MIN_ORDER_AMOUNT - subtotal)} para habilitar el retiro</span>
                     </div>
                     <div className="w-full bg-orange-200/30 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressToMinOrder}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                        ></motion.div>
                     </div>
                     <p className="text-[11px] text-orange-600 font-bold mt-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                       <Info size={12} /> Compra Mínima: {formatCurrency(MIN_ORDER_AMOUNT)}
                     </p>
                  </motion.div>
               )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span className="flex items-center gap-1">Punto de Retiro <Info className="w-3 h-3 text-gray-400" /></span>
                  <span className="font-medium text-green-600">Local del Proveedor</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-black text-gray-900 text-xl items-end">
                  <span>Total</span>
                  <span className="text-[#009EE3]">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              
              <SheetFooter>
                {isMinOrderMet ? (
                  <SheetTrigger>
                    <Link href="/checkout" className="w-full bg-gradient-to-r from-[#009EE3] to-[#00A650] hover:shadow-lg hover:shadow-[#00A650]/20 text-white h-14 text-lg font-black flex items-center justify-center rounded-xl transition-all">
                      Iniciar Pago Seguro
                    </Link>
                  </SheetTrigger>
                ) : (
                  <Button disabled className="w-full bg-gray-100 text-gray-400 h-14 text-base font-bold flex items-center justify-center rounded-xl border border-gray-200">
                    Alcanza el mínimo para pagar
                  </Button>
                )}
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
