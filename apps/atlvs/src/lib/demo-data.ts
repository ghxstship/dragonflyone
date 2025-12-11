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

// =============================================================================
// CALIBRATION RECORDS (for assets/calibration page)
// =============================================================================

export interface DemoCalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  calibrationType: string;
  lastCalibration: string;
  nextDue: string;
  frequency: string;
  status: 'Current' | 'Due Soon' | 'Overdue' | 'Scheduled';
  certifiedBy?: string;
  certificateNumber?: string;
  notes?: string;
  [key: string]: unknown;
}

export const DEMO_CALIBRATION_RECORDS: DemoCalibrationRecord[] = [
  { id: 'CAL-001', assetId: 'AST-010', assetName: 'Fluke 87V Multimeter', category: 'Test Equipment', calibrationType: 'Electrical Calibration', lastCalibration: '2024-06-15', nextDue: '2025-06-15', frequency: 'Annual', status: 'Current', certifiedBy: 'Cal Labs Inc', certificateNumber: 'CL-2024-4521' },
  { id: 'CAL-002', assetId: 'AST-011', assetName: 'NTI Audio XL2', category: 'Audio Measurement', calibrationType: 'Acoustic Calibration', lastCalibration: '2024-03-20', nextDue: '2024-12-20', frequency: '9 Months', status: 'Due Soon', certifiedBy: 'NTI Americas', certificateNumber: 'NTI-2024-8892' },
  { id: 'CAL-003', assetId: 'AST-012', assetName: 'CM Lodestar Load Cell', category: 'Rigging', calibrationType: 'Load Certification', lastCalibration: '2024-01-10', nextDue: '2024-07-10', frequency: '6 Months', status: 'Overdue', certifiedBy: 'Rigging Safety Inc', certificateNumber: 'RS-2024-1123' },
  { id: 'CAL-004', assetId: 'AST-013', assetName: 'Minolta CL-200A', category: 'Lighting Measurement', calibrationType: 'Photometric Calibration', lastCalibration: '2024-08-01', nextDue: '2025-08-01', frequency: 'Annual', status: 'Current', certifiedBy: 'Konica Minolta', certificateNumber: 'KM-2024-5567' },
  { id: 'CAL-005', assetId: 'AST-014', assetName: 'Laser Distance Meter', category: 'Survey Equipment', calibrationType: 'Distance Calibration', lastCalibration: '2024-09-15', nextDue: '2024-12-15', frequency: 'Quarterly', status: 'Scheduled', certifiedBy: 'Precision Labs', certificateNumber: 'PL-2024-9901', notes: 'Scheduled for Dec 10' },
];

// =============================================================================
// DAMAGE REPORTS (for assets/damage-reports page)
// =============================================================================

export interface DemoDamageReport {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  reportedBy: string;
  reportedDate: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  status: 'Reported' | 'Under Review' | 'Repair Scheduled' | 'In Repair' | 'Resolved' | 'Write-Off';
  description: string;
  location: string;
  projectId?: string;
  estimatedCost?: number;
  actualCost?: number;
  insuranceClaim?: boolean;
  photos?: string[];
  repairVendor?: string;
  resolvedDate?: string;
  [key: string]: unknown;
}

export const DEMO_DAMAGE_REPORTS: DemoDamageReport[] = [
  { id: 'DMG-001', assetId: 'AST-003', assetName: 'disguise gx 2c Media Server', category: 'Video', reportedBy: 'Mike Thompson', reportedDate: '2024-11-20', severity: 'Moderate', status: 'In Repair', description: 'Fan failure causing overheating. Unit shut down during show.', location: 'Tampa Convention Center', projectId: 'PROJ-089', estimatedCost: 1200, repairVendor: 'PRG Technical Services', insuranceClaim: false },
  { id: 'DMG-002', assetId: 'AST-002', assetName: 'Robe MegaPointe #7', category: 'Lighting', reportedBy: 'Sarah Chen', reportedDate: '2024-11-18', severity: 'Major', status: 'Repair Scheduled', description: 'Gobo wheel motor seized. Complete motor assembly replacement needed.', location: 'Warehouse A', estimatedCost: 850, repairVendor: 'Robe Service Center', insuranceClaim: false },
  { id: 'DMG-003', assetId: 'AST-004', assetName: 'Staging Deck Module #23', category: 'Staging', reportedBy: 'Tom Wilson', reportedDate: '2024-11-15', severity: 'Minor', status: 'Resolved', description: 'Surface scratches from load-in. Cosmetic only.', location: 'Amalie Arena', projectId: 'PROJ-088', estimatedCost: 150, actualCost: 120, resolvedDate: '2024-11-17' },
  { id: 'DMG-004', assetId: 'AST-005', assetName: 'Chain Motor Hoist #12', category: 'Rigging', reportedBy: 'John Martinez', reportedDate: '2024-11-22', severity: 'Critical', status: 'Under Review', description: 'Chain slippage detected during load test. Removed from service pending inspection.', location: 'Warehouse A', insuranceClaim: true },
];

// =============================================================================
// IDLE ASSETS (for assets/idle-analysis page)
// =============================================================================

export interface DemoIdleAsset {
  id: string;
  name: string;
  category: string;
  idleDays: number;
  lastUsed: string;
  location: string;
  value: number;
  monthlyCarryCost: number;
  recommendation: 'Sell' | 'Rent Out' | 'Redeploy' | 'Monitor';
  [key: string]: unknown;
}

export const DEMO_IDLE_ASSETS: DemoIdleAsset[] = [
  { id: 'AST-101', name: 'Meyer Sound LYON', category: 'Audio', idleDays: 45, lastUsed: '2024-10-10', location: 'Warehouse A', value: 85000, monthlyCarryCost: 850, recommendation: 'Rent Out' },
  { id: 'AST-102', name: 'Robe MegaPointe (12)', category: 'Lighting', idleDays: 62, lastUsed: '2024-09-23', location: 'Warehouse B', value: 48000, monthlyCarryCost: 480, recommendation: 'Redeploy' },
  { id: 'AST-103', name: 'Blackmagic ATEM 4K', category: 'Video', idleDays: 90, lastUsed: '2024-08-26', location: 'Warehouse A', value: 12000, monthlyCarryCost: 120, recommendation: 'Sell' },
  { id: 'AST-104', name: 'CM Lodestar 2T (8)', category: 'Rigging', idleDays: 30, lastUsed: '2024-10-25', location: 'Warehouse C', value: 32000, monthlyCarryCost: 320, recommendation: 'Monitor' },
  { id: 'AST-105', name: 'Stageline SL100', category: 'Staging', idleDays: 120, lastUsed: '2024-07-26', location: 'Yard', value: 95000, monthlyCarryCost: 1200, recommendation: 'Sell' },
];

// =============================================================================
// ASSET KITS (for assets/kits page)
// =============================================================================

export interface DemoAssetKitItem {
  name: string;
  quantity: number;
  category: string;
}

export interface DemoAssetKit {
  id: string;
  name: string;
  category: string;
  itemCount: number;
  totalValue: number;
  status: 'Available' | 'Deployed' | 'Partial';
  lastUsed?: string;
  description: string;
  items: DemoAssetKitItem[];
  [key: string]: unknown;
}

export const DEMO_ASSET_KITS: DemoAssetKit[] = [
  { id: 'KIT-001', name: 'Festival Main Stage Audio', category: 'Audio', itemCount: 48, totalValue: 425000, status: 'Available', lastUsed: '2024-11-15', description: 'Complete L-Acoustics K2 system with subs and processing', items: [{ name: 'L-Acoustics K2', quantity: 24, category: 'Speakers' }, { name: 'KS28 Subs', quantity: 16, category: 'Speakers' }, { name: 'LA12X Amps', quantity: 8, category: 'Amplifiers' }] },
  { id: 'KIT-002', name: 'Corporate Event Lighting', category: 'Lighting', itemCount: 32, totalValue: 85000, status: 'Deployed', lastUsed: '2024-11-20', description: 'Versatile lighting package for corporate events', items: [{ name: 'Clay Paky Sharpy', quantity: 12, category: 'Moving Lights' }, { name: 'ETC Source Four', quantity: 16, category: 'Conventionals' }, { name: 'grandMA3', quantity: 1, category: 'Consoles' }] },
  { id: 'KIT-003', name: 'Video Wall 20x10', category: 'Video', itemCount: 200, totalValue: 320000, status: 'Available', description: 'ROE CB5 LED wall configuration', items: [{ name: 'ROE CB5 Panels', quantity: 200, category: 'LED' }, { name: 'Brompton Processors', quantity: 4, category: 'Processing' }] },
  { id: 'KIT-004', name: 'Outdoor Stage Package', category: 'Staging', itemCount: 156, totalValue: 175000, status: 'Partial', description: '40x32 outdoor stage with roof system', items: [{ name: 'Stage Decks', quantity: 80, category: 'Decking' }, { name: 'Roof Sections', quantity: 24, category: 'Roof' }, { name: 'Legs 4ft', quantity: 52, category: 'Support' }] },
];

// =============================================================================
// OPTIMIZATION RECOMMENDATIONS (for assets/optimization page)
// =============================================================================

export interface DemoOptimizationRecommendation {
  id: string;
  type: 'underutilized' | 'overutilized' | 'maintenance_due' | 'replacement' | 'consolidation' | 'reallocation';
  priority: 'high' | 'medium' | 'low';
  asset_id: string;
  asset_name: string;
  category: string;
  current_utilization: number;
  target_utilization: number;
  recommendation: string;
  potential_savings: number;
  action_items: string[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
  [key: string]: unknown;
}

export const DEMO_OPTIMIZATION_RECOMMENDATIONS: DemoOptimizationRecommendation[] = [
  { id: 'REC-001', type: 'underutilized', priority: 'high', asset_id: 'AST-001', asset_name: 'LED Wall Panel Set A', category: 'Video', current_utilization: 15, target_utilization: 60, recommendation: 'Consider rental pooling or sale. Asset has been idle for 85% of the quarter.', potential_savings: 25000, action_items: ['List on rental marketplace', 'Get appraisal for sale', 'Review upcoming project needs'], status: 'pending' },
  { id: 'REC-002', type: 'overutilized', priority: 'medium', asset_id: 'AST-002', asset_name: 'Meyer Sound Line Array', category: 'Audio', current_utilization: 95, target_utilization: 75, recommendation: 'High demand asset. Consider purchasing additional units to reduce scheduling conflicts.', potential_savings: 15000, action_items: ['Request capital budget', 'Evaluate rental costs vs purchase', 'Review booking conflicts'], status: 'in_progress' },
  { id: 'REC-003', type: 'maintenance_due', priority: 'high', asset_id: 'AST-003', asset_name: 'Lighting Console grandMA3', category: 'Lighting', current_utilization: 70, target_utilization: 70, recommendation: 'Preventive maintenance overdue by 30 days. Schedule service to avoid downtime.', potential_savings: 5000, action_items: ['Schedule maintenance window', 'Arrange backup console', 'Update service records'], status: 'pending' },
  { id: 'REC-004', type: 'consolidation', priority: 'low', asset_id: 'AST-004', asset_name: 'Cable Inventory', category: 'Infrastructure', current_utilization: 40, target_utilization: 60, recommendation: 'Multiple cable types with low utilization. Consolidate to standard types.', potential_savings: 8000, action_items: ['Audit cable inventory', 'Identify redundant types', 'Create standardization plan'], status: 'pending' },
  { id: 'REC-005', type: 'replacement', priority: 'medium', asset_id: 'AST-005', asset_name: 'PTZ Camera Set', category: 'Video', current_utilization: 65, target_utilization: 70, recommendation: 'Asset approaching end of life. Plan replacement within 6 months.', potential_savings: 12000, action_items: ['Research replacement models', 'Get quotes', 'Plan transition timeline'], status: 'pending' },
];

// =============================================================================
// ASSET PERFORMANCE (for assets/performance page)
// =============================================================================

export interface DemoAssetPerformance {
  id: string;
  name: string;
  category: string;
  utilizationRate: number;
  uptime: number;
  failureCount: number;
  mtbf: number;
  mttr: number;
  healthScore: number;
  predictedFailure?: string;
  lastMaintenance: string;
  [key: string]: unknown;
}

export const DEMO_ASSET_PERFORMANCE: DemoAssetPerformance[] = [
  { id: 'AST-001', name: 'L-Acoustics K2 Array', category: 'Audio', utilizationRate: 78, uptime: 99.2, failureCount: 1, mtbf: 2400, mttr: 4, healthScore: 92, lastMaintenance: '2024-10-15' },
  { id: 'AST-002', name: 'Clay Paky Sharpy Plus', category: 'Lighting', utilizationRate: 85, uptime: 98.5, failureCount: 3, mtbf: 1800, mttr: 2, healthScore: 88, predictedFailure: '2025-02-15', lastMaintenance: '2024-11-01' },
  { id: 'AST-003', name: 'ROE Visual CB5 Panels', category: 'Video', utilizationRate: 62, uptime: 99.8, failureCount: 0, mtbf: 3200, mttr: 1, healthScore: 98, lastMaintenance: '2024-09-20' },
  { id: 'AST-004', name: 'CM Lodestar 1T Hoists', category: 'Rigging', utilizationRate: 71, uptime: 99.5, failureCount: 2, mtbf: 2100, mttr: 6, healthScore: 85, predictedFailure: '2025-01-20', lastMaintenance: '2024-10-25' },
  { id: 'AST-005', name: 'DiGiCo SD12 Console', category: 'Audio', utilizationRate: 92, uptime: 100, failureCount: 0, mtbf: 4000, mttr: 0, healthScore: 100, lastMaintenance: '2024-11-10' },
];

// =============================================================================
// RENTAL EQUIPMENT (for assets/rentals page)
// =============================================================================

export interface DemoRentalEquipment {
  id: string;
  name: string;
  category: string;
  vendor: string;
  projectName: string;
  rentalStart: string;
  rentalEnd: string;
  dailyRate: number;
  totalCost: number;
  status: 'Reserved' | 'On Rent' | 'Returned' | 'Overdue';
  poNumber?: string;
  condition: string;
  [key: string]: unknown;
}

export const DEMO_RENTAL_EQUIPMENT: DemoRentalEquipment[] = [
  { id: 'RNT-001', name: 'Barco UDX-4K32', category: 'Video', vendor: 'PRG', projectName: 'Summer Fest 2024', rentalStart: '2024-11-20', rentalEnd: '2024-11-26', dailyRate: 1500, totalCost: 10500, status: 'On Rent', poNumber: 'PO-2024-456', condition: 'Excellent' },
  { id: 'RNT-002', name: 'd&b audiotechnik SL-SUB', category: 'Audio', vendor: 'Sound Systems Inc', projectName: 'Summer Fest 2024', rentalStart: '2024-11-20', rentalEnd: '2024-11-26', dailyRate: 200, totalCost: 1400, status: 'On Rent', poNumber: 'PO-2024-457', condition: 'Good' },
  { id: 'RNT-003', name: 'Stageline SL-320 Mobile Stage', category: 'Staging', vendor: 'Stageline', projectName: 'Summer Fest 2024', rentalStart: '2024-11-18', rentalEnd: '2024-11-27', dailyRate: 3500, totalCost: 35000, status: 'On Rent', poNumber: 'PO-2024-450', condition: 'Good' },
  { id: 'RNT-004', name: 'CM Lodestar 2-Ton (x10)', category: 'Rigging', vendor: 'Rigging Solutions', projectName: 'Corporate Gala', rentalStart: '2024-12-01', rentalEnd: '2024-12-05', dailyRate: 150, totalCost: 750, status: 'Reserved', condition: 'Excellent' },
  { id: 'RNT-005', name: 'Avolites Arena Console', category: 'Lighting', vendor: '4Wall', projectName: 'Fall Festival', rentalStart: '2024-11-10', rentalEnd: '2024-11-16', dailyRate: 500, totalCost: 3500, status: 'Returned', poNumber: 'PO-2024-440', condition: 'Good' },
  { id: 'RNT-006', name: 'Shure ULXD4Q Wireless', category: 'Audio', vendor: 'PRG', projectName: 'Fall Festival', rentalStart: '2024-11-10', rentalEnd: '2024-11-16', dailyRate: 75, totalCost: 525, status: 'Overdue', poNumber: 'PO-2024-441', condition: 'Good' },
];

// =============================================================================
// STORAGE LOCATIONS (for assets/storage page)
// =============================================================================

export interface DemoStorageLocation {
  id: string;
  name: string;
  type: 'Warehouse' | 'Bay' | 'Rack' | 'Container';
  capacity: number;
  used: number;
  category: string;
  address?: string;
  climate: 'Standard' | 'Climate Controlled' | 'Outdoor';
  status: 'Active' | 'Full' | 'Maintenance';
  [key: string]: unknown;
}

export const DEMO_STORAGE_LOCATIONS: DemoStorageLocation[] = [
  { id: 'LOC-001', name: 'Main Warehouse', type: 'Warehouse', capacity: 50000, used: 38500, category: 'All', address: '123 Industrial Blvd', climate: 'Climate Controlled', status: 'Active' },
  { id: 'LOC-002', name: 'Audio Bay A', type: 'Bay', capacity: 5000, used: 4200, category: 'Audio', climate: 'Climate Controlled', status: 'Active' },
  { id: 'LOC-003', name: 'Lighting Bay B', type: 'Bay', capacity: 5000, used: 4800, category: 'Lighting', climate: 'Standard', status: 'Active' },
  { id: 'LOC-004', name: 'Video Storage', type: 'Bay', capacity: 3000, used: 3000, category: 'Video', climate: 'Climate Controlled', status: 'Full' },
  { id: 'LOC-005', name: 'Rigging Container', type: 'Container', capacity: 2000, used: 1500, category: 'Rigging', climate: 'Outdoor', status: 'Active' },
  { id: 'LOC-006', name: 'Staging Yard', type: 'Warehouse', capacity: 20000, used: 12000, category: 'Staging', address: '456 Staging Way', climate: 'Outdoor', status: 'Active' },
];

// =============================================================================
// ASSET TRACKING (for assets/tracking page)
// =============================================================================

export interface DemoAssetLocation {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  trackingType: 'GPS' | 'RFID' | 'Manual';
  locationName: string;
  locationAddress: string;
  zone?: string;
  lastSeen: string;
  status: 'Active' | 'In Transit' | 'Stationary' | 'Offline';
  batteryLevel?: number;
  assignedProject?: string;
  [key: string]: unknown;
}

export const DEMO_ASSET_LOCATIONS: DemoAssetLocation[] = [
  { id: 'LOC-001', assetId: 'AST-001', assetName: 'Meyer Sound LEO Line Array', category: 'Audio', trackingType: 'GPS', locationName: 'Tampa Convention Center', locationAddress: '333 S Franklin St, Tampa, FL', zone: 'Loading Dock A', lastSeen: '2024-11-24T14:32:00Z', status: 'Active', batteryLevel: 87, assignedProject: 'PROJ-2024-089' },
  { id: 'LOC-002', assetId: 'AST-002', assetName: 'Robe MegaPointe (24x)', category: 'Lighting', trackingType: 'RFID', locationName: 'Warehouse A', locationAddress: '1234 Industrial Blvd, Tampa, FL', zone: 'Bay 1 - Rack C', lastSeen: '2024-11-24T15:00:00Z', status: 'Stationary' },
  { id: 'LOC-003', assetId: 'AST-003', assetName: 'disguise gx 2c Media Server', category: 'Video', trackingType: 'GPS', locationName: 'In Transit', locationAddress: 'I-4 East, Orlando, FL', lastSeen: '2024-11-24T14:45:00Z', status: 'In Transit', batteryLevel: 92, assignedProject: 'PROJ-2024-091' },
  { id: 'LOC-004', assetId: 'AST-004', assetName: 'Staging Deck System', category: 'Staging', trackingType: 'Manual', locationName: 'Warehouse B', locationAddress: '5678 Storage Way, Tampa, FL', zone: 'Ground Level - Section D', lastSeen: '2024-11-23T16:00:00Z', status: 'Stationary' },
  { id: 'LOC-005', assetId: 'AST-005', assetName: 'Chain Motor Hoists (20x)', category: 'Rigging', trackingType: 'RFID', locationName: 'Amalie Arena', locationAddress: '401 Channelside Dr, Tampa, FL', zone: 'Rigging Grid - Section 4', lastSeen: '2024-11-24T10:00:00Z', status: 'Active', assignedProject: 'PROJ-2024-088' },
];

// =============================================================================
// ASSET UTILIZATION (for assets/utilization page)
// =============================================================================

export interface DemoAssetUtilization {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  totalRevenue: number;
  utilizationRate: number;
  daysDeployed: number;
  projectCount: number;
  roi: number;
  costPerDay: number;
  [key: string]: unknown;
}

export const DEMO_ASSET_UTILIZATION: DemoAssetUtilization[] = [
  { id: 'AST-001', name: 'Meyer Sound LEO Line Array', category: 'Audio', purchasePrice: 285000, currentValue: 228000, totalRevenue: 142500, utilizationRate: 0.82, daysDeployed: 299, projectCount: 47, roi: 50, costPerDay: 780 },
  { id: 'AST-002', name: 'Robe MegaPointe (24x)', category: 'Lighting', purchasePrice: 156000, currentValue: 124800, totalRevenue: 98400, utilizationRate: 0.91, daysDeployed: 332, projectCount: 52, roi: 63, costPerDay: 427 },
  { id: 'AST-003', name: 'disguise gx 2c Media Server', category: 'Video', purchasePrice: 48000, currentValue: 38400, totalRevenue: 28500, utilizationRate: 0.75, daysDeployed: 274, projectCount: 38, roi: 59, costPerDay: 131 },
  { id: 'AST-004', name: 'Staging Deck System', category: 'Staging', purchasePrice: 95000, currentValue: 76000, totalRevenue: 51300, utilizationRate: 0.68, daysDeployed: 248, projectCount: 41, roi: 54, costPerDay: 260 },
  { id: 'AST-005', name: 'Chain Motor Hoists (20x)', category: 'Rigging', purchasePrice: 42000, currentValue: 33600, totalRevenue: 33600, utilizationRate: 0.79, daysDeployed: 288, projectCount: 56, roi: 80, costPerDay: 115 },
];

// =============================================================================
// CLIENT RETENTION (for analytics/client-retention page)
// =============================================================================

export interface DemoClientRetention {
  id: string;
  clientName: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  firstDealDate: string;
  totalDeals: number;
  totalRevenue: number;
  lastDealDate: string;
  status: 'Active' | 'At Risk' | 'Churned' | 'New';
  healthScore: number;
  daysSinceLastDeal: number;
  avgDealSize: number;
  npsScore?: number;
  [key: string]: unknown;
}

export const DEMO_CLIENT_RETENTION: DemoClientRetention[] = [
  { id: 'CL-001', clientName: 'TechCorp Events', segment: 'Enterprise', firstDealDate: '2022-03-15', totalDeals: 12, totalRevenue: 450000, lastDealDate: '2024-11-10', status: 'Active', healthScore: 92, daysSinceLastDeal: 14, avgDealSize: 37500, npsScore: 9 },
  { id: 'CL-002', clientName: 'Festival Productions', segment: 'Enterprise', firstDealDate: '2021-06-20', totalDeals: 18, totalRevenue: 680000, lastDealDate: '2024-10-05', status: 'Active', healthScore: 88, daysSinceLastDeal: 50, avgDealSize: 37778, npsScore: 8 },
  { id: 'CL-003', clientName: 'Corporate Events Inc', segment: 'Mid-Market', firstDealDate: '2023-01-10', totalDeals: 6, totalRevenue: 125000, lastDealDate: '2024-08-15', status: 'At Risk', healthScore: 45, daysSinceLastDeal: 101, avgDealSize: 20833, npsScore: 6 },
  { id: 'CL-004', clientName: 'StartUp Ventures', segment: 'SMB', firstDealDate: '2024-02-01', totalDeals: 2, totalRevenue: 28000, lastDealDate: '2024-05-20', status: 'At Risk', healthScore: 35, daysSinceLastDeal: 188, avgDealSize: 14000 },
  { id: 'CL-005', clientName: 'Media Group LLC', segment: 'Mid-Market', firstDealDate: '2022-09-01', totalDeals: 8, totalRevenue: 195000, lastDealDate: '2024-11-20', status: 'Active', healthScore: 85, daysSinceLastDeal: 4, avgDealSize: 24375, npsScore: 8 },
  { id: 'CL-006', clientName: 'Local Business Co', segment: 'SMB', firstDealDate: '2023-06-15', totalDeals: 3, totalRevenue: 35000, lastDealDate: '2024-01-10', status: 'Churned', healthScore: 15, daysSinceLastDeal: 319, avgDealSize: 11667, npsScore: 4 },
  { id: 'CL-007', clientName: 'Innovation Labs', segment: 'Mid-Market', firstDealDate: '2024-10-01', totalDeals: 1, totalRevenue: 45000, lastDealDate: '2024-10-01', status: 'New', healthScore: 75, daysSinceLastDeal: 54, avgDealSize: 45000 },
];

// =============================================================================
// DASHBOARDS (for analytics/dashboard-builder page)
// =============================================================================

export interface DemoDashboard {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  isDefault: boolean;
  createdAt: string;
  lastModified: string;
  status: 'Active' | 'Draft';
  [key: string]: unknown;
}

export const DEMO_DASHBOARDS: DemoDashboard[] = [
  { id: 'DB-001', name: 'Executive Overview', description: 'High-level KPIs for leadership', widgetCount: 8, isDefault: true, createdAt: '2024-11-01', lastModified: '2024-11-20', status: 'Active' },
  { id: 'DB-002', name: 'Finance Dashboard', description: 'Financial metrics and trends', widgetCount: 12, isDefault: false, createdAt: '2024-11-10', lastModified: '2024-11-18', status: 'Active' },
  { id: 'DB-003', name: 'Operations Dashboard', description: 'Operational KPIs and workflows', widgetCount: 6, isDefault: false, createdAt: '2024-11-15', lastModified: '2024-11-15', status: 'Draft' },
  { id: 'DB-004', name: 'Sales Pipeline', description: 'Deal tracking and forecasting', widgetCount: 10, isDefault: false, createdAt: '2024-10-20', lastModified: '2024-11-22', status: 'Active' },
  { id: 'DB-005', name: 'HR Analytics', description: 'Workforce metrics', widgetCount: 5, isDefault: false, createdAt: '2024-10-15', lastModified: '2024-11-10', status: 'Active' },
];

// =============================================================================
// DATA SOURCES (for analytics/data-warehouse page)
// =============================================================================

export interface DemoDataSource {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Streaming';
  status: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
  lastSync: string;
  recordCount: number;
  syncFrequency: string;
  [key: string]: unknown;
}

export const DEMO_DATA_SOURCES: DemoDataSource[] = [
  { id: 'SRC-001', name: 'ATLVS Production DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 2450000, syncFrequency: 'Real-time' },
  { id: 'SRC-002', name: 'COMPVSS Events DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 1850000, syncFrequency: 'Real-time' },
  { id: 'SRC-003', name: 'GVTEWAY Consumer DB', type: 'Database', status: 'Syncing', lastSync: '2024-11-25 10:15', recordCount: 3200000, syncFrequency: '15 min' },
  { id: 'SRC-004', name: 'Stripe Payments API', type: 'API', status: 'Connected', lastSync: '2024-11-25 10:28', recordCount: 450000, syncFrequency: 'Hourly' },
  { id: 'SRC-005', name: 'Salesforce CRM', type: 'API', status: 'Connected', lastSync: '2024-11-25 09:00', recordCount: 125000, syncFrequency: 'Daily' },
  { id: 'SRC-006', name: 'Google Analytics', type: 'API', status: 'Error', lastSync: '2024-11-24 18:00', recordCount: 8500000, syncFrequency: 'Daily' },
];

// =============================================================================
// CREDIT CARD TRANSACTIONS (for finance/credit-cards page)
// =============================================================================

export interface DemoCreditCardTxn {
  id: string;
  cardId: string;
  lastFour: string;
  cardHolder: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  status: 'Pending' | 'Posted' | 'Disputed';
  receipt?: boolean;
  department: string;
  [key: string]: unknown;
}

export const DEMO_CREDIT_CARD_TXNS: DemoCreditCardTxn[] = [
  { id: 'TXN-001', cardId: 'CC-001', lastFour: '4521', cardHolder: 'John Smith', merchant: 'Audio Equipment Co', amount: 2450, date: '2024-11-24', category: 'Equipment', status: 'Posted', receipt: true, department: 'Production' },
  { id: 'TXN-002', cardId: 'CC-002', lastFour: '7832', cardHolder: 'Sarah Johnson', merchant: 'Delta Airlines', amount: 1890, date: '2024-11-23', category: 'Travel', status: 'Posted', receipt: true, department: 'Executive' },
  { id: 'TXN-003', cardId: 'CC-001', lastFour: '4521', cardHolder: 'John Smith', merchant: 'Staples', amount: 156, date: '2024-11-23', category: 'Office Supplies', status: 'Pending', department: 'Production' },
  { id: 'TXN-004', cardId: 'CC-003', lastFour: '9156', cardHolder: 'Mike Davis', merchant: 'Hilton Hotels', amount: 890, date: '2024-11-22', category: 'Travel', status: 'Posted', receipt: false, department: 'Operations' },
  { id: 'TXN-005', cardId: 'CC-002', lastFour: '7832', cardHolder: 'Sarah Johnson', merchant: 'Amazon Business', amount: 567, date: '2024-11-22', category: 'Supplies', status: 'Disputed', department: 'Executive' },
];

// =============================================================================
// PORTAL DATA (Crew, Vendor, Artist, Sponsor, Investor portals)
// =============================================================================

export interface DemoCrewAssignment {
  id: string;
  production: string;
  role: string;
  dates: string;
  status: 'confirmed' | 'pending' | 'completed';
  rate: number;
}

export const DEMO_CREW_ASSIGNMENTS: DemoCrewAssignment[] = [
  { id: '1', production: 'Summer Music Festival 2024', role: 'Stage Manager', dates: 'Nov 18-22, 2024', status: 'confirmed', rate: 500 },
  { id: '2', production: 'Corporate Gala', role: 'Technical Director', dates: 'Dec 5, 2024', status: 'pending', rate: 750 },
  { id: '3', production: 'Concert Series - Week 1', role: 'Stage Manager', dates: 'Oct 15-18, 2024', status: 'completed', rate: 500 },
];

export interface DemoProductionVendorContract {
  id: string;
  production: string;
  service: string;
  value: number;
  status: 'active' | 'pending' | 'completed';
  startDate: string;
  endDate: string;
}

export const DEMO_PRODUCTION_VENDOR_CONTRACTS: DemoProductionVendorContract[] = [
  { id: '1', production: 'Summer Music Festival 2024', service: 'Audio Equipment Rental', value: 45000, status: 'active', startDate: 'Nov 15, 2024', endDate: 'Nov 25, 2024' },
  { id: '2', production: 'Corporate Gala', service: 'Lighting Package', value: 12000, status: 'pending', startDate: 'Dec 3, 2024', endDate: 'Dec 6, 2024' },
  { id: '3', production: 'Concert Series', service: 'Stage Equipment', value: 28000, status: 'completed', startDate: 'Oct 10, 2024', endDate: 'Oct 20, 2024' },
];

export interface DemoArtistBooking {
  id: string;
  event: string;
  venue: string;
  date: string;
  fee: number;
  status: 'confirmed' | 'pending' | 'completed';
  ticketsSold?: number;
}

export const DEMO_ARTIST_BOOKINGS: DemoArtistBooking[] = [
  { id: '1', event: 'Summer Music Festival 2024', venue: 'Central Park Amphitheater', date: 'Nov 20, 2024', fee: 75000, status: 'confirmed', ticketsSold: 8500 },
  { id: '2', event: 'New Years Eve Concert', venue: 'Madison Square Garden', date: 'Dec 31, 2024', fee: 150000, status: 'pending' },
  { id: '3', event: 'Fall Tour - Chicago', venue: 'United Center', date: 'Oct 15, 2024', fee: 85000, status: 'completed', ticketsSold: 12000 },
];

export interface DemoSponsorship {
  id: string;
  event: string;
  tier: string;
  value: number;
  status: 'active' | 'pending' | 'completed';
  deliverables: number;
  completedDeliverables: number;
}

export const DEMO_SPONSORSHIPS: DemoSponsorship[] = [
  { id: '1', event: 'Summer Music Festival 2024', tier: 'Platinum', value: 250000, status: 'active', deliverables: 12, completedDeliverables: 8 },
  { id: '2', event: 'Corporate Gala', tier: 'Gold', value: 75000, status: 'pending', deliverables: 6, completedDeliverables: 0 },
  { id: '3', event: 'Concert Series', tier: 'Silver', value: 50000, status: 'completed', deliverables: 8, completedDeliverables: 8 },
];

export interface DemoInvestment {
  id: string;
  fund: string;
  amount: number;
  ownership: number;
  status: 'active' | 'pending';
  returns: number;
  lastDistribution: string;
}

export const DEMO_INVESTMENTS: DemoInvestment[] = [
  { id: '1', fund: 'GHXSTSHIP Growth Fund I', amount: 500000, ownership: 2.5, status: 'active', returns: 45000, lastDistribution: 'Q3 2024' },
  { id: '2', fund: 'Live Events Opportunity Fund', amount: 250000, ownership: 1.2, status: 'active', returns: 18500, lastDistribution: 'Q3 2024' },
  { id: '3', fund: 'Venue Acquisition Fund II', amount: 100000, ownership: 0.5, status: 'pending', returns: 0, lastDistribution: '-' },
];

// =============================================================================
// CRM STAKEHOLDERS (for crm/relationships page)
// =============================================================================

export interface DemoStakeholder {
  id: string;
  name: string;
  role: string;
  company: string;
  influence: 'High' | 'Medium' | 'Low';
  sentiment: 'Champion' | 'Supporter' | 'Neutral' | 'Skeptic' | 'Blocker';
  decisionMaker: boolean;
  [key: string]: unknown;
}

export const DEMO_STAKEHOLDERS: DemoStakeholder[] = [
  { id: 'STK-001', name: 'Sarah Johnson', role: 'VP Marketing', company: 'Acme Corp', influence: 'High', sentiment: 'Champion', decisionMaker: true },
  { id: 'STK-002', name: 'John Smith', role: 'Director Events', company: 'Acme Corp', influence: 'Medium', sentiment: 'Supporter', decisionMaker: false },
  { id: 'STK-003', name: 'Robert Brown', role: 'CFO', company: 'Acme Corp', influence: 'High', sentiment: 'Neutral', decisionMaker: true },
  { id: 'STK-004', name: 'Emily Davis', role: 'Procurement', company: 'Acme Corp', influence: 'Low', sentiment: 'Skeptic', decisionMaker: false },
];

// =============================================================================
// DASHBOARD PROJECTS (for dashboard page)
// =============================================================================

export interface DemoDisplayProject {
  id: string;
  name: string;
  client_id?: string;
  status: string;
  budget?: number;
  actual_cost?: number;
  health?: string;
  manager_id?: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  [key: string]: unknown;
}

export const DEMO_DISPLAY_PROJECTS: DemoDisplayProject[] = [
  { id: 'PRJ-2024-001', name: 'Ultra Music Festival 2025', client_id: 'Ultra Worldwide', status: 'In Progress', budget: 2500000, actual_cost: 1847520, health: 'On Track', manager_id: 'Sarah Martinez', start_date: '2024-10-01', end_date: '2025-03-30', progress: 68 },
  { id: 'PRJ-2024-002', name: 'Formula 1 Miami GP', client_id: 'Formula One Group', status: 'Planning', budget: 3200000, actual_cost: 456000, health: 'At Risk', manager_id: 'Michael Chen', start_date: '2024-11-15', end_date: '2025-05-04', progress: 35 },
  { id: 'PRJ-2024-003', name: 'Art Basel Miami Beach', client_id: 'MCH Group', status: 'Completed', budget: 950000, actual_cost: 925400, health: 'Completed', manager_id: 'Elena Rodriguez', start_date: '2024-08-01', end_date: '2024-12-08', progress: 100 },
];

// =============================================================================
// VENDOR AUDITS (for procurement/vendor-audits page)
// =============================================================================

export interface DemoVendorAudit {
  id: string;
  vendorId: string;
  vendorName: string;
  category: string;
  auditType: 'Quality' | 'Financial' | 'Compliance' | 'Performance';
  scheduledDate: string;
  completedDate?: string;
  auditor: string;
  score?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  findings?: string[];
  [key: string]: unknown;
}

export const DEMO_VENDOR_AUDITS: DemoVendorAudit[] = [
  { id: 'AUD-001', vendorId: 'VND-101', vendorName: 'PRG', category: 'Audio Equipment', auditType: 'Quality', scheduledDate: '2024-12-15', auditor: 'John Smith', status: 'Scheduled' },
  { id: 'AUD-002', vendorId: 'VND-102', vendorName: '4Wall Entertainment', category: 'Lighting', auditType: 'Performance', scheduledDate: '2024-11-20', completedDate: '2024-11-20', auditor: 'Sarah Johnson', score: 92, status: 'Completed', findings: ['Excellent delivery times', 'Minor documentation gaps'] },
  { id: 'AUD-003', vendorId: 'VND-103', vendorName: 'Stageline', category: 'Staging', auditType: 'Compliance', scheduledDate: '2024-11-10', auditor: 'Mike Davis', status: 'Overdue' },
  { id: 'AUD-004', vendorId: 'VND-104', vendorName: 'Meyer Sound', category: 'Audio Equipment', auditType: 'Financial', scheduledDate: '2024-11-25', auditor: 'Emily Chen', status: 'In Progress' },
  { id: 'AUD-005', vendorId: 'VND-105', vendorName: 'Robe Lighting', category: 'Lighting', auditType: 'Quality', scheduledDate: '2024-10-15', completedDate: '2024-10-18', auditor: 'Chris Brown', score: 88, status: 'Completed', findings: ['Good product quality', 'Lead time improvements needed'] },
];

// =============================================================================
// EMERGENCY PROCUREMENT (for procurement/emergency page)
// =============================================================================

export interface DemoEmergencyProcurement {
  id: string;
  requestor: string;
  department: string;
  description: string;
  amount: number;
  urgency: 'Critical' | 'High' | 'Medium';
  reason: string;
  vendor?: string;
  requestDate: string;
  approvedDate?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approver?: string;
  [key: string]: unknown;
}

export const DEMO_EMERGENCY_PROCUREMENTS: DemoEmergencyProcurement[] = [
  { id: 'EMG-001', requestor: 'John Smith', department: 'Production', description: 'Replacement audio console - DiGiCo SD12', amount: 45000, urgency: 'Critical', reason: 'Main console failed during load-in', vendor: 'PRG', requestDate: '2024-11-24', approvedDate: '2024-11-24', status: 'Completed', approver: 'Sarah Johnson' },
  { id: 'EMG-002', requestor: 'Mike Davis', department: 'Lighting', description: 'Emergency lighting fixtures (12x Robe MegaPointe)', amount: 28000, urgency: 'High', reason: 'Client added last-minute production elements', requestDate: '2024-11-25', status: 'Pending' },
  { id: 'EMG-003', requestor: 'Emily Chen', department: 'Video', description: 'LED wall panels replacement (20 panels)', amount: 15000, urgency: 'Critical', reason: 'Damaged panels discovered during setup', vendor: 'ROE Visual', requestDate: '2024-11-25', approvedDate: '2024-11-25', status: 'Approved', approver: 'Robert Chen' },
];

// =============================================================================
// PURCHASE ORDERS (for procurement page)
// =============================================================================

export interface DemoPurchaseOrder {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'approved';
  requestedBy: string;
  dueDate: string;
  category: string;
  [key: string]: unknown;
}

export const DEMO_PURCHASE_ORDERS: DemoPurchaseOrder[] = [
  { id: 'PO-2024-001', vendor: 'ProAV Systems', description: 'LED Wall Panels - 100 units', amount: 125000, status: 'active', requestedBy: 'John Smith', dueDate: '2024-12-15', category: 'Equipment' },
  { id: 'PO-2024-002', vendor: 'Elite Staging Co', description: 'Stage Platforms and Risers', amount: 45000, status: 'pending', requestedBy: 'Sarah Johnson', dueDate: '2024-12-20', category: 'Staging' },
  { id: 'PO-2024-003', vendor: 'Lumina Lighting', description: 'Moving Head Fixtures - 50 units', amount: 89000, status: 'completed', requestedBy: 'Mike Peters', dueDate: '2024-11-30', category: 'Lighting' },
];

// =============================================================================
// PROCUREMENT CATEGORIES (for procurement/categories page)
// =============================================================================

export interface DemoProcurementCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  spend: number;
  vendors: number;
  status: 'Active' | 'Inactive';
  [key: string]: unknown;
}

export interface DemoSourcingStrategy {
  id: string;
  categoryId: string;
  strategy: 'Single Source' | 'Multi Source' | 'Competitive Bid' | 'Preferred Vendor';
  rationale: string;
  reviewDate: string;
  [key: string]: unknown;
}

export const DEMO_PROCUREMENT_CATEGORIES: DemoProcurementCategory[] = [
  { id: 'CAT-001', name: 'Audio Equipment', description: 'PA systems, microphones, mixing consoles', spend: 1250000, vendors: 12, status: 'Active' },
  { id: 'CAT-002', name: 'Lighting', description: 'Moving heads, LED fixtures, control systems', spend: 890000, vendors: 8, status: 'Active' },
  { id: 'CAT-003', name: 'Video', description: 'LED walls, projectors, media servers', spend: 1450000, vendors: 6, status: 'Active' },
  { id: 'CAT-004', name: 'Staging', description: 'Platforms, risers, truss systems', spend: 650000, vendors: 5, status: 'Active' },
];

export const DEMO_SOURCING_STRATEGIES: DemoSourcingStrategy[] = [
  { id: 'STR-001', categoryId: 'CAT-001', strategy: 'Multi Source', rationale: 'Maintain competitive pricing and availability', reviewDate: '2025-01-15' },
  { id: 'STR-002', categoryId: 'CAT-002', strategy: 'Preferred Vendor', rationale: 'Quality consistency and technical support', reviewDate: '2025-02-01' },
  { id: 'STR-003', categoryId: 'CAT-003', strategy: 'Single Source', rationale: 'Specialized equipment requirements', reviewDate: '2025-01-30' },
];

// =============================================================================
// LOGISTICS SHIPMENTS (for procurement/logistics page)
// =============================================================================

export interface DemoShipment {
  id: string;
  poNumber: string;
  vendor: string;
  origin: string;
  destination: string;
  carrier: string;
  trackingNumber?: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Delayed';
  estimatedDelivery: string;
  actualDelivery?: string;
  items: number;
  weight?: string;
  [key: string]: unknown;
}

export const DEMO_SHIPMENTS: DemoShipment[] = [
  { id: 'SHP-001', poNumber: 'PO-2024-001', vendor: 'ProAV Systems', origin: 'Los Angeles, CA', destination: 'Miami, FL', carrier: 'FedEx Freight', trackingNumber: '123456789', status: 'In Transit', estimatedDelivery: '2024-12-10', items: 100, weight: '2,500 lbs' },
  { id: 'SHP-002', poNumber: 'PO-2024-002', vendor: 'Elite Staging Co', origin: 'Nashville, TN', destination: 'Miami, FL', carrier: 'XPO Logistics', status: 'Pending', estimatedDelivery: '2024-12-18', items: 25 },
  { id: 'SHP-003', poNumber: 'PO-2024-003', vendor: 'Lumina Lighting', origin: 'Chicago, IL', destination: 'Miami, FL', carrier: 'Old Dominion', trackingNumber: '987654321', status: 'Delivered', estimatedDelivery: '2024-11-28', actualDelivery: '2024-11-27', items: 50, weight: '1,200 lbs' },
];

// =============================================================================
// VENDOR SELECTION (for procurement/vendor-selection page)
// =============================================================================

export interface DemoVendorSelection {
  id: string;
  rfpId: string;
  rfpTitle: string;
  category: string;
  vendors: { 
    id?: string;
    vendorName?: string;
    name: string; 
    bidAmount?: number;
    price: number; 
    technicalScore?: number;
    priceScore?: number;
    overallScore?: number;
    score: number; 
    rank?: number;
    recommendation?: string;
    status: string;
  }[];
  evaluationCriteria?: { name: string; weight: number; description: string }[];
  approvers?: { id: string; name: string; role: string; status: string; approvedAt?: string; comments?: string }[];
  dueDate: string;
  createdAt?: string;
  status: 'Open' | 'Evaluating' | 'Awarded' | 'Closed' | 'Pending Approval' | 'Approved' | 'Rejected';
  selectedVendor?: string;
  [key: string]: unknown;
}

export const DEMO_VENDOR_SELECTIONS: DemoVendorSelection[] = [
  { 
    id: 'SEL-001', 
    rfpId: 'RFP-2024-015', 
    rfpTitle: 'Audio Equipment Rental - Summer Festival', 
    category: 'Audio', 
    vendors: [
      { id: 'V1', vendorName: 'PRG', name: 'PRG', bidAmount: 125000, price: 125000, technicalScore: 92, priceScore: 85, overallScore: 89, score: 92, rank: 1, recommendation: 'Recommended', status: 'Submitted' }, 
      { id: 'V2', vendorName: 'Clair Global', name: 'Clair Global', bidAmount: 135000, price: 135000, technicalScore: 88, priceScore: 80, overallScore: 84, score: 88, rank: 2, recommendation: 'Acceptable', status: 'Submitted' }
    ], 
    evaluationCriteria: [
      { name: 'Technical Capability', weight: 40, description: 'Equipment quality and technical expertise' },
      { name: 'Price', weight: 30, description: 'Total cost and value' },
      { name: 'Experience', weight: 30, description: 'Past performance and references' }
    ],
    approvers: [
      { id: 'A1', name: 'John Smith', role: 'Procurement Manager', status: 'Pending' },
      { id: 'A2', name: 'Sarah Johnson', role: 'Finance Director', status: 'Pending' }
    ],
    dueDate: '2024-12-01', 
    createdAt: '2024-11-15',
    status: 'Evaluating' 
  },
  { 
    id: 'SEL-002', 
    rfpId: 'RFP-2024-016', 
    rfpTitle: 'LED Wall Installation', 
    category: 'Video', 
    vendors: [
      { id: 'V3', vendorName: 'ROE Visual', name: 'ROE Visual', bidAmount: 180000, price: 180000, technicalScore: 95, priceScore: 88, overallScore: 92, score: 95, rank: 1, recommendation: 'Recommended', status: 'Submitted' }
    ], 
    evaluationCriteria: [
      { name: 'Technical Capability', weight: 40, description: 'Equipment quality and technical expertise' },
      { name: 'Price', weight: 30, description: 'Total cost and value' },
      { name: 'Experience', weight: 30, description: 'Past performance and references' }
    ],
    approvers: [
      { id: 'A1', name: 'John Smith', role: 'Procurement Manager', status: 'Approved', approvedAt: '2024-11-20' },
      { id: 'A2', name: 'Sarah Johnson', role: 'Finance Director', status: 'Approved', approvedAt: '2024-11-21' }
    ],
    dueDate: '2024-11-25', 
    createdAt: '2024-11-10',
    status: 'Awarded', 
    selectedVendor: 'ROE Visual' 
  },
];

// =============================================================================
// BUDGETS (for budgets page)
// =============================================================================

export interface DemoBudget {
  id: string;
  name: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  status: 'on-track' | 'over' | 'under';
  period?: string;
  [key: string]: unknown;
}

export const DEMO_BUDGETS: DemoBudget[] = [
  { id: '1', name: 'Ultra Music Festival 2025', category: 'Events', budgeted: 2500000, actual: 2350000, variance: 150000, status: 'on-track' },
  { id: '2', name: 'Operations & Overhead', category: 'Operations', budgeted: 450000, actual: 475000, variance: -25000, status: 'over' },
  { id: '3', name: 'Marketing & Sales', category: 'Marketing', budgeted: 320000, actual: 298000, variance: 22000, status: 'on-track' },
  { id: '4', name: 'Technology & Infrastructure', category: 'Technology', budgeted: 180000, actual: 195000, variance: -15000, status: 'over' },
];

// =============================================================================
// PORTFOLIO PROJECTS (for portfolio page)
// =============================================================================

export interface DemoPortfolioProject {
  id: string;
  name: string;
  client: string;
  type: string;
  date: string;
  location: string;
  budget: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  highlights: string[];
  metrics: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; role: string };
  [key: string]: unknown;
}

export const DEMO_PORTFOLIO_PROJECTS: DemoPortfolioProject[] = [
  { id: 'PRT-001', name: 'Summer Music Festival 2024', client: 'Festival Productions', type: 'Festival', date: '2024-07-15', location: 'Miami, FL', budget: 2500000, status: 'Completed', highlights: ['50,000+ attendees', '3 stages', '48 artists'], metrics: [{ label: 'Attendance', value: '52,000' }, { label: 'Revenue', value: '$4.2M' }], testimonial: { quote: 'Exceptional production quality', author: 'John Smith', role: 'Festival Director' } },
  { id: 'PRT-002', name: 'Corporate Gala 2024', client: 'Tech Corp', type: 'Corporate', date: '2024-09-20', location: 'San Francisco, CA', budget: 450000, status: 'Completed', highlights: ['500 VIP guests', 'Live entertainment', 'Custom staging'], metrics: [{ label: 'Guest Satisfaction', value: '98%' }] },
];

// =============================================================================
// MARKETING ATTRIBUTION (for marketing/attribution page)
// =============================================================================

export interface DemoMarketingSource {
  id: string;
  name: string;
  channel: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  [key: string]: unknown;
}

export interface DemoMarketingCampaign {
  id: string;
  name: string;
  source: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  status: 'Active' | 'Completed' | 'Paused';
  [key: string]: unknown;
}

export const DEMO_MARKETING_SOURCES: DemoMarketingSource[] = [
  { id: 'SRC-001', name: 'Google Ads', channel: 'Paid Search', leads: 245, conversions: 32, revenue: 156000, cost: 12500, roi: 1148 },
  { id: 'SRC-002', name: 'LinkedIn', channel: 'Social', leads: 189, conversions: 28, revenue: 142000, cost: 8900, roi: 1496 },
  { id: 'SRC-003', name: 'Email Marketing', channel: 'Email', leads: 312, conversions: 45, revenue: 198000, cost: 2400, roi: 8150 },
  { id: 'SRC-004', name: 'Referrals', channel: 'Organic', leads: 156, conversions: 38, revenue: 185000, cost: 0, roi: 0 },
  { id: 'SRC-005', name: 'Trade Shows', channel: 'Events', leads: 89, conversions: 15, revenue: 78000, cost: 25000, roi: 212 },
];

export const DEMO_MARKETING_CAMPAIGNS: DemoMarketingCampaign[] = [
  { id: 'CMP-001', name: 'Q4 Lead Gen', source: 'Google Ads', startDate: '2024-10-01', endDate: '2024-12-31', budget: 15000, spent: 8500, leads: 145, conversions: 18, status: 'Active' },
  { id: 'CMP-002', name: 'Festival Season Push', source: 'LinkedIn', startDate: '2024-11-01', endDate: '2024-11-30', budget: 5000, spent: 3200, leads: 89, conversions: 12, status: 'Active' },
  { id: 'CMP-003', name: 'Newsletter Promo', source: 'Email Marketing', startDate: '2024-11-15', endDate: '2024-11-22', budget: 500, spent: 500, leads: 67, conversions: 8, status: 'Completed' },
];

// =============================================================================
// FINANCE - COMMISSIONS (for finance/commissions page)
// =============================================================================

export interface DemoCommissionRecord {
  id: string;
  salesRep: string;
  dealId: string;
  dealName: string;
  client: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'Pending' | 'Approved' | 'Paid';
  closeDate: string;
  paymentDate?: string;
  [key: string]: unknown;
}

export const DEMO_COMMISSION_RECORDS: DemoCommissionRecord[] = [
  { id: 'COM-001', salesRep: 'John Smith', dealId: 'DEAL-156', dealName: 'TechCorp Annual Conference', client: 'TechCorp Events', dealValue: 125000, commissionRate: 12, commissionAmount: 15000, status: 'Approved', closeDate: '2024-11-15' },
  { id: 'COM-002', salesRep: 'Jane Doe', dealId: 'DEAL-157', dealName: 'Festival Productions Partnership', client: 'Festival Productions', dealValue: 85000, commissionRate: 15, commissionAmount: 12750, status: 'Pending', closeDate: '2024-11-20' },
  { id: 'COM-003', salesRep: 'John Smith', dealId: 'DEAL-158', dealName: 'Corporate Events Renewal', client: 'Corporate Events Inc', dealValue: 45000, commissionRate: 5, commissionAmount: 2250, status: 'Paid', closeDate: '2024-11-01', paymentDate: '2024-11-15' },
];

// =============================================================================
// FINANCE - ACCOUNTS RECEIVABLE (for finance/accounts-receivable page)
// =============================================================================

export interface DemoARInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'Sent' | 'Partial' | 'Paid' | 'Overdue';
  paidAmount: number;
  project: string;
  daysPastDue?: number;
  [key: string]: unknown;
}

export const DEMO_AR_INVOICES: DemoARInvoice[] = [
  { id: 'INV-001', invoiceNumber: 'INV-2024-0156', client: 'TechCorp Events', clientEmail: 'ap@techcorp.com', amount: 45000, dueDate: '2024-11-15', issueDate: '2024-10-15', status: 'Overdue', paidAmount: 0, project: 'Annual Conference', daysPastDue: 9 },
  { id: 'INV-002', invoiceNumber: 'INV-2024-0157', client: 'Festival Productions', clientEmail: 'billing@festprod.com', amount: 125000, dueDate: '2024-11-30', issueDate: '2024-11-01', status: 'Partial', paidAmount: 62500, project: 'Summer Fest 2024' },
  { id: 'INV-003', invoiceNumber: 'INV-2024-0158', client: 'Corporate Events Inc', clientEmail: 'accounts@corpevents.com', amount: 28500, dueDate: '2024-12-01', issueDate: '2024-11-01', status: 'Sent', paidAmount: 0, project: 'Holiday Gala' },
];

// =============================================================================
// FINANCE - BANK RECONCILIATION (for finance/bank-reconciliation page)
// =============================================================================

export interface DemoBankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  status: 'Matched' | 'Unmatched' | 'Pending';
  matchedTo?: string;
  bankAccount: string;
  [key: string]: unknown;
}

export const DEMO_BANK_TRANSACTIONS: DemoBankTransaction[] = [
  { id: 'BNK-001', date: '2024-11-25', description: 'Wire Transfer - Client ABC', amount: 45000, type: 'Credit', status: 'Matched', matchedTo: 'INV-2024-089', bankAccount: 'Operating' },
  { id: 'BNK-002', date: '2024-11-25', description: 'ACH Payment - Vendor XYZ', amount: -12500, type: 'Debit', status: 'Matched', matchedTo: 'PO-2024-156', bankAccount: 'Operating' },
  { id: 'BNK-003', date: '2024-11-24', description: 'Check #4521', amount: -3200, type: 'Debit', status: 'Unmatched', bankAccount: 'Operating' },
];

// =============================================================================
// DOCUMENTS (for documents page)
// =============================================================================

export interface DemoDocument {
  id: string;
  name: string;
  type: string;
  folder: string;
  version: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: string;
  [key: string]: unknown;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  { id: '1', name: 'Ultra Music Festival - Master Contract 2025', type: 'Contract', folder: 'Contracts', version: '3.2', size: '2.4 MB', uploadedBy: 'Sarah Johnson', uploadedAt: '2024-11-20', status: 'active' },
  { id: '2', name: 'General Liability Insurance Policy', type: 'Insurance', folder: 'Compliance', version: '1.0', size: '1.1 MB', uploadedBy: 'Mike Peters', uploadedAt: '2024-11-15', status: 'active' },
  { id: '3', name: 'Q4 2024 Financial Statements', type: 'Financial', folder: 'Finance', version: '2.1', size: '856 KB', uploadedBy: 'John Doe', uploadedAt: '2024-11-18', status: 'active' },
];

// =============================================================================
// ASSETS (for assets page)
// =============================================================================

export interface DemoAsset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  value: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  lastMaintenance: string;
  nextMaintenance: string;
  utilization: number;
  projects: number;
  [key: string]: unknown;
}

export const DEMO_ASSETS: DemoAsset[] = [
  { id: 'AST-001', name: 'Meyer Sound LEO Family Line Array', category: 'Audio', location: 'Warehouse A - Bay 3', status: 'Available', value: 285000, condition: 'Excellent', lastMaintenance: '2024-10-15', nextMaintenance: '2025-01-15', utilization: 0.82, projects: 47 },
  { id: 'AST-002', name: 'Robe MegaPointe Lighting Fixtures (24x)', category: 'Lighting', location: 'Warehouse A - Bay 1', status: 'In Use', value: 156000, condition: 'Good', lastMaintenance: '2024-09-20', nextMaintenance: '2024-12-20', utilization: 0.91, projects: 52 },
  { id: 'AST-003', name: 'disguise gx 2c Media Server', category: 'Video', location: 'Tech Room 2', status: 'Maintenance', value: 48000, condition: 'Fair', lastMaintenance: '2024-11-18', nextMaintenance: '2024-12-01', utilization: 0.75, projects: 38 },
];

// =============================================================================
// ASSET MAINTENANCE (for assets/maintenance page)
// =============================================================================

export interface DemoMaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  type: 'Preventive' | 'Corrective' | 'Emergency';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  completedDate?: string;
  description: string;
  technician: string;
  vendor?: string;
  cost?: number;
  laborHours?: number;
  notes?: string;
  nextDue?: string;
  [key: string]: unknown;
}

export const DEMO_MAINTENANCE_RECORDS: DemoMaintenanceRecord[] = [
  { id: 'MNT-001', assetId: 'AST-001', assetName: 'Meyer Sound LEO Family Line Array', category: 'Audio', type: 'Preventive', status: 'Scheduled', priority: 'Medium', scheduledDate: '2025-01-15', description: 'Quarterly speaker driver inspection', technician: 'John Martinez', nextDue: '2025-04-15' },
  { id: 'MNT-002', assetId: 'AST-002', assetName: 'Robe MegaPointe Lighting Fixtures', category: 'Lighting', type: 'Corrective', status: 'In Progress', priority: 'High', scheduledDate: '2024-11-20', description: 'Replace faulty gobo wheel motor', technician: 'Sarah Chen', vendor: 'Robe Lighting', cost: 1250, laborHours: 4 },
  { id: 'MNT-003', assetId: 'AST-003', assetName: 'disguise gx 2c Media Server', category: 'Video', type: 'Preventive', status: 'Completed', priority: 'Medium', scheduledDate: '2024-11-18', completedDate: '2024-11-18', description: 'Annual system diagnostics', technician: 'Mike Thompson', cost: 450, laborHours: 3, notes: 'All tests passed', nextDue: '2025-11-18' },
];

// =============================================================================
// ASSET SCAN HISTORY (for assets/scan page)
// =============================================================================

export interface DemoScanHistory {
  id: string;
  barcode: string;
  asset_name: string;
  action: 'check_in' | 'check_out' | 'inventory' | 'transfer';
  scanned_by: string;
  timestamp: string;
  location: string;
  [key: string]: unknown;
}

export const DEMO_SCAN_HISTORY: DemoScanHistory[] = [
  { id: 'SCN-001', barcode: 'AST-001-LED', asset_name: 'LED Wall Panel Set A', action: 'check_out', scanned_by: 'John Martinez', timestamp: '2024-11-24T14:30:00Z', location: 'Warehouse A' },
  { id: 'SCN-002', barcode: 'AST-002-AUD', asset_name: 'Meyer Sound Line Array', action: 'check_in', scanned_by: 'Sarah Chen', timestamp: '2024-11-24T12:15:00Z', location: 'Venue - Main Stage' },
  { id: 'SCN-003', barcode: 'AST-003-LGT', asset_name: 'Lighting Console grandMA3', action: 'inventory', scanned_by: 'Mike Thompson', timestamp: '2024-11-24T10:00:00Z', location: 'Warehouse B' },
];

// =============================================================================
// SERIALIZED COMPONENTS (for assets/serialized page)
// =============================================================================

export interface DemoSerializedComponent {
  id: string;
  serialNumber: string;
  parentAssetId: string;
  parentAssetName: string;
  componentType: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: 'Active' | 'Replaced' | 'Retired';
  location: string;
  notes?: string;
  [key: string]: unknown;
}

export const DEMO_SERIALIZED_COMPONENTS: DemoSerializedComponent[] = [
  { id: 'COMP-001', serialNumber: 'SN-OSR-470W-2024-001', parentAssetId: 'AST-001', parentAssetName: 'Meyer Sound LEO Family Line Array', componentType: 'Speaker Driver', manufacturer: 'Meyer Sound', model: 'LEO-M', purchaseDate: '2024-01-15', warrantyExpiry: '2027-01-15', status: 'Active', location: 'Warehouse A - Bay 3' },
  { id: 'COMP-002', serialNumber: 'SN-OSR-470W-2024-002', parentAssetId: 'AST-001', parentAssetName: 'Meyer Sound LEO Family Line Array', componentType: 'Amplifier Module', manufacturer: 'Meyer Sound', model: 'LEO-AMP', purchaseDate: '2024-01-15', warrantyExpiry: '2027-01-15', status: 'Active', location: 'Warehouse A - Bay 3' },
];

// =============================================================================
// ASSET SPECIFICATIONS (for assets/specifications page)
// =============================================================================

export interface DemoAssetSpec {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  specifications: { key: string; value: string }[];
  documents: { name: string; type: string; size: string }[];
  [key: string]: unknown;
}

export const DEMO_ASSET_SPECS: DemoAssetSpec[] = [
  { id: 'SPEC-001', name: 'Robe MegaPointe', category: 'Lighting', manufacturer: 'Robe', model: 'MegaPointe', specifications: [{ key: 'Power', value: '470W' }, { key: 'Lumens', value: '24,000' }, { key: 'Weight', value: '35 kg' }], documents: [{ name: 'User Manual', type: 'PDF', size: '12.5 MB' }] },
];

// =============================================================================
// ANALYTICS DASHBOARDS (for analytics/dashboards page)
// =============================================================================

export interface DemoAnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  type: string;
  lastViewed: string;
  views: number;
  [key: string]: unknown;
}

export const DEMO_ANALYTICS_DASHBOARDS: DemoAnalyticsDashboard[] = [
  { id: '1', name: 'Executive Overview', description: 'High-level KPIs and business metrics', type: 'Executive', lastViewed: '2024-11-25', views: 245 },
  { id: '2', name: 'Sales Pipeline', description: 'Deal tracking and revenue forecasting', type: 'Sales', lastViewed: '2024-11-24', views: 189 },
  { id: '3', name: 'Operations Dashboard', description: 'Project status and resource utilization', type: 'Operations', lastViewed: '2024-11-25', views: 156 },
];

// =============================================================================
// ANALYTICS REPORTS (for analytics/reports page)
// =============================================================================

export interface DemoAnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: string;
  lastRun: string;
  schedule: string;
  format: 'pdf' | 'excel' | 'csv';
  [key: string]: unknown;
}

export const DEMO_ANALYTICS_REPORTS: DemoAnalyticsReport[] = [
  { id: '1', name: 'Monthly Revenue Summary', description: 'Revenue breakdown by project and client', type: 'Financial', lastRun: '2024-11-01', schedule: 'Monthly', format: 'pdf' },
  { id: '2', name: 'Project Status Report', description: 'Current status of all active projects', type: 'Operations', lastRun: '2024-11-25', schedule: 'Weekly', format: 'excel' },
];

// =============================================================================
// SCHEDULED REPORTS (for reports/scheduled page)
// =============================================================================

export interface DemoScheduledReport {
  id: string;
  name: string;
  type: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  nextRun: string;
  lastRun: string;
  recipients: string[];
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'Active' | 'Paused' | 'Error';
  description?: string;
  [key: string]: unknown;
}

export const DEMO_SCHEDULED_REPORTS: DemoScheduledReport[] = [
  { id: 'RPT-001', name: 'Weekly Revenue Summary', type: 'Financial', frequency: 'Weekly', nextRun: '2024-12-02 08:00', lastRun: '2024-11-25 08:00', recipients: ['cfo@company.com', 'finance@company.com'], format: 'PDF', status: 'Active', description: 'Weekly revenue breakdown by project and client' },
  { id: 'RPT-002', name: 'Daily Operations Dashboard', type: 'Operations', frequency: 'Daily', nextRun: '2024-11-26 06:00', lastRun: '2024-11-25 06:00', recipients: ['ops@company.com'], format: 'PDF', status: 'Active', description: 'Daily operational metrics and KPIs' },
  { id: 'RPT-003', name: 'Monthly Sales Pipeline', type: 'Sales', frequency: 'Monthly', nextRun: '2024-12-01 09:00', lastRun: '2024-11-01 09:00', recipients: ['sales@company.com', 'vp-sales@company.com'], format: 'Excel', status: 'Active', description: 'Monthly sales pipeline and forecast' },
];

// =============================================================================
// PROCUREMENT CATEGORY MANAGEMENT (for procurement/categories page)
// =============================================================================

export interface DemoProcurementCategoryFull {
  id: string;
  name: string;
  parentCategory?: string;
  spend: number;
  vendors: number;
  strategy: 'Strategic' | 'Leverage' | 'Bottleneck' | 'Non-Critical';
  owner: string;
  lastReview: string;
  [key: string]: unknown;
}

export interface DemoProcurementSourcingStrategy {
  id: string;
  categoryId: string;
  categoryName: string;
  objective: string;
  approach: string;
  targetSavings: number;
  status: 'Draft' | 'Active' | 'Under Review';
  initiatives: string[];
  [key: string]: unknown;
}

export const DEMO_PROCUREMENT_CATEGORIES_FULL: DemoProcurementCategoryFull[] = [
  { id: 'CAT-001', name: 'Audio Equipment', parentCategory: 'Production Equipment', spend: 1250000, vendors: 12, strategy: 'Strategic', owner: 'John Smith', lastReview: '2024-10-15' },
  { id: 'CAT-002', name: 'Lighting Equipment', parentCategory: 'Production Equipment', spend: 980000, vendors: 8, strategy: 'Strategic', owner: 'Sarah Johnson', lastReview: '2024-11-01' },
  { id: 'CAT-003', name: 'Video Equipment', parentCategory: 'Production Equipment', spend: 750000, vendors: 6, strategy: 'Leverage', owner: 'Mike Davis', lastReview: '2024-09-20' },
  { id: 'CAT-004', name: 'Staging & Rigging', parentCategory: 'Production Equipment', spend: 620000, vendors: 5, strategy: 'Bottleneck', owner: 'Emily Chen', lastReview: '2024-08-15' },
  { id: 'CAT-005', name: 'Transportation', spend: 450000, vendors: 15, strategy: 'Leverage', owner: 'Chris Brown', lastReview: '2024-10-01' },
  { id: 'CAT-006', name: 'Office Supplies', spend: 85000, vendors: 3, strategy: 'Non-Critical', owner: 'Amy Wilson', lastReview: '2024-07-01' },
];

export const DEMO_PROCUREMENT_SOURCING_STRATEGIES: DemoProcurementSourcingStrategy[] = [
  { id: 'STR-001', categoryId: 'CAT-001', categoryName: 'Audio Equipment', objective: 'Consolidate vendors and negotiate volume discounts', approach: 'Preferred vendor program with 2-3 strategic partners', targetSavings: 15, status: 'Active', initiatives: ['RFP for L-Acoustics partnership', 'Volume commitment negotiation', 'Rental vs buy analysis'] },
  { id: 'STR-002', categoryId: 'CAT-002', categoryName: 'Lighting Equipment', objective: 'Reduce lead times and improve availability', approach: 'Consignment inventory with key suppliers', targetSavings: 10, status: 'Active', initiatives: ['Consignment agreement with Robe', 'Safety stock optimization'] },
];

// =============================================================================
// LOGISTICS SHIPMENTS FULL (for procurement/logistics page)
// =============================================================================

export interface DemoLogisticsShipment {
  id: string;
  projectId: string;
  projectName: string;
  origin: string;
  destination: string;
  carrier: string;
  trackingNumber?: string;
  shipDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Delayed';
  items: number;
  weight: number;
  cost: number;
  [key: string]: unknown;
}

export const DEMO_LOGISTICS_SHIPMENTS: DemoLogisticsShipment[] = [
  { id: 'SHP-001', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Los Angeles, CA', destination: 'Las Vegas, NV', carrier: 'XPO Logistics', trackingNumber: 'XPO123456789', shipDate: '2024-11-22', expectedDelivery: '2024-11-24', status: 'In Transit', items: 45, weight: 12500, cost: 3500 },
  { id: 'SHP-002', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Nashville, TN', destination: 'Las Vegas, NV', carrier: 'Old Dominion', trackingNumber: 'OD987654321', shipDate: '2024-11-21', expectedDelivery: '2024-11-25', status: 'In Transit', items: 28, weight: 8200, cost: 4200 },
  { id: 'SHP-003', projectId: 'PROJ-090', projectName: 'Corporate Gala', origin: 'New York, NY', destination: 'Chicago, IL', carrier: 'FedEx Freight', shipDate: '2024-11-28', expectedDelivery: '2024-11-30', status: 'Scheduled', items: 15, weight: 3500, cost: 1800 },
  { id: 'SHP-004', projectId: 'PROJ-088', projectName: 'Fall Festival', origin: 'Atlanta, GA', destination: 'Miami, FL', carrier: 'Estes Express', trackingNumber: 'EST456789012', shipDate: '2024-11-18', expectedDelivery: '2024-11-20', actualDelivery: '2024-11-20', status: 'Delivered', items: 32, weight: 9800, cost: 2900 },
  { id: 'SHP-005', projectId: 'PROJ-089', projectName: 'Summer Fest 2024', origin: 'Dallas, TX', destination: 'Las Vegas, NV', carrier: 'YRC Freight', trackingNumber: 'YRC789012345', shipDate: '2024-11-20', expectedDelivery: '2024-11-23', status: 'Delayed', items: 22, weight: 6500, cost: 2800 },
];

