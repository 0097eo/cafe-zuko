import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import AboutPage from '../src/pages/About';
import * as LucideReact from 'lucide-react';

// Mock the image import
vi.mock('../assets/about.jpg', () => ({ default: 'mocked-image-path' }));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Coffee: () => <div data-testid="coffee-icon" />,
    Award: () => <div data-testid="award-icon" />,
    Users: () => <div data-testid="users-icon" />,
    Truck: () => <div data-testid="truck-icon" />,
    Heart: () => <div data-testid="heart-icon" />,
    CoffeeBean: () => <div data-testid="coffee-bean-icon" />, // Add this alias explicitly
  }));
  

describe('AboutPage', () => {
  it('renders the page title', () => {
    render(<AboutPage />);
    expect(screen.getByText('Our Coffee Journey')).toBeInTheDocument();
  });

  it('renders the page subtitle', () => {
    render(<AboutPage />);
    expect(screen.getByText(/Crafting exceptional coffee experiences since 1998/)).toBeInTheDocument();
  });

  it('renders all stats correctly', () => {
    render(<AboutPage />);
    const statLabels = ['Coffee Varieties', 'Happy Customers', 'Years Experience', 'Satisfaction Rate'];
    const statValues = ['15+', '10K+', '25+', '98%'];

    statLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    statValues.forEach(value => {
      expect(screen.getByText(value)).toBeInTheDocument();
    });
  });

  it('renders all values section cards', () => {
    render(<AboutPage />);
    const valuesTitles = ['Quality First', 'Expert Roasting', 'Swift Delivery'];
    
    valuesTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('renders the about image', () => {
    render(<AboutPage />);
    const image = screen.getByAltText('Coffee roasting process');
    expect(image).toBeInTheDocument();
  });

});