import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AdvanceSheet {
  id: string;
  booking_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'confirmed';
  artist_info: {
    name: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    management_company?: string;
    booking_agent?: string;
  };
  travel_info: {
    arrival_date?: string;
    arrival_time?: string;
    arrival_method?: 'flight' | 'bus' | 'car' | 'other';
    arrival_details?: string;
    departure_date?: string;
    departure_time?: string;
    departure_method?: 'flight' | 'bus' | 'car' | 'other';
    departure_details?: string;
    ground_transport_needed?: boolean;
    ground_transport_notes?: string;
  };
  accommodation: {
    hotel_name?: string;
    hotel_address?: string;
    check_in_date?: string;
    check_out_date?: string;
    room_count?: number;
    room_type?: string;
    special_requests?: string;
  };
  hospitality: {
    dressing_room_requirements?: string;
    catering_requirements?: string;
    dietary_restrictions?: string[];
    beverage_requirements?: string;
    buyout_amount?: number;
    local_crew_meals?: boolean;
  };
  technical: {
    sound_engineer_traveling?: boolean;
    lighting_engineer_traveling?: boolean;
    backline_requirements?: string[];
    monitor_requirements?: string;
    lighting_requirements?: string;
    video_requirements?: string;
    power_requirements?: string;
    stageplot_id?: string;
    input_list_id?: string;
  };
  schedule: {
    load_in_time?: string;
    sound_check_time?: string;
    doors_time?: string;
    set_time?: string;
    set_length_minutes?: number;
    curfew_time?: string;
    load_out_time?: string;
  };
  contacts: Array<{
    role: string;
    name: string;
    phone?: string;
    email?: string;
  }>;
  notes?: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateAdvanceSheetInput {
  id: string;
  artist_info?: Partial<AdvanceSheet['artist_info']>;
  travel_info?: Partial<AdvanceSheet['travel_info']>;
  accommodation?: Partial<AdvanceSheet['accommodation']>;
  hospitality?: Partial<AdvanceSheet['hospitality']>;
  technical?: Partial<AdvanceSheet['technical']>;
  schedule?: Partial<AdvanceSheet['schedule']>;
  contacts?: AdvanceSheet['contacts'];
  notes?: string;
}

async function fetchAdvanceSheet(bookingId: string): Promise<AdvanceSheet> {
  const response = await fetch(`/api/advance-sheets/${bookingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch advance sheet');
  }
  return response.json();
}

async function createAdvanceSheet(bookingId: string): Promise<AdvanceSheet> {
  const response = await fetch('/api/advance-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: bookingId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create advance sheet');
  }
  return response.json();
}

async function updateAdvanceSheet(input: UpdateAdvanceSheetInput): Promise<AdvanceSheet> {
  const { id, ...data } = input;
  const response = await fetch(`/api/advance-sheets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update advance sheet');
  }
  return response.json();
}

async function sendAdvanceSheet(id: string, recipientEmails: string[], message?: string): Promise<{ sent: boolean }> {
  const response = await fetch(`/api/advance-sheets/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipients: recipientEmails, message }),
  });
  if (!response.ok) {
    throw new Error('Failed to send advance sheet');
  }
  return response.json();
}

async function markAsConfirmed(id: string): Promise<AdvanceSheet> {
  const response = await fetch(`/api/advance-sheets/${id}/confirm`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to confirm advance sheet');
  }
  return response.json();
}

async function exportAdvanceSheet(id: string, format: 'pdf' | 'docx'): Promise<{ download_url: string }> {
  const response = await fetch(`/api/advance-sheets/${id}/export?format=${format}`);
  if (!response.ok) {
    throw new Error('Failed to export advance sheet');
  }
  return response.json();
}

export function useAdvanceSheet(bookingId: string) {
  return useQuery({
    queryKey: ['advance-sheet', bookingId],
    queryFn: () => fetchAdvanceSheet(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreateAdvanceSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvanceSheet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advance-sheet', data.booking_id] });
    },
  });
}

export function useUpdateAdvanceSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdvanceSheet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advance-sheet', data.booking_id] });
    },
  });
}

export function useSendAdvanceSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recipients, message }: { id: string; recipients: string[]; message?: string }) =>
      sendAdvanceSheet(id, recipients, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-sheet'] });
    },
  });
}

export function useConfirmAdvanceSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsConfirmed,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['advance-sheet', data.booking_id] });
    },
  });
}

export function useExportAdvanceSheet() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'docx' }) => exportAdvanceSheet(id, format),
  });
}
