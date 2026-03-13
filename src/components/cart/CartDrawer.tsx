"use client";

import { ShoppingCart, Trash2, X, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
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

export function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger className="relative group inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 hover:bg-[#F2FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-[#009EE3] transition-colors" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {totalItems}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl text-gray-800">
            <ShoppingCart className="w-5 h-5 text-[#009EE3]" />
            Tu Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <ShoppingCart className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Tu carrito está vacío</h3>
            <p className="text-gray-500 text-sm max-w-[250px]">
              Agrega productos a tu carrito para comenzar a comprar en BANDHA.
            </p>
            <SheetTrigger className="mt-4 bg-[#009EE3] hover:bg-[#00A650] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Explorar Ofertas
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 py-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border">
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-tight">
                          {item.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 -mt-1 -mr-2"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div className="flex items-center border rounded-md h-8 w-fit bg-gray-50">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-gray-200"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium text-gray-700">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-gray-200"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-[#009EE3]">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] text-gray-500">
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
            
            <div className="p-6 bg-gray-50 border-t">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                {/* 
                  Aquí podrías añadir cálculos lógicos como:
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>Descuento aplicado</span>
                    <span>- $1.000</span>
                  </div>
                */}
                <Separator />
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>Total</span>
                  <span className="text-[#009EE3]">{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
              
              <SheetFooter>
                <SheetTrigger className="w-full">
                  <Link href="/checkout" className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white h-12 text-base font-bold flex items-center justify-center rounded-md transition-colors">
                    Ir a Pagar
                  </Link>
                </SheetTrigger>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
