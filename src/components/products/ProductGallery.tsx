"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  mainImage: string | null;
  productName: string;
  discount?: number;
}

export default function ProductGallery({ images, mainImage, productName, discount }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allImages = images && images.length > 0 ? images : [mainImage || "/placeholder-product.jpg"];
  const currentImage = allImages[selectedIndex] || mainImage || "/placeholder-product.jpg";

  return (
    <div className="w-full relative bg-white flex flex-col gap-4">
      {/* Main Image Display */}
      <div className="relative aspect-square w-full flex items-center justify-center p-2">
        <img 
          src={currentImage} 
          alt={productName} 
          className="max-h-full max-w-full object-contain transition-all duration-500 ease-in-out"
        />
        {discount && discount > 0 && (
          <div className="absolute top-4 left-4 bg-white border border-gray-100 text-[#00A650] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
            {discount}% OFF GRUPAL
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
        {allImages.map((img, idx) => (
          <button
            key={`${img}-${idx}`}
            onClick={() => setSelectedIndex(idx)}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border transition-all flex-shrink-0 relative ${
              selectedIndex === idx 
                ? "border-[#3483FA] ring-1 ring-[#3483FA]" 
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <img 
              src={img} 
              className="w-full h-full object-cover" 
              alt={`${productName} thumbnail ${idx + 1}`} 
            />
            {selectedIndex !== idx && <div className="absolute inset-0 bg-white/40" />}
          </button>
        ))}
      </div>
    </div>
  );
}
