import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DashboardWidget {
  id: string;
  widget_type: 'kpi' | 'chart' | 'list' | 'calendar' | 'activity' | 'tasks' | 'custom';
  title: string;
  description?: string;
  data_source: string;
  config: {
    metric?: string;
    chart_type?: 'bar' | 'line' | 'pie' | 'area' | 'donut';
    date_range?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    filters?: Record<string, unknown>;
    display_options?: {
      show_trend?: boolean;
      show_comparison?: boolean;
      comparison_period?: string;
      format?: string;
      color?: string;
    };
  };
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  is_visible: boolean;
  refresh_interval_seconds?: number;
  last_refreshed?: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_shared: boolean;
  layout: 'grid' | 'freeform';
  widgets: DashboardWidget[];
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetData {
  widget_id: string;
  data_type: 'single_value' | 'series' | 'list' | 'table';
  value?: number | string;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
    comparison_value: number;
  };
  series?: Array<{ label: string; value: number }>;
  list?: Array<Record<string, unknown>>;
  table?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
  last_updated: string;
}

async function fetchDashboards(): Promise<{ dashboards: Dashboard[] }> {
  const response = await fetch('/api/dashboards');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboards');
  }
  return response.json();
}

async function fetchDashboard(id: string): Promise<Dashboard> {
  const response = await fetch(`/api/dashboards/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard');
  }
  return response.json();
}

async function fetchWidgetData(widgetId: string): Promise<WidgetData> {
  const response = await fetch(`/api/dashboard-widgets/${widgetId}/data`);
  if (!response.ok) {
    throw new Error('Failed to fetch widget data');
  }
  return response.json();
}

async function createDashboard(input: { name: string; description?: string; layout?: Dashboard['layout'] }): Promise<Dashboard> {
  const response = await fetch('/api/dashboards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create dashboard');
  }
  return response.json();
}

async function addWidget(input: { dashboardId: string; widget: Omit<DashboardWidget, 'id'> }): Promise<DashboardWidget> {
  const response = await fetch(`/api/dashboards/${input.dashboardId}/widgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.widget),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add widget');
  }
  return response.json();
}

async function updateWidgetPosition(input: { dashboardId: string; widgetId: string; position: DashboardWidget['position'] }): Promise<DashboardWidget> {
  const response = await fetch(`/api/dashboards/${input.dashboardId}/widgets/${input.widgetId}/position`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.position),
  });
  if (!response.ok) {
    throw new Error('Failed to update position');
  }
  return response.json();
}

async function removeWidget(input: { dashboardId: string; widgetId: string }): Promise<void> {
  const response = await fetch(`/api/dashboards/${input.dashboardId}/widgets/${input.widgetId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove widget');
  }
}

export function useDashboards() {
  return useQuery({
    queryKey: ['dashboards'],
    queryFn: fetchDashboards,
  });
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => fetchDashboard(id),
    enabled: !!id,
  });
}

export function useWidgetData(widgetId: string, refreshInterval?: number) {
  return useQuery({
    queryKey: ['widget-data', widgetId],
    queryFn: () => fetchWidgetData(widgetId),
    enabled: !!widgetId,
    refetchInterval: refreshInterval ? refreshInterval * 1000 : false,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useAddWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWidget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.dashboardId] });
    },
  });
}

export function useUpdateWidgetPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWidgetPosition,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.dashboardId] });
    },
  });
}

export function useRemoveWidget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWidget,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.dashboardId] });
    },
  });
}
