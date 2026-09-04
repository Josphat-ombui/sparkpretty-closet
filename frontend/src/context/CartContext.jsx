import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, generateSessionId } from '../lib/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      generateSessionId();
      const res = await api.get('/cart');
      setItems(res.data?.items || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, variantIndex, quantity = 1) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/add', { productId, variantIndex, quantity });
      setItems(res.data.items);
      setIsOpen(true);
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    const res = await api.put('/cart/update', { itemId, quantity });
    setItems(res.data.items);
  };

  const removeItem = async (itemId) => {
    const res = await api.delete(`/cart/remove/${itemId}`);
    setItems(res.data.items);
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, isOpen, setIsOpen, addItem, updateItem, removeItem, count, subtotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
