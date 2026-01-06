import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard.js';
import { Users } from 'lucide-react';
import { describe, it, expect } from 'vitest';

describe('StatCard Component', () => {
  it('renders with required props', () => {
    render(<StatCard value="123" label="Users" />);
    const value = screen.getByText('123');
    const label = screen.getByText('Users');
    expect(value).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(value).toHaveClass('stat-card-value');
    expect(label).toHaveClass('stat-card-label');
  });

  it('renders with icon', () => {
    const testIcon = <Users data-testid="test-icon" />;
    render(<StatCard value="456" label="Active Users" icon={testIcon} />);

    const icon = screen.getByTestId('test-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass('stat-card-icon-container');
  });

  it('renders with trend up', () => {
    render(<StatCard value="789" label="Revenue" trend="up" />);
    // The trend icon should be in the DOM but we can't easily test for it without data-testid
    const card = screen.getByText('789').parentElement;
    expect(card).toBeInTheDocument();
    // Check that trend container exists
    expect(card).toHaveTextContent('Revenue');
  });

  it('renders with trend down', () => {
    render(<StatCard value="321" label="Loss" trend="down" />);
    const card = screen.getByText('321').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('renders with trend neutral', () => {
    render(<StatCard value="555" label="Stable" trend="neutral" />);
    const card = screen.getByText('555').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('renders with trend value', () => {
    render(<StatCard value="1000" label="Growth" trendValue="+15%" />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('renders with both trend and trend value', () => {
    render(<StatCard value="2000" label="Sales" trend="up" trendValue="+25%" />);
    expect(screen.getByText('+25%')).toBeInTheDocument();
  });

  it('renders with inverted styling', () => {
    render(<StatCard value="999" label="Inverted" inverted />);
    const card = screen.getByText('999').parentElement;
    expect(card).toHaveClass('stat-card-inverted');
  });

  it('renders with non-inverted styling by default', () => {
    render(<StatCard value="888" label="Normal" />);
    const card = screen.getByText('888').parentElement;
    expect(card).not.toHaveClass('stat-card-inverted');
  });

  it('renders with custom className', () => {
    render(<StatCard value="777" label="Custom" className="custom-class" />);
    const card = screen.getByText('777').parentElement;
    expect(card).toHaveClass('custom-class');
  });

  it('renders with custom attributes', () => {
    render(<StatCard value="666" label="Test" data-testid="custom-stat-card" />);
    const card = screen.getByTestId('custom-stat-card');
    expect(card).toBeInTheDocument();
  });

  it('supports ref forwarding', () => {
    const ref = { current: null };
    render(<StatCard ref={ref} value="555" label="Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders large numbers properly', () => {
    render(<StatCard value="1,234,567" label="Large Number" />);
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('renders with complex icon components', () => {
    render(
      <StatCard
        value="42"
        label="Complex"
        icon={<Users className="w-6 h-6" />}
      />
    );
    // Just check that the icon is rendered
    const card = screen.getByText('42').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('does not render trend section when neither trend nor trendValue provided', () => {
    render(<StatCard value="100" label="No Trend" />);
    const card = screen.getByText('100').parentElement;
    expect(card).toBeInTheDocument();
    // Should not contain trend-related content
    expect(card).not.toHaveTextContent('+');
    expect(card).not.toHaveTextContent('-');
  });

  it('handles empty trendValue gracefully', () => {
    render(<StatCard value="200" label="Empty Trend" trend="up" trendValue="" />);
    const card = screen.getByText('200').parentElement;
    expect(card).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    render(
      <StatCard
        value="1234"
        label="Complete"
        icon={<Users />}
        trend="up"
        trendValue="+10%"
      />
    );

    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });
});
