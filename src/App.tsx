/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { ExploreTab } from './components/ExploreTab';
import { FavoritesTab } from './components/FavoritesTab';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { FlyersPopupModal } from './components/FlyersPopupModal';
import { AdminModal } from './components/AdminModal';
import { NotificationToast } from './components/NotificationToast';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, BUSINESS_INFO, LunchSpecialOption } from './data/menuData';
import { Product, ProductCategory, ProductVariant, SelectedCustomization, CartItem, Order, OrderStatus, PaymentStatus, AppNotification } from './types';
import { playChime, triggerHaptic } from './utils/soundAndNotifications';
import { ordersService } from './services/ordersService';

export default function App() {
  // Navigation view: 'splash' (Portada) or 'catalog'
  const [view, setView] = useState<'splash' | 'catalog'>('splash');
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');

  // Dark / Light Mode with localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('tentaciones_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('tentaciones_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('tentaciones_theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  // Products state (persisted in localStorage for Admin inventory edits, strictly from official carta)
  const [products, setProducts] = useState<Product[]>(() => {
    // Purge old cache with previous wrong image paths
    localStorage.removeItem('tentaciones_products');
    localStorage.removeItem('tentaciones_products_v2');
    localStorage.removeItem('tentaciones_products_carta_v3');
    localStorage.removeItem('tentaciones_products_carta_v4');
    localStorage.removeItem('tentaciones_products_carta_v5');

    const saved = localStorage.getItem('tentaciones_products_carta_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => ({
            ...p,
            image: p.image
              .replace('/public/assets/images/', '/images/')
              .replace('/src/assets/images/', '/images/'),
          }));
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_PRODUCTS;
  });

  useEffect(() => {
    localStorage.setItem('tentaciones_products_carta_v6', JSON.stringify(products));
  }, [products]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('tentaciones_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('tentaciones_orders', JSON.stringify(orders));
  }, [orders]);

  // Load orders from persistent backend database on startup
  useEffect(() => {
    let isMounted = true;
    ordersService.getAllOrders().then((backendOrders) => {
      if (isMounted && Array.isArray(backendOrders) && backendOrders.length > 0) {
        setOrders(backendOrders);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('tentaciones_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return ['pos-1', 'bat-power', 'ens-verd-fit'];
  });

  useEffect(() => {
    localStorage.setItem('tentaciones_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.includes(product.id);
      triggerHaptic('light');
      if (exists) {
        return prev.filter((id) => id !== product.id);
      } else {
        showNotification({
          id: `fav-${Date.now()}`,
          title: 'Agregado a Favoritos ❤️',
          message: `${product.name} se guardó en tu lista.`,
          type: 'promo',
          timestamp: 'Ahora',
          read: false,
        });
        return [...prev, product.id];
      }
    });
  };

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tentaciones_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tentaciones_cart', JSON.stringify(cart));
  }, [cart]);

  // Notification state
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const showNotification = (notif: AppNotification) => {
    setNotification(notif);
    playChime('alert');
    triggerHaptic('medium');
    setTimeout(() => {
      setNotification((curr) => (curr?.id === notif.id ? null : curr));
    }, 4500);
  };


  // Cart items count map for quick badges on cards
  const cartItemsMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const it of cart) {
      map[it.productId] = (map[it.productId] || 0) + it.quantity;
    }
    return map;
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.quantity, 0);
  }, [cart]);

  // Modals
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFlyersPopupOpen, setIsFlyersPopupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Order Lunch Special (Almuerzo Saludable de los Flyers)
  const handleOrderLunchSpecial = (lunch: LunchSpecialOption) => {
    const newItem: CartItem = {
      cartItemId: `lunch-${lunch.id}-${Date.now()}`,
      productId: lunch.id,
      name: lunch.name,
      basePrice: lunch.price,
      unitPrice: lunch.price,
      selectedCustomizations: [
        {
          customizationId: 'lunch-includes',
          optionId: 'includes-combo',
          name: 'Incluye: Mazamorra light + Ensalada de verdura + Refresco natural',
          priceDelta: 0,
        },
      ],
      quantity: 1,
      image: lunch.image,
    };

    setCart((prev) => {
      const existing = prev.find((it) => it.productId === lunch.id);
      if (existing) {
        return prev.map((it) => (it.productId === lunch.id ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [...prev, newItem];
    });

    playChime('add');
    triggerHaptic('medium');

    showNotification({
      id: `lunch-cart-${Date.now()}`,
      title: '¡Almuerzo Fit Agregado! 🍱',
      message: `${lunch.title} (S/ ${lunch.price.toFixed(2)}) con mazamorra light, ensalada y refresco.`,
      type: 'cart',
      timestamp: 'Ahora',
      read: false,
    });
  };

  // Quick Add from ProductCard
  const handleQuickAdd = (product: Product, variant?: ProductVariant) => {
    const effectiveVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : undefined);
    const unitPrice = product.price + (effectiveVariant ? effectiveVariant.priceDelta : 0);

    const existingIndex = cart.findIndex(
      (it) => it.productId === product.id && it.selectedVariant?.id === effectiveVariant?.id && it.selectedCustomizations.length === 0
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        name: product.name,
        basePrice: product.price,
        unitPrice,
        selectedVariant: effectiveVariant,
        selectedCustomizations: [],
        quantity: 1,
        image: product.image,
      };
      setCart([...cart, newItem]);
    }

    playChime('add');
    triggerHaptic('light');

    showNotification({
      id: `cart-${Date.now()}`,
      title: '¡Agregado al carrito!',
      message: `${product.name} (S/ ${unitPrice.toFixed(2)})`,
      type: 'cart',
      timestamp: 'Ahora',
      read: false,
    });
  };

  const handleQuickDecrease = (product: Product) => {
    const existingIndex = cart.findIndex((it) => it.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      if (updated[existingIndex].quantity > 1) {
        updated[existingIndex].quantity -= 1;
        setCart(updated);
      } else {
        updated.splice(existingIndex, 1);
        setCart(updated);
      }
      playChime('add');
      triggerHaptic('light');
    }
  };

  // Add from Detail Modal with full customizations & notes
  const handleAddToCartFromModal = (
    product: Product,
    variant: ProductVariant | undefined,
    customizations: SelectedCustomization[],
    quantity: number,
    notes: string
  ) => {
    const variantDelta = variant ? variant.priceDelta : 0;
    const custDelta = customizations.reduce((acc, c) => acc + c.priceDelta, 0);
    const unitPrice = product.price + variantDelta + custDelta;

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      unitPrice,
      selectedVariant: variant,
      selectedCustomizations: customizations,
      quantity,
      notes,
      image: product.image,
    };

    setCart([...cart, newItem]);
    playChime('add');
    triggerHaptic('medium');

    showNotification({
      id: `cart-modal-${Date.now()}`,
      title: '¡Producto añadido al pedido!',
      message: `${quantity}x ${product.name}`,
      type: 'cart',
      timestamp: 'Ahora',
      read: false,
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((it) => it.cartItemId !== cartItemId));
    } else {
      setCart(cart.map((it) => (it.cartItemId === cartItemId ? { ...it, quantity: newQuantity } : it)));
    }
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(cart.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Order created handler
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Save permanently in the backend database (survives clearing local storage or changing browser)
    ordersService.saveOrder(newOrder);

    showNotification({
      id: `ord-new-${Date.now()}`,
      title: '¡Pedido Registrado con Éxito! 🎉',
      message: `Tu pedido #${newOrder.orderNumber} ha sido guardado permanentemente y enviado a WhatsApp.`,
      type: 'order',
      timestamp: 'Ahora',
      read: false,
    });
  };

  // Admin order status update
  const handleAdminUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    // Persist status update in backend database
    ordersService.updateStatus(orderId, newStatus);

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          statusHistory: [
            ...o.statusHistory,
            { status: newStatus, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          ],
        };
      }
      return o;
    });
    setOrders(updated);

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const statusLabels = {
        recibido: 'Recibido',
        preparando: 'En Preparación 🥗',
        en_camino: '¡En Camino en Moto! 🛵',
        entregado: '¡Entregado con Éxito! ✓',
      };
      showNotification({
        id: `push-status-${Date.now()}`,
        title: `Actualización Pedido #${targetOrder.orderNumber}`,
        message: `Tu pedido ha cambiado al estado: ${statusLabels[newStatus]}`,
        type: 'order',
        timestamp: 'Ahora',
        read: false,
      });
    }
  };

  // Admin payment status update ('pendiente' | 'pagado')
  const handleAdminUpdatePaymentStatus = (orderId: string, newPaymentStatus: PaymentStatus) => {
    ordersService.updatePaymentStatus(orderId, newPaymentStatus);

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: newPaymentStatus,
        };
      }
      return o;
    });
    setOrders(updated);

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      showNotification({
        id: `pay-status-${Date.now()}`,
        title: `Pago Pedido #${targetOrder.orderNumber}`,
        message: newPaymentStatus === 'pagado' ? '✅ Pago marcado como VERIFICADO' : '⏳ Pago marcado como PENDIENTE',
        type: 'info',
        timestamp: 'Ahora',
        read: false,
      });
    }
  };

  // Refresh orders from server
  const handleRefreshOrders = async () => {
    const fresh = await ordersService.getAllOrders();
    if (fresh && fresh.length > 0) {
      setOrders(fresh);
    }
  };

  // Admin Product CRUD handlers
  const handleAdminAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    showNotification({
      id: `prod-add-${Date.now()}`,
      title: '¡Nuevo Producto Creado! ✨',
      message: `${newProd.name} se agregó al catálogo.`,
      type: 'info',
      timestamp: 'Ahora',
      read: false,
    });
  };

  const handleAdminUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showNotification({
      id: `prod-upd-${Date.now()}`,
      title: 'Inventario Actualizado 📝',
      message: `${updated.name} actualizado (S/ ${updated.price.toFixed(2)}).`,
      type: 'info',
      timestamp: 'Ahora',
      read: false,
    });
  };

  const handleAdminDeleteProduct = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification({
      id: `prod-del-${Date.now()}`,
      title: 'Producto Eliminado 🗑️',
      message: `${target?.name || 'Producto'} fue eliminado del catálogo.`,
      type: 'info',
      timestamp: 'Ahora',
      read: false,
    });
  };

  const handleResetData = () => {
    localStorage.removeItem('tentaciones_products');
    localStorage.removeItem('tentaciones_products_carta_v4');
    localStorage.removeItem('tentaciones_orders');
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    showNotification({
      id: `reset-${Date.now()}`,
      title: 'Datos Restablecidos',
      message: 'Se cargaron los productos y pedidos originales del catálogo.',
      type: 'info',
      timestamp: 'Ahora',
      read: false,
    });
  };

  // Enter catalog handler from splash
  const handleEnterCatalog = (category?: ProductCategory) => {
    if (category && category !== 'todos') {
      setSelectedCategory(category);
      setActiveTab('explorar');
    } else {
      setSelectedCategory('todos');
      setActiveTab('inicio');
    }
    setView('catalog');
    setIsFlyersPopupOpen(true); // Pop-up with the 2 flyers of food opens immediately!
    playChime('add');
    triggerHaptic('light');
  };

  return (
    <div className="min-h-screen w-full bg-neutral-100 dark:bg-neutral-950 flex flex-col items-center justify-start text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Toast Notification Banner */}
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />

      {/* VIEW 1: PORTADA / SPLASH SCREEN */}
      {view === 'splash' && (
        <div className="w-full min-h-screen max-w-xl mx-auto flex flex-col bg-white dark:bg-neutral-900 shadow-xl sm:border-x border-neutral-200/60 dark:border-neutral-800">
          <SplashScreen
            onEnterCatalog={handleEnterCatalog}
            onOpenMenuBoard={() => setIsFlyersPopupOpen(true)}
          />
        </div>
      )}

      {/* VIEW 2: FULL MOBILE APP CONTAINER (CATALOG) */}
      {view === 'catalog' && (
        <div className="w-full min-h-screen max-w-xl mx-auto flex flex-col bg-white dark:bg-neutral-900 shadow-xl sm:border-x border-neutral-200/60 dark:border-neutral-800 relative">
          {/* Header with Return-to-Portada button & Controls */}
          <Header
            onReturnToSplash={() => setView('splash')}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            cartCount={totalCartCount}
            isDark={isDark}
            onToggleDark={toggleDarkMode}
          />

            {/* Main Tabs Container */}
            <main className="flex-1 w-full overflow-x-hidden">
              {activeTab === 'inicio' && (
                <HomeTab
                  products={products}
                  cartItemsMap={cartItemsMap}
                  onQuickAdd={handleQuickAdd}
                  onQuickDecrease={handleQuickDecrease}
                  onOpenDetail={(p) => setSelectedProductDetail(p)}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setActiveTab('explorar');
                  }}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onOpenFlyers={() => setIsFlyersPopupOpen(true)}
                />
              )}

              {activeTab === 'explorar' && (
                <ExploreTab
                  products={products}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  cartItemsMap={cartItemsMap}
                  onQuickAdd={handleQuickAdd}
                  onQuickDecrease={handleQuickDecrease}
                  onOpenDetail={(p) => setSelectedProductDetail(p)}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}

              {activeTab === 'favoritos' && (
                <FavoritesTab
                  products={products}
                  favoriteIds={favorites}
                  cartItemsMap={cartItemsMap}
                  onQuickAdd={handleQuickAdd}
                  onQuickDecrease={handleQuickDecrease}
                  onOpenDetail={(p) => setSelectedProductDetail(p)}
                  onToggleFavorite={toggleFavorite}
                  onGoToCatalog={() => setActiveTab('inicio')}
                />
              )}
            </main>

            {/* Floating Bottom Cart Bar */}
            <FloatingCartBar
              items={cart}
              onOpenCart={() => setIsCartOpen(true)}
            />

            {/* Fixed Bottom Navigation */}
            <BottomNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                if (tab === 'carrito') {
                  setIsCartOpen(true);
                } else {
                  setActiveTab(tab);
                }
              }}
              cartCount={totalCartCount}
              favoritesCount={favorites.length}
              onOpenCart={() => setIsCartOpen(true)}
            />
          </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCartFromModal}
        isFavorite={selectedProductDetail ? favorites.includes(selectedProductDetail.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Checkout Drawer (Slide-up) */}
      <CheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
      />

      {/* Almuerzo Saludable Food Promo Pop-up Modal */}
      <FlyersPopupModal
        isOpen={isFlyersPopupOpen}
        onClose={() => setIsFlyersPopupOpen(false)}
        onOrderLunchSpecial={handleOrderLunchSpecial}
      />

      {/* Store Administration Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAdminAddProduct}
        onUpdateProduct={handleAdminUpdateProduct}
        onDeleteProduct={handleAdminDeleteProduct}
        orders={orders}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onUpdatePaymentStatus={handleAdminUpdatePaymentStatus}
        onRefreshOrders={handleRefreshOrders}
        onSendPushNotification={(title, msg) => {
          showNotification({
            id: `admin-push-${Date.now()}`,
            title,
            message: msg,
            type: 'promo',
            timestamp: 'Ahora',
            read: false,
          });
          setIsAdminOpen(false);
        }}
        onResetData={handleResetData}
      />
    </div>
  );
}
