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

// =============================================================================
// ADMIN - SMS MARKETING (for admin/marketing/sms/page.tsx)
// =============================================================================

export interface DemoSMSCampaign {
  id: string;
  name: string;
  message: string;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed' | 'Paused';
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  clickCount: number;
  scheduledDate?: string;
  completedDate?: string;
  eventId?: string;
  eventName?: string;
  [key: string]: unknown;
}

export interface DemoAudienceSegment {
  id: string;
  name: string;
  count: number;
  [key: string]: unknown;
}

export const DEMO_SMS_CAMPAIGNS: DemoSMSCampaign[] = [
  { id: 'SMS-001', name: 'Early Bird Reminder', message: 'Last chance! Early bird tickets for Summer Fest end tonight. Get 20% off: gvteway.com/sf24', status: 'Completed', audienceSize: 15420, sentCount: 15420, deliveredCount: 14892, clickCount: 2134, completedDate: '2024-11-20', eventId: 'EVT-001', eventName: 'Summer Fest 2024' },
  { id: 'SMS-002', name: 'VIP Upgrade Offer', message: 'Exclusive offer! Upgrade to VIP for just $50 more. Limited availability: gvteway.com/vip', status: 'Sending', audienceSize: 8500, sentCount: 4250, deliveredCount: 4102, clickCount: 523, eventId: 'EVT-001', eventName: 'Summer Fest 2024' },
  { id: 'SMS-003', name: 'Event Reminder - 24hr', message: 'See you tomorrow! Summer Fest gates open at 2PM. Don\'t forget your ticket: gvteway.com/mytickets', status: 'Scheduled', audienceSize: 12000, sentCount: 0, deliveredCount: 0, clickCount: 0, scheduledDate: '2024-11-25T10:00:00Z', eventId: 'EVT-001', eventName: 'Summer Fest 2024' },
  { id: 'SMS-004', name: 'Flash Sale Alert', message: 'FLASH SALE! 30% off all remaining tickets for the next 2 hours only!', status: 'Draft', audienceSize: 25000, sentCount: 0, deliveredCount: 0, clickCount: 0 },
];

export const DEMO_AUDIENCE_SEGMENTS: DemoAudienceSegment[] = [
  { id: 'SEG-001', name: 'All Subscribers', count: 45000 },
  { id: 'SEG-002', name: 'Past Attendees', count: 28000 },
  { id: 'SEG-003', name: 'VIP Members', count: 3500 },
  { id: 'SEG-004', name: 'Ticket Holders', count: 12000 },
  { id: 'SEG-005', name: 'Cart Abandoners', count: 2800 },
];

// =============================================================================
// ADMIN - MODERATION (for admin/moderation/page.tsx)
// =============================================================================

export interface DemoFlaggedContent {
  id: string;
  type: 'Comment' | 'Review' | 'Post' | 'Photo';
  content: string;
  author: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Removed' | 'Escalated';
  [key: string]: unknown;
}

export const DEMO_FLAGGED_CONTENT: DemoFlaggedContent[] = [
  { id: 'FLAG-001', type: 'Comment', content: 'This event was terrible! Total waste of money...', author: 'user123', reportedBy: 'moderator', reason: 'Spam/Inappropriate', timestamp: '2024-11-25 10:30', status: 'Pending' },
  { id: 'FLAG-002', type: 'Review', content: 'Best concert ever! 10/10 would recommend to everyone!', author: 'musicfan', reportedBy: 'auto-filter', reason: 'Suspicious activity', timestamp: '2024-11-25 09:15', status: 'Pending' },
  { id: 'FLAG-003', type: 'Post', content: 'Selling tickets at half price! DM me now!', author: 'ticketseller', reportedBy: 'user456', reason: 'Unauthorized sales', timestamp: '2024-11-24 18:45', status: 'Removed' },
  { id: 'FLAG-004', type: 'Photo', content: '[Image flagged for review]', author: 'partygoer', reportedBy: 'auto-filter', reason: 'Potentially inappropriate', timestamp: '2024-11-24 16:20', status: 'Approved' },
];

// =============================================================================
// ADMIN - POS (for admin/pos/page.tsx)
// =============================================================================

export interface DemoPOSTerminal {
  id: string;
  name: string;
  location: string;
  type: 'Box Office' | 'Concession' | 'Merch' | 'Mobile';
  status: 'Online' | 'Offline' | 'Busy';
  lastTransaction?: string;
  todaySales: number;
  transactionCount: number;
  [key: string]: unknown;
}

export interface DemoPOSMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  [key: string]: unknown;
}

export const DEMO_POS_TERMINALS: DemoPOSTerminal[] = [
  { id: 'POS-001', name: 'Box Office 1', location: 'Main Entrance', type: 'Box Office', status: 'Online', lastTransaction: '2 min ago', todaySales: 12450, transactionCount: 89 },
  { id: 'POS-002', name: 'Box Office 2', location: 'Main Entrance', type: 'Box Office', status: 'Busy', lastTransaction: 'Just now', todaySales: 15230, transactionCount: 102 },
  { id: 'POS-003', name: 'Concession A', location: 'Section A', type: 'Concession', status: 'Online', lastTransaction: '5 min ago', todaySales: 3420, transactionCount: 156 },
  { id: 'POS-004', name: 'Merch Booth', location: 'Main Concourse', type: 'Merch', status: 'Online', lastTransaction: '1 min ago', todaySales: 8750, transactionCount: 67 },
  { id: 'POS-005', name: 'Mobile 1', location: 'Roaming', type: 'Mobile', status: 'Offline', todaySales: 890, transactionCount: 12 },
];

export const DEMO_POS_MENU_ITEMS: DemoPOSMenuItem[] = [
  { id: 'M-001', name: 'GA Ticket', price: 75, category: 'Tickets' },
  { id: 'M-002', name: 'VIP Ticket', price: 150, category: 'Tickets' },
  { id: 'M-003', name: 'Beer', price: 12, category: 'Drinks' },
  { id: 'M-004', name: 'Soda', price: 5, category: 'Drinks' },
  { id: 'M-005', name: 'Hot Dog', price: 8, category: 'Food' },
  { id: 'M-006', name: 'Pizza Slice', price: 10, category: 'Food' },
  { id: 'M-007', name: 'Event T-Shirt', price: 35, category: 'Merch' },
  { id: 'M-008', name: 'Poster', price: 25, category: 'Merch' },
];

// =============================================================================
// ADMIN - EARLY BIRD PRICING (for admin/pricing/early-bird/page.tsx)
// =============================================================================

export interface DemoEarlyBirdCampaign {
  id: string;
  name: string;
  eventId: string;
  eventName: string;
  discountType: 'Percentage' | 'Fixed Amount';
  discountValue: number;
  startDate: string;
  endDate: string;
  ticketLimit?: number;
  ticketsSold: number;
  status: 'Scheduled' | 'Active' | 'Ended' | 'Paused';
  revenue: number;
  [key: string]: unknown;
}

export const DEMO_EARLY_BIRD_CAMPAIGNS: DemoEarlyBirdCampaign[] = [
  { id: 'EB-001', name: 'Super Early Bird', eventId: 'EVT-001', eventName: 'Summer Fest 2024', discountType: 'Percentage', discountValue: 30, startDate: '2024-10-01', endDate: '2024-10-31', ticketLimit: 500, ticketsSold: 500, status: 'Ended', revenue: 26250 },
  { id: 'EB-002', name: 'Early Bird', eventId: 'EVT-001', eventName: 'Summer Fest 2024', discountType: 'Percentage', discountValue: 20, startDate: '2024-11-01', endDate: '2024-11-30', ticketLimit: 1000, ticketsSold: 756, status: 'Active', revenue: 45360 },
  { id: 'EB-003', name: 'Holiday Special', eventId: 'EVT-002', eventName: 'Winter Gala', discountType: 'Fixed Amount', discountValue: 25, startDate: '2024-12-01', endDate: '2024-12-15', ticketsSold: 0, status: 'Scheduled', revenue: 0 },
  { id: 'EB-004', name: 'Flash Sale', eventId: 'EVT-001', eventName: 'Summer Fest 2024', discountType: 'Percentage', discountValue: 15, startDate: '2024-11-20', endDate: '2024-11-22', ticketLimit: 200, ticketsSold: 200, status: 'Ended', revenue: 12750 },
];

// =============================================================================
// ADMIN - SALES REPORTING (for admin/sales-reporting/page.tsx)
// =============================================================================

export interface DemoSalesData {
  id: string;
  location: string;
  location_type: 'venue' | 'booth' | 'online' | 'box_office';
  date: string;
  period: string;
  transactions: number;
  gross_sales: number;
  refunds: number;
  net_sales: number;
  avg_transaction: number;
  top_items: { name: string; quantity: number; revenue: number }[];
  [key: string]: unknown;
}

export const DEMO_SALES_DATA: DemoSalesData[] = [
  { id: 'SD-001', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '14:00-15:00', transactions: 89, gross_sales: 2450.50, refunds: 45.00, net_sales: 2405.50, avg_transaction: 27.03, top_items: [{ name: 'Beer', quantity: 156, revenue: 1248.00 }, { name: 'Cocktails', quantity: 67, revenue: 871.00 }] },
  { id: 'SD-002', location: 'Main Bar', location_type: 'venue', date: '2024-11-24', period: '13:00-14:00', transactions: 72, gross_sales: 1980.25, refunds: 0, net_sales: 1980.25, avg_transaction: 27.50, top_items: [{ name: 'Beer', quantity: 134, revenue: 1072.00 }, { name: 'Wine', quantity: 45, revenue: 585.00 }] },
  { id: 'SD-003', location: 'Merch Booth A', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 45, gross_sales: 3825.00, refunds: 85.00, net_sales: 3740.00, avg_transaction: 83.11, top_items: [{ name: 'Tour T-Shirt', quantity: 32, revenue: 1440.00 }, { name: 'Hoodie', quantity: 18, revenue: 1530.00 }] },
  { id: 'SD-004', location: 'Merch Booth B', location_type: 'booth', date: '2024-11-24', period: '14:00-15:00', transactions: 38, gross_sales: 2890.00, refunds: 0, net_sales: 2890.00, avg_transaction: 76.05, top_items: [{ name: 'Poster', quantity: 45, revenue: 1125.00 }, { name: 'Cap', quantity: 28, revenue: 980.00 }] },
  { id: 'SD-005', location: 'Online Store', location_type: 'online', date: '2024-11-24', period: '14:00-15:00', transactions: 156, gross_sales: 8945.00, refunds: 250.00, net_sales: 8695.00, avg_transaction: 55.74, top_items: [{ name: 'Vinyl Album', quantity: 45, revenue: 1575.00 }, { name: 'Bundle Pack', quantity: 28, revenue: 2520.00 }] },
  { id: 'SD-006', location: 'Box Office', location_type: 'box_office', date: '2024-11-24', period: '14:00-15:00', transactions: 234, gross_sales: 18720.00, refunds: 150.00, net_sales: 18570.00, avg_transaction: 79.36, top_items: [{ name: 'GA Ticket', quantity: 189, revenue: 14175.00 }, { name: 'VIP Ticket', quantity: 45, revenue: 4500.00 }] },
];

// =============================================================================
// COMMUNITY - FAN CONTENT (for community/fan-content/page.tsx)
// =============================================================================

export interface DemoFanContent {
  id: string;
  type: 'Photo' | 'Video' | 'Story' | 'Review';
  title: string;
  creator: string;
  eventName: string;
  createdAt: string;
  likes: number;
  comments: number;
  featured: boolean;
  status: 'Published' | 'Pending' | 'Featured';
  tags: string[];
  [key: string]: unknown;
}

export const DEMO_FAN_CONTENT: DemoFanContent[] = [
  { id: 'FC-001', type: 'Photo', title: 'Front Row Magic', creator: 'Sarah M.', eventName: 'Summer Fest 2024', createdAt: '2024-11-24', likes: 342, comments: 28, featured: true, status: 'Featured', tags: ['concert', 'crowd'] },
  { id: 'FC-002', type: 'Video', title: 'Epic Encore', creator: 'Mike T.', eventName: 'Summer Fest 2024', createdAt: '2024-11-24', likes: 892, comments: 67, featured: true, status: 'Featured', tags: ['encore', 'fireworks'] },
  { id: 'FC-003', type: 'Story', title: 'My First Festival', creator: 'Emily C.', eventName: 'Summer Fest 2024', createdAt: '2024-11-25', likes: 156, comments: 42, featured: false, status: 'Published', tags: ['firsttime', 'memories'] },
  { id: 'FC-004', type: 'Photo', title: 'Sunset Stage', creator: 'Alex R.', eventName: 'Fall Concert', createdAt: '2024-11-20', likes: 234, comments: 19, featured: false, status: 'Published', tags: ['sunset', 'stage'] },
  { id: 'FC-005', type: 'Review', title: 'Best Night Ever', creator: 'Jordan K.', eventName: 'Summer Fest 2024', createdAt: '2024-11-25', likes: 89, comments: 12, featured: false, status: 'Pending', tags: ['review', 'amazing'] },
];

// =============================================================================
// MARKETING - MEDIA KIT (for marketing/media-kit/page.tsx)
// =============================================================================

export interface DemoMediaAsset {
  id: string;
  name: string;
  type: 'Logo' | 'Photo' | 'Video' | 'Press Release' | 'Fact Sheet' | 'Bio';
  format: string;
  size: string;
  event?: string;
  lastUpdated: string;
  [key: string]: unknown;
}

export interface DemoPressRelease {
  id: string;
  title: string;
  event: string;
  date: string;
  status: 'Draft' | 'Published' | 'Distributed';
  downloads: number;
  [key: string]: unknown;
}

export const DEMO_MEDIA_ASSETS: DemoMediaAsset[] = [
  { id: 'MA-001', name: 'Event Logo - Full Color', type: 'Logo', format: 'SVG, PNG, EPS', size: '2.4 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-20' },
  { id: 'MA-002', name: 'Event Logo - White', type: 'Logo', format: 'SVG, PNG, EPS', size: '2.1 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-20' },
  { id: 'MA-003', name: 'Hero Image - Main Stage', type: 'Photo', format: 'JPG', size: '8.5 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-18' },
  { id: 'MA-004', name: 'Promo Video - 30s', type: 'Video', format: 'MP4', size: '45 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-15' },
  { id: 'MA-005', name: 'Event Fact Sheet', type: 'Fact Sheet', format: 'PDF', size: '1.2 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-22' },
  { id: 'MA-006', name: 'Artist Bios', type: 'Bio', format: 'PDF, DOCX', size: '3.8 MB', event: 'Summer Music Festival 2025', lastUpdated: '2024-11-19' },
];

export const DEMO_PRESS_RELEASES: DemoPressRelease[] = [
  { id: 'PR-001', title: 'Summer Music Festival 2025 Lineup Announced', event: 'Summer Music Festival 2025', date: '2024-11-20', status: 'Published', downloads: 245 },
  { id: 'PR-002', title: 'Early Bird Tickets Now Available', event: 'Summer Music Festival 2025', date: '2024-11-15', status: 'Distributed', downloads: 189 },
  { id: 'PR-003', title: 'New Year Gala VIP Experience Details', event: 'New Year Gala', date: '2024-11-25', status: 'Draft', downloads: 0 },
];

// =============================================================================
// MARKETING - PIXELS (for marketing/pixels/page.tsx)
// =============================================================================

export interface DemoTrackingPixel {
  id: string;
  name: string;
  platform: 'Facebook' | 'Google Ads' | 'TikTok' | 'LinkedIn' | 'Twitter' | 'Snapchat';
  pixelId: string;
  status: 'Active' | 'Inactive' | 'Error';
  eventsTracked: number;
  lastFired?: string;
  events: string[];
  [key: string]: unknown;
}

export interface DemoConversionEvent {
  id: string;
  name: string;
  type: 'PageView' | 'Purchase' | 'AddToCart' | 'InitiateCheckout' | 'Lead' | 'Custom';
  count: number;
  value: number;
  lastTriggered: string;
  [key: string]: unknown;
}

export const DEMO_TRACKING_PIXELS: DemoTrackingPixel[] = [
  { id: 'PX-001', name: 'Facebook Pixel', platform: 'Facebook', pixelId: '123456789012345', status: 'Active', eventsTracked: 15420, lastFired: '2 min ago', events: ['PageView', 'Purchase', 'AddToCart', 'InitiateCheckout'] },
  { id: 'PX-002', name: 'Google Ads', platform: 'Google Ads', pixelId: 'AW-987654321', status: 'Active', eventsTracked: 12350, lastFired: '5 min ago', events: ['PageView', 'Purchase', 'Lead'] },
  { id: 'PX-003', name: 'TikTok Pixel', platform: 'TikTok', pixelId: 'CTIKTOK123456', status: 'Active', eventsTracked: 8920, lastFired: '10 min ago', events: ['PageView', 'Purchase'] },
  { id: 'PX-004', name: 'LinkedIn Insight', platform: 'LinkedIn', pixelId: '12345678', status: 'Inactive', eventsTracked: 0, events: ['PageView'] },
];

export const DEMO_CONVERSION_EVENTS: DemoConversionEvent[] = [
  { id: 'EVT-001', name: 'Page View', type: 'PageView', count: 45230, value: 0, lastTriggered: 'Just now' },
  { id: 'EVT-002', name: 'Purchase', type: 'Purchase', count: 1245, value: 186750, lastTriggered: '3 min ago' },
  { id: 'EVT-003', name: 'Add to Cart', type: 'AddToCart', count: 3420, value: 0, lastTriggered: '1 min ago' },
  { id: 'EVT-004', name: 'Initiate Checkout', type: 'InitiateCheckout', count: 2180, value: 0, lastTriggered: '5 min ago' },
  { id: 'EVT-005', name: 'Lead Capture', type: 'Lead', count: 890, value: 0, lastTriggered: '15 min ago' },
];

// =============================================================================
// MERCH - BUNDLES (for merch/bundles/page.tsx)
// =============================================================================

export interface DemoBundleProduct {
  id: string;
  name: string;
  type: 'ticket' | 'merch' | 'parking' | 'upgrade' | 'experience';
  price: number;
  image?: string;
  [key: string]: unknown;
}

export interface DemoBundle {
  id: string;
  name: string;
  description: string;
  products: DemoBundleProduct[];
  original_price: number;
  bundle_price: number;
  savings_percent: number;
  available_quantity: number;
  sold_count: number;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  event_id?: string;
  event_name?: string;
  [key: string]: unknown;
}

export interface DemoCrossSellRecommendation {
  id: string;
  trigger_product_id: string;
  trigger_product_name: string;
  recommended_product_id: string;
  recommended_product_name: string;
  recommended_product_price: number;
  discount_percent?: number;
  conversion_rate: number;
  is_active: boolean;
  [key: string]: unknown;
}

export const DEMO_BUNDLES: DemoBundle[] = [
  { id: 'BND-001', name: 'VIP Experience Package', description: 'VIP ticket + exclusive merch + premium parking', products: [{ id: 'P1', name: 'VIP Ticket', type: 'ticket', price: 250 }, { id: 'P2', name: 'Tour T-Shirt', type: 'merch', price: 45 }, { id: 'P3', name: 'Premium Parking', type: 'parking', price: 35 }], original_price: 330, bundle_price: 280, savings_percent: 15, available_quantity: 100, sold_count: 67, is_active: true, event_name: 'Summer Fest 2024' },
  { id: 'BND-002', name: 'Fan Starter Pack', description: 'GA ticket + poster + drink voucher', products: [{ id: 'P4', name: 'GA Ticket', type: 'ticket', price: 75 }, { id: 'P5', name: 'Event Poster', type: 'merch', price: 25 }, { id: 'P6', name: 'Drink Voucher', type: 'experience', price: 15 }], original_price: 115, bundle_price: 95, savings_percent: 17, available_quantity: 500, sold_count: 312, is_active: true, event_name: 'Summer Fest 2024' },
  { id: 'BND-003', name: 'Merch Bundle', description: 'T-shirt + hoodie + cap at special price', products: [{ id: 'P7', name: 'Tour T-Shirt', type: 'merch', price: 45 }, { id: 'P8', name: 'Tour Hoodie', type: 'merch', price: 85 }, { id: 'P9', name: 'Snapback Cap', type: 'merch', price: 35 }], original_price: 165, bundle_price: 130, savings_percent: 21, available_quantity: 200, sold_count: 89, is_active: true },
  { id: 'BND-004', name: 'Ultimate Fan Package', description: 'Meet & greet + VIP ticket + signed merch', products: [{ id: 'P10', name: 'Meet & Greet', type: 'experience', price: 500 }, { id: 'P11', name: 'VIP Ticket', type: 'ticket', price: 250 }, { id: 'P12', name: 'Signed Poster', type: 'merch', price: 100 }], original_price: 850, bundle_price: 699, savings_percent: 18, available_quantity: 25, sold_count: 18, is_active: true, event_name: 'Summer Fest 2024' },
];

export const DEMO_CROSS_SELLS: DemoCrossSellRecommendation[] = [
  { id: 'CS-001', trigger_product_id: 'TKT-001', trigger_product_name: 'GA Ticket', recommended_product_id: 'PRK-001', recommended_product_name: 'Event Parking', recommended_product_price: 25, discount_percent: 10, conversion_rate: 34.5, is_active: true },
  { id: 'CS-002', trigger_product_id: 'TKT-001', trigger_product_name: 'GA Ticket', recommended_product_id: 'MRC-001', recommended_product_name: 'Tour T-Shirt', recommended_product_price: 45, conversion_rate: 22.3, is_active: true },
  { id: 'CS-003', trigger_product_id: 'TKT-002', trigger_product_name: 'VIP Ticket', recommended_product_id: 'EXP-001', recommended_product_name: 'Backstage Tour', recommended_product_price: 150, discount_percent: 15, conversion_rate: 18.7, is_active: true },
  { id: 'CS-004', trigger_product_id: 'MRC-001', trigger_product_name: 'Tour T-Shirt', recommended_product_id: 'MRC-002', recommended_product_name: 'Tour Hoodie', recommended_product_price: 85, discount_percent: 5, conversion_rate: 28.1, is_active: true },
];

// =============================================================================
// SOCIAL - CRISIS MANAGEMENT (for social/crisis-management/page.tsx)
// =============================================================================

export interface DemoCrisisIncident {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Monitoring' | 'Resolved';
  category: string;
  startTime: string;
  platform: string;
  mentions: number;
  assignedTo: string;
  [key: string]: unknown;
}

export interface DemoResponseTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  usageCount: number;
  [key: string]: unknown;
}

export const DEMO_CRISIS_INCIDENTS: DemoCrisisIncident[] = [
  { id: 'CRI-001', title: 'Ticket Purchase Issues', severity: 'High', status: 'Active', category: 'Technical', startTime: '2024-11-25 14:30', platform: 'Twitter', mentions: 156, assignedTo: 'Support Team' },
  { id: 'CRI-002', title: 'Event Postponement Rumors', severity: 'Medium', status: 'Monitoring', category: 'Misinformation', startTime: '2024-11-25 12:00', platform: 'Instagram', mentions: 89, assignedTo: 'PR Team' },
  { id: 'CRI-003', title: 'Refund Request Surge', severity: 'Critical', status: 'Active', category: 'Customer Service', startTime: '2024-11-25 15:00', platform: 'Multiple', mentions: 234, assignedTo: 'CS Lead' },
];

export const DEMO_RESPONSE_TEMPLATES: DemoResponseTemplate[] = [
  { id: 'RT-001', name: 'Technical Issue Acknowledgment', category: 'Technical', content: 'We are aware of the technical issues affecting [ISSUE]. Our team is working to resolve this as quickly as possible. We apologize for any inconvenience.', usageCount: 45 },
  { id: 'RT-002', name: 'Event Status Update', category: 'General', content: 'Thank you for your patience. [EVENT] is proceeding as scheduled. Please check our official channels for the latest updates.', usageCount: 32 },
  { id: 'RT-003', name: 'Refund Policy Response', category: 'Customer Service', content: 'We understand your concerns. Our refund policy allows [POLICY]. Please contact support@example.com for assistance with your specific situation.', usageCount: 67 },
  { id: 'RT-004', name: 'Safety Incident Response', category: 'Safety', content: 'The safety of our guests is our top priority. We are working with local authorities to address [INCIDENT]. Updates will be provided as information becomes available.', usageCount: 12 },
];

// =============================================================================
// SOCIAL - SENTIMENT (for social/sentiment/page.tsx)
// =============================================================================

export interface DemoSentimentAlert {
  id: string;
  type: 'Negative Spike' | 'Trending Topic' | 'Crisis' | 'Positive Surge';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  source: string;
  keyword: string;
  mentions: number;
  sentiment: number;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  [key: string]: unknown;
}

export interface DemoSentimentMetrics {
  overall: number;
  positive: number;
  neutral: number;
  negative: number;
  volume: number;
  trending: string[];
  [key: string]: unknown;
}

export const DEMO_SENTIMENT_ALERTS: DemoSentimentAlert[] = [
  { id: 'SA-001', type: 'Negative Spike', severity: 'High', source: 'Twitter', keyword: 'ticket issues', mentions: 156, sentiment: -0.72, timestamp: '10 min ago', status: 'Active' },
  { id: 'SA-002', type: 'Trending Topic', severity: 'Low', source: 'Instagram', keyword: 'lineup reveal', mentions: 2450, sentiment: 0.85, timestamp: '25 min ago', status: 'Acknowledged' },
  { id: 'SA-003', type: 'Positive Surge', severity: 'Low', source: 'TikTok', keyword: 'dance challenge', mentions: 8900, sentiment: 0.92, timestamp: '1 hr ago', status: 'Resolved' },
  { id: 'SA-004', type: 'Crisis', severity: 'Critical', source: 'Twitter', keyword: 'refund', mentions: 89, sentiment: -0.88, timestamp: '5 min ago', status: 'Active' },
];

export const DEMO_SENTIMENT_METRICS: DemoSentimentMetrics = {
  overall: 0.72,
  positive: 68,
  neutral: 22,
  negative: 10,
  volume: 15600,
  trending: ['#SummerFest2024', 'lineup', 'tickets', 'VIP'],
};

// =============================================================================
// TICKETS - ANTI-SCALPING (for tickets/anti-scalping/page.tsx)
// =============================================================================

export interface DemoFlaggedTransaction {
  id: string;
  orderId: string;
  eventName: string;
  buyerEmail: string;
  quantity: number;
  flagReason: string;
  riskScore: number;
  status: 'Flagged' | 'Under Review' | 'Cleared' | 'Blocked';
  timestamp: string;
  [key: string]: unknown;
}

export const DEMO_FLAGGED_TRANSACTIONS: DemoFlaggedTransaction[] = [
  { id: 'FLG-001', orderId: 'ORD-5421', eventName: 'Summer Fest 2024', buyerEmail: 'buyer1@email.com', quantity: 8, flagReason: 'High quantity purchase', riskScore: 85, status: 'Under Review', timestamp: '2024-11-25 14:30' },
  { id: 'FLG-002', orderId: 'ORD-5422', eventName: 'Summer Fest 2024', buyerEmail: 'buyer2@email.com', quantity: 4, flagReason: 'Multiple purchases same IP', riskScore: 72, status: 'Flagged', timestamp: '2024-11-25 14:35' },
  { id: 'FLG-003', orderId: 'ORD-5423', eventName: 'Fall Concert', buyerEmail: 'buyer3@email.com', quantity: 6, flagReason: 'Known reseller pattern', riskScore: 92, status: 'Blocked', timestamp: '2024-11-25 13:20' },
  { id: 'FLG-004', orderId: 'ORD-5424', eventName: 'Summer Fest 2024', buyerEmail: 'buyer4@email.com', quantity: 4, flagReason: 'Velocity check failed', riskScore: 65, status: 'Cleared', timestamp: '2024-11-25 12:45' },
];

// =============================================================================
// EVENTS - FLOOR CONFIG (for events/[id]/floor-config/page.tsx)
// =============================================================================

export interface DemoFloorSection {
  id: string;
  name: string;
  type: 'GA Standing' | 'GA Seated' | 'Pit' | 'VIP' | 'ADA' | 'Reserved';
  capacity: number;
  sold: number;
  price: number;
  status: 'Available' | 'Limited' | 'Sold Out' | 'Closed';
  color: string;
  [key: string]: unknown;
}

export const DEMO_FLOOR_SECTIONS: DemoFloorSection[] = [
  { id: 'SEC-001', name: 'General Admission Floor', type: 'GA Standing', capacity: 5000, sold: 3850, price: 75, status: 'Available', color: '#3B82F6' },
  { id: 'SEC-002', name: 'Front Pit', type: 'Pit', capacity: 500, sold: 500, price: 150, status: 'Sold Out', color: '#EF4444' },
  { id: 'SEC-003', name: 'VIP Lounge', type: 'VIP', capacity: 200, sold: 145, price: 250, status: 'Limited', color: '#F59E0B' },
  { id: 'SEC-004', name: 'ADA Section', type: 'ADA', capacity: 50, sold: 12, price: 75, status: 'Available', color: '#10B981' },
  { id: 'SEC-005', name: 'GA Seated', type: 'GA Seated', capacity: 1000, sold: 780, price: 85, status: 'Available', color: '#8B5CF6' },
];

// =============================================================================
// EVENTS - FRIENDS (for events/[id]/friends/page.tsx)
// =============================================================================

export interface DemoEventFriend {
  id: string;
  name: string;
  avatar?: string;
  status: 'attending' | 'interested' | 'invited';
  location?: { section?: string; row?: string; seat?: string };
  lastSeen?: string;
  shareLocation: boolean;
  [key: string]: unknown;
}

export interface DemoMeetupSpot {
  id: string;
  name: string;
  description: string;
  type: 'food' | 'drinks' | 'merch' | 'restroom' | 'custom';
  [key: string]: unknown;
}

export const DEMO_EVENT_FRIENDS: DemoEventFriend[] = [
  { id: 'F-001', name: 'Alex Thompson', status: 'attending', location: { section: 'A', row: '12', seat: '5' }, lastSeen: '2 min ago', shareLocation: true },
  { id: 'F-002', name: 'Jordan Lee', status: 'attending', location: { section: 'B', row: '8' }, lastSeen: '5 min ago', shareLocation: true },
  { id: 'F-003', name: 'Casey Morgan', status: 'interested', shareLocation: false },
  { id: 'F-004', name: 'Riley Chen', status: 'invited', shareLocation: false },
];

export const DEMO_MEETUP_SPOTS: DemoMeetupSpot[] = [
  { id: 'MS-001', name: 'Main Bar', description: 'Near Section A entrance', type: 'drinks' },
  { id: 'MS-002', name: 'Food Court', description: 'Ground level, east side', type: 'food' },
  { id: 'MS-003', name: 'Merch Booth', description: 'Main concourse', type: 'merch' },
];

// =============================================================================
// EVENTS - RFID (for events/[id]/rfid/page.tsx)
// =============================================================================

export interface DemoRFIDWristband {
  id: string;
  wristbandId: string;
  guestName: string;
  email: string;
  ticketType: string;
  balance: number;
  status: 'Active' | 'Inactive' | 'Lost' | 'Replaced';
  registeredAt: string;
  lastUsed?: string;
  transactions: number;
  [key: string]: unknown;
}

export const DEMO_RFID_WRISTBANDS: DemoRFIDWristband[] = [
  { id: 'WB-001', wristbandId: 'RFID-A1B2C3', guestName: 'John Smith', email: 'john@email.com', ticketType: 'VIP', balance: 125.50, status: 'Active', registeredAt: '2024-11-24T14:00:00Z', lastUsed: '2024-11-24T20:15:00Z', transactions: 8 },
  { id: 'WB-002', wristbandId: 'RFID-D4E5F6', guestName: 'Sarah Johnson', email: 'sarah@email.com', ticketType: 'GA', balance: 45.00, status: 'Active', registeredAt: '2024-11-24T15:30:00Z', lastUsed: '2024-11-24T19:45:00Z', transactions: 3 },
  { id: 'WB-003', wristbandId: 'RFID-G7H8I9', guestName: 'Mike Davis', email: 'mike@email.com', ticketType: 'VIP', balance: 0, status: 'Active', registeredAt: '2024-11-24T13:00:00Z', lastUsed: '2024-11-24T21:00:00Z', transactions: 12 },
  { id: 'WB-004', wristbandId: 'RFID-J1K2L3', guestName: 'Emily Chen', email: 'emily@email.com', ticketType: 'GA', balance: 75.25, status: 'Lost', registeredAt: '2024-11-24T16:00:00Z', transactions: 2 },
];

// =============================================================================
// EVENTS - SOCIAL WALL (for events/[id]/social-wall/page.tsx)
// =============================================================================

export interface DemoSocialPost {
  id: string;
  platform: 'Twitter' | 'Instagram' | 'TikTok';
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets?: number;
  hashtags: string[];
  mediaType?: 'image' | 'video';
  approved: boolean;
  [key: string]: unknown;
}

export const DEMO_SOCIAL_POSTS: DemoSocialPost[] = [
  { id: 'TW-001', platform: 'Twitter', author: 'Sarah M', handle: '@sarahm', content: 'This concert is AMAZING! Best night ever!', timestamp: '2 min ago', likes: 45, retweets: 12, hashtags: ['SummerFest2024', 'LiveMusic'], approved: true },
  { id: 'TW-002', platform: 'Twitter', author: 'Mike T', handle: '@miket', content: 'The energy in this crowd is unreal!', timestamp: '5 min ago', likes: 89, retweets: 23, hashtags: ['SummerFest2024'], approved: true },
  { id: 'IG-001', platform: 'Instagram', author: 'Emily C', handle: '@emilyc', content: 'Front row vibes! Living my best life!', timestamp: '8 min ago', likes: 234, hashtags: ['SummerFest2024', 'FrontRow'], mediaType: 'image', approved: true },
  { id: 'TW-003', platform: 'Twitter', author: 'Alex R', handle: '@alexr', content: 'That guitar solo just gave me chills!', timestamp: '10 min ago', likes: 67, retweets: 8, hashtags: ['SummerFest2024', 'GuitarSolo'], approved: true },
  { id: 'TK-001', platform: 'TikTok', author: 'Jordan K', handle: '@jordank', content: 'POV: You are at the best festival of the year', timestamp: '12 min ago', likes: 1245, hashtags: ['SummerFest2024', 'Festival'], mediaType: 'video', approved: true },
  { id: 'TW-004', platform: 'Twitter', author: 'Chris P', handle: '@chrisp', content: 'The production quality is insane! Those lights!', timestamp: '15 min ago', likes: 34, retweets: 5, hashtags: ['SummerFest2024', 'Production'], approved: true },
];

// =============================================================================
// EVENTS - FROM BLUEPRINT (for events/create/from-blueprint/page.tsx)
// =============================================================================

export interface DemoBlueprint {
  id: string;
  name: string;
  description: string;
  experienceType: string;
  createdAt: string;
  foundation: {
    x: string;
    y: string;
    z: string;
  };
  senses: {
    sight: string;
    sound: string;
    taste: string;
    touch: string;
    smell: string;
  };
  journeyPhases: string[];
  [key: string]: unknown;
}

export const DEMO_BLUEPRINTS: DemoBlueprint[] = [
  {
    id: 'bp-001',
    name: 'Summer Music Festival 2025',
    description: 'A three-day outdoor music festival celebrating indie and electronic music',
    experienceType: 'Festival',
    createdAt: '2024-12-01T10:00:00Z',
    foundation: {
      x: 'Multi-stage live performances with interactive art installations',
      y: 'Joy, freedom, community connection, musical discovery',
      z: 'Attendees leave with new musical tastes and lasting friendships',
    },
    senses: {
      sight: 'Vibrant stage lighting, LED installations, art sculptures',
      sound: 'Live music across 4 stages, ambient soundscapes',
      taste: 'Gourmet food trucks, craft beverages, local cuisine',
      touch: 'Interactive installations, comfortable seating areas',
      smell: 'Fresh outdoor air, food aromas, essential oil diffusers',
    },
    journeyPhases: ['Arrival & Check-in', 'Exploration', 'Peak Experience', 'Wind Down', 'Departure'],
  },
  {
    id: 'bp-002',
    name: 'Corporate Innovation Summit',
    description: 'A two-day conference focused on emerging technologies and business transformation',
    experienceType: 'Conference',
    createdAt: '2024-11-28T14:00:00Z',
    foundation: {
      x: 'Keynotes, workshops, networking sessions, demo zones',
      y: 'Inspiration, curiosity, professional growth, connection',
      z: 'Attendees gain actionable insights and valuable connections',
    },
    senses: {
      sight: 'Modern stage design, digital displays, branded environments',
      sound: 'Professional audio, background music, clear presentations',
      taste: 'Premium catering, coffee stations, networking receptions',
      touch: 'Interactive demos, comfortable seating, quality materials',
      smell: 'Fresh coffee, clean spaces, subtle ambient scents',
    },
    journeyPhases: ['Registration', 'Opening Session', 'Breakouts', 'Networking', 'Closing'],
  },
];

// =============================================================================
// MARKETING - AB TESTING (for marketing/ab-testing/page.tsx)
// =============================================================================

export interface DemoABTestVariant {
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  [key: string]: unknown;
}

export interface DemoABTest {
  id: string;
  name: string;
  type: 'Landing Page' | 'Pricing' | 'Email' | 'CTA' | 'Checkout';
  status: 'Running' | 'Completed' | 'Draft' | 'Paused';
  startDate: string;
  endDate?: string;
  variants: DemoABTestVariant[];
  winner?: string;
  confidence?: number;
  [key: string]: unknown;
}

export const DEMO_AB_TESTS: DemoABTest[] = [
  { 
    id: 'AB-001', 
    name: 'Hero Image Test', 
    type: 'Landing Page', 
    status: 'Running', 
    startDate: '2024-11-15',
    variants: [
      { name: 'Control (Festival Photo)', visitors: 4520, conversions: 226, conversionRate: 5.0 },
      { name: 'Variant A (Artist Photo)', visitors: 4480, conversions: 269, conversionRate: 6.0 },
    ],
    confidence: 87
  },
  { 
    id: 'AB-002', 
    name: 'Ticket Price Display', 
    type: 'Pricing', 
    status: 'Completed', 
    startDate: '2024-11-01',
    endDate: '2024-11-14',
    variants: [
      { name: 'Control ($150)', visitors: 8200, conversions: 328, conversionRate: 4.0 },
      { name: 'Variant A ($149)', visitors: 8150, conversions: 407, conversionRate: 5.0 },
    ],
    winner: 'Variant A ($149)',
    confidence: 95
  },
  { 
    id: 'AB-003', 
    name: 'CTA Button Color', 
    type: 'CTA', 
    status: 'Running', 
    startDate: '2024-11-20',
    variants: [
      { name: 'Control (Black)', visitors: 2100, conversions: 84, conversionRate: 4.0 },
      { name: 'Variant A (Orange)', visitors: 2080, conversions: 104, conversionRate: 5.0 },
      { name: 'Variant B (Green)', visitors: 2050, conversions: 82, conversionRate: 4.0 },
    ],
    confidence: 72
  },
  { 
    id: 'AB-004', 
    name: 'Email Subject Line', 
    type: 'Email', 
    status: 'Draft', 
    startDate: '2024-12-01',
    variants: [
      { name: 'Control', visitors: 0, conversions: 0, conversionRate: 0 },
      { name: 'Variant A', visitors: 0, conversions: 0, conversionRate: 0 },
    ]
  },
];

// =============================================================================
// MARKETING - EARLY BIRD (for marketing/early-bird/page.tsx)
// =============================================================================

export interface DemoMarketingEarlyBirdCampaign {
  id: string;
  eventName: string;
  tierName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  startDate: string;
  endDate: string;
  ticketsAllocated: number;
  ticketsSold: number;
  status: 'Scheduled' | 'Active' | 'Ending Soon' | 'Ended';
  daysRemaining?: number;
  [key: string]: unknown;
}

export const DEMO_MARKETING_EARLY_BIRD_CAMPAIGNS: DemoMarketingEarlyBirdCampaign[] = [
  { id: 'EB-001', eventName: 'Summer Music Festival 2025', tierName: 'Super Early Bird', originalPrice: 150, discountedPrice: 99, discountPercent: 34, startDate: '2024-11-01', endDate: '2024-12-15', ticketsAllocated: 500, ticketsSold: 423, status: 'Active', daysRemaining: 20 },
  { id: 'EB-002', eventName: 'Summer Music Festival 2025', tierName: 'Early Bird', originalPrice: 150, discountedPrice: 119, discountPercent: 21, startDate: '2024-12-16', endDate: '2025-01-31', ticketsAllocated: 1000, ticketsSold: 0, status: 'Scheduled' },
  { id: 'EB-003', eventName: 'Tech Conference 2025', tierName: 'Early Access', originalPrice: 299, discountedPrice: 199, discountPercent: 33, startDate: '2024-11-15', endDate: '2024-11-30', ticketsAllocated: 200, ticketsSold: 187, status: 'Ending Soon', daysRemaining: 5 },
  { id: 'EB-004', eventName: 'New Year Gala', tierName: 'Early Bird', originalPrice: 250, discountedPrice: 175, discountPercent: 30, startDate: '2024-10-01', endDate: '2024-11-15', ticketsAllocated: 300, ticketsSold: 300, status: 'Ended' },
];

// =============================================================================
// MARKETING - INFLUENCERS (for marketing/influencers/page.tsx)
// =============================================================================

export interface DemoInfluencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagement: number;
  niche: string;
  status: 'Active' | 'Pending' | 'Completed';
  campaigns: number;
  revenue: number;
  [key: string]: unknown;
}

export const DEMO_INFLUENCERS: DemoInfluencer[] = [
  { id: 'INF-001', name: 'Sarah Music', handle: '@sarahmusic', platform: 'Instagram', followers: 250000, engagement: 4.2, niche: 'Music', status: 'Active', campaigns: 3, revenue: 12500 },
  { id: 'INF-002', name: 'Festival Life', handle: '@festlife', platform: 'TikTok', followers: 890000, engagement: 6.8, niche: 'Festivals', status: 'Active', campaigns: 5, revenue: 28000 },
  { id: 'INF-003', name: 'Concert Vibes', handle: '@concertvibes', platform: 'Instagram', followers: 125000, engagement: 5.1, niche: 'Concerts', status: 'Pending', campaigns: 0, revenue: 0 },
  { id: 'INF-004', name: 'DJ Reviews', handle: '@djreviews', platform: 'YouTube', followers: 450000, engagement: 3.9, niche: 'EDM', status: 'Completed', campaigns: 2, revenue: 8500 },
];

// =============================================================================
// MEMBERSHIP - BENEFITS (for membership/benefits/page.tsx)
// =============================================================================

export interface DemoMemberBenefit {
  id: string;
  name: string;
  description: string;
  type: 'Discount' | 'Access' | 'Content' | 'Experience' | 'Merchandise';
  value?: string;
  enabled: boolean;
  [key: string]: unknown;
}

export interface DemoMembershipTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual';
  memberCount: number;
  benefits: DemoMemberBenefit[];
  color: string;
  [key: string]: unknown;
}

export const DEMO_MEMBERSHIP_TIERS: DemoMembershipTier[] = [
  {
    id: 'TIER-001', name: 'Fan Club', price: 9.99, billingCycle: 'Monthly', memberCount: 2450, color: '#3B82F6',
    benefits: [
      { id: 'B-001', name: 'Presale Access', description: '48-hour early access to tickets', type: 'Access', enabled: true },
      { id: 'B-002', name: 'Member Discount', description: '10% off all ticket purchases', type: 'Discount', value: '10%', enabled: true },
      { id: 'B-003', name: 'Exclusive Content', description: 'Behind-the-scenes videos and photos', type: 'Content', enabled: true },
    ]
  },
  {
    id: 'TIER-002', name: 'VIP Member', price: 29.99, billingCycle: 'Monthly', memberCount: 890, color: '#F59E0B',
    benefits: [
      { id: 'B-004', name: 'Priority Presale', description: '72-hour early access to tickets', type: 'Access', enabled: true },
      { id: 'B-005', name: 'VIP Discount', description: '20% off all ticket purchases', type: 'Discount', value: '20%', enabled: true },
      { id: 'B-006', name: 'Free Shipping', description: 'Free shipping on all merchandise', type: 'Merchandise', enabled: true },
      { id: 'B-007', name: 'Meet & Greet Entry', description: 'Monthly raffle for meet & greet', type: 'Experience', enabled: true },
      { id: 'B-008', name: 'Exclusive Merch', description: 'Access to member-only merchandise', type: 'Merchandise', enabled: true },
    ]
  },
  {
    id: 'TIER-003', name: 'Platinum', price: 199.99, billingCycle: 'Annual', memberCount: 156, color: '#8B5CF6',
    benefits: [
      { id: 'B-009', name: 'First Access', description: 'First access to all tickets before public', type: 'Access', enabled: true },
      { id: 'B-010', name: 'Platinum Discount', description: '30% off all purchases', type: 'Discount', value: '30%', enabled: true },
      { id: 'B-011', name: 'Guaranteed Meet & Greet', description: 'One guaranteed meet & greet per year', type: 'Experience', enabled: true },
      { id: 'B-012', name: 'VIP Lounge Access', description: 'Complimentary VIP lounge at all events', type: 'Access', enabled: true },
      { id: 'B-013', name: 'Annual Gift Box', description: 'Exclusive annual merchandise gift box', type: 'Merchandise', enabled: true },
      { id: 'B-014', name: 'Concierge Service', description: 'Dedicated member concierge', type: 'Experience', enabled: true },
    ]
  },
];

export const DEMO_AVAILABLE_BENEFITS = [
  { type: 'Discount', options: ['5% off', '10% off', '15% off', '20% off', '25% off', '30% off'] },
  { type: 'Access', options: ['24hr Presale', '48hr Presale', '72hr Presale', 'VIP Entrance', 'Backstage Access', 'Soundcheck Access'] },
  { type: 'Content', options: ['Exclusive Videos', 'Behind the Scenes', 'Live Streams', 'Digital Downloads', 'Early Releases'] },
  { type: 'Experience', options: ['Meet & Greet Raffle', 'Guaranteed Meet & Greet', 'VIP Lounge', 'Photo Opportunities', 'Concierge Service'] },
  { type: 'Merchandise', options: ['Free Shipping', 'Member-Only Items', 'Annual Gift Box', 'Birthday Gift', 'Welcome Kit'] },
];

// =============================================================================
// MODERATE (for moderate/page.tsx)
// =============================================================================

export interface DemoModerationItem {
  id: string;
  type: 'review' | 'comment' | 'report';
  content: string;
  author: string;
  eventId: string;
  eventName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  [key: string]: unknown;
}

export const DEMO_MODERATION_ITEMS: DemoModerationItem[] = [
  { id: '1', type: 'review', content: 'Amazing show! Best experience ever!', author: 'john_doe', eventId: 'e1', eventName: 'Summer Fest', status: 'pending', timestamp: '2024-11-23 10:30' },
  { id: '2', type: 'report', content: 'Inappropriate behavior reported', author: 'moderator', eventId: 'e2', eventName: 'Rock Concert', status: 'pending', timestamp: '2024-11-23 11:15' },
  { id: '3', type: 'comment', content: 'Looking forward to this!', author: 'jane_smith', eventId: 'e1', eventName: 'Summer Fest', status: 'approved', timestamp: '2024-11-23 09:45' },
];

// =============================================================================
// SEARCH (for search/page.tsx)
// =============================================================================

export interface DemoSearchResult {
  id: string;
  type: string;
  title: string;
  location?: string;
  date?: string;
  capacity?: string;
  genre?: string;
  followers?: string;
  [key: string]: unknown;
}

export const DEMO_SEARCH_RESULTS: DemoSearchResult[] = [
  { id: '1', type: 'Event', title: 'Ultra Music Festival 2025', location: 'Miami, FL', date: 'Mar 28-30' },
  { id: '2', type: 'Venue', title: 'Bayfront Park', location: 'Miami, FL', capacity: '65,000' },
  { id: '3', type: 'Event', title: 'Rolling Loud Miami', location: 'Miami Gardens, FL', date: 'May 9-11' },
  { id: '4', type: 'Artist', title: 'Armin van Buuren', genre: 'Trance', followers: '2.1M' },
];
