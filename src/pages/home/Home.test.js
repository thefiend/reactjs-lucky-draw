import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './Home';

jest.mock('../../SiteWrapper', () => {
  return function MockSiteWrapper({ children }) {
    return <div data-testid="site-wrapper">{children}</div>;
  };
});

jest.mock('react-text-loop', () => {
  return function MockTextLoop({ children }) {
    return <div data-testid="text-loop">{Array.isArray(children) ? children[0] : children}</div>;
  };
});

jest.mock('react-dom-confetti', () => {
  return function MockConfetti() {
    return <div data-testid="confetti" />;
  };
});

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByTestId('site-wrapper')).toBeInTheDocument();
  });

  it('displays hero section when no items configured', () => {
    render(<Home />);
    expect(screen.getByText(/Free Lucky Draw Online Tool/i)).toBeInTheDocument();
  });

  it('displays configuration form', () => {
    render(<Home />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('updates drawItems state when textarea changes', () => {
    render(<Home />);
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    expect(textarea.value).toBe('Item 1\nItem 2\nItem 3');
  });

  it('configures items when form is submitted with valid data', () => {
    render(<Home />);
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    expect(screen.getByRole('button', { name: /draw/i })).toBeInTheDocument();
  });

  it('toggles skip animation state', () => {
    render(<Home />);
    const checkbox = screen.getByLabelText('Skip Animation');
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
  });

  it('toggles remove drawn item state', () => {
    render(<Home />);
    const checkbox = screen.getByLabelText('Remove Drawn Item');
    fireEvent.click(checkbox);
    fireEvent.click(checkbox);
  });

  it('shows draw button after configuration', () => {
    render(<Home />);
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    const drawButton = screen.getByRole('button', { name: /draw/i });
    expect(drawButton).toBeInTheDocument();
    expect(drawButton).not.toBeDisabled();
  });

  it('performs draw when draw button is clicked', async () => {
    jest.useFakeTimers();
    render(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    const skipAnimationCheckbox = screen.getByLabelText('Skip Animation');
    fireEvent.click(skipAnimationCheckbox);
    
    const drawButton = screen.getByRole('button', { name: /draw/i });
    fireEvent.click(drawButton);
    
    expect(screen.getByRole('button', { name: /drawing/i })).toBeInTheDocument();
    
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('displays previously drawn items after a draw', async () => {
    jest.useFakeTimers();
    render(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    const skipAnimationCheckbox = screen.getByLabelText('Skip Animation');
    fireEvent.click(skipAnimationCheckbox);
    
    const drawButton = screen.getByRole('button', { name: /draw/i });
    fireEvent.click(drawButton);
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('Previously Drawn')).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('removes drawn item from available items when "Remove Drawn Item" is checked', async () => {
    jest.useFakeTimers();
    render(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'Item 1\nItem 2\nItem 3' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    fireEvent.click(configureButton);
    
    const skipAnimationCheckbox = screen.getByLabelText('Skip Animation');
    fireEvent.click(skipAnimationCheckbox);
    
    const removeCheckbox = screen.getByLabelText('Remove Drawn Item');
    fireEvent.click(removeCheckbox);
    
    const drawButton = screen.getByRole('button', { name: /draw/i });
    fireEvent.click(drawButton);
    
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('disables configure button when drawItems is too short', () => {
    render(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Please enter the draw items here/i);
    fireEvent.change(textarea, { 
      target: { name: 'drawItems', value: 'A' } 
    });
    
    const configureButton = screen.getByRole('button', { name: /configure/i });
    expect(configureButton).toBeDisabled();
  });
});
