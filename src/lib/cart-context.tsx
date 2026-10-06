import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AUTH_CHANGED_EVENT, getAuthUserId, userStorageKey, type Product } from "@/lib/api";

const STORAGE_KEY = "golden-time-cart";
export type CartLine = {
  productId: number; shopId: number; shopName: string; fruitName: string; displayName: string;
  emoji: string; pricePerKg: number; stockKg: number; quantityKg: number;
};
type CartContextValue = {
  items: CartLine[]; add: (product: Product) => boolean; setQuantity: (productId: number, quantityKg: number) => void;
  remove: (productId: number) => void; clear: () => void; subtotal: number;
};
const CartContext = createContext<CartContextValue | null>(null);

type CartState = { userId: number | null; items: CartLine[]; ready: boolean };

function readCart(userId: number | null): CartLine[] {
  try {
    const saved = window.localStorage.getItem(userStorageKey(STORAGE_KEY, userId));
    if (!saved) return [];
    const parsed = JSON.parse(saved) as unknown;
    return Array.isArray(parsed) ? parsed as CartLine[] : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ userId: null, items: [], ready: false });
  useEffect(() => {
    const loadCurrentUserCart = () => {
      const userId = getAuthUserId();
      setCart({ userId, items: readCart(userId), ready: true });
    };
    loadCurrentUserCart();
    window.addEventListener(AUTH_CHANGED_EVENT, loadCurrentUserCart);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, loadCurrentUserCart);
  }, []);
  useEffect(() => {
    if (!cart.ready || cart.userId !== getAuthUserId()) return;
    window.localStorage.setItem(userStorageKey(STORAGE_KEY, cart.userId), JSON.stringify(cart.items));
  }, [cart]);

  const items = cart.items;
  const updateItems = (update: (current: CartLine[]) => CartLine[]) => setCart((current) => {
    if (!current.ready || current.userId !== getAuthUserId()) return current;
    return { ...current, items: update(current.items) };
  });

  const value = useMemo<CartContextValue>(() => ({
    items,
    add: (product) => {
      if (!cart.ready || cart.userId !== getAuthUserId()) return false;
      if (items.length > 0 && items[0].shopId !== product.shopId) return false;
      updateItems((current) => {
        const existing = current.find((line) => line.productId === product.id);
        if (existing) return current.map((line) => line.productId === product.id
          ? { ...line, quantityKg: Math.min(line.quantityKg + 1, line.stockKg) } : line);
        return [...current, { productId: product.id, shopId: product.shopId, shopName: product.shopName,
          fruitName: product.fruitName, displayName: product.displayName, emoji: product.emoji,
          pricePerKg: product.pricePerKg, stockKg: product.stockKg, quantityKg: Math.min(1, product.stockKg) }];
      });
      return true;
    },
    setQuantity: (productId, quantityKg) => updateItems((current) => current.map((line) => line.productId === productId
      ? { ...line, quantityKg: Math.max(0.1, Math.min(line.stockKg, Math.round(quantityKg * 10) / 10)) } : line)),
    remove: (productId) => updateItems((current) => current.filter((line) => line.productId !== productId)),
    clear: () => updateItems(() => []),
    subtotal: items.reduce((sum, line) => sum + Math.round(line.pricePerKg * line.quantityKg), 0),
  }), [items, cart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
