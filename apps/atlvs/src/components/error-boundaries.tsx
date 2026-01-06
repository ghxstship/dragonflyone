import React from 'react';
import { Card, Body, Button, Stack } from '@ghxstship/ui';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error logged for debugging in development
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} resetError={() => this.setState({ hasError: false, error: undefined })} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ _error, resetError }) => (
  <Card className="p-6 border-2 border-error bg-error-900">
    <Stack gap={4} className="items-center text-center">
      <div className="size-12 text-error">⚠️</div>
      <Body className="font-weight-bold text-error-100">Something went wrong</Body>
      <Body className="text-error-200 text-sm">
        An unexpected error occurred
      </Body>
      <Button variant="outline" onClick={resetError}>
        Try Again
      </Button>
    </Stack>
  </Card>
);

// Specialized error boundaries for different contexts
export const WidgetErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={({ _error, resetError }) => (
      <Card className="p-4 border-2 border-warning bg-warning-900">
        <Stack gap={2} className="items-center text-center">
          <div className="size-6 text-warning">⚠️</div>
          <Body size="sm" className="font-weight-medium text-warning-100">Widget Error</Body>
          <Body size="xs" className="text-warning-200">Failed to load widget</Body>
          <Button variant="outline" size="sm" onClick={resetError}>
            Retry
          </Button>
        </Stack>
      </Card>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const DataTableErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={({ _error, resetError }) => (
      <Card className="p-6 border-2 border-error bg-error-900">
        <Stack gap={4} className="items-center text-center">
          <div className="size-8 text-error">⚠️</div>
          <Body className="font-weight-bold text-error-100">Data Loading Error</Body>
          <Body className="text-error-200 text-sm">
            Failed to load data table. Please check your connection and try again.
          </Body>
          <Button variant="outline" onClick={resetError}>
            Reload Data
          </Button>
        </Stack>
      </Card>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={({ _error, resetError }) => (
      <Card className="p-4 border-2 border-warning bg-warning-900">
        <Stack gap={2} className="items-center text-center">
          <div className="size-6 text-warning">⚠️</div>
          <Body size="sm" className="font-weight-medium text-warning-100">Form Error</Body>
          <Body size="xs" className="text-warning-200">Form validation failed</Body>
          <Button variant="outline" size="sm" onClick={resetError}>
            Reset Form
          </Button>
        </Stack>
      </Card>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const IntegrationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={({ _error, resetError }) => (
      <Card className="p-6 border-2 border-info bg-info-900">
        <Stack gap={4} className="items-center text-center">
          <div className="size-8 text-info">⚠️</div>
          <Body className="font-weight-bold text-info-100">Integration Error</Body>
          <Body className="text-info-200 text-sm">
            Third-party service is currently unavailable. Please try again later.
          </Body>
          <Button variant="outline" onClick={resetError}>
            Retry Connection
          </Button>
        </Stack>
      </Card>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
