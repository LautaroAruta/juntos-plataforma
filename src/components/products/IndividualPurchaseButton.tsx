'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

interface IndividualPurchaseButtonProps {
  productId: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  providerId?: string;
  className?: string;
  label?: string;
}

export default function IndividualPurchaseButton({ 
  productId, 
  name,
  price, 
  image,
  stock,
  providerId,
  className, 
  label 
}: IndividualPurchaseButtonProps) {
  const router = useRouter();
  const { addItem, clearCart } = useCartStore();

  const handlePurchase = () => {
    // 1. Clear cart (BANDHA focuses on single-flow purchases for simplicity)
    clearCart();

    // 2. Add individual item to cart
    addItem({
      id: productId, // Using product_id for individual purchase
      productId: productId,
      name: name,
      price: price,
      image: image,
      quantity: 1,
      stock: stock,
      isGroupDeal: false,
      providerId: providerId
    });

    // 3. Redirect to checkout
    router.push(`/checkout?purchase_type=individual`);
  };

  return (
    <button 
      onClick={handlePurchase}
      className={className || "w-full py-4.5 bg-black text-white font-black border border-black shadow-[4px_4px_0px_0px_rgba(255,100,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"}
    >
      {label ? (
        <span>{label}</span>
      ) : (
        <>
          <span>Individual</span>
          <span className="opacity-40">/</span>
          <span className="font-black text-white">${price.toLocaleString()}</span>
        </>
      )}
    </button>
  );
}
