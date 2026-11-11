import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addToCart: (product) => {
        set((state) => {
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    return state;
                }
                return {
                    items: state.items.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                };
            }
            return { items: [...state.items, { ...product, quantity: 1 }] };
        });
    },

    removeFromCart: (productId) => {
        set((state) => ({
            items: state.items.filter(item => item.id !== productId)
        }));
    },

    updateQuantity: (productId, quantity) => {
        set((state) => {
            if (quantity <= 0) {
                return { items: state.items.filter(item => item.id !== productId) };
            }
            return {
                items: state.items.map(item =>
                    item.id === productId
                        ? { ...item, quantity }
                        : item
                )
            };
        });
    },

    clearCart: () => set({ items: [] }),

    getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    getTotalItems: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
    }
}));
