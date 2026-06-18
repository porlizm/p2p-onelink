import { defineStore } from 'pinia';

export interface CartItem {
  item_id?: string;
  item_name: string;
  quantity: number;
  uom: string;
  unit_price: number;
  vendor_id?: string;
  cost_center_id: string;
  quotation_url?: string;
  is_custom: boolean;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    totalItems: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0),
  },
  actions: {
    addToCart(item: Omit<CartItem, 'quantity' | 'cost_center_id'> & { quantity?: number; cost_center_id?: string }) {
      // For catalog items, check if already in cart
      if (!item.is_custom && item.item_id) {
        const existing = this.items.find((i) => i.item_id === item.item_id);
        if (existing) {
          existing.quantity += item.quantity || 1;
          return;
        }
      }
      this.items.push({
        ...item,
        quantity: item.quantity || 1,
        cost_center_id: item.cost_center_id || '',
      });
    },
    removeFromCart(index: number) {
      this.items.splice(index, 1);
    },
    updateQuantity(index: number, quantity: number) {
      if (index >= 0 && index < this.items.length) {
        this.items[index].quantity = quantity;
      }
    },
    updateCostCenter(index: number, costCenterId: string) {
      if (index >= 0 && index < this.items.length) {
        this.items[index].cost_center_id = costCenterId;
      }
    },
    updateCustomItemPrice(index: number, price: number) {
      if (index >= 0 && index < this.items.length && this.items[index].is_custom) {
        this.items[index].unit_price = price;
      }
    },
    updateCustomItemName(index: number, name: string) {
      if (index >= 0 && index < this.items.length && this.items[index].is_custom) {
        this.items[index].item_name = name;
      }
    },
    updateCustomItemUom(index: number, uom: string) {
      if (index >= 0 && index < this.items.length && this.items[index].is_custom) {
        this.items[index].uom = uom;
      }
    },
    updateQuotationUrl(index: number, url: string) {
      if (index >= 0 && index < this.items.length) {
        this.items[index].quotation_url = url;
      }
    },
    clearCart() {
      this.items = [];
    },
  },
});
