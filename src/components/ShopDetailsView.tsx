"use client";

import { User, Store, MapPin, Phone } from "lucide-react";

interface ShopDetailsViewProps {
  userId: string;
  shopName: string;
  place: string;
  contactNumber: string;
  onUserIdChange: (value: string) => void;
  onShopNameChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onSave: () => void;
}

export default function ShopDetailsView({
  userId,
  shopName,
  place,
  contactNumber,
  onUserIdChange,
  onShopNameChange,
  onPlaceChange,
  onContactNumberChange,
  onSave,
}: ShopDetailsViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Shop Details</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your shop information</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={16} />
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Store size={16} />
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => onShopNameChange(e.target.value)}
              placeholder="Enter shop name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} />
              Place
            </label>
            <input
              type="text"
              value={place}
              onChange={(e) => onPlaceChange(e.target.value)}
              placeholder="Enter location"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} />
              Contact Number
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => onContactNumberChange(e.target.value)}
              placeholder="Enter contact number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            Save Shop Details
          </button>
        </div>
      </div>
    </div>
  );
}

