import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface PublicEvent {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  event_type: string;
  category: string;
  tags: string[];
  venue_id: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  cover_image_url?: string;
  gallery_images: string[];
  ticket_types: Array<{
    id: string;
    name: string;
    price: number;
    available: number;
    sold_out: boolean;
  }>;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  is_free: boolean;
  is_sold_out: boolean;
  is_featured: boolean;
  organizer: {
    id: string;
    name: string;
    logo_url?: string;
    verified: boolean;
  };
  attendance: {
    capacity: number;
    attending: number;
    interested: number;
  };
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  created_at: string;
}

export interface EventSearchFilters {
  query?: string;
  category?: string;
  event_type?: string;
  date_from?: string;
  date_to?: string;
  city?: string;
  state?: string;
  price_min?: number;
  price_max?: number;
  is_free?: boolean;
  is_online?: boolean;
  tags?: string[];
  sort_by?: 'date' | 'popularity' | 'price_low' | 'price_high' | 'distance';
  latitude?: number;
  longitude?: number;
  radius_km?: number;
}

async function searchEvents(filters: EventSearchFilters, page: number = 1, pageSize: number = 20): Promise<{
  events: PublicEvent[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
  facets: {
    categories: Array<{ name: string; count: number }>;
    cities: Array<{ name: string; count: number }>;
    price_ranges: Array<{ range: string; count: number }>;
  };
}> {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.event_type) params.set('type', filters.event_type);
  if (filters.date_from) params.set('from', filters.date_from);
  if (filters.date_to) params.set('to', filters.date_to);
  if (filters.city) params.set('city', filters.city);
  if (filters.state) params.set('state', filters.state);
  if (filters.price_min !== undefined) params.set('price_min', filters.price_min.toString());
  if (filters.price_max !== undefined) params.set('price_max', filters.price_max.toString());
  if (filters.is_free) params.set('free', 'true');
  if (filters.is_online) params.set('online', 'true');
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.sort_by) params.set('sort', filters.sort_by);
  if (filters.latitude) params.set('lat', filters.latitude.toString());
  if (filters.longitude) params.set('lng', filters.longitude.toString());
  if (filters.radius_km) params.set('radius', filters.radius_km.toString());
  params.set('page', page.toString());
  params.set('page_size', pageSize.toString());

  const response = await fetch(`/api/events/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search events');
  }
  return response.json();
}

async function fetchFeaturedEvents(): Promise<{ events: PublicEvent[] }> {
  const response = await fetch('/api/events/featured');
  if (!response.ok) {
    throw new Error('Failed to fetch featured events');
  }
  return response.json();
}

async function fetchUpcomingEvents(limit: number = 10): Promise<{ events: PublicEvent[] }> {
  const response = await fetch(`/api/events/upcoming?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming events');
  }
  return response.json();
}

async function fetchEventBySlug(slug: string): Promise<PublicEvent> {
  const response = await fetch(`/api/events/by-slug/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

async function fetchSimilarEvents(eventId: string, limit: number = 4): Promise<{ events: PublicEvent[] }> {
  const response = await fetch(`/api/events/${eventId}/similar?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch similar events');
  }
  return response.json();
}

async function fetchEventCategories(): Promise<{
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon?: string;
    event_count: number;
  }>;
}> {
  const response = await fetch('/api/events/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export function useEventSearch(filters: EventSearchFilters, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['event-search', filters, pageSize],
    queryFn: ({ pageParam = 1 }) => searchEvents(filters, pageParam, pageSize),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['featured-events'],
    queryFn: fetchFeaturedEvents,
  });
}

export function useUpcomingEvents(limit: number = 10) {
  return useQuery({
    queryKey: ['upcoming-events', limit],
    queryFn: () => fetchUpcomingEvents(limit),
  });
}

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: ['event-by-slug', slug],
    queryFn: () => fetchEventBySlug(slug),
    enabled: !!slug,
  });
}

export function useSimilarEvents(eventId: string, limit: number = 4) {
  return useQuery({
    queryKey: ['similar-events', eventId, limit],
    queryFn: () => fetchSimilarEvents(eventId, limit),
    enabled: !!eventId,
  });
}

export function useEventCategories() {
  return useQuery({
    queryKey: ['event-categories'],
    queryFn: fetchEventCategories,
  });
}
