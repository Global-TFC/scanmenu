"use client";

import { QrCode, Eye, Palette, ImageDown, FileDown } from "lucide-react";

interface MenuToolsViewProps {
  shopName: string;
  menuUrl: string;
}

export default function MenuToolsView({ shopName, menuUrl }: MenuToolsViewProps) {
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
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Menu Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => alert("QR Code generation would be implemented here")}
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
          href="/menu/shop-123"
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
          onClick={() => alert("Theme customization panel would open here")}
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
    </div>
  );
}
