import { render, screen, waitFor } from '@testing-library/react'
import { describe, vi, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../src/pages/Login'
import { AuthProvider } from '../src/context/AuthContext'
import userEvent from '@testing-library/user-event'

//mock usenavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => mockNavigate,
    };
  });

  // mock image
  vi.mock('../assets/coffee.jpg', ()=> ({
    default: 'coffee-image-mock'
  }))


describe('LoginPage', () => {
    //setup user interactions
    const user = userEvent.setup()

    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    const renderLoginPage = () => {
        return render(
            <BrowserRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        )
    }

    it('renders login form with all its elements', ()=> {
        renderLoginPage()
        
        expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', {name: /sign in/i})).toBeInTheDocument()
        expect(screen.getByRole('link', {name: /sign up/i})).toBeInTheDocument()
    })


    it('handles password visibility toggle', async () => {
        renderLoginPage()

        const passwordInput = screen.getByPlaceholderText(/enter your password/i)
        const passwordToggleButton = screen.getByRole('button', { name: /show password/i })

        // initially password input is of type 'password'
        expect(passwordInput).toHaveAttribute('type', 'password')

        // Toggle password visibility
        await user.click(passwordToggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        // Toggle password visibility again
        await user.click(passwordToggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('shows validation errors for password', async () => {
        renderLoginPage()

        const passwordInput = screen.getByPlaceholderText(/enter your password/i)
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        await user.type(passwordInput, 'short')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument()
        })
    })

    it('handles successful login', async () => {
        const mockFetch = vi.fn(() => 
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              refresh: 'refresh-token',
              access: 'access-token',
              user: { username: 'testuser' }
            })
          })
        );
        
        global.fetch = mockFetch;
        renderLoginPage();
    
        await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');
        await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
        
        await user.click(screen.getByRole('button', { name: /sign in/i }));
    
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/shop');
        });
    
        expect(localStorage.getItem('user')).toBeTruthy();
        expect(localStorage.getItem('access')).toBeTruthy();
        expect(localStorage.getItem('refresh')).toBeTruthy();
      });

      it('handles failed login', async () => {
        const mockFetch = vi.fn(() => 
          Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Invalid credentials' })
          })
        );
        
        global.fetch = mockFetch;
        renderLoginPage();

        await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');
        await user.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpassword');

        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
          expect(screen.getByText(/login failed, check your credentials/i)).toBeInTheDocument();
          expect(mockNavigate).not.toHaveBeenCalled();
        });
      })


      it('handles network errors during login', async () => {
        const mockFetch = vi.fn(()=>Promise.reject(new Error('Network error')))

        global.fetch = mockFetch;
        renderLoginPage();

        await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');
        await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');

        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
          expect(mockNavigate).not.toHaveBeenCalled();
        });
      })

      it('shows loading state during login attempt', async () => {
        const mockFetch = vi.fn(() => 
          new Promise(resolve => 
            setTimeout(() => 
              resolve({
                ok: true,
                json: () => Promise.resolve({
                  refresh: 'refresh-token',
                  access: 'access-token',
                  user: { username: 'testuser' }
                })
              }), 100)
          )
        );
        
        global.fetch = mockFetch;
        renderLoginPage();
    
        await user.type(screen.getByPlaceholderText(/enter your username/i), 'testuser');
        await user.type(screen.getByPlaceholderText(/enter your password/i), 'password123');
        
        await user.click(screen.getByRole('button', { name: /sign in/i }));
        
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
      });
})