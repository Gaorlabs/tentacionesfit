import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Copy,
  ArrowLeft,
  Truck,
  MessageCircle,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CustomerInfo, PaymentMethod, Order } from '../types';
import { VALID_COUPONS, BUSINESS_INFO } from '../data/menuData';
import { playChime, triggerHaptic } from '../utils/soundAndNotifications';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}) => {
  // Step 1: 'cart' (review items), Step 2: 'checkout' (written address + Yape/BCP payment info)
  const [step, setStep] = useState<'cart' | 'checkout'>(items.length > 0 ? 'cart' : 'cart');

  // Customer form state (address is completely written, NO DROPDOWNS OR SELECTION)
  const [customer, setCustomer] = useState<CustomerInfo>(() => {
    const saved = localStorage.getItem('tentaciones_customer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          reference: parsed.reference || '',
        };
      } catch {
        // fallback
      }
    }
    return {
      name: '',
      phone: '',
      address: '',
      reference: '',
    };
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    amount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [cashAmountNeeded, setCashAmountNeeded] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculations
  const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const deliveryFee = 0; // Coordination via WhatsApp / Free
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const clean = couponCode.trim().toUpperCase();
    const found = VALID_COUPONS.find((c) => c.code === clean);
    if (!found) {
      setCouponError('Cupón inválido. Prueba con FIT10 o TENTACIONES');
      return;
    }
    if (subtotal < found.minOrder) {
      setCouponError(`Este cupón requiere un pedido mínimo de S/ ${found.minOrder}`);
      return;
    }
    const discountVal = (subtotal * found.discountPercent) / 100;
    setAppliedCoupon({
      code: found.code,
      discountPercent: found.discountPercent,
      amount: discountVal,
    });
    playChime('success');
    triggerHaptic('light');
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    playChime('add');
    triggerHaptic('light');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; phone?: string; address?: string } = {};
    if (!customer.name.trim()) errors.name = 'Por favor escribe tu nombre y apellido.';
    if (!customer.phone.trim()) errors.phone = 'Por favor escribe tu número de teléfono o WhatsApp.';
    if (!customer.address.trim()) errors.address = 'Por favor escribe tu dirección completa de entrega.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate structured WhatsApp message for the business
  const generateWhatsAppMessage = (orderNum: string): string => {
    const itemsText = items
      .map((it) => {
        let text = `• *${it.quantity}x ${it.name}* (S/ ${(it.unitPrice * it.quantity).toFixed(2)})`;
        if (it.selectedVariant) {
          text += `\n  - Variante: ${it.selectedVariant.name}`;
        }
        if (it.selectedCustomizations && it.selectedCustomizations.length > 0) {
          text += `\n  - Opciones: ${it.selectedCustomizations.map((c) => c.name).join(', ')}`;
        }
        if (it.notes) {
          text += `\n  - Nota: "${it.notes}"`;
        }
        return text;
      })
      .join('\n');

    const paymentLabel =
      paymentMethod === 'yape'
        ? '📱 Yape (Adjunto captura del voucher)'
        : paymentMethod === 'bcp'
        ? '🏦 BCP Transferencia (Adjunto constancia)'
        : `💵 Efectivo (Paga con: S/ ${cashAmountNeeded || 'Monto Exacto'})`;

    return (
      `🥗 *¡HOLA TENTACIONES FIT! DESEO CONFIRMAR MI PEDIDO* 🥗\n\n` +
      `🧾 *Pedido:* #${orderNum}\n` +
      `👤 *Cliente:* ${customer.name}\n` +
      `📱 *Teléfono:* ${customer.phone}\n` +
      `📍 *Dirección de Entrega:* ${customer.address}\n` +
      (customer.reference ? `📌 *Referencia:* ${customer.reference}\n\n` : `\n`) +
      `🍱 *DETALLE DEL PEDIDO:*\n` +
      `${itemsText}\n\n` +
      `💰 *DESGLOSE DE PAGO:* \n` +
      `• Subtotal: S/ ${subtotal.toFixed(2)}\n` +
      (discountAmount > 0 ? `• Descuento (${appliedCoupon?.code}): -S/ ${discountAmount.toFixed(2)}\n` : '') +
      `💳 *TOTAL A PAGAR:* *S/ ${total.toFixed(2)}*\n\n` +
      `💳 *Método de Pago Seleccionado:* ${paymentLabel}\n\n` +
      `_Por favor confirmar el pedido y tiempo estimado de entrega. ¡Muchas gracias!_ ✨`
    );
  };

  const handleFinalSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Save customer details in localStorage
    localStorage.setItem('tentaciones_customer', JSON.stringify(customer));

    // Generate readable order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `TF-${randomNum}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const whatsappText = generateWhatsAppMessage(orderNumber);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: `Hoy, ${timeFormatted}`,
      items: [...items],
      subtotal,
      deliveryFee: 0,
      tip: 0,
      discount: discountAmount,
      discountCode: appliedCoupon?.code,
      total,
      customer: { ...customer, district: customer.address },
      paymentMethod,
      paymentStatus: 'pendiente',
      status: 'recibido',
      statusHistory: [{ status: 'recibido', timestamp: timeFormatted }],
      cashAmountNeeded: paymentMethod === 'efectivo' && cashAmountNeeded ? Number(cashAmountNeeded) : undefined,
      whatsappMessage: whatsappText,
      createdAt: Date.now(),
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignored
    }

    playChime('success');
    triggerHaptic('success');

    // Notify parent to save in Store Administration panel
    onOrderCreated(newOrder);

    // Clear cart and close drawer
    onClearCart();
    onClose();

    // Redirect directly to business WhatsApp
    const waUrl = `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200/80 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                title="Volver a la canasta"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                {step === 'cart' ? (
                  <>
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Mi Canasta de Pedido ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Datos de Entrega & Pago</span>
                  </>
                )}
              </h3>
              <p className="text-[10px] text-neutral-500">
                {step === 'cart'
                  ? 'Revisa tus productos y continúa al checkout'
                  : 'Ingresa tus datos y confirma el pedido directo a WhatsApp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* EMPTY CART STATE */}
          {items.length === 0 && (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-base text-neutral-800 dark:text-neutral-200">
                Tu canasta está vacía
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Explora nuestra carta saludable y agrega tus postres fit, batidos proteicos o almuerzos favoritos.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Ver Catálogo
              </button>
            </div>
          )}

          {/* STEP 1: CART ITEMS & COUPON */}
          {items.length > 0 && step === 'cart' && (
            <div className="space-y-4">
              {/* Healthy banner */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Preparado 100% al momento
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                    Sin azúcar refinada, con insumos naturales y endulzado con estevia pura.
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {items.map((it) => (
                  <div
                    key={it.cartItemId}
                    className="flex gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs"
                  >
                    <img
                      src={it.image}
                      alt={it.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 line-clamp-1">
                            {it.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(it.cartItemId)}
                            className="text-neutral-400 hover:text-red-500 p-0.5 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {it.selectedVariant && (
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {it.selectedVariant.name}
                          </p>
                        )}
                        {it.selectedCustomizations && it.selectedCustomizations.length > 0 && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 line-clamp-1">
                            {it.selectedCustomizations.map((c) => c.name).join(', ')}
                          </p>
                        )}
                        {it.notes && (
                          <p className="text-[10px] italic text-neutral-400">
                            Nota: {it.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="font-extrabold text-xs text-neutral-900 dark:text-neutral-100 tabular-nums">
                          S/ {(it.unitPrice * it.quantity).toFixed(2)}
                        </span>

                        {/* Quantity [-] [qty] [+] */}
                        <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(it.cartItemId, it.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold tabular-nums">
                            {it.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(it.cartItemId, it.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon validator */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Cupón de descuento (ej. FIT10)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 uppercase font-mono tracking-wider focus:outline-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
                {couponError && <p className="text-[10px] text-red-500 mt-1.5">{couponError}</p>}
                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Cupón {appliedCoupon.code} aplicado (-{appliedCoupon.discountPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-[10px] text-neutral-400 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: CHECKOUT (CUSTOMER DETAILS & PAYMENT INFO) */}
          {items.length > 0 && step === 'checkout' && (
            <div className="space-y-4">
              {/* SECTION 1: CUSTOMER WRITTEN ADDRESS */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-neutral-200/70 dark:border-neutral-800 pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-xs text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    1. Datos de Entrega
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => {
                      setCustomer({ ...customer, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="Ej. Camila Morales"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600 ${
                      formErrors.name ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Teléfono o Celular para WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer({ ...customer, phone: e.target.value });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                    }}
                    placeholder="Ej. 991 494 099"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600 ${
                      formErrors.phone ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Address: WRITTEN, NO SELECTOR OR DROPDOWNS */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Dirección de Entrega (Escríbela aquí) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={customer.address}
                    onChange={(e) => {
                      setCustomer({ ...customer, address: e.target.value });
                      if (formErrors.address) setFormErrors({ ...formErrors, address: undefined });
                    }}
                    placeholder="Escribe tu calle, número, dpto/piso y distrito (ej. Av. Dos de Mayo 840 dpto 302, San Isidro)"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600 resize-none ${
                      formErrors.address ? 'border-red-500' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-[10px] text-red-500 mt-1">{formErrors.address}</p>
                  )}
                </div>

                {/* Reference */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Referencias para la entrega (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customer.reference}
                    onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                    placeholder="Ej. Frente a la farmacia, portón beige, dejar en recepción"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-emerald-600"
                  />
                </div>
              </div>

              {/* SECTION 2: PAYMENT METHODS & COPY BUTTONS */}
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-850 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-neutral-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      2. Método de Pago
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Total: S/ {total.toFixed(2)}
                  </span>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('yape')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentMethod === 'yape'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Yape
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bcp')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentMethod === 'bcp'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    BCP
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      paymentMethod === 'efectivo'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Efectivo
                  </button>
                </div>

                {/* YAPE PANEL */}
                {paymentMethod === 'yape' && (
                  <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                          Paga con Yape
                        </p>
                        <p className="text-[10px] text-purple-700 dark:text-purple-300">
                          Titular: {BUSINESS_INFO.yapeHolder}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                        S/ {total.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl flex items-center justify-between border border-purple-100 dark:border-purple-900/40">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-neutral-400">Número de Yape</p>
                        <p className="font-mono text-sm font-extrabold text-purple-900 dark:text-purple-200">
                          {BUSINESS_INFO.yapeNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(BUSINESS_INFO.yapeNumber, 'yape-num')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
                      >
                        {copiedKey === 'yape-num' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'yape-num' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-purple-800 dark:text-purple-300 leading-tight">
                      📲 <strong>Nota:</strong> Haz el Yape por <strong>S/ {total.toFixed(2)}</strong>. Al presionar el botón de abajo se abrirá tu WhatsApp y allí adjuntas la captura de tu voucher.
                    </p>
                  </div>
                )}

                {/* BCP PANEL */}
                {paymentMethod === 'bcp' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                    <div>
                      <p className="font-extrabold text-xs text-blue-900 dark:text-blue-200">
                        Transferencia Bancaria BCP
                      </p>
                      <p className="text-[10px] text-blue-700 dark:text-blue-300">
                        Titular: {BUSINESS_INFO.bcpHolder}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/40">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-neutral-400">Cuenta Corriente BCP</p>
                          <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                            {BUSINESS_INFO.bcpAccount}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(BUSINESS_INFO.bcpAccount, 'bcp-acc')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all"
                        >
                          {copiedKey === 'bcp-acc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'bcp-acc' ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>

                      <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/40">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-neutral-400">CCI Interbancario</p>
                          <p className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                            {BUSINESS_INFO.bcpCci}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(BUSINESS_INFO.bcpCci, 'bcp-cci')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[10px] font-bold shadow-xs active:scale-95 transition-all"
                        >
                          {copiedKey === 'bcp-cci' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === 'bcp-cci' ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[10px] text-blue-800 dark:text-blue-300 leading-tight">
                      🏦 Envías tu constancia de transferencia en el chat de WhatsApp al confirmar.
                    </p>
                  </div>
                )}

                {/* CASH PANEL */}
                {paymentMethod === 'efectivo' && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                    <div>
                      <p className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                        Pago en Efectivo Contra Entrega
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                        Pagas al momento de recibir tus productos.
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                        ¿Con cuánto pagarás? (Para llevar vuelto)
                      </label>
                      <input
                        type="number"
                        value={cashAmountNeeded}
                        onChange={(e) => setCashAmountNeeded(e.target.value)}
                        placeholder={`Monto total: S/ ${total.toFixed(2)} (ej. S/ 50)`}
                        className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>


            </div>
          )}

          {/* FINANCIAL SUMMARY (always visible when items exist) */}
          {items.length > 0 && (
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5 text-neutral-600 dark:text-neutral-400">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} productos):</span>
                <span className="tabular-nums font-medium text-neutral-800 dark:text-neutral-200">
                  S/ {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Envío directo:</span>
                <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400 font-bold">
                  Coordinación por WhatsApp
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Descuento cupón ({appliedCoupon?.code}):</span>
                  <span className="tabular-nums">-S/ {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between text-base font-extrabold text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span>Total a pagar:</span>
                <span className="tabular-nums text-emerald-700 dark:text-emerald-400 font-mono text-xl">
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
            {step === 'cart' ? (
              <button
                onClick={() => setStep('checkout')}
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-700/20 flex items-center justify-between px-5 transition-all"
              >
                <span>Proceder a Comprar & Pagar</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>S/ {total.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-emerald-700/30 flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Confirmar Pedido y Enviar a WhatsApp</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
