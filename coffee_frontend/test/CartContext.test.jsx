import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CartProvider, useCart } from '../src/context/CartContext';
import { useAuth } from '../src/context/AuthContext';

// Mock useAuth hook
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('CartContext', () => {
    const mockUser = {
        access: 'fake-token'
    };

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();
        
        // Reset all mocks
        vi.resetAllMocks();
        
        // Default auth mock implementation
        useAuth.mockImplementation(() => ({
            user: null,
            isAuthenticated: false
        }));

        // Default fetch mock implementation
        global.fetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve([])
            })
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty cart for guest users', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toEqual([]);
        expect(result.current.total).toBe(0);
        expect(result.current.loading).toBe(false);
    });

    it('should load cart from API for authenticated users', async () => {
        useAuth.mockImplementation(() => ({
            user: mockUser,
            isAuthenticated: true
        }));

        const mockCartData = [{
            items: [{
                id: 1,
                product: {
                    id: 1,
                    name: 'Test Coffee',
                    price: '9.99',
                    image_url: 'test.jpg',
                    description: 'Test description',
                    roast_type: 'medium',
                    origin: 'Test origin'
                },
                quantity: 2
            }]
        }];

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockCartData)
            })
        );

        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items[0]).toMatchObject({
            id: 1,
            name: 'Test Coffee',
            price: 9.99,
            quantity: 2
        });
    });

    it('should add item to cart', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const newItem = {
            id: 1,
            name: 'Test Coffee',
            price: 9.99
        };

        await act(async () => {
            await result.current.addItem(newItem);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toMatchObject({
            ...newItem,
            quantity: 1
        });
    });

    it('should update quantity of existing item', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const item = {
            id: 1,
            name: 'Test Coffee',
            price: 9.99
        };

        // Add item and wait for state update
        await act(async () => {
            await result.current.addItem(item);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Update quantity and wait for state update
        await act(async () => {
            await result.current.updateQuantity(1, 3);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0]).toMatchObject({
            ...item,
            quantity: 3
        });
    });

    it('should remove item from cart', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const item = {
            id: 1,
            name: 'Test Coffee',
            price: 9.99
        };

        await act(async () => {
            await result.current.addItem(item);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.removeItem(1);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toHaveLength(0);
    });

    it('should clear cart', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const item = {
            id: 1,
            name: 'Test Coffee',
            price: 9.99
        };

        await act(async () => {
            await result.current.addItem(item);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        await act(async () => {
            await result.current.clearCart();
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toHaveLength(0);
        expect(result.current.total).toBe(0);
    });

    it('should calculate total correctly', async () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });

        // Wait for initial cart load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        const item = {
            id: 1,
            name: 'Test Coffee',
            price: 9.99
        };

        // Add item and wait for state update
        await act(async () => {
            await result.current.addItem(item);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Update quantity and wait for state update
        await act(async () => {
            await result.current.updateQuantity(1, 2);
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.items).toHaveLength(1);
        expect(result.current.items[0].quantity).toBe(2);
        expect(result.current.total).toBeCloseTo(19.98, 2);
    });
});