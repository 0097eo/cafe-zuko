import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import React from 'react';

// Helper component to test useAuth hook
const TestComponent = () => {
  const auth = useAuth();
  return <div data-testid="auth-values">{JSON.stringify(auth)}</div>;
};

describe('AuthContext', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock fetch
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    localStorageMock.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initializes with loading state when no stored user', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const authValues = JSON.parse(getByTestId('auth-values').textContent || '{}');
      expect(authValues.loading).toBe(false);
      expect(authValues.user).toBe(null);
      expect(authValues.isAuthenticated).toBe(false);
    });
  });

  it('restores user from localStorage on initial load', async () => {
    // Simulate stored user data
    localStorageMock.setItem('refresh', 'test-refresh-token');
    localStorageMock.setItem('access', 'test-access-token');
    localStorageMock.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      const authValues = JSON.parse(getByTestId('auth-values').textContent || '{}');
      expect(authValues.loading).toBe(false);
      expect(authValues.user).toEqual({
        refresh: 'test-refresh-token',
        access: 'test-access-token',
        id: 1,
        username: 'testuser'
      });
      expect(authValues.isAuthenticated).toBe(true);
    });
  });

  it('login method sets user and stores tokens', async () => {
    // Mock successful login response
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        refresh: 'new-refresh-token',
        access: 'new-access-token',
        user: { id: 1, username: 'newuser' }
      })
    });

    const LoginTestComponent = () => {
      const { login, user } = useAuth();
      
      React.useEffect(() => {
        login('testuser', 'password');
      }, [login]);

      return user ? <div data-testid="logged-in">Logged In</div> : null;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <LoginTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      getByTestId('logged-in');
    });

    const storedRefresh = localStorageMock.getItem('refresh');
    const storedAccess = localStorageMock.getItem('access');
    const storedUser = JSON.parse(localStorageMock.getItem('user') || '{}');

    expect(storedRefresh).toBe('new-refresh-token');
    expect(storedAccess).toBe('new-access-token');
    expect(storedUser).toEqual({ id: 1, username: 'newuser' });
  });

  it('logout method clears user and removes tokens', async () => {
    // Simulate logged-in state
    localStorageMock.setItem('refresh', 'test-refresh-token');
    localStorageMock.setItem('access', 'test-access-token');
    localStorageMock.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));

    const LogoutTestComponent = () => {
      const { logout, user } = useAuth();
      
      React.useEffect(() => {
        logout();
      }, [logout]);

      return user ? <div data-testid="logged-in">Logged In</div> : <div data-testid="logged-out">Logged Out</div>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <LogoutTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      getByTestId('logged-out');
    });

    expect(localStorageMock.getItem('refresh')).toBe(null);
    expect(localStorageMock.getItem('access')).toBe(null);
    expect(localStorageMock.getItem('user')).toBe(null);
  });

  it('login fails with invalid credentials', async () => {
    // Mock failed login response
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    });

    const FailedLoginComponent = () => {
      const { login, user } = useAuth();
      
      React.useEffect(() => {
        login('wronguser', 'wrongpassword');
      }, [login]);

      return user ? <div data-testid="logged-in">Logged In</div> : <div data-testid="logged-out">Logged Out</div>;
    };

    const { getByTestId } = render(
      <AuthProvider>
        <FailedLoginComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      getByTestId('logged-out');
    });

    expect(localStorageMock.getItem('refresh')).toBe(null);
    expect(localStorageMock.getItem('access')).toBe(null);
    expect(localStorageMock.getItem('user')).toBe(null);
  });
});