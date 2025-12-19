import { useQuery } from '@tanstack/react-query';

export interface SpaceRecommendation {
  space_id: string;
  space_name: string;
  score: number;
  reasons: string[];
  capacity_fit: {
    min_capacity: number;
    max_capacity: number;
    guest_count: number;
    utilization: number;
  };
  availability: {
    available: boolean;
    conflicts: Array<{
      type: 'booking' | 'hold' | 'maintenance';
      description: string;
    }>;
  };
  pricing: {
    base_price: number;
    estimated_total: number;
    price_per_guest: number;
  };
  amenities_match: {
    required: string[];
    available: string[];
    missing: string[];
  };
  setup_compatibility: {
    requested_setup: string;
    compatible_setups: string[];
    recommended_setup: string;
  };
}

export interface RecommendationCriteria {
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  event_type?: string;
  required_amenities?: string[];
  setup_type?: string;
  budget_max?: number;
}

async function fetchSpaceRecommendations(criteria: RecommendationCriteria): Promise<{
  recommendations: SpaceRecommendation[];
  best_match: SpaceRecommendation | null;
}> {
  const params = new URLSearchParams();
  params.set('event_date', criteria.event_date);
  params.set('start_time', criteria.start_time);
  params.set('end_time', criteria.end_time);
  params.set('guest_count', criteria.guest_count.toString());
  if (criteria.event_type) params.set('event_type', criteria.event_type);
  if (criteria.required_amenities) params.set('amenities', criteria.required_amenities.join(','));
  if (criteria.setup_type) params.set('setup_type', criteria.setup_type);
  if (criteria.budget_max) params.set('budget_max', criteria.budget_max.toString());

  const response = await fetch(`/api/spaces/recommend?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch space recommendations');
  }
  return response.json();
}

async function fetchSpaceAvailability(
  spaceId: string,
  dateRange: { start: string; end: string }
): Promise<{
  available_slots: Array<{
    date: string;
    slots: Array<{
      start_time: string;
      end_time: string;
      available: boolean;
    }>;
  }>;
  blocked_dates: string[];
}> {
  const params = new URLSearchParams();
  params.set('start', dateRange.start);
  params.set('end', dateRange.end);

  const response = await fetch(`/api/spaces/${spaceId}/availability?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch space availability');
  }
  return response.json();
}

export function useSpaceRecommendations(criteria: RecommendationCriteria | null) {
  return useQuery({
    queryKey: ['space-recommendations', criteria],
    queryFn: () => fetchSpaceRecommendations(criteria!),
    enabled: !!criteria && !!criteria.event_date && !!criteria.start_time && !!criteria.end_time && criteria.guest_count > 0,
  });
}

export function useSpaceAvailability(spaceId: string, dateRange: { start: string; end: string }) {
  return useQuery({
    queryKey: ['space-availability', spaceId, dateRange],
    queryFn: () => fetchSpaceAvailability(spaceId, dateRange),
    enabled: !!spaceId && !!dateRange.start && !!dateRange.end,
  });
}
