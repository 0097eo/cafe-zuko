import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import Navbar from '../src/components/NavBar';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedUseNavigate,
  };
});

// Mock AuthContext to simulate authentication states
vi.mock('../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../src/context/AuthContext');
  return {
    ...actual,
    useAuth: () => mockAuthContext
  };
});

let mockAuthContext;

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('NavBar component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseNavigate.mockClear();
    mockAuthContext = {
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      login: vi.fn(),
      loading: false
    };
  });

  const renderNavbar = (overrideContext = {}) => {
    mockAuthContext = { ...mockAuthContext, ...overrideContext };
    return render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );
  };

  it('renders the logo', () => {
    renderNavbar();
    const logo = screen.getByText('☕ Coffee Haven');
    expect(logo).toBeInTheDocument();
  });

  it('renders login and signup buttons when not authenticated', () => {
    renderNavbar();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
  });

  it('renders user info and logout when authenticated', () => {
    renderNavbar({
      user: { username: 'testuser' },
      isAuthenticated: true
    });
    
    // Use getByText with more specific matching
    const helloText = screen.getByText(content => 
      content.trim() === 'Hello, testuser'
    );
    expect(helloText).toBeInTheDocument();
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    const mockLogout = vi.fn();
    renderNavbar({
      user: { username: 'testuser' },
      isAuthenticated: true,
      logout: mockLogout
    });
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockedUseNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows navigation links', () => {
    renderNavbar();
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Shop/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
  });

  it('toggles mobile menu', () => {
    renderNavbar();
    
    const menuButton = screen.getByRole('button', { 
      name: /menu/i 
    });
    
    // Click to open menu
    fireEvent.click(menuButton);
    
    // Look for mobile menu items
    const homeLink = screen.getAllByText(/Home/i).find(
      el => el.closest('.md\\:hidden') !== null
    );
    expect(homeLink).toBeInTheDocument();
  });

  it('shows profile link only when authenticated', () => {
    // Check unauthenticated state
    renderNavbar();
    expect(screen.queryByText(/Profile/i)).not.toBeInTheDocument();
    
    // Check authenticated state
    renderNavbar({
      user: { username: 'testuser' },
      isAuthenticated: true
    });
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });
});