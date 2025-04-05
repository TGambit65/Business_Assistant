import React from 'react';
import { render } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />);
    
    expect(container.firstChild).toHaveClass('w-6 h-6');
  });

  it('renders with small size', () => {
    const { container } = render(<Spinner size="sm" />);
    
    expect(container.firstChild).toHaveClass('w-4 h-4');
  });

  it('renders with large size', () => {
    const { container } = render(<Spinner size="lg" />);
    
    expect(container.firstChild).toHaveClass('w-8 h-8');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
}); 