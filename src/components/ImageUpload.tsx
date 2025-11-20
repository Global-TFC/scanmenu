"use client";

import { useState, useRef } from "react";
import { upload } from "@imagekit/next";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  onSuccess: (url: string) => void;
  onError?: (err: any) => void;
  folder?: string;
  currentImage?: string;
}

export default function ImageUpload({ onSuccess, onError, folder = "/menu-items", currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="w-full">
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
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
          </div>
        </label>
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
              onClick={() => onSuccess("")}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              title="Remove Image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
