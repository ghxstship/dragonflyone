import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button.js';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'The Button component is a fundamental interactive element that supports various styles, sizes, and states. It follows the Pop Art aesthetic with sharp edges and bold shadows.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'primary', 'accent', 'destructive'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading state',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'accent',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    variant: 'primary',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    variant: 'primary',
    children: 'Large Button',
  },
};

// States
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...',
  },
};

// With Icons
export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: '🚀 Launch',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'outline',
    size: 'sm',
    children: '⚡',
  },
};

// Interactive Examples
export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button group showing all variants together for comparison.',
      },
    },
  },
};

export const InteractiveStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="primary">Default</Button>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="primary" isLoading>Loading</Button>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="accent">Default</Button>
        <Button variant="accent" disabled>Disabled</Button>
        <Button variant="accent" isLoading>Loading</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive states showing default, disabled, and loading variants.',
      },
    },
  },
};
