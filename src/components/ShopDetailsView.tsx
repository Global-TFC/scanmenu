"use client";

import { User, Store, MapPin, Phone, Layout } from "lucide-react";
import { MenuTemplateType } from "@/generated/prisma/enums";

interface ShopDetailsViewProps {
  slug: string;
  shopName: string;
  place: string;
  contactNumber: string;
  template: string;
  onSlugChange: (value: string) => void;
  onShopNameChange: (value: string) => void;
  onPlaceChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onTemplateChange: (value: string) => void;
  onSave: () => void;
}

export default function ShopDetailsView({
  slug,
  shopName,
  place,
  contactNumber,
  template,
  onSlugChange,
  onShopNameChange,
  onPlaceChange,
  onContactNumberChange,
  onTemplateChange,
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
              Shop Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="Enter shop slug"
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
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={contactNumber || "+91 "}
              onChange={(e) => {
                const val = e.target.value;
                if (!val.startsWith("+91 ")) {
                  onContactNumberChange("+91 ");
                  return;
                }
                const numberPart = val.slice(4);
                if (!/^\d*$/.test(numberPart)) return;
                if (numberPart.length > 10) return;
                onContactNumberChange(val);
              }}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Layout size={16} />
              Template
            </label>
            <select
              value={template}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            >
              <option value={MenuTemplateType.NORMAL}>Normal</option>
              <option value={MenuTemplateType.PRO}>Pro</option>
              <option value={MenuTemplateType.E_COM}>E‑Com</option>
            </select>
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

