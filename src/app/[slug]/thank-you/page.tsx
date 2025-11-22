"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Star, Zap } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { fetchMenuBySlug } from "@/lib/api/menus";

export default function ThankYouPage() {
  const [copied, setCopied] = useState(false);
  const [menuUrl, setMenuUrl] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const upiId = "pay.example@upi"; // Replace with actual UPI ID
  const { slug } = useParams();
  const router = useRouter();

  const handleRedeemCoupon = async () => {
    setRedeeming(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to redeem coupon");
      }

      setCouponSuccess("Coupon redeemed successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/admin/${slug}`);
      }, 2000);
    } catch (error: any) {
      setCouponError(error.message);
    } finally {
      setRedeeming(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMenuUrl(`${window.location.origin}/${slug}`);
    }
  }, [slug]);

  // Check if user is already subscribed and redirect to admin
  useEffect(() => {
    async function checkSubscription() {
      if (!slug) return;

      try {
        const menu = await fetchMenuBySlug(slug as string);
        if (menu?.user?.isSubscribed) {
          router.push(`/admin/${slug}`);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }

    checkSubscription();
  }, [slug, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Star className="h-8 w-8 text-blue-600 fill-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ScanMenu</span>
          </h1>
          <div className="max-w-2xl mx-auto space-y-1 ">
            <p className="text-lg text-slate-600">
              Your digital store is ready at:
            </p>
            {menuUrl && (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors break-all"
              >
                {menuUrl}
              </a>
            )}
            <p className="text-slate-500 text-base">
              To unlock full features and add products, please select a plan below.
            </p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Coupon Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Have a Coupon Code?</h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                onClick={handleRedeemCoupon}
                disabled={redeeming || !couponCode}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {redeeming ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponError && (
              <p className="text-red-500 text-sm mt-2">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="text-green-600 text-sm mt-2">{couponSuccess}</p>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 text-center">Complete Your Payment</h2>
              <p className="text-slate-500 text-center mt-1">Scan via any UPI app to activate your subscription</p>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                {/* QR Code Area */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative w-64 h-64 bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-center">
                    <Image
                      src="/upi.png"
                      alt="UPI QR Code"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>

                {/* UPI Details */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">UPI ID</label>
                    <div className="mt-2 flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 group hover:border-blue-400 transition-colors">
                      <span className="font-mono text-lg text-slate-700 font-medium flex-1 text-center md:text-left">{upiId}</span>
                      <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-slate-200 transition-all active:scale-95"
                        title="Copy UPI ID"
                      >
                        {copied ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-slate-500" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <p className="text-green-600 text-sm mt-2 font-medium animate-pulse">
                        ✓ Copied to clipboard
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> After payment, please take a screenshot and contact support to activate your plan instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Basic Plan */}
          <div className="group relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-8 md:p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Basic Plan</h3>
                <p className="text-slate-500">Get a professional website worth min ₹10k</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900">₹1,788</span>
                <span className="ml-2 text-slate-500 font-medium">/year</span>
              </div>
              <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-base font-semibold">
                ₹149/month
              </div>
              <div className="border-t border-slate-100 my-6"></div>
              <ul className="space-y-4">
                {[
                  "Up to 20 Product Listings",
                  "All Premium Templates",
                  "AI Scanner to add products",
                  "WhatsApp Ordering",
                  "QR Code Generation"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="group relative bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transform md:-translate-y-4 hover:-translate-y-5 transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                <Zap className="h-3 w-3 fill-white" /> Recommended
              </span>
            </div>
            <div className="p-8 md:p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                <p className="text-slate-400">Everything you need to grow</p>
              </div>
              <div className="flex items-baseline text-white">
                <span className="text-5xl font-extrabold">₹2,988</span>
                <span className="ml-2 text-slate-400 font-medium">/year</span>
              </div>
              <div className="inline-block bg-slate-800 text-blue-300 px-3 py-1 rounded-full text-base font-semibold border border-slate-700">
                ₹249/month
              </div>
              <div className="border-t border-slate-800 my-6"></div>
              <ul className="space-y-4">
                {[
                  "Up to 50 Product Listings",
                  "All Premium Templates",
                  "AI Scanner to add products",
                  "WhatsApp Ordering",
                  "Priority 24/7 Support",
                  "Custom Domain Integration"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-300">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-blue-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="group relative bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="p-8 md:p-10 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Enterprise</h3>
                <p className="text-slate-500">For large scale operations</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-extrabold text-slate-900">Custom</span>
              </div>
              <div className="inline-block bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-base font-semibold">
                Contact Sales
              </div>
              <div className="border-t border-slate-100 my-6"></div>
              <ul className="space-y-4">
                {[
                  "Unlimited products",
                  "Multiple locations",
                  "Custom branding",
                  "API access",
                  "Dedicated support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-600">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-purple-600" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
