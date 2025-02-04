import { describe, it, vi, beforeEach, expect } from "vitest";
import LandingPage from "../src/pages/LandingPage";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "../src/context/CartContext";
import { AuthProvider } from "../src/context/AuthContext";



const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hero image
vi.mock('../assets/coffee.jpg', () => ({
  default: 'mock-image-url'
}));

// Mock sample products
const mockProducts = [
  {
    id: 1,
    name: 'Ethiopian Yirgacheffe',
    price: '1200',
    image_url: '/mock-image-1.jpg',
    roast_type: 'Light',
    origin: 'Ethiopia',
    stock: 10,
    description: 'Floral and bright',
    alt_text: 'Ethiopian coffee'
  },
  {
    id: 2,
    name: 'Colombian Supremo',
    price: '1100',
    image_url: '/mock-image-2.jpg',
    roast_type: 'Medium',
    origin: 'Colombia',
    stock: 5,
    description: 'Balanced and smooth',
    alt_text: 'Colombian coffee'
  },
  {
    id: 3,
    name: 'Italian Roast',
    price: '1000',
    image_url: '/mock-image-3.jpg',
    roast_type: 'Dark',
    origin: 'Brazil',
    stock: 0,
    description: 'Bold and rich',
    alt_text: 'Italian roast coffee'
  }
];

// Improved localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => {
      // Return null for non-existing keys
      if (key === 'user' && !store[key]) return null;
      return store[key] || null;
    }),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    store: () => store
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = vi.fn();

// Helper function to render with all providers
const renderWithProviders = (component, { isAuthenticated = false, userData = null } = {}) => {
  if (isAuthenticated) {
    localStorageMock.setItem('refresh', 'refresh-token');
    localStorageMock.setItem('access', 'access-token');
    localStorageMock.setItem('user', JSON.stringify(userData || { username: 'testuser' }));
  } else {
    localStorageMock.clear();
  }

  return render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
    
    // Default product fetch mock
    fetch.mockImplementation((url) => {
      if (url === '/api/products/products/') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProducts)
        });
      }
      if (url === '/api/cart/cart/') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ items: [] }])
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders correctly for guest users', async () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByText('Order Now')).toBeInTheDocument();
    expect(screen.getByText('Learn About Us')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });
  });

  it('renders correctly for authenticated users', async () => {
    renderWithProviders(<LandingPage />, { 
      isAuthenticated: true, 
      userData: { username: 'testuser', email: 'test@example.com' } 
    });

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    // Verify that the products were fetched
    expect(fetch).toHaveBeenCalledWith('/api/products/products/');
  });

  it('handles navigation properly', async () => {
    renderWithProviders(<LandingPage />);
  
    await act(async () => {
      const orderNowButton = screen.getByText('Order Now');
      fireEvent.click(orderNowButton);
    });
  
    expect(mockNavigate).toHaveBeenCalledWith('/shop');
  });

  it('adds items to cart as guest', async () => {
    renderWithProviders(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addToCartButtons[0]);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'guestCart',
        expect.any(String)
      );
    });
  });

  it('adds items to cart as authenticated user', async () => {
    // Mock successful cart addition
    fetch.mockImplementation((url, options) => {
      if (url === '/api/cart/cart/' && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            id: 1,
            product: mockProducts[0],
            quantity: 1
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      });
    });

    renderWithProviders(<LandingPage />, { 
      isAuthenticated: true, 
      userData: { username: 'testuser' } 
    });

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    const addToCartButtons = screen.getAllByText('Add to Cart');
    fireEvent.click(addToCartButtons[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/cart/cart/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  it('handles product carousel navigation', async () => {
    renderWithProviders(<LandingPage />);

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText('Next product');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Colombian Supremo')).toBeInTheDocument();
    });

    const prevButton = screen.getByLabelText('Previous product');
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });
  });

  it('handles loading state correctly', async () => {
    // Create a never-resolving promise to simulate loading
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithProviders(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Simulate fetch error
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithProviders(<LandingPage />);
  });

  it('shows out of stock message for products with zero stock', async () => {
    renderWithProviders(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    const nextButton = screen.getByLabelText('Next product');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  });

  it('handles window resize for responsive carousel', async () => {
    const { container } = renderWithProviders(<LandingPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    });

    // Simulate desktop width
    global.innerWidth = 1024;
    fireEvent(window, new Event('resize'));

    // Check if three products are visible
    const desktopProductCards = container.querySelectorAll('.max-w-xs, .max-w-sm, .max-w-md');
    expect(desktopProductCards.length).toBe(3);

    // Simulate mobile width
    global.innerWidth = 375;
    fireEvent(window, new Event('resize'));

    // Check if only one product is visible
    const mobileProductCards = container.querySelectorAll('.max-w-xs, .max-w-sm, .max-w-md');
    expect(mobileProductCards.length).toBe(1);
  });
});



