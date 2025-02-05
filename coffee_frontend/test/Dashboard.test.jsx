import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDashboard from '../src/pages/Dashboard';
import { useAuth } from '../src/context/AuthContext';

// Mock the auth context
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('UserDashboard', () => {
    const mockUser = {
        username: 'testuser',
        email: 'test@example.com',
        access: 'mock-token',
        user_type: 'CUSTOMER'
    };

    const mockLogout = vi.fn();

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks();
        
        // Mock the auth context default values
        useAuth.mockReturnValue({
            user: mockUser,
            logout: mockLogout
        });

        // Mock successful fetch responses
        fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([])
        });
    });

    it('renders dashboard with correct initial state', async () => {
        render(<UserDashboard />);
        
        // Check if main sections are rendered
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Payments')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        render(<UserDashboard />);

        // Initial state should show profile
        expect(screen.getByText('Profile Information')).toBeInTheDocument();

        // Click orders tab
        fireEvent.click(screen.getByText('Orders'));
        await waitFor(() => {
            expect(screen.getByText('My Orders')).toBeInTheDocument();
        });

        // Click payments tab
        fireEvent.click(screen.getByText('Payments'));
        await waitFor(() => {
            expect(screen.getByText('My Payments')).toBeInTheDocument();
        });
    });

    it('handles logout correctly', () => {
        render(<UserDashboard />);
        
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        
        expect(mockLogout).toHaveBeenCalled();
    });

    it('fetches profile data on mount for vendor user', async () => {
        const vendorUser = {
            ...mockUser,
            user_type: 'VENDOR'
        };

        const mockVendorProfile = {
            username: 'vendoruser',
            email: 'vendor@example.com',
            vendor_profile: {
                business_name: 'Test Business',
                business_description: 'Test Description',
                business_address: 'Test Address'
            }
        };

        useAuth.mockReturnValue({
            user: vendorUser,
            logout: mockLogout
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockVendorProfile)
        });

        render(<UserDashboard />);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/accounts/profile/', {
                headers: {
                    'Authorization': `Bearer ${vendorUser.access}`
                }
            });
        });
    });

    it('handles profile editing', async () => {
        render(<UserDashboard />);

        // Click edit button
        const editButton = screen.getByText('Edit Profile');
        fireEvent.click(editButton);

        // Check if form inputs appear
        const emailInput = screen.getByPlaceholderText('Email');
        expect(emailInput).toBeInTheDocument();

        // Update email
        fireEvent.change(emailInput, { target: { value: 'newemail@example.com' }});

        // Click save
        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/accounts/update-user/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${mockUser.access}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'newemail@example.com',
                    username: mockUser.username
                })
            });
        });
    });

    it('handles order cancellation', async () => {
        const mockOrders = [{
            id: 1,
            status: 'PENDING',
            total_amount: 100,
            created_at: '2023-01-01'
        }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockOrders)
        });

        render(<UserDashboard />);

        // Switch to orders tab
        fireEvent.click(screen.getByText('Orders'));

        await waitFor(() => {
            const cancelButton = screen.getByText('Cancel Order');
            fireEvent.click(cancelButton);
        });

        expect(fetch).toHaveBeenCalledWith('/api/orders/orders/1/', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
    });
});