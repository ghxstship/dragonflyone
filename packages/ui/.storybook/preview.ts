import type { Preview, StoryFn } from '@storybook/react';
import React from 'react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a0a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: StoryFn, context: any) => {
      const { theme } = context.globals;
      
      return React.createElement(
        'div',
        { className: `theme-${theme}` },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;
