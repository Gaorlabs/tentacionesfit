import React from 'react';
import { Home, Compass, ShoppingBag, Heart } from 'lucide-react';

export type NavTab = 'inicio' | 'explorar' | 'favoritos' | 'carrito';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  cartCount: number;
  favoritesCount: number;
  onOpenCart?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  cartCount,
  favoritesCount,
  onOpenCart,
}) => {
  const tabs = [
    {
      id: 'inicio' as NavTab,
      label: 'Inicio',
      icon: Home,
      badge: 0,
    },
    {
      id: 'explorar' as NavTab,
      label: 'Explorar',
      icon: Compass,
      badge: 0,
    },
    {
      id: 'favoritos' as NavTab,
      label: 'Favoritos',
      icon: Heart,
      badge: favoritesCount,
    },
    {
      id: 'carrito' as NavTab,
      label: 'Mi Carrito',
      icon: ShoppingBag,
      badge: cartCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-neutral-800 transition-colors pb-safe">
      <div className="max-w-xl mx-auto grid grid-cols-4 h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const handleClick = () => {
            if (tab.id === 'carrito' && onOpenCart) {
              onOpenCart();
            } else {
              onTabChange(tab.id);
            }
          };

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className="relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-transform active:scale-90 group"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 stroke-[2.4]'
                      : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                  } ${tab.id === 'favoritos' && isActive ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-600 text-white font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight mt-1 transition-colors ${
                  isActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
