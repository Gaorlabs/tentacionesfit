import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  items: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ items, onOpenCart }) => {
  if (items.length === 0) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const firstImage = items[0]?.image;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-20 px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-300">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <button
          onClick={onOpenCart}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl p-3 shadow-xl shadow-emerald-950/25 flex items-center justify-between active:scale-[0.98] transition-all border border-emerald-500/30"
        >
          {/* Left: Thumbnail & Count */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-emerald-800 border border-emerald-400/40 shrink-0">
              {firstImage ? (
                <img
                  src={firstImage}
                  alt="Item"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShoppingBag className="w-5 h-5 m-auto text-emerald-200" />
              )}
              <span className="absolute -top-1 -right-1 bg-amber-400 text-neutral-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            </div>

            <div className="text-left">
              <span className="text-[11px] font-medium text-emerald-100 block">
                {totalCount} {totalCount === 1 ? 'producto' : 'productos'} listos
              </span>
              <span className="text-xs font-bold text-white tracking-wide">
                Ver mi pedido
              </span>
            </div>
          </div>

          {/* Right: Total Price in Soles & Arrow */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-base font-extrabold text-white tabular-nums tracking-tight">
                S/ {totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
