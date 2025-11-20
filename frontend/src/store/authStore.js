import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(credentials);
      const { access_token, refresh_token, user } = response.data;

      // Save to localStorage synchronously
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      set({ user, isAuthenticated: true, loading: false });

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));

      toast.success('Login successful!');
      return user;
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  },

  signup: async (data) => {
    set({ loading: true });
    try {
      const response = await authAPI.signup(data);
      const { access_token, refresh_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, isAuthenticated: true, loading: false });
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      set({ loading: false });
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    }
  },

  refreshUser: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));

export default useAuthStore;
