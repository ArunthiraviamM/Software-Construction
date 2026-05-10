import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setCartLoading(true);
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      setCart(data.data);
      toast.success('Added to cart! 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.data);
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.data);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
    } catch (err) {
      console.error('Clear cart failed', err);
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post('/cart/coupon', { code });
      toast.success(data.message);
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      return false;
    }
  };

  const cartCount = cart?.items?.reduce((a, i) => a + i.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((a, i) => a + i.price * i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, applyCoupon, refetchCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
