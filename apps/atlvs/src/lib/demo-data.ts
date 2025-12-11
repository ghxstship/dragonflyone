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

// =============================================================================
// LEAD SCORING FULL (for leads/scoring page - more detailed version)
// =============================================================================

export interface DemoScoreBreakdown {
  demographic: number;
  behavioral: number;
  engagement: number;
  fit: number;
}

export interface DemoLeadScoringFull {
  id: string;
  company: string;
  contact_name: string;
  contact_email: string;
  contact_title: string;
  source: 'website' | 'referral' | 'event' | 'cold_outreach' | 'inbound';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  score_breakdown: DemoScoreBreakdown;
  estimated_value: number;
  created_at: string;
  last_activity: string;
  qualification_status: 'unqualified' | 'mql' | 'sql' | 'opportunity';
}

export const DEMO_LEADS_SCORING_FULL: DemoLeadScoringFull[] = [
  { id: 'LEAD-001', company: 'TechCorp Inc', contact_name: 'John Smith', contact_email: 'john@techcorp.com', contact_title: 'VP of Events', source: 'website', status: 'qualified', score: 85, score_breakdown: { demographic: 25, behavioral: 20, engagement: 25, fit: 15 }, estimated_value: 150000, created_at: '2024-11-20T10:00:00Z', last_activity: '2024-11-24T14:00:00Z', qualification_status: 'sql' },
  { id: 'LEAD-002', company: 'Global Events Ltd', contact_name: 'Sarah Johnson', contact_email: 'sarah@globalevents.com', contact_title: 'Event Director', source: 'referral', status: 'proposal', score: 92, score_breakdown: { demographic: 30, behavioral: 22, engagement: 25, fit: 15 }, estimated_value: 250000, created_at: '2024-11-15T09:00:00Z', last_activity: '2024-11-24T10:00:00Z', qualification_status: 'opportunity' },
  { id: 'LEAD-003', company: 'StartupXYZ', contact_name: 'Mike Chen', contact_email: 'mike@startupxyz.com', contact_title: 'CEO', source: 'event', status: 'contacted', score: 45, score_breakdown: { demographic: 10, behavioral: 15, engagement: 10, fit: 10 }, estimated_value: 25000, created_at: '2024-11-22T14:00:00Z', last_activity: '2024-11-23T16:00:00Z', qualification_status: 'mql' },
  { id: 'LEAD-004', company: 'Enterprise Solutions', contact_name: 'Lisa Park', contact_email: 'lisa@enterprise.com', contact_title: 'CMO', source: 'inbound', status: 'new', score: 72, score_breakdown: { demographic: 20, behavioral: 18, engagement: 20, fit: 14 }, estimated_value: 100000, created_at: '2024-11-24T08:00:00Z', last_activity: '2024-11-24T08:00:00Z', qualification_status: 'mql' },
  { id: 'LEAD-005', company: 'Local Business Co', contact_name: 'Tom Wilson', contact_email: 'tom@localbiz.com', contact_title: 'Owner', source: 'cold_outreach', status: 'contacted', score: 28, score_breakdown: { demographic: 5, behavioral: 8, engagement: 10, fit: 5 }, estimated_value: 10000, created_at: '2024-11-21T11:00:00Z', last_activity: '2024-11-22T09:00:00Z', qualification_status: 'unqualified' },
];

export interface DemoScoringRuleFull {
  id: string;
  category: 'demographic' | 'behavioral' | 'engagement' | 'fit';
  name: string;
  condition: string;
  points: number;
  is_active: boolean;
}

export const DEMO_SCORING_RULES_FULL: DemoScoringRuleFull[] = [
  { id: 'RULE-001', category: 'demographic', name: 'Company Size > 500', condition: 'employees > 500', points: 15, is_active: true },
  { id: 'RULE-002', category: 'demographic', name: 'Decision Maker Title', condition: 'title contains VP, Director, C-level', points: 10, is_active: true },
  { id: 'RULE-003', category: 'demographic', name: 'Target Industry', condition: 'industry in [Events, Entertainment, Corporate]', points: 10, is_active: true },
  { id: 'RULE-004', category: 'behavioral', name: 'Visited Pricing Page', condition: 'page_view = pricing', points: 10, is_active: true },
  { id: 'RULE-005', category: 'behavioral', name: 'Downloaded Content', condition: 'download_count > 0', points: 8, is_active: true },
  { id: 'RULE-006', category: 'behavioral', name: 'Requested Demo', condition: 'demo_request = true', points: 15, is_active: true },
  { id: 'RULE-007', category: 'engagement', name: 'Email Opens > 3', condition: 'email_opens > 3', points: 10, is_active: true },
  { id: 'RULE-008', category: 'engagement', name: 'Website Visits > 5', condition: 'website_visits > 5', points: 10, is_active: true },
  { id: 'RULE-009', category: 'engagement', name: 'Recent Activity (7 days)', condition: 'last_activity < 7 days', points: 10, is_active: true },
  { id: 'RULE-010', category: 'fit', name: 'Budget Confirmed', condition: 'budget_confirmed = true', points: 15, is_active: true },
  { id: 'RULE-011', category: 'fit', name: 'Timeline < 6 months', condition: 'timeline < 6 months', points: 10, is_active: true },
];

// =============================================================================
// BACKGROUND CHECKS (for workforce/background-checks page)
// =============================================================================

export interface DemoBackgroundCheckFull {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  checkType: string;
  provider: string;
  requestDate: string;
  completedDate?: string;
  expiryDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired' | 'Renewal Due';
  result?: 'Clear' | 'Review Required' | 'Failed';
  notes?: string;
}

export const DEMO_BACKGROUND_CHECKS_FULL: DemoBackgroundCheckFull[] = [
  { id: 'BGC-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', checkType: 'Criminal + Employment', provider: 'Checkr', requestDate: '2024-11-01', completedDate: '2024-11-05', expiryDate: '2025-11-05', status: 'Completed', result: 'Clear' },
  { id: 'BGC-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', checkType: 'Criminal + Credit + Employment', provider: 'Sterling', requestDate: '2024-11-10', status: 'In Progress' },
  { id: 'BGC-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', checkType: 'Criminal', provider: 'Checkr', requestDate: '2024-10-15', completedDate: '2024-10-18', expiryDate: '2024-12-18', status: 'Renewal Due', result: 'Clear' },
  { id: 'BGC-004', employeeId: 'EMP-104', employeeName: 'Emily Davis', department: 'Audio', checkType: 'Criminal + Employment', provider: 'GoodHire', requestDate: '2024-11-15', status: 'Pending' },
  { id: 'BGC-005', employeeId: 'EMP-105', employeeName: 'Chris Brown', department: 'Lighting', checkType: 'Criminal + Drug Screen', provider: 'Checkr', requestDate: '2024-09-01', completedDate: '2024-09-05', expiryDate: '2024-09-05', status: 'Expired', result: 'Clear' },
];

// =============================================================================
// REFERRALS (for workforce/referrals page)
// =============================================================================

export interface DemoReferralFull {
  id: string;
  candidateName: string;
  position: string;
  referredBy: string;
  referrerDept: string;
  submittedDate: string;
  status: 'Pending' | 'Interviewing' | 'Hired' | 'Rejected';
  bonusStatus?: 'Pending' | 'Paid';
  bonusAmount?: number;
}

export const DEMO_REFERRALS_FULL: DemoReferralFull[] = [
  { id: 'REF-001', candidateName: 'Alex Thompson', position: 'Audio Engineer', referredBy: 'John Smith', referrerDept: 'Audio', submittedDate: '2024-11-20', status: 'Interviewing' },
  { id: 'REF-002', candidateName: 'Maria Garcia', position: 'Lighting Designer', referredBy: 'Sarah Johnson', referrerDept: 'Lighting', submittedDate: '2024-11-15', status: 'Hired', bonusStatus: 'Pending', bonusAmount: 2500 },
  { id: 'REF-003', candidateName: 'James Wilson', position: 'Stage Manager', referredBy: 'Mike Davis', referrerDept: 'Stage', submittedDate: '2024-11-10', status: 'Hired', bonusStatus: 'Paid', bonusAmount: 2500 },
  { id: 'REF-004', candidateName: 'Emily Chen', position: 'Video Technician', referredBy: 'John Smith', referrerDept: 'Audio', submittedDate: '2024-11-05', status: 'Rejected' },
];

// =============================================================================
// RATE CARDS (for vendors/rate-cards page)
// =============================================================================

export interface DemoRateItem {
  id: string;
  description: string;
  unit: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
}

export interface DemoRateCardFull {
  id: string;
  vendorName: string;
  vendorId: string;
  category: string;
  effectiveDate: string;
  expirationDate: string;
  status: 'Active' | 'Expired' | 'Pending';
  items: DemoRateItem[];
  notes?: string;
}

export const DEMO_RATE_CARDS_FULL: DemoRateCardFull[] = [
  {
    id: 'RC-001',
    vendorName: 'Pro Audio Solutions',
    vendorId: 'VND-001',
    category: 'Audio',
    effectiveDate: '2024-01-01',
    expirationDate: '2024-12-31',
    status: 'Active',
    items: [
      { id: 'RI-001', description: 'L-Acoustics K2 Line Array (per box)', unit: 'Day', dailyRate: 450, weeklyRate: 1800, monthlyRate: 5400 },
      { id: 'RI-002', description: 'L-Acoustics SB28 Subwoofer', unit: 'Day', dailyRate: 200, weeklyRate: 800, monthlyRate: 2400 },
      { id: 'RI-003', description: 'DiGiCo SD12 Console', unit: 'Day', dailyRate: 800, weeklyRate: 3200, monthlyRate: 9600 },
    ],
    notes: 'Volume discounts available for orders over $10,000',
  },
  {
    id: 'RC-002',
    vendorName: 'Elite Lighting Co',
    vendorId: 'VND-002',
    category: 'Lighting',
    effectiveDate: '2024-01-01',
    expirationDate: '2024-12-31',
    status: 'Active',
    items: [
      { id: 'RI-005', description: 'Clay Paky Sharpy Plus', unit: 'Day', dailyRate: 125, weeklyRate: 500, monthlyRate: 1500 },
      { id: 'RI-006', description: 'Robe MegaPointe', unit: 'Day', dailyRate: 150, weeklyRate: 600, monthlyRate: 1800 },
    ],
  },
  {
    id: 'RC-003',
    vendorName: 'Stage Systems Inc',
    vendorId: 'VND-003',
    category: 'Staging',
    effectiveDate: '2024-06-01',
    expirationDate: '2025-05-31',
    status: 'Active',
    items: [
      { id: 'RI-008', description: '40x60 Stage Deck', unit: 'Day', dailyRate: 2500, weeklyRate: 10000 },
      { id: 'RI-009', description: 'Roof System (40x40)', unit: 'Day', dailyRate: 3500, weeklyRate: 14000 },
    ],
  },
];

// =============================================================================
// CRM TASKS (for crm/tasks page)
// =============================================================================

export interface DemoCrmTask {
  id: string;
  title: string;
  type: 'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Task';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime?: string;
  assignedTo: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  reminder?: string;
  [key: string]: unknown;
}

export const DEMO_CRM_TASKS: DemoCrmTask[] = [
  { id: 'TSK-001', title: 'Follow up on proposal', type: 'Follow-up', priority: 'High', dueDate: '2024-11-25', dueTime: '10:00 AM', assignedTo: 'John Smith', linkedContact: 'Festival Productions', linkedDeal: 'Summer Fest 2025', status: 'Pending', reminder: '1 hour before' },
  { id: 'TSK-002', title: 'Send contract revision', type: 'Email', priority: 'High', dueDate: '2024-11-25', assignedTo: 'John Smith', linkedContact: 'Tech Corp', linkedDeal: 'Corporate Gala', status: 'Pending' },
  { id: 'TSK-003', title: 'Schedule site visit', type: 'Call', priority: 'Medium', dueDate: '2024-11-26', assignedTo: 'Sarah Johnson', linkedContact: 'Grand Arena', status: 'Pending', reminder: '1 day before' },
  { id: 'TSK-004', title: 'Review vendor quotes', type: 'Task', priority: 'Medium', dueDate: '2024-11-24', assignedTo: 'John Smith', status: 'Overdue' },
  { id: 'TSK-005', title: 'Client check-in call', type: 'Call', priority: 'Low', dueDate: '2024-11-23', assignedTo: 'Mike Davis', linkedContact: 'Music Festival Inc', status: 'Completed' },
];

// =============================================================================
// CRM CALENDAR EVENTS (for crm/calendar page)
// =============================================================================

export interface DemoCrmCalendarEvent {
  id: string;
  title: string;
  type: 'Meeting' | 'Call' | 'Task' | 'Reminder';
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  linkedContact?: string;
  linkedDeal?: string;
  location?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  [key: string]: unknown;
}

export const DEMO_CRM_CALENDAR_EVENTS: DemoCrmCalendarEvent[] = [
  { id: 'EVT-001', title: 'Client Discovery Call', type: 'Call', date: '2024-11-25', time: '10:00 AM', duration: '30 min', attendees: ['John Smith', 'Client Rep'], linkedContact: 'Festival Productions', linkedDeal: 'Summer Fest 2025', status: 'Scheduled' },
  { id: 'EVT-002', title: 'Site Visit - Grand Arena', type: 'Meeting', date: '2024-11-25', time: '2:00 PM', duration: '2 hrs', attendees: ['John Smith', 'Sarah Johnson', 'Venue Manager'], linkedContact: 'Grand Arena', location: '123 Arena Blvd', status: 'Scheduled' },
  { id: 'EVT-003', title: 'Proposal Review', type: 'Meeting', date: '2024-11-26', time: '11:00 AM', duration: '1 hr', attendees: ['Sales Team'], linkedDeal: 'Corporate Gala 2024', status: 'Scheduled' },
  { id: 'EVT-004', title: 'Follow-up: Tech Corp', type: 'Task', date: '2024-11-26', time: '3:00 PM', duration: '15 min', attendees: ['John Smith'], linkedContact: 'Tech Corp', status: 'Scheduled' },
];

// =============================================================================
// COMPENSATION PLANS (for workforce/compensation page)
// =============================================================================

export interface DemoCompensationPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  currentSalary: number;
  proposedSalary: number;
  equityGrant?: number;
  bonus?: number;
  effectiveDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  [key: string]: unknown;
}

export const DEMO_COMPENSATION_PLANS: DemoCompensationPlan[] = [
  { id: 'COMP-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', role: 'Senior Engineer', currentSalary: 95000, proposedSalary: 105000, equityGrant: 5000, bonus: 10000, effectiveDate: '2025-01-01', status: 'Pending Approval' },
  { id: 'COMP-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', role: 'Finance Manager', currentSalary: 85000, proposedSalary: 92000, bonus: 8000, effectiveDate: '2025-01-01', status: 'Approved' },
  { id: 'COMP-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', role: 'Operations Lead', currentSalary: 78000, proposedSalary: 85000, equityGrant: 3000, effectiveDate: '2025-01-01', status: 'Draft' },
];

// =============================================================================
// SUCCESSION PLANS (for workforce/succession page)
// =============================================================================

export interface DemoSuccessor {
  id: string;
  name: string;
  currentRole: string;
  readiness: 'Ready Now' | '1-2 Years' | '3-5 Years';
  developmentAreas: string[];
  readinessScore: number;
}

export interface DemoSuccessionPlan {
  id: string;
  position: string;
  department: string;
  currentHolder: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  successors: DemoSuccessor[];
  lastReviewed: string;
}

export const DEMO_SUCCESSION_PLANS: DemoSuccessionPlan[] = [
  { id: 'SUC-001', position: 'VP of Production', department: 'Production', currentHolder: 'Robert Chen', riskLevel: 'High', lastReviewed: '2024-10-15', successors: [
    { id: 'S-001', name: 'Sarah Johnson', currentRole: 'Production Director', readiness: 'Ready Now', developmentAreas: ['Executive presence', 'P&L management'], readinessScore: 85 },
    { id: 'S-002', name: 'Mike Williams', currentRole: 'Senior PM', readiness: '1-2 Years', developmentAreas: ['Leadership', 'Strategic planning'], readinessScore: 65 },
  ]},
  { id: 'SUC-002', position: 'Technical Director', department: 'Technical', currentHolder: 'James Wilson', riskLevel: 'Medium', lastReviewed: '2024-11-01', successors: [
    { id: 'S-003', name: 'Emily Davis', currentRole: 'Lead Engineer', readiness: '1-2 Years', developmentAreas: ['Team management', 'Budget oversight'], readinessScore: 70 },
  ]},
  { id: 'SUC-003', position: 'Finance Director', department: 'Finance', currentHolder: 'Lisa Park', riskLevel: 'Low', lastReviewed: '2024-09-20', successors: [
    { id: 'S-004', name: 'Chris Brown', currentRole: 'Finance Manager', readiness: 'Ready Now', developmentAreas: ['Investor relations'], readinessScore: 90 },
    { id: 'S-005', name: 'Amy Chen', currentRole: 'Senior Accountant', readiness: '3-5 Years', developmentAreas: ['Management', 'Strategy', 'Forecasting'], readinessScore: 45 },
  ]},
];

// =============================================================================
// UNION RULES (for workforce/union-rules page)
// =============================================================================

export interface DemoUnionRule {
  id: string;
  union: string;
  category: string;
  rule: string;
  description: string;
  effectiveDate: string;
  status: 'Active' | 'Pending' | 'Expired';
  penaltyType?: string;
  penaltyAmount?: number;
  [key: string]: unknown;
}

export const DEMO_UNION_RULES: DemoUnionRule[] = [
  { id: 'RULE-001', union: 'IATSE Local 1', category: 'Work Hours', rule: 'Maximum 10-hour call', description: 'Standard work call cannot exceed 10 hours without meal penalty', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 75 },
  { id: 'RULE-002', union: 'IATSE Local 1', category: 'Meal Breaks', rule: '6-hour meal break', description: 'Meal break required within 6 hours of call time', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Per Violation', penaltyAmount: 50 },
  { id: 'RULE-003', union: 'IATSE Local 1', category: 'Turnaround', rule: '10-hour turnaround', description: 'Minimum 10 hours between end of call and next call', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Hourly', penaltyAmount: 100 },
  { id: 'RULE-004', union: 'IBEW Local 3', category: 'Overtime', rule: 'Double time after 12', description: 'Double time rate applies after 12 hours worked', effectiveDate: '2024-01-01', status: 'Active', penaltyType: 'Rate Multiplier' },
  { id: 'RULE-005', union: 'Teamsters Local 817', category: 'Travel', rule: 'Portal-to-portal pay', description: 'Pay begins when leaving designated call point', effectiveDate: '2024-01-01', status: 'Active' },
];

// =============================================================================
// HANDBOOK (for workforce/handbook page)
// =============================================================================

export interface DemoHandbookSection {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  requiresAck: boolean;
  description: string;
}

export interface DemoPolicyAcknowledgment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  policyId: string;
  policyTitle: string;
  acknowledgedDate?: string;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  dueDate: string;
}

export const DEMO_HANDBOOK_SECTIONS: DemoHandbookSection[] = [
  { id: 'SEC-001', title: 'Code of Conduct', category: 'General', version: '3.2', lastUpdated: '2024-09-01', requiresAck: true, description: 'Professional behavior standards and ethical guidelines' },
  { id: 'SEC-002', title: 'Anti-Harassment Policy', category: 'Compliance', version: '2.1', lastUpdated: '2024-10-15', requiresAck: true, description: 'Workplace harassment prevention and reporting procedures' },
  { id: 'SEC-003', title: 'Safety Procedures', category: 'Safety', version: '4.0', lastUpdated: '2024-11-01', requiresAck: true, description: 'Workplace safety requirements and emergency procedures' },
  { id: 'SEC-004', title: 'Time Off Policies', category: 'Benefits', version: '2.5', lastUpdated: '2024-08-01', requiresAck: false, description: 'PTO, sick leave, and vacation policies' },
  { id: 'SEC-005', title: 'Equipment Usage', category: 'Operations', version: '1.8', lastUpdated: '2024-07-15', requiresAck: true, description: 'Proper use and care of company equipment' },
  { id: 'SEC-006', title: 'Confidentiality Agreement', category: 'Legal', version: '2.0', lastUpdated: '2024-06-01', requiresAck: true, description: 'Protection of confidential and proprietary information' },
  { id: 'SEC-007', title: 'Remote Work Policy', category: 'General', version: '1.5', lastUpdated: '2024-09-15', requiresAck: false, description: 'Guidelines for remote and hybrid work arrangements' },
  { id: 'SEC-008', title: 'Drug & Alcohol Policy', category: 'Compliance', version: '2.3', lastUpdated: '2024-05-01', requiresAck: true, description: 'Substance abuse prevention and testing policies' },
];

export const DEMO_POLICY_ACKNOWLEDGMENTS: DemoPolicyAcknowledgment[] = [
  { id: 'ACK-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', policyId: 'SEC-001', policyTitle: 'Code of Conduct', acknowledgedDate: '2024-09-15', status: 'Acknowledged', dueDate: '2024-09-30' },
  { id: 'ACK-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', policyId: 'SEC-002', policyTitle: 'Anti-Harassment Policy', status: 'Pending', dueDate: '2024-11-30' },
  { id: 'ACK-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', policyId: 'SEC-003', policyTitle: 'Safety Procedures', status: 'Overdue', dueDate: '2024-11-15' },
  { id: 'ACK-004', employeeId: 'EMP-104', employeeName: 'Emily Davis', department: 'Audio', policyId: 'SEC-001', policyTitle: 'Code of Conduct', acknowledgedDate: '2024-09-20', status: 'Acknowledged', dueDate: '2024-09-30' },
  { id: 'ACK-005', employeeId: 'EMP-105', employeeName: 'Chris Brown', department: 'Lighting', policyId: 'SEC-006', policyTitle: 'Confidentiality Agreement', status: 'Pending', dueDate: '2024-12-01' },
];

// =============================================================================
// LABOR LAWS (for workforce/labor-laws page)
// =============================================================================

export interface DemoStateLaborLaw {
  id: string;
  state: string;
  stateCode: string;
  category: string;
  requirement: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  status: 'Active' | 'Updated' | 'Pending';
  [key: string]: unknown;
}

export const DEMO_STATE_LABOR_LAWS: DemoStateLaborLaw[] = [
  { id: 'LAW-001', state: 'California', stateCode: 'CA', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Employees must receive a 30-minute unpaid meal break for shifts over 5 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-002', state: 'California', stateCode: 'CA', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-003', state: 'California', stateCode: 'CA', category: 'Overtime', requirement: 'Daily overtime', description: 'Overtime after 8 hours in a day, double time after 12 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-004', state: 'New York', stateCode: 'NY', category: 'Meal Breaks', requirement: '30-min meal break', description: 'Meal break required for shifts over 6 hours spanning noon', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-005', state: 'New York', stateCode: 'NY', category: 'Spread of Hours', requirement: 'Extra hour pay', description: 'Additional hour at minimum wage if workday exceeds 10 hours', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-006', state: 'Texas', stateCode: 'TX', category: 'Overtime', requirement: 'Federal FLSA only', description: 'Texas follows federal overtime rules - overtime after 40 hours/week', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
  { id: 'LAW-007', state: 'Illinois', stateCode: 'IL', category: 'Meal Breaks', requirement: '20-min meal break', description: '20-minute meal break for shifts of 7.5+ hours', effectiveDate: '2024-01-01', lastUpdated: '2024-06-01', status: 'Updated' },
  { id: 'LAW-008', state: 'Nevada', stateCode: 'NV', category: 'Rest Breaks', requirement: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effectiveDate: '2024-01-01', lastUpdated: '2024-01-01', status: 'Active' },
];

// =============================================================================
// UNION COMPLIANCE (for workforce/union-compliance page)
// =============================================================================

export interface DemoUnionLocal {
  id: string;
  name: string;
  code: string;
  jurisdiction: string;
  memberCount: number;
  contactName: string;
  contactPhone: string;
  agreementExpiry: string;
  status: 'Active' | 'Expiring' | 'Expired';
}

export interface DemoUnionComplianceRule {
  id: string;
  localId: string;
  category: string;
  rule: string;
  requirement: string;
  penalty?: string;
}

export const DEMO_UNION_LOCALS: DemoUnionLocal[] = [
  { id: 'UL-001', name: 'IATSE Local 1', code: 'IA-1', jurisdiction: 'New York', memberCount: 3200, contactName: 'John Smith', contactPhone: '212-555-0100', agreementExpiry: '2025-06-30', status: 'Active' },
  { id: 'UL-002', name: 'IATSE Local 33', code: 'IA-33', jurisdiction: 'Los Angeles', memberCount: 2800, contactName: 'Maria Garcia', contactPhone: '323-555-0200', agreementExpiry: '2025-03-15', status: 'Expiring' },
  { id: 'UL-003', name: 'IBEW Local 3', code: 'IBEW-3', jurisdiction: 'New York', memberCount: 1500, contactName: 'Robert Johnson', contactPhone: '212-555-0300', agreementExpiry: '2024-12-31', status: 'Expiring' },
  { id: 'UL-004', name: 'Teamsters Local 817', code: 'TM-817', jurisdiction: 'New York', memberCount: 890, contactName: 'Sarah Davis', contactPhone: '212-555-0400', agreementExpiry: '2025-09-30', status: 'Active' },
];

export const DEMO_UNION_COMPLIANCE_RULES: DemoUnionComplianceRule[] = [
  { id: 'UR-001', localId: 'UL-001', category: 'Work Hours', rule: '8-Hour Day', requirement: 'Overtime after 8 hours at 1.5x rate', penalty: 'Back pay + penalties' },
  { id: 'UR-002', localId: 'UL-001', category: 'Meal Breaks', rule: 'Meal Penalty', requirement: '6-hour meal break maximum', penalty: '$50/30min violation' },
  { id: 'UR-003', localId: 'UL-001', category: 'Turnaround', rule: '12-Hour Rest', requirement: 'Minimum 12 hours between calls', penalty: 'Golden time rates' },
  { id: 'UR-004', localId: 'UL-002', category: 'Staffing', rule: 'Minimum Crew', requirement: '4-person minimum for rigging calls', penalty: 'Full crew pay required' },
];

// =============================================================================
// EMAIL THREADS (for crm/email-integration page)
// =============================================================================

export interface DemoEmailThread {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  preview: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: 'Unread' | 'Read' | 'Replied';
  [key: string]: unknown;
}

export const DEMO_EMAIL_THREADS: DemoEmailThread[] = [
  { id: 'EM-001', subject: 'Re: Summer Festival Proposal', from: 'client@festival.com', to: 'john.smith@company.com', date: '2024-11-25 10:30', preview: 'Thanks for sending over the proposal. We have reviewed it and have a few questions...', linkedContact: 'Festival Productions', linkedDeal: 'Summer Fest 2025', status: 'Unread' },
  { id: 'EM-002', subject: 'Equipment Quote Request', from: 'vendor@audiohouse.com', to: 'john.smith@company.com', date: '2024-11-25 09:15', preview: 'Please find attached our quote for the L-Acoustics system rental...', linkedContact: 'Audio House Inc', status: 'Read' },
  { id: 'EM-003', subject: 'Contract Review - Corporate Gala', from: 'legal@techcorp.com', to: 'sales@company.com', date: '2024-11-24 16:45', preview: 'Our legal team has completed the review. Please see the attached redlines...', linkedContact: 'Tech Corp', linkedDeal: 'Corporate Gala 2024', status: 'Replied' },
  { id: 'EM-004', subject: 'Meeting Confirmation', from: 'assistant@venue.com', to: 'john.smith@company.com', date: '2024-11-24 14:20', preview: 'This confirms your site visit scheduled for November 28th at 2:00 PM...', linkedContact: 'Grand Arena', status: 'Read' },
];

// =============================================================================
// CRM LEAD SCORING (for crm/lead-scoring page)
// =============================================================================

export interface DemoCrmLead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  lastActivity: string;
  engagementScore: number;
  fitScore: number;
  behaviorScore: number;
  assignedTo?: string;
  estimatedValue?: number;
  [key: string]: unknown;
}

export const DEMO_CRM_LEADS: DemoCrmLead[] = [
  { id: 'LEAD-001', name: 'Sarah Mitchell', company: 'TechCorp Events', email: 'sarah@techcorp.com', source: 'Website', score: 92, grade: 'A', status: 'Qualified', lastActivity: '2024-11-24', engagementScore: 85, fitScore: 95, behaviorScore: 90, assignedTo: 'John Smith', estimatedValue: 125000 },
  { id: 'LEAD-002', name: 'Michael Chen', company: 'Festival Productions', email: 'mchen@festprod.com', source: 'Referral', score: 78, grade: 'B', status: 'Proposal', lastActivity: '2024-11-23', engagementScore: 70, fitScore: 85, behaviorScore: 75, assignedTo: 'Jane Doe', estimatedValue: 85000 },
  { id: 'LEAD-003', name: 'Emily Rodriguez', company: 'Corporate Events Inc', email: 'emily@corpevents.com', source: 'Trade Show', score: 65, grade: 'B', status: 'Contacted', lastActivity: '2024-11-22', engagementScore: 60, fitScore: 70, behaviorScore: 65, estimatedValue: 45000 },
  { id: 'LEAD-004', name: 'David Park', company: 'StartUp Ventures', email: 'dpark@startup.io', source: 'LinkedIn', score: 45, grade: 'C', status: 'New', lastActivity: '2024-11-24', engagementScore: 40, fitScore: 50, behaviorScore: 45, estimatedValue: 25000 },
  { id: 'LEAD-005', name: 'Lisa Thompson', company: 'Local Business', email: 'lisa@local.com', source: 'Cold Outreach', score: 28, grade: 'D', status: 'Contacted', lastActivity: '2024-11-20', engagementScore: 25, fitScore: 30, behaviorScore: 30, estimatedValue: 10000 },
];
