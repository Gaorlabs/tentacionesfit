import React from 'react';
import { Home, Moon, Sun, ShoppingBag, Shield } from 'lucide-react';
import { BUSINESS_INFO } from '../data/menuData';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onReturnToSplash: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  cartCount: number;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReturnToSplash,
  onOpenCart,
  onOpenAdmin,
  cartCount,
  isDark,
  onToggleDark,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      <div className="w-full px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand Identity + Return to Portada Button */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onReturnToSplash}
            title="Regresar a la Portada"
            className="flex items-center gap-2 group p-1 -ml-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-neutral-800 border border-emerald-200 dark:border-neutral-700 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={BUSINESS_INFO.logoUrl}
                alt="Tentaciones Fit"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
                  Tentaciones<span className="text-emerald-600 dark:text-emerald-400">Fit</span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold tracking-tight">
                ← Volver a Portada
              </span>
            </div>
          </button>
        </div>

        {/* Right Controls: Install PWA, Dark mode, Admin, Cart */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* PWA In-App Install Button */}
          <PWAInstallButton variant="header" />

          {/* Theme Switcher */}
          <button
            onClick={onToggleDark}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Toggle theme"
            className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Admin Access */}
          <button
            onClick={onOpenAdmin}
            title="Panel de Administración"
            aria-label="Admin panel"
            className="flex items-center justify-center w-8 h-8 rounded-full text-neutral-500 hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Cart Icon Trigger */}
          <button
            onClick={onOpenCart}
            title="Ver carrito"
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xs transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
