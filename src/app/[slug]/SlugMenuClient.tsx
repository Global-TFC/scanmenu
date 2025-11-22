"use client";

import Normal from "@/components/templates/normal/Normal";
import Pro from "@/components/templates/pro/Pro";
import Ecommerce from "@/components/templates/ecommerce/Ecommerce";
import Cafe from "@/components/templates/cafe/Cafe";
import { MenuTemplateType } from "@/generated/prisma/enums";

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

interface SlugMenuClientProps {
  shopName: string;
  shopPlace: string;
  shopContact: string;
  shopLogo: string;
  products: Product[];
  template: MenuTemplateType | null;
  isWhatsappOrderingEnabled: boolean;
}

export default function SlugMenuClient({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  products,
  template,
  isWhatsappOrderingEnabled,
}: SlugMenuClientProps) {
  if (template === MenuTemplateType.PRO) {
    return (
      <Pro
        shopName={shopName}
        shopPlace={shopPlace}
        shopContact={shopContact}
        shopLogo={shopLogo}
        products={products}
        isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
      />
    );
  }
  if (template === MenuTemplateType.E_COM) {
    return (
      <Ecommerce
        shopName={shopName}
        shopPlace={shopPlace}
        shopContact={shopContact}
        shopLogo={shopLogo}
        products={products}
        isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
      />
    );
  }
  if (template === MenuTemplateType.CAFE) {
    return (
      <Cafe
        shopName={shopName}
        shopPlace={shopPlace}
        shopContact={shopContact}
        shopLogo={shopLogo}
        products={products}
        isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
      />
    );
  }
  return (
    <Normal
      shopName={shopName}
      shopPlace={shopPlace}
      shopContact={shopContact}
      shopLogo={shopLogo}
      products={products}
    />
  );
}
