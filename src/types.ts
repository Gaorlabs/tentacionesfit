export type ProductCategory = 
  | 'todos'
  | 'postres'
  | 'jugos'
  | 'batidos'
  | 'frappes'
  | 'ensaladas'
  | 'cremoladas';

export interface ProductVariant {
  id: string;
  name: string;
  priceDelta: number; // additional cost relative to base price, or 0
}

export interface ProductCustomizationOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ProductCustomization {
  id: string;
  title: string;
  required: boolean;
  options: ProductCustomizationOption[];
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  ingredients?: string[];
  benefits?: string[];
  calories?: number;
  proteinGrams?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  isPopular?: boolean;
  isSugarFree?: boolean;
  isLactoseFree?: boolean;
  hasProtein?: boolean;
  isDiabeticFriendly?: boolean;
  inStock: boolean;
  variants?: ProductVariant[];
  customizations?: ProductCustomization[];
}

export interface SelectedCustomization {
  customizationId: string;
  optionId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  selectedVariant?: ProductVariant;
  selectedCustomizations: SelectedCustomization[];
  quantity: number;
  notes?: string;
  image: string;
}

export type OrderStatus = 'recibido' | 'preparando' | 'en_camino' | 'entregado';

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  district?: string;
  reference?: string;
}

export type PaymentMethod = 'yape' | 'bcp' | 'efectivo';
export type PaymentStatus = 'pendiente' | 'pagado';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  discountCode?: string;
  total: number;
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
  }[];
  cashAmountNeeded?: number;
  whatsappMessage: string;
  createdAt: number;
}

export interface DeliveryDistrict {
  id: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrder: number;
  description: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'cart' | 'info';
  timestamp: string;
  read: boolean;
}
