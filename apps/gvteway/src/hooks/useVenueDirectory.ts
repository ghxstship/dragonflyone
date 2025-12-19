import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface PublicVenue {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  venue_type: string;
  categories: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  capacity: {
    min: number;
    max: number;
    seated?: number;
    standing?: number;
  };
  amenities: string[];
  features: string[];
  images: Array<{
    url: string;
    caption?: string;
    is_primary: boolean;
  }>;
  virtual_tour_url?: string;
  price_range?: {
    min: number;
    max: number;
    currency: string;
    unit: 'hour' | 'day' | 'event';
  };
  rating?: {
    average: number;
    count: number;
  };
  reviews_count: number;
  events_hosted: number;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  operating_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface VenueReview {
  id: string;
  venue_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  content: string;
  event_type?: string;
  event_date?: string;
  photos?: string[];
  helpful_count: number;
  response?: {
    content: string;
    responded_at: string;
  };
  created_at: string;
}

export interface VenueSearchFilters {
  query?: string;
  venue_type?: string;
  city?: string;
  state?: string;
  capacity_min?: number;
  capacity_max?: number;
  amenities?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  is_verified?: boolean;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  sort_by?: 'relevance' | 'rating' | 'reviews' | 'price_low' | 'price_high' | 'distance';
}

async function searchVenues(filters: VenueSearchFilters, page: number = 1, pageSize: number = 20): Promise<{
  venues: PublicVenue[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
  facets: {
    venue_types: Array<{ name: string; count: number }>;
    cities: Array<{ name: string; count: number }>;
    amenities: Array<{ name: string; count: number }>;
    capacity_ranges: Array<{ range: string; count: number }>;
  };
}> {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.venue_type) params.set('type', filters.venue_type);
  if (filters.city) params.set('city', filters.city);
  if (filters.state) params.set('state', filters.state);
  if (filters.capacity_min) params.set('capacity_min', filters.capacity_min.toString());
  if (filters.capacity_max) params.set('capacity_max', filters.capacity_max.toString());
  if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','));
  if (filters.price_min) params.set('price_min', filters.price_min.toString());
  if (filters.price_max) params.set('price_max', filters.price_max.toString());
  if (filters.rating_min) params.set('rating_min', filters.rating_min.toString());
  if (filters.is_verified) params.set('verified', 'true');
  if (filters.latitude) params.set('lat', filters.latitude.toString());
  if (filters.longitude) params.set('lng', filters.longitude.toString());
  if (filters.radius_km) params.set('radius', filters.radius_km.toString());
  if (filters.sort_by) params.set('sort', filters.sort_by);
  params.set('page', page.toString());
  params.set('page_size', pageSize.toString());

  const response = await fetch(`/api/venues/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search venues');
  }
  return response.json();
}

async function fetchVenueBySlug(slug: string): Promise<PublicVenue> {
  const response = await fetch(`/api/venues/by-slug/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch venue');
  }
  return response.json();
}

async function fetchVenueReviews(venueId: string, page: number = 1): Promise<{
  reviews: VenueReview[];
  total: number;
  average_rating: number;
  rating_distribution: Record<number, number>;
  has_more: boolean;
}> {
  const response = await fetch(`/api/venues/${venueId}/reviews?page=${page}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}

async function fetchFeaturedVenues(): Promise<{ venues: PublicVenue[] }> {
  const response = await fetch('/api/venues/featured');
  if (!response.ok) {
    throw new Error('Failed to fetch featured venues');
  }
  return response.json();
}

async function fetchNearbyVenues(latitude: number, longitude: number, radiusKm: number = 25): Promise<{
  venues: PublicVenue[];
}> {
  const response = await fetch(`/api/venues/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`);
  if (!response.ok) {
    throw new Error('Failed to fetch nearby venues');
  }
  return response.json();
}

async function fetchVenueTypes(): Promise<{
  types: Array<{ id: string; name: string; slug: string; venue_count: number }>;
}> {
  const response = await fetch('/api/venues/types');
  if (!response.ok) {
    throw new Error('Failed to fetch venue types');
  }
  return response.json();
}

export function useVenueSearch(filters: VenueSearchFilters, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['venue-search', filters, pageSize],
    queryFn: ({ pageParam = 1 }) => searchVenues(filters, pageParam, pageSize),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useVenueBySlug(slug: string) {
  return useQuery({
    queryKey: ['venue-by-slug', slug],
    queryFn: () => fetchVenueBySlug(slug),
    enabled: !!slug,
  });
}

export function useVenueReviews(venueId: string) {
  return useInfiniteQuery({
    queryKey: ['venue-reviews', venueId],
    queryFn: ({ pageParam = 1 }) => fetchVenueReviews(venueId, pageParam),
    getNextPageParam: (lastPage) => lastPage.has_more ? undefined : undefined,
    initialPageParam: 1,
    enabled: !!venueId,
  });
}

export function useFeaturedVenues() {
  return useQuery({
    queryKey: ['featured-venues'],
    queryFn: fetchFeaturedVenues,
  });
}

export function useNearbyVenues(latitude: number, longitude: number, radiusKm: number = 25) {
  return useQuery({
    queryKey: ['nearby-venues', latitude, longitude, radiusKm],
    queryFn: () => fetchNearbyVenues(latitude, longitude, radiusKm),
    enabled: !!latitude && !!longitude,
  });
}

export function useVenueTypes() {
  return useQuery({
    queryKey: ['venue-types'],
    queryFn: fetchVenueTypes,
  });
}
