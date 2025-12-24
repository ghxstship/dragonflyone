import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GroupOrder {
  id: string;
  organizerName: string;
  organizerEmail: string;
  eventName: string;
  ticketType: string;
  groupSize: number;
  attendeesRegistered: number;
  totalAmount: number;
  discount: number;
  status: 'Pending' | 'Confirmed' | 'Paid' | 'Completed';
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/tickets/groups';

async function fetchGroupOrders(): Promise<GroupOrder[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch group orders');
  }
  const { data } = await response.json();
  return data || [];
}

async function createGroupOrder(data: Partial<GroupOrder>): Promise<GroupOrder> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create group order');
  }
  return response.json();
}

async function updateGroupOrder(id: string, data: Partial<GroupOrder>): Promise<GroupOrder> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update group order');
  }
  return response.json();
}

export function useGroupOrdersQuery() {
  return useQuery({
    queryKey: ['group-orders'],
    queryFn: fetchGroupOrders,
    staleTime: 60000,
  });
}

export function useCreateGroupOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroupOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-orders'] });
    },
  });
}

export function useUpdateGroupOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GroupOrder> }) => updateGroupOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-orders'] });
    },
  });
}

export function useGroupOrders() {
  const queryClient = useQueryClient();
  const query = useGroupOrdersQuery();
  const createMutation = useCreateGroupOrder();
  const updateMutation = useUpdateGroupOrder();

  const groups = query.data || [];
  const totalGroups = groups.length;
  const totalAttendees = groups.reduce((s, g) => s + g.groupSize, 0);
  const totalRevenue = groups.reduce((s, g) => s + g.totalAmount, 0);
  const avgDiscount = totalGroups > 0 ? Math.round(groups.reduce((s, g) => s + g.discount, 0) / totalGroups) : 0;

  return {
    groups,
    summary: {
      totalGroups,
      totalAttendees,
      totalRevenue,
      avgDiscount,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['group-orders'] }),
  };
}
