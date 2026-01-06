import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox.js';
import { describe, it, expect, vi } from 'vitest';

describe('Checkbox Component', () => {
  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    const label = screen.getByText('Accept terms');
    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    render(<Checkbox label="Default" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Default' });
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Checkbox label="Checked" checked />);
    const checkbox = screen.getByRole('checkbox', { name: 'Checked' });
    expect(checkbox).toBeChecked();
  });

  it('handles click events', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Clickable" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Clickable' });
    fireEvent.click(checkbox);

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
    render(<Checkbox label="Label click" onChange={handleChange} />);

    const label = screen.getByText('Label click');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled state', () => {
    const { rerender } = render(<Checkbox label="Controlled" checked={false} />);
    let checkbox = screen.getByRole('checkbox', { name: 'Controlled' });
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox label="Controlled" checked={true} />);
    checkbox = screen.getByRole('checkbox', { name: 'Controlled' });
    expect(checkbox).toBeChecked();
  });

  it('supports disabled state', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Disabled" disabled onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Disabled' });
    expect(checkbox).toBeDisabled();

    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports required attribute', () => {
    render(<Checkbox label="Required" required />);
    const checkbox = screen.getByRole('checkbox', { name: 'Required' });
    expect(checkbox).toHaveAttribute('required');
  });

  it('renders with custom className', () => {
    render(<Checkbox label="Custom" className="custom-class" />);
    const label = screen.getByText('Custom').parentElement;
    expect(label).toHaveClass('custom-class');
  });

  it('supports custom attributes', () => {
    render(<Checkbox label="Test" data-testid="custom-checkbox" />);
    const checkbox = screen.getByTestId('custom-checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('maintains accessibility with label association', () => {
    render(<Checkbox label="Accessible" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Accessible' });
    const label = screen.getByText('Accessible');

    // The label should be associated with the checkbox via the label element wrapping
    expect(checkbox.parentElement?.tagName).toBe('LABEL');
    expect(label.parentElement?.tagName).toBe('LABEL');
  });

  it('applies correct styling for checked state', () => {
    render(<Checkbox label="Styled" checked />);
    const checkbox = screen.getByRole('checkbox', { name: 'Styled' });
    expect(checkbox).toHaveClass('checkbox-checked');
  });

  it('applies correct styling for unchecked state', () => {
    render(<Checkbox label="Styled" checked={false} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Styled' });
    expect(checkbox).toHaveClass('checkbox-unchecked');
  });

  it('handles keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Keyboard" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Keyboard' });
    checkbox.focus();

    fireEvent.keyDown(checkbox, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports form integration', () => {
    render(<Checkbox label="Form" name="test-checkbox" value="yes" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Form' });
    expect(checkbox).toHaveAttribute('name', 'test-checkbox');
    expect(checkbox).toHaveAttribute('value', 'yes');
  });
});
