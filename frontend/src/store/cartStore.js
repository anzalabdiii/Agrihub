import { create } from 'zustand';
import { cartAPI } from '../services/api';
import toast from 'react-hot-toast';

const useCartStore = create((set) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const response = await cartAPI.getCart();
      set({ cart: response.data.cart, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error('Failed to load cart:', error);
    }
  },

  addToCart: async (productId, quantity) => {
    set({ loading: true });
    try {
      const response = await cartAPI.addToCart({ product_id: productId, quantity });
      set({ cart: response.data.cart, loading: false });
      toast.success('Added to cart!');
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    set({ loading: true });
    try {
      const response = await cartAPI.updateCartItem(cartItemId, { quantity });
      set({ cart: response.data.cart, loading: false });
      toast.success('Cart updated!');
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
      throw error;
    }
  },

  removeFromCart: async (cartItemId) => {
    set({ loading: true });
    try {
      const response = await cartAPI.removeFromCart(cartItemId);
      set({ cart: response.data.cart, loading: false });
      toast.success('Item removed from cart');
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to remove item');
      throw error;
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      await cartAPI.clearCart();
      set({ cart: { items: [], item_count: 0, total: 0 }, loading: false });
      toast.success('Cart cleared');
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to clear cart');
      throw error;
    }
  },
}));

export default useCartStore;
