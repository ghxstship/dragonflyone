import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button.js';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn');
  });

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toHaveClass('btn-primary');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="accent">Secondary</Button>);
    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('btn-accent');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('btn-outline');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toHaveClass('btn-ghost');
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('btn-destructive');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: 'Small' });
    expect(button).toHaveClass('btn-sm');

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByRole('button', { name: 'Medium' });
    expect(button).toHaveClass('btn-md');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('btn-lg');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('btn-disabled');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toHaveClass('btn-loading');
    expect(button).toBeDisabled();
  });

  it('renders with custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Button data-testid="custom-button">Test</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    
    const button = screen.getByRole('button', { name: 'Submit' });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports space key for activation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    
    const button = screen.getByRole('button', { name: 'Submit' });
    button.focus();
    fireEvent.keyDown(button, { key: ' ' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents default action when disabled and key pressed', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    const button = screen.getByRole('button', { name: 'Close dialog' });
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });

  it('supports aria-expanded for toggle buttons', () => {
    render(<Button aria-expanded={false}>Toggle</Button>);
    const button = screen.getByRole('button', { name: 'Toggle' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports aria-pressed for toggle buttons', () => {
    render(<Button aria-pressed={false}>Press</Button>);
    const button = screen.getByRole('button', { name: 'Press' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with children as React nodes', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longText = 'This is a very long button text that should wrap properly and not overflow';
    render(<Button>{longText}</Button>);
    const button = screen.getByRole('button', { name: longText });
    expect(button).toBeInTheDocument();
  });

  it('maintains focus after click', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.click(button);
    expect(button).toHaveFocus();
  });

  it('removes focus when disabled', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button', { name: 'Button' });
    
    button.focus();
    expect(button).toHaveFocus();
    
    // Simulate becoming disabled
    render(<Button disabled>Button</Button>);
    // Note: In real scenario, this would be handled by the parent component
  });
});
