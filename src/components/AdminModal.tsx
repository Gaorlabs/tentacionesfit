import React, { useState, useMemo } from 'react';
import {
  X,
  Package,
  ReceiptText,
  TrendingUp,
  Bell,
  Check,
  Truck,
  CookingPot,
  Clock,
  CheckCircle2,
  Edit2,
  DollarSign,
  Download,
  RotateCcw,
  Search,
  Phone,
  MessageCircle,
  Copy,
  AlertCircle,
  RefreshCw,
  MapPin,
  ChevronRight,
  Filter,
  CheckCheck,
  Flame,
  ChefHat,
  Bike,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, Order, OrderStatus, PaymentStatus, ProductCategory } from '../types';
import { CATEGORIES_LIST } from '../data/menuData';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct?: (newProduct: Product) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct?: (productId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: PaymentStatus) => void;
  onRefreshOrders?: () => Promise<void>;
  onSendPushNotification: (title: string, message: string) => void;
  onResetData: () => void;
}

// Preset healthy product image URLs
const IMAGE_PRESETS = [
  { name: 'Selva Negra Fit', url: '/src/assets/images/postre_fit_selva_negra_1794251504712.jpg' },
  { name: 'Tres Leches Proteico', url: '/src/assets/images/postre_fit_tres_leches_1794251518596.jpg' },
  { name: 'Cheesecake Fit', url: '/src/assets/images/postre_fit_cheesecake_1794251535496.jpg' },
  { name: 'Batido Proteico Power', url: '/src/assets/images/batido_proteico_power_1794251554625.jpg' },
  { name: 'Jugo Natural Detox', url: '/src/assets/images/jugo_natural_detox_1794251571477.jpg' },
  { name: 'Ensalada Verde Proteica', url: '/src/assets/images/ensalada_verde_proteica_1794251586716.jpg' },
  { name: 'Frappe Proteico Mocha', url: '/src/assets/images/frappe_proteico_mocha_1794251603517.jpg' },
  { name: 'Cremolada Natural Maracuyá', url: '/src/assets/images/cremolada_natural_maracuya_1794251621217.jpg' },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onRefreshOrders,
  onSendPushNotification,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'stats' | 'push'>('orders');

  // Orders filters
  const [orderFilter, setOrderFilter] = useState<'todos' | 'recibido' | 'preparando' | 'en_camino' | 'entregado' | 'unpaid'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'todos' | 'yape' | 'bcp' | 'efectivo'>('todos');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Inventory filter
  const [inventoryCategory, setInventoryCategory] = useState<ProductCategory>('todos');
  const [inventorySearch, setInventorySearch] = useState('');

  // Product CRUD Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Push notifications
  const [customPushTitle, setCustomPushTitle] = useState('🛵 ¡Tu pedido va en camino!');
  const [customPushMsg, setCustomPushMsg] = useState('El motorizado de Tentaciones Fit está llegando a tu dirección.');

  // KPI Analytics
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const countRecibido = orders.filter((o) => o.status === 'recibido').length;
  const countPreparando = orders.filter((o) => o.status === 'preparando').length;
  const countEnCamino = orders.filter((o) => o.status === 'en_camino').length;
  const countEntregado = orders.filter((o) => o.status === 'entregado').length;
  const countUnpaid = orders.filter((o) => (o.paymentStatus || 'pendiente') === 'pendiente').length;
  const avgTicket = orders.length > 0 ? totalSales / orders.length : 0;

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter
      if (orderFilter === 'unpaid') {
        if ((ord.paymentStatus || 'pendiente') !== 'pendiente') return false;
      } else if (orderFilter !== 'todos') {
        if (ord.status !== orderFilter) return false;
      }

      // Payment method filter
      if (paymentFilter !== 'todos' && ord.paymentMethod !== paymentFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNum = ord.orderNumber.toLowerCase().includes(q);
        const matchesName = ord.customer.name.toLowerCase().includes(q);
        const matchesPhone = ord.customer.phone.toLowerCase().includes(q);
        const matchesAddr = (ord.customer.address || '').toLowerCase().includes(q);
        return matchesNum || matchesName || matchesPhone || matchesAddr;
      }

      return true;
    });
  }, [orders, orderFilter, paymentFilter, searchQuery]);

  // Inventory filtered
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (inventoryCategory !== 'todos' && p.category !== inventoryCategory) {
        return false;
      }
      if (inventorySearch.trim()) {
        return p.name.toLowerCase().includes(inventorySearch.toLowerCase().trim());
      }
      return true;
    });
  }, [products, inventoryCategory, inventorySearch]);

  if (!isOpen) return null;

  const handleManualRefresh = async () => {
    if (!onRefreshOrders) return;
    setIsRefreshing(true);
    try {
      await onRefreshOrders();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleOpenCreateProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      category: 'postres',
      price: 15.0,
      description: '',
      image: IMAGE_PRESETS[0].url,
      rating: 5,
      reviewsCount: 0,
      inStock: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
    setIsProductModalOpen(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;

    const fullProd: Product = {
      id: editingProduct.id || `prod-${Date.now()}`,
      name: editingProduct.name.trim(),
      category: editingProduct.category || 'postres',
      price: Number(editingProduct.price) || 0,
      description: editingProduct.description?.trim() || '',
      image: editingProduct.image || IMAGE_PRESETS[0].url,
      rating: editingProduct.rating || 5,
      reviewsCount: editingProduct.reviewsCount || 0,
      inStock: editingProduct.inStock ?? true,
      variants: editingProduct.variants,
      customizations: editingProduct.customizations,
    };

    const exists = products.some((p) => p.id === fullProd.id);
    if (!exists && onAddProduct) {
      onAddProduct(fullProd);
    } else {
      onUpdateProduct(fullProd);
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProductClick = (p: Product) => {
    if (confirm(`¿Estás seguro de eliminar "${p.name}" del catálogo?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(p.id);
      } else {
        onUpdateProduct({ ...p, inStock: false });
      }
    }
  };

  const handleToggleStock = (p: Product) => {
    onUpdateProduct({ ...p, inStock: !p.inStock });
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = ['ID', 'Fecha', 'Cliente', 'Telefono', 'Direccion', 'Total', 'Estado', 'Pago_Estado', 'MetodoPago'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.date}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address || ''}"`,
      o.total.toFixed(2),
      o.status,
      o.paymentStatus || 'pendiente',
      o.paymentMethod,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tentaciones_fit_pedidos_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Comanda Slip for kitchen/courier
  const handleCopyComanda = (ord: Order) => {
    const itemsList = ord.items
      .map((it) => `• ${it.quantity}x ${it.name} ${it.selectedVariant ? `(${it.selectedVariant.name})` : ''} ${it.notes ? `[Nota: ${it.notes}]` : ''}`)
      .join('\n');

    const comandaText =
      `📋 *COMANDA COCINA / DESPACHO - TENTACIONES FIT*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🧾 Pedido: #${ord.orderNumber}\n` +
      `🕒 Fecha/Hora: ${ord.date}\n` +
      `👤 Cliente: ${ord.customer.name}\n` +
      `📱 Teléfono: ${ord.customer.phone}\n` +
      `📍 Dirección: ${ord.customer.address}\n` +
      (ord.customer.reference ? `📌 Ref: ${ord.customer.reference}\n` : '') +
      `💳 Método de Pago: ${ord.paymentMethod.toUpperCase()} (${(ord.paymentStatus || 'pendiente').toUpperCase()})\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🍱 PLATOS:\n${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 TOTAL: S/ ${ord.total.toFixed(2)}`;

    navigator.clipboard.writeText(comandaText);
    setCopiedOrderId(ord.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Open direct WhatsApp chat with the customer
  const handleOpenClientWhatsApp = (ord: Order) => {
    const cleanPhone = ord.customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

    let msg = `¡Hola ${ord.customer.name}! Te saludamos de *Tentaciones Fit* 🥗\n`;
    if (ord.status === 'recibido') {
      msg += `Confirmamos la recepción de tu pedido *#${ord.orderNumber}*. En breve iniciamos su preparación con ingredientes frescos.`;
    } else if (ord.status === 'preparando') {
      msg += `Tu pedido *#${ord.orderNumber}* ya se encuentra en preparación en nuestra cocina fit 🍳`;
    } else if (ord.status === 'en_camino') {
      msg += `¡Tu pedido *#${ord.orderNumber}* ya salió en camino con nuestro motorizado a tu dirección! 🛵💨`;
    } else if (ord.status === 'entregado') {
      msg += `Tu pedido *#${ord.orderNumber}* figura como entregado. ¡Esperamos que lo disfrutes mucho! ✨`;
    }

    if ((ord.paymentStatus || 'pendiente') === 'pendiente' && ord.paymentMethod !== 'efectivo') {
      msg += `\n\n📌 *Nota de Pago:* Por favor no olvides adjuntar tu comprobante de ${ord.paymentMethod.toUpperCase()} para validar tu pedido.`;
    }

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] max-w-4xl bg-neutral-100 dark:bg-neutral-950 sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800">
        
        {/* NATIVE APP STYLE TOPBAR (Sticky) */}
        <header className="px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shrink-0 shadow-2xs z-30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all"
              title="Volver al Catálogo de Productos"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo</span>
            </button>
            <div className="hidden sm:block">
              <h2 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 tracking-tight">
                Panel de Administración
              </h2>
              <p className="text-[10px] text-neutral-500">
                Tentaciones Fit · Gestión Operativa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Refresh button */}
            <button
              onClick={handleManualRefresh}
              title="Sincronizar pedidos con el backend"
              className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* CSV export */}
            <button
              onClick={exportOrdersCSV}
              title="Exportar pedidos en CSV"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              title="Cerrar Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* PRIMARY EXECUTIVE KPI CARDS RIBBON */}
        <div className="px-4 py-2.5 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Ventas Totales
            </p>
            <p className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              S/ {totalSales.toFixed(2)}
            </p>
            <p className="text-[9px] text-emerald-600/80">Ticket prom: S/ {avgTicket.toFixed(2)}</p>
          </div>

          <div
            onClick={() => { setActiveTab('orders'); setOrderFilter('recibido'); }}
            className={`p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
              orderFilter === 'recibido'
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 shadow-2xs'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/60 dark:border-amber-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Nuevos
              </p>
              {countRecibido > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
            </div>
            <p className="text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-400 font-mono">
              {countRecibido}
            </p>
            <p className="text-[9px] text-amber-600/80">Por atender</p>
          </div>

          <div
            onClick={() => { setActiveTab('orders'); setOrderFilter('preparando'); }}
            className={`p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
              orderFilter === 'preparando'
                ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 shadow-2xs'
                : 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/40'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              En Cocina
            </p>
            <p className="text-base sm:text-lg font-extrabold text-blue-700 dark:text-blue-400 font-mono">
              {countPreparando}
            </p>
            <p className="text-[9px] text-blue-600/80">En preparación</p>
          </div>

          <div
            onClick={() => { setActiveTab('orders'); setOrderFilter('en_camino'); }}
            className={`p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
              orderFilter === 'en_camino'
                ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 shadow-2xs'
                : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-900/40'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              En Ruta
            </p>
            <p className="text-base sm:text-lg font-extrabold text-purple-700 dark:text-purple-400 font-mono">
              {countEnCamino}
            </p>
            <p className="text-[9px] text-purple-600/80">Motorizado despachado</p>
          </div>

          <div
            onClick={() => { setActiveTab('orders'); setOrderFilter('unpaid'); }}
            className={`col-span-2 sm:col-span-1 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all ${
              orderFilter === 'unpaid'
                ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-400 shadow-2xs'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40'
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Pagos x Verificar
            </p>
            <p className="text-base sm:text-lg font-extrabold text-rose-700 dark:text-rose-400 font-mono">
              {countUnpaid}
            </p>
            <p className="text-[9px] text-rose-600/80">Revisar voucher</p>
          </div>
        </div>

        {/* MAIN NAVIGATION TABS (Sticky) */}
        <div className="sticky top-0 z-20 flex border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Gestión de Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario & Precios ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Métricas & Reportes</span>
          </button>

          <button
            onClick={() => setActiveTab('push')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'push'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notificaciones Push</span>
          </button>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
          
          {/* TAB 1: OPERATIONAL ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {/* Filter controls row */}
              <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5 shadow-2xs">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por #TF-XXXX, cliente, teléfono, dirección..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-emerald-600 text-neutral-900 dark:text-neutral-100"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Segmented Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { id: 'todos', label: 'Todos', count: orders.length },
                    { id: 'recibido', label: 'Nuevos', count: countRecibido },
                    { id: 'preparando', label: 'En Cocina', count: countPreparando },
                    { id: 'en_camino', label: 'En Ruta', count: countEnCamino },
                    { id: 'entregado', label: 'Entregados', count: countEntregado },
                    { id: 'unpaid', label: 'Por Cobrar', count: countUnpaid },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setOrderFilter(st.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        orderFilter === st.id
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        orderFilter === st.id
                          ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                      }`}>
                        {st.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Secondary: Payment filter */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400 text-[11px] font-medium flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    <span>Método de pago:</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {(['todos', 'yape', 'bcp', 'efectivo'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentFilter(method)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          paymentFilter === method
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {filteredOrders.length === 0 && (
                <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl text-center space-y-2 border border-neutral-200/80 dark:border-neutral-800">
                  <ReceiptText className="w-8 h-8 mx-auto text-neutral-400" />
                  <p className="font-extrabold text-sm text-neutral-700 dark:text-neutral-300">
                    No se encontraron pedidos con este filtro
                  </p>
                  <p className="text-xs text-neutral-400">
                    Prueba cambiando el estado o buscando con otro término.
                  </p>
                  <button
                    onClick={() => { setOrderFilter('todos'); setSearchQuery(''); setPaymentFilter('todos'); }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200"
                  >
                    Ver todos los pedidos
                  </button>
                </div>
              )}

              {/* ORDERS LIST */}
              {filteredOrders.map((ord) => {
                const isPaid = (ord.paymentStatus || 'pendiente') === 'pagado';
                const statusStyles = {
                  recibido: {
                    label: 'Recibido',
                    badgeBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
                    nextAction: 'preparando' as OrderStatus,
                    nextActionLabel: 'Iniciar Preparación',
                    nextActionIcon: CookingPot,
                    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
                  },
                  preparando: {
                    label: 'En Preparación',
                    badgeBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800',
                    nextAction: 'en_camino' as OrderStatus,
                    nextActionLabel: 'Despachar en Moto',
                    nextActionIcon: Truck,
                    btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
                  },
                  en_camino: {
                    label: 'En Camino',
                    badgeBg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800',
                    nextAction: 'entregado' as OrderStatus,
                    nextActionLabel: 'Confirmar Entrega',
                    nextActionIcon: CheckCircle2,
                    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                  },
                  entregado: {
                    label: 'Entregado',
                    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
                    nextAction: null,
                    nextActionLabel: 'Completado',
                    nextActionIcon: Check,
                    btnBg: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 cursor-default',
                  },
                }[ord.status] || {
                  label: ord.status,
                  badgeBg: 'bg-neutral-100 text-neutral-700',
                  nextAction: null,
                  nextActionLabel: 'Completado',
                  nextActionIcon: Check,
                  btnBg: 'bg-neutral-200',
                };

                return (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 space-y-3 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                  >
                    {/* ORDER CARD HEADER: Number, Date, Status, Payment Toggle, Total */}
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-black text-neutral-900 dark:text-white">
                            #{ord.orderNumber}
                          </span>

                          {/* Operational Status Pill */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusStyles.badgeBg}`}>
                            {statusStyles.label}
                          </span>

                          {/* Payment Status Interactive Toggle */}
                          <button
                            onClick={() => onUpdatePaymentStatus(ord.id, isPaid ? 'pendiente' : 'pagado')}
                            title="Haz clic para cambiar el estado de pago"
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border transition-all active:scale-95 ${
                              isPaid
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {isPaid ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-rose-600" />}
                            <span>{isPaid ? 'PAGADO ✓' : 'POR COBRAR'}</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-neutral-400">
                          {ord.date} · Método: <strong className="uppercase text-neutral-700 dark:text-neutral-300">{ord.paymentMethod}</strong>
                        </p>
                      </div>

                      {/* Total Amount */}
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-neutral-400">Total a Cobrar</p>
                        <p className="font-mono text-lg font-black text-emerald-700 dark:text-emerald-400">
                          S/ {ord.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* CUSTOMER & DISPATCH DATA */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-neutral-50 dark:bg-neutral-850 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div>
                        <p className="font-extrabold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>👤 {ord.customer.name}</span>
                          <a
                            href={`tel:${ord.customer.phone}`}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Llamar</span>
                          </a>
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          📱 {ord.customer.phone}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                          📍 {ord.customer.address}
                        </p>
                        {ord.customer.reference && (
                          <p className="text-[10px] text-neutral-400 italic mt-0.5">
                            Ref: {ord.customer.reference}
                          </p>
                        )}
                        {ord.paymentMethod === 'efectivo' && ord.cashAmountNeeded && (
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                            💵 Paga con: S/ {ord.cashAmountNeeded.toFixed(2)} (Llevar vuelto S/ {(ord.cashAmountNeeded - ord.total).toFixed(2)})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ORDER ITEMS BREAKDOWN */}
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] uppercase font-extrabold text-neutral-400 tracking-wider">
                        Detalle del Pedido ({ord.items.reduce((s, i) => s + i.quantity, 0)} productos):
                      </p>
                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                {it.quantity}x {it.name}
                              </span>
                              {it.selectedVariant && (
                                <span className="text-[10px] text-neutral-500 ml-1.5 font-medium">
                                  ({it.selectedVariant.name})
                                </span>
                              )}
                              {it.notes && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400 ml-1.5 italic">
                                  [Nota: {it.notes}]
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300 shrink-0">
                              S/ {(it.unitPrice * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OPERATIONAL WORKFLOW ACTION BUTTONS */}
                    <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenClientWhatsApp(ord)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-white" />
                          <span>WhatsApp Cliente</span>
                        </button>

                        <button
                          onClick={() => handleCopyComanda(ord)}
                          title="Copiar comanda para cocina o motorizado"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
                        >
                          {copiedOrderId === ord.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedOrderId === ord.id ? '¡Copiada!' : 'Comanda'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {statusStyles.nextAction && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, statusStyles.nextAction!)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all ${statusStyles.btnBg}`}
                          >
                            <statusStyles.nextActionIcon className="w-3.5 h-3.5" />
                            <span>{statusStyles.nextActionLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-xl">
                          {(['recibido', 'preparando', 'en_camino', 'entregado'] as OrderStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => onUpdateOrderStatus(ord.id, st)}
                              title={`Cambiar a ${st}`}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                ord.status === st
                                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
                                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                              }`}
                            >
                              {st === 'recibido' ? 'Nuevo' : st === 'preparando' ? 'Cocina' : st === 'en_camino' ? 'Ruta' : 'OK'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: INVENTORY & PRODUCT CRUD */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              {/* Category Filter & Search */}
              <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Buscar plato o bebida en inventario..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Big CTA for Create Product */}
                  <button
                    onClick={handleOpenCreateProduct}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1 shrink-0 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nuevo Producto</span>
                    <span className="sm:hidden">Crear</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                  {CATEGORIES_LIST.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setInventoryCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        inventoryCategory === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products list */}
              <div className="space-y-2">
                {filteredProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                            {p.name}
                          </h4>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {p.inStock ? 'En Stock' : 'Agotado'}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 line-clamp-1">{p.description}</p>
                        <p className="text-[9px] text-neutral-400 font-mono uppercase mt-0.5">Cat: {p.category}</p>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="font-mono text-xs font-extrabold text-emerald-700 dark:text-emerald-400 block">
                            S/ {p.price.toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1.5 justify-end mt-1">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-0.5 hover:bg-emerald-100 transition-colors"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProductClick(p)}
                              className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-0.5 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Borrar</span>
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleStock(p)}
                          title={p.inStock ? 'Marcar como agotado' : 'Marcar en stock'}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            p.inStock
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-neutral-200'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {p.inStock ? 'Agotar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: STATS & REPORTS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400 font-bold uppercase">Facturación Total</p>
                  <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                    S/ {totalSales.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Acumulado en {orders.length} pedidos</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400 font-bold uppercase">Ticket Promedio</p>
                  <p className="text-2xl font-black font-mono text-blue-700 dark:text-blue-400 mt-1">
                    S/ {avgTicket.toFixed(2)}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">Gasto medio por cliente</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-400 font-bold uppercase">Tasa de Entrega</p>
                  <p className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400 mt-1">
                    {orders.length > 0 ? Math.round((countEntregado / orders.length) * 100) : 100}%
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">{countEntregado} completados con éxito</p>
                </div>
              </div>

              {/* Payment methods breakdown */}
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Desglose por Métodos de Pago
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['yape', 'bcp', 'efectivo'] as const).map((method) => {
                    const methodOrders = orders.filter((o) => o.paymentMethod === method);
                    const methodTotal = methodOrders.reduce((s, o) => s + o.total, 0);
                    return (
                      <div key={method} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800">
                        <p className="font-bold text-xs uppercase text-neutral-900 dark:text-white">{method}</p>
                        <p className="font-mono text-base font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
                          S/ {methodTotal.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-neutral-500">{methodOrders.length} transacciones</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Factory reset option */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-rose-900 dark:text-rose-200">Restablecer datos originales</h4>
                  <p className="text-[10px] text-rose-700 dark:text-rose-300">Recarga el inventario inicial de la carta oficial.</p>
                </div>
                <button
                  onClick={onResetData}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                >
                  Restablecer
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PUSH NOTIFICATIONS */}
          {activeTab === 'push' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Envío de Notificaciones Push Masivas
                </h4>
                <p className="text-xs text-neutral-500">
                  Envía alertas en tiempo real a todos los clientes que tengan la app abierta.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Título de la Alerta:
                  </label>
                  <input
                    type="text"
                    value={customPushTitle}
                    onChange={(e) => setCustomPushTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-neutral-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Mensaje de la Alerta:
                  </label>
                  <textarea
                    rows={3}
                    value={customPushMsg}
                    onChange={(e) => setCustomPushMsg(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-neutral-900 dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <button
                  onClick={() => onSendPushNotification(customPushTitle, customPushMsg)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Disparar Notificación Push a Usuarios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT DIALOG MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{products.some((p) => p.id === editingProduct.id) ? 'Editar Producto' : 'Crear Nuevo Producto'}</span>
              </h3>
              <button
                onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="Ej. Cheescake Proteico de Arándanos"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-emerald-600"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Categoría *
                  </label>
                  <select
                    value={editingProduct.category || 'postres'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-emerald-600"
                  >
                    {CATEGORIES_LIST.filter((c) => c.id !== 'todos').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingProduct.price ?? 15.0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    placeholder="15.00"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono font-bold focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Descripción Corta
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Ej. Base de avena, queso crema light y proteína iso whey."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-emerald-600 resize-none"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Imagen del Producto:</span>
                </label>
                <input
                  type="text"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="Ruta o URL de imagen..."
                  className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-emerald-600 mb-1.5"
                />
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                  {IMAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, image: preset.url })}
                      className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-[10px] font-medium whitespace-nowrap border border-neutral-200 dark:border-neutral-700"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Disponibilidad en Stock:
                </span>
                <button
                  type="button"
                  onClick={() => setEditingProduct({ ...editingProduct, inStock: !editingProduct.inStock })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    editingProduct.inStock
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {editingProduct.inStock ? 'EN STOCK ✓' : 'AGOTADO'}
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
