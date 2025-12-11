/**
 * GVTEWAY Demo Data
 * 
 * Centralized mock data for GVTEWAY application pages.
 * All inline mock data should be migrated here to ensure consistency
 * and easier maintenance.
 * 
 * Naming conventions:
 * - Interfaces: Demo[EntityName] (e.g., DemoEvent, DemoTicket)
 * - Constants: DEMO_[ENTITY_NAME]S (e.g., DEMO_EVENTS, DEMO_TICKETS)
 */

export const DEMO_DATA_VERSION = '1.0.0';

// =============================================================================
// ACCESSIBILITY (for accessibility/page.tsx)
// =============================================================================

export interface DemoAccessibilityRequest {
  id: string;
  eventName: string;
  eventId: string;
  guestName: string;
  email: string;
  requestType: string[];
  status: 'Pending' | 'Approved' | 'Confirmed' | 'Completed';
  submittedDate: string;
  notes?: string;
  [key: string]: unknown;
}

export interface DemoAccessibilityService {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  [key: string]: unknown;
}

export const DEMO_ACCESSIBILITY_REQUESTS: DemoAccessibilityRequest[] = [
  { id: 'ACC-001', eventName: 'Summer Fest 2024', eventId: 'EVT-001', guestName: 'Robert Johnson', email: 'robert@email.com', requestType: ['Wheelchair Seating', 'Companion Seat'], status: 'Confirmed', submittedDate: '2024-11-20', notes: 'Section A, Row 1' },
  { id: 'ACC-002', eventName: 'Summer Fest 2024', eventId: 'EVT-001', guestName: 'Maria Garcia', email: 'maria@email.com', requestType: ['ASL Interpreter'], status: 'Approved', submittedDate: '2024-11-22' },
  { id: 'ACC-003', eventName: 'Fall Concert', eventId: 'EVT-002', guestName: 'James Wilson', email: 'james@email.com', requestType: ['Assistive Listening Device'], status: 'Pending', submittedDate: '2024-11-24' },
];

export const DEMO_ACCESSIBILITY_SERVICES: DemoAccessibilityService[] = [
  { id: 'SVC-001', name: 'Wheelchair Accessible Seating', description: 'Designated wheelchair spaces with companion seating', icon: '♿', available: true },
  { id: 'SVC-002', name: 'ASL Interpretation', description: 'American Sign Language interpreters for performances', icon: '🤟', available: true },
  { id: 'SVC-003', name: 'Assistive Listening Devices', description: 'Personal amplification devices available at venue', icon: '🎧', available: true },
  { id: 'SVC-004', name: 'Audio Description', description: 'Live audio description of visual elements', icon: '🔊', available: true },
  { id: 'SVC-005', name: 'Service Animal Accommodations', description: 'Relief areas and water stations for service animals', icon: '🐕', available: true },
  { id: 'SVC-006', name: 'Sensory-Friendly Viewing', description: 'Quiet areas with reduced sensory stimulation', icon: '🧘', available: true },
  { id: 'SVC-007', name: 'Accessible Parking', description: 'Reserved accessible parking spaces near entrance', icon: '🅿️', available: true },
  { id: 'SVC-008', name: 'Mobility Assistance', description: 'Wheelchair and mobility device rentals', icon: '🦽', available: true },
];

// =============================================================================
// ACCOUNT - ORDERS (for account/orders/page.tsx)
// =============================================================================

export interface DemoOrder {
  id: string;
  date: string;
  eventName: string;
  ticketCount: number;
  total: number;
  status: 'completed' | 'pending' | 'refunded';
  [key: string]: unknown;
}

export const DEMO_ORDERS: DemoOrder[] = [
  { id: 'ORD-12345', date: '2024-11-10', eventName: 'Summer Music Festival 2024', ticketCount: 2, total: 350, status: 'completed' },
  { id: 'ORD-12346', date: '2024-11-05', eventName: 'New Years Eve Concert', ticketCount: 4, total: 600, status: 'completed' },
  { id: 'ORD-12347', date: '2024-10-01', eventName: 'Fall Festival', ticketCount: 2, total: 150, status: 'completed' },
  { id: 'ORD-12348', date: '2024-09-15', eventName: 'Jazz Night', ticketCount: 2, total: 100, status: 'refunded' },
];

// =============================================================================
// ACCOUNT - DASHBOARD (for account/page.tsx)
// =============================================================================

export interface DemoUpcomingEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  ticketCount: number;
  [key: string]: unknown;
}

export const DEMO_UPCOMING_EVENTS: DemoUpcomingEvent[] = [
  { id: 'E-001', name: 'Summer Music Festival 2024', date: 'Nov 20, 2024', venue: 'Outdoor Amphitheater', ticketCount: 2 },
  { id: 'E-002', name: 'New Years Eve Concert', date: 'Dec 31, 2024', venue: 'City Arena', ticketCount: 4 },
];
