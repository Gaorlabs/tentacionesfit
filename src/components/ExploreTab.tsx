import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Product, ProductCategory, ProductVariant } from '../types';
import { CATEGORIES_LIST } from '../data/menuData';
import { ProductCard } from './ProductCard';

interface ExploreTabProps {
  products: Product[];
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  cartItemsMap: Record<string, number>;
  onQuickAdd: (product: Product, variant?: ProductVariant) => void;
  onQuickDecrease: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  cartItemsMap,
  onQuickAdd,
  onQuickDecrease,
  onOpenDetail,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'sugarFree' | 'protein' | 'lactoseFree' | 'diabetic'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc' | 'protein'>('popular');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category check
        if (selectedCategory !== 'todos' && p.category !== selectedCategory) {
          return false;
        }

        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesDesc = p.description.toLowerCase().includes(q);
          const matchesIngredients = p.ingredients?.some((ing) => ing.toLowerCase().includes(q));
          if (!matchesName && !matchesDesc && !matchesIngredients) return false;
        }

        // Dietary tags
        if (dietFilter === 'sugarFree' && !p.isSugarFree) return false;
        if (dietFilter === 'protein' && !p.hasProtein) return false;
        if (dietFilter === 'lactoseFree' && !p.isLactoseFree) return false;
        if (dietFilter === 'diabetic' && !p.isDiabeticFriendly) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'protein') return (b.proteinGrams || 0) - (a.proteinGrams || 0);
        return b.reviewsCount - a.reviewsCount; // popular
      });
  }, [products, selectedCategory, searchQuery, dietFilter, sortBy]);

  return (
    <div className="space-y-4 pb-28 pt-2 px-4">
      {/* 1. Real-time Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la carta: batidos, postres con avena, frappes, ensaladas..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-emerald-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Category Filter Pills with Mini Photos */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shadow-2xs ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-500/50'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/40 dark:border-neutral-700">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-filters & Sort Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Diet tags */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setDietFilter((prev) => (prev === 'protein' ? 'all' : 'protein'))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              dietFilter === 'protein'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Con Proteína
          </button>
          <button
            onClick={() => setDietFilter((prev) => (prev === 'sugarFree' ? 'all' : 'sugarFree'))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              dietFilter === 'sugarFree'
                ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold border border-sky-300 dark:border-sky-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Sin Azúcar
          </button>
          <button
            onClick={() => setDietFilter((prev) => (prev === 'lactoseFree' ? 'all' : 'lactoseFree'))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              dietFilter === 'lactoseFree'
                ? 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold border border-orange-300 dark:border-orange-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Sin Lactosa
          </button>
        </div>

        {/* Sort Select */}
        <div className="shrink-0 flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-[11px] font-semibold py-1 px-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-emerald-600"
          >
            <option value="popular">Más Populares</option>
            <option value="priceAsc">Menor Precio</option>
            <option value="priceDesc">Mayor Precio</option>
            <option value="protein">Mayor Proteína</option>
          </select>
        </div>
      </div>

      {/* 4. Results Header */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
        <span>Mostrando {filteredProducts.length} resultados</span>
        {(searchQuery || dietFilter !== 'all' || selectedCategory !== 'todos') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              onSelectCategory('todos');
            }}
            className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* 5. Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantityInCart={cartItemsMap[product.id] || 0}
              onQuickAdd={onQuickAdd}
              onQuickDecrease={onQuickDecrease}
              onOpenDetail={onOpenDetail}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            No se encontraron productos
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Intenta buscando con otro término como "pollo", "batido", "proteína" o "avena".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDietFilter('all');
              onSelectCategory('todos');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs"
          >
            Restablecer búsqueda
          </button>
        </div>
      )}
    </div>
  );
};
