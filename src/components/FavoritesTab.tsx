import React from 'react';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { ProductCard } from './ProductCard';

interface FavoritesTabProps {
  products: Product[];
  favoriteIds: string[];
  cartItemsMap: Record<string, number>;
  onQuickAdd: (product: Product, variant?: ProductVariant) => void;
  onQuickDecrease: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  onToggleFavorite: (product: Product) => void;
  onGoToCatalog: () => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  products,
  favoriteIds,
  cartItemsMap,
  onQuickAdd,
  onQuickDecrease,
  onOpenDetail,
  onToggleFavorite,
  onGoToCatalog,
}) => {
  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="py-20 px-4 text-center max-w-sm mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-neutral-800 text-red-500 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8 fill-red-100 dark:fill-neutral-700" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
            Aún no tienes favoritos guardados
          </h3>
          <p className="text-xs text-neutral-500">
            Toca el corazón en tus postres sin azúcar, batidos de proteína o bebidas preferidas para encontrarlos rápido aquí.
          </p>
        </div>
        <button
          onClick={onGoToCatalog}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all"
        >
          Explorar Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
            Mis Favoritos Tentaciones Fit
          </h2>
          <p className="text-xs text-neutral-500">Tus platos saludables favoritos a un toque</p>
        </div>
        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 fill-red-500" />
          <span>{favoriteProducts.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {favoriteProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantityInCart={cartItemsMap[product.id] || 0}
            onQuickAdd={onQuickAdd}
            onQuickDecrease={onQuickDecrease}
            onOpenDetail={onOpenDetail}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
