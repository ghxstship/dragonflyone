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

export type TemplateFormat = 'xlsx' | 'pdf' | 'docx' | 'pptx' | 'csv' | 'md';

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
  md: { label: 'Markdown', icon: 'FileText', color: 'purple' },
};

export const TEMPLATES: Template[] = [
  // ============================================
  // PRODUCTION PLANNING
  // ============================================
  {
    id: 'pp-001',
    title: 'Production Budget Template',
    description: 'Comprehensive production budget with 50+ line item categories, variance tracking, multi-currency support, and automatic calculations. Includes talent, production, marketing, venue, and overhead categories. Import-ready format.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '12 KB',
    downloadUrl: '/templates/production-planning/production-budget-template.csv',
    downloads: 3500,
    platform: 'atlvs',
    tags: ['budget', 'finance', 'planning', 'costs'],
    featured: true,
    industryPainPoint: 'Spreadsheets everywhere, no single source of truth for production costs',
  },
  {
    id: 'pp-002',
    title: 'Event Timeline Template',
    description: 'Gantt-style timeline with milestones, dependencies, and task owners. Covers pre-production through post-event wrap. Import-ready format with database-compatible headers.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '8 KB',
    downloadUrl: '/templates/production-planning/event-timeline-template.csv',
    downloads: 2800,
    platform: 'atlvs',
    tags: ['timeline', 'schedule', 'milestones', 'gantt'],
    featured: true,
    industryPainPoint: 'Missed deadlines and unclear ownership of tasks',
  },
  {
    id: 'pp-003',
    title: 'Run of Show Template',
    description: 'Cue-by-cue timing template with department columns (audio, lighting, video, stage), notes, and contingencies. Import-ready format.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '6 KB',
    downloadUrl: '/templates/production-planning/run-of-show-template.csv',
    downloads: 4200,
    platform: 'compvss',
    tags: ['ros', 'show', 'cues', 'timing'],
    featured: true,
    industryPainPoint: 'Paper ROS gets lost, updates don\'t reach everyone',
  },
  {
    id: 'pp-004',
    title: 'Load-In Schedule Template',
    description: 'Hour-by-hour load-in schedule with vendor arrival slots, equipment checklist, staging areas, and dock assignments. Import-ready format.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/production-planning/load-in-schedule-template.csv',
    downloads: 1900,
    platform: 'compvss',
    tags: ['load-in', 'delivery', 'vendors', 'logistics'],
    industryPainPoint: 'Chaos at load-in, vendors arriving at wrong times',
  },
  {
    id: 'pp-005',
    title: 'Strike Checklist',
    description: 'Department-by-department strike tasks with sign-off columns, equipment return tracking, and damage assessment. Import-ready format.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/production-planning/strike-checklist.csv',
    downloads: 1600,
    platform: 'compvss',
    tags: ['strike', 'load-out', 'checklist', 'wrap'],
    industryPainPoint: 'Equipment left behind, incomplete strike documentation',
  },
  {
    id: 'pp-006',
    title: 'Production Meeting Agenda',
    description: 'Structured agenda template for production meetings with sections for updates, issues, decisions, and action items. Import-ready format.',
    category: 'production-planning',
    format: 'md',
    fileSize: '4 KB',
    downloadUrl: '/templates/production-planning/production-meeting-agenda.md',
    downloads: 1200,
    platform: 'all',
    tags: ['meeting', 'agenda', 'notes', 'action items'],
  },
  {
    id: 'pp-007',
    title: 'Venue Site Survey',
    description: 'Comprehensive venue assessment template covering capacity, power, rigging points, load-in access, dressing rooms, and technical specifications. Import-ready format.',
    category: 'production-planning',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/production-planning/venue-site-survey.csv',
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
    description: 'Professional call sheet template with date, call times, locations, parking, contacts, weather, and safety information. Import-ready format.',
    category: 'crew-management',
    format: 'md',
    fileSize: '4 KB',
    downloadUrl: '/templates/crew-management/crew-call-sheet.md',
    downloads: 5100,
    platform: 'compvss',
    tags: ['call sheet', 'crew', 'schedule', 'daily'],
    featured: true,
    industryPainPoint: 'Crew shows up at wrong place or time',
  },
  {
    id: 'cm-002',
    title: 'Timesheet Template',
    description: 'Clock in/out tracking with breaks, overtime calculation, department codes, and supervisor approval. Import-ready format.',
    category: 'crew-management',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/crew-management/timesheet-template.csv',
    downloads: 2900,
    platform: 'compvss',
    tags: ['timesheet', 'hours', 'payroll', 'overtime'],
    industryPainPoint: 'Payroll disputes and no audit trail for hours worked',
  },
  {
    id: 'cm-003',
    title: 'Crew Contact Sheet',
    description: 'Master contact list with name, role, department, phone, email, emergency contact, and credential type. Import-ready format.',
    category: 'crew-management',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/crew-management/crew-contact-sheet.csv',
    downloads: 2200,
    platform: 'compvss',
    tags: ['contacts', 'directory', 'crew', 'phone'],
    industryPainPoint: 'Can\'t reach crew during show',
  },
  {
    id: 'cm-004',
    title: 'Department Head Checklist',
    description: 'Pre-show, show, and post-show task checklists by department. Includes audio, lighting, video, stage, catering, and security departments. Import-ready format.',
    category: 'crew-management',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/crew-management/department-head-checklist.csv',
    downloads: 1800,
    platform: 'compvss',
    tags: ['checklist', 'department', 'tasks', 'heads'],
    industryPainPoint: 'Department leads forget critical tasks',
  },
  {
    id: 'cm-005',
    title: 'Crew Availability Form',
    description: 'Form for crew to submit availability for upcoming productions. Includes date ranges, shift preferences, and conflict notes. Import-ready format.',
    category: 'crew-management',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/crew-management/crew-availability-form.csv',
    downloads: 1500,
    platform: 'compvss',
    tags: ['availability', 'scheduling', 'crew', 'form'],
  },
  {
    id: 'cm-006',
    title: 'Shift Schedule Template',
    description: 'Weekly shift schedule grid with crew assignments, break times, and position coverage. Includes overtime alerts and minimum rest period tracking. Import-ready format.',
    category: 'crew-management',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/crew-management/shift-schedule-template.csv',
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
    description: 'Artist deal terms template with guarantee, backend split, threshold, rider requirements, and payment terms. Import-ready format.',
    category: 'financial',
    format: 'md',
    fileSize: '5 KB',
    downloadUrl: '/templates/financial/deal-memo-template.md',
    downloads: 2400,
    platform: 'atlvs',
    tags: ['deal', 'artist', 'guarantee', 'contract'],
    featured: true,
    industryPainPoint: 'Verbal deals lead to disputes later',
  },
  {
    id: 'fi-002',
    title: 'Expense Report Template',
    description: 'Expense submission form with categories, receipt tracking, approval workflow, and reimbursement status. Import-ready format.',
    category: 'financial',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/financial/expense-report-template.csv',
    downloads: 2000,
    platform: 'atlvs',
    tags: ['expense', 'receipt', 'reimbursement', 'report'],
    industryPainPoint: 'Lost receipts and slow reimbursement process',
  },
  {
    id: 'fi-003',
    title: 'Settlement Report Template',
    description: 'Post-event settlement template with revenue breakdown, expense allocation, artist splits, and final accounting. Import-ready format.',
    category: 'financial',
    format: 'csv',
    fileSize: '6 KB',
    downloadUrl: '/templates/financial/settlement-report-template.csv',
    downloads: 1700,
    platform: 'atlvs',
    tags: ['settlement', 'revenue', 'split', 'accounting'],
    featured: true,
    industryPainPoint: 'Settlement takes weeks and leads to disputes',
  },
    {
    id: 'fi-005',
    title: 'Invoice Template',
    description: 'Professional invoice template with line items, tax calculations, payment terms, and bank details. Import-ready format.',
    category: 'financial',
    format: 'md',
    fileSize: '4 KB',
    downloadUrl: '/templates/financial/invoice-template.md',
    downloads: 1600,
    platform: 'atlvs',
    tags: ['invoice', 'billing', 'payment', 'accounts receivable'],
  },
  {
    id: 'fi-006',
    title: 'Purchase Order Template',
    description: 'PO template with vendor details, line items, delivery requirements, and approval signatures. Import-ready format.',
    category: 'financial',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/financial/purchase-order-template.csv',
    downloads: 1400,
    platform: 'atlvs',
    tags: ['purchase order', 'po', 'vendor', 'procurement'],
  },
  // ============================================
  // ADVANCING
  // ============================================
  {
    id: 'ad-001',
    title: 'Artist Advancing Form',
    description: 'Comprehensive artist advancing form covering hospitality, technical requirements, travel, credentials, and special requests. Import-ready format.',
    category: 'advancing',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/advancing/artist-advance-form.csv',
    downloads: 2600,
    platform: 'compvss',
    tags: ['artist', 'advancing', 'rider', 'hospitality'],
    featured: true,
    industryPainPoint: 'Incomplete rider info leads to last-minute surprises',
  },
  {
    id: 'ad-002',
    title: 'Venue Advancing Checklist',
    description: 'Venue assessment checklist covering capacity, load-in access, power, dressing rooms, catering facilities, and technical specifications. Import-ready format.',
    category: 'advancing',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/advancing/venue-advance-checklist.csv',
    downloads: 1800,
    platform: 'compvss',
    tags: ['venue', 'advancing', 'checklist', 'site'],
    industryPainPoint: 'Venue surprises on show day',
  },
  {
    id: 'ad-003',
    title: 'Technical Rider Template',
    description: 'Technical rider template with audio, lighting, video, backline, and power requirements. Import-ready format.',
    category: 'advancing',
    format: 'md',
    fileSize: '8 KB',
    downloadUrl: '/templates/advancing/technical-rider-template.md',
    downloads: 2200,
    platform: 'compvss',
    tags: ['technical', 'rider', 'audio', 'lighting', 'backline'],
    industryPainPoint: 'Technical requirements unclear or incomplete',
  },
  {
    id: 'ad-004',
    title: 'Hospitality Requirements',
    description: 'Hospitality requirements template with catering, dressing room setup, transportation needs, and accommodation preferences. Import-ready format.',
    category: 'advancing',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/advancing/hospitality-requirements.csv',
    downloads: 1900,
    platform: 'compvss',
    tags: ['hospitality', 'rider', 'catering', 'dressing room'],
    industryPainPoint: 'Artist unhappy due to hospitality issues',
  },
  // ============================================
  // CONTRACTS
  // ============================================
  {
    id: 'co-001',
    title: 'Vendor Agreement Template',
    description: 'Standard vendor contract with scope of work, payment terms, insurance requirements, cancellation policy, and liability clauses. Import-ready format.',
    category: 'contracts',
    format: 'md',
    fileSize: '10 KB',
    downloadUrl: '/templates/contracts/vendor-agreement-template.md',
    downloads: 1800,
    platform: 'atlvs',
    tags: ['vendor', 'contract', 'agreement', 'terms'],
    featured: true,
    industryPainPoint: 'Inconsistent vendor terms across productions',
  },
  {
    id: 'co-002',
    title: 'Crew Contract Template',
    description: 'Crew employment contract with position details, compensation, work schedule, and terms and conditions. Import-ready format.',
    category: 'contracts',
    format: 'md',
    fileSize: '12 KB',
    downloadUrl: '/templates/contracts/crew-contract-template.md',
    downloads: 2100,
    platform: 'atlvs',
    tags: ['crew', 'contract', 'employment', 'agreement'],
  },
  {
    id: 'co-003',
    title: 'NDA Template',
    description: 'Non-disclosure agreement for protecting confidential production information. Import-ready format.',
    category: 'contracts',
    format: 'md',
    fileSize: '14 KB',
    downloadUrl: '/templates/contracts/nda-template.md',
    downloads: 1100,
    platform: 'atlvs',
    tags: ['nda', 'confidential', 'non-disclosure', 'legal'],
  },
  {
    id: 'co-004',
    title: 'Service Agreement Template',
    description: 'Service agreement for freelance crew and contractors. Includes scope, compensation, IP rights, and tax classification. Import-ready format.',
    category: 'contracts',
    format: 'md',
    fileSize: '16 KB',
    downloadUrl: '/templates/contracts/service-agreement-template.md',
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
    title: 'Safety Plan Template',
    description: 'Comprehensive safety plan covering emergency procedures, evacuation routes, medical services, weather contingencies, and communication protocols. Import-ready format.',
    category: 'safety-compliance',
    format: 'md',
    fileSize: '16 KB',
    downloadUrl: '/templates/safety-compliance/safety-plan-template.md',
    downloads: 1600,
    platform: 'compvss',
    tags: ['safety', 'emergency', 'plan', 'evacuation'],
    featured: true,
  },
  {
    id: 'sc-002',
    title: 'Incident Report Form',
    description: 'Incident documentation form with details, witness information, photos, initial response, and follow-up actions. Import-ready format.',
    category: 'safety-compliance',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/safety-compliance/incident-report-form.csv',
    downloads: 1200,
    platform: 'compvss',
    tags: ['incident', 'report', 'accident', 'documentation'],
  },
  {
    id: 'sc-003',
    title: 'Risk Assessment Matrix',
    description: 'Risk assessment matrix for identifying, evaluating, and mitigating production risks. Includes likelihood/impact scoring and mitigation plans. Import-ready format.',
    category: 'safety-compliance',
    format: 'csv',
    fileSize: '5 KB',
    downloadUrl: '/templates/safety-compliance/risk-assessment-matrix.csv',
    downloads: 1100,
    platform: 'compvss',
    tags: ['risk', 'assessment', 'mitigation', 'matrix'],
  },
  {
    id: 'sc-004',
    title: 'Emergency Action Plan',
    description: 'Emergency action plan template with procedures for fire, medical, weather, and security emergencies. Import-ready format.',
    category: 'safety-compliance',
    format: 'md',
    fileSize: '18 KB',
    downloadUrl: '/templates/safety-compliance/emergency-action-plan.md',
    downloads: 900,
    platform: 'atlvs',
    tags: ['insurance', 'coi', 'certificate', 'vendor'],
  },
  // ============================================
  // MARKETING
  // ============================================
  {
    id: 'mk-001',
    title: 'Event Marketing Plan Template',
    description: 'Marketing plan template with timeline, channels, budget allocation, KPIs, and campaign tracking. Import-ready format.',
    category: 'marketing',
    format: 'md',
    fileSize: '14 KB',
    downloadUrl: '/templates/marketing/event-marketing-plan.md',
    downloads: 1400,
    platform: 'gvteway',
    tags: ['marketing', 'plan', 'campaign', 'promotion'],
  },
  {
    id: 'mk-002',
    title: 'Social Media Content Calendar',
    description: 'Content calendar template for event promotion across platforms. Includes post types, timing, assets needed, and engagement tracking. Import-ready format.',
    category: 'marketing',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/marketing/social-media-calendar.csv',
    downloads: 1800,
    platform: 'gvteway',
    tags: ['social media', 'content', 'calendar', 'posts'],
  },
  {
    id: 'mk-003',
    title: 'Press Release Template',
    description: 'Event announcement press release template with headline, body, quotes, and boilerplate. Import-ready format.',
    category: 'marketing',
    format: 'md',
    fileSize: '7 KB',
    downloadUrl: '/templates/marketing/press-release-template.md',
    downloads: 1100,
    platform: 'gvteway',
    tags: ['press', 'release', 'announcement', 'media'],
  },
  {
    id: 'mk-004',
    title: 'Sponsor Deck Template',
    description: 'Sponsorship opportunities deck with event overview, audience demographics, packages, and contact information. Import-ready format.',
    category: 'marketing',
    format: 'md',
    fileSize: '12 KB',
    downloadUrl: '/templates/marketing/sponsor-deck-template.md',
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
    description: 'Daily box office reconciliation template with ticket counts, payment types, comps, and cash drawer balancing. Import-ready format.',
    category: 'ticketing',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/ticketing/box-office-reconciliation.csv',
    downloads: 1200,
    platform: 'gvteway',
    tags: ['box office', 'reconciliation', 'cash', 'tickets'],
  },
  {
    id: 'tk-002',
    title: 'Guest List Template',
    description: 'Guest list management template with guest names, ticket types, credentials, and check-in status. Import-ready format.',
    category: 'ticketing',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/ticketing/guest-list-template.csv',
    downloads: 1500,
    platform: 'gvteway',
    tags: ['will call', 'guest list', 'pickup', 'box office'],
  },
  {
    id: 'tk-003',
    title: 'Ticket Pricing Matrix',
    description: 'Ticket pricing matrix with tiers, face values, fees, and inventory tracking. Import-ready format.',
    category: 'ticketing',
    format: 'csv',
    fileSize: '3 KB',
    downloadUrl: '/templates/ticketing/ticket-pricing-matrix.csv',
    downloads: 1000,
    platform: 'gvteway',
    tags: ['pricing', 'strategy', 'tiers', 'revenue'],
  },
  {
    id: 'tk-004',
    title: 'Promo Code Tracker',
    description: 'Promo code management template with discount types, usage limits, and performance tracking. Import-ready format.',
    category: 'ticketing',
    format: 'csv',
    fileSize: '4 KB',
    downloadUrl: '/templates/ticketing/promo-code-tracker.csv',
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
