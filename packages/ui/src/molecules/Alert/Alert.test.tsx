import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from './Alert.js';
import { describe, it, expect, vi } from 'vitest';

describe('Alert Component', () => {
  it('renders with default props', () => {
    render(<Alert>Default alert</Alert>);
    const alert = screen.getByText('Default alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('alert');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    let alert = screen.getByText('Info');
    expect(alert).toHaveClass('alert-info');

    rerender(<Alert variant="success">Success</Alert>);
    alert = screen.getByText('Success');
    expect(alert).toHaveClass('alert-success');

    rerender(<Alert variant="warning">Warning</Alert>);
    alert = screen.getByText('Warning');
    expect(alert).toHaveClass('alert-warning');

    rerender(<Alert variant="error">Error</Alert>);
    alert = screen.getByText('Error');
    expect(alert).toHaveClass('alert-error');
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Content</Alert>);
    const title = screen.getByText('Alert Title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('font-bold', 'text-sm', 'uppercase', 'tracking-wide');
  });

  it('renders with icon', () => {
    const testIcon = <span data-testid="test-icon">Icon</span>;
    render(<Alert icon={testIcon}>With icon</Alert>);

    const icon = screen.getByTestId('test-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('flex-shrink-0', 'mt-0.5');
  });

  it('renders with close button when onClose provided', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Closable</Alert>);

    const closeButton = screen.getByRole('button', { name: 'Close alert' });
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when onClose not provided', () => {
    render(<Alert>Non-closable</Alert>);
    const closeButton = screen.queryByRole('button', { name: 'Close alert' });
    expect(closeButton).not.toBeInTheDocument();
  });

  it('renders with inverted styling', () => {
    render(<Alert inverted>Inverted alert</Alert>);
    const alert = screen.getByText('Inverted alert');
    expect(alert).toHaveClass('alert-inverted');
  });

  it('renders with non-inverted styling', () => {
    render(<Alert inverted={false}>Normal alert</Alert>);
    const alert = screen.getByText('Normal alert');
    expect(alert).not.toHaveClass('alert-inverted');
  });

  it('renders with custom className', () => {
    render(<Alert className="custom-class">Custom</Alert>);
    const alert = screen.getByText('Custom');
    expect(alert).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<Alert data-testid="custom-alert">Test</Alert>);
    const alert = screen.getByTestId('custom-alert');
    expect(alert).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<Alert ref={ref}>Ref test</Alert>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders complex children', () => {
    render(
      <Alert>
        <div>Complex content</div>
        <p>With multiple elements</p>
      </Alert>
    );
    expect(screen.getByText('Complex content')).toBeInTheDocument();
    expect(screen.getByText('With multiple elements')).toBeInTheDocument();
  });

  it('renders with both title and close button', () => {
    const handleClose = vi.fn();
    render(
      <Alert title="Titled Alert" onClose={handleClose}>
        Content
      </Alert>
    );

    expect(screen.getByText('Titled Alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close alert' })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders header section only when title or onClose provided', () => {
    // With title
    const { rerender } = render(<Alert title="Title">Content</Alert>);
    const header = screen.getByText('Title').parentElement;
    expect(header).toHaveClass('flex', 'items-start', 'justify-between', 'mb-2');

    // Without title or onClose
    rerender(<Alert>Content only</Alert>);
    expect(screen.queryByText('Title')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation on close button', () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Closable</Alert>);

    const closeButton = screen.getByRole('button', { name: 'Close alert' });
    closeButton.focus();

    fireEvent.keyDown(closeButton, { key: 'Enter' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('maintains proper structure with icon and content', () => {
    const testIcon = <span>Icon</span>;
    render(
      <Alert icon={testIcon}>
        <p>Paragraph content</p>
        <span>Span content</span>
      </Alert>
    );

    const contentWrapper = screen.getByText('Paragraph content').parentElement;
    expect(contentWrapper).toHaveClass('flex-1');
    expect(screen.getByText('Icon').parentElement).toHaveClass('flex-shrink-0', 'mt-0.5');
  });
});
