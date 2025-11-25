import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const mockProject = (overrides = {}) => ({
  id: '1',
  name: 'Test Project',
  status: 'active',
  budget: 100000,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const mockContact = (overrides = {}) => ({
  id: '1',
  name: 'Test Contact',
  email: 'test@example.com',
  company: 'Test Company',
  ...overrides,
});

export const mockAsset = (overrides = {}) => ({
  id: '1',
  name: 'Test Asset',
  type: 'equipment',
  status: 'available',
  value: 5000,
  ...overrides,
});

// Test data builders
export class ProjectBuilder {
  private project: any = {
    id: '1',
    name: 'Test Project',
    status: 'active',
    budget: 100000,
  };

  withId(id: string) {
    this.project.id = id;
    return this;
  }

  withName(name: string) {
    this.project.name = name;
    return this;
  }

  withStatus(status: string) {
    this.project.status = status;
    return this;
  }

  withBudget(budget: number) {
    this.project.budget = budget;
    return this;
  }

  build() {
    return this.project;
  }
}

// Wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
