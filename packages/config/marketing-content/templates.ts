/**
 * Marketing Templates - Centralized Template Content
 * Downloadable templates for production planning, crew management, and finance
 * 
 * Categories:
 * - Production Planning
 * - Crew Management
 * - Financial
 * - Advancing
 * - Contracts
 * - Safety & Compliance
 */

export interface Template {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  format: TemplateFormat;
  fileSize?: string;
  downloadUrl?: string;
  previewUrl?: string;
  downloads?: number;
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  tags?: string[];
  featured?: boolean;
  new?: boolean;
  industryPainPoint?: string;
}

export type TemplateCategory =
  | 'production-planning'
  | 'crew-management'
  | 'financial'
  | 'advancing'
  | 'contracts'
  | 'safety-compliance'
  | 'marketing'
  | 'ticketing';

export type TemplateFormat = 'xlsx' | 'pdf' | 'docx' | 'pptx' | 'csv';

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; description: string; icon: string }> = {
  'production-planning': {
    label: 'Production Planning',
    description: 'Templates for planning and executing productions',
    icon: 'Calendar',
  },
  'crew-management': {
    label: 'Crew Management',
    description: 'Templates for scheduling and managing crew',
    icon: 'Users',
  },
  'financial': {
    label: 'Financial',
    description: 'Templates for budgets, expenses, and settlements',
    icon: 'DollarSign',
  },
  'advancing': {
    label: 'Advancing',
    description: 'Templates for artist and venue advancing',
    icon: 'ClipboardList',
  },
  'contracts': {
    label: 'Contracts',
    description: 'Templates for agreements and legal documents',
    icon: 'FileText',
  },
  'safety-compliance': {
    label: 'Safety & Compliance',
    description: 'Templates for safety plans and compliance',
    icon: 'Shield',
  },
  'marketing': {
    label: 'Marketing',
    description: 'Templates for event marketing and promotion',
    icon: 'Megaphone',
  },
  'ticketing': {
    label: 'Ticketing',
    description: 'Templates for ticket operations and box office',
    icon: 'Ticket',
  },
};

export const FORMAT_INFO: Record<TemplateFormat, { label: string; icon: string; color: string }> = {
  xlsx: { label: 'Excel', icon: 'FileSpreadsheet', color: 'green' },
  pdf: { label: 'PDF', icon: 'FileText', color: 'red' },
  docx: { label: 'Word', icon: 'FileText', color: 'blue' },
  pptx: { label: 'PowerPoint', icon: 'Presentation', color: 'orange' },
  csv: { label: 'CSV', icon: 'Table', color: 'gray' },
};

export const TEMPLATES: Template[] = [
  // ============================================
  // PRODUCTION PLANNING
  // ============================================
  {
    id: 'pp-001',
    title: 'Production Budget Template',
    description: 'Comprehensive production budget with 50+ line item categories, variance tracking, multi-currency support, and automatic calculations. Includes talent, production, marketing, venue, and overhead categories.',
    category: 'production-planning',
    format: 'xlsx',
    fileSize: '245 KB',
    downloadUrl: '/templates/production-planning/production-budget-template.xlsx',
    downloads: 3500,
    platform: 'atlvs',
    tags: ['budget', 'finance', 'planning', 'costs'],
    featured: true,
    industryPainPoint: 'Spreadsheets everywhere, no single source of truth for production costs',
  },
  {
    id: 'pp-002',
    title: 'Event Timeline Template',
    description: 'Gantt-style timeline with milestones, dependencies, and task owners. Covers pre-production through post-event wrap. Includes automatic date calculations and critical path highlighting.',
    category: 'production-planning',
    format: 'xlsx',
    fileSize: '180 KB',
    downloadUrl: '/templates/production-planning/event-timeline-template.xlsx',
    downloads: 2800,
    platform: 'atlvs',
    tags: ['timeline', 'schedule', 'milestones', 'gantt'],
    featured: true,
    industryPainPoint: 'Missed deadlines and unclear ownership of tasks',
  },
  {
    id: 'pp-003',
    title: 'Run of Show Template',
    description: 'Cue-by-cue timing template with department columns (audio, lighting, video, stage), notes, and contingencies. Includes show flow, transitions, and emergency procedures.',
    category: 'production-planning',
    format: 'xlsx',
    fileSize: '156 KB',
    downloadUrl: '/templates/production-planning/run-of-show-template.xlsx',
    downloads: 4200,
    platform: 'compvss',
    tags: ['ros', 'show', 'cues', 'timing'],
    featured: true,
    industryPainPoint: 'Paper ROS gets lost, updates don\'t reach everyone',
  },
  {
    id: 'pp-004',
    title: 'Load-In Schedule Template',
    description: 'Hour-by-hour load-in schedule with vendor arrival slots, equipment checklist, staging areas, and dock assignments. Includes contact information and delivery tracking.',
    category: 'production-planning',
    format: 'pdf',
    fileSize: '98 KB',
    downloads: 1900,
    platform: 'compvss',
    tags: ['load-in', 'delivery', 'vendors', 'logistics'],
    industryPainPoint: 'Chaos at load-in, vendors arriving at wrong times',
  },
  {
    id: 'pp-005',
    title: 'Strike Checklist',
    description: 'Department-by-department strike tasks with sign-off columns, equipment return tracking, and damage assessment. Ensures nothing is left behind.',
    category: 'production-planning',
    format: 'pdf',
    fileSize: '85 KB',
    downloads: 1600,
    platform: 'compvss',
    tags: ['strike', 'load-out', 'checklist', 'wrap'],
    industryPainPoint: 'Equipment left behind, incomplete strike documentation',
  },
  {
    id: 'pp-006',
    title: 'Production Meeting Agenda',
    description: 'Structured agenda template for production meetings with sections for updates, issues, decisions, and action items. Includes attendee tracking and follow-up assignments.',
    category: 'production-planning',
    format: 'docx',
    fileSize: '45 KB',
    downloads: 1200,
    platform: 'all',
    tags: ['meeting', 'agenda', 'notes', 'action items'],
  },
  {
    id: 'pp-007',
    title: 'Venue Site Survey',
    description: 'Comprehensive venue assessment template covering capacity, power, rigging points, load-in access, dressing rooms, and technical specifications.',
    category: 'production-planning',
    format: 'pdf',
    fileSize: '120 KB',
    downloads: 1400,
    platform: 'compvss',
    tags: ['venue', 'site', 'survey', 'technical'],
    new: true,
  },

  // ============================================
  // CREW MANAGEMENT
  // ============================================
  {
    id: 'cm-001',
    title: 'Crew Call Sheet',
    description: 'Professional call sheet template with date, call times, locations, parking, contacts, weather, and safety information. Includes department-specific call times and notes.',
    category: 'crew-management',
    format: 'pdf',
    fileSize: '75 KB',
    downloadUrl: '/templates/crew-management/crew-call-sheet.pdf',
    downloads: 5100,
    platform: 'compvss',
    tags: ['call sheet', 'crew', 'schedule', 'daily'],
    featured: true,
    industryPainPoint: 'Crew shows up at wrong place or time',
  },
  {
    id: 'cm-002',
    title: 'Timesheet Template',
    description: 'Clock in/out tracking with breaks, overtime calculation, department codes, and supervisor approval. Supports daily and weekly views with automatic hour totals.',
    category: 'crew-management',
    format: 'xlsx',
    fileSize: '95 KB',
    downloads: 2900,
    platform: 'compvss',
    tags: ['timesheet', 'hours', 'payroll', 'overtime'],
    industryPainPoint: 'Payroll disputes and no audit trail for hours worked',
  },
  {
    id: 'cm-003',
    title: 'Crew Contact Sheet',
    description: 'Master contact list with name, role, department, phone, email, emergency contact, and credential type. Sortable by department and role.',
    category: 'crew-management',
    format: 'xlsx',
    fileSize: '65 KB',
    downloads: 2200,
    platform: 'compvss',
    tags: ['contacts', 'directory', 'crew', 'phone'],
    industryPainPoint: 'Can\'t reach crew during show',
  },
  {
    id: 'cm-004',
    title: 'Department Head Checklist',
    description: 'Pre-show, show, and post-show task checklists by department. Includes audio, lighting, video, stage, catering, and security departments.',
    category: 'crew-management',
    format: 'pdf',
    fileSize: '110 KB',
    downloads: 1800,
    platform: 'compvss',
    tags: ['checklist', 'department', 'tasks', 'heads'],
    industryPainPoint: 'Department leads forget critical tasks',
  },
  {
    id: 'cm-005',
    title: 'Crew Availability Form',
    description: 'Form for crew to submit availability for upcoming productions. Includes date ranges, shift preferences, and conflict notes.',
    category: 'crew-management',
    format: 'pdf',
    fileSize: '55 KB',
    downloads: 1500,
    platform: 'compvss',
    tags: ['availability', 'scheduling', 'crew', 'form'],
  },
  {
    id: 'cm-006',
    title: 'Shift Schedule Template',
    description: 'Weekly shift schedule grid with crew assignments, break times, and position coverage. Includes overtime alerts and minimum rest period tracking.',
    category: 'crew-management',
    format: 'xlsx',
    fileSize: '88 KB',
    downloads: 2100,
    platform: 'compvss',
    tags: ['schedule', 'shifts', 'weekly', 'coverage'],
    new: true,
  },

  // ============================================
  // FINANCIAL
  // ============================================
  {
    id: 'fi-001',
    title: 'Deal Memo Template',
    description: 'Artist deal terms template with guarantee, backend split, threshold, rider requirements, and payment terms. Includes standard clauses and customizable sections.',
    category: 'financial',
    format: 'docx',
    fileSize: '78 KB',
    downloadUrl: '/templates/financial/deal-memo-template.docx',
    downloads: 2400,
    platform: 'atlvs',
    tags: ['deal', 'artist', 'guarantee', 'contract'],
    featured: true,
    industryPainPoint: 'Verbal deals lead to disputes later',
  },
  {
    id: 'fi-002',
    title: 'Expense Report Template',
    description: 'Expense submission form with categories, receipt tracking, approval workflow, and reimbursement status. Includes per diem and mileage calculators.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '92 KB',
    downloads: 2000,
    platform: 'atlvs',
    tags: ['expense', 'receipt', 'reimbursement', 'report'],
    industryPainPoint: 'Lost receipts and slow reimbursement process',
  },
  {
    id: 'fi-003',
    title: 'Settlement Report Template',
    description: 'Post-event settlement template with revenue breakdown, expense allocation, artist splits, and final accounting. Generates stakeholder-ready reports.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '145 KB',
    downloads: 1700,
    platform: 'atlvs',
    tags: ['settlement', 'revenue', 'split', 'accounting'],
    featured: true,
    industryPainPoint: 'Settlement takes weeks and leads to disputes',
  },
  {
    id: 'fi-004',
    title: 'P&L by Event Template',
    description: 'Profit and loss statement by event with revenue streams, cost categories, and margin analysis. Compare actuals to budget with variance highlighting.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '125 KB',
    downloads: 1900,
    platform: 'atlvs',
    tags: ['p&l', 'profit', 'loss', 'margin', 'analysis'],
    industryPainPoint: 'Don\'t know if events are actually profitable',
  },
  {
    id: 'fi-005',
    title: 'Invoice Template',
    description: 'Professional invoice template with line items, tax calculations, payment terms, and bank details. Includes your branding and automatic numbering.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '68 KB',
    downloads: 1600,
    platform: 'atlvs',
    tags: ['invoice', 'billing', 'payment', 'accounts receivable'],
  },
  {
    id: 'fi-006',
    title: 'Purchase Order Template',
    description: 'PO template with vendor details, line items, delivery requirements, and approval signatures. Includes terms and conditions.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '72 KB',
    downloads: 1400,
    platform: 'atlvs',
    tags: ['purchase order', 'po', 'vendor', 'procurement'],
  },
  {
    id: 'fi-007',
    title: 'Cash Flow Projection',
    description: 'Weekly cash flow projection template for productions. Track ticket revenue timing, vendor payments, and working capital needs.',
    category: 'financial',
    format: 'xlsx',
    fileSize: '98 KB',
    downloads: 1100,
    platform: 'atlvs',
    tags: ['cash flow', 'projection', 'forecast', 'treasury'],
    new: true,
  },

  // ============================================
  // ADVANCING
  // ============================================
  {
    id: 'ad-001',
    title: 'Artist Advancing Form',
    description: 'Comprehensive artist advancing form covering hospitality, technical requirements, travel, credentials, and special requests. Digital-friendly format.',
    category: 'advancing',
    format: 'pdf',
    fileSize: '135 KB',
    downloads: 2600,
    platform: 'compvss',
    tags: ['artist', 'advancing', 'rider', 'hospitality'],
    featured: true,
    industryPainPoint: 'Incomplete rider info leads to last-minute surprises',
  },
  {
    id: 'ad-002',
    title: 'Venue Advancing Checklist',
    description: 'Venue assessment checklist covering capacity, load-in access, power, dressing rooms, catering facilities, and technical specifications.',
    category: 'advancing',
    format: 'pdf',
    fileSize: '95 KB',
    downloads: 1800,
    platform: 'compvss',
    tags: ['venue', 'advancing', 'checklist', 'site'],
    industryPainPoint: 'Venue surprises on show day',
  },
  {
    id: 'ad-003',
    title: 'Technical Rider Template',
    description: 'Technical rider template with audio, lighting, video, backline, and power requirements. Includes stage plot and input list sections.',
    category: 'advancing',
    format: 'docx',
    fileSize: '88 KB',
    downloads: 2200,
    platform: 'compvss',
    tags: ['technical', 'rider', 'audio', 'lighting', 'backline'],
    industryPainPoint: 'Technical requirements unclear or incomplete',
  },
  {
    id: 'ad-004',
    title: 'Hospitality Rider Template',
    description: 'Hospitality rider template with catering requirements, dressing room setup, transportation needs, and accommodation preferences.',
    category: 'advancing',
    format: 'docx',
    fileSize: '65 KB',
    downloads: 1900,
    platform: 'compvss',
    tags: ['hospitality', 'rider', 'catering', 'dressing room'],
    industryPainPoint: 'Artist unhappy due to hospitality issues',
  },
  {
    id: 'ad-005',
    title: 'Travel Manifest Template',
    description: 'Tour travel manifest with flight details, ground transportation, hotel assignments, and per diem tracking for touring parties.',
    category: 'advancing',
    format: 'xlsx',
    fileSize: '78 KB',
    downloads: 1200,
    platform: 'compvss',
    tags: ['travel', 'manifest', 'flights', 'hotels', 'tour'],
  },
  {
    id: 'ad-006',
    title: 'Day Sheet Template',
    description: 'Daily tour schedule template with venue info, load-in times, soundcheck, show times, and after-show logistics.',
    category: 'advancing',
    format: 'pdf',
    fileSize: '55 KB',
    downloads: 1500,
    platform: 'compvss',
    tags: ['day sheet', 'tour', 'daily', 'schedule'],
  },

  // ============================================
  // CONTRACTS
  // ============================================
  {
    id: 'co-001',
    title: 'Vendor Contract Template',
    description: 'Standard vendor contract with scope of work, payment terms, insurance requirements, cancellation policy, and liability clauses. Customizable for different vendor types.',
    category: 'contracts',
    format: 'docx',
    fileSize: '95 KB',
    downloads: 1800,
    platform: 'atlvs',
    tags: ['vendor', 'contract', 'agreement', 'terms'],
    featured: true,
    industryPainPoint: 'Inconsistent vendor terms across productions',
  },
  {
    id: 'co-002',
    title: 'Artist Performance Agreement',
    description: 'Performance agreement template with engagement terms, compensation, technical requirements, cancellation, and force majeure clauses.',
    category: 'contracts',
    format: 'docx',
    fileSize: '112 KB',
    downloads: 2100,
    platform: 'atlvs',
    tags: ['artist', 'performance', 'agreement', 'booking'],
  },
  {
    id: 'co-003',
    title: 'Venue Rental Agreement',
    description: 'Venue rental contract with dates, fees, deposit schedule, insurance requirements, and operational rules. Includes load-in/out terms.',
    category: 'contracts',
    format: 'docx',
    fileSize: '105 KB',
    downloads: 1500,
    platform: 'atlvs',
    tags: ['venue', 'rental', 'agreement', 'facility'],
  },
  {
    id: 'co-004',
    title: 'Sponsorship Agreement',
    description: 'Sponsorship contract template with benefits, deliverables, payment schedule, exclusivity terms, and activation rights.',
    category: 'contracts',
    format: 'docx',
    fileSize: '98 KB',
    downloads: 1300,
    platform: 'atlvs',
    tags: ['sponsor', 'sponsorship', 'agreement', 'partnership'],
  },
  {
    id: 'co-005',
    title: 'NDA Template',
    description: 'Non-disclosure agreement for protecting confidential production information. Mutual and one-way versions included.',
    category: 'contracts',
    format: 'docx',
    fileSize: '45 KB',
    downloads: 1100,
    platform: 'atlvs',
    tags: ['nda', 'confidential', 'non-disclosure', 'legal'],
  },
  {
    id: 'co-006',
    title: 'Independent Contractor Agreement',
    description: 'IC agreement for freelance crew and contractors. Includes scope, compensation, IP rights, and tax classification.',
    category: 'contracts',
    format: 'docx',
    fileSize: '85 KB',
    downloads: 1400,
    platform: 'atlvs',
    tags: ['contractor', 'freelance', 'agreement', '1099'],
    new: true,
  },

  // ============================================
  // SAFETY & COMPLIANCE
  // ============================================
  {
    id: 'sc-001',
    title: 'Event Safety Plan Template',
    description: 'Comprehensive safety plan covering emergency procedures, evacuation routes, medical services, weather contingencies, and communication protocols.',
    category: 'safety-compliance',
    format: 'docx',
    fileSize: '145 KB',
    downloads: 1600,
    platform: 'compvss',
    tags: ['safety', 'emergency', 'plan', 'evacuation'],
    featured: true,
  },
  {
    id: 'sc-002',
    title: 'Incident Report Form',
    description: 'Incident documentation form with details, witness information, photos, initial response, and follow-up actions. Insurance-ready format.',
    category: 'safety-compliance',
    format: 'pdf',
    fileSize: '68 KB',
    downloads: 1200,
    platform: 'compvss',
    tags: ['incident', 'report', 'accident', 'documentation'],
  },
  {
    id: 'sc-003',
    title: 'Risk Assessment Template',
    description: 'Risk assessment matrix for identifying, evaluating, and mitigating production risks. Includes likelihood/impact scoring and mitigation plans.',
    category: 'safety-compliance',
    format: 'xlsx',
    fileSize: '88 KB',
    downloads: 1100,
    platform: 'compvss',
    tags: ['risk', 'assessment', 'mitigation', 'matrix'],
  },
  {
    id: 'sc-004',
    title: 'Certificate of Insurance Request',
    description: 'COI request form for vendors with required coverage limits, additional insured requirements, and submission instructions.',
    category: 'safety-compliance',
    format: 'pdf',
    fileSize: '52 KB',
    downloads: 900,
    platform: 'atlvs',
    tags: ['insurance', 'coi', 'certificate', 'vendor'],
  },
  {
    id: 'sc-005',
    title: 'Crowd Management Plan',
    description: 'Crowd management plan template with capacity calculations, flow patterns, barrier placement, and density monitoring protocols.',
    category: 'safety-compliance',
    format: 'docx',
    fileSize: '125 KB',
    downloads: 800,
    platform: 'compvss',
    tags: ['crowd', 'management', 'capacity', 'safety'],
    new: true,
  },

  // ============================================
  // MARKETING
  // ============================================
  {
    id: 'mk-001',
    title: 'Event Marketing Plan Template',
    description: 'Marketing plan template with timeline, channels, budget allocation, KPIs, and campaign tracking. Covers announcement through on-sale to event day.',
    category: 'marketing',
    format: 'xlsx',
    fileSize: '135 KB',
    downloads: 1400,
    platform: 'gvteway',
    tags: ['marketing', 'plan', 'campaign', 'promotion'],
  },
  {
    id: 'mk-002',
    title: 'Social Media Content Calendar',
    description: 'Content calendar template for event promotion across platforms. Includes post types, timing, assets needed, and engagement tracking.',
    category: 'marketing',
    format: 'xlsx',
    fileSize: '95 KB',
    downloads: 1800,
    platform: 'gvteway',
    tags: ['social media', 'content', 'calendar', 'posts'],
  },
  {
    id: 'mk-003',
    title: 'Press Release Template',
    description: 'Event announcement press release template with headline, body, quotes, and boilerplate. Includes distribution checklist.',
    category: 'marketing',
    format: 'docx',
    fileSize: '48 KB',
    downloads: 1100,
    platform: 'gvteway',
    tags: ['press', 'release', 'announcement', 'media'],
  },
  {
    id: 'mk-004',
    title: 'Influencer Outreach Template',
    description: 'Influencer partnership outreach template with offer tiers, deliverables, and tracking. Includes email templates and agreement terms.',
    category: 'marketing',
    format: 'docx',
    fileSize: '65 KB',
    downloads: 900,
    platform: 'gvteway',
    tags: ['influencer', 'outreach', 'partnership', 'social'],
    new: true,
  },

  // ============================================
  // TICKETING
  // ============================================
  {
    id: 'tk-001',
    title: 'Box Office Reconciliation',
    description: 'Daily box office reconciliation template with ticket counts, payment types, comps, and cash drawer balancing.',
    category: 'ticketing',
    format: 'xlsx',
    fileSize: '78 KB',
    downloads: 1200,
    platform: 'gvteway',
    tags: ['box office', 'reconciliation', 'cash', 'tickets'],
  },
  {
    id: 'tk-002',
    title: 'Will Call List Template',
    description: 'Will call management template with guest names, ticket types, pickup status, and ID verification tracking.',
    category: 'ticketing',
    format: 'xlsx',
    fileSize: '55 KB',
    downloads: 1500,
    platform: 'gvteway',
    tags: ['will call', 'guest list', 'pickup', 'box office'],
  },
  {
    id: 'tk-003',
    title: 'Ticket Pricing Strategy',
    description: 'Pricing strategy worksheet with tier analysis, competitor comparison, dynamic pricing triggers, and revenue projections.',
    category: 'ticketing',
    format: 'xlsx',
    fileSize: '92 KB',
    downloads: 1000,
    platform: 'gvteway',
    tags: ['pricing', 'strategy', 'tiers', 'revenue'],
  },
  {
    id: 'tk-004',
    title: 'Guest List Management',
    description: 'Guest list template with name, affiliation, ticket type, plus-ones, and check-in status. Supports multiple list types (artist, sponsor, media).',
    category: 'ticketing',
    format: 'xlsx',
    fileSize: '68 KB',
    downloads: 1300,
    platform: 'gvteway',
    tags: ['guest list', 'comps', 'vip', 'check-in'],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get templates by platform
 */
export function getTemplatesByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): Template[] {
  return TEMPLATES.filter((template) => template.platform === platform || template.platform === 'all');
}

/**
 * Get featured templates
 */
export function getFeaturedTemplates(): Template[] {
  return TEMPLATES.filter((template) => template.featured);
}

/**
 * Get new templates
 */
export function getNewTemplates(): Template[] {
  return TEMPLATES.filter((template) => template.new);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATES.filter(
    (template) =>
      template.title.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get templates sorted by downloads
 */
export function getPopularTemplates(limit?: number): Template[] {
  const sorted = [...TEMPLATES].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Get template count by category
 */
export function getTemplateCountByCategory(): Record<TemplateCategory, number> {
  const counts: Partial<Record<TemplateCategory, number>> = {};
  for (const template of TEMPLATES) {
    counts[template.category] = (counts[template.category] || 0) + 1;
  }
  return counts as Record<TemplateCategory, number>;
}

export default TEMPLATES;
