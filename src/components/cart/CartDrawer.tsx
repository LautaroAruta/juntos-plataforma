"use client";

import { ShoppingCart, Trash2, X, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    async function getBalance() {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('users')
          .select('wallet_balance')
          .eq('id', session.user.id)
          .single();
        if (data) setWalletBalance(data.wallet_balance || 0);
      }
    }
    getBalance();
  }, [session, supabase]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet>
      <SheetTrigger className="relative group inline-flex shrink-0 items-center justify-center h-8 w-8 hover:bg-bandha-subtle focus-visible:outline-none focus:outline-none">
        <ShoppingCart className="w-6 h-6 text-black group-hover:text-bandha-primary transition-colors" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-bandha-primary text-white text-[9px] font-black w-5 h-5 flex items-center justify-center border-2 border-white">
            {totalItems}
          </span>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-2 border-black rounded-none bg-white">
        <SheetHeader className="p-4 px-6 border-b-2 border-black bg-black text-white">
          <SheetTitle className="flex items-center justify-between text-lg font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#FF5C00]" strokeWidth={3} />
              CARRITO_DE_COMPRA [v11]
            </div>
            <span className="text-[10px] font-mono text-white/40">BANDHA_OS</span>
          </SheetTitle>
        </SheetHeader>
 
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white">
            <div className="w-24 h-24 bg-[#F5F5F5] flex items-center justify-center border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingCart className="w-12 h-12 text-black/20" />
            </div>
            <h3 className="font-black text-lg text-black uppercase tracking-tight">Vacio</h3>
            <p className="text-black/50 text-xs max-w-[200px] uppercase font-bold tracking-widest">
              Agrega productos para comenzar.
            </p>
            <SheetTrigger className="mt-4 bg-bandha-primary text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              Explorar
            </SheetTrigger>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="divide-y divide-black/5 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 group">
                    <div className="relative w-20 h-20 overflow-hidden bg-white border border-black group-hover:shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] transition-all flex-shrink-0">
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover p-2"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <h4 className="font-black text-black uppercase tracking-tight text-xs leading-none truncate max-w-[180px]">
                            {item.name}
                          </h4>
                          <span className="text-[9px] font-mono text-black/40 uppercase tracking-widest">
                            UNIT_PX: {formatCurrency(item.price)}
                          </span>
                        </div>
                        <button
                          className="h-8 w-8 text-black/20 hover:text-red-600 transition-colors flex items-center justify-center border border-black/5 hover:border-red-600"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-end justify-between">
                        <div className="flex items-center border border-black h-7 bg-white">
                          <button
                            className="h-full px-2 rounded-none hover:bg-black hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" strokeWidth={3} />
                          </button>
                          <span className="px-3 text-center text-xs font-black text-black border-x border-black h-full flex items-center justify-center bg-black/5">
                            {item.quantity}
                          </span>
                          <button
                            className="h-full px-2 rounded-none hover:bg-black hover:text-white transition-colors flex items-center justify-center disabled:opacity-30"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 99)}
                          >
                            <Plus className="w-3 h-3" strokeWidth={3} />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-black text-bandha-primary tracking-tighter text-lg">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="bg-black text-white px-6 py-8 space-y-4">
              <div className="grid grid-cols-2 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-white/40">SUBTOTAL_ITEMS</span>
                <span className="text-right">{totalItems} UNIDADES</span>
                
                <span className="text-white/40">SUBTOTAL_VAL</span>
                <span className="text-right">{formatCurrency(getTotalPrice())}</span>
                
                {walletBalance > 0 && (
                  <>
                    <span className="text-[#FF5C00]">WALLET_USE</span>
                    <span className="text-right text-[#FF5C00]">{formatCurrency(walletBalance)}</span>
                  </>
                )}
              </div>
              
              <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-white/40 block">TOTAL_PAYABLE</span>
                  <span className="text-3xl font-black tracking-tighter leading-none">
                    {formatCurrency(getTotalPrice())}
                  </span>
                </div>
                <div className="w-12 h-12 bg-[#FF5C00] flex items-center justify-center border border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]">
                  <ShoppingCart size={24} className="text-black" strokeWidth={3} />
                </div>
              </div>
            </div>
            
            <Link href="/checkout" className="w-full bg-white text-black h-16 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center border-t-2 border-black hover:bg-[#FF5C00] hover:text-white transition-all group">
              PROCESAR_PAGO
              <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} strokeWidth={3} />
            </Link>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
