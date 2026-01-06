import { render, screen, fireEvent } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from './Card.js';
import { describe, it, expect, vi } from 'vitest';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('card');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="default">Default</Card>);
    let card = screen.getByText('Default');
    expect(card).toHaveClass('card-default');

    rerender(<Card variant="elevated">Elevated</Card>);
    card = screen.getByText('Elevated');
    expect(card).toHaveClass('card-elevated');

    rerender(<Card variant="outlined">Outlined</Card>);
    card = screen.getByText('Outlined');
    expect(card).toHaveClass('card-outlined');
  });

  it('renders with interactive styling', () => {
    render(<Card interactive>Interactive</Card>);
    const card = screen.getByText('Interactive');
    expect(card).toHaveClass('card-interactive');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickable</Card>);

    const card = screen.getByText('Clickable');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation when clickable', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Keyboard</Card>);

    const card = screen.getByText('Keyboard');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');

    card.focus();
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports space key for activation', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Space</Card>);

    const card = screen.getByText('Space');
    card.focus();
    fireEvent.keyDown(card, { key: ' ' });

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is not keyboard accessible when not clickable', () => {
    render(<Card>Non-clickable</Card>);
    const card = screen.getByText('Non-clickable');
    expect(card).not.toHaveAttribute('role');
    expect(card).not.toHaveAttribute('tabIndex');
  });

  it('supports asButton prop for accessibility', () => {
    render(<Card asButton>As button</Card>);
    const card = screen.getByText('As button');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('renders with custom className', () => {
    render(<Card className="custom-class">Custom</Card>);
    const card = screen.getByText('Custom');
    expect(card).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Card data-testid="custom-card">Test</Card>);
    const card = screen.getByTestId('custom-card');
    expect(card).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Card ref={ref}>Ref test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader Component', () => {
  it('renders with children', () => {
    render(<CardHeader>Header content</CardHeader>);
    const header = screen.getByText('Header content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('pb-4', 'mb-4', 'border-b-2');
  });

  it('renders with custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>);
    const header = screen.getByText('Header');
    expect(header).toHaveClass('custom-header');
  });
});

describe('CardTitle Component', () => {
  it('renders with children', () => {
    render(<CardTitle>Title text</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Title text');
    expect(title).toHaveClass('font-heading', 'text-lg', 'uppercase', 'tracking-wider', 'font-bold');
  });

  it('renders with custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveClass('custom-title');
  });
});

describe('CardDescription Component', () => {
  it('renders with children', () => {
    render(<CardDescription>Description text</CardDescription>);
    const description = screen.getByText('Description text');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm', 'mt-1');
  });

  it('renders with custom className', () => {
    render(<CardDescription className="custom-desc">Description</CardDescription>);
    const description = screen.getByText('Description');
    expect(description).toHaveClass('custom-desc');
  });
});

describe('CardBody Component', () => {
  it('renders with children', () => {
    render(<CardBody>Body content</CardBody>);
    const body = screen.getByText('Body content');
    expect(body).toBeInTheDocument();
    expect(body).toHaveClass('mb-4');
  });

  it('renders with custom className', () => {
    render(<CardBody className="custom-body">Body</CardBody>);
    const body = screen.getByText('Body');
    expect(body).toHaveClass('custom-body');
  });
});

describe('CardFooter Component', () => {
  it('renders with children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    const footer = screen.getByText('Footer content');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('mt-4', 'pt-4', 'border-t-2');
  });

  it('renders with custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-footer');
  });
});

describe('Card Composition', () => {
  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
          <CardDescription>A test card description</CardDescription>
        </CardHeader>
        <CardBody>
          This is the main content of the card.
        </CardBody>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Card');
    expect(screen.getByText('A test card description')).toBeInTheDocument();
    expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Action');
  });
});
