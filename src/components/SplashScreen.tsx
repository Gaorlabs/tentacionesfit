import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Clock, Leaf, Utensils, QrCode } from 'lucide-react';
import { BUSINESS_INFO } from '../data/menuData';
import { ProductCategory } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SplashScreenProps {
  onEnterCatalog: (category?: ProductCategory) => void;
  onOpenMenuBoard: () => void;
  onOpenQR?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnterCatalog, onOpenMenuBoard, onOpenQR }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-gradient-to-b from-emerald-50 via-white to-amber-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 transition-colors duration-300">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-72 right-4 w-64 h-64 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Status / Operating Hours */}
      <header className="relative z-10 w-full px-5 pt-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md rounded-full shadow-xs border border-emerald-100 dark:border-neutral-700 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Abierto hoy · Delivery activo</span>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenQR && (
            <button
              onClick={onOpenQR}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 hover:bg-emerald-200/80 rounded-full border border-emerald-300/80 transition-colors"
              title="Carta QR para Mesas"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Carta QR</span>
            </button>
          )}
          <button
            onClick={onOpenMenuBoard}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 hover:bg-amber-200/80 dark:hover:bg-amber-900 rounded-full border border-amber-300/80 dark:border-amber-700 transition-colors"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Almuerzo Fit S/ 16.5</span>
          </button>
        </div>
      </header>

      {/* Central Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-6 max-w-xl mx-auto w-full text-center">
        {/* Floating Logo with Ambient Glow */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl scale-110" />
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-white dark:bg-neutral-800 shadow-xl border-4 border-white dark:border-neutral-700 flex items-center justify-center p-2 animate-float-gentle overflow-hidden">
            <img
              src={BUSINESS_INFO.logoUrl}
              alt="Tentaciones Fit Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Brand Slogan and Tagline */}
        <div className="space-y-1.5 mb-6">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-0.5 rounded-full">
            {BUSINESS_INFO.sealText}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Tentaciones <span className="text-emerald-600 dark:text-emerald-400">Fit</span>
          </h1>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 max-w-xs mx-auto">
            {BUSINESS_INFO.slogan}
          </p>
        </div>

        {/* Central Floating Card with Pulse Glow */}
        <div className="w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl p-5 shadow-xl border border-emerald-100/80 dark:border-neutral-800 animate-pulse-glow transition-all space-y-3">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Carta Saludable Tentaciones Fit</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Postres a base de avena, batidos con 24g de proteína, ensaladas frescas y frappes 100% naturales
            </p>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={() => onEnterCatalog('todos')}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 group transition-all"
          >
            <span>Ver Carta Completa</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Additional Action Buttons Row */}
          <div className="flex items-center gap-2">
            {onOpenQR && (
              <button
                onClick={onOpenQR}
                className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Generar QR de Mesa</span>
              </button>
            )}
          </div>

          {/* PWA Install Button */}
          <div className="w-full pt-1">
            <PWAInstallButton variant="hero" />
          </div>
        </div>

        {/* Value Propositions Strip */}
        <div className="w-full grid grid-cols-3 gap-2 mt-5 text-center">
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800 shadow-2xs">
            <Leaf className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">100% Saludable</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Sin azúcar refinada</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800 shadow-2xs">
            <Clock className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400 mb-1" />
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Delivery Rápido</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">25 a 45 min en Lima</p>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800 shadow-2xs">
            <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">Yape & BCP</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Pago seguro directo</p>
          </div>
        </div>
      </main>
    </div>
  );
};
