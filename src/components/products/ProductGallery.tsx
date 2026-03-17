"use client";

import React, { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  mainImage: string | null;
  productName: string;
  discount?: number;
}

export default function ProductGallery({ images, mainImage, productName, discount }: ProductGalleryProps) {
  // Use index-based selection to avoid issues with duplicate URLs if they ever happen
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Combine images, bringing mainImage to front if it's not already there
  // Actually, the database 'imagenes' array should have all images.
  const allImages = images && images.length > 0 ? images : [mainImage || "/placeholder-product.jpg"];
  const currentImage = allImages[selectedIndex] || mainImage || "/placeholder-product.jpg";

  return (
    <div className="lg:w-3/5 relative bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
      {/* Main Image Display */}
      <div className="relative aspect-square md:aspect-[4/3] w-full flex items-center justify-center p-8 lg:p-12">
        <img 
          src={currentImage} 
          alt={productName} 
          className="max-h-full max-w-full object-contain transition-all duration-300"
        />
        {discount && discount > 0 && (
          <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-gradient-to-br from-[#009EE3] to-[#00A650] text-white font-black text-xs md:text-sm px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,158,227,0.3)] uppercase tracking-wider animate-in fade-in slide-in-from-top-4 duration-700">
            {discount}% AHORRO
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-4 p-6 overflow-x-auto justify-center md:justify-start border-t border-gray-50 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden p-1 transition-all flex-shrink-0 ${
                selectedIndex === idx 
                  ? "border-2 border-[#009EE3] shadow-md scale-105" 
                  : "border border-gray-100 opacity-60 hover:opacity-100"
              }`}
            >
              <img 
                src={img} 
                className="w-full h-full object-cover rounded-lg" 
                alt={`${productName} thumbnail ${idx + 1}`} 
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Fallback for single image to maintain layout consistency */}
      {allImages.length === 1 && (
        <div className="flex gap-4 p-6 justify-center md:justify-start border-t border-gray-50">
          <div className="w-16 h-16 rounded-xl border-2 border-[#009EE3] overflow-hidden p-1">
             <img src={currentImage} className="w-full h-full object-cover rounded-lg" alt={productName} />
          </div>
        </div>
      )}
    </div>
  );
}
