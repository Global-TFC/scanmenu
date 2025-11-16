"use client";
import { useEffect, useState } from "react";
import { Zap, Clock, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
}

export default function FlashDeals({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featured = products.filter((p) => !!p.isFeatured);
  if (featured.length === 0) return null;

  // Split products into rows of 5 for mobile only
  const firstRow = featured.slice(0, 5);
  const secondRow = featured.slice(5, 10);
  const remaining = featured.slice(10);
  const allFeatured = featured; // For desktop - show all in one row

  const renderProductCard = (product: Product) => {
    const discount = 25;
    return (
      <div key={product.id} className="flex-none w-[160px]">
        <div className="bg-white border-[3px] border-black p-3 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all transform rotate-[-0.5deg] hover:rotate-[0deg]">
          {/* Image Container */}
          <div className="relative aspect-square border-[3px] border-black overflow-hidden mb-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-xs px-2 py-1 uppercase border-[2px] border-black shadow-[2px_2px_0_#000] rotate-[-3deg]">
                -{discount}%
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h3 className="font-black text-sm mb-1 line-clamp-2 uppercase">
              {product.name}
            </h3>
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase">
              250g
            </p>

            {/* Price and Add Button */}
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-lg">
                    ₹{product.price.toFixed(0)}
                  </span>
                  <span className="text-xs font-bold text-gray-500 line-through">
                    ₹{Math.round(product.price * 1.25)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onAdd(product)}
                className="w-9 h-9 bg-black text-white border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all rotate-[3deg] hover:rotate-[0deg]"
              >
                <Plus className="w-5 h-5 font-black" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 bg-[#fff7d6] border-y-[4px] border-black my-4">
      {/* Header */}
      <div className="px-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500 border-[3px] border-black flex items-center justify-center shadow-[3px_3px_0_#000] rotate-[5deg]">
            <Zap className="w-6 h-6 text-white fill-current rotate-[-5deg]" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight transform rotate-[-1deg]">
            Flash Deals
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-pink-500 text-white px-3 py-2 border-[3px] border-black font-black uppercase text-sm shadow-[3px_3px_0_#000] rotate-[2deg]">
          <Clock className="w-4 h-4" />
          <span>
            {timeLeft.hours}h {timeLeft.minutes}m
          </span>
        </div>
      </div>

      {/* Desktop: All products in one row */}
      <div className="hidden md:block relative">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-4 pr-8">
          {allFeatured.map((product) => renderProductCard(product))}
        </div>
      </div>

      {/* Mobile: Split into rows of 5 */}
      <div className="md:hidden">
        {/* First Row - Products 1-5 */}
        <div className="relative mb-4">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-4 pr-8">
            {firstRow.map((product) => renderProductCard(product))}
          </div>
        </div>

        {/* Second Row - Products 6-10 (if exists) */}
        {secondRow.length > 0 && (
          <div className="relative mb-4">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pl-4 pr-8">
              {secondRow.map((product) => renderProductCard(product))}
            </div>
          </div>
        )}

        {/* Remaining Products in Grid (if more than 10) */}
        {remaining.length > 0 && (
          <div className="px-4">
            <div className="grid grid-cols-2 gap-4">
              {remaining.map((product) => renderProductCard(product))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
