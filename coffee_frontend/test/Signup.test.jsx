import axios from 'axios'
import { describe, vi, expect, it } from 'vitest'
import { screen, render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SignupPage from '../src/pages/Signup'


vi.mock('axios')
vi.mock('react-router-dom', async ()=> {
    const actual = await vi.importActual('react-router-dom')
    return {
       ...actual,
        useNavigate: () => vi.fn(),
    }
})

vi.mock('../assets/coffee.jpg', ()=>'mocked-image-path')

describe('SignupPage', ()=> {
    const renderComponent = () => {
        return render(
            <MemoryRouter initialEntries={['/signup']}>
                <Routes>
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        )
    }

    const fillOutForm = (options = {}) => {
        const {
          userType = 'CUSTOMER',
          email = 'test@example.com',
          username = 'testuser',
          password = 'Password123!',
          confirmPassword = 'Password123!',
          phoneNumber = '1234567890',
          businessName = '',
          businessDescription = '',
          businessAddress = '',
        } = options;
    
        if (userType === 'VENDOR') {
          fireEvent.click(screen.getByText('Vendor'));
        }
    
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: username } });
        fireEvent.change(screen.getByPlaceholderText('Password (min. 8 characters)'), { target: { value: password } });
        fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: confirmPassword } });
        fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: phoneNumber } });
    
        if (userType === 'VENDOR') {
          fireEvent.change(screen.getByPlaceholderText('Business Name'), { target: { value: businessName } });
          fireEvent.change(screen.getByPlaceholderText('Business Description'), { target: { value: businessDescription } });
          fireEvent.change(screen.getByPlaceholderText('Business Address'), { target: { value: businessAddress } });
        }
      };

      it('renders signup page correctly', () => {
        renderComponent();
      });

      it('switches between vendor and customer user types', ()=>{
        renderComponent()

        const customerButton = screen.getByText('Customer')
        const vendorButton = screen.getByText('Vendor')

        //initialy the customer button is selected
        expect(customerButton).toHaveClass('bg-brown-600 text-white')

        //switch to vendor
        fireEvent.click(vendorButton)
        expect(vendorButton).toHaveClass('bg-brown-600 text-white')
        expect(customerButton).not.toHaveClass('bg-brown-600 text-white')

        //check vendor specific fields
        expect(screen.getByPlaceholderText('Business Name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Business Description')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Business Address')).toBeInTheDocument()

      })

      it('toggles password visibility', () => {
        renderComponent();
    
        const passwordInput = screen.getByPlaceholderText('Password (min. 8 characters)');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
        
        const passwordToggleButtons = screen.getAllByRole('button', { name: /show password|hide password/i });
        
        // Initially password inputs are of type 'password'
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
        // Toggle password visibility
        fireEvent.click(passwordToggleButtons[0]);
        expect(passwordInput).toHaveAttribute('type', 'text');
    
        fireEvent.click(passwordToggleButtons[1]);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
      });

      it('shows error for mismatched passwords', async () => {
        renderComponent();
    
        fillOutForm({ 
          password: 'Password123!', 
          confirmPassword: 'DifferentPassword' 
        });
    
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));
    
        await waitFor(() => {
          expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        });
      });

      it('shows error if password is less than 8 characters', async () => {
        renderComponent();

        fillOutForm({ 
          password: 'short', 
          confirmPassword: 'short' 
        });

        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
          expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
        });
      })

      it('submits form successfully for customer', async () => {
        vi.mocked(axios.post).mockResolvedValue({ status: 201 });
    
        renderComponent();
    
        fillOutForm();
    
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));
    
        await waitFor(() => {
          // Verify axios.post was called
          expect(vi.mocked(axios.post)).toHaveBeenCalledTimes(1);
          
          // Check the exact arguments passed to axios.post
          expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
            '/api/accounts/signup/', 
            expect.objectContaining({
              email: 'test@example.com',
              username: 'testuser',
              password: 'Password123!',
              phone_number: '1234567890',
              user_type: 'CUSTOMER'
            })
          );
        });
      });

    it('submits form successfully for vendor', async () => {
        vi.mocked(axios.post).mockResolvedValue({ status: 201 });
    
        renderComponent();
    
        fillOutForm({
          userType: 'VENDOR',
          businessName: 'Test Business',
          businessDescription: 'A test business description',
          businessAddress: '123 Test St'
        });
    
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));
    
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith('/api/accounts/signup/', {
            email: 'test@example.com',
            username: 'testuser',
            password: 'Password123!',
            phone_number: '1234567890',
            user_type: 'VENDOR',
            business_name: 'Test Business',
            business_description: 'A test business description',
            business_address: '123 Test St'
          });
        });
      });

      it('displays API errors', async () => {
        vi.mocked(axios.post).mockRejectedValue({
          response: {
            data: {
              email: ['Email already exists']
            }
          }
        });
    
        renderComponent();
    
        fillOutForm();
    
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));
    
        await waitFor(() => {
          expect(screen.getByText('Email already exists')).toBeInTheDocument();
        });
      });

      it('displays general error for unexpected API errors', async () => {
        vi.mocked(axios.post).mockRejectedValue(new Error('Network Error'));
    
        renderComponent();
    
        fillOutForm();
    
        fireEvent.submit(screen.getByRole('button', { name: /sign up/i }));
    
        await waitFor(() => {
          expect(screen.getByText('An unexpected error occurred. Please try again later.')).toBeInTheDocument();
        });
      });

      it('navigates to login page when already have an account link is clicked', () => {
        renderComponent();
    
        const loginLink = screen.getByText('Sign In');
        fireEvent.click(loginLink);

        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
})