import { render, screen } from '@testing-library/react';
import { Badge } from './Badge.js';
import { describe, it, expect } from 'vitest';

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge');
  });

  it('renders with solid variant', () => {
    render(<Badge variant="solid">Solid</Badge>);
    const badge = screen.getByText('Solid');
    expect(badge).toHaveClass('badge-solid');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText('Outline');
    expect(badge).toHaveClass('badge-outline');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('badge-success');
  });

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('badge-warning');
  });

  it('renders with error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('badge-error');
  });

  it('renders with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('badge-info');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    let badge = screen.getByText('Small');
    expect(badge).toHaveClass('badge-sm');

    rerender(<Badge size="md">Medium</Badge>);
    badge = screen.getByText('Medium');
    expect(badge).toHaveClass('badge-md');

    rerender(<Badge size="lg">Large</Badge>);
    badge = screen.getByText('Large');
    expect(badge).toHaveClass('badge-lg');
  });

  it('renders with custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders with custom color', () => {
    render(<Badge color="#ff6b6b">Custom Color</Badge>);
    const badge = screen.getByText('Custom Color');
    expect(badge).toHaveStyle({ backgroundColor: '#ff6b6b' });
  });

  it('renders with custom text color', () => {
    render(<Badge color="#ff6b6b" textColor="#ffffff">Custom Text</Badge>);
    const badge = screen.getByText('Custom Text');
    expect(badge).toHaveStyle({
      backgroundColor: '#ff6b6b',
      color: '#ffffff'
    });
  });

  it('applies custom style', () => {
    render(<Badge style={{ margin: '10px' }}>Styled</Badge>);
    const badge = screen.getByText('Styled');
    expect(badge).toHaveStyle({ margin: '10px' });
  });

  it('renders with custom attributes', () => {
    render(<Badge data-testid="custom-badge">Test</Badge>);
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toBeInTheDocument();
  });

  it('renders with complex children', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('renders with long text content', () => {
    const longText = 'This is a very long badge text that should display properly';
    render(<Badge>{longText}</Badge>);
    const badge = screen.getByText(longText);
    expect(badge).toBeInTheDocument();
  });
});
