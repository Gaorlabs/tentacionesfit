import React, { useState } from 'react';
import { X, Star, Plus, Minus, Check, Flame, Dumbbell, ShieldCheck, Heart } from 'lucide-react';
import { Product, ProductVariant, SelectedCustomization } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    variant: ProductVariant | undefined,
    customizations: SelectedCustomization[],
    quantity: number,
    notes: string
  ) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization[]>(() => {
    // default required customizations
    const initial: SelectedCustomization[] = [];
    if (product?.customizations) {
      for (const cust of product.customizations) {
        if (cust.required && cust.options.length > 0) {
          initial.push({
            customizationId: cust.id,
            optionId: cust.options[0].id,
            name: cust.options[0].name,
            priceDelta: cust.options[0].priceDelta,
          });
        }
      }
    }
    return initial;
  });
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const toggleOption = (customizationId: string, optionId: string, name: string, priceDelta: number, isRadio: boolean) => {
    if (isRadio) {
      setSelectedCustomizations((prev) => [
        ...prev.filter((c) => c.customizationId !== customizationId),
        { customizationId, optionId, name, priceDelta },
      ]);
    } else {
      setSelectedCustomizations((prev) => {
        const exists = prev.some((c) => c.customizationId === customizationId && c.optionId === optionId);
        if (exists) {
          return prev.filter((c) => !(c.customizationId === customizationId && c.optionId === optionId));
        } else {
          return [...prev, { customizationId, optionId, name, priceDelta }];
        }
      });
    }
  };

  const customizationsTotal = selectedCustomizations.reduce((acc, curr) => acc + curr.priceDelta, 0);
  const variantTotal = selectedVariant ? selectedVariant.priceDelta : 0;
  const unitPrice = product.price + variantTotal + customizationsTotal;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart(product, selectedVariant, selectedCustomizations, quantity, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Media */}
        <div className="relative aspect-16/9 w-full bg-neutral-100 dark:bg-neutral-800 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close & Favorite buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => onToggleFavorite(product)}
              className="w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* Title on image overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {product.category}
            </span>
            <h2 className="text-xl font-bold leading-tight drop-shadow-xs">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/90">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {product.rating.toFixed(1)} ({product.reviewsCount} reseñas)
              </span>
              {product.calories && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {product.calories} kcal
                </span>
              )}
              {product.proteinGrams && (
                <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <Dumbbell className="w-3.5 h-3.5" />
                  {product.proteinGrams}g Proteína
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Body Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">
              Descripción & Preparación
            </h4>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Benefits & Ingredients pills */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Beneficios Nutricionales Tentaciones Fit</span>
              </div>
              <ul className="grid grid-cols-1 gap-1 text-xs text-emerald-900 dark:text-emerald-200">
                {product.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-2">
                Tamaño o Presentación
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{v.name}</span>
                      <span className="text-neutral-500 dark:text-neutral-400 font-mono">
                        {v.priceDelta > 0 ? `+S/ ${v.priceDelta.toFixed(2)}` : 'Estándar'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Options */}
          {product.customizations &&
            product.customizations.map((cust) => (
              <div key={cust.id} className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {cust.title}
                  </span>
                  {cust.required ? (
                    <span className="text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                      Obligatorio
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-400">Opcional</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {cust.options.map((opt) => {
                    const isChecked = selectedCustomizations.some(
                      (c) => c.customizationId === cust.id && c.optionId === opt.id
                    );
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          toggleOption(cust.id, opt.id, opt.name, opt.priceDelta, cust.required)
                        }
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-medium text-emerald-900 dark:text-emerald-200'
                            : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isChecked
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-neutral-300 dark:border-neutral-600'
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{opt.name}</span>
                        </div>
                        {opt.priceDelta > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                            +S/ {opt.priceDelta.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Notes for kitchen */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block mb-1">
              Indicaciones especiales para cocina
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, bebida bien helada, vinagreta aparte..."
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-emerald-600 focus:bg-white dark:focus:bg-neutral-900"
            />
          </div>
        </div>

        {/* Modal Bottom Fixed CTA */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-neutral-900 dark:text-white tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-11 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-700/20 flex items-center justify-between transition-all"
          >
            <span>Agregar al pedido</span>
            <span className="font-mono tabular-nums">S/ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
