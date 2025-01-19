import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();

    // Load initial cart data
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                // Load cart from backend for authenticated users
                try {
                    const response = await fetch('/api/cart/', {
                        headers: {
                            'Authorization': `Bearer ${user.access}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setItems(data.items);
                    }
                } catch (error) {
                    console.error('Error loading cart:', error);
                }
            } else {
                // Load cart from localStorage for guests
                const savedCart = localStorage.getItem('guestCart');
                if (savedCart) {
                    setItems(JSON.parse(savedCart));
                }
            }
            setLoading(false);
        };

        loadCart();
    }, [isAuthenticated, user]);

    // Save cart changes
    const saveCart = async (newItems) => {
        if (isAuthenticated) {
            try {
                await fetch('/api/cart/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.access}`
                    },
                    body: JSON.stringify({ items: newItems })
                });
            } catch (error) {
                console.error('Error saving cart:', error);
                return false;
            }
        } else {
            localStorage.setItem('guestCart', JSON.stringify(newItems));
        }
        setItems(newItems);
        return true;
    };

    // Cart operations
    const addItem = async (item) => {
        const existingItem = items.find(i => i.id === item.id);
        let newItems;

        if (existingItem) {
            newItems = items.map(i =>
                i.id === item.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            );
        } else {
            newItems = [...items, { ...item, quantity: 1 }];
        }

        return await saveCart(newItems);
    };

    const removeItem = async (itemId) => {
        const newItems = items.filter(item => item.id !== itemId);
        return await saveCart(newItems);
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            return removeItem(itemId);
        }

        const newItems = items.map(item =>
            item.id === itemId
                ? { ...item, quantity }
                : item
        );

        return await saveCart(newItems);
    };

    const clearCart = async () => {
        return await saveCart([]);
    };

    // Calculate total
    const total = items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );

    // Transfer guest cart to user account after login
    const transferGuestCart = async () => {
        if (isAuthenticated) {
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                const guestItems = JSON.parse(guestCart);
                await saveCart(guestItems);
                localStorage.removeItem('guestCart');
            }
        }
    };

    // Listen for authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            transferGuestCart();
        }
    }, [isAuthenticated]);

    const value = {
        items,
        total,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useCart = () => useContext(CartContext);

export default CartContext;