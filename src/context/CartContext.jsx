import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/cart/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], itemCount: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    // Cualquier usuario autenticado puede tener carrito (BUYER y SELLER pueden comprar)
    if (!user) return;
    try {
      const res = await cartService.get();
      setCart(res.data);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addItem = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await cartService.addItem({ productId, quantity });
      setCart(res.data);
      return true;
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    const res = await cartService.updateItem(itemId, { quantity });
    setCart(res.data);
  };

  const removeItem = async (itemId) => {
    const res = await cartService.removeItem(itemId);
    setCart(res.data);
  };

  const clearCart = async () => {
    await cartService.clear();
    setCart({ items: [], itemCount: 0, total: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
