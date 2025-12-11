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

// =============================================================================
// ACCOUNT - TICKETS (for account/tickets/page.tsx)
// =============================================================================

export interface DemoUserTicket {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  section?: string;
  row?: string;
  seat?: string;
  status: 'active' | 'used' | 'transferred';
  [key: string]: unknown;
}

export const DEMO_USER_TICKETS: DemoUserTicket[] = [
  { id: 'TKT-001', eventName: 'Summer Music Festival 2024', eventDate: 'Nov 20, 2024 - 7:00 PM', venue: 'Outdoor Amphitheater', ticketType: 'VIP', section: 'VIP-A', row: '1', seat: '5', status: 'active' },
  { id: 'TKT-002', eventName: 'Summer Music Festival 2024', eventDate: 'Nov 20, 2024 - 7:00 PM', venue: 'Outdoor Amphitheater', ticketType: 'VIP', section: 'VIP-A', row: '1', seat: '6', status: 'active' },
  { id: 'TKT-003', eventName: 'New Years Eve Concert', eventDate: 'Dec 31, 2024 - 9:00 PM', venue: 'City Arena', ticketType: 'GA', status: 'active' },
  { id: 'TKT-004', eventName: 'Fall Festival', eventDate: 'Oct 15, 2024 - 6:00 PM', venue: 'Downtown Park', ticketType: 'GA', status: 'used' },
];

// =============================================================================
// ADMIN - ANTI-SCALPING (for admin/anti-scalping/page.tsx)
// =============================================================================

export interface DemoScalpingAlert {
  id: string;
  type: 'bulk_purchase' | 'rapid_checkout' | 'suspicious_pattern' | 'bot_detected' | 'resale_listing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  event_id: string;
  event_name: string;
  details: string;
  ip_address?: string;
  user_id?: string;
  user_email?: string;
  ticket_count: number;
  status: 'pending' | 'investigating' | 'blocked' | 'cleared';
  created_at: string;
  [key: string]: unknown;
}

export interface DemoProtectionRule {
  id: string;
  name: string;
  type: 'purchase_limit' | 'velocity_check' | 'captcha' | 'verification' | 'ip_block' | 'device_fingerprint';
  enabled: boolean;
  threshold?: number;
  action: 'warn' | 'block' | 'require_verification' | 'flag_review';
  description: string;
  [key: string]: unknown;
}

export interface DemoBlockedEntity {
  id: string;
  type: 'ip' | 'email' | 'device' | 'payment_method';
  value: string;
  reason: string;
  blocked_at: string;
  expires_at?: string;
  [key: string]: unknown;
}

export const DEMO_SCALPING_ALERTS: DemoScalpingAlert[] = [
  { id: 'ALT-001', type: 'bulk_purchase', severity: 'high', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Attempted purchase of 50 tickets in single transaction', ip_address: '192.168.1.100', user_email: 'suspicious@email.com', ticket_count: 50, status: 'blocked', created_at: '2024-11-24T14:30:00Z' },
  { id: 'ALT-002', type: 'bot_detected', severity: 'critical', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Automated checkout behavior detected', ip_address: '10.0.0.55', ticket_count: 20, status: 'blocked', created_at: '2024-11-24T14:25:00Z' },
  { id: 'ALT-003', type: 'rapid_checkout', severity: 'medium', event_id: 'EVT-002', event_name: 'Fall Concert', details: 'Multiple purchases from same IP within 2 minutes', ip_address: '172.16.0.88', user_email: 'buyer@email.com', ticket_count: 12, status: 'investigating', created_at: '2024-11-24T13:45:00Z' },
  { id: 'ALT-004', type: 'resale_listing', severity: 'high', event_id: 'EVT-001', event_name: 'Summer Fest 2024', details: 'Tickets listed on secondary market above face value', user_email: 'reseller@email.com', ticket_count: 8, status: 'pending', created_at: '2024-11-24T12:00:00Z' },
  { id: 'ALT-005', type: 'suspicious_pattern', severity: 'low', event_id: 'EVT-003', event_name: 'Winter Gala', details: 'Multiple accounts created from same device', ticket_count: 6, status: 'cleared', created_at: '2024-11-24T10:30:00Z' },
];

export const DEMO_PROTECTION_RULES: DemoProtectionRule[] = [
  { id: 'RULE-001', name: 'Purchase Limit', type: 'purchase_limit', enabled: true, threshold: 8, action: 'block', description: 'Maximum tickets per transaction' },
  { id: 'RULE-002', name: 'Velocity Check', type: 'velocity_check', enabled: true, threshold: 3, action: 'require_verification', description: 'Max purchases per hour from same IP' },
  { id: 'RULE-003', name: 'CAPTCHA Challenge', type: 'captcha', enabled: true, action: 'require_verification', description: 'Require CAPTCHA for suspicious behavior' },
  { id: 'RULE-004', name: 'ID Verification', type: 'verification', enabled: false, action: 'require_verification', description: 'Require ID verification for high-value purchases' },
  { id: 'RULE-005', name: 'Device Fingerprinting', type: 'device_fingerprint', enabled: true, action: 'flag_review', description: 'Track and flag multiple accounts per device' },
  { id: 'RULE-006', name: 'Known Bot IPs', type: 'ip_block', enabled: true, action: 'block', description: 'Block known bot and proxy IP addresses' },
];

export const DEMO_BLOCKED_ENTITIES: DemoBlockedEntity[] = [
  { id: 'BLK-001', type: 'ip', value: '192.168.1.100', reason: 'Bulk purchase attempt', blocked_at: '2024-11-24T14:30:00Z' },
  { id: 'BLK-002', type: 'ip', value: '10.0.0.55', reason: 'Bot activity detected', blocked_at: '2024-11-24T14:25:00Z' },
  { id: 'BLK-003', type: 'email', value: 'scalper@email.com', reason: 'Confirmed scalping activity', blocked_at: '2024-11-20T09:00:00Z' },
];

// =============================================================================
// ADMIN - POS CASHLESS (for admin/pos/cashless/page.tsx)
// =============================================================================

export interface DemoPaymentTerminal {
  id: string;
  name: string;
  location: string;
  type: 'fixed' | 'mobile' | 'kiosk';
  status: 'online' | 'offline' | 'processing' | 'error';
  supported_methods: string[];
  last_transaction?: string;
  transactions_today: number;
  revenue_today: number;
  battery_level?: number;
  [key: string]: unknown;
}

export interface DemoTransaction {
  id: string;
  terminal_id: string;
  terminal_name: string;
  amount: number;
  tip_amount?: number;
  payment_method: 'tap' | 'chip' | 'swipe' | 'nfc' | 'qr' | 'wristband';
  card_type?: string;
  card_last_four?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  timestamp: string;
  order_id?: string;
  [key: string]: unknown;
}

export interface DemoPaymentMethod {
  id: string;
  name: string;
  type: 'contactless' | 'chip' | 'swipe' | 'mobile' | 'wristband';
  icon: string;
  enabled: boolean;
  fee_percent: number;
  processing_time: string;
  [key: string]: unknown;
}

export const DEMO_PAYMENT_TERMINALS: DemoPaymentTerminal[] = [
  { id: 'TRM-001', name: 'Main Bar Terminal 1', location: 'Main Bar', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:30:00Z', transactions_today: 245, revenue_today: 4850.50 },
  { id: 'TRM-002', name: 'Main Bar Terminal 2', location: 'Main Bar', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:28:00Z', transactions_today: 198, revenue_today: 3920.25 },
  { id: 'TRM-003', name: 'Merch Booth A', location: 'Merchandise', type: 'fixed', status: 'online', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], last_transaction: '2024-11-24T14:25:00Z', transactions_today: 156, revenue_today: 8750.00 },
  { id: 'TRM-004', name: 'Mobile Server 1', location: 'Floor', type: 'mobile', status: 'online', supported_methods: ['tap', 'nfc'], last_transaction: '2024-11-24T14:32:00Z', transactions_today: 89, revenue_today: 1780.75, battery_level: 78 },
  { id: 'TRM-005', name: 'Mobile Server 2', location: 'Floor', type: 'mobile', status: 'processing', supported_methods: ['tap', 'nfc'], transactions_today: 67, revenue_today: 1340.00, battery_level: 45 },
  { id: 'TRM-006', name: 'Self-Service Kiosk 1', location: 'Entrance', type: 'kiosk', status: 'online', supported_methods: ['tap', 'chip', 'nfc', 'qr'], last_transaction: '2024-11-24T14:29:00Z', transactions_today: 312, revenue_today: 6240.00 },
  { id: 'TRM-007', name: 'VIP Bar Terminal', location: 'VIP Area', type: 'fixed', status: 'offline', supported_methods: ['tap', 'chip', 'swipe', 'nfc'], transactions_today: 0, revenue_today: 0 },
];

export const DEMO_POS_TRANSACTIONS: DemoTransaction[] = [
  { id: 'TXN-001', terminal_id: 'TRM-001', terminal_name: 'Main Bar Terminal 1', amount: 24.50, tip_amount: 5.00, payment_method: 'tap', card_type: 'Visa', card_last_four: '4242', status: 'completed', timestamp: '2024-11-24T14:30:00Z' },
  { id: 'TXN-002', terminal_id: 'TRM-003', terminal_name: 'Merch Booth A', amount: 85.00, payment_method: 'chip', card_type: 'Mastercard', card_last_four: '5555', status: 'completed', timestamp: '2024-11-24T14:28:00Z' },
  { id: 'TXN-003', terminal_id: 'TRM-004', terminal_name: 'Mobile Server 1', amount: 18.00, tip_amount: 4.00, payment_method: 'nfc', card_type: 'Apple Pay', status: 'completed', timestamp: '2024-11-24T14:25:00Z' },
  { id: 'TXN-004', terminal_id: 'TRM-006', terminal_name: 'Self-Service Kiosk 1', amount: 45.00, payment_method: 'qr', status: 'completed', timestamp: '2024-11-24T14:22:00Z' },
  { id: 'TXN-005', terminal_id: 'TRM-002', terminal_name: 'Main Bar Terminal 2', amount: 32.00, payment_method: 'swipe', card_type: 'Amex', card_last_four: '3782', status: 'failed', timestamp: '2024-11-24T14:20:00Z' },
];

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
  { id: 'PM-001', name: 'Contactless (Tap)', type: 'contactless', icon: 'wifi', enabled: true, fee_percent: 2.6, processing_time: '< 2 sec' },
  { id: 'PM-002', name: 'Chip (EMV)', type: 'chip', icon: 'creditcard', enabled: true, fee_percent: 2.4, processing_time: '3-5 sec' },
  { id: 'PM-003', name: 'Magnetic Swipe', type: 'swipe', icon: 'creditcard', enabled: true, fee_percent: 2.9, processing_time: '2-3 sec' },
  { id: 'PM-004', name: 'Apple Pay / Google Pay', type: 'mobile', icon: 'smartphone', enabled: true, fee_percent: 2.6, processing_time: '< 2 sec' },
  { id: 'PM-005', name: 'RFID Wristband', type: 'wristband', icon: 'watch', enabled: true, fee_percent: 1.5, processing_time: '< 1 sec' },
];

// =============================================================================
// ADMIN - INVENTORY SYNC (for admin/inventory-sync/page.tsx)
// =============================================================================

export interface DemoInventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'online';
  quantity: number;
  last_updated: string;
  [key: string]: unknown;
}

export interface DemoInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  online_quantity: number;
  physical_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  last_sync: string;
  locations: DemoInventoryLocation[];
  [key: string]: unknown;
}

export interface DemoSyncLog {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'scheduled';
  items_synced: number;
  conflicts: number;
  status: 'completed' | 'failed' | 'partial';
  duration_ms: number;
  [key: string]: unknown;
}

export const DEMO_INVENTORY_LOCATIONS: DemoInventoryLocation[] = [
  { id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 100, last_updated: '2024-11-24T14:30:00Z' },
  { id: 'LOC-002', name: 'Online Store', type: 'online', quantity: 50, last_updated: '2024-11-24T14:30:00Z' },
];

export const DEMO_INVENTORY_ITEMS: DemoInventoryItem[] = [
  { id: 'INV-001', sku: 'TSHIRT-BLK-M', name: 'Tour T-Shirt Black (M)', category: 'Apparel', online_quantity: 150, physical_quantity: 148, reserved_quantity: 12, available_quantity: 136, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: DEMO_INVENTORY_LOCATIONS },
  { id: 'INV-002', sku: 'HOODIE-GRY-L', name: 'Tour Hoodie Gray (L)', category: 'Apparel', online_quantity: 75, physical_quantity: 72, reserved_quantity: 5, available_quantity: 67, sync_status: 'conflict', last_sync: '2024-11-24T14:28:00Z', locations: DEMO_INVENTORY_LOCATIONS },
  { id: 'INV-003', sku: 'POSTER-LTD', name: 'Limited Edition Poster', category: 'Collectibles', online_quantity: 200, physical_quantity: 200, reserved_quantity: 45, available_quantity: 155, sync_status: 'synced', last_sync: '2024-11-24T14:32:00Z', locations: DEMO_INVENTORY_LOCATIONS },
  { id: 'INV-004', sku: 'CAP-BLK', name: 'Snapback Cap Black', category: 'Accessories', online_quantity: 85, physical_quantity: 85, reserved_quantity: 8, available_quantity: 77, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: DEMO_INVENTORY_LOCATIONS },
  { id: 'INV-005', sku: 'VINYL-ALBUM', name: 'Vinyl Album', category: 'Music', online_quantity: 50, physical_quantity: 48, reserved_quantity: 3, available_quantity: 45, sync_status: 'pending', last_sync: '2024-11-24T14:15:00Z', locations: DEMO_INVENTORY_LOCATIONS },
];

export const DEMO_SYNC_LOGS: DemoSyncLog[] = [
  { id: 'LOG-001', timestamp: '2024-11-24T14:30:00Z', type: 'auto', items_synced: 5, conflicts: 1, status: 'completed', duration_ms: 1500 },
  { id: 'LOG-002', timestamp: '2024-11-24T14:00:00Z', type: 'scheduled', items_synced: 5, conflicts: 0, status: 'completed', duration_ms: 1200 },
  { id: 'LOG-003', timestamp: '2024-11-24T13:30:00Z', type: 'manual', items_synced: 3, conflicts: 0, status: 'completed', duration_ms: 800 },
];

// =============================================================================
// CHECKOUT - CURRENCY (for checkout/currency/page.tsx)
// =============================================================================

export interface DemoCurrency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  enabled: boolean;
  lastUpdated: string;
  [key: string]: unknown;
}

export interface DemoLocalizedPrice {
  eventName: string;
  basePrice: number;
  baseCurrency: string;
  localizedPrices: { currency: string; price: number }[];
  [key: string]: unknown;
}

export const DEMO_CURRENCIES: DemoCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, enabled: true, lastUpdated: '2024-11-25' },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, enabled: true, lastUpdated: '2024-11-25' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79, enabled: true, lastUpdated: '2024-11-25' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.36, enabled: true, lastUpdated: '2024-11-25' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.53, enabled: true, lastUpdated: '2024-11-25' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.50, enabled: false, lastUpdated: '2024-11-25' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', rate: 17.25, enabled: false, lastUpdated: '2024-11-25' },
];

export const DEMO_LOCALIZED_PRICES: DemoLocalizedPrice[] = [
  { eventName: 'Summer Music Festival 2025', basePrice: 150, baseCurrency: 'USD', localizedPrices: [{ currency: 'EUR', price: 138 }, { currency: 'GBP', price: 119 }, { currency: 'CAD', price: 204 }] },
  { eventName: 'New Year Gala', basePrice: 250, baseCurrency: 'USD', localizedPrices: [{ currency: 'EUR', price: 230 }, { currency: 'GBP', price: 198 }, { currency: 'CAD', price: 340 }] },
];

// =============================================================================
// COMMUNITY - CHALLENGES (for community/challenges/page.tsx)
// =============================================================================

export interface DemoChallenge {
  id: string;
  title: string;
  description: string;
  type: 'Individual' | 'Team' | 'Community';
  category: 'Attendance' | 'Social' | 'Engagement' | 'Referral' | 'Collection';
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  participants: number;
  goal: number;
  currentProgress: number;
  reward: string;
  rewardPoints: number;
  userProgress?: number;
  userCompleted?: boolean;
  [key: string]: unknown;
}

export interface DemoLeaderboard {
  rank: number;
  userName: string;
  points: number;
  completedChallenges: number;
  [key: string]: unknown;
}

export const DEMO_CHALLENGES: DemoChallenge[] = [
  { id: 'CH-001', title: 'Concert Explorer', description: 'Attend 5 different events this season', type: 'Individual', category: 'Attendance', startDate: '2024-11-01', endDate: '2024-12-31', status: 'Active', participants: 1250, goal: 5, currentProgress: 3, reward: 'Explorer Badge + 500 Points', rewardPoints: 500, userProgress: 3 },
  { id: 'CH-002', title: 'Social Butterfly', description: 'Share 10 events on social media', type: 'Individual', category: 'Social', startDate: '2024-11-01', endDate: '2024-11-30', status: 'Active', participants: 890, goal: 10, currentProgress: 7, reward: 'Social Badge + 300 Points', rewardPoints: 300, userProgress: 7 },
  { id: 'CH-003', title: 'Community Goal: 10K Check-ins', description: 'Help the community reach 10,000 event check-ins', type: 'Community', category: 'Engagement', startDate: '2024-11-01', endDate: '2024-11-30', status: 'Active', participants: 4500, goal: 10000, currentProgress: 7850, reward: 'Everyone gets 100 bonus points', rewardPoints: 100 },
  { id: 'CH-004', title: 'Referral Champion', description: 'Invite 3 friends who purchase tickets', type: 'Individual', category: 'Referral', startDate: '2024-11-15', endDate: '2024-12-15', status: 'Active', participants: 450, goal: 3, currentProgress: 1, reward: 'Free Ticket + 1000 Points', rewardPoints: 1000, userProgress: 1 },
  { id: 'CH-005', title: 'Merch Collector', description: 'Purchase items from 3 different events', type: 'Individual', category: 'Collection', startDate: '2024-12-01', endDate: '2024-12-31', status: 'Upcoming', participants: 0, goal: 3, currentProgress: 0, reward: 'Collector Badge + Exclusive Item', rewardPoints: 750 },
  { id: 'CH-006', title: 'Summer Fest Superfan', description: 'Complete all Summer Fest activities', type: 'Individual', category: 'Engagement', startDate: '2024-10-01', endDate: '2024-10-31', status: 'Completed', participants: 2100, goal: 10, currentProgress: 10, reward: 'Superfan Badge + VIP Upgrade', rewardPoints: 2000, userProgress: 10, userCompleted: true },
];

export const DEMO_LEADERBOARD: DemoLeaderboard[] = [
  { rank: 1, userName: 'MusicFan2024', points: 15420, completedChallenges: 12 },
  { rank: 2, userName: 'ConcertQueen', points: 14850, completedChallenges: 11 },
  { rank: 3, userName: 'LiveShowLover', points: 13200, completedChallenges: 10 },
  { rank: 4, userName: 'FestivalFreak', points: 12100, completedChallenges: 9 },
  { rank: 5, userName: 'VenueHopper', points: 11500, completedChallenges: 9 },
];

// =============================================================================
// EVENTS - ACCESSIBILITY (for events/[id]/accessibility/page.tsx)
// =============================================================================

export interface DemoEventAccessibilityService {
  id: string;
  name: string;
  description: string;
  available: boolean;
  requiresRequest: boolean;
  leadTime?: string;
  [key: string]: unknown;
}

export interface DemoAgeRestriction {
  type: 'All Ages' | '18+' | '21+' | 'Under 18 with Guardian';
  description: string;
  idRequired: boolean;
  guardianRequired: boolean;
  [key: string]: unknown;
}

export interface DemoEventAccessibilityRequest {
  id: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Denied';
  requestDate: string;
  notes?: string;
  [key: string]: unknown;
}

export const DEMO_EVENT_ACCESSIBILITY_SERVICES: DemoEventAccessibilityService[] = [
  { id: 'SVC-001', name: 'Wheelchair Accessible Seating', description: 'Designated wheelchair spaces with companion seating', available: true, requiresRequest: false },
  { id: 'SVC-002', name: 'ASL Interpretation', description: 'American Sign Language interpreters for performances', available: true, requiresRequest: true, leadTime: '7 days' },
  { id: 'SVC-003', name: 'Audio Description', description: 'Live audio description of visual elements', available: true, requiresRequest: true, leadTime: '5 days' },
  { id: 'SVC-004', name: 'Assistive Listening Devices', description: 'FM receivers and headsets available at venue', available: true, requiresRequest: false },
  { id: 'SVC-005', name: 'Service Animal Accommodation', description: 'Service animals welcome at all events', available: true, requiresRequest: false },
  { id: 'SVC-006', name: 'Sensory-Friendly Performance', description: 'Modified lighting and sound levels', available: false, requiresRequest: true },
  { id: 'SVC-007', name: 'Large Print Programs', description: 'Event programs in large print format', available: true, requiresRequest: true, leadTime: '3 days' },
  { id: 'SVC-008', name: 'Accessible Parking', description: 'Reserved accessible parking spaces near entrance', available: true, requiresRequest: false },
];

export const DEMO_AGE_RESTRICTION: DemoAgeRestriction = {
  type: '21+',
  description: 'This event is 21+ only. Valid government-issued photo ID required for entry.',
  idRequired: true,
  guardianRequired: false,
};

export const DEMO_EVENT_ACCESSIBILITY_REQUESTS: DemoEventAccessibilityRequest[] = [
  { id: 'REQ-001', type: 'ASL Interpretation', status: 'Approved', requestDate: '2024-11-15', notes: 'Interpreter confirmed for main stage' },
  { id: 'REQ-002', type: 'Wheelchair Seating', status: 'Approved', requestDate: '2024-11-18' },
];

// =============================================================================
// EVENTS - LANGUAGES (for events/[id]/languages/page.tsx)
// =============================================================================

export interface DemoTranslation {
  id: string;
  language: string;
  languageCode: string;
  status: 'Complete' | 'In Progress' | 'Not Started';
  progress: number;
  lastUpdated?: string;
  translator?: string;
  [key: string]: unknown;
}

export interface DemoTranslationField {
  field: string;
  original: string;
  translated?: string;
  status: 'Translated' | 'Pending' | 'Review';
  [key: string]: unknown;
}

export const DEMO_TRANSLATIONS: DemoTranslation[] = [
  { id: 'TR-001', language: 'Spanish', languageCode: 'es', status: 'Complete', progress: 100, lastUpdated: '2024-11-20', translator: 'Maria Garcia' },
  { id: 'TR-002', language: 'French', languageCode: 'fr', status: 'In Progress', progress: 65, lastUpdated: '2024-11-24', translator: 'Jean Dupont' },
  { id: 'TR-003', language: 'German', languageCode: 'de', status: 'In Progress', progress: 40, lastUpdated: '2024-11-23' },
  { id: 'TR-004', language: 'Japanese', languageCode: 'ja', status: 'Not Started', progress: 0 },
  { id: 'TR-005', language: 'Portuguese', languageCode: 'pt', status: 'Complete', progress: 100, lastUpdated: '2024-11-18', translator: 'Carlos Silva' },
];

export const DEMO_TRANSLATION_FIELDS: DemoTranslationField[] = [
  { field: 'Event Title', original: 'Summer Music Festival 2025', translated: 'Festival de Música de Verano 2025', status: 'Translated' },
  { field: 'Description', original: 'Join us for three days of incredible live music featuring top artists from around the world.', translated: 'Únete a nosotros para tres días de increíble música en vivo con los mejores artistas de todo el mundo.', status: 'Translated' },
  { field: 'Venue Info', original: 'Central Park, New York City', translated: 'Central Park, Nueva York', status: 'Translated' },
  { field: 'Ticket Info', original: 'General Admission tickets include access to all stages.', status: 'Pending' },
  { field: 'Safety Guidelines', original: 'Please review our safety guidelines before attending.', status: 'Review' },
];

// =============================================================================
// EVENTS - PARKING (for events/[id]/parking/page.tsx)
// =============================================================================

export interface DemoParkingOption {
  id: string;
  name: string;
  type: 'Standard' | 'Premium' | 'VIP' | 'Accessible' | 'Rideshare';
  price: number;
  distance: string;
  walkTime: string;
  spotsAvailable: number;
  totalSpots: number;
  features: string[];
  address?: string;
  [key: string]: unknown;
}

export interface DemoTransportOption {
  id: string;
  name: string;
  type: 'Shuttle' | 'Public Transit' | 'Rideshare Zone' | 'Bike Parking';
  description: string;
  schedule?: string;
  price?: number;
  features: string[];
  [key: string]: unknown;
}

export const DEMO_PARKING_OPTIONS: DemoParkingOption[] = [
  { id: 'PKG-001', name: 'Main Lot A', type: 'Standard', price: 25, distance: '0.2 miles', walkTime: '5 min', spotsAvailable: 450, totalSpots: 800, features: ['Paved', 'Well-lit', 'Security patrol'], address: '123 Main St' },
  { id: 'PKG-002', name: 'Premium Lot B', type: 'Premium', price: 45, distance: '0.1 miles', walkTime: '2 min', spotsAvailable: 85, totalSpots: 200, features: ['Closest to entrance', 'Covered', 'EV charging'], address: '125 Main St' },
  { id: 'PKG-003', name: 'VIP Valet', type: 'VIP', price: 75, distance: 'At venue', walkTime: '0 min', spotsAvailable: 25, totalSpots: 50, features: ['Valet service', 'Priority exit', 'Complimentary wash'] },
  { id: 'PKG-004', name: 'Accessible Parking', type: 'Accessible', price: 25, distance: '0.05 miles', walkTime: '1 min', spotsAvailable: 30, totalSpots: 40, features: ['ADA compliant', 'Level surface', 'Close to accessible entrance'] },
  { id: 'PKG-005', name: 'Rideshare Drop-off', type: 'Rideshare', price: 0, distance: '0.1 miles', walkTime: '3 min', spotsAvailable: 999, totalSpots: 999, features: ['Designated zone', 'Well-marked', 'Safe pickup area'] },
];

export const DEMO_TRANSPORT_OPTIONS: DemoTransportOption[] = [
  { id: 'TRN-001', name: 'Event Shuttle', type: 'Shuttle', description: 'Free shuttle from downtown transit hub', schedule: 'Every 15 min starting 2 hours before event', price: 0, features: ['Free', 'Air conditioned', 'Wheelchair accessible'] },
  { id: 'TRN-002', name: 'Metro Line', type: 'Public Transit', description: 'Blue Line to Convention Center Station', schedule: 'Regular service, extra trains after event', price: 3, features: ['$3 each way', '5 min walk to venue', 'Late service available'] },
  { id: 'TRN-003', name: 'Uber/Lyft Zone', type: 'Rideshare Zone', description: 'Designated pickup and drop-off area', features: ['North side of venue', 'Well-lit', 'Security present'] },
  { id: 'TRN-004', name: 'Bike Valet', type: 'Bike Parking', description: 'Free secure bike parking', features: ['Free', 'Attended', 'Helmet storage available'] },
];

// =============================================================================
// EVENTS - PHOTO BOOTH (for events/[id]/photo-booth/page.tsx)
// =============================================================================

export interface DemoPhotoBoothSession {
  id: string;
  boothId: string;
  boothName: string;
  timestamp: string;
  photoCount: number;
  shared: boolean;
  sharedTo?: string[];
  email?: string;
  printed: boolean;
  [key: string]: unknown;
}

export interface DemoPhotoBooth {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Offline' | 'Maintenance';
  sessionCount: number;
  photosTaken: number;
  [key: string]: unknown;
}

export const DEMO_PHOTO_BOOTHS: DemoPhotoBooth[] = [
  { id: 'PB-001', name: 'Main Entrance Booth', location: 'North Gate', status: 'Active', sessionCount: 156, photosTaken: 468 },
  { id: 'PB-002', name: 'VIP Lounge Booth', location: 'VIP Area', status: 'Active', sessionCount: 45, photosTaken: 135 },
  { id: 'PB-003', name: 'Stage Area Booth', location: 'Near Main Stage', status: 'Active', sessionCount: 234, photosTaken: 702 },
  { id: 'PB-004', name: 'Merch Tent Booth', location: 'Merchandise Area', status: 'Offline', sessionCount: 89, photosTaken: 267 },
];

export const DEMO_PHOTO_BOOTH_SESSIONS: DemoPhotoBoothSession[] = [
  { id: 'SES-001', boothId: 'PB-001', boothName: 'Main Entrance', timestamp: '2024-11-24T20:15:00Z', photoCount: 3, shared: true, sharedTo: ['Instagram', 'Email'], email: 'john@email.com', printed: true },
  { id: 'SES-002', boothId: 'PB-003', boothName: 'Stage Area', timestamp: '2024-11-24T20:12:00Z', photoCount: 4, shared: true, sharedTo: ['TikTok'], printed: false },
  { id: 'SES-003', boothId: 'PB-002', boothName: 'VIP Lounge', timestamp: '2024-11-24T20:10:00Z', photoCount: 2, shared: false, printed: true },
  { id: 'SES-004', boothId: 'PB-001', boothName: 'Main Entrance', timestamp: '2024-11-24T20:08:00Z', photoCount: 3, shared: true, sharedTo: ['Instagram', 'Facebook'], email: 'sarah@email.com', printed: true },
];

// =============================================================================
// EVENTS - CLONE (for events/clone/page.tsx)
// =============================================================================

export interface DemoEventTemplate {
  id: string;
  name: string;
  type: 'Concert' | 'Festival' | 'Corporate' | 'Theater' | 'Sports' | 'Custom';
  description: string;
  lastUsed?: string;
  timesUsed: number;
  sections: string[];
  [key: string]: unknown;
}

export interface DemoRecentEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  type: string;
  [key: string]: unknown;
}

export const DEMO_EVENT_TEMPLATES: DemoEventTemplate[] = [
  { id: 'TPL-001', name: 'Standard Concert', type: 'Concert', description: 'Single artist concert with GA and reserved seating', timesUsed: 45, lastUsed: '2024-11-20', sections: ['Event Info', 'Ticketing', 'Seating', 'Marketing'] },
  { id: 'TPL-002', name: 'Multi-Day Festival', type: 'Festival', description: 'Multi-day outdoor festival with multiple stages', timesUsed: 12, lastUsed: '2024-10-15', sections: ['Event Info', 'Ticketing', 'Lineup', 'Camping', 'Vendors', 'Marketing'] },
  { id: 'TPL-003', name: 'Corporate Conference', type: 'Corporate', description: 'Business conference with sessions and networking', timesUsed: 28, lastUsed: '2024-11-18', sections: ['Event Info', 'Registration', 'Sessions', 'Sponsors', 'Networking'] },
  { id: 'TPL-004', name: 'Theater Production', type: 'Theater', description: 'Theatrical performance with assigned seating', timesUsed: 15, lastUsed: '2024-11-10', sections: ['Event Info', 'Ticketing', 'Seating', 'Cast', 'Marketing'] },
  { id: 'TPL-005', name: 'Sporting Event', type: 'Sports', description: 'Sports event with tiered seating and concessions', timesUsed: 8, lastUsed: '2024-09-25', sections: ['Event Info', 'Ticketing', 'Seating', 'Teams', 'Concessions'] },
];

export const DEMO_RECENT_EVENTS: DemoRecentEvent[] = [
  { id: 'EVT-001', name: 'Summer Music Festival 2024', date: '2024-08-15', venue: 'Central Park', type: 'Festival' },
  { id: 'EVT-002', name: 'Tech Conference 2024', date: '2024-10-20', venue: 'Convention Center', type: 'Corporate' },
  { id: 'EVT-003', name: 'Rock Concert Tour', date: '2024-11-05', venue: 'Madison Square Garden', type: 'Concert' },
  { id: 'EVT-004', name: 'Holiday Gala', date: '2024-12-15', venue: 'Grand Ballroom', type: 'Corporate' },
];

// =============================================================================
// EVENTS - COLLABORATION (for events/create/collaboration/page.tsx)
// =============================================================================

export interface DemoCollaborator {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: 'Promoter' | 'Venue' | 'Artist' | 'Sponsor' | 'Production';
  permissions: string[];
  status: 'Active' | 'Pending' | 'Revoked';
  lastActive?: string;
  [key: string]: unknown;
}

export interface DemoActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  section: string;
  [key: string]: unknown;
}

export const DEMO_COLLABORATORS: DemoCollaborator[] = [
  { id: 'COL-001', name: 'John Smith', email: 'john@promoter.com', organization: 'Live Nation', role: 'Promoter', permissions: ['Edit Event', 'Manage Tickets', 'View Analytics'], status: 'Active', lastActive: '2 hours ago' },
  { id: 'COL-002', name: 'Sarah Johnson', email: 'sarah@venue.com', organization: 'Madison Square Garden', role: 'Venue', permissions: ['View Event', 'Edit Venue Info', 'Manage Capacity'], status: 'Active', lastActive: '1 day ago' },
  { id: 'COL-003', name: 'Mike Davis', email: 'mike@artist.com', organization: 'Artist Management', role: 'Artist', permissions: ['View Event', 'Edit Artist Info'], status: 'Pending' },
  { id: 'COL-004', name: 'Emily Chen', email: 'emily@sponsor.com', organization: 'Brand Corp', role: 'Sponsor', permissions: ['View Event', 'View Analytics'], status: 'Active', lastActive: '3 days ago' },
];

export const DEMO_ACTIVITY_LOGS: DemoActivityLog[] = [
  { id: 'ACT-001', user: 'John Smith', action: 'Updated ticket pricing', timestamp: '2 hours ago', section: 'Ticketing' },
  { id: 'ACT-002', user: 'Sarah Johnson', action: 'Modified venue capacity', timestamp: '1 day ago', section: 'Venue' },
  { id: 'ACT-003', user: 'You', action: 'Added new collaborator', timestamp: '2 days ago', section: 'Team' },
  { id: 'ACT-004', user: 'Emily Chen', action: 'Viewed analytics report', timestamp: '3 days ago', section: 'Analytics' },
];

export const DEMO_PERMISSION_OPTIONS = [
  'View Event',
  'Edit Event',
  'Manage Tickets',
  'View Analytics',
  'Edit Venue Info',
  'Manage Capacity',
  'Edit Artist Info',
  'Manage Marketing',
];

// =============================================================================
// FAN CLUB - EXCLUSIVE ACCESS (for fan-club/exclusive-access/page.tsx)
// =============================================================================

export interface DemoExclusiveWindow {
  id: string;
  eventName: string;
  windowName: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'All Members';
  startDate: string;
  endDate: string;
  ticketsAllocated: number;
  ticketsClaimed: number;
  status: 'Upcoming' | 'Active' | 'Ended';
  [key: string]: unknown;
}

export interface DemoFanClubTier {
  name: string;
  members: number;
  benefits: string[];
  accessWindow: string;
  color: string;
  [key: string]: unknown;
}

export const DEMO_EXCLUSIVE_WINDOWS: DemoExclusiveWindow[] = [
  { id: 'EW-001', eventName: 'Summer Music Festival 2025', windowName: 'Platinum Presale', tier: 'Platinum', startDate: '2024-12-01 10:00', endDate: '2024-12-02 10:00', ticketsAllocated: 200, ticketsClaimed: 0, status: 'Upcoming' },
  { id: 'EW-002', eventName: 'Summer Music Festival 2025', windowName: 'Gold Presale', tier: 'Gold', startDate: '2024-12-02 10:00', endDate: '2024-12-03 10:00', ticketsAllocated: 500, ticketsClaimed: 0, status: 'Upcoming' },
  { id: 'EW-003', eventName: 'Summer Music Festival 2025', windowName: 'Member Presale', tier: 'All Members', startDate: '2024-12-03 10:00', endDate: '2024-12-05 10:00', ticketsAllocated: 1000, ticketsClaimed: 0, status: 'Upcoming' },
  { id: 'EW-004', eventName: 'New Year Gala', windowName: 'VIP Access', tier: 'Platinum', startDate: '2024-11-15 10:00', endDate: '2024-11-16 10:00', ticketsAllocated: 100, ticketsClaimed: 87, status: 'Ended' },
];

export const DEMO_FAN_CLUB_TIERS: DemoFanClubTier[] = [
  { name: 'Platinum', members: 245, benefits: ['48-hour early access', 'Meet & greet priority', 'Exclusive merch', 'VIP lounge access'], accessWindow: '48 hours', color: 'bg-purple-100 border-purple-500' },
  { name: 'Gold', members: 1250, benefits: ['24-hour early access', 'Priority entry', 'Member discounts', 'Exclusive content'], accessWindow: '24 hours', color: 'bg-warning-100 border-warning-500' },
  { name: 'Silver', members: 4520, benefits: ['12-hour early access', 'Member discounts', 'Newsletter'], accessWindow: '12 hours', color: 'bg-ink-100 border-ink-400' },
];

// =============================================================================
// FAN CLUB - MAIN (for fan-club/page.tsx)
// =============================================================================

export interface DemoFanClub {
  id: string;
  name: string;
  artistId?: string;
  artistName?: string;
  memberCount: number;
  tier: 'Free' | 'Premium' | 'VIP';
  monthlyPrice?: number;
  benefits: string[];
  exclusiveContent: number;
  upcomingPerks: number;
  [key: string]: unknown;
}

export interface DemoExclusivePerk {
  id: string;
  title: string;
  type: 'Presale' | 'Content' | 'Merch' | 'Meet & Greet' | 'Discount';
  description: string;
  availableDate: string;
  claimedCount: number;
  totalAvailable?: number;
  tier: 'Free' | 'Premium' | 'VIP';
  [key: string]: unknown;
}

export const DEMO_FAN_CLUBS: DemoFanClub[] = [
  { id: 'FC-001', name: 'Midnight Collective Fans', artistName: 'The Midnight Collective', memberCount: 12500, tier: 'Premium', monthlyPrice: 9.99, benefits: ['48hr Presale', 'Exclusive Content', 'Member Discord', '10% Merch Discount'], exclusiveContent: 45, upcomingPerks: 3 },
  { id: 'FC-002', name: 'Aurora Keys Inner Circle', artistName: 'Aurora Keys', memberCount: 8200, tier: 'VIP', monthlyPrice: 19.99, benefits: ['72hr Presale', 'Meet & Greet Lottery', 'Signed Merch', 'Live Q&As', '20% Discount'], exclusiveContent: 78, upcomingPerks: 5 },
  { id: 'FC-003', name: 'Summer Fest Superfans', memberCount: 25000, tier: 'Free', benefits: ['Newsletter', 'Early Announcements', 'Community Access'], exclusiveContent: 12, upcomingPerks: 2 },
];

export const DEMO_EXCLUSIVE_PERKS: DemoExclusivePerk[] = [
  { id: 'PERK-001', title: 'Summer Fest 2024 Presale', type: 'Presale', description: 'Get tickets 48 hours before general public', availableDate: '2024-11-20', claimedCount: 3450, totalAvailable: 5000, tier: 'Premium' },
  { id: 'PERK-002', title: 'Behind the Scenes Documentary', type: 'Content', description: 'Exclusive 30-minute documentary from the last tour', availableDate: '2024-11-15', claimedCount: 8900, tier: 'Premium' },
  { id: 'PERK-003', title: 'Limited Edition Poster', type: 'Merch', description: 'Signed limited edition tour poster', availableDate: '2024-11-25', claimedCount: 150, totalAvailable: 500, tier: 'VIP' },
  { id: 'PERK-004', title: 'Virtual Meet & Greet', type: 'Meet & Greet', description: '15-minute video call with the artist', availableDate: '2024-12-01', claimedCount: 20, totalAvailable: 50, tier: 'VIP' },
  { id: 'PERK-005', title: 'Holiday Merch Discount', type: 'Discount', description: '30% off all merchandise', availableDate: '2024-12-15', claimedCount: 0, tier: 'Free' },
];

// =============================================================================
// MARKETING - ANALYTICS (for marketing/analytics/page.tsx)
// =============================================================================

export interface DemoCampaignMetric {
  id: string;
  name: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
  [key: string]: unknown;
}

export interface DemoAttributionSource {
  source: string;
  conversions: number;
  revenue: number;
  percentage: number;
  [key: string]: unknown;
}

export const DEMO_CAMPAIGN_METRICS: DemoCampaignMetric[] = [
  { id: 'CMP-001', name: 'Summer Fest Launch', channel: 'Facebook', impressions: 245000, clicks: 8420, conversions: 312, spend: 4500, revenue: 46800, roas: 10.4, ctr: 3.44, cpc: 0.53 },
  { id: 'CMP-002', name: 'Early Bird Promo', channel: 'Google Ads', impressions: 189000, clicks: 6230, conversions: 245, spend: 3800, revenue: 36750, roas: 9.67, ctr: 3.30, cpc: 0.61 },
  { id: 'CMP-003', name: 'Email Blast', channel: 'Email', impressions: 45000, clicks: 4520, conversions: 189, spend: 250, revenue: 28350, roas: 113.4, ctr: 10.04, cpc: 0.06 },
  { id: 'CMP-004', name: 'TikTok Awareness', channel: 'TikTok', impressions: 520000, clicks: 12400, conversions: 156, spend: 2800, revenue: 23400, roas: 8.36, ctr: 2.38, cpc: 0.23 },
  { id: 'CMP-005', name: 'Retargeting', channel: 'Facebook', impressions: 78000, clicks: 3420, conversions: 198, spend: 1200, revenue: 29700, roas: 24.75, ctr: 4.38, cpc: 0.35 },
];

export const DEMO_ATTRIBUTION_SOURCES: DemoAttributionSource[] = [
  { source: 'Paid Social', conversions: 510, revenue: 76500, percentage: 35 },
  { source: 'Paid Search', conversions: 245, revenue: 36750, percentage: 20 },
  { source: 'Email', conversions: 189, revenue: 28350, percentage: 15 },
  { source: 'Organic Search', conversions: 156, revenue: 23400, percentage: 13 },
  { source: 'Direct', conversions: 134, revenue: 20100, percentage: 11 },
  { source: 'Referral', conversions: 78, revenue: 11700, percentage: 6 },
];

// =============================================================================
// ADMIN - CONTENT CALENDAR (for admin/content-calendar/page.tsx)
// =============================================================================

export interface DemoScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'Scheduled' | 'Published' | 'Draft';
  eventName?: string;
  mediaType: string;
  author: string;
  [key: string]: unknown;
}

export const DEMO_SCHEDULED_POSTS: DemoScheduledPost[] = [
  { id: 'POST-001', title: 'Lineup Reveal', content: 'Check out our lineup!', platform: 'All', scheduledDate: '2024-11-26', scheduledTime: '10:00', status: 'Scheduled', eventName: 'Summer Fest', mediaType: 'Carousel', author: 'Marketing' },
  { id: 'POST-002', title: 'Early Bird Reminder', content: 'Last chance for early bird!', platform: 'Instagram', scheduledDate: '2024-11-26', scheduledTime: '14:00', status: 'Scheduled', eventName: 'Summer Fest', mediaType: 'Story', author: 'Sarah M.' },
  { id: 'POST-003', title: 'Behind the Scenes', content: 'Production setup peek', platform: 'TikTok', scheduledDate: '2024-11-27', scheduledTime: '12:00', status: 'Draft', mediaType: 'Video', author: 'Content Team' },
  { id: 'POST-004', title: 'Artist Spotlight', content: 'Meet our headliner!', platform: 'Facebook', scheduledDate: '2024-11-25', scheduledTime: '18:00', status: 'Published', eventName: 'Summer Fest', mediaType: 'Image', author: 'Marketing' },
];

// =============================================================================
// ADMIN - CONTESTS (for admin/contests/page.tsx)
// =============================================================================

export interface DemoContest {
  id: string;
  name: string;
  type: 'Giveaway' | 'Photo Contest' | 'Video Contest' | 'Hashtag Challenge' | 'Sweepstakes';
  eventId?: string;
  eventName?: string;
  prize: string;
  prizeValue: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Ended' | 'Selecting Winner';
  entries: number;
  platforms: string[];
  rules?: string;
  winnerId?: string;
  winnerName?: string;
  [key: string]: unknown;
}

export const DEMO_CONTESTS: DemoContest[] = [
  { id: 'CNT-001', name: 'Summer Fest VIP Giveaway', type: 'Giveaway', eventId: 'EVT-001', eventName: 'Summer Fest 2024', prize: '2 VIP Tickets + Meet & Greet', prizeValue: 500, startDate: '2024-11-01', endDate: '2024-11-20', status: 'Ended', entries: 2450, platforms: ['Instagram', 'Twitter'], winnerId: 'USR-123', winnerName: 'Sarah M.' },
  { id: 'CNT-002', name: 'Best Concert Photo', type: 'Photo Contest', eventId: 'EVT-001', eventName: 'Summer Fest 2024', prize: 'Free tickets to next 3 events', prizeValue: 300, startDate: '2024-11-15', endDate: '2024-12-01', status: 'Active', entries: 156, platforms: ['Instagram'] },
  { id: 'CNT-003', name: '#SummerFestVibes Challenge', type: 'Hashtag Challenge', eventId: 'EVT-001', eventName: 'Summer Fest 2024', prize: 'Exclusive Merch Bundle', prizeValue: 150, startDate: '2024-11-10', endDate: '2024-11-25', status: 'Active', entries: 892, platforms: ['TikTok', 'Instagram'] },
  { id: 'CNT-004', name: 'Holiday Sweepstakes', type: 'Sweepstakes', prize: 'Year of Free Concerts', prizeValue: 2000, startDate: '2024-12-01', endDate: '2024-12-25', status: 'Draft', entries: 0, platforms: ['Instagram', 'Twitter', 'Facebook'] },
];
