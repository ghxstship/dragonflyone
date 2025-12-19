import { useQuery } from '@tanstack/react-query';

export interface SpaceRecommendation {
  space_id: string;
  space_name: string;
  venue_id: string;
  venue_name: string;
  score: number;
  match_factors: {
    capacity_fit: number;
    availability: number;
    price_value: number;
    amenities_match: number;
    setup_compatibility: number;
  };
  capacity: {
    setup_type: string;
    min_capacity: number;
    max_capacity: number;
    requested_count: number;
    utilization_percentage: number;
  };
  availability: {
    fully_available: boolean;
    conflicts: Array<{
      type: 'booking' | 'hold' | 'maintenance';
      event_name?: string;
      priority?: string;
    }>;
    alternative_dates?: string[];
  };
  pricing: {
    base_price: number;
    estimated_total: number;
    price_per_guest: number;
    comparable_average: number;
    savings_percentage: number;
  };
  amenities: {
    required: string[];
    available: string[];
    missing: string[];
    extras: string[];
  };
  setup: {
    requested: string;
    compatible_setups: string[];
    recommended_setup: string;
    changeover_time_minutes: number;
  };
  images: string[];
}

export interface RecommendationCriteria {
  event_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  event_type?: string;
  venue_id?: string;
  required_amenities?: string[];
  setup_type?: string;
  budget_min?: number;
  budget_max?: number;
  exclude_space_ids?: string[];
}

async function fetchSpaceRecommendations(criteria: RecommendationCriteria): Promise<{
  recommendations: SpaceRecommendation[];
  best_match: SpaceRecommendation | null;
  alternatives: {
    different_dates: Array<{
      date: string;
      available_spaces: number;
      best_space_id: string;
    }>;
    nearby_venues: Array<{
      venue_id: string;
      venue_name: string;
      distance_km: number;
      available_spaces: number;
    }>;
  };
  criteria_analysis: {
    guest_count_feasible: boolean;
    date_availability: 'high' | 'medium' | 'low';
    budget_match: 'within' | 'above' | 'below';
    suggestions: string[];
  };
}> {
  const response = await fetch('/api/spaces/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(criteria),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch space recommendations');
  }
  return response.json();
}

async function fetchQuickAvailability(input: {
  date: string;
  guest_count: number;
  venue_id?: string;
}): Promise<{
  available_spaces: Array<{
    space_id: string;
    space_name: string;
    capacity: number;
    available_slots: Array<{
      start_time: string;
      end_time: string;
    }>;
  }>;
  total_available: number;
}> {
  const params = new URLSearchParams();
  params.set('date', input.date);
  params.set('guest_count', input.guest_count.toString());
  if (input.venue_id) params.set('venue_id', input.venue_id);

  const response = await fetch(`/api/spaces/quick-availability?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quick availability');
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

export function useQuickAvailability(input: { date: string; guest_count: number; venue_id?: string } | null) {
  return useQuery({
    queryKey: ['quick-availability', input],
    queryFn: () => fetchQuickAvailability(input!),
    enabled: !!input && !!input.date && input.guest_count > 0,
  });
}
