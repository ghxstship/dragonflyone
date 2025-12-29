# Standard Loading & Error Patterns

This document defines the standard patterns for loading states, error states, and empty states across all GHXSTSHIP applications.

## Overview

All applications should use consistent patterns for handling:
- **Loading states** - While data is being fetched
- **Error states** - When data fetching fails
- **Empty states** - When no data exists

## Components

### ErrorState

The `ErrorState` component provides a standardized error display with retry functionality.

```tsx
import { ErrorState } from '@ghxstship/ui';

// Basic usage
<ErrorState
  title="Error Loading Data"
  description="Failed to load the requested data."
  onRetry={() => refetch()}
/>

// Full page error
<ErrorState
  title="Error Loading Dashboard"
  error={error instanceof Error ? error : null}
  description="Failed to load dashboard data. Please try again."
  onRetry={handleRetry}
  inverted
  fullPage
/>

// With navigation actions
<ErrorState
  title="Something went wrong"
  description="We couldn't complete your request."
  onRetry={handleRetry}
  onGoBack={() => router.back()}
  onGoHome={() => router.push('/')}
  severity="error"
  inverted
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | "Something went wrong" | Error title |
| `description` | `string` | - | Error description |
| `error` | `Error \| null` | - | Error object for detailed info |
| `showDetails` | `boolean` | `false` | Show stack trace (dev only) |
| `icon` | `ReactNode` | AlertTriangle | Custom icon |
| `onRetry` | `() => void` | - | Retry action handler |
| `retryLabel` | `string` | "Try Again" | Custom retry button label |
| `onGoBack` | `() => void` | - | Go back action handler |
| `onGoHome` | `() => void` | - | Go home action handler |
| `customAction` | `object` | - | Custom action button |
| `severity` | `"error" \| "warning" \| "info"` | "error" | Error severity |
| `inverted` | `boolean` | `false` | Dark background mode |
| `fullPage` | `boolean` | `false` | Full page centered layout |

### PageErrorState

Convenience wrapper for full-page errors:

```tsx
import { PageErrorState } from '@ghxstship/ui';

<PageErrorState
  title="Page Not Found"
  description="The page you're looking for doesn't exist."
  onGoHome={() => router.push('/')}
/>
```

### InlineErrorState

Compact inline error for form fields or small areas:

```tsx
import { InlineErrorState } from '@ghxstship/ui';

<InlineErrorState
  message="Failed to save changes"
  onRetry={handleRetry}
/>
```

### EmptyState

For when no data exists:

```tsx
import { EmptyState } from '@ghxstship/ui';

<EmptyState
  icon={<FolderOpen className="size-12" />}
  title="No Projects Found"
  description="Get started by creating your first project."
  action={{
    label: "Create Project",
    onClick: () => router.push('/projects/new')
  }}
  inverted
/>
```

## Standard Patterns

### Dashboard Pages

```tsx
export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useData();

  // Loading state
  if (isLoading) {
    return <AppLoadingLayout text="Loading dashboard..." />;
  }

  // Error state
  if (error) {
    return (
      <MainContent padding="lg">
        <Container>
          <ErrorState
            title="Error Loading Dashboard"
            error={error instanceof Error ? error : null}
            description="Failed to load dashboard data. Please try again."
            onRetry={refetch}
            inverted
            fullPage
          />
        </Container>
      </MainContent>
    );
  }

  // Empty state (if applicable)
  if (!data || data.length === 0) {
    return (
      <MainContent padding="lg">
        <Container>
          <EmptyState
            title="No Data Available"
            description="Start by adding some data."
            action={{ label: "Add Data", onClick: handleAdd }}
            inverted
          />
        </Container>
      </MainContent>
    );
  }

  // Normal render
  return (
    <>
      <EnterprisePageHeader title="Dashboard" />
      <MainContent padding="lg">
        <Container>
          {/* Dashboard content */}
        </Container>
      </MainContent>
    </>
  );
}
```

### List Pages

```tsx
export default function ListPage() {
  const { data, isLoading, error, refetch } = useItems();

  if (isLoading) {
    return <Spinner size="lg" text="Loading items..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Items"
        error={error}
        onRetry={refetch}
        inverted
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Items Found"
        description="Create your first item to get started."
        action={{ label: "Create Item", onClick: handleCreate }}
        inverted
      />
    );
  }

  return <DataTable data={data} />;
}
```

### Form Submissions

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
    addNotification({ type: 'success', title: 'Saved', message: 'Changes saved successfully' });
  } catch (error) {
    addNotification({ 
      type: 'error', 
      title: 'Error', 
      message: error instanceof Error ? error.message : 'Failed to save changes' 
    });
  }
};
```

## Severity Levels

| Severity | Use Case | Color |
|----------|----------|-------|
| `error` | Data fetch failures, critical errors | Red |
| `warning` | Partial failures, degraded functionality | Yellow |
| `info` | Informational messages, soft errors | Blue |

## Best Practices

1. **Always provide retry functionality** when possible
2. **Use descriptive error messages** that help users understand what went wrong
3. **Include navigation options** (go back, go home) for full-page errors
4. **Show loading states** to indicate progress
5. **Handle empty states** gracefully with calls to action
6. **Use appropriate severity levels** based on the error type
7. **Log errors** for debugging while showing user-friendly messages
8. **Use inverted mode** for dark backgrounds (default in GHXSTSHIP apps)

## Migration Guide

To migrate existing error handling to use `ErrorState`:

### Before
```tsx
if (error) {
  return (
    <Stack gap={6} className="items-center justify-center py-20">
      <Card inverted className="max-w-md p-8 text-center">
        <Stack gap={4}>
          <H3 className="text-white">Error Loading Data</H3>
          <Body className="text-grey-400">{error.message}</Body>
          <Button variant="solid" inverted onClick={refetch}>
            Retry
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
```

### After
```tsx
if (error) {
  return (
    <ErrorState
      title="Error Loading Data"
      error={error}
      onRetry={refetch}
      inverted
      fullPage
    />
  );
}
```

## Related Components

- `Spinner` - Loading indicator
- `Skeleton` / `SkeletonCard` / `SkeletonTable` - Skeleton loading states
- `EmptyState` - Empty data states
- `NotificationToast` - Toast notifications for transient errors
