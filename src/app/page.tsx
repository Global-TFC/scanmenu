import Link from "next/link";
import { Store, ShoppingCart, Users } from "lucide-react";
import GoogleAuth from "@/components/auth/GoogleAuth";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            ScanMenu
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Create digital menus for your offline shop
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-6">
              Digital Menu Creator
            </h2>

            <div className="space-y-4">
              <GoogleAuth />
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">View a sample menu</p>
                <Link
                  href="/menu/shop-123"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <ShoppingCart size={20} />
                  View Sample Menu
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Store className="mx-auto text-indigo-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 text-sm">Easy Setup</h3>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <ShoppingCart className="mx-auto text-indigo-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 text-sm">Digital Menus</h3>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Users className="mx-auto text-indigo-600 mb-2" size={24} />
            <h3 className="font-medium text-gray-900 text-sm">
              Customer Access
            </h3>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ScanMenu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
