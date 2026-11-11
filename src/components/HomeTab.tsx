import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  Utensils,
  Dumbbell,
  Cake,
  GlassWater,
  Salad,
  Flame,
  Coffee,
  Eye,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { Product, ProductCategory, ProductVariant } from '../types';
import { CATEGORIES_LIST, PROMOTIONS, BUSINESS_INFO } from '../data/menuData';
import { ProductCard } from './ProductCard';

interface HomeTabProps {
  products: Product[];
  cartItemsMap: Record<string, number>;
  onQuickAdd: (product: Product, variant?: ProductVariant) => void;
  onQuickDecrease: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  onSelectCategory: (category: ProductCategory) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onOpenMenuBoard?: () => void;
  onOpenFlyers?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  products,
  cartItemsMap,
  onQuickAdd,
  onQuickDecrease,
  onOpenDetail,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onOpenMenuBoard,
  onOpenFlyers,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sugarFree' | 'protein' | 'lactoseFree' | 'diabetic'>('all');
  const sliderRef = useRef<HTMLDivElement>(null);

  // Auto rotate banner every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMOTIONS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + PROMOTIONS.length) % PROMOTIONS.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMOTIONS.length);
  };

  // Filtered featured products
  const featuredProducts = products.filter((p) => {
    if (activeFilter === 'sugarFree') return p.isSugarFree;
    if (activeFilter === 'protein') return p.hasProtein;
    if (activeFilter === 'lactoseFree') return p.isLactoseFree;
    if (activeFilter === 'diabetic') return p.isDiabeticFriendly;
    return true;
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4" />;
      case 'Cake':
        return <Cake className="w-4 h-4" />;
      case 'Salad':
        return <Salad className="w-4 h-4" />;
      case 'Coffee':
        return <Coffee className="w-4 h-4" />;
      case 'GlassWater':
        return <GlassWater className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {/* 1. Interactive Promotions Carousel with Swipe/Mouse Drag support */}
      <section className="relative px-4">
        <div className="relative rounded-3xl overflow-hidden shadow-md bg-neutral-900 border border-neutral-800">
          <div
            ref={sliderRef}
            className="relative w-full aspect-16/10 sm:aspect-2/1 transition-all duration-500 overflow-hidden"
          >
            {PROMOTIONS.map((promo, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={promo.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                  }`}
                >
                  <img
                    src={promo.image}
                    alt={promo.title}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                  {/* Contrast Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                  {/* Promo Content */}
                  <div className="absolute bottom-3 left-4 right-4 text-white flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500 text-neutral-950">
                        {promo.tag}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-300">
                        {promo.badge}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold leading-tight drop-shadow-xs">
                      {promo.title}
                    </h2>
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                      {promo.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-amber-400 tabular-nums">
                          {promo.price}
                        </span>
                        {'originalPrice' in promo && (promo as { originalPrice?: string }).originalPrice && (
                          <span className="text-xs text-white/50 line-through tabular-nums">
                            {(promo as { originalPrice?: string }).originalPrice}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const targetProduct = products.find((p) => p.id === promo.productId);
                          if (targetProduct) onOpenDetail(targetProduct);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-neutral-950 font-bold text-xs hover:bg-neutral-100 active:scale-95 transition-all shadow-xs"
                      >
                        Pedir ahora
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous promo"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextSlide}
            aria-label="Next promo"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slider Pagination Dots */}
          <div className="absolute top-3 right-3 z-20 flex gap-1.5">
            {PROMOTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Daily Lunch Special Callout */}
      <section className="px-4">
        <div
          onClick={onOpenFlyers || onOpenMenuBoard}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-neutral-900 text-white flex items-center justify-between shadow-xs border border-amber-400/40 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 border border-amber-300/40 flex items-center justify-center text-amber-200 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Almuerzo Saludable del Día · S/ 16.50</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-white text-neutral-950 font-black rounded-xs">
                  Menú de Hoy
                </span>
              </p>
              <p className="text-[11px] text-amber-100/90">
                Opción 1: Garbanzos con pollo guisado | Opción 2: Filete con camote (incluye mazamorra, ensalada y refresco)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-300 shrink-0" />
        </div>
      </section>

      {/* 3. Horizontal Category Navigation */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Categorías de la Carta
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Postres con avena, batidos 24g, frappes, jugos y más
            </p>
          </div>
          <button
            onClick={() => onSelectCategory('todos')}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Ver todas →
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 pt-1">
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className="flex flex-col items-center justify-between shrink-0 p-2 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 shadow-2xs hover:shadow-md transition-all w-[94px] min-h-[126px] text-center active:scale-95 group cursor-pointer"
            >
              {/* Photo Avatar with Micro Icon Badge */}
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-xs border-2 border-neutral-100 dark:border-neutral-800 group-hover:scale-105 transition-transform bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  {getCategoryIcon(cat.icon)}
                </div>
              </div>

              {/* Category Name */}
              <span className="text-[11px] font-extrabold text-neutral-900 dark:text-neutral-100 leading-tight mt-1 px-0.5 line-clamp-1">
                {cat.label}
              </span>

              {/* Sub-tag Badge */}
              <span className="text-[9px] font-bold tracking-tight px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 whitespace-nowrap">
                {cat.tag}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Healthy Lifestyle Filter Tabs */}
      <section className="px-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Todos los platos
          </button>
          <button
            onClick={() => setActiveFilter('protein')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'protein'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Alto en Proteína</span>
          </button>
          <button
            onClick={() => setActiveFilter('sugarFree')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'sugarFree'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cero Azúcar</span>
          </button>
          <button
            onClick={() => setActiveFilter('lactoseFree')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'lactoseFree'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Sin Lactosa
          </button>
          <button
            onClick={() => setActiveFilter('diabetic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === 'diabetic'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            Apto Diabéticos
          </button>
        </div>
      </section>

      {/* 5. Highlighted Product Grid */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Los Más Pedidos de Tentaciones Fit
            </h2>
          </div>
          <span className="text-xs text-neutral-500 tabular-nums">
            {featuredProducts.length} productos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featuredProducts.map((product) => (
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
      </section>
    </div>
  );
};
