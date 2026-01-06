import { render, screen, fireEvent } from '@testing-library/react';
import { Input, InputGroup } from './Input.js';
import { describe, it, expect } from 'vitest';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Input inputSize="sm" placeholder="Small" />);
    let input = screen.getByPlaceholderText('Small');
    expect(input).toHaveClass('input-sm');

    rerender(<Input inputSize="md" placeholder="Medium" />);
    input = screen.getByPlaceholderText('Medium');
    expect(input).toHaveClass('input-md');

    rerender(<Input inputSize="lg" placeholder="Large" />);
    input = screen.getByPlaceholderText('Large');
    expect(input).toHaveClass('input-lg');
  });

  it('renders with error state', () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveClass('input-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders full width', () => {
    render(<Input fullWidth placeholder="Full width" />);
    const input = screen.getByPlaceholderText('Full width');
    expect(input).toHaveClass('input-full');
  });

  it('handles user input', () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText('Type here') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input.value).toBe('Hello World');
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Input data-testid="custom-input" placeholder="Test" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toBeInTheDocument();
  });

  it('supports different input types', () => {
    render(<Input type="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');
  });

  it('supports disabled state', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('supports required attribute', () => {
    render(<Input required placeholder="Required" />);
    const input = screen.getByPlaceholderText('Required');
    expect(input).toHaveAttribute('required');
  });

  it('supports aria-describedby when errorId provided', () => {
    render(<Input errorId="error-1" placeholder="With error" />);
    const input = screen.getByPlaceholderText('With error');
    expect(input).toHaveAttribute('aria-describedby', 'error-1');
  });

  it('supports aria-describedby when hintId provided', () => {
    render(<Input hintId="hint-1" placeholder="With hint" />);
    const input = screen.getByPlaceholderText('With hint');
    expect(input).toHaveAttribute('aria-describedby', 'hint-1');
  });

  it('supports aria-describedby with both errorId and hintId', () => {
    render(<Input errorId="error-1" hintId="hint-1" placeholder="With both" />);
    const input = screen.getByPlaceholderText('With both');
    expect(input).toHaveAttribute('aria-describedby', 'error-1 hint-1');
  });
});

describe('InputGroup Component', () => {
  it('renders with label', () => {
    render(<InputGroup label="Email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText('Enter email');
    const label = screen.getByText('Email');
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', expect.stringMatching(/^input-\d+$/));
  });

  it('renders with required indicator', () => {
    render(<InputGroup label="Name" required placeholder="Enter name" />);
    const label = screen.getByText('Name');
    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with hint text', () => {
    render(<InputGroup label="Password" hint="Must be at least 8 characters" placeholder="Enter password" />);
    const hint = screen.getByText('Must be at least 8 characters');
    expect(hint).toBeInTheDocument();
    expect(hint).toHaveAttribute('id', expect.stringMatching(/^input-\d+-hint$/));
  });

  it('renders with error message', () => {
    render(<InputGroup label="Email" errorMessage="Invalid email address" placeholder="Enter email" />);
    const error = screen.getByText('Invalid email address');
    expect(error).toBeInTheDocument();
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveAttribute('id', expect.stringMatching(/^input-\d+-error$/));
  });

  it('shows error message over hint when both are present', () => {
    render(
      <InputGroup
        label="Email"
        hint="Enter a valid email"
        errorMessage="Invalid format"
        error
        placeholder="Enter email"
      />
    );
    const error = screen.getByText('Invalid format');
    const hint = screen.queryByText('Enter a valid email');
    expect(error).toBeInTheDocument();
    expect(hint).not.toBeInTheDocument();
  });

  it('passes error state to Input', () => {
    render(<InputGroup label="Name" errorMessage="Required" placeholder="Enter name" />);
    const input = screen.getByPlaceholderText('Enter name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('passes required to Input', () => {
    render(<InputGroup label="Name" required placeholder="Enter name" />);
    const input = screen.getByPlaceholderText('Enter name');
    expect(input).toHaveAttribute('aria-required', 'true');
  });

  it('supports custom id', () => {
    render(<InputGroup id="custom-id" label="Name" placeholder="Enter name" />);
    const input = screen.getByPlaceholderText('Enter name');
    const label = screen.getByText('Name');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(label).toHaveAttribute('for', 'custom-id');
  });

  it('renders with custom className', () => {
    render(<InputGroup className="custom-group" label="Name" placeholder="Enter name" />);
    const container = screen.getByPlaceholderText('Enter name').parentElement;
    expect(container).toHaveClass('custom-group');
  });

  it('generates unique ids for multiple instances', () => {
    render(
      <>
        <InputGroup label="First" placeholder="First input" />
        <InputGroup label="Second" placeholder="Second input" />
      </>
    );
    const firstInput = screen.getByPlaceholderText('First input');
    const secondInput = screen.getByPlaceholderText('Second input');

    expect(firstInput).toHaveAttribute('id', expect.stringMatching(/^input-\d+$/));
    expect(secondInput).toHaveAttribute('id', expect.stringMatching(/^input-\d+$/));
    expect(firstInput.getAttribute('id')).not.toBe(secondInput.getAttribute('id'));
  });
});
