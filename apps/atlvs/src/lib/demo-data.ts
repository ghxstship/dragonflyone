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
// CONTACTS & RELATIONSHIPS (3NF Compliant - legend_people + people_profile_contact)
// =============================================================================

// Base person interface matching legend_people schema
export interface DemoLegendPerson {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  preferred_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  avatar_url?: string;
  bio?: string;
  title?: string;
  platform_user_id?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  tags: string[];
  metadata: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Contact profile extension matching people_profile_contact schema
export interface DemoContactProfile {
  id: string;
  person_id: string;
  contact_type?: string;
  company?: string;
  job_title?: string;
  department?: string;
  source?: string;
  lead_status?: string;
  lead_score?: number;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  preferred_contact_method?: string;
  do_not_contact: boolean;
  subscribed_to_newsletter: boolean;
  subscribed_to_marketing: boolean;
  linkedin_url?: string;
  twitter_handle?: string;
  lifetime_value?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Combined view for convenience (what API returns with joins)
export interface DemoContact {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  title?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  tags: string[];
  contact_profile?: DemoContactProfile;
}

// Demo organization for FK references
export const DEMO_ORGANIZATION_ID = 'org-demo-001';

// Base legend_people records
export const DEMO_LEGEND_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Mitchell', display_name: 'Sarah Mitchell', title: 'VP of Events', email: 'sarah@acme.com', phone: '+1 555-0101', status: 'active', tags: ['client', 'decision-maker'], metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'John', last_name: 'Davis', display_name: 'John Davis', title: 'Event Manager', email: 'john@acme.com', phone: '+1 555-0102', status: 'active', tags: ['client'], metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Lisa', last_name: 'Chen', display_name: 'Lisa Chen', title: 'CFO', email: 'lisa@acme.com', status: 'active', tags: ['client', 'finance'], metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-004', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Mike', last_name: 'Thompson', display_name: 'Mike Thompson', title: 'CEO', email: 'mike@acme.com', status: 'active', tags: ['client', 'executive'], metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-005', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Emily', last_name: 'Park', display_name: 'Emily Park', title: 'Procurement Director', email: 'emily@acme.com', status: 'active', tags: ['client', 'procurement'], metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// Contact profile extensions
export const DEMO_CONTACT_PROFILES: DemoContactProfile[] = [
  { id: 'cp-001', person_id: 'person-001', contact_type: 'client', company: 'Acme Corp', job_title: 'VP of Events', source: 'referral', lead_status: 'customer', lead_score: 95, do_not_contact: false, subscribed_to_newsletter: true, subscribed_to_marketing: true, lifetime_value: 450000, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cp-002', person_id: 'person-002', contact_type: 'client', company: 'Acme Corp', job_title: 'Event Manager', source: 'referral', lead_status: 'customer', lead_score: 85, do_not_contact: false, subscribed_to_newsletter: true, subscribed_to_marketing: false, lifetime_value: 125000, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cp-003', person_id: 'person-003', contact_type: 'client', company: 'Acme Corp', job_title: 'CFO', source: 'referral', lead_status: 'customer', lead_score: 90, do_not_contact: false, subscribed_to_newsletter: false, subscribed_to_marketing: false, lifetime_value: 450000, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cp-004', person_id: 'person-004', contact_type: 'client', company: 'Acme Corp', job_title: 'CEO', source: 'referral', lead_status: 'customer', lead_score: 100, do_not_contact: false, subscribed_to_newsletter: true, subscribed_to_marketing: true, lifetime_value: 750000, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cp-005', person_id: 'person-005', contact_type: 'client', company: 'Acme Corp', job_title: 'Procurement Director', source: 'referral', lead_status: 'customer', lead_score: 80, do_not_contact: false, subscribed_to_newsletter: true, subscribed_to_marketing: true, lifetime_value: 200000, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// 3NF Compliant - legend_relationships schema (uses IDs, not embedded objects)
export interface DemoRelationship {
  id: string;
  organization_id: string;
  source_entity_type: 'person' | 'organization' | 'place' | 'product' | 'event' | 'document';
  source_entity_id: string;
  target_entity_type: 'person' | 'organization' | 'place' | 'product' | 'event' | 'document';
  target_entity_id: string;
  relationship_type: 'reports_to' | 'manages' | 'works_with' | 'referred_by' | 'decision_maker' | 'influencer' | 'champion' | 'blocker';
  is_bidirectional: boolean;
  metadata: Record<string, unknown>;
  notes?: string;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const DEMO_RELATIONSHIPS: DemoRelationship[] = [
  { id: 'rel-001', organization_id: DEMO_ORGANIZATION_ID, source_entity_type: 'person', source_entity_id: 'person-002', target_entity_type: 'person', target_entity_id: 'person-001', relationship_type: 'reports_to', is_bidirectional: false, metadata: { strength: 'strong' }, valid_from: '2024-01-15T00:00:00Z', is_active: true, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rel-002', organization_id: DEMO_ORGANIZATION_ID, source_entity_type: 'person', source_entity_id: 'person-001', target_entity_type: 'person', target_entity_id: 'person-004', relationship_type: 'reports_to', is_bidirectional: false, metadata: { strength: 'strong' }, valid_from: '2024-01-15T00:00:00Z', is_active: true, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rel-003', organization_id: DEMO_ORGANIZATION_ID, source_entity_type: 'person', source_entity_id: 'person-003', target_entity_type: 'person', target_entity_id: 'person-004', relationship_type: 'reports_to', is_bidirectional: false, metadata: { strength: 'strong' }, valid_from: '2024-01-15T00:00:00Z', is_active: true, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rel-004', organization_id: DEMO_ORGANIZATION_ID, source_entity_type: 'person', source_entity_id: 'person-001', target_entity_type: 'person', target_entity_id: 'person-003', relationship_type: 'works_with', is_bidirectional: true, metadata: { strength: 'moderate' }, valid_from: '2024-01-15T00:00:00Z', is_active: true, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// 3NF Compliant Stakeholder structure - uses person_id references
export interface DemoStakeholderEntry {
  id: string;
  person_id: string;
  organization_id: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  is_decision_maker: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoStakeholderMap {
  organization_id: string;
  stakeholders: DemoStakeholderEntry[];
}

export const DEMO_STAKEHOLDER_ENTRIES: DemoStakeholderEntry[] = [
  { id: 'stake-001', person_id: 'person-004', organization_id: 'org-acme-001', role: 'Executive Sponsor', influence: 'high', sentiment: 'positive', is_decision_maker: true, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stake-002', person_id: 'person-001', organization_id: 'org-acme-001', role: 'Project Owner', influence: 'high', sentiment: 'positive', is_decision_maker: true, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stake-003', person_id: 'person-003', organization_id: 'org-acme-001', role: 'Budget Approver', influence: 'high', sentiment: 'neutral', is_decision_maker: true, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stake-004', person_id: 'person-002', organization_id: 'org-acme-001', role: 'Day-to-Day Contact', influence: 'medium', sentiment: 'positive', is_decision_maker: false, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stake-005', person_id: 'person-005', organization_id: 'org-acme-001', role: 'Procurement Lead', influence: 'medium', sentiment: 'neutral', is_decision_maker: false, metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_STAKEHOLDER_MAP: DemoStakeholderMap = {
  organization_id: 'org-acme-001',
  stakeholders: DEMO_STAKEHOLDER_ENTRIES,
};

// =============================================================================
// VENDORS (3NF Compliant - legend_organizations + orgs_profile_vendor)
// =============================================================================

// Base organization interface matching legend_organizations schema
export interface DemoLegendOrganization {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string;
  code?: string;
  description?: string;
  org_type: 'vendor' | 'sponsor' | 'client' | 'partner' | 'agency' | 'subsidiary' | 'other';
  email?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  duns_number?: string;
  industry?: string;
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';
  primary_contact_id?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  tags: string[];
  logo_url?: string;
  metadata: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Vendor profile extension matching orgs_profile_vendor schema
export interface DemoVendorProfile {
  id: string;
  org_id: string;
  vendor_code?: string;
  vendor_type?: string;
  payment_terms: string;
  credit_limit?: number;
  currency: string;
  tax_exempt: boolean;
  w9_on_file: boolean;
  insurance_on_file: boolean;
  insurance_expiry?: string;
  insurance_amount?: number;
  minimum_order_amount?: number;
  lead_time_days?: number;
  contract_start_date?: string;
  contract_end_date?: string;
  performance_rating?: number;
  total_orders: number;
  total_spend: number;
  is_approved: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Demo vendor organizations
export const DEMO_LEGEND_ORGANIZATIONS: DemoLegendOrganization[] = [
  { id: 'org-vendor-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Acme Staging', legal_name: 'Acme Staging Solutions LLC', code: 'ACME', description: 'Premier staging and rigging provider', org_type: 'vendor', email: 'info@acmestaging.com', phone: '+1 555-0201', website: 'https://acmestaging.com', industry: 'Event Production', company_size: '51-200', status: 'active', tags: ['staging', 'rigging', 'preferred'], metadata: {}, created_at: '2023-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Sound Systems Inc', legal_name: 'Sound Systems International Inc', code: 'SSI', description: 'Professional audio equipment rental', org_type: 'vendor', email: 'rentals@soundsystems.com', phone: '+1 555-0202', website: 'https://soundsystems.com', industry: 'Audio Equipment', company_size: '201-500', status: 'active', tags: ['audio', 'rental'], metadata: {}, created_at: '2023-03-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Lighting Pro', legal_name: 'Lighting Pro Services Corp', code: 'LPR', description: 'Lighting design and equipment', org_type: 'vendor', email: 'sales@lightingpro.com', phone: '+1 555-0203', website: 'https://lightingpro.com', industry: 'Lighting', company_size: '11-50', status: 'active', tags: ['lighting', 'design'], metadata: {}, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// Vendor profile extensions
export const DEMO_VENDOR_PROFILES: DemoVendorProfile[] = [
  { id: 'vp-001', org_id: 'org-vendor-001', vendor_code: 'VND-ACME', vendor_type: 'staging', payment_terms: 'net_30', credit_limit: 500000, currency: 'USD', tax_exempt: false, w9_on_file: true, insurance_on_file: true, insurance_expiry: '2025-06-30', insurance_amount: 5000000, minimum_order_amount: 1000, lead_time_days: 14, contract_start_date: '2024-01-01', contract_end_date: '2025-12-31', performance_rating: 4.8, total_orders: 47, total_spend: 1250000, is_approved: true, metadata: { auto_renew: true }, created_at: '2023-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vp-002', org_id: 'org-vendor-002', vendor_code: 'VND-SSI', vendor_type: 'audio', payment_terms: 'net_15', credit_limit: 200000, currency: 'USD', tax_exempt: false, w9_on_file: true, insurance_on_file: true, insurance_expiry: '2025-03-15', insurance_amount: 2000000, minimum_order_amount: 500, lead_time_days: 7, contract_start_date: '2024-06-01', contract_end_date: '2024-12-31', performance_rating: 4.5, total_orders: 32, total_spend: 450000, is_approved: true, metadata: { auto_renew: false }, created_at: '2023-03-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vp-003', org_id: 'org-vendor-003', vendor_code: 'VND-LPR', vendor_type: 'lighting', payment_terms: 'net_30', credit_limit: 150000, currency: 'USD', tax_exempt: false, w9_on_file: false, insurance_on_file: false, minimum_order_amount: 250, lead_time_days: 10, contract_start_date: '2025-01-01', contract_end_date: '2025-12-31', performance_rating: 4.2, total_orders: 18, total_spend: 180000, is_approved: false, metadata: { auto_renew: true }, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// 3NF Compliant - Contract stored in legend_documents + docs_profile_contract
export interface DemoVendorContract {
  id: string;
  organization_id: string;
  vendor_org_id: string;
  document_type: 'contract';
  contract_type: 'master' | 'project' | 'retainer' | 'nda';
  status: 'active' | 'pending' | 'expired' | 'terminated' | 'draft';
  effective_date: string;
  expiration_date: string;
  amount: number;
  currency: string;
  auto_renew: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_VENDOR_CONTRACTS: DemoVendorContract[] = [
  { id: 'doc-contract-001', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-001', document_type: 'contract', contract_type: 'master', status: 'active', effective_date: '2024-01-01', expiration_date: '2025-12-31', amount: 500000, currency: 'USD', auto_renew: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'doc-contract-002', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-002', document_type: 'contract', contract_type: 'project', status: 'active', effective_date: '2024-06-01', expiration_date: '2024-12-31', amount: 75000, currency: 'USD', auto_renew: false, metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'doc-contract-003', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-003', document_type: 'contract', contract_type: 'retainer', status: 'pending', effective_date: '2025-01-01', expiration_date: '2025-12-31', amount: 120000, currency: 'USD', auto_renew: true, metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// 3NF Compliant Rate Card - references vendor_org_id instead of vendor_name
export interface DemoRateCard {
  id: string;
  organization_id: string;
  vendor_org_id: string;
  category: string;
  item: string;
  unit: string;
  rate: number;
  currency: string;
  effective_date: string;
  expiration_date?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_RATE_CARDS: DemoRateCard[] = [
  { id: 'rc-001', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-001', category: 'Staging', item: 'Main Stage (40x60)', unit: 'day', rate: 5000, currency: 'USD', effective_date: '2024-01-01', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rc-002', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-001', category: 'Staging', item: 'B-Stage (20x20)', unit: 'day', rate: 1500, currency: 'USD', effective_date: '2024-01-01', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rc-003', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-002', category: 'Audio', item: 'Line Array (per side)', unit: 'day', rate: 2500, currency: 'USD', effective_date: '2024-01-01', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// LEADS & SCORING (3NF Compliant - legend_people + people_profile_contact)
// =============================================================================

// Lead is a person with contact profile where lead_status is set
export interface DemoLead {
  id: string;
  person_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  company_org_id?: string;
  lead_score: number;
  lead_status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_LEADS: DemoLead[] = [
  { id: 'lead-001', person_id: 'person-lead-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Jennifer', last_name: 'Adams', display_name: 'Jennifer Adams', email: 'jennifer@techcorp.com', company_org_id: 'org-techcorp', lead_score: 85, lead_status: 'qualified', source: 'Website', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'lead-002', person_id: 'person-lead-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Robert', last_name: 'Chen', display_name: 'Robert Chen', email: 'robert@globalevents.com', company_org_id: 'org-globalevents', lead_score: 72, lead_status: 'contacted', source: 'Referral', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'lead-003', person_id: 'person-lead-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Maria', last_name: 'Garcia', display_name: 'Maria Garcia', email: 'maria@festivalinc.com', company_org_id: 'org-festivalinc', lead_score: 91, lead_status: 'proposal', source: 'Trade Show', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
];

export interface DemoScoringRule {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  condition: string;
  points: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SCORING_RULES: DemoScoringRule[] = [
  { id: 'sr-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Website Visit', category: 'Engagement', condition: 'Visited pricing page', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'sr-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Demo Request', category: 'Intent', condition: 'Requested demo', points: 25, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'sr-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Enterprise Company', category: 'Firmographic', condition: 'Company size > 500', points: 15, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// OKRs (3NF Compliant - uses person_id references instead of name strings)
// =============================================================================

export interface DemoOKRKeyResult {
  id: string;
  okr_id: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoOKR {
  id: string;
  organization_id: string;
  objective: string;
  owner_person_id: string;
  quarter: string;
  fiscal_year: number;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  parent_okr_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_OKRS: DemoOKR[] = [
  { id: 'okr-001', organization_id: DEMO_ORGANIZATION_ID, objective: 'Increase event production revenue by 25%', owner_person_id: 'person-001', quarter: 'Q4', fiscal_year: 2024, progress: 68, status: 'on_track', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'okr-002', organization_id: DEMO_ORGANIZATION_ID, objective: 'Improve client satisfaction score to 4.5+', owner_person_id: 'person-002', quarter: 'Q4', fiscal_year: 2024, progress: 82, status: 'on_track', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_OKR_KEY_RESULTS: DemoOKRKeyResult[] = [
  { id: 'kr-001', okr_id: 'okr-001', description: 'Close 5 new enterprise clients', target_value: 5, current_value: 3, unit: 'clients', weight: 50, status: 'on_track', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'kr-002', okr_id: 'okr-001', description: 'Increase average deal size to $150K', target_value: 150000, current_value: 125000, unit: 'USD', weight: 50, status: 'at_risk', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'kr-003', okr_id: 'okr-002', description: 'Achieve NPS score of 50+', target_value: 50, current_value: 45, unit: 'NPS', weight: 50, status: 'on_track', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'kr-004', okr_id: 'okr-002', description: 'Reduce support ticket resolution time to 4 hours', target_value: 4, current_value: 5, unit: 'hours', weight: 50, status: 'at_risk', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// WORKFORCE (3NF Compliant - uses person_id references)
// =============================================================================

// Background check references person_id instead of employee_name
export interface DemoBackgroundCheck {
  id: string;
  organization_id: string;
  person_id: string;
  check_type: 'criminal' | 'employment' | 'education' | 'credit' | 'drug';
  provider?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiated_date: string;
  completed_date?: string;
  expiry_date?: string;
  result?: 'clear' | 'flagged' | 'review_required';
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Additional people for workforce demo data
export const DEMO_WORKFORCE_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-emp-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Alex', last_name: 'Johnson', display_name: 'Alex Johnson', title: 'Production Coordinator', email: 'alex.johnson@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-emp-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sam', last_name: 'Williams', display_name: 'Sam Williams', title: 'Stage Manager', email: 'sam.williams@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-emp-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Jordan', last_name: 'Lee', display_name: 'Jordan Lee', title: 'Audio Engineer', email: 'jordan.lee@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-cand-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Chris', last_name: 'Taylor', display_name: 'Chris Taylor', title: 'Production Manager', email: 'chris.taylor@email.com', status: 'active', tags: ['candidate'], metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-cand-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Pat', last_name: 'Brown', display_name: 'Pat Brown', title: 'Stage Manager', email: 'pat.brown@email.com', status: 'active', tags: ['employee', 'hired'], metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_BACKGROUND_CHECKS: DemoBackgroundCheck[] = [
  { id: 'bc-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-emp-001', check_type: 'criminal', provider: 'Checkr', status: 'completed', initiated_date: '2024-11-01T00:00:00Z', completed_date: '2024-11-05T00:00:00Z', expiry_date: '2025-11-05T00:00:00Z', result: 'clear', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-05T00:00:00Z' },
  { id: 'bc-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-emp-002', check_type: 'employment', provider: 'Checkr', status: 'in_progress', initiated_date: '2024-11-15T00:00:00Z', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'bc-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-emp-003', check_type: 'education', provider: 'Checkr', status: 'pending', initiated_date: '2024-11-20T00:00:00Z', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// Referral uses person_id references for both referrer and candidate
export interface DemoReferral {
  id: string;
  organization_id: string;
  referrer_person_id: string;
  candidate_person_id: string;
  position_id?: string;
  position_title: string;
  status: 'submitted' | 'screening' | 'interviewing' | 'offer' | 'hired' | 'rejected';
  bonus_amount: number;
  bonus_currency: string;
  bonus_paid: boolean;
  bonus_paid_date?: string;
  submitted_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_REFERRALS: DemoReferral[] = [
  { id: 'ref-001', organization_id: DEMO_ORGANIZATION_ID, referrer_person_id: 'person-005', candidate_person_id: 'person-cand-001', position_title: 'Production Manager', status: 'interviewing', bonus_amount: 2500, bonus_currency: 'USD', bonus_paid: false, submitted_date: '2024-11-01T00:00:00Z', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ref-002', organization_id: DEMO_ORGANIZATION_ID, referrer_person_id: 'person-004', candidate_person_id: 'person-cand-002', position_title: 'Stage Manager', status: 'hired', bonus_amount: 2000, bonus_currency: 'USD', bonus_paid: true, bonus_paid_date: '2024-11-15T00:00:00Z', submitted_date: '2024-10-15T00:00:00Z', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
];

// =============================================================================
// CRM (3NF Compliant - uses person_id and entity references)
// =============================================================================

// Task uses assignee_person_id and related_entity references
export interface DemoTask {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  assignee_person_id: string;
  creator_person_id?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  related_entity_type?: 'deal' | 'contact' | 'organization' | 'event';
  related_entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_TASKS: DemoTask[] = [
  { id: 'task-001', organization_id: DEMO_ORGANIZATION_ID, title: 'Follow up with Acme Corp', description: 'Send proposal revision', assignee_person_id: 'person-001', due_date: '2024-12-15T00:00:00Z', priority: 'high', status: 'in_progress', related_entity_type: 'deal', related_entity_id: 'deal-001', metadata: {}, created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
  { id: 'task-002', organization_id: DEMO_ORGANIZATION_ID, title: 'Schedule site visit', assignee_person_id: 'person-002', due_date: '2024-12-18T00:00:00Z', priority: 'medium', status: 'todo', related_entity_type: 'deal', related_entity_id: 'deal-002', metadata: {}, created_at: '2024-12-05T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
  { id: 'task-003', organization_id: DEMO_ORGANIZATION_ID, title: 'Review contract terms', assignee_person_id: 'person-003', due_date: '2024-12-20T00:00:00Z', priority: 'high', status: 'review', metadata: {}, created_at: '2024-12-08T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
];

// Calendar event uses attendee_person_ids array and place_id for location
export interface DemoCalendarEvent {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  is_all_day: boolean;
  event_type: 'meeting' | 'call' | 'task' | 'event' | 'reminder';
  attendee_person_ids: string[];
  place_id?: string;
  location_name?: string;
  related_entity_type?: 'deal' | 'contact' | 'organization' | 'project';
  related_entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CALENDAR_EVENTS: DemoCalendarEvent[] = [
  { id: 'cal-001', organization_id: DEMO_ORGANIZATION_ID, title: 'Client Meeting - Acme Corp', start_datetime: '2024-12-15T10:00:00Z', end_datetime: '2024-12-15T11:00:00Z', timezone: 'America/New_York', is_all_day: false, event_type: 'meeting', attendee_person_ids: ['person-001', 'person-002'], location_name: 'Conference Room A', metadata: {}, created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
  { id: 'cal-002', organization_id: DEMO_ORGANIZATION_ID, title: 'Vendor Call - Sound Systems', start_datetime: '2024-12-16T14:00:00Z', end_datetime: '2024-12-16T14:30:00Z', timezone: 'America/New_York', is_all_day: false, event_type: 'call', attendee_person_ids: ['person-005'], metadata: {}, created_at: '2024-12-02T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
  { id: 'cal-003', organization_id: DEMO_ORGANIZATION_ID, title: 'Site Visit - Madison Square Garden', start_datetime: '2024-12-18T09:00:00Z', end_datetime: '2024-12-18T12:00:00Z', timezone: 'America/New_York', is_all_day: false, event_type: 'event', attendee_person_ids: [], location_name: 'MSG', metadata: {}, created_at: '2024-12-05T00:00:00Z', updated_at: '2024-12-10T00:00:00Z' },
];

// =============================================================================
// VENDOR CONTRACTS FULL (3NF Compliant - uses vendor_org_id references)
// =============================================================================

// Additional vendor organizations for contracts
export const DEMO_ADDITIONAL_VENDOR_ORGS: DemoLegendOrganization[] = [
  { id: 'org-vendor-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Audio House Inc', legal_name: 'Audio House Inc', code: 'AHI', org_type: 'vendor', email: 'info@audiohouse.com', status: 'active', tags: ['audio'], metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Lighting Solutions', legal_name: 'Lighting Solutions LLC', code: 'LS', org_type: 'vendor', email: 'info@lightingsolutions.com', status: 'active', tags: ['lighting'], metadata: {}, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-006', organization_id: DEMO_ORGANIZATION_ID, name: 'Stage Builders Co', legal_name: 'Stage Builders Company', code: 'SBC', org_type: 'vendor', email: 'info@stagebuilders.com', status: 'active', tags: ['staging'], metadata: {}, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-007', organization_id: DEMO_ORGANIZATION_ID, name: 'Video Tech Pro', legal_name: 'Video Tech Pro Inc', code: 'VTP', org_type: 'vendor', email: 'info@videotechpro.com', status: 'active', tags: ['video'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-008', organization_id: DEMO_ORGANIZATION_ID, name: 'Rigging Experts', legal_name: 'Rigging Experts LLC', code: 'RE', org_type: 'vendor', email: 'info@riggingexperts.com', status: 'active', tags: ['rigging'], metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export interface DemoVendorContractFull {
  id: string;
  organization_id: string;
  vendor_org_id: string;
  contract_type: string;
  effective_date: string;
  expiration_date: string;
  amount: number;
  currency: string;
  status: 'Active' | 'Expiring' | 'Expired' | 'Pending Renewal';
  days_until_expiry: number;
  auto_renew: boolean;
  category: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_VENDOR_CONTRACTS_FULL: DemoVendorContractFull[] = [
  { id: 'vc-full-001', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-004', contract_type: 'Master Services', effective_date: '2023-01-01', expiration_date: '2025-01-01', amount: 250000, currency: 'USD', status: 'Expiring', days_until_expiry: 37, auto_renew: false, category: 'Audio', metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vc-full-002', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-005', contract_type: 'Equipment Rental', effective_date: '2024-03-01', expiration_date: '2025-03-01', amount: 180000, currency: 'USD', status: 'Active', days_until_expiry: 96, auto_renew: true, category: 'Lighting', metadata: {}, created_at: '2024-03-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vc-full-003', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-006', contract_type: 'Preferred Vendor', effective_date: '2023-06-01', expiration_date: '2024-11-30', amount: 320000, currency: 'USD', status: 'Expired', days_until_expiry: -5, auto_renew: false, category: 'Staging', metadata: {}, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vc-full-004', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-007', contract_type: 'Master Services', effective_date: '2024-01-01', expiration_date: '2025-12-31', amount: 150000, currency: 'USD', status: 'Active', days_until_expiry: 402, auto_renew: true, category: 'Video', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'vc-full-005', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-008', contract_type: 'Equipment Rental', effective_date: '2024-06-01', expiration_date: '2024-12-15', amount: 95000, currency: 'USD', status: 'Expiring', days_until_expiry: 20, auto_renew: false, category: 'Rigging', metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// OKRs LIST (3NF Compliant - uses department_id/team references)
// =============================================================================

// Simple key result for list view
export interface DemoKeyResultSimple {
  kr: string;
  progress: number;
}

// OKR item with department/team owner reference
export interface DemoOKRItem {
  id: string;
  organization_id: string;
  objective: string;
  owner_department_id: string;
  owner_department_name: string;
  progress: number;
  key_results: DemoKeyResultSimple[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_OKRS_LIST: DemoOKRItem[] = [
  { id: 'okr-list-001', organization_id: DEMO_ORGANIZATION_ID, objective: 'Scale Production Capacity 50%', owner_department_id: 'dept-ops', owner_department_name: 'Operations', progress: 65, key_results: [
    { kr: 'Hire 15 new crew members', progress: 80 },
    { kr: 'Acquire $2M in new equipment', progress: 60 },
    { kr: 'Open second warehouse facility', progress: 45 },
  ], metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'okr-list-002', organization_id: DEMO_ORGANIZATION_ID, objective: 'Increase Revenue to $15M', owner_department_id: 'dept-bizdev', owner_department_name: 'Business Dev', progress: 70, key_results: [
    { kr: 'Close 8 new festival contracts', progress: 75 },
    { kr: 'Expand into 3 new markets', progress: 66 },
    { kr: 'Achieve 95% client retention', progress: 100 },
  ], metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'okr-list-003', organization_id: DEMO_ORGANIZATION_ID, objective: 'Enhance Operational Excellence', owner_department_id: 'dept-exec', owner_department_name: 'COO', progress: 55, key_results: [
    { kr: 'Reduce setup time by 25%', progress: 40 },
    { kr: 'Achieve 99% on-time delivery', progress: 85 },
    { kr: 'Zero safety incidents', progress: 100 },
  ], metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// LEAD SCORING FULL (3NF Compliant - uses person_id and org_id references)
// =============================================================================

export interface DemoScoreBreakdown {
  demographic: number;
  behavioral: number;
  engagement: number;
  fit: number;
}

export interface DemoLeadScoringFull {
  id: string;
  organization_id: string;
  person_id: string;
  company_org_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  title: string;
  source: 'website' | 'referral' | 'event' | 'cold_outreach' | 'inbound';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  score_breakdown: DemoScoreBreakdown;
  estimated_value: number;
  currency: string;
  last_activity_at: string;
  qualification_status: 'unqualified' | 'mql' | 'sql' | 'opportunity';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_LEADS_SCORING_FULL: DemoLeadScoringFull[] = [
  { id: 'lead-full-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-lead-full-001', company_org_id: 'org-techcorp', first_name: 'John', last_name: 'Smith', display_name: 'John Smith', email: 'john@techcorp.com', title: 'VP of Events', source: 'website', status: 'qualified', score: 85, score_breakdown: { demographic: 25, behavioral: 20, engagement: 25, fit: 15 }, estimated_value: 150000, currency: 'USD', last_activity_at: '2024-11-24T14:00:00Z', qualification_status: 'sql', metadata: {}, created_at: '2024-11-20T10:00:00Z', updated_at: '2024-11-24T14:00:00Z' },
  { id: 'lead-full-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-lead-full-002', company_org_id: 'org-globalevents', first_name: 'Sarah', last_name: 'Johnson', display_name: 'Sarah Johnson', email: 'sarah@globalevents.com', title: 'Event Director', source: 'referral', status: 'proposal', score: 92, score_breakdown: { demographic: 30, behavioral: 22, engagement: 25, fit: 15 }, estimated_value: 250000, currency: 'USD', last_activity_at: '2024-11-24T10:00:00Z', qualification_status: 'opportunity', metadata: {}, created_at: '2024-11-15T09:00:00Z', updated_at: '2024-11-24T10:00:00Z' },
  { id: 'lead-full-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-lead-full-003', company_org_id: 'org-startupxyz', first_name: 'Mike', last_name: 'Chen', display_name: 'Mike Chen', email: 'mike@startupxyz.com', title: 'CEO', source: 'event', status: 'contacted', score: 45, score_breakdown: { demographic: 10, behavioral: 15, engagement: 10, fit: 10 }, estimated_value: 25000, currency: 'USD', last_activity_at: '2024-11-23T16:00:00Z', qualification_status: 'mql', metadata: {}, created_at: '2024-11-22T14:00:00Z', updated_at: '2024-11-23T16:00:00Z' },
  { id: 'lead-full-004', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-lead-full-004', company_org_id: 'org-enterprise', first_name: 'Lisa', last_name: 'Park', display_name: 'Lisa Park', email: 'lisa@enterprise.com', title: 'CMO', source: 'inbound', status: 'new', score: 72, score_breakdown: { demographic: 20, behavioral: 18, engagement: 20, fit: 14 }, estimated_value: 100000, currency: 'USD', last_activity_at: '2024-11-24T08:00:00Z', qualification_status: 'mql', metadata: {}, created_at: '2024-11-24T08:00:00Z', updated_at: '2024-11-24T08:00:00Z' },
  { id: 'lead-full-005', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-lead-full-005', company_org_id: 'org-localbiz', first_name: 'Tom', last_name: 'Wilson', display_name: 'Tom Wilson', email: 'tom@localbiz.com', title: 'Owner', source: 'cold_outreach', status: 'contacted', score: 28, score_breakdown: { demographic: 5, behavioral: 8, engagement: 10, fit: 5 }, estimated_value: 10000, currency: 'USD', last_activity_at: '2024-11-22T09:00:00Z', qualification_status: 'unqualified', metadata: {}, created_at: '2024-11-21T11:00:00Z', updated_at: '2024-11-22T09:00:00Z' },
];

export interface DemoScoringRuleFull {
  id: string;
  organization_id: string;
  category: 'demographic' | 'behavioral' | 'engagement' | 'fit';
  name: string;
  condition: string;
  points: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SCORING_RULES_FULL: DemoScoringRuleFull[] = [
  { id: 'rule-001', organization_id: DEMO_ORGANIZATION_ID, category: 'demographic', name: 'Company Size > 500', condition: 'employees > 500', points: 15, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-002', organization_id: DEMO_ORGANIZATION_ID, category: 'demographic', name: 'Decision Maker Title', condition: 'title contains VP, Director, C-level', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-003', organization_id: DEMO_ORGANIZATION_ID, category: 'demographic', name: 'Target Industry', condition: 'industry in [Events, Entertainment, Corporate]', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-004', organization_id: DEMO_ORGANIZATION_ID, category: 'behavioral', name: 'Visited Pricing Page', condition: 'page_view = pricing', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-005', organization_id: DEMO_ORGANIZATION_ID, category: 'behavioral', name: 'Downloaded Content', condition: 'download_count > 0', points: 8, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-006', organization_id: DEMO_ORGANIZATION_ID, category: 'behavioral', name: 'Requested Demo', condition: 'demo_request = true', points: 15, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-007', organization_id: DEMO_ORGANIZATION_ID, category: 'engagement', name: 'Email Opens > 3', condition: 'email_opens > 3', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-008', organization_id: DEMO_ORGANIZATION_ID, category: 'engagement', name: 'Website Visits > 5', condition: 'website_visits > 5', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-009', organization_id: DEMO_ORGANIZATION_ID, category: 'engagement', name: 'Recent Activity (7 days)', condition: 'last_activity < 7 days', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-010', organization_id: DEMO_ORGANIZATION_ID, category: 'fit', name: 'Budget Confirmed', condition: 'budget_confirmed = true', points: 15, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rule-011', organization_id: DEMO_ORGANIZATION_ID, category: 'fit', name: 'Timeline < 6 months', condition: 'timeline < 6 months', points: 10, is_active: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// BACKGROUND CHECKS FULL (3NF Compliant - uses person_id and department_id references)
// =============================================================================

export interface DemoBackgroundCheckFull {
  id: string;
  organization_id: string;
  person_id: string;
  department_id: string;
  department_name: string;
  check_type: string;
  provider: string;
  request_date: string;
  completed_date?: string;
  expiry_date?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed' | 'Expired' | 'Renewal Due';
  result?: 'Clear' | 'Review Required' | 'Failed';
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Additional people for background checks
export const DEMO_BACKGROUND_CHECK_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-bgc-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'John', last_name: 'Smith', display_name: 'John Smith', title: 'Production Lead', email: 'john.smith@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-bgc-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Johnson', display_name: 'Sarah Johnson', title: 'Finance Manager', email: 'sarah.johnson@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-bgc-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Mike', last_name: 'Williams', display_name: 'Mike Williams', title: 'Operations Coordinator', email: 'mike.williams@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-bgc-004', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Emily', last_name: 'Davis', display_name: 'Emily Davis', title: 'Audio Technician', email: 'emily.davis@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-bgc-005', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Chris', last_name: 'Brown', display_name: 'Chris Brown', title: 'Lighting Technician', email: 'chris.brown@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_BACKGROUND_CHECKS_FULL: DemoBackgroundCheckFull[] = [
  { id: 'bgc-full-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-001', department_id: 'dept-production', department_name: 'Production', check_type: 'Criminal + Employment', provider: 'Checkr', request_date: '2024-11-01T00:00:00Z', completed_date: '2024-11-05T00:00:00Z', expiry_date: '2025-11-05T00:00:00Z', status: 'Completed', result: 'Clear', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-05T00:00:00Z' },
  { id: 'bgc-full-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-002', department_id: 'dept-finance', department_name: 'Finance', check_type: 'Criminal + Credit + Employment', provider: 'Sterling', request_date: '2024-11-10T00:00:00Z', status: 'In Progress', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'bgc-full-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-003', department_id: 'dept-operations', department_name: 'Operations', check_type: 'Criminal', provider: 'Checkr', request_date: '2024-10-15T00:00:00Z', completed_date: '2024-10-18T00:00:00Z', expiry_date: '2024-12-18T00:00:00Z', status: 'Renewal Due', result: 'Clear', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-10-18T00:00:00Z' },
  { id: 'bgc-full-004', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-004', department_id: 'dept-audio', department_name: 'Audio', check_type: 'Criminal + Employment', provider: 'GoodHire', request_date: '2024-11-15T00:00:00Z', status: 'Pending', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'bgc-full-005', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-005', department_id: 'dept-lighting', department_name: 'Lighting', check_type: 'Criminal + Drug Screen', provider: 'Checkr', request_date: '2024-09-01T00:00:00Z', completed_date: '2024-09-05T00:00:00Z', expiry_date: '2024-09-05T00:00:00Z', status: 'Expired', result: 'Clear', metadata: {}, created_at: '2024-09-01T00:00:00Z', updated_at: '2024-09-05T00:00:00Z' },
];

// =============================================================================
// REFERRALS FULL (3NF Compliant - uses person_id references)
// =============================================================================

export interface DemoReferralFull {
  id: string;
  organization_id: string;
  candidate_person_id: string;
  candidate_name: string;
  position_id?: string;
  position_title: string;
  referrer_person_id: string;
  referrer_name: string;
  referrer_department_id: string;
  referrer_department_name: string;
  submitted_date: string;
  status: 'Pending' | 'Interviewing' | 'Hired' | 'Rejected';
  bonus_status?: 'Pending' | 'Paid';
  bonus_amount?: number;
  bonus_currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Additional people for referrals
export const DEMO_REFERRAL_CANDIDATES: DemoLegendPerson[] = [
  { id: 'person-ref-cand-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Alex', last_name: 'Thompson', display_name: 'Alex Thompson', title: 'Audio Engineer', email: 'alex.thompson@email.com', status: 'active', tags: ['candidate'], metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-ref-cand-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Maria', last_name: 'Garcia', display_name: 'Maria Garcia', title: 'Lighting Designer', email: 'maria.garcia@email.com', status: 'active', tags: ['employee', 'hired'], metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-ref-cand-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'James', last_name: 'Wilson', display_name: 'James Wilson', title: 'Stage Manager', email: 'james.wilson@email.com', status: 'active', tags: ['employee', 'hired'], metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-ref-cand-004', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Emily', last_name: 'Chen', display_name: 'Emily Chen', title: 'Video Technician', email: 'emily.chen@email.com', status: 'inactive', tags: ['candidate', 'rejected'], metadata: {}, created_at: '2024-11-05T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_REFERRALS_FULL: DemoReferralFull[] = [
  { id: 'ref-full-001', organization_id: DEMO_ORGANIZATION_ID, candidate_person_id: 'person-ref-cand-001', candidate_name: 'Alex Thompson', position_title: 'Audio Engineer', referrer_person_id: 'person-bgc-001', referrer_name: 'John Smith', referrer_department_id: 'dept-audio', referrer_department_name: 'Audio', submitted_date: '2024-11-20T00:00:00Z', status: 'Interviewing', bonus_currency: 'USD', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ref-full-002', organization_id: DEMO_ORGANIZATION_ID, candidate_person_id: 'person-ref-cand-002', candidate_name: 'Maria Garcia', position_title: 'Lighting Designer', referrer_person_id: 'person-bgc-002', referrer_name: 'Sarah Johnson', referrer_department_id: 'dept-lighting', referrer_department_name: 'Lighting', submitted_date: '2024-11-15T00:00:00Z', status: 'Hired', bonus_status: 'Pending', bonus_amount: 2500, bonus_currency: 'USD', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ref-full-003', organization_id: DEMO_ORGANIZATION_ID, candidate_person_id: 'person-ref-cand-003', candidate_name: 'James Wilson', position_title: 'Stage Manager', referrer_person_id: 'person-bgc-003', referrer_name: 'Mike Davis', referrer_department_id: 'dept-stage', referrer_department_name: 'Stage', submitted_date: '2024-11-10T00:00:00Z', status: 'Hired', bonus_status: 'Paid', bonus_amount: 2500, bonus_currency: 'USD', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ref-full-004', organization_id: DEMO_ORGANIZATION_ID, candidate_person_id: 'person-ref-cand-004', candidate_name: 'Emily Chen', position_title: 'Video Technician', referrer_person_id: 'person-bgc-001', referrer_name: 'John Smith', referrer_department_id: 'dept-audio', referrer_department_name: 'Audio', submitted_date: '2024-11-05T00:00:00Z', status: 'Rejected', bonus_currency: 'USD', metadata: {}, created_at: '2024-11-05T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// RATE CARDS FULL (3NF Compliant - uses vendor_org_id references)
// =============================================================================

export interface DemoRateItem {
  id: string;
  rate_card_id: string;
  description: string;
  unit: string;
  daily_rate: number;
  weekly_rate: number;
  monthly_rate?: number;
  currency: string;
  metadata: Record<string, unknown>;
}

export interface DemoRateCardFull {
  id: string;
  organization_id: string;
  vendor_org_id: string;
  category: string;
  effective_date: string;
  expiration_date: string;
  status: 'Active' | 'Expired' | 'Pending';
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Additional vendor organizations for rate cards
export const DEMO_RATE_CARD_VENDOR_ORGS: DemoLegendOrganization[] = [
  { id: 'org-vendor-rc-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Pro Audio Solutions', legal_name: 'Pro Audio Solutions Inc', code: 'PAS', org_type: 'vendor', email: 'info@proaudio.com', status: 'active', tags: ['audio'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-rc-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Elite Lighting Co', legal_name: 'Elite Lighting Company LLC', code: 'ELC', org_type: 'vendor', email: 'info@elitelighting.com', status: 'active', tags: ['lighting'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-vendor-rc-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Stage Systems Inc', legal_name: 'Stage Systems Inc', code: 'SSI', org_type: 'vendor', email: 'info@stagesystems.com', status: 'active', tags: ['staging'], metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_RATE_CARDS_FULL: DemoRateCardFull[] = [
  { id: 'rc-full-001', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-rc-001', category: 'Audio', effective_date: '2024-01-01', expiration_date: '2024-12-31', status: 'Active', notes: 'Volume discounts available for orders over $10,000', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rc-full-002', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-rc-002', category: 'Lighting', effective_date: '2024-01-01', expiration_date: '2024-12-31', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rc-full-003', organization_id: DEMO_ORGANIZATION_ID, vendor_org_id: 'org-vendor-rc-003', category: 'Staging', effective_date: '2024-06-01', expiration_date: '2025-05-31', status: 'Active', metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_RATE_ITEMS: DemoRateItem[] = [
  { id: 'ri-001', rate_card_id: 'rc-full-001', description: 'L-Acoustics K2 Line Array (per box)', unit: 'Day', daily_rate: 450, weekly_rate: 1800, monthly_rate: 5400, currency: 'USD', metadata: {} },
  { id: 'ri-002', rate_card_id: 'rc-full-001', description: 'L-Acoustics SB28 Subwoofer', unit: 'Day', daily_rate: 200, weekly_rate: 800, monthly_rate: 2400, currency: 'USD', metadata: {} },
  { id: 'ri-003', rate_card_id: 'rc-full-001', description: 'DiGiCo SD12 Console', unit: 'Day', daily_rate: 800, weekly_rate: 3200, monthly_rate: 9600, currency: 'USD', metadata: {} },
  { id: 'ri-005', rate_card_id: 'rc-full-002', description: 'Clay Paky Sharpy Plus', unit: 'Day', daily_rate: 125, weekly_rate: 500, monthly_rate: 1500, currency: 'USD', metadata: {} },
  { id: 'ri-006', rate_card_id: 'rc-full-002', description: 'Robe MegaPointe', unit: 'Day', daily_rate: 150, weekly_rate: 600, monthly_rate: 1800, currency: 'USD', metadata: {} },
  { id: 'ri-008', rate_card_id: 'rc-full-003', description: '40x60 Stage Deck', unit: 'Day', daily_rate: 2500, weekly_rate: 10000, currency: 'USD', metadata: {} },
  { id: 'ri-009', rate_card_id: 'rc-full-003', description: 'Roof System (40x40)', unit: 'Day', daily_rate: 3500, weekly_rate: 14000, currency: 'USD', metadata: {} },
];

// =============================================================================
// CRM TASKS (3NF Compliant - uses person_id and entity references)
// =============================================================================

export interface DemoCrmTask {
  id: string;
  organization_id: string;
  title: string;
  task_type: 'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Task';
  priority: 'High' | 'Medium' | 'Low';
  due_date: string;
  due_time?: string;
  assignee_person_id: string;
  linked_contact_org_id?: string;
  linked_deal_id?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  reminder_minutes?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// CRM people for task assignments
export const DEMO_CRM_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-crm-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'John', last_name: 'Smith', display_name: 'John Smith', title: 'Sales Rep', email: 'john.smith@company.com', status: 'active', tags: ['sales'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-crm-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Johnson', display_name: 'Sarah Johnson', title: 'Account Manager', email: 'sarah.johnson@company.com', status: 'active', tags: ['sales'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-crm-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Mike', last_name: 'Davis', display_name: 'Mike Davis', title: 'Sales Manager', email: 'mike.davis@company.com', status: 'active', tags: ['sales', 'manager'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// Client organizations for CRM
export const DEMO_CRM_CLIENT_ORGS: DemoLegendOrganization[] = [
  { id: 'org-client-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Festival Productions', legal_name: 'Festival Productions LLC', code: 'FP', org_type: 'client', email: 'info@festivalproductions.com', status: 'active', tags: ['client', 'festival'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-client-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Tech Corp', legal_name: 'Tech Corporation Inc', code: 'TC', org_type: 'client', email: 'info@techcorp.com', status: 'active', tags: ['client', 'corporate'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-client-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Grand Arena', legal_name: 'Grand Arena LLC', code: 'GA', org_type: 'client', email: 'info@grandarena.com', status: 'active', tags: ['client', 'venue'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-client-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Music Festival Inc', legal_name: 'Music Festival Inc', code: 'MFI', org_type: 'client', email: 'info@musicfestival.com', status: 'active', tags: ['client', 'festival'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_CRM_TASKS: DemoCrmTask[] = [
  { id: 'crm-task-001', organization_id: DEMO_ORGANIZATION_ID, title: 'Follow up on proposal', task_type: 'Follow-up', priority: 'High', due_date: '2024-11-25T00:00:00Z', due_time: '10:00', assignee_person_id: 'person-crm-001', linked_contact_org_id: 'org-client-001', linked_deal_id: 'deal-001', status: 'Pending', reminder_minutes: 60, metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-task-002', organization_id: DEMO_ORGANIZATION_ID, title: 'Send contract revision', task_type: 'Email', priority: 'High', due_date: '2024-11-25T00:00:00Z', assignee_person_id: 'person-crm-001', linked_contact_org_id: 'org-client-002', linked_deal_id: 'deal-002', status: 'Pending', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-task-003', organization_id: DEMO_ORGANIZATION_ID, title: 'Schedule site visit', task_type: 'Call', priority: 'Medium', due_date: '2024-11-26T00:00:00Z', assignee_person_id: 'person-crm-002', linked_contact_org_id: 'org-client-003', status: 'Pending', reminder_minutes: 1440, metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-task-004', organization_id: DEMO_ORGANIZATION_ID, title: 'Review vendor quotes', task_type: 'Task', priority: 'Medium', due_date: '2024-11-24T00:00:00Z', assignee_person_id: 'person-crm-001', status: 'Overdue', metadata: {}, created_at: '2024-11-18T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-task-005', organization_id: DEMO_ORGANIZATION_ID, title: 'Client check-in call', task_type: 'Call', priority: 'Low', due_date: '2024-11-23T00:00:00Z', assignee_person_id: 'person-crm-003', linked_contact_org_id: 'org-client-004', status: 'Completed', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-23T00:00:00Z' },
];

// =============================================================================
// CRM CALENDAR EVENTS (3NF Compliant - uses person_id and org_id references)
// =============================================================================

export interface DemoCrmCalendarEvent {
  id: string;
  organization_id: string;
  title: string;
  event_type: 'Meeting' | 'Call' | 'Task' | 'Reminder';
  start_datetime: string;
  end_datetime: string;
  duration_minutes: number;
  attendee_person_ids: string[];
  linked_contact_org_id?: string;
  linked_deal_id?: string;
  place_id?: string;
  location_name?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CRM_CALENDAR_EVENTS: DemoCrmCalendarEvent[] = [
  { id: 'crm-evt-001', organization_id: DEMO_ORGANIZATION_ID, title: 'Client Discovery Call', event_type: 'Call', start_datetime: '2024-11-25T10:00:00Z', end_datetime: '2024-11-25T10:30:00Z', duration_minutes: 30, attendee_person_ids: ['person-crm-001'], linked_contact_org_id: 'org-client-001', linked_deal_id: 'deal-001', status: 'Scheduled', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-evt-002', organization_id: DEMO_ORGANIZATION_ID, title: 'Site Visit - Grand Arena', event_type: 'Meeting', start_datetime: '2024-11-25T14:00:00Z', end_datetime: '2024-11-25T16:00:00Z', duration_minutes: 120, attendee_person_ids: ['person-crm-001', 'person-crm-002'], linked_contact_org_id: 'org-client-003', location_name: '123 Arena Blvd', status: 'Scheduled', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-evt-003', organization_id: DEMO_ORGANIZATION_ID, title: 'Proposal Review', event_type: 'Meeting', start_datetime: '2024-11-26T11:00:00Z', end_datetime: '2024-11-26T12:00:00Z', duration_minutes: 60, attendee_person_ids: ['person-crm-001', 'person-crm-002', 'person-crm-003'], linked_deal_id: 'deal-002', status: 'Scheduled', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'crm-evt-004', organization_id: DEMO_ORGANIZATION_ID, title: 'Follow-up: Tech Corp', event_type: 'Task', start_datetime: '2024-11-26T15:00:00Z', end_datetime: '2024-11-26T15:15:00Z', duration_minutes: 15, attendee_person_ids: ['person-crm-001'], linked_contact_org_id: 'org-client-002', status: 'Scheduled', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// COMPENSATION PLANS (3NF Compliant - uses person_id and department_id references)
// =============================================================================

export interface DemoCompensationPlan {
  id: string;
  organization_id: string;
  person_id: string;
  department_id: string;
  department_name: string;
  position_id?: string;
  position_title: string;
  current_salary: number;
  proposed_salary: number;
  currency: string;
  equity_grant?: number;
  bonus?: number;
  effective_date: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  approver_person_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// People for compensation plans
export const DEMO_COMPENSATION_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-comp-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'John', last_name: 'Smith', display_name: 'John Smith', title: 'Senior Engineer', email: 'john.smith@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-comp-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Johnson', display_name: 'Sarah Johnson', title: 'Finance Manager', email: 'sarah.johnson@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-comp-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Mike', last_name: 'Williams', display_name: 'Mike Williams', title: 'Operations Lead', email: 'mike.williams@company.com', status: 'active', tags: ['employee'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_COMPENSATION_PLANS: DemoCompensationPlan[] = [
  { id: 'comp-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-comp-001', department_id: 'dept-production', department_name: 'Production', position_title: 'Senior Engineer', current_salary: 95000, proposed_salary: 105000, currency: 'USD', equity_grant: 5000, bonus: 10000, effective_date: '2025-01-01', status: 'Pending Approval', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'comp-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-comp-002', department_id: 'dept-finance', department_name: 'Finance', position_title: 'Finance Manager', current_salary: 85000, proposed_salary: 92000, currency: 'USD', bonus: 8000, effective_date: '2025-01-01', status: 'Approved', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'comp-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-comp-003', department_id: 'dept-operations', department_name: 'Operations', position_title: 'Operations Lead', current_salary: 78000, proposed_salary: 85000, currency: 'USD', equity_grant: 3000, effective_date: '2025-01-01', status: 'Draft', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// SUCCESSION PLANS (3NF Compliant - uses person_id and position_id references)
// =============================================================================

export interface DemoSuccessor {
  id: string;
  succession_plan_id: string;
  person_id: string;
  current_position_id?: string;
  current_position_title: string;
  readiness: 'Ready Now' | '1-2 Years' | '3-5 Years';
  development_areas: string[];
  readiness_score: number;
  metadata: Record<string, unknown>;
}

export interface DemoSuccessionPlan {
  id: string;
  organization_id: string;
  position_id?: string;
  position_title: string;
  department_id: string;
  department_name: string;
  current_holder_person_id: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  last_reviewed_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// People for succession plans
export const DEMO_SUCCESSION_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-suc-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Robert', last_name: 'Chen', display_name: 'Robert Chen', title: 'VP of Production', email: 'robert.chen@company.com', status: 'active', tags: ['executive'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Johnson', display_name: 'Sarah Johnson', title: 'Production Director', email: 'sarah.johnson@company.com', status: 'active', tags: ['director'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Mike', last_name: 'Williams', display_name: 'Mike Williams', title: 'Senior PM', email: 'mike.williams@company.com', status: 'active', tags: ['manager'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-004', organization_id: DEMO_ORGANIZATION_ID, first_name: 'James', last_name: 'Wilson', display_name: 'James Wilson', title: 'Technical Director', email: 'james.wilson@company.com', status: 'active', tags: ['director'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-005', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Emily', last_name: 'Davis', display_name: 'Emily Davis', title: 'Lead Engineer', email: 'emily.davis@company.com', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-006', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Lisa', last_name: 'Park', display_name: 'Lisa Park', title: 'Finance Director', email: 'lisa.park@company.com', status: 'active', tags: ['director'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-007', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Chris', last_name: 'Brown', display_name: 'Chris Brown', title: 'Finance Manager', email: 'chris.brown@company.com', status: 'active', tags: ['manager'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'person-suc-008', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Amy', last_name: 'Chen', display_name: 'Amy Chen', title: 'Senior Accountant', email: 'amy.chen@company.com', status: 'active', tags: ['senior'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_SUCCESSION_PLANS: DemoSuccessionPlan[] = [
  { id: 'suc-001', organization_id: DEMO_ORGANIZATION_ID, position_title: 'VP of Production', department_id: 'dept-production', department_name: 'Production', current_holder_person_id: 'person-suc-001', risk_level: 'High', last_reviewed_at: '2024-10-15T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-10-15T00:00:00Z' },
  { id: 'suc-002', organization_id: DEMO_ORGANIZATION_ID, position_title: 'Technical Director', department_id: 'dept-technical', department_name: 'Technical', current_holder_person_id: 'person-suc-004', risk_level: 'Medium', last_reviewed_at: '2024-11-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T00:00:00Z' },
  { id: 'suc-003', organization_id: DEMO_ORGANIZATION_ID, position_title: 'Finance Director', department_id: 'dept-finance', department_name: 'Finance', current_holder_person_id: 'person-suc-006', risk_level: 'Low', last_reviewed_at: '2024-09-20T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-20T00:00:00Z' },
];

export const DEMO_SUCCESSORS: DemoSuccessor[] = [
  { id: 'successor-001', succession_plan_id: 'suc-001', person_id: 'person-suc-002', current_position_title: 'Production Director', readiness: 'Ready Now', development_areas: ['Executive presence', 'P&L management'], readiness_score: 85, metadata: {} },
  { id: 'successor-002', succession_plan_id: 'suc-001', person_id: 'person-suc-003', current_position_title: 'Senior PM', readiness: '1-2 Years', development_areas: ['Leadership', 'Strategic planning'], readiness_score: 65, metadata: {} },
  { id: 'successor-003', succession_plan_id: 'suc-002', person_id: 'person-suc-005', current_position_title: 'Lead Engineer', readiness: '1-2 Years', development_areas: ['Team management', 'Budget oversight'], readiness_score: 70, metadata: {} },
  { id: 'successor-004', succession_plan_id: 'suc-003', person_id: 'person-suc-007', current_position_title: 'Finance Manager', readiness: 'Ready Now', development_areas: ['Investor relations'], readiness_score: 90, metadata: {} },
  { id: 'successor-005', succession_plan_id: 'suc-003', person_id: 'person-suc-008', current_position_title: 'Senior Accountant', readiness: '3-5 Years', development_areas: ['Management', 'Strategy', 'Forecasting'], readiness_score: 45, metadata: {} },
];

// =============================================================================
// UNION RULES (3NF Compliant - uses union_org_id references)
// =============================================================================

export interface DemoUnionRule {
  id: string;
  organization_id: string;
  union_org_id: string;
  union_name: string;
  category: string;
  rule_name: string;
  description: string;
  effective_date: string;
  expiration_date?: string;
  status: 'Active' | 'Pending' | 'Expired';
  penalty_type?: string;
  penalty_amount?: number;
  penalty_currency?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Union organizations
export const DEMO_UNION_ORGS: DemoLegendOrganization[] = [
  { id: 'org-union-001', organization_id: DEMO_ORGANIZATION_ID, name: 'IATSE Local 1', legal_name: 'International Alliance of Theatrical Stage Employees Local 1', code: 'IA-1', org_type: 'partner', email: 'info@iatselocal1.org', status: 'active', tags: ['union', 'stagehands'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-union-002', organization_id: DEMO_ORGANIZATION_ID, name: 'IBEW Local 3', legal_name: 'International Brotherhood of Electrical Workers Local 3', code: 'IBEW-3', org_type: 'partner', email: 'info@ibewlocal3.org', status: 'active', tags: ['union', 'electrical'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'org-union-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Teamsters Local 817', legal_name: 'International Brotherhood of Teamsters Local 817', code: 'TM-817', org_type: 'partner', email: 'info@teamsters817.org', status: 'active', tags: ['union', 'drivers'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_UNION_RULES: DemoUnionRule[] = [
  { id: 'union-rule-001', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-001', union_name: 'IATSE Local 1', category: 'Work Hours', rule_name: 'Maximum 10-hour call', description: 'Standard work call cannot exceed 10 hours without meal penalty', effective_date: '2024-01-01', status: 'Active', penalty_type: 'Hourly', penalty_amount: 75, penalty_currency: 'USD', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'union-rule-002', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-001', union_name: 'IATSE Local 1', category: 'Meal Breaks', rule_name: '6-hour meal break', description: 'Meal break required within 6 hours of call time', effective_date: '2024-01-01', status: 'Active', penalty_type: 'Per Violation', penalty_amount: 50, penalty_currency: 'USD', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'union-rule-003', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-001', union_name: 'IATSE Local 1', category: 'Turnaround', rule_name: '10-hour turnaround', description: 'Minimum 10 hours between end of call and next call', effective_date: '2024-01-01', status: 'Active', penalty_type: 'Hourly', penalty_amount: 100, penalty_currency: 'USD', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'union-rule-004', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-002', union_name: 'IBEW Local 3', category: 'Overtime', rule_name: 'Double time after 12', description: 'Double time rate applies after 12 hours worked', effective_date: '2024-01-01', status: 'Active', penalty_type: 'Rate Multiplier', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'union-rule-005', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-003', union_name: 'Teamsters Local 817', category: 'Travel', rule_name: 'Portal-to-portal pay', description: 'Pay begins when leaving designated call point', effective_date: '2024-01-01', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// HANDBOOK (3NF Compliant - uses document_id references)
// =============================================================================

export interface DemoHandbookSection {
  id: string;
  organization_id: string;
  document_id?: string;
  title: string;
  category: string;
  version: string;
  last_updated_at: string;
  requires_acknowledgment: boolean;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoPolicyAcknowledgment {
  id: string;
  organization_id: string;
  person_id: string;
  department_id: string;
  department_name: string;
  policy_section_id: string;
  policy_title: string;
  acknowledged_at?: string;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  due_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_HANDBOOK_SECTIONS: DemoHandbookSection[] = [
  { id: 'hb-sec-001', organization_id: DEMO_ORGANIZATION_ID, title: 'Code of Conduct', category: 'General', version: '3.2', last_updated_at: '2024-09-01T00:00:00Z', requires_acknowledgment: true, description: 'Professional behavior standards and ethical guidelines', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-01T00:00:00Z' },
  { id: 'hb-sec-002', organization_id: DEMO_ORGANIZATION_ID, title: 'Anti-Harassment Policy', category: 'Compliance', version: '2.1', last_updated_at: '2024-10-15T00:00:00Z', requires_acknowledgment: true, description: 'Workplace harassment prevention and reporting procedures', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-10-15T00:00:00Z' },
  { id: 'hb-sec-003', organization_id: DEMO_ORGANIZATION_ID, title: 'Safety Procedures', category: 'Safety', version: '4.0', last_updated_at: '2024-11-01T00:00:00Z', requires_acknowledgment: true, description: 'Workplace safety requirements and emergency procedures', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T00:00:00Z' },
  { id: 'hb-sec-004', organization_id: DEMO_ORGANIZATION_ID, title: 'Time Off Policies', category: 'Benefits', version: '2.5', last_updated_at: '2024-08-01T00:00:00Z', requires_acknowledgment: false, description: 'PTO, sick leave, and vacation policies', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-08-01T00:00:00Z' },
  { id: 'hb-sec-005', organization_id: DEMO_ORGANIZATION_ID, title: 'Equipment Usage', category: 'Operations', version: '1.8', last_updated_at: '2024-07-15T00:00:00Z', requires_acknowledgment: true, description: 'Proper use and care of company equipment', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-07-15T00:00:00Z' },
  { id: 'hb-sec-006', organization_id: DEMO_ORGANIZATION_ID, title: 'Confidentiality Agreement', category: 'Legal', version: '2.0', last_updated_at: '2024-06-01T00:00:00Z', requires_acknowledgment: true, description: 'Protection of confidential and proprietary information', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
  { id: 'hb-sec-007', organization_id: DEMO_ORGANIZATION_ID, title: 'Remote Work Policy', category: 'General', version: '1.5', last_updated_at: '2024-09-15T00:00:00Z', requires_acknowledgment: false, description: 'Guidelines for remote and hybrid work arrangements', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-15T00:00:00Z' },
  { id: 'hb-sec-008', organization_id: DEMO_ORGANIZATION_ID, title: 'Drug & Alcohol Policy', category: 'Compliance', version: '2.3', last_updated_at: '2024-05-01T00:00:00Z', requires_acknowledgment: true, description: 'Substance abuse prevention and testing policies', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-05-01T00:00:00Z' },
];

// People for policy acknowledgments (reuse existing person IDs where applicable)
export const DEMO_POLICY_ACKNOWLEDGMENTS: DemoPolicyAcknowledgment[] = [
  { id: 'ack-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-001', department_id: 'dept-production', department_name: 'Production', policy_section_id: 'hb-sec-001', policy_title: 'Code of Conduct', acknowledged_at: '2024-09-15T00:00:00Z', status: 'Acknowledged', due_date: '2024-09-30', metadata: {}, created_at: '2024-09-01T00:00:00Z', updated_at: '2024-09-15T00:00:00Z' },
  { id: 'ack-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-002', department_id: 'dept-finance', department_name: 'Finance', policy_section_id: 'hb-sec-002', policy_title: 'Anti-Harassment Policy', status: 'Pending', due_date: '2024-11-30', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ack-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-003', department_id: 'dept-operations', department_name: 'Operations', policy_section_id: 'hb-sec-003', policy_title: 'Safety Procedures', status: 'Overdue', due_date: '2024-11-15', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ack-004', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-004', department_id: 'dept-audio', department_name: 'Audio', policy_section_id: 'hb-sec-001', policy_title: 'Code of Conduct', acknowledged_at: '2024-09-20T00:00:00Z', status: 'Acknowledged', due_date: '2024-09-30', metadata: {}, created_at: '2024-09-01T00:00:00Z', updated_at: '2024-09-20T00:00:00Z' },
  { id: 'ack-005', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-bgc-005', department_id: 'dept-lighting', department_name: 'Lighting', policy_section_id: 'hb-sec-006', policy_title: 'Confidentiality Agreement', status: 'Pending', due_date: '2024-12-01', metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// LABOR LAWS (3NF Compliant - uses place_id for state references)
// =============================================================================

export interface DemoStateLaborLaw {
  id: string;
  organization_id: string;
  state_place_id?: string;
  state_name: string;
  state_code: string;
  category: string;
  requirement_name: string;
  description: string;
  effective_date: string;
  last_updated_at: string;
  status: 'Active' | 'Updated' | 'Pending';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_STATE_LABOR_LAWS: DemoStateLaborLaw[] = [
  { id: 'law-001', organization_id: DEMO_ORGANIZATION_ID, state_name: 'California', state_code: 'CA', category: 'Meal Breaks', requirement_name: '30-min meal break', description: 'Employees must receive a 30-minute unpaid meal break for shifts over 5 hours', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-002', organization_id: DEMO_ORGANIZATION_ID, state_name: 'California', state_code: 'CA', category: 'Rest Breaks', requirement_name: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-003', organization_id: DEMO_ORGANIZATION_ID, state_name: 'California', state_code: 'CA', category: 'Overtime', requirement_name: 'Daily overtime', description: 'Overtime after 8 hours in a day, double time after 12 hours', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-004', organization_id: DEMO_ORGANIZATION_ID, state_name: 'New York', state_code: 'NY', category: 'Meal Breaks', requirement_name: '30-min meal break', description: 'Meal break required for shifts over 6 hours spanning noon', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-005', organization_id: DEMO_ORGANIZATION_ID, state_name: 'New York', state_code: 'NY', category: 'Spread of Hours', requirement_name: 'Extra hour pay', description: 'Additional hour at minimum wage if workday exceeds 10 hours', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-006', organization_id: DEMO_ORGANIZATION_ID, state_name: 'Texas', state_code: 'TX', category: 'Overtime', requirement_name: 'Federal FLSA only', description: 'Texas follows federal overtime rules - overtime after 40 hours/week', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 'law-007', organization_id: DEMO_ORGANIZATION_ID, state_name: 'Illinois', state_code: 'IL', category: 'Meal Breaks', requirement_name: '20-min meal break', description: '20-minute meal break for shifts of 7.5+ hours', effective_date: '2024-01-01', last_updated_at: '2024-06-01T00:00:00Z', status: 'Updated', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-06-01T00:00:00Z' },
  { id: 'law-008', organization_id: DEMO_ORGANIZATION_ID, state_name: 'Nevada', state_code: 'NV', category: 'Rest Breaks', requirement_name: '10-min rest per 4 hours', description: 'Paid 10-minute rest break for every 4 hours worked', effective_date: '2024-01-01', last_updated_at: '2024-01-01T00:00:00Z', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

// =============================================================================
// UNION COMPLIANCE (3NF Compliant - uses union_org_id and person_id references)
// =============================================================================

export interface DemoUnionLocal {
  id: string;
  organization_id: string;
  union_org_id: string;
  name: string;
  code: string;
  jurisdiction: string;
  member_count: number;
  contact_person_id?: string;
  contact_name: string;
  contact_phone: string;
  agreement_expiry_date: string;
  status: 'Active' | 'Expiring' | 'Expired';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoUnionComplianceRule {
  id: string;
  organization_id: string;
  union_local_id: string;
  category: string;
  rule_name: string;
  requirement: string;
  penalty?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Additional union org for Local 33
export const DEMO_UNION_ORG_LOCAL33: DemoLegendOrganization = { id: 'org-union-004', organization_id: DEMO_ORGANIZATION_ID, name: 'IATSE Local 33', legal_name: 'International Alliance of Theatrical Stage Employees Local 33', code: 'IA-33', org_type: 'partner', email: 'info@iatselocal33.org', status: 'active', tags: ['union', 'stagehands'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' };

export const DEMO_UNION_LOCALS: DemoUnionLocal[] = [
  { id: 'ul-001', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-001', name: 'IATSE Local 1', code: 'IA-1', jurisdiction: 'New York', member_count: 3200, contact_name: 'John Smith', contact_phone: '212-555-0100', agreement_expiry_date: '2025-06-30', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ul-002', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-004', name: 'IATSE Local 33', code: 'IA-33', jurisdiction: 'Los Angeles', member_count: 2800, contact_name: 'Maria Garcia', contact_phone: '323-555-0200', agreement_expiry_date: '2025-03-15', status: 'Expiring', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ul-003', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-002', name: 'IBEW Local 3', code: 'IBEW-3', jurisdiction: 'New York', member_count: 1500, contact_name: 'Robert Johnson', contact_phone: '212-555-0300', agreement_expiry_date: '2024-12-31', status: 'Expiring', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ul-004', organization_id: DEMO_ORGANIZATION_ID, union_org_id: 'org-union-003', name: 'Teamsters Local 817', code: 'TM-817', jurisdiction: 'New York', member_count: 890, contact_name: 'Sarah Davis', contact_phone: '212-555-0400', agreement_expiry_date: '2025-09-30', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_UNION_COMPLIANCE_RULES: DemoUnionComplianceRule[] = [
  { id: 'ucr-001', organization_id: DEMO_ORGANIZATION_ID, union_local_id: 'ul-001', category: 'Work Hours', rule_name: '8-Hour Day', requirement: 'Overtime after 8 hours at 1.5x rate', penalty: 'Back pay + penalties', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ucr-002', organization_id: DEMO_ORGANIZATION_ID, union_local_id: 'ul-001', category: 'Meal Breaks', rule_name: 'Meal Penalty', requirement: '6-hour meal break maximum', penalty: '$50/30min violation', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ucr-003', organization_id: DEMO_ORGANIZATION_ID, union_local_id: 'ul-001', category: 'Turnaround', rule_name: '12-Hour Rest', requirement: 'Minimum 12 hours between calls', penalty: 'Golden time rates', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ucr-004', organization_id: DEMO_ORGANIZATION_ID, union_local_id: 'ul-002', category: 'Staffing', rule_name: 'Minimum Crew', requirement: '4-person minimum for rigging calls', penalty: 'Full crew pay required', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// EMAIL THREADS (3NF Compliant - uses org_id and deal_id references)
// =============================================================================

export interface DemoEmailThread {
  id: string;
  organization_id: string;
  subject: string;
  from_email: string;
  to_email: string;
  received_at: string;
  preview: string;
  linked_contact_org_id?: string;
  linked_deal_id?: string;
  status: 'Unread' | 'Read' | 'Replied';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_EMAIL_THREADS: DemoEmailThread[] = [
  { id: 'email-001', organization_id: DEMO_ORGANIZATION_ID, subject: 'Re: Summer Festival Proposal', from_email: 'client@festival.com', to_email: 'john.smith@company.com', received_at: '2024-11-25T10:30:00Z', preview: 'Thanks for sending over the proposal. We have reviewed it and have a few questions...', linked_contact_org_id: 'org-client-001', linked_deal_id: 'deal-001', status: 'Unread', metadata: {}, created_at: '2024-11-25T10:30:00Z', updated_at: '2024-11-25T10:30:00Z' },
  { id: 'email-002', organization_id: DEMO_ORGANIZATION_ID, subject: 'Equipment Quote Request', from_email: 'vendor@audiohouse.com', to_email: 'john.smith@company.com', received_at: '2024-11-25T09:15:00Z', preview: 'Please find attached our quote for the L-Acoustics system rental...', linked_contact_org_id: 'org-vendor-004', status: 'Read', metadata: {}, created_at: '2024-11-25T09:15:00Z', updated_at: '2024-11-25T10:00:00Z' },
  { id: 'email-003', organization_id: DEMO_ORGANIZATION_ID, subject: 'Contract Review - Corporate Gala', from_email: 'legal@techcorp.com', to_email: 'sales@company.com', received_at: '2024-11-24T16:45:00Z', preview: 'Our legal team has completed the review. Please see the attached redlines...', linked_contact_org_id: 'org-client-002', linked_deal_id: 'deal-002', status: 'Replied', metadata: {}, created_at: '2024-11-24T16:45:00Z', updated_at: '2024-11-24T17:30:00Z' },
  { id: 'email-004', organization_id: DEMO_ORGANIZATION_ID, subject: 'Meeting Confirmation', from_email: 'assistant@venue.com', to_email: 'john.smith@company.com', received_at: '2024-11-24T14:20:00Z', preview: 'This confirms your site visit scheduled for November 28th at 2:00 PM...', linked_contact_org_id: 'org-client-003', status: 'Read', metadata: {}, created_at: '2024-11-24T14:20:00Z', updated_at: '2024-11-24T15:00:00Z' },
];

// =============================================================================
// CRM LEAD SCORING (3NF Compliant - uses person_id and org_id references)
// =============================================================================

export interface DemoCrmLead {
  id: string;
  organization_id: string;
  person_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  company_org_id?: string;
  company_name: string;
  email: string;
  source: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  last_activity_at: string;
  engagement_score: number;
  fit_score: number;
  behavior_score: number;
  assigned_to_person_id?: string;
  estimated_value?: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// CRM Lead people
export const DEMO_CRM_LEAD_PEOPLE: DemoLegendPerson[] = [
  { id: 'person-crm-lead-001', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Sarah', last_name: 'Mitchell', display_name: 'Sarah Mitchell', title: 'Event Manager', email: 'sarah@techcorp.com', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'person-crm-lead-002', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Michael', last_name: 'Chen', display_name: 'Michael Chen', title: 'Director', email: 'mchen@festprod.com', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-23T00:00:00Z' },
  { id: 'person-crm-lead-003', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Emily', last_name: 'Rodriguez', display_name: 'Emily Rodriguez', title: 'VP Events', email: 'emily@corpevents.com', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'person-crm-lead-004', organization_id: DEMO_ORGANIZATION_ID, first_name: 'David', last_name: 'Park', display_name: 'David Park', title: 'CEO', email: 'dpark@startup.io', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-11-24T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'person-crm-lead-005', organization_id: DEMO_ORGANIZATION_ID, first_name: 'Lisa', last_name: 'Thompson', display_name: 'Lisa Thompson', title: 'Owner', email: 'lisa@local.com', status: 'active', tags: ['lead'], metadata: {}, created_at: '2024-11-18T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_CRM_LEADS: DemoCrmLead[] = [
  { id: 'crm-lead-001', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-crm-lead-001', first_name: 'Sarah', last_name: 'Mitchell', display_name: 'Sarah Mitchell', company_name: 'TechCorp Events', email: 'sarah@techcorp.com', source: 'Website', score: 92, grade: 'A', status: 'Qualified', last_activity_at: '2024-11-24T00:00:00Z', engagement_score: 85, fit_score: 95, behavior_score: 90, assigned_to_person_id: 'person-crm-001', estimated_value: 125000, currency: 'USD', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'crm-lead-002', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-crm-lead-002', first_name: 'Michael', last_name: 'Chen', display_name: 'Michael Chen', company_name: 'Festival Productions', email: 'mchen@festprod.com', source: 'Referral', score: 78, grade: 'B', status: 'Proposal', last_activity_at: '2024-11-23T00:00:00Z', engagement_score: 70, fit_score: 85, behavior_score: 75, assigned_to_person_id: 'person-crm-002', estimated_value: 85000, currency: 'USD', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-23T00:00:00Z' },
  { id: 'crm-lead-003', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-crm-lead-003', first_name: 'Emily', last_name: 'Rodriguez', display_name: 'Emily Rodriguez', company_name: 'Corporate Events Inc', email: 'emily@corpevents.com', source: 'Trade Show', score: 65, grade: 'B', status: 'Contacted', last_activity_at: '2024-11-22T00:00:00Z', engagement_score: 60, fit_score: 70, behavior_score: 65, estimated_value: 45000, currency: 'USD', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'crm-lead-004', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-crm-lead-004', first_name: 'David', last_name: 'Park', display_name: 'David Park', company_name: 'StartUp Ventures', email: 'dpark@startup.io', source: 'LinkedIn', score: 45, grade: 'C', status: 'New', last_activity_at: '2024-11-24T00:00:00Z', engagement_score: 40, fit_score: 50, behavior_score: 45, estimated_value: 25000, currency: 'USD', metadata: {}, created_at: '2024-11-24T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'crm-lead-005', organization_id: DEMO_ORGANIZATION_ID, person_id: 'person-crm-lead-005', first_name: 'Lisa', last_name: 'Thompson', display_name: 'Lisa Thompson', company_name: 'Local Business', email: 'lisa@local.com', source: 'Cold Outreach', score: 28, grade: 'D', status: 'Contacted', last_activity_at: '2024-11-20T00:00:00Z', engagement_score: 25, fit_score: 30, behavior_score: 30, estimated_value: 10000, currency: 'USD', metadata: {}, created_at: '2024-11-18T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// CALIBRATION RECORDS (3NF Compliant - uses asset_id and vendor_org_id references)
// =============================================================================

export interface DemoCalibrationRecord {
  id: string;
  organization_id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  calibration_type: string;
  last_calibration_at: string;
  next_due_at: string;
  frequency: string;
  status: 'Current' | 'Due Soon' | 'Overdue' | 'Scheduled';
  certified_by_org_id?: string;
  certified_by_name?: string;
  certificate_number?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CALIBRATION_RECORDS: DemoCalibrationRecord[] = [
  { id: 'cal-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-010', asset_name: 'Fluke 87V Multimeter', category: 'Test Equipment', calibration_type: 'Electrical Calibration', last_calibration_at: '2024-06-15T00:00:00Z', next_due_at: '2025-06-15T00:00:00Z', frequency: 'Annual', status: 'Current', certified_by_name: 'Cal Labs Inc', certificate_number: 'CL-2024-4521', metadata: {}, created_at: '2024-06-15T00:00:00Z', updated_at: '2024-06-15T00:00:00Z' },
  { id: 'cal-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-011', asset_name: 'NTI Audio XL2', category: 'Audio Measurement', calibration_type: 'Acoustic Calibration', last_calibration_at: '2024-03-20T00:00:00Z', next_due_at: '2024-12-20T00:00:00Z', frequency: '9 Months', status: 'Due Soon', certified_by_name: 'NTI Americas', certificate_number: 'NTI-2024-8892', metadata: {}, created_at: '2024-03-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cal-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-012', asset_name: 'CM Lodestar Load Cell', category: 'Rigging', calibration_type: 'Load Certification', last_calibration_at: '2024-01-10T00:00:00Z', next_due_at: '2024-07-10T00:00:00Z', frequency: '6 Months', status: 'Overdue', certified_by_name: 'Rigging Safety Inc', certificate_number: 'RS-2024-1123', metadata: {}, created_at: '2024-01-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'cal-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-013', asset_name: 'Minolta CL-200A', category: 'Lighting Measurement', calibration_type: 'Photometric Calibration', last_calibration_at: '2024-08-01T00:00:00Z', next_due_at: '2025-08-01T00:00:00Z', frequency: 'Annual', status: 'Current', certified_by_name: 'Konica Minolta', certificate_number: 'KM-2024-5567', metadata: {}, created_at: '2024-08-01T00:00:00Z', updated_at: '2024-08-01T00:00:00Z' },
  { id: 'cal-005', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-014', asset_name: 'Laser Distance Meter', category: 'Survey Equipment', calibration_type: 'Distance Calibration', last_calibration_at: '2024-09-15T00:00:00Z', next_due_at: '2024-12-15T00:00:00Z', frequency: 'Quarterly', status: 'Scheduled', certified_by_name: 'Precision Labs', certificate_number: 'PL-2024-9901', notes: 'Scheduled for Dec 10', metadata: {}, created_at: '2024-09-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// DAMAGE REPORTS (3NF Compliant - uses asset_id, person_id, and place_id references)
// =============================================================================

export interface DemoDamageReport {
  id: string;
  organization_id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  reported_by_person_id: string;
  reported_by_name: string;
  reported_at: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  status: 'Reported' | 'Under Review' | 'Repair Scheduled' | 'In Repair' | 'Resolved' | 'Write-Off';
  description: string;
  location_place_id?: string;
  location_name: string;
  project_id?: string;
  estimated_cost?: number;
  actual_cost?: number;
  currency: string;
  insurance_claim?: boolean;
  photos?: string[];
  repair_vendor_org_id?: string;
  repair_vendor_name?: string;
  resolved_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_DAMAGE_REPORTS: DemoDamageReport[] = [
  { id: 'dmg-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-003', asset_name: 'disguise gx 2c Media Server', category: 'Video', reported_by_person_id: 'person-dmg-001', reported_by_name: 'Mike Thompson', reported_at: '2024-11-20T00:00:00Z', severity: 'Moderate', status: 'In Repair', description: 'Fan failure causing overheating. Unit shut down during show.', location_name: 'Tampa Convention Center', project_id: 'proj-089', estimated_cost: 1200, currency: 'USD', repair_vendor_name: 'PRG Technical Services', insurance_claim: false, metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'dmg-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-002', asset_name: 'Robe MegaPointe #7', category: 'Lighting', reported_by_person_id: 'person-dmg-002', reported_by_name: 'Sarah Chen', reported_at: '2024-11-18T00:00:00Z', severity: 'Major', status: 'Repair Scheduled', description: 'Gobo wheel motor seized. Complete motor assembly replacement needed.', location_name: 'Warehouse A', estimated_cost: 850, currency: 'USD', repair_vendor_name: 'Robe Service Center', insurance_claim: false, metadata: {}, created_at: '2024-11-18T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'dmg-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-004', asset_name: 'Staging Deck Module #23', category: 'Staging', reported_by_person_id: 'person-dmg-003', reported_by_name: 'Tom Wilson', reported_at: '2024-11-15T00:00:00Z', severity: 'Minor', status: 'Resolved', description: 'Surface scratches from load-in. Cosmetic only.', location_name: 'Amalie Arena', project_id: 'proj-088', estimated_cost: 150, actual_cost: 120, currency: 'USD', resolved_at: '2024-11-17T00:00:00Z', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-17T00:00:00Z' },
  { id: 'dmg-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-005', asset_name: 'Chain Motor Hoist #12', category: 'Rigging', reported_by_person_id: 'person-dmg-004', reported_by_name: 'John Martinez', reported_at: '2024-11-22T00:00:00Z', severity: 'Critical', status: 'Under Review', description: 'Chain slippage detected during load test. Removed from service pending inspection.', location_name: 'Warehouse A', currency: 'USD', insurance_claim: true, metadata: {}, created_at: '2024-11-22T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
];

// =============================================================================
// IDLE ASSETS (3NF Compliant - uses asset_id and place_id references)
// =============================================================================

export interface DemoIdleAsset {
  id: string;
  organization_id: string;
  asset_id: string;
  name: string;
  category: string;
  idle_days: number;
  last_used_at: string;
  location_place_id?: string;
  location_name: string;
  value: number;
  monthly_carry_cost: number;
  currency: string;
  recommendation: 'Sell' | 'Rent Out' | 'Redeploy' | 'Monitor';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_IDLE_ASSETS: DemoIdleAsset[] = [
  { id: 'idle-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-101', name: 'Meyer Sound LYON', category: 'Audio', idle_days: 45, last_used_at: '2024-10-10T00:00:00Z', location_name: 'Warehouse A', value: 85000, monthly_carry_cost: 850, currency: 'USD', recommendation: 'Rent Out', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'idle-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-102', name: 'Robe MegaPointe (12)', category: 'Lighting', idle_days: 62, last_used_at: '2024-09-23T00:00:00Z', location_name: 'Warehouse B', value: 48000, monthly_carry_cost: 480, currency: 'USD', recommendation: 'Redeploy', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'idle-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-103', name: 'Blackmagic ATEM 4K', category: 'Video', idle_days: 90, last_used_at: '2024-08-26T00:00:00Z', location_name: 'Warehouse A', value: 12000, monthly_carry_cost: 120, currency: 'USD', recommendation: 'Sell', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'idle-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-104', name: 'CM Lodestar 2T (8)', category: 'Rigging', idle_days: 30, last_used_at: '2024-10-25T00:00:00Z', location_name: 'Warehouse C', value: 32000, monthly_carry_cost: 320, currency: 'USD', recommendation: 'Monitor', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'idle-005', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-105', name: 'Stageline SL100', category: 'Staging', idle_days: 120, last_used_at: '2024-07-26T00:00:00Z', location_name: 'Yard', value: 95000, monthly_carry_cost: 1200, currency: 'USD', recommendation: 'Sell', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ASSET KITS (3NF Compliant - uses asset_id references with separate kit_items table)
// =============================================================================

export interface DemoAssetKitItem {
  id: string;
  kit_id: string;
  asset_id?: string;
  name: string;
  quantity: number;
  category: string;
}

export interface DemoAssetKit {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  item_count: number;
  total_value: number;
  currency: string;
  status: 'Available' | 'Deployed' | 'Partial';
  last_used_at?: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSET_KITS: DemoAssetKit[] = [
  { id: 'kit-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Festival Main Stage Audio', category: 'Audio', item_count: 48, total_value: 425000, currency: 'USD', status: 'Available', last_used_at: '2024-11-15T00:00:00Z', description: 'Complete L-Acoustics K2 system with subs and processing', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'kit-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Corporate Event Lighting', category: 'Lighting', item_count: 32, total_value: 85000, currency: 'USD', status: 'Deployed', last_used_at: '2024-11-20T00:00:00Z', description: 'Versatile lighting package for corporate events', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'kit-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Video Wall 20x10', category: 'Video', item_count: 200, total_value: 320000, currency: 'USD', status: 'Available', description: 'ROE CB5 LED wall configuration', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'kit-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Outdoor Stage Package', category: 'Staging', item_count: 156, total_value: 175000, currency: 'USD', status: 'Partial', description: '40x32 outdoor stage with roof system', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_ASSET_KIT_ITEMS: DemoAssetKitItem[] = [
  { id: 'kit-item-001', kit_id: 'kit-001', name: 'L-Acoustics K2', quantity: 24, category: 'Speakers' },
  { id: 'kit-item-002', kit_id: 'kit-001', name: 'KS28 Subs', quantity: 16, category: 'Speakers' },
  { id: 'kit-item-003', kit_id: 'kit-001', name: 'LA12X Amps', quantity: 8, category: 'Amplifiers' },
  { id: 'kit-item-004', kit_id: 'kit-002', name: 'Clay Paky Sharpy', quantity: 12, category: 'Moving Lights' },
  { id: 'kit-item-005', kit_id: 'kit-002', name: 'ETC Source Four', quantity: 16, category: 'Conventionals' },
  { id: 'kit-item-006', kit_id: 'kit-002', name: 'grandMA3', quantity: 1, category: 'Consoles' },
  { id: 'kit-item-007', kit_id: 'kit-003', name: 'ROE CB5 Panels', quantity: 200, category: 'LED' },
  { id: 'kit-item-008', kit_id: 'kit-003', name: 'Brompton Processors', quantity: 4, category: 'Processing' },
  { id: 'kit-item-009', kit_id: 'kit-004', name: 'Stage Decks', quantity: 80, category: 'Decking' },
  { id: 'kit-item-010', kit_id: 'kit-004', name: 'Roof Sections', quantity: 24, category: 'Roof' },
  { id: 'kit-item-011', kit_id: 'kit-004', name: 'Legs 4ft', quantity: 52, category: 'Support' },
];

// =============================================================================
// OPTIMIZATION RECOMMENDATIONS (3NF Compliant - uses asset_id references)
// =============================================================================

export interface DemoOptimizationRecommendation {
  id: string;
  organization_id: string;
  type: 'underutilized' | 'overutilized' | 'maintenance_due' | 'replacement' | 'consolidation' | 'reallocation';
  priority: 'high' | 'medium' | 'low';
  asset_id: string;
  asset_name: string;
  category: string;
  current_utilization: number;
  target_utilization: number;
  recommendation: string;
  potential_savings: number;
  currency: string;
  action_items: string[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_OPTIMIZATION_RECOMMENDATIONS: DemoOptimizationRecommendation[] = [
  { id: 'rec-001', organization_id: DEMO_ORGANIZATION_ID, type: 'underutilized', priority: 'high', asset_id: 'asset-001', asset_name: 'LED Wall Panel Set A', category: 'Video', current_utilization: 15, target_utilization: 60, recommendation: 'Consider rental pooling or sale. Asset has been idle for 85% of the quarter.', potential_savings: 25000, currency: 'USD', action_items: ['List on rental marketplace', 'Get appraisal for sale', 'Review upcoming project needs'], status: 'pending', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rec-002', organization_id: DEMO_ORGANIZATION_ID, type: 'overutilized', priority: 'medium', asset_id: 'asset-002', asset_name: 'Meyer Sound Line Array', category: 'Audio', current_utilization: 95, target_utilization: 75, recommendation: 'High demand asset. Consider purchasing additional units to reduce scheduling conflicts.', potential_savings: 15000, currency: 'USD', action_items: ['Request capital budget', 'Evaluate rental costs vs purchase', 'Review booking conflicts'], status: 'in_progress', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rec-003', organization_id: DEMO_ORGANIZATION_ID, type: 'maintenance_due', priority: 'high', asset_id: 'asset-003', asset_name: 'Lighting Console grandMA3', category: 'Lighting', current_utilization: 70, target_utilization: 70, recommendation: 'Preventive maintenance overdue by 30 days. Schedule service to avoid downtime.', potential_savings: 5000, currency: 'USD', action_items: ['Schedule maintenance window', 'Arrange backup console', 'Update service records'], status: 'pending', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rec-004', organization_id: DEMO_ORGANIZATION_ID, type: 'consolidation', priority: 'low', asset_id: 'asset-004', asset_name: 'Cable Inventory', category: 'Infrastructure', current_utilization: 40, target_utilization: 60, recommendation: 'Multiple cable types with low utilization. Consolidate to standard types.', potential_savings: 8000, currency: 'USD', action_items: ['Audit cable inventory', 'Identify redundant types', 'Create standardization plan'], status: 'pending', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rec-005', organization_id: DEMO_ORGANIZATION_ID, type: 'replacement', priority: 'medium', asset_id: 'asset-005', asset_name: 'PTZ Camera Set', category: 'Video', current_utilization: 65, target_utilization: 70, recommendation: 'Asset approaching end of life. Plan replacement within 6 months.', potential_savings: 12000, currency: 'USD', action_items: ['Research replacement models', 'Get quotes', 'Plan transition timeline'], status: 'pending', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ASSET PERFORMANCE (3NF Compliant - uses asset_id references)
// =============================================================================

export interface DemoAssetPerformance {
  id: string;
  organization_id: string;
  asset_id: string;
  name: string;
  category: string;
  utilization_rate: number;
  uptime_percentage: number;
  failure_count: number;
  mtbf_hours: number;
  mttr_hours: number;
  health_score: number;
  predicted_failure_at?: string;
  last_maintenance_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSET_PERFORMANCE: DemoAssetPerformance[] = [
  { id: 'perf-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-001', name: 'L-Acoustics K2 Array', category: 'Audio', utilization_rate: 78, uptime_percentage: 99.2, failure_count: 1, mtbf_hours: 2400, mttr_hours: 4, health_score: 92, last_maintenance_at: '2024-10-15T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'perf-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-002', name: 'Clay Paky Sharpy Plus', category: 'Lighting', utilization_rate: 85, uptime_percentage: 98.5, failure_count: 3, mtbf_hours: 1800, mttr_hours: 2, health_score: 88, predicted_failure_at: '2025-02-15T00:00:00Z', last_maintenance_at: '2024-11-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'perf-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-003', name: 'ROE Visual CB5 Panels', category: 'Video', utilization_rate: 62, uptime_percentage: 99.8, failure_count: 0, mtbf_hours: 3200, mttr_hours: 1, health_score: 98, last_maintenance_at: '2024-09-20T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'perf-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-004', name: 'CM Lodestar 1T Hoists', category: 'Rigging', utilization_rate: 71, uptime_percentage: 99.5, failure_count: 2, mtbf_hours: 2100, mttr_hours: 6, health_score: 85, predicted_failure_at: '2025-01-20T00:00:00Z', last_maintenance_at: '2024-10-25T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'perf-005', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-005', name: 'DiGiCo SD12 Console', category: 'Audio', utilization_rate: 92, uptime_percentage: 100, failure_count: 0, mtbf_hours: 4000, mttr_hours: 0, health_score: 100, last_maintenance_at: '2024-11-10T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// RENTAL EQUIPMENT (3NF Compliant - uses vendor_org_id and project_id references)
// =============================================================================

export interface DemoRentalEquipment {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  vendor_org_id?: string;
  vendor_name: string;
  project_id?: string;
  project_name: string;
  rental_start_at: string;
  rental_end_at: string;
  daily_rate: number;
  total_cost: number;
  currency: string;
  status: 'Reserved' | 'On Rent' | 'Returned' | 'Overdue';
  po_number?: string;
  condition: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_RENTAL_EQUIPMENT: DemoRentalEquipment[] = [
  { id: 'rental-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Barco UDX-4K32', category: 'Video', vendor_name: 'PRG', project_name: 'Summer Fest 2024', rental_start_at: '2024-11-20T00:00:00Z', rental_end_at: '2024-11-26T00:00:00Z', daily_rate: 1500, total_cost: 10500, currency: 'USD', status: 'On Rent', po_number: 'PO-2024-456', condition: 'Excellent', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rental-002', organization_id: DEMO_ORGANIZATION_ID, name: 'd&b audiotechnik SL-SUB', category: 'Audio', vendor_name: 'Sound Systems Inc', project_name: 'Summer Fest 2024', rental_start_at: '2024-11-20T00:00:00Z', rental_end_at: '2024-11-26T00:00:00Z', daily_rate: 200, total_cost: 1400, currency: 'USD', status: 'On Rent', po_number: 'PO-2024-457', condition: 'Good', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rental-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Stageline SL-320 Mobile Stage', category: 'Staging', vendor_name: 'Stageline', project_name: 'Summer Fest 2024', rental_start_at: '2024-11-18T00:00:00Z', rental_end_at: '2024-11-27T00:00:00Z', daily_rate: 3500, total_cost: 35000, currency: 'USD', status: 'On Rent', po_number: 'PO-2024-450', condition: 'Good', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-18T00:00:00Z' },
  { id: 'rental-004', organization_id: DEMO_ORGANIZATION_ID, name: 'CM Lodestar 2-Ton (x10)', category: 'Rigging', vendor_name: 'Rigging Solutions', project_name: 'Corporate Gala', rental_start_at: '2024-12-01T00:00:00Z', rental_end_at: '2024-12-05T00:00:00Z', daily_rate: 150, total_cost: 750, currency: 'USD', status: 'Reserved', condition: 'Excellent', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'rental-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Avolites Arena Console', category: 'Lighting', vendor_name: '4Wall', project_name: 'Fall Festival', rental_start_at: '2024-11-10T00:00:00Z', rental_end_at: '2024-11-16T00:00:00Z', daily_rate: 500, total_cost: 3500, currency: 'USD', status: 'Returned', po_number: 'PO-2024-440', condition: 'Good', metadata: {}, created_at: '2024-11-05T00:00:00Z', updated_at: '2024-11-16T00:00:00Z' },
  { id: 'rental-006', organization_id: DEMO_ORGANIZATION_ID, name: 'Shure ULXD4Q Wireless', category: 'Audio', vendor_name: 'PRG', project_name: 'Fall Festival', rental_start_at: '2024-11-10T00:00:00Z', rental_end_at: '2024-11-16T00:00:00Z', daily_rate: 75, total_cost: 525, currency: 'USD', status: 'Overdue', po_number: 'PO-2024-441', condition: 'Good', metadata: {}, created_at: '2024-11-05T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// STORAGE LOCATIONS (3NF Compliant - uses place_id references)
// =============================================================================

export interface DemoStorageLocation {
  id: string;
  organization_id: string;
  place_id?: string;
  name: string;
  location_type: 'Warehouse' | 'Bay' | 'Rack' | 'Container';
  capacity_sqft: number;
  used_sqft: number;
  category: string;
  address?: string;
  climate: 'Standard' | 'Climate Controlled' | 'Outdoor';
  status: 'Active' | 'Full' | 'Maintenance';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_STORAGE_LOCATIONS: DemoStorageLocation[] = [
  { id: 'storage-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Main Warehouse', location_type: 'Warehouse', capacity_sqft: 50000, used_sqft: 38500, category: 'All', address: '123 Industrial Blvd', climate: 'Climate Controlled', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'storage-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Audio Bay A', location_type: 'Bay', capacity_sqft: 5000, used_sqft: 4200, category: 'Audio', climate: 'Climate Controlled', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'storage-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Lighting Bay B', location_type: 'Bay', capacity_sqft: 5000, used_sqft: 4800, category: 'Lighting', climate: 'Standard', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'storage-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Video Storage', location_type: 'Bay', capacity_sqft: 3000, used_sqft: 3000, category: 'Video', climate: 'Climate Controlled', status: 'Full', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'storage-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Rigging Container', location_type: 'Container', capacity_sqft: 2000, used_sqft: 1500, category: 'Rigging', climate: 'Outdoor', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'storage-006', organization_id: DEMO_ORGANIZATION_ID, name: 'Staging Yard', location_type: 'Warehouse', capacity_sqft: 20000, used_sqft: 12000, category: 'Staging', address: '456 Staging Way', climate: 'Outdoor', status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ASSET TRACKING (3NF Compliant - uses asset_id and place_id references)
// =============================================================================

export interface DemoAssetLocation {
  id: string;
  organization_id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  tracking_type: 'GPS' | 'RFID' | 'Manual';
  location_place_id?: string;
  location_name: string;
  location_address: string;
  zone?: string;
  last_seen_at: string;
  status: 'Active' | 'In Transit' | 'Stationary' | 'Offline';
  battery_level?: number;
  assigned_project_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSET_LOCATIONS: DemoAssetLocation[] = [
  { id: 'track-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-001', asset_name: 'Meyer Sound LEO Line Array', category: 'Audio', tracking_type: 'GPS', location_name: 'Tampa Convention Center', location_address: '333 S Franklin St, Tampa, FL', zone: 'Loading Dock A', last_seen_at: '2024-11-24T14:32:00Z', status: 'Active', battery_level: 87, assigned_project_id: 'proj-089', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T14:32:00Z' },
  { id: 'track-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-002', asset_name: 'Robe MegaPointe (24x)', category: 'Lighting', tracking_type: 'RFID', location_name: 'Warehouse A', location_address: '1234 Industrial Blvd, Tampa, FL', zone: 'Bay 1 - Rack C', last_seen_at: '2024-11-24T15:00:00Z', status: 'Stationary', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T15:00:00Z' },
  { id: 'track-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-003', asset_name: 'disguise gx 2c Media Server', category: 'Video', tracking_type: 'GPS', location_name: 'In Transit', location_address: 'I-4 East, Orlando, FL', last_seen_at: '2024-11-24T14:45:00Z', status: 'In Transit', battery_level: 92, assigned_project_id: 'proj-091', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T14:45:00Z' },
  { id: 'track-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-004', asset_name: 'Staging Deck System', category: 'Staging', tracking_type: 'Manual', location_name: 'Warehouse B', location_address: '5678 Storage Way, Tampa, FL', zone: 'Ground Level - Section D', last_seen_at: '2024-11-23T16:00:00Z', status: 'Stationary', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-23T16:00:00Z' },
  { id: 'track-005', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-005', asset_name: 'Chain Motor Hoists (20x)', category: 'Rigging', tracking_type: 'RFID', location_name: 'Amalie Arena', location_address: '401 Channelside Dr, Tampa, FL', zone: 'Rigging Grid - Section 4', last_seen_at: '2024-11-24T10:00:00Z', status: 'Active', assigned_project_id: 'proj-088', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-24T10:00:00Z' },
];

// =============================================================================
// ASSET UTILIZATION (3NF Compliant - uses asset_id references)
// =============================================================================

export interface DemoAssetUtilization {
  id: string;
  organization_id: string;
  asset_id: string;
  name: string;
  category: string;
  purchase_price: number;
  current_value: number;
  total_revenue: number;
  currency: string;
  utilization_rate: number;
  days_deployed: number;
  project_count: number;
  roi_percentage: number;
  cost_per_day: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSET_UTILIZATION: DemoAssetUtilization[] = [
  { id: 'util-001', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-001', name: 'Meyer Sound LEO Line Array', category: 'Audio', purchase_price: 285000, current_value: 228000, total_revenue: 142500, currency: 'USD', utilization_rate: 0.82, days_deployed: 299, project_count: 47, roi_percentage: 50, cost_per_day: 780, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'util-002', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-002', name: 'Robe MegaPointe (24x)', category: 'Lighting', purchase_price: 156000, current_value: 124800, total_revenue: 98400, currency: 'USD', utilization_rate: 0.91, days_deployed: 332, project_count: 52, roi_percentage: 63, cost_per_day: 427, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'util-003', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-003', name: 'disguise gx 2c Media Server', category: 'Video', purchase_price: 48000, current_value: 38400, total_revenue: 28500, currency: 'USD', utilization_rate: 0.75, days_deployed: 274, project_count: 38, roi_percentage: 59, cost_per_day: 131, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'util-004', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-004', name: 'Staging Deck System', category: 'Staging', purchase_price: 95000, current_value: 76000, total_revenue: 51300, currency: 'USD', utilization_rate: 0.68, days_deployed: 248, project_count: 41, roi_percentage: 54, cost_per_day: 260, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'util-005', organization_id: DEMO_ORGANIZATION_ID, asset_id: 'asset-005', name: 'Chain Motor Hoists (20x)', category: 'Rigging', purchase_price: 42000, current_value: 33600, total_revenue: 33600, currency: 'USD', utilization_rate: 0.79, days_deployed: 288, project_count: 56, roi_percentage: 80, cost_per_day: 115, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// CLIENT RETENTION (3NF Compliant - uses client_org_id references)
// =============================================================================

export interface DemoClientRetention {
  id: string;
  organization_id: string;
  client_org_id?: string;
  client_name: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  first_deal_at: string;
  total_deals: number;
  total_revenue: number;
  currency: string;
  last_deal_at: string;
  status: 'Active' | 'At Risk' | 'Churned' | 'New';
  health_score: number;
  days_since_last_deal: number;
  avg_deal_size: number;
  nps_score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CLIENT_RETENTION: DemoClientRetention[] = [
  { id: 'retention-001', organization_id: DEMO_ORGANIZATION_ID, client_name: 'TechCorp Events', segment: 'Enterprise', first_deal_at: '2022-03-15T00:00:00Z', total_deals: 12, total_revenue: 450000, currency: 'USD', last_deal_at: '2024-11-10T00:00:00Z', status: 'Active', health_score: 92, days_since_last_deal: 14, avg_deal_size: 37500, nps_score: 9, metadata: {}, created_at: '2022-03-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-002', organization_id: DEMO_ORGANIZATION_ID, client_name: 'Festival Productions', segment: 'Enterprise', first_deal_at: '2021-06-20T00:00:00Z', total_deals: 18, total_revenue: 680000, currency: 'USD', last_deal_at: '2024-10-05T00:00:00Z', status: 'Active', health_score: 88, days_since_last_deal: 50, avg_deal_size: 37778, nps_score: 8, metadata: {}, created_at: '2021-06-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-003', organization_id: DEMO_ORGANIZATION_ID, client_name: 'Corporate Events Inc', segment: 'Mid-Market', first_deal_at: '2023-01-10T00:00:00Z', total_deals: 6, total_revenue: 125000, currency: 'USD', last_deal_at: '2024-08-15T00:00:00Z', status: 'At Risk', health_score: 45, days_since_last_deal: 101, avg_deal_size: 20833, nps_score: 6, metadata: {}, created_at: '2023-01-10T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-004', organization_id: DEMO_ORGANIZATION_ID, client_name: 'StartUp Ventures', segment: 'SMB', first_deal_at: '2024-02-01T00:00:00Z', total_deals: 2, total_revenue: 28000, currency: 'USD', last_deal_at: '2024-05-20T00:00:00Z', status: 'At Risk', health_score: 35, days_since_last_deal: 188, avg_deal_size: 14000, metadata: {}, created_at: '2024-02-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-005', organization_id: DEMO_ORGANIZATION_ID, client_name: 'Media Group LLC', segment: 'Mid-Market', first_deal_at: '2022-09-01T00:00:00Z', total_deals: 8, total_revenue: 195000, currency: 'USD', last_deal_at: '2024-11-20T00:00:00Z', status: 'Active', health_score: 85, days_since_last_deal: 4, avg_deal_size: 24375, nps_score: 8, metadata: {}, created_at: '2022-09-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-006', organization_id: DEMO_ORGANIZATION_ID, client_name: 'Local Business Co', segment: 'SMB', first_deal_at: '2023-06-15T00:00:00Z', total_deals: 3, total_revenue: 35000, currency: 'USD', last_deal_at: '2024-01-10T00:00:00Z', status: 'Churned', health_score: 15, days_since_last_deal: 319, avg_deal_size: 11667, nps_score: 4, metadata: {}, created_at: '2023-06-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'retention-007', organization_id: DEMO_ORGANIZATION_ID, client_name: 'Innovation Labs', segment: 'Mid-Market', first_deal_at: '2024-10-01T00:00:00Z', total_deals: 1, total_revenue: 45000, currency: 'USD', last_deal_at: '2024-10-01T00:00:00Z', status: 'New', health_score: 75, days_since_last_deal: 54, avg_deal_size: 45000, metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// DASHBOARDS (3NF Compliant)
// =============================================================================

export interface DemoDashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  widget_count: number;
  is_default: boolean;
  status: 'Active' | 'Draft';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_DASHBOARDS: DemoDashboard[] = [
  { id: 'dashboard-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Executive Overview', description: 'High-level KPIs for leadership', widget_count: 8, is_default: true, status: 'Active', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'dashboard-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Finance Dashboard', description: 'Financial metrics and trends', widget_count: 12, is_default: false, status: 'Active', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-18T00:00:00Z' },
  { id: 'dashboard-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Operations Dashboard', description: 'Operational KPIs and workflows', widget_count: 6, is_default: false, status: 'Draft', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'dashboard-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Sales Pipeline', description: 'Deal tracking and forecasting', widget_count: 10, is_default: false, status: 'Active', metadata: {}, created_at: '2024-10-20T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'dashboard-005', organization_id: DEMO_ORGANIZATION_ID, name: 'HR Analytics', description: 'Workforce metrics', widget_count: 5, is_default: false, status: 'Active', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-10T00:00:00Z' },
];

// =============================================================================
// DATA SOURCES (3NF Compliant)
// =============================================================================

export interface DemoDataSource {
  id: string;
  organization_id: string;
  name: string;
  source_type: 'Database' | 'API' | 'File' | 'Streaming';
  status: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
  last_sync_at: string;
  record_count: number;
  sync_frequency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_DATA_SOURCES: DemoDataSource[] = [
  { id: 'datasource-001', organization_id: DEMO_ORGANIZATION_ID, name: 'ATLVS Production DB', source_type: 'Database', status: 'Connected', last_sync_at: '2024-11-25T10:30:00Z', record_count: 2450000, sync_frequency: 'Real-time', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T10:30:00Z' },
  { id: 'datasource-002', organization_id: DEMO_ORGANIZATION_ID, name: 'COMPVSS Events DB', source_type: 'Database', status: 'Connected', last_sync_at: '2024-11-25T10:30:00Z', record_count: 1850000, sync_frequency: 'Real-time', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T10:30:00Z' },
  { id: 'datasource-003', organization_id: DEMO_ORGANIZATION_ID, name: 'GVTEWAY Consumer DB', source_type: 'Database', status: 'Syncing', last_sync_at: '2024-11-25T10:15:00Z', record_count: 3200000, sync_frequency: '15 min', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T10:15:00Z' },
  { id: 'datasource-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Stripe Payments API', source_type: 'API', status: 'Connected', last_sync_at: '2024-11-25T10:28:00Z', record_count: 450000, sync_frequency: 'Hourly', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T10:28:00Z' },
  { id: 'datasource-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Salesforce CRM', source_type: 'API', status: 'Connected', last_sync_at: '2024-11-25T09:00:00Z', record_count: 125000, sync_frequency: 'Daily', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T09:00:00Z' },
  { id: 'datasource-006', organization_id: DEMO_ORGANIZATION_ID, name: 'Google Analytics', source_type: 'API', status: 'Error', last_sync_at: '2024-11-24T18:00:00Z', record_count: 8500000, sync_frequency: 'Daily', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-24T18:00:00Z' },
];

// =============================================================================
// CREDIT CARD TRANSACTIONS (3NF Compliant - uses person_id and department_id references)
// =============================================================================

export interface DemoCreditCardTxn {
  id: string;
  organization_id: string;
  card_id: string;
  last_four: string;
  cardholder_person_id?: string;
  cardholder_name: string;
  merchant: string;
  amount: number;
  currency: string;
  transaction_at: string;
  category: string;
  status: 'Pending' | 'Posted' | 'Disputed';
  has_receipt?: boolean;
  department_id?: string;
  department_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CREDIT_CARD_TXNS: DemoCreditCardTxn[] = [
  { id: 'txn-001', organization_id: DEMO_ORGANIZATION_ID, card_id: 'card-001', last_four: '4521', cardholder_name: 'John Smith', merchant: 'Audio Equipment Co', amount: 2450, currency: 'USD', transaction_at: '2024-11-24T00:00:00Z', category: 'Equipment', status: 'Posted', has_receipt: true, department_name: 'Production', metadata: {}, created_at: '2024-11-24T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'txn-002', organization_id: DEMO_ORGANIZATION_ID, card_id: 'card-002', last_four: '7832', cardholder_name: 'Sarah Johnson', merchant: 'Delta Airlines', amount: 1890, currency: 'USD', transaction_at: '2024-11-23T00:00:00Z', category: 'Travel', status: 'Posted', has_receipt: true, department_name: 'Executive', metadata: {}, created_at: '2024-11-23T00:00:00Z', updated_at: '2024-11-23T00:00:00Z' },
  { id: 'txn-003', organization_id: DEMO_ORGANIZATION_ID, card_id: 'card-001', last_four: '4521', cardholder_name: 'John Smith', merchant: 'Staples', amount: 156, currency: 'USD', transaction_at: '2024-11-23T00:00:00Z', category: 'Office Supplies', status: 'Pending', department_name: 'Production', metadata: {}, created_at: '2024-11-23T00:00:00Z', updated_at: '2024-11-23T00:00:00Z' },
  { id: 'txn-004', organization_id: DEMO_ORGANIZATION_ID, card_id: 'card-003', last_four: '9156', cardholder_name: 'Mike Davis', merchant: 'Hilton Hotels', amount: 890, currency: 'USD', transaction_at: '2024-11-22T00:00:00Z', category: 'Travel', status: 'Posted', has_receipt: false, department_name: 'Operations', metadata: {}, created_at: '2024-11-22T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
  { id: 'txn-005', organization_id: DEMO_ORGANIZATION_ID, card_id: 'card-002', last_four: '7832', cardholder_name: 'Sarah Johnson', merchant: 'Amazon Business', amount: 567, currency: 'USD', transaction_at: '2024-11-22T00:00:00Z', category: 'Supplies', status: 'Disputed', department_name: 'Executive', metadata: {}, created_at: '2024-11-22T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
];

// =============================================================================
// PORTAL DATA (3NF Compliant - Crew, Vendor, Artist, Sponsor, Investor portals)
// =============================================================================

export interface DemoCrewAssignment {
  id: string;
  organization_id: string;
  person_id?: string;
  production_id?: string;
  production_name: string;
  role: string;
  start_date: string;
  end_date: string;
  status: 'confirmed' | 'pending' | 'completed';
  daily_rate: number;
  currency: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_CREW_ASSIGNMENTS: DemoCrewAssignment[] = [
  { id: 'crew-assign-001', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Summer Music Festival 2024', role: 'Stage Manager', start_date: '2024-11-18T00:00:00Z', end_date: '2024-11-22T00:00:00Z', status: 'confirmed', daily_rate: 500, currency: 'USD', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-18T00:00:00Z' },
  { id: 'crew-assign-002', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Corporate Gala', role: 'Technical Director', start_date: '2024-12-05T00:00:00Z', end_date: '2024-12-05T00:00:00Z', status: 'pending', daily_rate: 750, currency: 'USD', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'crew-assign-003', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Concert Series - Week 1', role: 'Stage Manager', start_date: '2024-10-15T00:00:00Z', end_date: '2024-10-18T00:00:00Z', status: 'completed', daily_rate: 500, currency: 'USD', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-18T00:00:00Z' },
];

export interface DemoProductionVendorContract {
  id: string;
  organization_id: string;
  vendor_org_id?: string;
  production_id?: string;
  production_name: string;
  service: string;
  value: number;
  currency: string;
  status: 'active' | 'pending' | 'completed';
  start_date: string;
  end_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_PRODUCTION_VENDOR_CONTRACTS: DemoProductionVendorContract[] = [
  { id: 'prod-vendor-001', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Summer Music Festival 2024', service: 'Audio Equipment Rental', value: 45000, currency: 'USD', status: 'active', start_date: '2024-11-15T00:00:00Z', end_date: '2024-11-25T00:00:00Z', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'prod-vendor-002', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Corporate Gala', service: 'Lighting Package', value: 12000, currency: 'USD', status: 'pending', start_date: '2024-12-03T00:00:00Z', end_date: '2024-12-06T00:00:00Z', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'prod-vendor-003', organization_id: DEMO_ORGANIZATION_ID, production_name: 'Concert Series', service: 'Stage Equipment', value: 28000, currency: 'USD', status: 'completed', start_date: '2024-10-10T00:00:00Z', end_date: '2024-10-20T00:00:00Z', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-20T00:00:00Z' },
];

export interface DemoArtistBooking {
  id: string;
  organization_id: string;
  artist_person_id?: string;
  event_id?: string;
  event_name: string;
  venue_place_id?: string;
  venue_name: string;
  performance_at: string;
  fee: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'completed';
  tickets_sold?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ARTIST_BOOKINGS: DemoArtistBooking[] = [
  { id: 'artist-booking-001', organization_id: DEMO_ORGANIZATION_ID, event_name: 'Summer Music Festival 2024', venue_name: 'Central Park Amphitheater', performance_at: '2024-11-20T00:00:00Z', fee: 75000, currency: 'USD', status: 'confirmed', tickets_sold: 8500, metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'artist-booking-002', organization_id: DEMO_ORGANIZATION_ID, event_name: 'New Years Eve Concert', venue_name: 'Madison Square Garden', performance_at: '2024-12-31T00:00:00Z', fee: 150000, currency: 'USD', status: 'pending', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'artist-booking-003', organization_id: DEMO_ORGANIZATION_ID, event_name: 'Fall Tour - Chicago', venue_name: 'United Center', performance_at: '2024-10-15T00:00:00Z', fee: 85000, currency: 'USD', status: 'completed', tickets_sold: 12000, metadata: {}, created_at: '2024-09-01T00:00:00Z', updated_at: '2024-10-15T00:00:00Z' },
];

export interface DemoSponsorship {
  id: string;
  organization_id: string;
  sponsor_org_id?: string;
  event_id?: string;
  event_name: string;
  tier: string;
  value: number;
  currency: string;
  status: 'active' | 'pending' | 'completed';
  total_deliverables: number;
  completed_deliverables: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SPONSORSHIPS: DemoSponsorship[] = [
  { id: 'sponsorship-001', organization_id: DEMO_ORGANIZATION_ID, event_name: 'Summer Music Festival 2024', tier: 'Platinum', value: 250000, currency: 'USD', status: 'active', total_deliverables: 12, completed_deliverables: 8, metadata: {}, created_at: '2024-08-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'sponsorship-002', organization_id: DEMO_ORGANIZATION_ID, event_name: 'Corporate Gala', tier: 'Gold', value: 75000, currency: 'USD', status: 'pending', total_deliverables: 6, completed_deliverables: 0, metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'sponsorship-003', organization_id: DEMO_ORGANIZATION_ID, event_name: 'Concert Series', tier: 'Silver', value: 50000, currency: 'USD', status: 'completed', total_deliverables: 8, completed_deliverables: 8, metadata: {}, created_at: '2024-09-01T00:00:00Z', updated_at: '2024-10-20T00:00:00Z' },
];

export interface DemoInvestment {
  id: string;
  organization_id: string;
  investor_person_id?: string;
  fund_name: string;
  amount: number;
  currency: string;
  ownership_percentage: number;
  status: 'active' | 'pending';
  returns: number;
  last_distribution_period: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_INVESTMENTS: DemoInvestment[] = [
  { id: 'investment-001', organization_id: DEMO_ORGANIZATION_ID, fund_name: 'GHXSTSHIP Growth Fund I', amount: 500000, currency: 'USD', ownership_percentage: 2.5, status: 'active', returns: 45000, last_distribution_period: 'Q3 2024', metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-09-30T00:00:00Z' },
  { id: 'investment-002', organization_id: DEMO_ORGANIZATION_ID, fund_name: 'Live Events Opportunity Fund', amount: 250000, currency: 'USD', ownership_percentage: 1.2, status: 'active', returns: 18500, last_distribution_period: 'Q3 2024', metadata: {}, created_at: '2023-06-01T00:00:00Z', updated_at: '2024-09-30T00:00:00Z' },
  { id: 'investment-003', organization_id: DEMO_ORGANIZATION_ID, fund_name: 'Venue Acquisition Fund II', amount: 100000, currency: 'USD', ownership_percentage: 0.5, status: 'pending', returns: 0, last_distribution_period: '-', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-01T00:00:00Z' },
];

// =============================================================================
// CRM STAKEHOLDERS (3NF Compliant - uses person_id and org_id references)
// =============================================================================

export interface DemoStakeholder {
  id: string;
  organization_id: string;
  person_id?: string;
  person_name: string;
  role: string;
  company_org_id?: string;
  company_name: string;
  influence: 'High' | 'Medium' | 'Low';
  sentiment: 'Champion' | 'Supporter' | 'Neutral' | 'Skeptic' | 'Blocker';
  is_decision_maker: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_STAKEHOLDERS: DemoStakeholder[] = [
  { id: 'stakeholder-001', organization_id: DEMO_ORGANIZATION_ID, person_name: 'Sarah Johnson', role: 'VP Marketing', company_name: 'Acme Corp', influence: 'High', sentiment: 'Champion', is_decision_maker: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stakeholder-002', organization_id: DEMO_ORGANIZATION_ID, person_name: 'John Smith', role: 'Director Events', company_name: 'Acme Corp', influence: 'Medium', sentiment: 'Supporter', is_decision_maker: false, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stakeholder-003', organization_id: DEMO_ORGANIZATION_ID, person_name: 'Robert Brown', role: 'CFO', company_name: 'Acme Corp', influence: 'High', sentiment: 'Neutral', is_decision_maker: true, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'stakeholder-004', organization_id: DEMO_ORGANIZATION_ID, person_name: 'Emily Davis', role: 'Procurement', company_name: 'Acme Corp', influence: 'Low', sentiment: 'Skeptic', is_decision_maker: false, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// DASHBOARD PROJECTS (3NF Compliant - uses client_org_id and manager_person_id references)
// =============================================================================

export interface DemoDisplayProject {
  id: string;
  organization_id: string;
  name: string;
  client_org_id?: string;
  client_name?: string;
  status: string;
  budget?: number;
  actual_cost?: number;
  currency: string;
  health?: string;
  manager_person_id?: string;
  manager_name?: string;
  start_date?: string;
  end_date?: string;
  progress?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_DISPLAY_PROJECTS: DemoDisplayProject[] = [
  { id: 'proj-2024-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Ultra Music Festival 2025', client_name: 'Ultra Worldwide', status: 'In Progress', budget: 2500000, actual_cost: 1847520, currency: 'USD', health: 'On Track', manager_name: 'Sarah Martinez', start_date: '2024-10-01T00:00:00Z', end_date: '2025-03-30T00:00:00Z', progress: 68, metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'proj-2024-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Formula 1 Miami GP', client_name: 'Formula One Group', status: 'Planning', budget: 3200000, actual_cost: 456000, currency: 'USD', health: 'At Risk', manager_name: 'Michael Chen', start_date: '2024-11-15T00:00:00Z', end_date: '2025-05-04T00:00:00Z', progress: 35, metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'proj-2024-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Art Basel Miami Beach', client_name: 'MCH Group', status: 'Completed', budget: 950000, actual_cost: 925400, currency: 'USD', health: 'Completed', manager_name: 'Elena Rodriguez', start_date: '2024-08-01T00:00:00Z', end_date: '2024-12-08T00:00:00Z', progress: 100, metadata: {}, created_at: '2024-08-01T00:00:00Z', updated_at: '2024-12-08T00:00:00Z' },
];

// =============================================================================
// VENDOR AUDITS (3NF Compliant - uses vendor_org_id and auditor_person_id references)
// =============================================================================

export interface DemoVendorAudit {
  id: string;
  organization_id: string;
  vendor_org_id?: string;
  vendor_name: string;
  category: string;
  audit_type: 'Quality' | 'Financial' | 'Compliance' | 'Performance';
  scheduled_at: string;
  completed_at?: string;
  auditor_person_id?: string;
  auditor_name: string;
  score?: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  findings?: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_VENDOR_AUDITS: DemoVendorAudit[] = [
  { id: 'audit-001', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'PRG', category: 'Audio Equipment', audit_type: 'Quality', scheduled_at: '2024-12-15T00:00:00Z', auditor_name: 'John Smith', status: 'Scheduled', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'audit-002', organization_id: DEMO_ORGANIZATION_ID, vendor_name: '4Wall Entertainment', category: 'Lighting', audit_type: 'Performance', scheduled_at: '2024-11-20T00:00:00Z', completed_at: '2024-11-20T00:00:00Z', auditor_name: 'Sarah Johnson', score: 92, status: 'Completed', findings: ['Excellent delivery times', 'Minor documentation gaps'], metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'audit-003', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'Stageline', category: 'Staging', audit_type: 'Compliance', scheduled_at: '2024-11-10T00:00:00Z', auditor_name: 'Mike Davis', status: 'Overdue', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'audit-004', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'Meyer Sound', category: 'Audio Equipment', audit_type: 'Financial', scheduled_at: '2024-11-25T00:00:00Z', auditor_name: 'Emily Chen', status: 'In Progress', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
  { id: 'audit-005', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'Robe Lighting', category: 'Lighting', audit_type: 'Quality', scheduled_at: '2024-10-15T00:00:00Z', completed_at: '2024-10-18T00:00:00Z', auditor_name: 'Chris Brown', score: 88, status: 'Completed', findings: ['Good product quality', 'Lead time improvements needed'], metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-18T00:00:00Z' },
];

// =============================================================================
// EMERGENCY PROCUREMENT (3NF Compliant - uses person_id and department_id references)
// =============================================================================

export interface DemoEmergencyProcurement {
  id: string;
  organization_id: string;
  requestor_person_id?: string;
  requestor_name: string;
  department_id?: string;
  department_name: string;
  description: string;
  amount: number;
  currency: string;
  urgency: 'Critical' | 'High' | 'Medium';
  reason: string;
  vendor_org_id?: string;
  vendor_name?: string;
  requested_at: string;
  approved_at?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approver_person_id?: string;
  approver_name?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_EMERGENCY_PROCUREMENTS: DemoEmergencyProcurement[] = [
  { id: 'emergency-001', organization_id: DEMO_ORGANIZATION_ID, requestor_name: 'John Smith', department_name: 'Production', description: 'Replacement audio console - DiGiCo SD12', amount: 45000, currency: 'USD', urgency: 'Critical', reason: 'Main console failed during load-in', vendor_name: 'PRG', requested_at: '2024-11-24T00:00:00Z', approved_at: '2024-11-24T00:00:00Z', status: 'Completed', approver_name: 'Sarah Johnson', metadata: {}, created_at: '2024-11-24T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'emergency-002', organization_id: DEMO_ORGANIZATION_ID, requestor_name: 'Mike Davis', department_name: 'Lighting', description: 'Emergency lighting fixtures (12x Robe MegaPointe)', amount: 28000, currency: 'USD', urgency: 'High', reason: 'Client added last-minute production elements', requested_at: '2024-11-25T00:00:00Z', status: 'Pending', metadata: {}, created_at: '2024-11-25T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
  { id: 'emergency-003', organization_id: DEMO_ORGANIZATION_ID, requestor_name: 'Emily Chen', department_name: 'Video', description: 'LED wall panels replacement (20 panels)', amount: 15000, currency: 'USD', urgency: 'Critical', reason: 'Damaged panels discovered during setup', vendor_name: 'ROE Visual', requested_at: '2024-11-25T00:00:00Z', approved_at: '2024-11-25T00:00:00Z', status: 'Approved', approver_name: 'Robert Chen', metadata: {}, created_at: '2024-11-25T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
];

// =============================================================================
// PURCHASE ORDERS (3NF Compliant - uses vendor_org_id and person_id references)
// =============================================================================

export interface DemoPurchaseOrder {
  id: string;
  organization_id: string;
  vendor_org_id?: string;
  vendor_name: string;
  description: string;
  amount: number;
  currency: string;
  status: 'pending' | 'active' | 'completed' | 'approved';
  requested_by_person_id?: string;
  requested_by_name: string;
  due_date: string;
  category: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_PURCHASE_ORDERS: DemoPurchaseOrder[] = [
  { id: 'po-2024-001', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'ProAV Systems', description: 'LED Wall Panels - 100 units', amount: 125000, currency: 'USD', status: 'active', requested_by_name: 'John Smith', due_date: '2024-12-15T00:00:00Z', category: 'Equipment', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'po-2024-002', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'Elite Staging Co', description: 'Stage Platforms and Risers', amount: 45000, currency: 'USD', status: 'pending', requested_by_name: 'Sarah Johnson', due_date: '2024-12-20T00:00:00Z', category: 'Staging', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'po-2024-003', organization_id: DEMO_ORGANIZATION_ID, vendor_name: 'Lumina Lighting', description: 'Moving Head Fixtures - 50 units', amount: 89000, currency: 'USD', status: 'completed', requested_by_name: 'Mike Peters', due_date: '2024-11-30T00:00:00Z', category: 'Lighting', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-30T00:00:00Z' },
];

// =============================================================================
// PROCUREMENT CATEGORIES (3NF Compliant)
// =============================================================================

export interface DemoProcurementCategory {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  parent_category_id?: string;
  total_spend: number;
  currency: string;
  vendor_count: number;
  status: 'Active' | 'Inactive';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoSourcingStrategy {
  id: string;
  organization_id: string;
  category_id: string;
  strategy: 'Single Source' | 'Multi Source' | 'Competitive Bid' | 'Preferred Vendor';
  rationale: string;
  review_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_PROCUREMENT_CATEGORIES: DemoProcurementCategory[] = [
  { id: 'proc-cat-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Audio Equipment', description: 'PA systems, microphones, mixing consoles', total_spend: 1250000, currency: 'USD', vendor_count: 12, status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'proc-cat-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Lighting', description: 'Moving heads, LED fixtures, control systems', total_spend: 890000, currency: 'USD', vendor_count: 8, status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'proc-cat-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Video', description: 'LED walls, projectors, media servers', total_spend: 1450000, currency: 'USD', vendor_count: 6, status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'proc-cat-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Staging', description: 'Platforms, risers, truss systems', total_spend: 650000, currency: 'USD', vendor_count: 5, status: 'Active', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_SOURCING_STRATEGIES: DemoSourcingStrategy[] = [
  { id: 'strategy-001', organization_id: DEMO_ORGANIZATION_ID, category_id: 'proc-cat-001', strategy: 'Multi Source', rationale: 'Maintain competitive pricing and availability', review_date: '2025-01-15T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'strategy-002', organization_id: DEMO_ORGANIZATION_ID, category_id: 'proc-cat-002', strategy: 'Preferred Vendor', rationale: 'Quality consistency and technical support', review_date: '2025-02-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'strategy-003', organization_id: DEMO_ORGANIZATION_ID, category_id: 'proc-cat-003', strategy: 'Single Source', rationale: 'Specialized equipment requirements', review_date: '2025-01-30T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// LOGISTICS SHIPMENTS (3NF Compliant - uses po_id and vendor_org_id references)
// =============================================================================

export interface DemoShipment {
  id: string;
  organization_id: string;
  po_id?: string;
  po_number: string;
  vendor_org_id?: string;
  vendor_name: string;
  origin: string;
  destination: string;
  carrier: string;
  tracking_number?: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Delayed';
  estimated_delivery_at: string;
  actual_delivery_at?: string;
  item_count: number;
  weight?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SHIPMENTS: DemoShipment[] = [
  { id: 'shipment-001', organization_id: DEMO_ORGANIZATION_ID, po_number: 'PO-2024-001', vendor_name: 'ProAV Systems', origin: 'Los Angeles, CA', destination: 'Miami, FL', carrier: 'FedEx Freight', tracking_number: '123456789', status: 'In Transit', estimated_delivery_at: '2024-12-10T00:00:00Z', item_count: 100, weight: '2,500 lbs', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'shipment-002', organization_id: DEMO_ORGANIZATION_ID, po_number: 'PO-2024-002', vendor_name: 'Elite Staging Co', origin: 'Nashville, TN', destination: 'Miami, FL', carrier: 'XPO Logistics', status: 'Pending', estimated_delivery_at: '2024-12-18T00:00:00Z', item_count: 25, metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'shipment-003', organization_id: DEMO_ORGANIZATION_ID, po_number: 'PO-2024-003', vendor_name: 'Lumina Lighting', origin: 'Chicago, IL', destination: 'Miami, FL', carrier: 'Old Dominion', tracking_number: '987654321', status: 'Delivered', estimated_delivery_at: '2024-11-28T00:00:00Z', actual_delivery_at: '2024-11-27T00:00:00Z', item_count: 50, weight: '1,200 lbs', metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-27T00:00:00Z' },
];

// =============================================================================
// VENDOR SELECTION (3NF Compliant)
// =============================================================================

export interface DemoVendorSelectionBid {
  id: string;
  selection_id: string;
  vendor_org_id?: string;
  vendor_name: string;
  bid_amount: number;
  currency: string;
  technical_score?: number;
  price_score?: number;
  overall_score?: number;
  rank?: number;
  recommendation?: string;
  status: string;
}

export interface DemoVendorSelectionCriteria {
  id: string;
  selection_id: string;
  name: string;
  weight: number;
  description: string;
}

export interface DemoVendorSelectionApprover {
  id: string;
  selection_id: string;
  person_id?: string;
  person_name: string;
  role: string;
  status: string;
  approved_at?: string;
  comments?: string;
}

export interface DemoVendorSelection {
  id: string;
  organization_id: string;
  rfp_id: string;
  rfp_title: string;
  category: string;
  due_date: string;
  status: 'Open' | 'Evaluating' | 'Awarded' | 'Closed' | 'Pending Approval' | 'Approved' | 'Rejected';
  selected_vendor_org_id?: string;
  selected_vendor_name?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_VENDOR_SELECTIONS: DemoVendorSelection[] = [
  { id: 'selection-001', organization_id: DEMO_ORGANIZATION_ID, rfp_id: 'RFP-2024-015', rfp_title: 'Audio Equipment Rental - Summer Festival', category: 'Audio', due_date: '2024-12-01T00:00:00Z', status: 'Evaluating', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'selection-002', organization_id: DEMO_ORGANIZATION_ID, rfp_id: 'RFP-2024-016', rfp_title: 'LED Wall Installation', category: 'Video', due_date: '2024-11-25T00:00:00Z', status: 'Awarded', selected_vendor_name: 'ROE Visual', metadata: {}, created_at: '2024-11-10T00:00:00Z', updated_at: '2024-11-21T00:00:00Z' },
];

export const DEMO_VENDOR_SELECTION_BIDS: DemoVendorSelectionBid[] = [
  { id: 'bid-001', selection_id: 'selection-001', vendor_name: 'PRG', bid_amount: 125000, currency: 'USD', technical_score: 92, price_score: 85, overall_score: 89, rank: 1, recommendation: 'Recommended', status: 'Submitted' },
  { id: 'bid-002', selection_id: 'selection-001', vendor_name: 'Clair Global', bid_amount: 135000, currency: 'USD', technical_score: 88, price_score: 80, overall_score: 84, rank: 2, recommendation: 'Acceptable', status: 'Submitted' },
  { id: 'bid-003', selection_id: 'selection-002', vendor_name: 'ROE Visual', bid_amount: 180000, currency: 'USD', technical_score: 95, price_score: 88, overall_score: 92, rank: 1, recommendation: 'Recommended', status: 'Submitted' },
];

export const DEMO_VENDOR_SELECTION_CRITERIA: DemoVendorSelectionCriteria[] = [
  { id: 'criteria-001', selection_id: 'selection-001', name: 'Technical Capability', weight: 40, description: 'Equipment quality and technical expertise' },
  { id: 'criteria-002', selection_id: 'selection-001', name: 'Price', weight: 30, description: 'Total cost and value' },
  { id: 'criteria-003', selection_id: 'selection-001', name: 'Experience', weight: 30, description: 'Past performance and references' },
  { id: 'criteria-004', selection_id: 'selection-002', name: 'Technical Capability', weight: 40, description: 'Equipment quality and technical expertise' },
  { id: 'criteria-005', selection_id: 'selection-002', name: 'Price', weight: 30, description: 'Total cost and value' },
  { id: 'criteria-006', selection_id: 'selection-002', name: 'Experience', weight: 30, description: 'Past performance and references' },
];

export const DEMO_VENDOR_SELECTION_APPROVERS: DemoVendorSelectionApprover[] = [
  { id: 'approver-001', selection_id: 'selection-001', person_name: 'John Smith', role: 'Procurement Manager', status: 'Pending' },
  { id: 'approver-002', selection_id: 'selection-001', person_name: 'Sarah Johnson', role: 'Finance Director', status: 'Pending' },
  { id: 'approver-003', selection_id: 'selection-002', person_name: 'John Smith', role: 'Procurement Manager', status: 'Approved', approved_at: '2024-11-20T00:00:00Z' },
  { id: 'approver-004', selection_id: 'selection-002', person_name: 'Sarah Johnson', role: 'Finance Director', status: 'Approved', approved_at: '2024-11-21T00:00:00Z' },
];

// =============================================================================
// BUDGETS (3NF Compliant)
// =============================================================================

export interface DemoBudget {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  currency: string;
  status: 'on-track' | 'over' | 'under';
  period?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_BUDGETS: DemoBudget[] = [
  { id: 'budget-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Ultra Music Festival 2025', category: 'Events', budgeted_amount: 2500000, actual_amount: 2350000, variance: 150000, currency: 'USD', status: 'on-track', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'budget-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Operations & Overhead', category: 'Operations', budgeted_amount: 450000, actual_amount: 475000, variance: -25000, currency: 'USD', status: 'over', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'budget-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Marketing & Sales', category: 'Marketing', budgeted_amount: 320000, actual_amount: 298000, variance: 22000, currency: 'USD', status: 'on-track', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'budget-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Technology & Infrastructure', category: 'Technology', budgeted_amount: 180000, actual_amount: 195000, variance: -15000, currency: 'USD', status: 'over', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// PORTFOLIO PROJECTS (3NF Compliant - uses client_org_id references)
// =============================================================================

export interface DemoPortfolioProject {
  id: string;
  organization_id: string;
  name: string;
  client_org_id?: string;
  client_name: string;
  project_type: string;
  event_date: string;
  location: string;
  budget: number;
  currency: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  highlights: string[];
  metrics: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; role: string };
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_PORTFOLIO_PROJECTS: DemoPortfolioProject[] = [
  { id: 'portfolio-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Summer Music Festival 2024', client_name: 'Festival Productions', project_type: 'Festival', event_date: '2024-07-15T00:00:00Z', location: 'Miami, FL', budget: 2500000, currency: 'USD', status: 'Completed', highlights: ['50,000+ attendees', '3 stages', '48 artists'], metrics: [{ label: 'Attendance', value: '52,000' }, { label: 'Revenue', value: '$4.2M' }], testimonial: { quote: 'Exceptional production quality', author: 'John Smith', role: 'Festival Director' }, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-07-20T00:00:00Z' },
  { id: 'portfolio-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Corporate Gala 2024', client_name: 'Tech Corp', project_type: 'Corporate', event_date: '2024-09-20T00:00:00Z', location: 'San Francisco, CA', budget: 450000, currency: 'USD', status: 'Completed', highlights: ['500 VIP guests', 'Live entertainment', 'Custom staging'], metrics: [{ label: 'Guest Satisfaction', value: '98%' }], metadata: {}, created_at: '2024-06-01T00:00:00Z', updated_at: '2024-09-25T00:00:00Z' },
];

// =============================================================================
// MARKETING ATTRIBUTION (3NF Compliant)
// =============================================================================

export interface DemoMarketingSource {
  id: string;
  organization_id: string;
  name: string;
  channel: string;
  lead_count: number;
  conversion_count: number;
  revenue: number;
  cost: number;
  currency: string;
  roi_percentage: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoMarketingCampaign {
  id: string;
  organization_id: string;
  name: string;
  source_id?: string;
  source_name: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent: number;
  currency: string;
  lead_count: number;
  conversion_count: number;
  status: 'Active' | 'Completed' | 'Paused';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_MARKETING_SOURCES: DemoMarketingSource[] = [
  { id: 'mkt-source-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Google Ads', channel: 'Paid Search', lead_count: 245, conversion_count: 32, revenue: 156000, cost: 12500, currency: 'USD', roi_percentage: 1148, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'mkt-source-002', organization_id: DEMO_ORGANIZATION_ID, name: 'LinkedIn', channel: 'Social', lead_count: 189, conversion_count: 28, revenue: 142000, cost: 8900, currency: 'USD', roi_percentage: 1496, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'mkt-source-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Email Marketing', channel: 'Email', lead_count: 312, conversion_count: 45, revenue: 198000, cost: 2400, currency: 'USD', roi_percentage: 8150, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'mkt-source-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Referrals', channel: 'Organic', lead_count: 156, conversion_count: 38, revenue: 185000, cost: 0, currency: 'USD', roi_percentage: 0, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'mkt-source-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Trade Shows', channel: 'Events', lead_count: 89, conversion_count: 15, revenue: 78000, cost: 25000, currency: 'USD', roi_percentage: 212, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

export const DEMO_MARKETING_CAMPAIGNS: DemoMarketingCampaign[] = [
  { id: 'campaign-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Q4 Lead Gen', source_name: 'Google Ads', start_date: '2024-10-01T00:00:00Z', end_date: '2024-12-31T00:00:00Z', budget: 15000, spent: 8500, currency: 'USD', lead_count: 145, conversion_count: 18, status: 'Active', metadata: {}, created_at: '2024-10-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'campaign-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Festival Season Push', source_name: 'LinkedIn', start_date: '2024-11-01T00:00:00Z', end_date: '2024-11-30T00:00:00Z', budget: 5000, spent: 3200, currency: 'USD', lead_count: 89, conversion_count: 12, status: 'Active', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'campaign-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Newsletter Promo', source_name: 'Email Marketing', start_date: '2024-11-15T00:00:00Z', end_date: '2024-11-22T00:00:00Z', budget: 500, spent: 500, currency: 'USD', lead_count: 67, conversion_count: 8, status: 'Completed', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-22T00:00:00Z' },
];

// =============================================================================
// FINANCE - COMMISSIONS (3NF Compliant - uses person_id and deal_id references)
// =============================================================================

export interface DemoCommissionRecord {
  id: string;
  organization_id: string;
  sales_rep_person_id?: string;
  sales_rep_name: string;
  deal_id?: string;
  deal_name: string;
  client_org_id?: string;
  client_name: string;
  deal_value: number;
  commission_rate: number;
  commission_amount: number;
  currency: string;
  status: 'Pending' | 'Approved' | 'Paid';
  close_date: string;
  payment_date?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_COMMISSION_RECORDS: DemoCommissionRecord[] = [
  { id: 'commission-001', organization_id: DEMO_ORGANIZATION_ID, sales_rep_name: 'John Smith', deal_name: 'TechCorp Annual Conference', client_name: 'TechCorp Events', deal_value: 125000, commission_rate: 12, commission_amount: 15000, currency: 'USD', status: 'Approved', close_date: '2024-11-15T00:00:00Z', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'commission-002', organization_id: DEMO_ORGANIZATION_ID, sales_rep_name: 'Jane Doe', deal_name: 'Festival Productions Partnership', client_name: 'Festival Productions', deal_value: 85000, commission_rate: 15, commission_amount: 12750, currency: 'USD', status: 'Pending', close_date: '2024-11-20T00:00:00Z', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'commission-003', organization_id: DEMO_ORGANIZATION_ID, sales_rep_name: 'John Smith', deal_name: 'Corporate Events Renewal', client_name: 'Corporate Events Inc', deal_value: 45000, commission_rate: 5, commission_amount: 2250, currency: 'USD', status: 'Paid', close_date: '2024-11-01T00:00:00Z', payment_date: '2024-11-15T00:00:00Z', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
];

// =============================================================================
// FINANCE - ACCOUNTS RECEIVABLE (3NF Compliant - uses client_org_id and project_id references)
// =============================================================================

export interface DemoARInvoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  client_org_id?: string;
  client_name: string;
  client_email: string;
  amount: number;
  currency: string;
  due_date: string;
  issue_date: string;
  status: 'Sent' | 'Partial' | 'Paid' | 'Overdue';
  paid_amount: number;
  project_id?: string;
  project_name: string;
  days_past_due?: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_AR_INVOICES: DemoARInvoice[] = [
  { id: 'ar-invoice-001', organization_id: DEMO_ORGANIZATION_ID, invoice_number: 'INV-2024-0156', client_name: 'TechCorp Events', client_email: 'ap@techcorp.com', amount: 45000, currency: 'USD', due_date: '2024-11-15T00:00:00Z', issue_date: '2024-10-15T00:00:00Z', status: 'Overdue', paid_amount: 0, project_name: 'Annual Conference', days_past_due: 9, metadata: {}, created_at: '2024-10-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ar-invoice-002', organization_id: DEMO_ORGANIZATION_ID, invoice_number: 'INV-2024-0157', client_name: 'Festival Productions', client_email: 'billing@festprod.com', amount: 125000, currency: 'USD', due_date: '2024-11-30T00:00:00Z', issue_date: '2024-11-01T00:00:00Z', status: 'Partial', paid_amount: 62500, project_name: 'Summer Fest 2024', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'ar-invoice-003', organization_id: DEMO_ORGANIZATION_ID, invoice_number: 'INV-2024-0158', client_name: 'Corporate Events Inc', client_email: 'accounts@corpevents.com', amount: 28500, currency: 'USD', due_date: '2024-12-01T00:00:00Z', issue_date: '2024-11-01T00:00:00Z', status: 'Sent', paid_amount: 0, project_name: 'Holiday Gala', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// FINANCE - BANK RECONCILIATION (3NF Compliant)
// =============================================================================

export interface DemoBankTransaction {
  id: string;
  organization_id: string;
  transaction_date: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: 'Credit' | 'Debit';
  status: 'Matched' | 'Unmatched' | 'Pending';
  matched_to_id?: string;
  matched_to_reference?: string;
  bank_account: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_BANK_TRANSACTIONS: DemoBankTransaction[] = [
  { id: 'bank-txn-001', organization_id: DEMO_ORGANIZATION_ID, transaction_date: '2024-11-25T00:00:00Z', description: 'Wire Transfer - Client ABC', amount: 45000, currency: 'USD', transaction_type: 'Credit', status: 'Matched', matched_to_reference: 'INV-2024-089', bank_account: 'Operating', metadata: {}, created_at: '2024-11-25T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
  { id: 'bank-txn-002', organization_id: DEMO_ORGANIZATION_ID, transaction_date: '2024-11-25T00:00:00Z', description: 'ACH Payment - Vendor XYZ', amount: -12500, currency: 'USD', transaction_type: 'Debit', status: 'Matched', matched_to_reference: 'PO-2024-156', bank_account: 'Operating', metadata: {}, created_at: '2024-11-25T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
  { id: 'bank-txn-003', organization_id: DEMO_ORGANIZATION_ID, transaction_date: '2024-11-24T00:00:00Z', description: 'Check #4521', amount: -3200, currency: 'USD', transaction_type: 'Debit', status: 'Unmatched', bank_account: 'Operating', metadata: {}, created_at: '2024-11-24T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
];

// =============================================================================
// DOCUMENTS (3NF Compliant - uses person_id references)
// =============================================================================

export interface DemoDocument {
  id: string;
  organization_id: string;
  name: string;
  document_type: string;
  folder: string;
  version: string;
  size: string;
  uploaded_by_person_id?: string;
  uploaded_by_name: string;
  uploaded_at: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  { id: 'doc-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Ultra Music Festival - Master Contract 2025', document_type: 'Contract', folder: 'Contracts', version: '3.2', size: '2.4 MB', uploaded_by_name: 'Sarah Johnson', uploaded_at: '2024-11-20T00:00:00Z', status: 'active', metadata: {}, created_at: '2024-11-20T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'doc-002', organization_id: DEMO_ORGANIZATION_ID, name: 'General Liability Insurance Policy', document_type: 'Insurance', folder: 'Compliance', version: '1.0', size: '1.1 MB', uploaded_by_name: 'Mike Peters', uploaded_at: '2024-11-15T00:00:00Z', status: 'active', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-15T00:00:00Z' },
  { id: 'doc-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Q4 2024 Financial Statements', document_type: 'Financial', folder: 'Finance', version: '2.1', size: '856 KB', uploaded_by_name: 'John Doe', uploaded_at: '2024-11-18T00:00:00Z', status: 'active', metadata: {}, created_at: '2024-11-18T00:00:00Z', updated_at: '2024-11-18T00:00:00Z' },
];

// =============================================================================
// ASSETS (3NF Compliant)
// =============================================================================

export interface DemoAsset {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  location_place_id?: string;
  location_name: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired';
  value: number;
  currency: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  last_maintenance_at: string;
  next_maintenance_at: string;
  utilization_rate: number;
  project_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSETS: DemoAsset[] = [
  { id: 'asset-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Meyer Sound LEO Family Line Array', category: 'Audio', location_name: 'Warehouse A - Bay 3', status: 'Available', value: 285000, currency: 'USD', condition: 'Excellent', last_maintenance_at: '2024-10-15T00:00:00Z', next_maintenance_at: '2025-01-15T00:00:00Z', utilization_rate: 0.82, project_count: 47, metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'asset-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Robe MegaPointe Lighting Fixtures (24x)', category: 'Lighting', location_name: 'Warehouse A - Bay 1', status: 'In Use', value: 156000, currency: 'USD', condition: 'Good', last_maintenance_at: '2024-09-20T00:00:00Z', next_maintenance_at: '2024-12-20T00:00:00Z', utilization_rate: 0.91, project_count: 52, metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'asset-003', organization_id: DEMO_ORGANIZATION_ID, name: 'disguise gx 2c Media Server', category: 'Video', location_name: 'Tech Room 2', status: 'Maintenance', value: 48000, currency: 'USD', condition: 'Fair', last_maintenance_at: '2024-11-18T00:00:00Z', next_maintenance_at: '2024-12-01T00:00:00Z', utilization_rate: 0.75, project_count: 38, metadata: {}, created_at: '2023-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ASSET MAINTENANCE (for assets/maintenance page)
// =============================================================================

// Interface matching asset_maintenance_events 3NF table schema
export interface DemoMaintenanceRecord {
  id: string;
  asset_id: string;
  event_type: string;
  event_date: string;
  description: string | null;
  next_scheduled: string | null;
  cost: number | null;
  performed_by: string | null;
  vendor_id: string | null;
  attachments: string[] | null;
  created_at: string;
}

export const DEMO_MAINTENANCE_RECORDS: DemoMaintenanceRecord[] = [
  { id: 'MNT-001', asset_id: 'AST-001', event_type: 'preventive', event_date: '2025-01-15', description: 'Quarterly speaker driver inspection - Meyer Sound LEO Family Line Array', next_scheduled: '2025-04-15', cost: null, performed_by: 'John Martinez', vendor_id: null, attachments: null, created_at: '2024-11-01T00:00:00Z' },
  { id: 'MNT-002', asset_id: 'AST-002', event_type: 'corrective', event_date: '2024-11-20', description: 'Replace faulty gobo wheel motor - Robe MegaPointe Lighting Fixtures', next_scheduled: null, cost: 1250, performed_by: 'Sarah Chen', vendor_id: 'VND-ROBE', attachments: null, created_at: '2024-11-15T00:00:00Z' },
  { id: 'MNT-003', asset_id: 'AST-003', event_type: 'preventive', event_date: '2024-11-18', description: 'Annual system diagnostics - disguise gx 2c Media Server. All tests passed.', next_scheduled: '2025-11-18', cost: 450, performed_by: 'Mike Thompson', vendor_id: null, attachments: null, created_at: '2024-11-10T00:00:00Z' },
];

// =============================================================================
// ASSET SCAN HISTORY (3NF Compliant - uses asset_id and person_id references)
// =============================================================================

export interface DemoScanHistory {
  id: string;
  organization_id: string;
  asset_id?: string;
  barcode: string;
  asset_name: string;
  action: 'check_in' | 'check_out' | 'inventory' | 'transfer';
  scanned_by_person_id?: string;
  scanned_by_name: string;
  scanned_at: string;
  location_place_id?: string;
  location_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const DEMO_SCAN_HISTORY: DemoScanHistory[] = [
  { id: 'scan-001', organization_id: DEMO_ORGANIZATION_ID, barcode: 'AST-001-LED', asset_name: 'LED Wall Panel Set A', action: 'check_out', scanned_by_name: 'John Martinez', scanned_at: '2024-11-24T14:30:00Z', location_name: 'Warehouse A', metadata: {}, created_at: '2024-11-24T14:30:00Z' },
  { id: 'scan-002', organization_id: DEMO_ORGANIZATION_ID, barcode: 'AST-002-AUD', asset_name: 'Meyer Sound Line Array', action: 'check_in', scanned_by_name: 'Sarah Chen', scanned_at: '2024-11-24T12:15:00Z', location_name: 'Venue - Main Stage', metadata: {}, created_at: '2024-11-24T12:15:00Z' },
  { id: 'scan-003', organization_id: DEMO_ORGANIZATION_ID, barcode: 'AST-003-LGT', asset_name: 'Lighting Console grandMA3', action: 'inventory', scanned_by_name: 'Mike Thompson', scanned_at: '2024-11-24T10:00:00Z', location_name: 'Warehouse B', metadata: {}, created_at: '2024-11-24T10:00:00Z' },
];

// =============================================================================
// SERIALIZED COMPONENTS (3NF Compliant - uses asset_id references)
// =============================================================================

export interface DemoSerializedComponent {
  id: string;
  organization_id: string;
  serial_number: string;
  parent_asset_id?: string;
  parent_asset_name: string;
  component_type: string;
  manufacturer: string;
  model: string;
  purchase_date: string;
  warranty_expiry: string;
  status: 'Active' | 'Replaced' | 'Retired';
  location_place_id?: string;
  location_name: string;
  notes?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SERIALIZED_COMPONENTS: DemoSerializedComponent[] = [
  { id: 'component-001', organization_id: DEMO_ORGANIZATION_ID, serial_number: 'SN-OSR-470W-2024-001', parent_asset_name: 'Meyer Sound LEO Family Line Array', component_type: 'Speaker Driver', manufacturer: 'Meyer Sound', model: 'LEO-M', purchase_date: '2024-01-15T00:00:00Z', warranty_expiry: '2027-01-15T00:00:00Z', status: 'Active', location_name: 'Warehouse A - Bay 3', metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'component-002', organization_id: DEMO_ORGANIZATION_ID, serial_number: 'SN-OSR-470W-2024-002', parent_asset_name: 'Meyer Sound LEO Family Line Array', component_type: 'Amplifier Module', manufacturer: 'Meyer Sound', model: 'LEO-AMP', purchase_date: '2024-01-15T00:00:00Z', warranty_expiry: '2027-01-15T00:00:00Z', status: 'Active', location_name: 'Warehouse A - Bay 3', metadata: {}, created_at: '2024-01-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ASSET SPECIFICATIONS (3NF Compliant)
// =============================================================================

export interface DemoAssetSpec {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  specifications: { key: string; value: string }[];
  documents: { name: string; type: string; size: string }[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ASSET_SPECS: DemoAssetSpec[] = [
  { id: 'spec-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Robe MegaPointe', category: 'Lighting', manufacturer: 'Robe', model: 'MegaPointe', specifications: [{ key: 'Power', value: '470W' }, { key: 'Lumens', value: '24,000' }, { key: 'Weight', value: '35 kg' }], documents: [{ name: 'User Manual', type: 'PDF', size: '12.5 MB' }], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// ANALYTICS DASHBOARDS (3NF Compliant)
// =============================================================================

export interface DemoAnalyticsDashboard {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  dashboard_type: string;
  last_viewed_at: string;
  view_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ANALYTICS_DASHBOARDS: DemoAnalyticsDashboard[] = [
  { id: 'analytics-dash-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Executive Overview', description: 'High-level KPIs and business metrics', dashboard_type: 'Executive', last_viewed_at: '2024-11-25T00:00:00Z', view_count: 245, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
  { id: 'analytics-dash-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Sales Pipeline', description: 'Deal tracking and revenue forecasting', dashboard_type: 'Sales', last_viewed_at: '2024-11-24T00:00:00Z', view_count: 189, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-24T00:00:00Z' },
  { id: 'analytics-dash-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Operations Dashboard', description: 'Project status and resource utilization', dashboard_type: 'Operations', last_viewed_at: '2024-11-25T00:00:00Z', view_count: 156, metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
];

// =============================================================================
// ANALYTICS REPORTS (3NF Compliant)
// =============================================================================

export interface DemoAnalyticsReport {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  report_type: string;
  last_run_at: string;
  schedule: string;
  format: 'pdf' | 'excel' | 'csv';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_ANALYTICS_REPORTS: DemoAnalyticsReport[] = [
  { id: 'analytics-report-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Monthly Revenue Summary', description: 'Revenue breakdown by project and client', report_type: 'Financial', last_run_at: '2024-11-01T00:00:00Z', schedule: 'Monthly', format: 'pdf', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T00:00:00Z' },
  { id: 'analytics-report-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Project Status Report', description: 'Current status of all active projects', report_type: 'Operations', last_run_at: '2024-11-25T00:00:00Z', schedule: 'Weekly', format: 'excel', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T00:00:00Z' },
];

// =============================================================================
// SCHEDULED REPORTS (3NF Compliant)
// =============================================================================

export interface DemoScheduledReport {
  id: string;
  organization_id: string;
  name: string;
  report_type: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  next_run_at: string;
  last_run_at: string;
  recipients: string[];
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'Active' | 'Paused' | 'Error';
  description?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_SCHEDULED_REPORTS: DemoScheduledReport[] = [
  { id: 'scheduled-report-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Weekly Revenue Summary', report_type: 'Financial', frequency: 'Weekly', next_run_at: '2024-12-02T08:00:00Z', last_run_at: '2024-11-25T08:00:00Z', recipients: ['cfo@company.com', 'finance@company.com'], format: 'PDF', status: 'Active', description: 'Weekly revenue breakdown by project and client', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T08:00:00Z' },
  { id: 'scheduled-report-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Daily Operations Dashboard', report_type: 'Operations', frequency: 'Daily', next_run_at: '2024-11-26T06:00:00Z', last_run_at: '2024-11-25T06:00:00Z', recipients: ['ops@company.com'], format: 'PDF', status: 'Active', description: 'Daily operational metrics and KPIs', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-25T06:00:00Z' },
  { id: 'scheduled-report-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Monthly Sales Pipeline', report_type: 'Sales', frequency: 'Monthly', next_run_at: '2024-12-01T09:00:00Z', last_run_at: '2024-11-01T09:00:00Z', recipients: ['sales@company.com', 'vp-sales@company.com'], format: 'Excel', status: 'Active', description: 'Monthly sales pipeline and forecast', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T09:00:00Z' },
];

// =============================================================================
// PROCUREMENT CATEGORY MANAGEMENT (3NF Compliant - uses person_id references)
// =============================================================================

export interface DemoProcurementCategoryFull {
  id: string;
  organization_id: string;
  name: string;
  parent_category_id?: string;
  parent_category_name?: string;
  total_spend: number;
  currency: string;
  vendor_count: number;
  strategy: 'Strategic' | 'Leverage' | 'Bottleneck' | 'Non-Critical';
  owner_person_id?: string;
  owner_name: string;
  last_review_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DemoProcurementSourcingStrategyFull {
  id: string;
  organization_id: string;
  category_id: string;
  category_name: string;
  objective: string;
  approach: string;
  target_savings_percentage: number;
  status: 'Draft' | 'Active' | 'Under Review';
  initiatives: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_PROCUREMENT_CATEGORIES_FULL: DemoProcurementCategoryFull[] = [
  { id: 'proc-cat-full-001', organization_id: DEMO_ORGANIZATION_ID, name: 'Audio Equipment', parent_category_name: 'Production Equipment', total_spend: 1250000, currency: 'USD', vendor_count: 12, strategy: 'Strategic', owner_name: 'John Smith', last_review_at: '2024-10-15T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-10-15T00:00:00Z' },
  { id: 'proc-cat-full-002', organization_id: DEMO_ORGANIZATION_ID, name: 'Lighting Equipment', parent_category_name: 'Production Equipment', total_spend: 980000, currency: 'USD', vendor_count: 8, strategy: 'Strategic', owner_name: 'Sarah Johnson', last_review_at: '2024-11-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-01T00:00:00Z' },
  { id: 'proc-cat-full-003', organization_id: DEMO_ORGANIZATION_ID, name: 'Video Equipment', parent_category_name: 'Production Equipment', total_spend: 750000, currency: 'USD', vendor_count: 6, strategy: 'Leverage', owner_name: 'Mike Davis', last_review_at: '2024-09-20T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-09-20T00:00:00Z' },
  { id: 'proc-cat-full-004', organization_id: DEMO_ORGANIZATION_ID, name: 'Staging & Rigging', parent_category_name: 'Production Equipment', total_spend: 620000, currency: 'USD', vendor_count: 5, strategy: 'Bottleneck', owner_name: 'Emily Chen', last_review_at: '2024-08-15T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-08-15T00:00:00Z' },
  { id: 'proc-cat-full-005', organization_id: DEMO_ORGANIZATION_ID, name: 'Transportation', total_spend: 450000, currency: 'USD', vendor_count: 15, strategy: 'Leverage', owner_name: 'Chris Brown', last_review_at: '2024-10-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-10-01T00:00:00Z' },
  { id: 'proc-cat-full-006', organization_id: DEMO_ORGANIZATION_ID, name: 'Office Supplies', total_spend: 85000, currency: 'USD', vendor_count: 3, strategy: 'Non-Critical', owner_name: 'Amy Wilson', last_review_at: '2024-07-01T00:00:00Z', metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-07-01T00:00:00Z' },
];

export const DEMO_PROCUREMENT_SOURCING_STRATEGIES_FULL: DemoProcurementSourcingStrategyFull[] = [
  { id: 'sourcing-strategy-001', organization_id: DEMO_ORGANIZATION_ID, category_id: 'proc-cat-full-001', category_name: 'Audio Equipment', objective: 'Consolidate vendors and negotiate volume discounts', approach: 'Preferred vendor program with 2-3 strategic partners', target_savings_percentage: 15, status: 'Active', initiatives: ['RFP for L-Acoustics partnership', 'Volume commitment negotiation', 'Rental vs buy analysis'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'sourcing-strategy-002', organization_id: DEMO_ORGANIZATION_ID, category_id: 'proc-cat-full-002', category_name: 'Lighting Equipment', objective: 'Reduce lead times and improve availability', approach: 'Consignment inventory with key suppliers', target_savings_percentage: 10, status: 'Active', initiatives: ['Consignment agreement with Robe', 'Safety stock optimization'], metadata: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];

// =============================================================================
// LOGISTICS SHIPMENTS FULL (3NF Compliant - uses project_id references)
// =============================================================================

export interface DemoLogisticsShipment {
  id: string;
  organization_id: string;
  project_id?: string;
  project_name: string;
  origin: string;
  destination: string;
  carrier: string;
  tracking_number?: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Delayed';
  estimated_delivery_at: string;
  actual_delivery_at?: string;
  items: { name: string; quantity: number; weight: string }[];
  total_weight: string;
  special_instructions?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const DEMO_LOGISTICS_SHIPMENTS: DemoLogisticsShipment[] = [
  { id: 'logistics-shipment-001', organization_id: DEMO_ORGANIZATION_ID, project_name: 'Ultra Music Festival 2025', origin: 'Warehouse A - Miami', destination: 'Bayfront Park - Main Stage', carrier: 'Internal Fleet', status: 'In Transit', estimated_delivery_at: '2024-12-10T00:00:00Z', items: [{ name: 'Meyer Sound LEO Line Array', quantity: 24, weight: '2,400 lbs' }, { name: 'Robe MegaPointe Fixtures', quantity: 48, weight: '1,680 lbs' }], total_weight: '4,080 lbs', special_instructions: 'Fragile - Handle with care. Requires forklift for unloading.', metadata: {}, created_at: '2024-11-01T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
  { id: 'logistics-shipment-002', organization_id: DEMO_ORGANIZATION_ID, project_name: 'Formula 1 Miami GP', origin: 'PRG Warehouse - Orlando', destination: 'Miami International Autodrome', carrier: 'FedEx Freight', tracking_number: '789456123', status: 'Pending', estimated_delivery_at: '2024-12-15T00:00:00Z', items: [{ name: 'LED Wall Panels', quantity: 200, weight: '8,000 lbs' }], total_weight: '8,000 lbs', metadata: {}, created_at: '2024-11-15T00:00:00Z', updated_at: '2024-11-20T00:00:00Z' },
];
