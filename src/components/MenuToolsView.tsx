"use client";

import { useState, useRef } from "react";
import { QrCode, Eye, Palette, ImageDown, FileDown, X, Copy, Check, Layout, Save } from "lucide-react";
import { MenuTemplateType } from "@/generated/prisma/enums";
import { QRCode } from "react-qrcode-logo";

interface MenuToolsViewProps {
  shopName: string;
  shopLogo?: string;
  menuUrl: string;
  template: string;
  onTemplateChange: (value: string) => void;
  onSave: () => void;
}

export default function MenuToolsView({ shopName, shopLogo, menuUrl, template, onTemplateChange, onSave }: MenuToolsViewProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<any>(null);

  const getPreviewUrl = () => {
    if (typeof window === 'undefined') return menuUrl;
    const origin = window.location.origin;
    switch (template) {
      case MenuTemplateType.NORMAL:
        return `${origin}/hoppe`;
      case MenuTemplateType.PRO:
        return `${origin}/asayn`;
      case MenuTemplateType.CAFE:
        return `${origin}/showrt`;
      case MenuTemplateType.E_COM:
        return `${origin}/showrt`;
      default:
        return menuUrl;
    }
  };

  const createPosterCanvas = async () => {
    const width = 1080;
    const height = 1350; // portrait
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#ffedd5");
    grad.addColorStop(0.5, "#ffe4e6");
    grad.addColorStop(1, "#fef3c7");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Header pill
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    roundRect(ctx, width * 0.075, 80, width * 0.85, 80, 40);
    ctx.fill();

    // Shop name
    ctx.fillStyle = "#111827";
    ctx.font = "bold 64px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.fillText(shopName || "Your Shop", width / 2, 150);

    // Title
    ctx.font = "bold 84px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillStyle = "#111827";
    wrapText(ctx, "Explore Our Digital Menu", width / 2, 360, width * 0.85, 88);

    // URL pill
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(ctx, width * 0.15, 520, width * 0.7, 80, 40);
    ctx.fill();
    ctx.font = "600 36px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText(menuUrl.replace(/^https?:\/\//, ""), width / 2, 575);

    // Simple QR placeholder (frame) — can be replaced by real QR later
    const qrSize = 360;
    const qrX = (width - qrSize) / 2;
    const qrY = 720;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 28);
    ctx.fill();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    roundRect(ctx, qrX, qrY, qrSize, qrSize, 16);
    ctx.stroke();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "600 28px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.textAlign = "center";
    ctx.fillText("QR Code", width / 2, qrY + qrSize / 2 + 12);

    // Footer
    ctx.fillStyle = "#6b7280";
    ctx.font = "500 28px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("Scan to view the latest menu", width / 2, height - 60);

    return canvas;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ");
    let line = "";
    const lines: string[] = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  };

  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  };

  const previewPoster = async () => {
    const canvas = await createPosterCanvas();
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`);
    }
  };

  const downloadPoster = async () => {
    const canvas = await createPosterCanvas();
    const link = document.createElement("a");
    link.download = `${shopName || "menu"}-poster.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      qrRef.current.download("png", `${shopName || "shop"}-qr-code`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Menu Tools</h2>
        <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
            <Save size={18} />
            Save Changes
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Template Selection Card */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Layout className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Menu Template</h3>
                    <p className="text-sm text-gray-500 mb-4">Choose the layout and design for your digital menu</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <select
                            value={template}
                            onChange={(e) => onTemplateChange(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        >
                            <option value={MenuTemplateType.NORMAL}>Normal</option>
                            <option value={MenuTemplateType.PRO}>Pro</option>
                            <option value={MenuTemplateType.E_COM}>E‑Com</option>
                            <option value={MenuTemplateType.CAFE}>Cafe</option>
                        </select>

                        <a
                            href={getPreviewUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                            <Eye size={16} />
                            Preview {template.toLowerCase()} Template
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <button
          onClick={() => setIsQrModalOpen(true)}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <QrCode className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Generate QR Code</p>
            <p className="text-sm text-gray-500">Create a QR to open your menu</p>
          </div>
        </button>

        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Digital Menu Preview</p>
            <p className="text-sm text-gray-500">Open a live preview of your menu</p>
          </div>
        </a>

        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <Palette className="text-rose-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Customize Menu Theme</p>
            <p className="text-sm text-gray-500">Colors, typography and layout</p>
          </div>
        </button>

        {/* Poster Tools */}
        <button
          onClick={previewPoster}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <ImageDown className="text-amber-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Preview Menu Poster</p>
            <p className="text-sm text-gray-500">Auto-generated shareable poster</p>
          </div>
        </button>
        <button
          onClick={downloadPoster}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileDown className="text-green-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Download Menu Poster</p>
            <p className="text-sm text-gray-500">Save as high-res PNG</p>
          </div>
        </button>
      </div>

      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">QR Code Generator</h3>
              <button 
                onClick={() => setIsQrModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Scan this QR code to access your digital menu</p>
              
              {/* QR Code with Logo */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  <QRCode
                    ref={qrRef}
                    value={menuUrl}
                    size={220}
                    logoImage={shopLogo}
                    logoWidth={shopLogo ? 80 : undefined}
                    logoHeight={shopLogo ? 80 : undefined}
                    removeQrCodeBehindLogo={true}
                    qrStyle="dots"
                    eyeRadius={5}
                    fgColor="#1f2937"
                    enableCORS={true}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate mr-2">{menuUrl}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={downloadQRCode}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Customization Modal */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Customize Menu Theme</h3>
              <button 
                onClick={() => setIsThemeModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Choose a color scheme for your menu</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { name: "Default", colors: "bg-gradient-to-r from-indigo-500 to-purple-600" },
                  { name: "Ocean", colors: "bg-gradient-to-r from-teal-500 to-blue-600" },
                  { name: "Sunset", colors: "bg-gradient-to-r from-orange-500 to-pink-600" },
                  { name: "Forest", colors: "bg-gradient-to-r from-green-500 to-emerald-600" },
                  { name: "Berry", colors: "bg-gradient-to-r from-purple-500 to-fuchsia-600" },
                  { name: "Candy", colors: "bg-gradient-to-r from-pink-500 to-rose-600" }
                ].map((theme, index) => (
                  <div key={index} className="cursor-pointer">
                    <div className={`${theme.colors} h-16 rounded-lg mb-1`}></div>
                    <p className="text-xs text-center text-gray-600">{theme.name}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                  <input 
                    type="color" 
                    defaultValue="#4f46e5" 
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Style</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Sans Serif</option>
                    <option>Serif</option>
                    <option>Monospace</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsThemeModalOpen(false);
                  alert("Theme customized successfully!");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}