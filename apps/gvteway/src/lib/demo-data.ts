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
