import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from './Switch.js';
import { describe, it, expect, vi } from 'vitest';

describe('Switch Component', () => {
  it('renders with label', () => {
    render(<Switch label="Enable notifications" />);
    const switchElement = screen.getByRole('switch', { name: 'Enable notifications' });
    const label = screen.getByText('Enable notifications');
    expect(switchElement).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    render(<Switch label="Default" />);
    const switchElement = screen.getByRole('switch', { name: 'Default' });
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked when checked prop is true', () => {
    render(<Switch label="Checked" checked />);
    const switchElement = screen.getByRole('switch', { name: 'Checked' });
    expect(switchElement).toBeChecked();
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('handles click events', () => {
    const handleChange = vi.fn();
    render(<Switch label="Clickable" onChange={handleChange} />);

    const switchElement = screen.getByRole('switch', { name: 'Clickable' });
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        checked: true,
        type: 'checkbox'
      })
    }));
  });

  it('handles label click events', () => {
    const handleChange = vi.fn();
    render(<Switch label="Label click" onChange={handleChange} />);

    const label = screen.getByText('Label click');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled state', () => {
    const { rerender } = render(<Switch label="Controlled" checked={false} />);
    let switchElement = screen.getByRole('switch', { name: 'Controlled' });
    expect(switchElement).not.toBeChecked();

    rerender(<Switch label="Controlled" checked={true} />);
    switchElement = screen.getByRole('switch', { name: 'Controlled' });
    expect(switchElement).toBeChecked();
  });

  it('supports disabled state', () => {
    const handleChange = vi.fn();
    render(<Switch label="Disabled" disabled onChange={handleChange} />);

    const switchElement = screen.getByRole('switch', { name: 'Disabled' });
    expect(switchElement).toBeDisabled();

    fireEvent.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders with custom className', () => {
    render(<Switch label="Custom" className="custom-class" />);
    const label = screen.getByText('Custom').parentElement;
    expect(label).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Switch label="Test" data-testid="custom-switch" />);
    const switchElement = screen.getByTestId('custom-switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Switch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('maintains proper accessibility attributes', () => {
    render(<Switch label="Accessible" />);
    const switchElement = screen.getByRole('switch', { name: 'Accessible' });
    expect(switchElement).toHaveAttribute('role', 'switch');
    expect(switchElement).toHaveAttribute('aria-checked');
    expect(switchElement).toHaveClass('sr-only'); // Screen reader only
  });

  it('supports keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Switch label="Keyboard" onChange={handleChange} />);

    const switchElement = screen.getByRole('switch', { name: 'Keyboard' });
    switchElement.focus();

    fireEvent.keyDown(switchElement, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports Enter key for activation', () => {
    const handleChange = vi.fn();
    render(<Switch label="Enter" onChange={handleChange} />);

    const switchElement = screen.getByRole('switch', { name: 'Enter' });
    switchElement.focus();

    fireEvent.keyDown(switchElement, { key: 'Enter' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('has correct visual styling for checked state', () => {
    render(<Switch label="Checked" checked />);
    const switchElement = screen.getByRole('switch', { name: 'Checked' });
    // The track and thumb should have appropriate classes
    const container = switchElement.parentElement;
    expect(container).toHaveClass('relative');
  });

  it('has correct visual styling for unchecked state', () => {
    render(<Switch label="Unchecked" checked={false} />);
    const switchElement = screen.getByRole('switch', { name: 'Unchecked' });
    const container = switchElement.parentElement;
    expect(container).toHaveClass('relative');
  });

  it('renders label with correct styling', () => {
    render(<Switch label="Styled Label" />);
    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('font-body', 'text-sm', 'select-none');
  });

  it('handles form integration', () => {
    render(<Switch label="Form" name="test-switch" value="on" />);
    const switchElement = screen.getByRole('switch', { name: 'Form' });
    expect(switchElement).toHaveAttribute('name', 'test-switch');
    expect(switchElement).toHaveAttribute('value', 'on');
  });
});
