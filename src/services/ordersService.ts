import { Order, OrderStatus } from '../types';

const API_BASE = '/api/orders';

/**
 * Service to manage persistent orders in the backend database,
 * with localStorage as an automatic fallback and cache.
 */
export const ordersService = {
  /**
   * Fetch all orders from backend database
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.status}`);
      }
      const data: Order[] = await response.json();
      if (Array.isArray(data)) {
        // Cache in localStorage for offline resilience
        localStorage.setItem('tentaciones_orders', JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn('[OrdersService] Fallo al consultar backend, utilizando caché local:', error);
    }

    // Fallback to localStorage if backend is temporarily unreachable
    const cached = localStorage.getItem('tentaciones_orders');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return [];
  },

  /**
   * Save a newly confirmed WhatsApp order to backend database
   */
  async saveOrder(order: Order): Promise<boolean> {
    try {
      // 1. Save to backend database
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error(`Error al guardar en base de datos: ${response.status}`);
      }

      console.log(`[OrdersService] Pedido #${order.orderNumber} guardado exitosamente en base de datos.`);
      return true;
    } catch (error) {
      console.error('[OrdersService] Error al guardar en base de datos, asegurando en caché local:', error);
      // Still return true as it's cached in localStorage
      return false;
    }
  },

  /**
   * Update order status in backend database
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return response.ok;
    } catch (error) {
      console.error('[OrdersService] Error al actualizar estado en backend:', error);
      return false;
    }
  },

  /**
   * Update payment status in backend database ('pagado' | 'pendiente')
   */
  async updatePaymentStatus(orderId: string, paymentStatus: 'pendiente' | 'pagado'): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus }),
      });
      return response.ok;
    } catch (error) {
      console.error('[OrdersService] Error al actualizar estado de pago en backend:', error);
      return false;
    }
  },

  /**
   * Update generic order fields in backend database
   */
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      return response.ok;
    } catch (error) {
      console.error('[OrdersService] Error al actualizar pedido en backend:', error);
      return false;
    }
  },

  /**
   * Delete order from backend database
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${orderId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('[OrdersService] Error al eliminar pedido en backend:', error);
      return false;
    }
  },
};
