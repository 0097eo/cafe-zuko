import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductsPage from '../src/pages/Products'

describe('ProductsPage', () => {
    beforeEach(() => {
        global.fetch = vi.fn()
    })

    it('renders loading state initially', () => {
        render(<ProductsPage />)
        expect(screen.getByText(/loading products/i)).toBeInTheDocument()
    })

    it('renders products when fetch succeeds', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Test Coffee',
                description: 'Test Description',
                image_url: 'test.jpg',
                roast_type: 'MEDIUM',
                origin: 'Test Origin',
                price: '1000',
                stock: 10
            }
        ]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProducts
        })

        render(<ProductsPage />)
        
        await waitFor(() => {
            expect(screen.getByText('Test Coffee')).toBeInTheDocument()
            expect(screen.getByText('Origin: Test Origin')).toBeInTheDocument()
            expect(screen.getByText('Ksh 1000')).toBeInTheDocument()
        })
    })

    it('filters products based on search input', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Arabica Coffee',
                description: 'Test Description',
                image_url: 'test.jpg',
                roast_type: 'MEDIUM',
                origin: 'Kenya',
                price: '1000',
                stock: 10
            },
            {
                id: 2, 
                name: 'Robusta Coffee',
                description: 'Another Description',
                image_url: 'test2.jpg',
                roast_type: 'DARK',
                origin: 'Ethiopia',
                price: '1200',
                stock: 5
            }
        ]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProducts
        })

        render(<ProductsPage />)

        await waitFor(() => {
            const searchInput = screen.getByPlaceholderText(/search coffee/i)
            fireEvent.change(searchInput, { target: { value: 'arabica' } })
        })

        expect(screen.getByText('Arabica Coffee')).toBeInTheDocument()
        expect(screen.queryByText('Robusta Coffee')).not.toBeInTheDocument()
    })

    it('shows error message when no products match filters', async () => {
        const mockProducts = []
        
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProducts
        })

        render(<ProductsPage />)

        await waitFor(() => {
            expect(screen.getByText(/no products found matching your criteria/i)).toBeInTheDocument()
        })
    })

    it('shows out of stock message for products with zero stock', async () => {
        const mockProducts = [{
            id: 1,
            name: 'Test Coffee',
            description: 'Test Description', 
            image_url: 'test.jpg',
            roast_type: 'MEDIUM',
            origin: 'Test Origin',
            price: '1000',
            stock: 0
        }]

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockProducts
        })

        render(<ProductsPage />)

        await waitFor(() => {
            expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
        })
    })
})

