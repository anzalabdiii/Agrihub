import { create } from 'zustand';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';

const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  categories: [],
  filters: {
    search: '',
    category_id: null,
    product_type: null,
    city: null,
    state: null,
    min_price: null,
    max_price: null,
    sort_by: 'created_at',
  },
  pagination: {
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  },
  loading: false,

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 when filters change
    }));
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { filters, pagination } = get();
      const params = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page,
      };

      const response = await productsAPI.getProducts(params);
      set({
        products: response.data.products,
        pagination: {
          ...pagination,
          total: response.data.total,
          pages: response.data.pages,
          page: response.data.current_page,
        },
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to load products');
      console.error(error);
    }
  },

  fetchProduct: async (productId) => {
    set({ loading: true });
    try {
      const response = await productsAPI.getProduct(productId);
      set({ currentProduct: response.data.product, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error('Failed to load product');
      console.error(error);
    }
  },

  fetchCategories: async () => {
    try {
      const response = await productsAPI.getCategories();
      set({ categories: response.data.categories });
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        category_id: null,
        product_type: null,
        city: null,
        state: null,
        min_price: null,
        max_price: null,
        sort_by: 'created_at',
      },
      pagination: { page: 1, per_page: 20, total: 0, pages: 0 },
    });
  },
}));

export default useProductStore;
