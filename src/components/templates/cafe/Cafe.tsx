"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MojitoShowcase from "./components/MojitoShowcase";
import Menu from "./components/Menu";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
}

interface CafeProps {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo?: string;
  products: Product[];
  isWhatsappOrderingEnabled?: boolean;
}

export default function Cafe({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products,
  isWhatsappOrderingEnabled,
}: CafeProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar activeColor={activeColor} shopName={shopName} shopLogo={shopLogo} />
      <Hero products={products} />
      <MojitoShowcase products={products} />
      <Menu onColorChange={setActiveColor} products={products} />
    </div>
  );
}
