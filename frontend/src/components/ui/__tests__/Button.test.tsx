import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    // Check for semantic classes from variantStyles
    expect(button).toHaveClass('bg-primary'); 
    expect(button).toHaveClass('text-primary-foreground'); 
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="secondary">Click me</Button>);
    // Check for semantic classes from variantStyles
    expect(screen.getByRole('button')).toHaveClass('bg-secondary');
    expect(screen.getByRole('button')).toHaveClass('text-secondary-foreground');

    // Note: 'danger' variant doesn't exist in the component, test should likely use 'ghost' or 'link'
    rerender(<Button variant="ghost">Click me</Button>); 
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent'); // Check ghost style

    rerender(<Button variant="link">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-primary'); // Check link style
  });

  it('applies size styles correctly', () => {
    const { rerender } = render(<Button size="sm">Click me</Button>);
    // Check for semantic classes from sizeStyles
    expect(screen.getByRole('button')).toHaveClass('h-8'); // Check sm style
    expect(screen.getByRole('button')).toHaveClass('text-xs'); 

    rerender(<Button size="lg">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-12'); // Check lg style
    // Note: text size for lg is not explicitly defined in sizeStyles['lg'], it uses default
  });

  it('handles disabled state', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    // Check for the standard disabled classes applied by cn utility
    expect(button).toHaveClass('disabled:pointer-events-none');
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 