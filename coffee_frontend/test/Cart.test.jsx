import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Cart from '../src/components/Cart';

// Create mock function
const mockUseCart = vi.fn();

// Mock the entire module
vi.mock('../src/context/CartContext', () => ({
  useCart: () => mockUseCart()
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Minus: () => <div data-testid="minus-icon">Minus</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  ShoppingCart: () => <div data-testid="shopping-cart-icon">ShoppingCart</div>,
}));

describe('Cart Component', () => {
  const mockItems = [
    {
      id: 1,
      name: 'Test Item 1',
      price: 1000.00,
      quantity: 2,
      image: 'test-image-1.jpg',
    },
    {
      id: 2,
      name: 'Test Item 2',
      price: 500.00,
      quantity: 1,
      image: null,
    },
  ];

  const mockCartFunctions = {
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    total: 2500.00,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    

    mockUseCart.mockReturnValue({
      ...mockCartFunctions,
      items: mockItems,
    });
  });

  it('renders loading spinner when loading is true', () => {
    // Override the default mock for this specific test
    mockUseCart.mockReturnValue({
      ...mockCartFunctions,
      items: [],
      loading: true,
    });

    const { container } = render(<Cart />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders empty cart message when there are no items', () => {
    // Override the default mock for this specific test
    mockUseCart.mockReturnValue({
      ...mockCartFunctions,
      items: [],
      loading: false,
    });

    render(<Cart />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some items to your cart to see them here.')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    render(<Cart />);

    // Check if items are rendered
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('Ksh 1000.00')).toBeInTheDocument();
    

    // Check total
    expect(screen.getByText('Ksh 2500.00')).toBeInTheDocument();
  });

  it('handles image display correctly', () => {
    render(<Cart />);

    // Check if image is rendered for item with image
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'test-image-1.jpg');

    // Check if "No image" placeholder is shown for item without image
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('calls updateQuantity when quantity controls are clicked', () => {
    render(<Cart />);

    // Get all plus and minus buttons
    const plusButtons = screen.getAllByTestId('plus-icon');
    const minusButtons = screen.getAllByTestId('minus-icon');

    // Click plus button for first item
    fireEvent.click(plusButtons[0].parentElement);
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, 3);

    // Click minus button for first item
    fireEvent.click(minusButtons[0].parentElement);
    expect(mockCartFunctions.updateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('calls removeItem when trash icon is clicked', () => {
    render(<Cart />);

    const trashButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(trashButtons[0].parentElement);

    expect(mockCartFunctions.removeItem).toHaveBeenCalledWith(1);
  });

  it('calls clearCart when Clear Cart button is clicked', () => {
    render(<Cart />);

    const clearCartButton = screen.getByText('Clear Cart');
    fireEvent.click(clearCartButton);

    expect(mockCartFunctions.clearCart).toHaveBeenCalled();
  });

  it('displays correct item subtotals', () => {
    render(<Cart />);

    expect(screen.getByText('Ksh 2000.00')).toBeInTheDocument();
    
  });
});