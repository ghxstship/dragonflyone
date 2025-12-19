import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  preferences: {
    notification_email: boolean;
    notification_sms: boolean;
    notification_push: boolean;
    marketing_emails: boolean;
    event_reminders: boolean;
    reminder_hours_before: number;
    language: string;
    timezone: string;
    currency: string;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  interests: string[];
  favorite_event_types: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: UserProfile['location'];
  preferences?: Partial<UserProfile['preferences']>;
  social_links?: UserProfile['social_links'];
  interests?: string[];
  favorite_event_types?: string[];
}

export interface UserTicket {
  id: string;
  ticket_code: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  ticket_type: string;
  price: number;
  status: 'valid' | 'used' | 'cancelled' | 'expired';
  qr_code_url: string;
  purchased_at: string;
  checked_in_at?: string;
}

export interface UserOrder {
  id: string;
  order_number: string;
  event_id: string;
  event_name: string;
  event_date: string;
  tickets: Array<{
    ticket_type: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  fees: number;
  total: number;
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  payment_method: string;
  created_at: string;
}

async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

async function updateUserProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const response = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  return response.json();
}

async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/user/avatar', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }
  return response.json();
}

async function fetchUserTickets(filters?: { status?: string; upcoming?: boolean }): Promise<{
  tickets: UserTicket[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.upcoming) params.set('upcoming', 'true');

  const response = await fetch(`/api/user/tickets?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }
  return response.json();
}

async function fetchUserOrders(): Promise<{ orders: UserOrder[]; total: number }> {
  const response = await fetch('/api/user/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

async function deleteAccount(password: string): Promise<void> {
  const response = await fetch('/api/user/account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete account');
  }
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export function useUserTickets(filters?: { status?: string; upcoming?: boolean }) {
  return useQuery({
    queryKey: ['user-tickets', filters],
    queryFn: () => fetchUserTickets(filters),
  });
}

export function useUserOrders() {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccount,
  });
}
