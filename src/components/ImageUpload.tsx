"use client";

import { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import { Upload, X, Image as ImageIcon } from "lucide-react";

import GlobalImageSelector from "./GlobalImageSelector";

interface ImageUploadProps {
  onSuccess: (url: string) => void;
  onError?: (err: any) => void;
  folder?: string;
  currentImage?: string;
  defaultSearchTerm?: string;
}

export default function ImageUpload({ onSuccess, onError, folder = "/global", currentImage, defaultSearchTerm }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showGlobalSelector, setShowGlobalSelector] = useState(false);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/upload-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed with status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Authentication request failed: ${error}`);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;

      const response = await upload({
        file,
        fileName: file.name,
        expire,
        token,
        signature,
        publicKey,
        folder,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });

      if (response.url) {
        onSuccess(response.url);
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (onError) onError(err);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
        id="image-upload-input"
        disabled={uploading}
      />
      
      {!currentImage && !uploading && (
        <div className="flex gap-2">
          <label
            htmlFor="image-upload-input"
            className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="text-sm text-gray-500 text-center px-2">
                <span className="font-semibold">Click to upload</span>
              </p>
            </div>
          </label>
          <button
            type="button"
            onClick={() => setShowGlobalSelector(true)}
            className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImageIcon className="w-8 h-8 mb-2 text-indigo-500" />
              <p className="text-sm text-indigo-600 font-semibold">Select from Library</p>
            </div>
          </button>
        </div>
      )}

      {uploading && (
        <div className="w-full h-32 border-2 border-gray-300 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50">
          <div className="w-full max-w-xs px-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-indigo-700">Uploading...</span>
              <span className="text-sm font-medium text-indigo-700">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {currentImage && !uploading && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
          <img
            src={currentImage}
            alt="Product"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label
              htmlFor="image-upload-input"
              className="p-2 bg-white text-gray-900 rounded-full cursor-pointer hover:bg-gray-100"
              title="Change Image"
            >
              <Upload size={16} />
            </label>
            <button
              type="button"
              onClick={() => setShowGlobalSelector(true)}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              title="Select from Library"
            >
              <ImageIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => onSuccess("")}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <GlobalImageSelector
        isOpen={showGlobalSelector}
        onClose={() => setShowGlobalSelector(false)}
        onSelect={(url) => onSuccess(url)}
        initialSearchTerm={defaultSearchTerm}
      />
    </div>
  );
}
