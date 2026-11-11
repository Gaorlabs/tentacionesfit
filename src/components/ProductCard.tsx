import React, { useState } from 'react';
import { Plus, Minus, Star, Heart, Check, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../types';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onQuickAdd: (product: Product, variant?: ProductVariant) => void;
  onQuickDecrease: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onQuickAdd,
  onQuickDecrease,
  onOpenDetail,
  isFavorite,
  onToggleFavorite,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined
  );

  const currentPrice = selectedVariant
    ? product.price + selectedVariant.priceDelta
    : product.price;

  const handleVariantChange = (e: React.MouseEvent, variant: ProductVariant) => {
    e.stopPropagation();
    setSelectedVariant(variant);
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col justify-between bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/images/postre_fit_selva_negra_1794251504712.jpg')) {
              target.src = '/images/postre_fit_selva_negra_1794251504712.jpg';
            }
          }}
        />

        {/* Gradient Scrim for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 active:scale-90 transition-all shadow-xs"
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600 dark:text-neutral-300'
            }`}
          />
        </button>

        {/* Nutritional & Tag Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 max-w-[80%]">
          {product.isPopular && (
            <span className="text-[10px] font-bold uppercase tracking-tight bg-amber-500 text-neutral-950 px-2 py-0.5 rounded-md shadow-xs">
              Popular
            </span>
          )}
          {product.hasProtein && (
            <span className="text-[10px] font-bold uppercase tracking-tight bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs">
              {product.proteinGrams ? `${product.proteinGrams}g Prot` : 'Proteico'}
            </span>
          )}
          {product.isSugarFree && (
            <span className="text-[10px] font-bold uppercase tracking-tight bg-sky-600 text-white px-2 py-0.5 rounded-md shadow-xs">
              Sin Azúcar
            </span>
          )}
        </div>

        {/* Calories / Rating Overlay on bottom of image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-semibold bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-white/70">({product.reviewsCount})</span>
          </div>
          {product.calories && (
            <span className="text-[10px] font-medium bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md">
              {product.calories} kcal
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
            {product.description}
          </p>

          {/* Variants Selector (e.g. Porción, Frasco, Mediano) */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-[10px] font-bold uppercase text-neutral-400 dark:text-neutral-500">
                Variantes
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => handleVariantChange(e, v)}
                      className={`text-[11px] px-2 py-1 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pricing and Quick Add Controls */}
        <div className="mt-3.5 pt-2.5 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 tabular-nums">
                S/ {currentPrice.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs line-through text-neutral-400 tabular-nums">
                  S/ {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
              Hecho fresco hoy
            </span>
          </div>

          {/* Quick Add [-] [Qty] [+] or Initial Add Button */}
          <div onClick={(e) => e.stopPropagation()}>
            {quantityInCart > 0 ? (
              <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onQuickDecrease(product)}
                  className="w-7 h-7 flex items-center justify-center text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 rounded-lg active:scale-90 transition-all"
                  title="Disminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-bold text-xs text-emerald-900 dark:text-emerald-200 tabular-nums">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={() => onQuickAdd(product, selectedVariant)}
                  className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg active:scale-90 transition-all shadow-2xs"
                  title="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onQuickAdd(product, selectedVariant)}
                className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs shadow-2xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
