import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../molecules/Card/Card.js';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component with Pop Art aesthetic featuring sharp edges and hard offset shadows. Supports various variants and interactive states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'primary', 'accent'],
      description: 'Card style variant',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable interactive states',
    },
    asButton: {
      control: 'boolean',
      description: 'Render as button when onClick provided',
    },
    children: {
      control: 'text',
      description: 'Card content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Default card content with basic styling.',
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: 'Elevated card with enhanced shadow.',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined card with border emphasis.',
  },
};

export const Interactive: Story = {
  args: {
    variant: 'default',
    interactive: true,
    children: 'Interactive card with hover effects.',
  },
};

// Padding Variants (using className for padding)
export const NoPadding: Story = {
  args: {
    variant: 'elevated',
    className: 'p-0',
    children: 'Card with no padding - content touches edges.',
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'elevated',
    className: 'p-2',
    children: 'Card with small padding.',
  },
};

export const MediumPadding: Story = {
  args: {
    variant: 'elevated',
    className: 'p-4',
    children: 'Card with medium padding - default.',
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'elevated',
    className: 'p-6',
    children: 'Card with large padding for spacious content.',
  },
};

// Complex Content Examples
export const WithHeader: Story = {
  render: () => (
    <Card variant="elevated" className="p-6">
      <div style={{ borderBottom: '2px solid var(--border-primary)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Card Header</h3>
      </div>
      <div>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          This is a card with a distinct header section and content area.
        </p>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with header section demonstrating layout possibilities.',
      },
    },
  },
};

export const WithActions: Story = {
  render: () => (
    <Card variant="elevated" className="p-6">
      <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Action Card</h3>
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)' }}>
        Card content with action buttons at the bottom.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button style={{ 
          padding: '0.5rem 1rem', 
          border: '2px solid var(--border-primary)',
          background: 'transparent',
          color: 'var(--text-primary)'
        }}>
          Cancel
        </button>
        <button style={{ 
          padding: '0.5rem 1rem', 
          border: '2px solid var(--color-brand-primary)',
          background: 'var(--color-brand-primary)',
          color: 'var(--color-text-inverse)'
        }}>
          Save
        </button>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with action buttons demonstrating interactive use cases.',
      },
    },
  },
};

export const MediaCard: Story = {
  render: () => (
    <Card variant="elevated" className="p-0">
      <div style={{ 
        height: '120px', 
        background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        🎨
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Media Card</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Card with media content and text description.
        </p>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card with media content demonstrating complex layouts.',
      },
    },
  },
};

// Interactive Examples
export const CardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', width: '600px' }}>
      <Card variant="elevated" className="p-6">
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Feature One</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Description of the first feature card.</p>
      </Card>
      <Card variant="elevated" className="p-6">
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Feature Two</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Description of the second feature card.</p>
      </Card>
      <Card variant="elevated" className="p-6">
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Feature Three</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Description of the third feature card.</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid layout showing multiple cards in a responsive grid.',
      },
    },
  },
};

export const BrandVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
      <Card variant="default" interactive className="p-4" style={{ borderColor: 'hsl(var(--brand-pink))' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--brand-pink))' }}>ATLVS Style</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Pink brand accent card.</p>
      </Card>
      <Card variant="default" interactive className="p-4" style={{ borderColor: 'hsl(var(--brand-yellow))' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--brand-yellow))' }}>COMPVSS Style</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Yellow brand accent card.</p>
      </Card>
      <Card variant="default" interactive className="p-4" style={{ borderColor: 'hsl(var(--brand-cyan))' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'hsl(var(--brand-cyan))' }}>GVTEWAY Style</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cyan brand accent card.</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Brand-specific card variants showing different accent colors.',
      },
    },
  },
};
