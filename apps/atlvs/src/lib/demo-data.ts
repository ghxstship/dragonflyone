/**
 * ATLVS Demo Data
 * 
 * Centralized demo/mock data for ATLVS application.
 * Used as fallback when API calls fail or user is unauthenticated.
 * 
 * Pattern: All demo data should be prefixed with DEMO_ and exported from this file.
 * Pages should import from here rather than defining inline mock data.
 */

// =============================================================================
// CONTACTS & RELATIONSHIPS
// =============================================================================

export interface DemoContact {
  id: string;
  name: string;
  title: string;
  company: string;
  type: 'client' | 'vendor' | 'partner' | 'prospect' | 'internal';
  email: string;
  phone?: string;
}

export const DEMO_CONTACTS: DemoContact[] = [
  { id: 'CON-001', name: 'Sarah Mitchell', title: 'VP of Events', company: 'Acme Corp', type: 'client', email: 'sarah@acme.com', phone: '+1 555-0101' },
  { id: 'CON-002', name: 'John Davis', title: 'Event Manager', company: 'Acme Corp', type: 'client', email: 'john@acme.com', phone: '+1 555-0102' },
  { id: 'CON-003', name: 'Lisa Chen', title: 'CFO', company: 'Acme Corp', type: 'client', email: 'lisa@acme.com' },
  { id: 'CON-004', name: 'Mike Thompson', title: 'CEO', company: 'Acme Corp', type: 'client', email: 'mike@acme.com' },
  { id: 'CON-005', name: 'Emily Park', title: 'Procurement Director', company: 'Acme Corp', type: 'client', email: 'emily@acme.com' },
];

export interface DemoRelationship {
  id: string;
  from_contact_id: string;
  from_contact: DemoContact;
  to_contact_id: string;
  to_contact: DemoContact;
  relationship_type: 'reports_to' | 'manages' | 'works_with' | 'referred_by' | 'decision_maker' | 'influencer' | 'champion' | 'blocker';
  strength: 'strong' | 'moderate' | 'weak';
  notes?: string;
}

export const DEMO_RELATIONSHIPS: DemoRelationship[] = [
  { id: 'REL-001', from_contact_id: 'CON-002', from_contact: DEMO_CONTACTS[1], to_contact_id: 'CON-001', to_contact: DEMO_CONTACTS[0], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-002', from_contact_id: 'CON-001', from_contact: DEMO_CONTACTS[0], to_contact_id: 'CON-004', to_contact: DEMO_CONTACTS[3], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-003', from_contact_id: 'CON-003', from_contact: DEMO_CONTACTS[2], to_contact_id: 'CON-004', to_contact: DEMO_CONTACTS[3], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-004', from_contact_id: 'CON-001', from_contact: DEMO_CONTACTS[0], to_contact_id: 'CON-003', to_contact: DEMO_CONTACTS[2], relationship_type: 'works_with', strength: 'moderate' },
];

export interface DemoStakeholderMap {
  organization_id: string;
  organization_name: string;
  stakeholders: {
    contact: DemoContact;
    role: string;
    influence: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

export const DEMO_STAKEHOLDER_MAP: DemoStakeholderMap = {
  organization_id: 'ORG-001',
  organization_name: 'Acme Corp',
  stakeholders: [
    { contact: DEMO_CONTACTS[3], role: 'Executive Sponsor', influence: 'high', sentiment: 'positive' },
    { contact: DEMO_CONTACTS[0], role: 'Project Owner', influence: 'high', sentiment: 'positive' },
    { contact: DEMO_CONTACTS[2], role: 'Budget Approver', influence: 'high', sentiment: 'neutral' },
    { contact: DEMO_CONTACTS[1], role: 'Day-to-Day Contact', influence: 'medium', sentiment: 'positive' },
    { contact: DEMO_CONTACTS[4], role: 'Procurement Lead', influence: 'medium', sentiment: 'neutral' },
  ],
};

// =============================================================================
// VENDORS
// =============================================================================

export interface DemoVendorContract {
  id: string;
  vendor_name: string;
  contract_type: 'master' | 'project' | 'retainer' | 'nda';
  status: 'active' | 'pending' | 'expired' | 'terminated';
  start_date: string;
  end_date: string;
  value: number;
  auto_renew: boolean;
}

export const DEMO_VENDOR_CONTRACTS: DemoVendorContract[] = [
  { id: 'VC-001', vendor_name: 'Acme Staging', contract_type: 'master', status: 'active', start_date: '2024-01-01', end_date: '2025-12-31', value: 500000, auto_renew: true },
  { id: 'VC-002', vendor_name: 'Sound Systems Inc', contract_type: 'project', status: 'active', start_date: '2024-06-01', end_date: '2024-12-31', value: 75000, auto_renew: false },
  { id: 'VC-003', vendor_name: 'Lighting Pro', contract_type: 'retainer', status: 'pending', start_date: '2025-01-01', end_date: '2025-12-31', value: 120000, auto_renew: true },
];

export interface DemoRateCard {
  id: string;
  vendor_name: string;
  category: string;
  item: string;
  unit: string;
  rate: number;
  effective_date: string;
  notes?: string;
}

export const DEMO_RATE_CARDS: DemoRateCard[] = [
  { id: 'RC-001', vendor_name: 'Acme Staging', category: 'Staging', item: 'Main Stage (40x60)', unit: 'day', rate: 5000, effective_date: '2024-01-01' },
  { id: 'RC-002', vendor_name: 'Acme Staging', category: 'Staging', item: 'B-Stage (20x20)', unit: 'day', rate: 1500, effective_date: '2024-01-01' },
  { id: 'RC-003', vendor_name: 'Sound Systems Inc', category: 'Audio', item: 'Line Array (per side)', unit: 'day', rate: 2500, effective_date: '2024-01-01' },
];

// =============================================================================
// LEADS & SCORING
// =============================================================================

export interface DemoLead {
  id: string;
  name: string;
  company: string;
  email: string;
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source: string;
  created_at: string;
}

export const DEMO_LEADS: DemoLead[] = [
  { id: 'LEAD-001', name: 'Jennifer Adams', company: 'Tech Corp', email: 'jennifer@techcorp.com', score: 85, status: 'qualified', source: 'Website', created_at: '2024-11-15' },
  { id: 'LEAD-002', name: 'Robert Chen', company: 'Global Events', email: 'robert@globalevents.com', score: 72, status: 'contacted', source: 'Referral', created_at: '2024-11-20' },
  { id: 'LEAD-003', name: 'Maria Garcia', company: 'Festival Inc', email: 'maria@festivalinc.com', score: 91, status: 'proposal', source: 'Trade Show', created_at: '2024-11-10' },
];

export interface DemoScoringRule {
  id: string;
  name: string;
  category: string;
  condition: string;
  points: number;
  active: boolean;
}

export const DEMO_SCORING_RULES: DemoScoringRule[] = [
  { id: 'SR-001', name: 'Website Visit', category: 'Engagement', condition: 'Visited pricing page', points: 10, active: true },
  { id: 'SR-002', name: 'Demo Request', category: 'Intent', condition: 'Requested demo', points: 25, active: true },
  { id: 'SR-003', name: 'Enterprise Company', category: 'Firmographic', condition: 'Company size > 500', points: 15, active: true },
];

// =============================================================================
// OKRs
// =============================================================================

export interface DemoOKR {
  id: string;
  objective: string;
  owner: string;
  quarter: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  key_results: {
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
  }[];
}

export const DEMO_OKRS: DemoOKR[] = [
  {
    id: 'OKR-001',
    objective: 'Increase event production revenue by 25%',
    owner: 'Sarah Mitchell',
    quarter: 'Q4 2024',
    progress: 68,
    status: 'on_track',
    key_results: [
      { id: 'KR-001', description: 'Close 5 new enterprise clients', target: 5, current: 3, unit: 'clients' },
      { id: 'KR-002', description: 'Increase average deal size to $150K', target: 150000, current: 125000, unit: 'USD' },
    ],
  },
  {
    id: 'OKR-002',
    objective: 'Improve client satisfaction score to 4.5+',
    owner: 'John Davis',
    quarter: 'Q4 2024',
    progress: 82,
    status: 'on_track',
    key_results: [
      { id: 'KR-003', description: 'Achieve NPS score of 50+', target: 50, current: 45, unit: 'NPS' },
      { id: 'KR-004', description: 'Reduce support ticket resolution time to 4 hours', target: 4, current: 5, unit: 'hours' },
    ],
  },
];

// =============================================================================
// WORKFORCE
// =============================================================================

export interface DemoBackgroundCheck {
  id: string;
  employee_name: string;
  check_type: 'criminal' | 'employment' | 'education' | 'credit' | 'drug';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_date: string;
  completed_date?: string;
  result?: 'clear' | 'flagged' | 'review_required';
}

export const DEMO_BACKGROUND_CHECKS: DemoBackgroundCheck[] = [
  { id: 'BC-001', employee_name: 'Alex Johnson', check_type: 'criminal', status: 'completed', initiated_date: '2024-11-01', completed_date: '2024-11-05', result: 'clear' },
  { id: 'BC-002', employee_name: 'Sam Williams', check_type: 'employment', status: 'in_progress', initiated_date: '2024-11-15' },
  { id: 'BC-003', employee_name: 'Jordan Lee', check_type: 'education', status: 'pending', initiated_date: '2024-11-20' },
];

export interface DemoReferral {
  id: string;
  referrer_name: string;
  candidate_name: string;
  position: string;
  status: 'submitted' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
  bonus_amount: number;
  submitted_date: string;
}

export const DEMO_REFERRALS: DemoReferral[] = [
  { id: 'REF-001', referrer_name: 'Emily Park', candidate_name: 'Chris Taylor', position: 'Production Manager', status: 'interviewing', bonus_amount: 2500, submitted_date: '2024-11-01' },
  { id: 'REF-002', referrer_name: 'Mike Thompson', candidate_name: 'Pat Brown', position: 'Stage Manager', status: 'hired', bonus_amount: 2000, submitted_date: '2024-10-15' },
];

// =============================================================================
// CRM
// =============================================================================

export interface DemoTask {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  related_to?: string;
}

export const DEMO_TASKS: DemoTask[] = [
  { id: 'TASK-001', title: 'Follow up with Acme Corp', description: 'Send proposal revision', assignee: 'Sarah Mitchell', due_date: '2024-12-15', priority: 'high', status: 'in_progress', related_to: 'DEAL-001' },
  { id: 'TASK-002', title: 'Schedule site visit', assignee: 'John Davis', due_date: '2024-12-18', priority: 'medium', status: 'todo', related_to: 'DEAL-002' },
  { id: 'TASK-003', title: 'Review contract terms', assignee: 'Lisa Chen', due_date: '2024-12-20', priority: 'high', status: 'review' },
];

export interface DemoCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'call' | 'task' | 'event' | 'reminder';
  attendees?: string[];
  location?: string;
}

export const DEMO_CALENDAR_EVENTS: DemoCalendarEvent[] = [
  { id: 'CAL-001', title: 'Client Meeting - Acme Corp', start: '2024-12-15T10:00:00', end: '2024-12-15T11:00:00', type: 'meeting', attendees: ['Sarah Mitchell', 'John Davis'], location: 'Conference Room A' },
  { id: 'CAL-002', title: 'Vendor Call - Sound Systems', start: '2024-12-16T14:00:00', end: '2024-12-16T14:30:00', type: 'call', attendees: ['Emily Park'] },
  { id: 'CAL-003', title: 'Site Visit - Madison Square Garden', start: '2024-12-18T09:00:00', end: '2024-12-18T12:00:00', type: 'event', location: 'MSG' },
];

// =============================================================================
// VENDOR CONTRACTS (for vendors/contracts page)
// =============================================================================

export interface DemoVendorContractFull {
  id: string;
  vendorName: string;
  contractType: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: 'Active' | 'Expiring' | 'Expired' | 'Pending Renewal';
  daysUntilExpiry: number;
  autoRenew: boolean;
  category: string;
}

export const DEMO_VENDOR_CONTRACTS_FULL: DemoVendorContractFull[] = [
  { id: 'VC-001', vendorName: 'Audio House Inc', contractType: 'Master Services', startDate: '2023-01-01', expiryDate: '2025-01-01', value: 250000, status: 'Expiring', daysUntilExpiry: 37, autoRenew: false, category: 'Audio' },
  { id: 'VC-002', vendorName: 'Lighting Solutions', contractType: 'Equipment Rental', startDate: '2024-03-01', expiryDate: '2025-03-01', value: 180000, status: 'Active', daysUntilExpiry: 96, autoRenew: true, category: 'Lighting' },
  { id: 'VC-003', vendorName: 'Stage Builders Co', contractType: 'Preferred Vendor', startDate: '2023-06-01', expiryDate: '2024-11-30', value: 320000, status: 'Expired', daysUntilExpiry: -5, autoRenew: false, category: 'Staging' },
  { id: 'VC-004', vendorName: 'Video Tech Pro', contractType: 'Master Services', startDate: '2024-01-01', expiryDate: '2025-12-31', value: 150000, status: 'Active', daysUntilExpiry: 402, autoRenew: true, category: 'Video' },
  { id: 'VC-005', vendorName: 'Rigging Experts', contractType: 'Equipment Rental', startDate: '2024-06-01', expiryDate: '2024-12-15', value: 95000, status: 'Expiring', daysUntilExpiry: 20, autoRenew: false, category: 'Rigging' },
];

// =============================================================================
// OKRs (for okrs page)
// =============================================================================

export interface DemoKeyResult {
  kr: string;
  progress: number;
}

export interface DemoOKRItem {
  id: string;
  objective: string;
  owner: string;
  progress: number;
  keyResults: DemoKeyResult[];
}

export const DEMO_OKRS_LIST: DemoOKRItem[] = [
  { id: 'OKR-Q4-001', objective: 'Scale Production Capacity 50%', owner: 'Operations', progress: 65, keyResults: [
    { kr: 'Hire 15 new crew members', progress: 80 },
    { kr: 'Acquire $2M in new equipment', progress: 60 },
    { kr: 'Open second warehouse facility', progress: 45 },
  ]},
  { id: 'OKR-Q4-002', objective: 'Increase Revenue to $15M', owner: 'Business Dev', progress: 70, keyResults: [
    { kr: 'Close 8 new festival contracts', progress: 75 },
    { kr: 'Expand into 3 new markets', progress: 66 },
    { kr: 'Achieve 95% client retention', progress: 100 },
  ]},
  { id: 'OKR-Q4-003', objective: 'Enhance Operational Excellence', owner: 'COO', progress: 55, keyResults: [
    { kr: 'Reduce setup time by 25%', progress: 40 },
    { kr: 'Achieve 99% on-time delivery', progress: 85 },
    { kr: 'Zero safety incidents', progress: 100 },
  ]},
];
