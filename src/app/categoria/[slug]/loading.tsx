import React from "react";
import { ShoppingBag } from "lucide-react";

export default function LoadingCategory() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-20">
      {/* Skeleton Hero */}
      <section className="w-full bg-slate-200 h-[300px] animate-pulse flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6">
           <div className="h-4 w-32 bg-slate-300 rounded-full mb-8" />
           <div className="h-12 w-64 bg-slate-300 rounded-2xl mb-4" />
           <div className="h-6 w-96 bg-slate-300 rounded-xl" />
        </div>
      </section>

      {/* Results Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-20 mb-10" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-gray-100 p-6 flex flex-col gap-4">
               <div className="aspect-square bg-slate-100 rounded-2xl w-full" />
               <div className="h-4 bg-slate-100 rounded-full w-3/4" />
               <div className="h-4 bg-slate-100 rounded-full w-1/2" />
               <div className="mt-auto flex justify-between">
                 <div className="h-8 bg-slate-100 rounded-xl w-24" />
                 <div className="h-8 bg-slate-100 rounded-xl w-24" />
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
