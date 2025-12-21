"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Normal from "@/components/templates/normal/Normal";
import Pro from "@/components/templates/pro/Pro";
import Ecommerce from "@/components/templates/ecommerce/Ecommerce";
import Cafe from "@/components/templates/cafe/Cafe";
import Max from "@/components/templates/max/Max";
import Ecomapp from "@/components/templates/ecomapp/Ecomapp";
import { MenuTemplateType } from "@/generated/prisma/enums";
import { subscribeToThemeUpdates, ThemeConfig } from "@/lib/theme-sync";

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
  locationUrl?: string;
  products: Product[];
  template: MenuTemplateType | null;
  isWhatsappOrderingEnabled: boolean;
  isReadymade?: boolean;
  slug: string;
  themeConfig?: any;
}

export default function SlugMenuClient({
  shopName,
  shopPlace,
  shopContact,
  shopLogo,
  locationUrl,
  products,
  template,
  isWhatsappOrderingEnabled,
  isReadymade,
  slug,
  themeConfig: initialThemeConfig,
}: SlugMenuClientProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();

  // Live theme config state - updates in real-time from admin panel
  const [liveThemeConfig, setLiveThemeConfig] = useState<ThemeConfig | undefined>(
    initialThemeConfig
  );

  // Subscribe to theme updates from admin panel
  useEffect(() => {
    const unsubscribe = subscribeToThemeUpdates(slug, (newThemeConfig) => {
      setLiveThemeConfig(newThemeConfig);
    });

    return () => {
      unsubscribe();
    };
  }, [slug]);

  const handleClaim = async () => {
    if (!claimCode.trim()) {
      setError("Please enter a code");
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const res = await fetch('/api/verify-claim-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code: claimCode })
      });
      
      const data = await res.json();

      if (res.ok && data.valid) {
        // Redirect to auth with callback to claim page
        const callbackUrl = `/claim/${slug}?code=${claimCode}`;
        router.push(`/auth?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        setError(data.error || "Invalid Code");
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      {isReadymade && (
        <div className="fixed top-30 right-4 z-50">
          <button
            onClick={() => setShowClaimModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-indigo-700 transition-all animate-bounce"
          >
            Claim This Shop
          </button>
        </div>
      )}

      {showClaimModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Claim "{shopName}"</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the code to claim this shop and make it yours.
            </p>
            
            <input
              type="text"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter Code"
            />
            
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowClaimModal(false)}
                className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleClaim}
                disabled={verifying}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {template === MenuTemplateType.PRO && (
        <Pro
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          products={products}
          isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
          slug={slug}
          themeConfig={liveThemeConfig}
        />
      )}
      {template === MenuTemplateType.E_COM && (
        <Ecommerce
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          products={products}
          isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
          slug={slug}
        />
      )}
      {template === MenuTemplateType.CAFE && (
        <Cafe
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          products={products}
          isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
          slug={slug}
        />
      )}
      {template === MenuTemplateType.NORMAL && (
        <Normal
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          products={products}
          slug={slug}
          themeConfig={liveThemeConfig}
        />
      )}
      {template === MenuTemplateType.MAX && (
        <Max
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          products={products}
          isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
          slug={slug}
          themeConfig={liveThemeConfig}
        />
      )}
      {template === MenuTemplateType.ECOMAPP && (
        <Ecomapp
          shopName={shopName}
          shopPlace={shopPlace}
          shopContact={shopContact}
          shopLogo={shopLogo}
          locationUrl={locationUrl}
          products={products}
          isWhatsappOrderingEnabled={isWhatsappOrderingEnabled}
          slug={slug}
          themeConfig={liveThemeConfig}
        />
      )}
    </>
  );
}
