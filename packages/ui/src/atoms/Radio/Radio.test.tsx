import { render, screen, fireEvent } from '@testing-library/react';
import { Radio } from './Radio.js';
import { describe, it, expect, vi } from 'vitest';

describe('Radio Component', () => {
  it('renders with label', () => {
    render(<Radio label="Option A" />);
    const radio = screen.getByRole('radio', { name: 'Option A' });
    const label = screen.getByText('Option A');
    expect(radio).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Radio />);
    const radio = screen.getByRole('radio');
    expect(radio).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    render(<Radio label="Default" />);
    const radio = screen.getByRole('radio', { name: 'Default' });
    expect(radio).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Radio label="Checked" checked />);
    const radio = screen.getByRole('radio', { name: 'Checked' });
    expect(radio).toBeChecked();
  });

  it('handles click events', () => {
    const handleChange = vi.fn();
    render(<Radio label="Clickable" onChange={handleChange} />);

    const radio = screen.getByRole('radio', { name: 'Clickable' });
    fireEvent.click(radio);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        checked: true,
        type: 'radio'
      })
    }));
  });

  it('handles label click events', () => {
    const handleChange = vi.fn();
    render(<Radio label="Label click" onChange={handleChange} />);

    const label = screen.getByText('Label click');
    fireEvent.click(label);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled state', () => {
    const { rerender } = render(<Radio label="Controlled" checked={false} />);
    let radio = screen.getByRole('radio', { name: 'Controlled' });
    expect(radio).not.toBeChecked();

    rerender(<Radio label="Controlled" checked={true} />);
    radio = screen.getByRole('radio', { name: 'Controlled' });
    expect(radio).toBeChecked();
  });

  it('supports disabled state', () => {
    const handleChange = vi.fn();
    render(<Radio label="Disabled" disabled onChange={handleChange} />);

    const radio = screen.getByRole('radio', { name: 'Disabled' });
    expect(radio).toBeDisabled();

    fireEvent.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports required attribute', () => {
    render(<Radio label="Required" required />);
    const radio = screen.getByRole('radio', { name: 'Required' });
    expect(radio).toHaveAttribute('required');
  });

  it('renders with custom className', () => {
    render(<Radio label="Custom" className="custom-class" />);
    const label = screen.getByText('Custom').parentElement;
    expect(label).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Radio label="Test" data-testid="custom-radio" />);
    const radio = screen.getByTestId('custom-radio');
    expect(radio).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Radio ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('renders label with correct styling', () => {
    render(<Radio label="Styled Label" />);
    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('font-body', 'text-sm', 'select-none');
  });

  it('supports keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Radio label="Keyboard" onChange={handleChange} />);

    const radio = screen.getByRole('radio', { name: 'Keyboard' });
    radio.focus();

    fireEvent.keyDown(radio, { key: ' ' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports form integration', () => {
    render(<Radio label="Form" name="test-radio" value="option1" />);
    const radio = screen.getByRole('radio', { name: 'Form' });
    expect(radio).toHaveAttribute('name', 'test-radio');
    expect(radio).toHaveAttribute('value', 'option1');
  });

  it('maintains proper accessibility with label association', () => {
    render(<Radio label="Accessible" />);
    const radio = screen.getByRole('radio', { name: 'Accessible' });
    const label = screen.getByText('Accessible');

    // The label should be associated with the radio via the label element wrapping
    expect(radio.parentElement?.tagName).toBe('LABEL');
    expect(label.parentElement?.tagName).toBe('LABEL');
  });

  it('handles multiple radios in a group', () => {
    render(
      <>
        <Radio label="Option 1" name="group" value="1" />
        <Radio label="Option 2" name="group" value="2" />
      </>
    );

    const radio1 = screen.getByRole('radio', { name: 'Option 1' });
    const radio2 = screen.getByRole('radio', { name: 'Option 2' });

    expect(radio1).toHaveAttribute('name', 'group');
    expect(radio2).toHaveAttribute('name', 'group');
    expect(radio1).toHaveAttribute('value', '1');
    expect(radio2).toHaveAttribute('value', '2');
  });
});
