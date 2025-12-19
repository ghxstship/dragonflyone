import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BookingTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  default_duration_hours: number;
  setup_time_minutes: number;
  breakdown_time_minutes: number;
  default_spaces: string[];
  default_packages: string[];
  default_add_ons: string[];
  pricing_rules: {
    base_price?: number;
    per_person_price?: number;
    minimum_spend?: number;
  };
  checklist_items: Array<{
    id: string;
    title: string;
    due_offset_days: number;
    assignee_role?: string;
  }>;
  is_active: boolean;
  usage_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingTemplateInput {
  name: string;
  description?: string;
  event_type: string;
  default_duration_hours?: number;
  setup_time_minutes?: number;
  breakdown_time_minutes?: number;
  default_spaces?: string[];
  default_packages?: string[];
  default_add_ons?: string[];
  pricing_rules?: BookingTemplate['pricing_rules'];
  checklist_items?: BookingTemplate['checklist_items'];
  is_active?: boolean;
}

export interface UpdateBookingTemplateInput extends Partial<CreateBookingTemplateInput> {
  id: string;
}

async function fetchBookingTemplates(): Promise<{ templates: BookingTemplate[]; total: number }> {
  const response = await fetch('/api/booking-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch booking templates');
  }
  return response.json();
}

async function fetchBookingTemplate(id: string): Promise<BookingTemplate> {
  const response = await fetch(`/api/booking-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch booking template');
  }
  return response.json();
}

async function createBookingTemplate(input: CreateBookingTemplateInput): Promise<BookingTemplate> {
  const response = await fetch('/api/booking-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking template');
  }
  return response.json();
}

async function updateBookingTemplate({ id, ...input }: UpdateBookingTemplateInput): Promise<BookingTemplate> {
  const response = await fetch(`/api/booking-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update booking template');
  }
  return response.json();
}

async function deleteBookingTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/booking-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete booking template');
  }
}

export function useBookingTemplates() {
  return useQuery({
    queryKey: ['booking-templates'],
    queryFn: fetchBookingTemplates,
  });
}

export function useBookingTemplate(id: string) {
  return useQuery({
    queryKey: ['booking-template', id],
    queryFn: () => fetchBookingTemplate(id),
    enabled: !!id,
  });
}

export function useCreateBookingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBookingTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
    },
  });
}

export function useUpdateBookingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBookingTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
      queryClient.invalidateQueries({ queryKey: ['booking-template', data.id] });
    },
  });
}

export function useDeleteBookingTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBookingTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
    },
  });
}
