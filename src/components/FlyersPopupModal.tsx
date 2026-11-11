import React, { useState } from 'react';
import { X, Utensils, Plus, Check, ArrowRight, Sparkles } from 'lucide-react';
import { BUSINESS_INFO, LUNCH_SPECIAL_OPTIONS, LunchSpecialOption } from '../data/menuData';

interface FlyersPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderLunchSpecial: (lunch: LunchSpecialOption) => void;
}

export const FlyersPopupModal: React.FC<FlyersPopupModalProps> = ({
  isOpen,
  onClose,
  onOrderLunchSpecial,
}) => {
  const [addedOptionId, setAddedOptionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddLunch = (lunch: LunchSpecialOption) => {
    onOrderLunchSpecial(lunch);
    setAddedOptionId(lunch.id);
    setTimeout(() => {
      setAddedOptionId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                Almuerzo Saludable de Hoy
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                2 opciones disponibles · Precio: S/ 16.50
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center transition-colors"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-neutral-50 dark:bg-neutral-950 p-3 sm:p-4 space-y-3">
          {/* Lunch Flyer Image Container */}
          <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md bg-neutral-900">
            <img
              src={BUSINESS_INFO.lunchFlyerUrl}
              alt="Almuerzo Saludable Tentaciones Fit"
              className="w-full h-auto object-cover max-h-[340px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
              Menú del Día
            </div>
          </div>

          {/* Includes Summary Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              S/
            </div>
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-amber-900 dark:text-amber-200 text-sm">
                Almuerzo Completo · S/ 16.50
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                Ambas opciones incluyen: <strong>Mazamorra light</strong> + <strong>Ensalada de verdura</strong> + <strong>Refresco natural</strong>
              </p>
            </div>
          </div>

          {/* The 2 Lunch Food Options Cards with Quick Order */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider px-1">
              Elige tu opción de comida:
            </p>

            {LUNCH_SPECIAL_OPTIONS.map((lunch) => (
              <div
                key={lunch.id}
                className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between gap-2.5 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Opción {lunch.optionNumber}
                      </span>
                      <span className="text-xs font-extrabold text-neutral-900 dark:text-white">
                        {lunch.mainDish}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {lunch.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      S/ {lunch.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Includes pills */}
                <div className="flex flex-wrap gap-1 text-[10px] text-neutral-600 dark:text-neutral-400">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                    ✓ Mazamorra light
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                    ✓ Ensalada de verdura
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center gap-1">
                    ✓ Refresco
                  </span>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddLunch(lunch)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                    addedOptionId === lunch.id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {addedOptionId === lunch.id ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>¡Agregado al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Pedir Opción {lunch.optionNumber} (S/ {lunch.price.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
            {BUSINESS_INFO.sealText}
          </div>

          <button
            onClick={onClose}
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>Continuar al Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
