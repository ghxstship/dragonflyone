# Data Flow & State Management Architecture

## Overview

The GHXSTSHIP platform implements a comprehensive state management architecture that separates concerns between **server state** (data from APIs/database) and **client state** (UI/app state).

## Architecture Layers

### 1. Server State Management (TanStack Query)

**Purpose:** Manage data fetched from APIs, handle caching, synchronization, and background updates.

**Key Features:**
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Request deduplication
- Offline support
- Real-time synchronization with Supabase

**Location:** `packages/config/query-client.tsx`

### 2. Client State Management (Zustand)

**Purpose:** Manage UI state, user preferences, and transient application state.

**Stores:**
- **UI Store** (`ui-store.ts`) - Modals, sidebars, notifications, theme
- **Cart Store** (`cart-store.ts`) - Shopping cart for GVTEWAY
- **Filters Store** (`filters-store.ts`) - Search/filter state across apps

**Location:** `packages/config/stores/`

### 3. Real-time Synchronization

**Purpose:** Keep client data in sync with database changes in real-time.

**Features:**
- Supabase real-time subscriptions
- Automatic cache updates on data changes
- Presence tracking (online users)
- Broadcast messaging

**Location:** `packages/config/realtime-sync.ts`

### 4. Offline Support & Data Sync

**Purpose:** Queue operations when offline and sync when connection restored.

**Features:**
- Automatic network detection
- Operation queue with retry logic
- Conflict resolution strategies
- Persistent queue in localStorage

**Location:** `packages/config/data-sync.ts`

## Usage Patterns

### 1. Fetching Data (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date');
      if (error) throw error;
      return data;
    },
  });
}

// In component
const { data: events, isLoading, error } = useEvents();
```

### 2. Mutations (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event) => {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// In component
const createEvent = useCreateEvent();

const handleSubmit = async (data) => {
  await createEvent.mutateAsync(data);
};
```

### 3. Optimistic Updates

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { optimisticUpdate } from '@ghxstship/config/query-utils';

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['events'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['events']);

      // Optimistically update
      optimisticUpdate(queryClient, ['events'], id, updates);

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['events'], context.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
```

### 4. Real-time Subscriptions

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTable } from '@ghxstship/config/realtime-sync';

export function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = subscribeToTable({
      table: 'events',
      queryKey: ['events'],
      queryClient,
      onInsert: (event) => {
        console.log('New event:', event);
      },
      onUpdate: (event) => {
        console.log('Updated event:', event);
      },
      onDelete: ({ old }) => {
        console.log('Deleted event:', old);
      },
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
}
```

### 5. Using Client State (Zustand)

```typescript
import { useUIStore } from '@ghxstship/config/stores';

function MyComponent() {
  const { 
    sidebarOpen, 
    toggleSidebar,
    addNotification 
  } = useUIStore();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      title: 'Success!',
      message: 'Operation completed',
      duration: 3000,
    });
  };

  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
    </div>
  );
}
```

### 6. Cart Management (GVTEWAY)

```typescript
import { useCartStore } from '@ghxstship/config/stores';

function AddToCartButton({ ticket }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      type: 'ticket',
      eventId: ticket.eventId,
      productId: ticket.id,
      name: ticket.name,
      price: ticket.price,
      quantity: 1,
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### 7. Filter State Management

```typescript
import { useFiltersStore } from '@ghxstship/config/stores';

function EventFilters() {
  const { eventFilters, setEventFilters, resetEventFilters } = useFiltersStore();

  const handleCategoryChange = (categories) => {
    setEventFilters({ category: categories });
  };

  return (
    <div>
      {/* Filter UI */}
      <button onClick={resetEventFilters}>Reset Filters</button>
    </div>
  );
}
```

### 8. Offline-Aware Mutations

```typescript
import { DataSyncManager } from '@ghxstship/config/data-sync';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
const syncManager = new DataSyncManager(queryClient);

// Queue operation when offline
syncManager.queueOperation('create', 'events', eventData);

// Check queue status
const status = syncManager.getQueueStatus();
console.log('Pending operations:', status.pending);
```

## Query Key Conventions

Use consistent query key patterns for better cache management:

```typescript
// List queries
['events']
['events', { category: 'music' }]
['events', filters]

// Detail queries
['events', eventId]
['events', eventId, 'tickets']

// Related data
['users', userId, 'events']
['organizations', orgId, 'projects']
```

## Cache Configuration Presets

```typescript
import { queryPresets } from '@ghxstship/config/query-client';

// Real-time data (live updates)
useQuery({
  queryKey: ['event-stats'],
  queryFn: fetchEventStats,
  ...queryPresets.realtime,
});

// Static data (rarely changes)
useQuery({
  queryKey: ['venues'],
  queryFn: fetchVenues,
  ...queryPresets.static,
});

// Fresh data (always up-to-date)
useQuery({
  queryKey: ['cart'],
  queryFn: fetchCart,
  ...queryPresets.fresh,
});
```

## Application Setup

### 1. Wrap App with Providers

```typescript
// app/layout.tsx
import { QueryClientProvider } from '@ghxstship/config/query-client';
import { AuthProvider } from '@ghxstship/config/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 2. Enable DevTools (Development Only)

DevTools are automatically included in development mode and accessible via the floating button in the bottom-right corner.

## Best Practices

### 1. Query Keys
- Use arrays for query keys
- Include all variables that affect the query
- Keep keys consistent across the app

### 2. Mutations
- Always invalidate related queries after mutations
- Use optimistic updates for better UX
- Handle errors gracefully

### 3. Real-time
- Unsubscribe from channels on component unmount
- Batch real-time updates to avoid excessive re-renders
- Use presence sparingly (only for critical features)

### 4. Client State
- Keep Zustand stores focused and specific
- Use persist middleware for data that should survive page refresh
- Don't duplicate server state in client stores

### 5. Performance
- Use `staleTime` to reduce unnecessary refetches
- Implement pagination/infinite scroll for large lists
- Prefetch data on hover/focus for instant navigation

### 6. Error Handling
- Provide fallback UI for loading and error states
- Use error boundaries for critical failures
- Log errors for debugging

## Debugging

### React Query DevTools
- Available in development mode
- Shows all queries and their states
- Allows manual cache manipulation
- View query timeline and performance

### Zustand DevTools
- Integrated with Redux DevTools extension
- View state changes in real-time
- Time-travel debugging

### Network Tab
- Monitor API calls
- Check request/response payloads
- Identify slow queries

## Migration from Existing Code

### Before (Direct Supabase Calls)
```typescript
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*');
    setEvents(data);
    setLoading(false);
  }
  fetchEvents();
}, []);
```

### After (React Query)
```typescript
const { data: events, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: async () => {
    const { data } = await supabase.from('events').select('*');
    return data;
  },
});
```

## Performance Metrics

**Target Metrics:**
- Initial query time: < 100ms (cached)
- Mutation response: < 200ms
- Real-time update latency: < 50ms
- Cache hit rate: > 80%

## File Structure

```
packages/config/
├── query-client.tsx          # React Query configuration
├── query-utils.ts            # Query helper functions
├── realtime-sync.ts          # Real-time subscriptions
├── data-sync.ts              # Offline sync manager
├── state-persistence.ts      # LocalStorage utilities
└── stores/
    ├── index.ts              # Store exports
    ├── ui-store.ts           # UI state
    ├── cart-store.ts         # Shopping cart
    └── filters-store.ts      # Filter state
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
