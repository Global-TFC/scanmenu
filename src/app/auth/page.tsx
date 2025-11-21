"use client";

import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import GoogleAuth from "@/components/auth/GoogleAuth";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/admin/menu-form");
    }
  }, [session, router]);

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-white rounded-full mb-4">
              <Store className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to ScanMenu
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              Sign in to create your digital menu
            </p>
          </div>

          {/* Auth Form */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Get Started
            </h2>

            <GoogleAuth />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or explore</span>
              </div>
            </div>

            {/* Sample Menu Link */}
            <Link
              href="/showrt"
              className="block w-full py-3 px-4 text-center border-2 border-gray-200 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-indigo-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              View Sample Menu
            </Link>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by restaurants & shops</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600 mb-1">500+</div>
              <div className="text-xs text-gray-600">Active Menus</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600 mb-1">100k+</div>
              <div className="text-xs text-gray-600">Menu Views</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-indigo-600 mb-1">4.9★</div>
              <div className="text-xs text-gray-600">User Rating</div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
