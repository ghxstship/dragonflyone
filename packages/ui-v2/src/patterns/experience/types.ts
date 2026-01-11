/**
 * Experience Pattern Types
 * Types for GVTEWAY white-label experience pages
 */

export interface Experience {
  id: string;
  organizerId: string;
  organizer: Organizer;
  title: string;
  description: string;
  category: string;
  location: Location;
  venue?: Venue;
  media: MediaItem[];
  pricing: Pricing;
  availability: Availability;
  duration: number; // in days
  groupSize: GroupSize;
  inclusions: Inclusions;
  itinerary: ItineraryDay[];
  highlights: Highlight[];
  faq: FAQItem[];
  cancellationPolicy: CancellationPolicy;
  rating: Rating;
  reviews: Review[];
  addOns?: AddOn[];
  badges?: Badge[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  bio: string;
  stats: OrganizerStats;
  contactEmail?: string;
  contactPhone?: string;
}

export interface OrganizerStats {
  eventsHosted: number;
  rating: number;
  responseRate: number;
  responseTime: string;
  memberSince: Date;
}

export interface Location {
  city: string;
  state?: string;
  country: string;
  coordinates?: Coordinates;
  nearby?: NearbyAttraction[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyAttraction {
  id: string;
  name: string;
  type: string;
  distance: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
  order: number;
}

export interface Pricing {
  basePrice: number;
  currency: string;
  startingPrice: number; // Lowest tier price
  priceBreakdown?: PriceItem[];
}

export interface PriceItem {
  id: string;
  label: string;
  amount: number;
  type: 'base' | 'fee' | 'tax' | 'discount' | 'addon';
}

export interface Availability {
  dates: AvailableDate[];
  spotsLeft: number;
  totalSpots: number;
  bookingDeadline?: Date;
}

export interface AvailableDate {
  id: string;
  startDate: Date;
  endDate: Date;
  spotsAvailable: number;
  price?: number; // Dynamic pricing
  status: 'available' | 'limited' | 'sold_out';
}

export interface GroupSize {
  min: number;
  max: number;
}

export interface Inclusions {
  included: InclusionItem[];
  excluded: InclusionItem[];
}

export interface InclusionItem {
  id: string;
  text: string;
  category?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  time: string;
  name: string;
  description: string;
  location?: string;
  duration?: string;
}

export interface Highlight {
  id: string;
  icon: string;
  text: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

export interface CancellationPolicy {
  type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  description: string;
  timeline: PolicyTier[];
}

export interface PolicyTier {
  id: string;
  period: string; // e.g., "Before 30 days"
  refundPercentage: number;
}

export interface Rating {
  average: number;
  count: number;
  breakdown: RatingBreakdown;
  categories?: RatingCategory[];
}

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface RatingCategory {
  name: string;
  score: number;
}

export interface Review {
  id: string;
  author: ReviewAuthor;
  rating: number;
  content: string;
  date: Date;
  images?: string[];
  response?: string;
  helpful: number;
  verified: boolean;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  avatar: string;
  location?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  required: boolean;
  maxQuantity?: number;
}

export interface Badge {
  id: string;
  text: string;
  variant: 'urgent' | 'new' | 'popular' | 'verified' | 'bestseller';
}

// ============================================================================
// Booking Types
// ============================================================================

export interface BookingDetails {
  experienceId: string;
  selectedDate: AvailableDate;
  guests: number;
  addOns: BookingAddOn[];
  contactInfo: ContactInfo;
}

export interface BookingAddOn {
  addOnId: string;
  quantity: number;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingCalculation {
  subtotal: number;
  addOnsTotal: number;
  serviceFee: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ExperienceCardProps {
  experience: Pick<
    Experience,
    | 'id'
    | 'title'
    | 'location'
    | 'media'
    | 'pricing'
    | 'rating'
    | 'duration'
    | 'availability'
    | 'badges'
  >;
  variant?: 'default' | 'compact' | 'featured';
  onBookmark?: (experienceId: string) => void;
}

export interface BookingWidgetProps {
  experience: Experience;
  sticky?: boolean;
  onBook: (booking: BookingDetails) => void;
}

export interface ExperienceHeroProps {
  experience: Pick<Experience, 'title' | 'media' | 'badges' | 'category'>;
}

export interface QuickInfoBarProps {
  experience: Pick<
    Experience,
    'location' | 'duration' | 'groupSize' | 'rating' | 'pricing'
  >;
}

export interface WhiteLabelNavProps {
  organizerId: string;
  organizerName: string;
  logo: string;
  navLinks?: Array<{ label: string; href: string }>;
}
