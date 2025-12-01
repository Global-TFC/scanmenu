"use client";

import { useState, useEffect } from "react";
import { Search, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface GlobalImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialSearchTerm?: string;
}

interface ImageFile {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

export default function GlobalImageSelector({
  isOpen,
  onClose,
  onSelect,
  initialSearchTerm = "",
}: GlobalImageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm(initialSearchTerm);
      // Initial fetch without debounce if we have a term
      fetchImages(initialSearchTerm);
    }
  }, [isOpen, initialSearchTerm]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (searchTerm !== initialSearchTerm) {
         if (searchTerm.length === 0 || searchTerm.length >= 3) {
            fetchImages(searchTerm);
         }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, initialSearchTerm]);

  const fetchImages = async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const cleanQuery = query.toLowerCase().replace(/\s/g, "");
      if (cleanQuery) params.append("search", cleanQuery);
      
      const res = await fetch(`/api/images/global?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error(error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length === 0 || searchTerm.length >= 3) {
      fetchImages(searchTerm);
    }
  };

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            Select from Library
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for images (e.g., burger, pizza)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase().replace(/\s/g, ""))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </form>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
              <p>Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ImageIcon className="w-12 h-12 mb-2 text-gray-300" />
              <p>No images found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.fileId}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                    selectedImage === img.url
                      ? "border-indigo-600 ring-2 ring-indigo-600 ring-offset-2"
                      : "border-gray-200 hover:border-indigo-300"
                  }`}
                >
                  <Image
                    src={img.thumbnailUrl || img.url}
                    alt={img.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {selectedImage === img.url && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                      <div className="bg-indigo-600 text-white p-1 rounded-full">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedImage}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}
