import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../src/components/Footer';

// Mock the Lucide React icons
vi.mock('lucide-react', () => ({
  Twitter: () => <div data-testid="twitter-icon" />,
  Facebook: () => <div data-testid="facebook-icon" />,
  Instagram: () => <div data-testid="instagram-icon" />,
  Linkedin: () => <div data-testid="linkedin-icon" />
}));

describe('Footer', () => {
  it('renders the company name', () => {
    render(<Footer />);
    expect(screen.getByText('☕ Coffee Haven')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Footer />);
    expect(screen.getByText('About')).toHaveAttribute('href', '/about');
    expect(screen.getByText('Services')).toHaveAttribute('href', '/contact');
    expect(screen.getByText('Contact')).toHaveAttribute('href', '/contact');
  });

  it('renders social media icons with correct links', () => {
    render(<Footer />);
    
    // Get all social media links
    const socialLinks = screen.getAllByRole('link', { 
      name: /twitter|facebook|instagram|linkedin/i 
    });

    // Check if each social icon exists and has correct attributes
    const socialMedia = [
      { icon: 'twitter-icon', url: 'https://twitter.com' },
      { icon: 'facebook-icon', url: 'https://facebook.com' },
      { icon: 'instagram-icon', url: 'https://instagram.com' },
      { icon: 'linkedin-icon', url: 'https://linkedin.com' }
    ];

    socialMedia.forEach(({ icon, url }, index) => {
      const link = socialLinks[index];
      expect(link).toHaveAttribute('href', url);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByTestId(icon)).toBeInTheDocument();
    });
  });

  it('renders current year in copyright notice', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer />);
    
    const privacyLink = screen.getByText('Privacy Policy');
    const termsLink = screen.getByText('Terms of Service');

    expect(privacyLink).toHaveAttribute('href', '/privacy');
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('renders with correct layout classes', () => {
    const { container } = render(<Footer />);
    
    // Check if footer has the correct background and padding classes
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-black', 'bg-opacity-95', 'text-white', 'py-8', 'px-4');

    // Check if main content wrapper has correct layout classes
    const mainContent = container.querySelector('div');
    expect(mainContent).toHaveClass('max-w-screen-xl', 'mx-auto', 'flex');
  });
});