import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  Printer,
  Sparkles,
  Smartphone,
  Share2,
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultUrl?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  defaultUrl = 'https://tentacionesfit.vercel.app/',
}) => {
  const [tableNumber, setTableNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute final URL based on selected table/location
  const targetUrl = useMemoUrl(defaultUrl, tableNumber);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(targetUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    // Find the canvas rendered inside canvasRef
    const canvasElement = canvasRef.current?.querySelector('canvas');
    if (!canvasElement) return;

    // Create a high resolution printable canvas with branding
    const printableCanvas = document.createElement('canvas');
    const ctx = printableCanvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 750;
    printableCanvas.width = width;
    printableCanvas.height = height;

    // Background card with rounded rectangle aesthetic
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Top Header Banner
    ctx.fillStyle = '#059669'; // Emerald-600
    ctx.fillRect(0, 0, width, 140);

    // Header Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TENTACIONES FIT 🥗', width / 2, 60);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#E1FCEF';
    ctx.fillText('CARTA DIGITAL & PEDIDOS EN LÍNEA', width / 2, 100);

    // Draw QR Code from internal canvas
    const qrSize = 360;
    const qrX = (width - qrSize) / 2;
    const qrY = 180;
    ctx.drawImage(canvasElement, qrX, qrY, qrSize, qrSize);

    // Table / Location label if defined
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px sans-serif';
    if (tableNumber.trim()) {
      ctx.fillText(`📍 MESA / UBICACIÓN: ${tableNumber.trim().toUpperCase()}`, width / 2, 570);
    } else {
      ctx.fillText('📱 Escanea con la cámara de tu celular', width / 2, 570);
    }

    // Call to action subtext
    ctx.fillStyle = '#4B5563';
    ctx.font = '18px sans-serif';
    ctx.fillText('Revisa nuestra carta interactiva y realiza tu pedido directo a WhatsApp', width / 2, 610);

    // Footer brand URL
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('tentacionesfit.vercel.app', width / 2, 680);

    // Download image file
    const dataUrl = printableCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `QR_TentacionesFit_${tableNumber ? `Mesa_${tableNumber}` : 'Oficial'}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800 flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                Carta Digital QR
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                Tentaciones Fit · Código Interactivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-center">
          
          {/* Main Display Box with Printable QR Stand Frame */}
          <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center space-y-3 shadow-inner">
            
            {/* Table Badge */}
            {tableNumber.trim() ? (
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                📍 {tableNumber.trim()}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Escaneo para Mesa o Delivery</span>
              </span>
            )}

            {/* QR Code Container (Vector SVG for screen rendering + Hidden Canvas for PNG export) */}
            <div className="p-4 bg-white rounded-2xl shadow-md border border-neutral-200/90 relative group">
              <QRCodeSVG
                value={targetUrl}
                size={210}
                level="H"
                includeMargin={true}
                fgColor="#047857" // Emerald primary color
                imageSettings={{
                  src: '/apple-touch-icon.png',
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />

              {/* Hidden Canvas for crisp high-res export */}
              <div ref={canvasRef} className="hidden">
                <QRCodeCanvas
                  value={targetUrl}
                  size={400}
                  level="H"
                  includeMargin={true}
                  fgColor="#047857"
                />
              </div>
            </div>

            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Apunta con la cámara para abrir la carta</span>
            </p>
          </div>

          {/* URL Box */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block uppercase tracking-wider">
              Enlace Web Directo:
            </label>
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <input
                type="text"
                readOnly
                value={targetUrl}
                className="flex-1 bg-transparent text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Table / Location Tag Generator Input */}
          <div className="space-y-1.5 text-left bg-neutral-50 dark:bg-neutral-850 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block uppercase tracking-wider">
              Etiqueta de Mesa o Mostrador (Opcional):
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Ej. Mesa 1, Mesa 2, Bar, Delivery..."
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-emerald-600"
            />
            <p className="text-[10px] text-neutral-400">
              Personaliza el QR para que los pedidos lleguen etiquetados con el número de mesa.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Download Printable PNG */}
            <button
              onClick={handleDownloadPNG}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen QR</span>
            </button>

            {/* Test Link in New Tab */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 hover:opacity-90 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Probar Enlace</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper hook to append ?mesa= parameter cleanly
function useMemoUrl(baseUrl: string, tableTag: string): string {
  if (!tableTag.trim()) return baseUrl;
  try {
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set('mesa', tableTag.trim());
    return urlObj.toString();
  } catch {
    return `${baseUrl}?mesa=${encodeURIComponent(tableTag.trim())}`;
  }
}
