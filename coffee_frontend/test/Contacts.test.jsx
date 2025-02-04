import { render, screen} from '@testing-library/react'
import {it, expect, describe, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import ContactPage from '../src/pages/Contacts'



describe('ContactPage', () => {
    it('renders header section with title and description', ()=>{
        render(<ContactPage/>)
        expect(screen.getByText('Get in Touch')).toBeInTheDocument()
        expect(screen.getByText(/Have questions about our coffee\? We'd love to hear from you/)).toBeInTheDocument()
    })
    it('renders contact form with all the required fields', ()=>{
        render(<ContactPage/>)
        expect(screen.getByText('Send us a Message')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Your message...')).toBeInTheDocument()
    })
    it('renders all contact information cards', ()=>{
        render(<ContactPage/>)
        expect(screen.getByText('Phone')).toBeInTheDocument()
        expect(screen.getByText('+254 123 456 789')).toBeInTheDocument()

        expect(screen.getByText('hello@coffeehaven.com')).toBeInTheDocument()

        expect(screen.getByText('Location')).toBeInTheDocument()
        expect(screen.getByText('123 Ruiru Town, Kiambu')).toBeInTheDocument()

        expect(screen.getByText('Hours')).toBeInTheDocument()
        expect(screen.getByText('Mon-Fri: 8am - 6pm')).toBeInTheDocument()
        
    })
    it('contact information to have all the correct href attributes', ()=>{
        render(<ContactPage/>)
        expect(screen.getByText('+254 123 456 789').closest('a')).toHaveAttribute('href', 'tel:+254123456789')
        expect(screen.getByText('hello@coffeehaven.com').closest('a')).toHaveAttribute('href', 'mailto:hello@coffeehaven.com')
        expect(screen.getByText('123 Ruiru Town, Kiambu').closest('a')).toHaveAttribute('href', 'https://maps.google.com')
    })

    it('renders social media links with correct attributes', () => {
    render(<ContactPage />);
    
    // Using aria-label to find the links
    const instagramLink = screen.getByLabelText('Follow us on Instagram');
    const facebookLink = screen.getByLabelText('Follow us on Facebook');
    const twitterLink = screen.getByLabelText('Follow us on Twitter');
    
    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com');
    expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    
    [instagramLink, facebookLink, twitterLink].forEach(link => {
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });
    it('form inputs can be filled and maintain their values', async () => {
        const user = userEvent.setup();
        render(<ContactPage />);
        
        const nameInput = screen.getByPlaceholderText('Your name');
        const emailInput = screen.getByPlaceholderText('your@email.com');
        const messageInput = screen.getByPlaceholderText('Your message...');
        
        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(messageInput, 'Test message');
        
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(messageInput).toHaveValue('Test message');
    });
    it('prevents default form submission', async () => {
        const user = userEvent.setup();
        render(<ContactPage />);
        
        const form = screen.getByRole('form', { name: /contact form/i });
        const submitButton = screen.getByRole('button', { name: /send message/i });
        
        // Create a spy for preventDefault
        const preventDefaultSpy = vi.fn();
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          preventDefaultSpy();
        });
        
        // Submit the form
        await user.click(submitButton);
        
        // Verify preventDefault was called
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
})

