import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextArea } from '../TextArea';

describe('TextArea', () => {
  it('renders with label', () => {
    // Pass an explicit id for reliable testing
    render(<TextArea id="test-textarea" label="Test Label" />); 
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<TextArea placeholder="Test placeholder" />);
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(<TextArea error="Test error" />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<TextArea onChange={handleChange} />);
    
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test value' }
    });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<TextArea className="custom-class" />);
    
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
}); 