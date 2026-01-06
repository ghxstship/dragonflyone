import { render, screen } from '@testing-library/react';
import { Text } from './Text.js';
import { describe, it, expect } from 'vitest';

describe('Text Component', () => {
  it('renders with default props', () => {
    render(<Text>Default text</Text>);
    const text = screen.getByText('Default text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveClass('text');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Text variant="default">Default</Text>);
    let text = screen.getByText('Default');
    expect(text).toHaveClass('text-default');

    rerender(<Text variant="muted">Muted</Text>);
    text = screen.getByText('Muted');
    expect(text).toHaveClass('text-muted');

    rerender(<Text variant="accent">Accent</Text>);
    text = screen.getByText('Accent');
    expect(text).toHaveClass('text-accent');

    rerender(<Text variant="mono">Mono</Text>);
    text = screen.getByText('Mono');
    expect(text).toHaveClass('text-mono');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Text size="xs">Extra Small</Text>);
    let text = screen.getByText('Extra Small');
    expect(text).toHaveClass('text-xs');

    rerender(<Text size="sm">Small</Text>);
    text = screen.getByText('Small');
    expect(text).toHaveClass('text-sm');

    rerender(<Text size="md">Medium</Text>);
    text = screen.getByText('Medium');
    expect(text).toHaveClass('text-md');

    rerender(<Text size="lg">Large</Text>);
    text = screen.getByText('Large');
    expect(text).toHaveClass('text-lg');

    rerender(<Text size="xl">Extra Large</Text>);
    text = screen.getByText('Extra Large');
    expect(text).toHaveClass('text-xl');
  });

  it('renders with different weights', () => {
    const { rerender } = render(<Text weight="normal">Normal</Text>);
    let text = screen.getByText('Normal');
    expect(text).toHaveClass('text-normal');

    rerender(<Text weight="medium">Medium</Text>);
    text = screen.getByText('Medium');
    expect(text).toHaveClass('text-medium');

    rerender(<Text weight="semibold">Semibold</Text>);
    text = screen.getByText('Semibold');
    expect(text).toHaveClass('text-semibold');

    rerender(<Text weight="bold">Bold</Text>);
    text = screen.getByText('Bold');
    expect(text).toHaveClass('text-bold');
  });

  it('renders with inverted variant', () => {
    render(<Text inverted>Inverted text</Text>);
    const text = screen.getByText('Inverted text');
    expect(text).toHaveClass('text-inverted');
  });

  it('renders with custom className', () => {
    render(<Text className="custom-class">Custom</Text>);
    const text = screen.getByText('Custom');
    expect(text).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Text data-testid="custom-text">Test</Text>);
    const text = screen.getByTestId('custom-text');
    expect(text).toBeInTheDocument();
  });

  it('renders with complex children', () => {
    render(
      <Text>
        <span>Icon</span>
        <strong>Bold text</strong>
      </Text>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });

  it('renders with long text content', () => {
    const longText = 'This is a very long text content that should render properly without any issues or overflow problems';
    render(<Text>{longText}</Text>);
    const text = screen.getByText(longText);
    expect(text).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Text ref={ref}>Ref test</Text>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('combines multiple variants correctly', () => {
    render(
      <Text
        variant="accent"
        size="lg"
        weight="bold"
        inverted
        className="additional-class"
      >
        Combined
      </Text>
    );
    const text = screen.getByText('Combined');
    expect(text).toHaveClass('text-accent');
    expect(text).toHaveClass('text-lg');
    expect(text).toHaveClass('text-bold');
    expect(text).toHaveClass('text-inverted');
    expect(text).toHaveClass('additional-class');
  });
});
