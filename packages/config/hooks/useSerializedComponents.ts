import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ComponentHistory {
  date: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface SerializedComponent {
  id: string;
  serialNumber: string;
  parentAssetId: string;
  parentAssetName: string;
  componentType: string;
  manufacturer: string;
  model: string;
  installDate: string;
  warrantyExpiry?: string;
  status: 'Active' | 'Replaced' | 'Failed' | 'In Repair';
  location: string;
  lastInspection?: string;
  notes?: string;
  history: ComponentHistory[];
}

export interface CreateSerializedComponentParams {
  serial_number: string;
  parent_asset_id: string;
  component_type: string;
  manufacturer: string;
  model: string;
  install_date: string;
  warranty_expiry?: string;
  location: string;
  notes?: string;
}

const API_BASE = '/api/serialized-components';

async function fetchSerializedComponents(params?: {
  status?: string;
  component_type?: string;
  parent_asset_id?: string;
}): Promise<SerializedComponent[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.component_type) searchParams.set('component_type', params.component_type);
  if (params?.parent_asset_id) searchParams.set('parent_asset_id', params.parent_asset_id);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch serialized components');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    serialNumber: item.serial_number as string,
    parentAssetId: item.parent_asset_id as string || item.asset_id as string,
    parentAssetName: ((item.asset as Record<string, unknown>)?.name || item.parent_asset_name || 'Unknown') as string,
    componentType: item.component_type as string,
    manufacturer: item.manufacturer as string,
    model: item.model as string,
    installDate: item.install_date as string,
    warrantyExpiry: item.warranty_expiry as string | undefined,
    status: item.status as SerializedComponent['status'],
    location: item.location as string,
    lastInspection: item.last_inspection as string | undefined,
    notes: item.notes as string | undefined,
    history: (item.history as ComponentHistory[]) || [],
  }));
}

async function createSerializedComponent(params: CreateSerializedComponentParams): Promise<SerializedComponent> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create serialized component');
  }

  const { data } = await response.json();
  return data;
}

async function updateSerializedComponent(id: string, updates: Partial<CreateSerializedComponentParams & { status: string }>): Promise<SerializedComponent> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update serialized component');
  }

  const { data } = await response.json();
  return data;
}

async function deleteSerializedComponents(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete serialized components');
  }
}

export function useSerializedComponentsQuery(params?: {
  status?: string;
  component_type?: string;
  parent_asset_id?: string;
}) {
  return useQuery({
    queryKey: ['serialized-components', params],
    queryFn: () => fetchSerializedComponents(params),
    staleTime: 60000,
  });
}

export function useCreateSerializedComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSerializedComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serialized-components'] });
    },
  });
}

export function useUpdateSerializedComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateSerializedComponentParams & { status: string }> }) =>
      updateSerializedComponent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serialized-components'] });
    },
  });
}

export function useDeleteSerializedComponents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSerializedComponents,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serialized-components'] });
    },
  });
}

export function useSerializedComponents() {
  const componentsQuery = useSerializedComponentsQuery();
  const createMutation = useCreateSerializedComponent();
  const updateMutation = useUpdateSerializedComponent();
  const deleteMutation = useDeleteSerializedComponents();

  return {
    components: componentsQuery.data || [],
    isLoading: componentsQuery.isLoading,
    error: componentsQuery.error,
    refetch: componentsQuery.refetch,
    createComponent: createMutation.mutate,
    createComponentAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateComponent: updateMutation.mutate,
    updateComponentAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteComponents: deleteMutation.mutate,
    deleteComponentsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
