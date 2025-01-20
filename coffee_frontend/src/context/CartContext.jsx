import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const response = await fetch('/api/cart/cart/', {
                        headers: {
                            'Authorization': `Bearer ${user.access}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (Array.isArray(data) && data.length > 0) {
                            const cartItems = data[0].items.map(item => ({
                                cartItemId: item.id, 
                                id: item.product.id,  
                                name: item.product.name,
                                price: parseFloat(item.product.price),
                                image: item.product.image_url,
                                quantity: item.quantity,
                                description: item.product.description,
                                roast_type: item.product.roast_type,
                                origin: item.product.origin,
                            }));
                            setItems(cartItems);
                        } else {
                            setItems([]);
                        }
                    }
                } catch (error) {
                    console.error('Error loading cart:', error);
                    setItems([]);
                }
            } else {
                const savedCart = localStorage.getItem('guestCart');
                if (savedCart) {
                    try {
                        const parsedCart = JSON.parse(savedCart);
                        setItems(Array.isArray(parsedCart) ? parsedCart : []);
                    } catch (error) {
                        console.error('Error parsing cart from localStorage:', error);
                        setItems([]);
                    }
                } else {
                    setItems([]);
                }
            }
            setLoading(false);
        };

        loadCart();
    }, [isAuthenticated, user]);

    // Save cart changes
    const saveCart = async (newItems) => {
        if (!Array.isArray(newItems)) {
            console.error('Invalid cart items format');
            return false;
        }

        if (isAuthenticated) {
            try {
                const newItemsSet = new Set(newItems.map(item => item.id));
                const updatePromises = newItems
                    .filter(item => item.cartItemId)
                    .map(async (item) => {
                        return fetch(`/api/cart/items/${item.cartItemId}/`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.access}`
                            },
                            body: JSON.stringify({
                                product: item.id,
                                quantity: item.quantity
                            })
                        });
                    });

                const addPromises = newItems
                    .filter(item => !item.cartItemId)
                    .map(async (item) => {
                        const response = await fetch('/api/cart/cart/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${user.access}`
                            },
                            body: JSON.stringify({
                                product: item.id,
                                quantity: item.quantity
                            })
                        });
                        
                        if (response.ok) {
                            const newCartItem = await response.json();
                            item.cartItemId = newCartItem.id;
                        }
                        return response;
                    });

                const deletePromises = items
                    .filter(item => !newItemsSet.has(item.id) && item.cartItemId)
                    .map(item => 
                        fetch(`/api/cart/items/${item.cartItemId}/`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${user.access}`
                            }
                        })
                    );

                await Promise.all([...updatePromises, ...addPromises, ...deletePromises]);
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

    const total = Array.isArray(items) ? items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    ) : 0;

    const transferGuestCart = async () => {
        if (isAuthenticated) {
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                try {
                    const guestItems = JSON.parse(guestCart);
                    if (Array.isArray(guestItems)) {
                        await saveCart(guestItems);
                        localStorage.removeItem('guestCart');
                    }
                } catch (error) {
                    console.error('Error transferring guest cart:', error);
                }
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            transferGuestCart();
        }
    }, [isAuthenticated]);

    const value = {
        items: items || [],
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