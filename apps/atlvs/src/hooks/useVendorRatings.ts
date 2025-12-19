import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorRating {
  id: string;
  vendor_id: string;
  event_id?: string;
  booking_id?: string;
  reviewer_id: string;
  reviewer_name: string;
  overall_rating: number;
  quality_rating: number;
  communication_rating: number;
  timeliness_rating: number;
  value_rating: number;
  would_recommend: boolean;
  review_text?: string;
  response_text?: string;
  response_date?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface VendorRatingSummary {
  vendor_id: string;
  total_reviews: number;
  average_overall: number;
  average_quality: number;
  average_communication: number;
  average_timeliness: number;
  average_value: number;
  recommendation_rate: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface CreateRatingInput {
  vendor_id: string;
  event_id?: string;
  booking_id?: string;
  overall_rating: number;
  quality_rating: number;
  communication_rating: number;
  timeliness_rating: number;
  value_rating: number;
  would_recommend: boolean;
  review_text?: string;
}

async function fetchVendorRatings(vendorId: string): Promise<{
  ratings: VendorRating[];
  summary: VendorRatingSummary;
}> {
  const response = await fetch(`/api/vendor-profiles/${vendorId}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch vendor ratings');
  }
  return response.json();
}

async function createVendorRating(input: CreateRatingInput): Promise<VendorRating> {
  const response = await fetch(`/api/vendor-profiles/${input.vendor_id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create rating');
  }
  return response.json();
}

async function respondToRating(input: { ratingId: string; responseText: string }): Promise<VendorRating> {
  const response = await fetch(`/api/vendor-ratings/${input.ratingId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response_text: input.responseText }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to respond to rating');
  }
  return response.json();
}

async function updateRatingStatus(input: { ratingId: string; status: VendorRating['status'] }): Promise<VendorRating> {
  const response = await fetch(`/api/vendor-ratings/${input.ratingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: input.status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update rating status');
  }
  return response.json();
}

export function useVendorRatings(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-ratings', vendorId],
    queryFn: () => fetchVendorRatings(vendorId),
    enabled: !!vendorId,
  });
}

export function useCreateVendorRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorRating,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-ratings', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile', data.vendor_id] });
    },
  });
}

export function useRespondToRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: respondToRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-ratings'] });
    },
  });
}

export function useUpdateRatingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRatingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-ratings'] });
    },
  });
}
