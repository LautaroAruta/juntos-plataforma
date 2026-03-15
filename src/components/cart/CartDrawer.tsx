"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, X, Plus, Minus, PackageOpen, AlertCircle, ArrowRight, Info } from "lucide-react";
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

// Monto mínimo hipotético para la regla de negocio
const MIN_ORDER_AMOUNT = 15000;

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  // Evitar problemas de hidratación (Next.js SSR vs Zustand persist)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cálculos seguros
  const totalItems = isMounted ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;
  const subtotal = isMounted ? getTotalPrice() : 0;
  const isMinOrderMet = subtotal >= MIN_ORDER_AMOUNT;
  const progressToMinOrder = Math.min((subtotal / MIN_ORDER_AMOUNT) * 100, 100);

  const handleUpdateQuantity = (uniqueId: string, currentQty: number, maxStock: number, newQty: number) => {
    if (newQty > maxStock) {
      toast.error(`Solo quedan ${maxStock} unidades disponibles.`, {
        description: "No es posible añadir más de este producto."
      });
      return;
    }
    updateQuantity(uniqueId, newQty);
  };

  return (
    <Sheet>
      <SheetTrigger className="relative group inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 hover:bg-[#F2FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#009EE3] transition-colors" />
        {isMounted && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in">
            {totalItems}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b bg-white relative z-10 shadow-sm">
          <SheetTitle className="flex items-center gap-2 text-xl text-gray-800">
            <ShoppingCart className="w-5 h-5 text-[#009EE3]" />
            Tu Compra
          </SheetTitle>
        </SheetHeader>

        {!isMounted ? (
          // Skeleton/Loader de estado de hidratación
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
             <div className="w-8 h-8 rounded-full border-4 border-[#009EE3] border-t-transparent animate-spin"></div>
             <p className="text-sm text-gray-400 font-medium">Cargando tu carrito...</p>
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
            <ScrollArea className="flex-1 px-6 bg-slate-50/50">
              <div className="space-y-4 py-6">
                {items.map((item) => (
                  <div key={item.uniqueId} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#009EE3]/30 transition-colors group">
                    {/* Contenedor de Imagen con Overlay si hay poco stock */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <Image
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 96px) 100vw, 96px"
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                      />
                      {item.stock <= 5 && (
                         <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-[9px] font-bold text-center py-1 backdrop-blur-sm">
                           ¡Últimas {item.stock}!
                         </div>
                      )}
                    </div>
                    
                    {/* Contenedor de Información */}
                    <div className="flex flex-col flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div>
                           <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight pr-2">
                             {item.name}
                           </h4>
                           {item.variant && (
                              <p className="text-xs text-gray-500 mt-1">{item.variant}</p>
                           )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                             removeItem(item.uniqueId);
                             toast("Producto eliminado del carrito");
                          }}
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      
                      {/* Controles y Precio en la parte inferior */}
                      <div className="mt-auto flex items-end justify-between items-center gap-2">
                        <div className="flex items-center border border-gray-200 rounded-md h-8 w-fit bg-white overflow-hidden shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-gray-100 active:bg-gray-200"
                            onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity, item.stock, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 flex items-center justify-center text-sm font-bold text-gray-700 select-none">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-gray-100 active:bg-gray-200"
                            onClick={() => handleUpdateQuantity(item.uniqueId, item.quantity, item.stock, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col items-end">
                          <p className="font-black text-gray-900 text-[15px] whitespace-nowrap">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                              {formatCurrency(item.price)} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Lógica de Compra Mínima */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] relative z-20">
               {!isMinOrderMet && (
                  <div className="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-3">
                     <div className="flex items-center gap-2 mb-2 text-orange-800">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-semibold text-xs">Faltan {formatCurrency(MIN_ORDER_AMOUNT - subtotal)} para el mínimo</span>
                     </div>
                     <div className="w-full bg-orange-200/50 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressToMinOrder}%` }}></div>
                     </div>
                     <p className="text-[10px] text-orange-600/80 mt-1.5 font-medium">Mínimo mayorista: {formatCurrency(MIN_ORDER_AMOUNT)}</p>
                  </div>
               )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-700">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span className="flex items-center gap-1">Envío <Info className="w-3 h-3 text-gray-400" /></span>
                  <span className="font-medium text-green-600">Calculado en checkout</span>
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
