/**
 * Marketing Guides - Centralized Guide Content
 * Step-by-step tutorials and learning paths derived from USER_GUIDES.md
 * 
 * Categories:
 * - Getting Started
 * - Workflow Guides
 * - Role-Specific Guides
 * - Best Practices
 * - API & Integrations
 */

export interface Guide {
  id: string;
  title: string;
  description: string;
  category: GuideCategory;
  difficulty: GuideDifficulty;
  estimatedTime: string;
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  workflowRefs?: string[];
  tags?: string[];
  featured?: boolean;
  new?: boolean;
  chapters?: GuideChapter[];
  prerequisites?: string[];
  outcomes?: string[];
}

export interface GuideChapter {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
}

export type GuideCategory =
  | 'getting-started'
  | 'workflow-guides'
  | 'role-specific'
  | 'best-practices'
  | 'api-integrations'
  | 'advanced-features';

export type GuideDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const GUIDE_CATEGORIES: Record<GuideCategory, { label: string; description: string; icon: string }> = {
  'getting-started': {
    label: 'Getting Started',
    description: 'Essential guides for new users',
    icon: 'Rocket',
  },
  'workflow-guides': {
    label: 'Workflow Guides',
    description: 'Step-by-step workflow tutorials',
    icon: 'GitBranch',
  },
  'role-specific': {
    label: 'Role-Specific',
    description: 'Guides tailored to your role',
    icon: 'UserCircle',
  },
  'best-practices': {
    label: 'Best Practices',
    description: 'Industry tips and recommendations',
    icon: 'Award',
  },
  'api-integrations': {
    label: 'API & Integrations',
    description: 'Developer and integration guides',
    icon: 'Code',
  },
  'advanced-features': {
    label: 'Advanced Features',
    description: 'Power user features and customization',
    icon: 'Zap',
  },
};

export const DIFFICULTY_INFO: Record<GuideDifficulty, { label: string; color: string; description: string }> = {
  beginner: {
    label: 'Beginner',
    color: 'green',
    description: 'No prior experience required',
  },
  intermediate: {
    label: 'Intermediate',
    color: 'yellow',
    description: 'Some platform familiarity helpful',
  },
  advanced: {
    label: 'Advanced',
    color: 'red',
    description: 'For experienced users',
  },
};

export const GUIDES: Guide[] = [
  // ============================================
  // GETTING STARTED
  // ============================================
  {
    id: 'gs-001',
    title: 'Your First Production',
    description: 'Learn how to create your first production in GHXSTSHIP, from initial setup through team assignment and budget configuration. This foundational guide walks you through every step.',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    platform: 'atlvs',
    workflowRefs: ['WF-ATLVS-001'],
    tags: ['production', 'setup', 'new', 'create'],
    featured: true,
    outcomes: [
      'Create a new production with all required details',
      'Assign team members with appropriate roles',
      'Set up initial budget categories',
      'Link venues to your production',
    ],
    chapters: [
      { id: 'ch1', title: 'Creating the Production', description: 'Navigate to productions and enter basic details', estimatedTime: '3 min' },
      { id: 'ch2', title: 'Configuring Settings', description: 'Set up production type, dates, and preferences', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Adding Team Members', description: 'Invite team and assign roles', estimatedTime: '4 min' },
      { id: 'ch4', title: 'Setting Up Budget', description: 'Create budget categories and initial estimates', estimatedTime: '4 min' },
    ],
  },
  {
    id: 'gs-002',
    title: 'Setting Up Your Organization',
    description: 'Configure your organization settings, branding, and preferences. This guide covers everything from company details to notification settings.',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    platform: 'all',
    tags: ['organization', 'settings', 'branding', 'setup'],
    outcomes: [
      'Configure organization profile and branding',
      'Set up notification preferences',
      'Configure default settings for new productions',
      'Manage organization-wide integrations',
    ],
    chapters: [
      { id: 'ch1', title: 'Organization Profile', description: 'Set up company name, logo, and details', estimatedTime: '3 min' },
      { id: 'ch2', title: 'Branding Settings', description: 'Configure colors, logos, and email templates', estimatedTime: '3 min' },
      { id: 'ch3', title: 'Default Preferences', description: 'Set defaults for new productions', estimatedTime: '2 min' },
      { id: 'ch4', title: 'Notifications', description: 'Configure notification channels and preferences', estimatedTime: '2 min' },
    ],
  },
  {
    id: 'gs-003',
    title: 'Understanding Roles & Permissions',
    description: 'Master the GHXSTSHIP role system including platform roles, event roles, and permission inheritance. Essential knowledge for managing team access.',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '12 minutes',
    platform: 'all',
    tags: ['roles', 'permissions', 'access', 'rbac'],
    featured: true,
    outcomes: [
      'Understand the difference between platform and event roles',
      'Know which permissions each role grants',
      'Assign appropriate roles to team members',
      'Configure custom permission sets',
    ],
    chapters: [
      { id: 'ch1', title: 'Platform Roles Overview', description: 'ATLVS, COMPVSS, and GVTEWAY roles explained', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Event Roles Explained', description: 'Event-specific roles from Executive to Volunteer', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Permission Inheritance', description: 'How permissions flow from platform to event level', estimatedTime: '2 min' },
      { id: 'ch4', title: 'Assigning Roles', description: 'Best practices for role assignment', estimatedTime: '2 min' },
    ],
  },
  {
    id: 'gs-004',
    title: 'Navigating the Dashboard',
    description: 'Get familiar with the GHXSTSHIP dashboard, key metrics, quick actions, and navigation. Learn to find what you need quickly.',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: '8 minutes',
    platform: 'all',
    tags: ['dashboard', 'navigation', 'interface', 'ui'],
    outcomes: [
      'Navigate the main dashboard efficiently',
      'Understand key metrics and what they mean',
      'Use quick actions for common tasks',
      'Customize your dashboard view',
    ],
    chapters: [
      { id: 'ch1', title: 'Dashboard Overview', description: 'Understanding the main dashboard layout', estimatedTime: '2 min' },
      { id: 'ch2', title: 'Key Metrics', description: 'What each metric means and why it matters', estimatedTime: '3 min' },
      { id: 'ch3', title: 'Quick Actions', description: 'Shortcuts for common tasks', estimatedTime: '2 min' },
      { id: 'ch4', title: 'Customization', description: 'Personalizing your dashboard', estimatedTime: '1 min' },
    ],
  },

  // ============================================
  // WORKFLOW GUIDES
  // ============================================
  {
    id: 'wf-001',
    title: 'Budget Management Masterclass',
    description: 'Complete guide to production budgeting in ATLVS. Learn to create budgets, track actuals, manage variance, and generate financial reports.',
    category: 'workflow-guides',
    difficulty: 'intermediate',
    estimatedTime: '25 minutes',
    platform: 'atlvs',
    workflowRefs: ['WF-ATLVS-002'],
    tags: ['budget', 'finance', 'tracking', 'variance'],
    featured: true,
    outcomes: [
      'Create comprehensive production budgets',
      'Track actuals against budget in real-time',
      'Set up variance alerts and thresholds',
      'Generate budget reports for stakeholders',
    ],
    chapters: [
      { id: 'ch1', title: 'Creating a Budget', description: 'Set up categories, line items, and estimates', estimatedTime: '6 min' },
      { id: 'ch2', title: 'Tracking Actuals', description: 'Log expenses and track against budget', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Variance Analysis', description: 'Understand and manage budget variances', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Approval Workflows', description: 'Set up budget approval processes', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Reporting', description: 'Generate and share budget reports', estimatedTime: '5 min' },
    ],
  },
  {
    id: 'wf-002',
    title: 'Crew Scheduling Best Practices',
    description: 'Master crew scheduling in COMPVSS. From creating shifts to managing availability, credentials, and timekeeping.',
    category: 'workflow-guides',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    platform: 'compvss',
    workflowRefs: ['WF-COMPVSS-002', 'WF-COMPVSS-004'],
    tags: ['crew', 'scheduling', 'shifts', 'credentials'],
    featured: true,
    outcomes: [
      'Create and manage crew shifts efficiently',
      'Handle availability and conflicts',
      'Issue and manage credentials',
      'Track time and approve timesheets',
    ],
    chapters: [
      { id: 'ch1', title: 'Creating Shifts', description: 'Set up shifts by department and time', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Assigning Crew', description: 'Match crew to shifts based on skills', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Managing Availability', description: 'Handle conflicts and substitutions', estimatedTime: '4 min' },
      { id: 'ch4', title: 'Credentials', description: 'Issue and manage access credentials', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Timekeeping', description: 'Clock in/out and timesheet approval', estimatedTime: '4 min' },
    ],
  },
  {
    id: 'wf-003',
    title: 'Event Settlement Guide',
    description: 'Complete walkthrough of post-event settlement. Calculate revenue, allocate expenses, process splits, and generate settlement reports.',
    category: 'workflow-guides',
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    platform: 'all',
    workflowRefs: ['WF-GVTEWAY-028', 'WF-COMPVSS-012'],
    tags: ['settlement', 'revenue', 'reconciliation', 'accounting'],
    outcomes: [
      'Reconcile ticket revenue accurately',
      'Allocate expenses to correct categories',
      'Calculate artist and venue splits',
      'Generate professional settlement reports',
    ],
    chapters: [
      { id: 'ch1', title: 'Revenue Reconciliation', description: 'Verify and categorize all revenue', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Expense Allocation', description: 'Assign expenses to settlement categories', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Calculating Splits', description: 'Process artist, venue, and partner splits', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Settlement Reports', description: 'Generate and distribute reports', estimatedTime: '5 min' },
    ],
  },
  {
    id: 'wf-004',
    title: 'Vendor Management End-to-End',
    description: 'Complete vendor lifecycle from onboarding through payment. Covers contracts, purchase orders, invoices, and vendor performance.',
    category: 'workflow-guides',
    difficulty: 'intermediate',
    estimatedTime: '22 minutes',
    platform: 'atlvs',
    workflowRefs: ['WF-ATLVS-003', 'WF-ATLVS-011', 'WF-ATLVS-014'],
    tags: ['vendor', 'procurement', 'invoices', 'contracts'],
    outcomes: [
      'Onboard vendors with proper documentation',
      'Create and manage vendor contracts',
      'Process purchase orders and receipts',
      'Handle invoice processing and payment',
    ],
    chapters: [
      { id: 'ch1', title: 'Vendor Onboarding', description: 'Add vendors with required documentation', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Contracts', description: 'Create and manage vendor contracts', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Purchase Orders', description: 'Create POs and track deliveries', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Invoice Processing', description: 'Receive, approve, and pay invoices', estimatedTime: '5 min' },
      { id: 'ch5', title: 'Vendor Performance', description: 'Track and evaluate vendor performance', estimatedTime: '3 min' },
    ],
  },
  {
    id: 'wf-005',
    title: 'Ticket Sales & Box Office Operations',
    description: 'Everything you need to know about selling tickets, managing box office, and handling will call and check-in.',
    category: 'workflow-guides',
    difficulty: 'beginner',
    estimatedTime: '15 minutes',
    platform: 'gvteway',
    workflowRefs: ['WF-GVTEWAY-003', 'WF-GVTEWAY-027'],
    tags: ['tickets', 'box office', 'sales', 'check-in'],
    outcomes: [
      'Configure ticket types and pricing',
      'Manage box office operations',
      'Handle will call efficiently',
      'Process check-in and scanning',
    ],
    chapters: [
      { id: 'ch1', title: 'Ticket Configuration', description: 'Set up ticket types, pricing, and limits', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Sales Management', description: 'Monitor sales and adjust inventory', estimatedTime: '3 min' },
      { id: 'ch3', title: 'Box Office Setup', description: 'Configure box office for event day', estimatedTime: '3 min' },
      { id: 'ch4', title: 'Will Call', description: 'Manage will call pickups', estimatedTime: '2 min' },
      { id: 'ch5', title: 'Check-In', description: 'Scan tickets and manage entry', estimatedTime: '3 min' },
    ],
  },
  {
    id: 'wf-006',
    title: 'Advancing Workflow Complete Guide',
    description: 'Master the advancing process for artists, venues, and vendors. Collect requirements, track completion, and ensure nothing is missed.',
    category: 'workflow-guides',
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    platform: 'compvss',
    workflowRefs: ['WF-COMPVSS-003', 'WF-COMPVSS-028', 'WF-COMPVSS-029'],
    tags: ['advancing', 'rider', 'requirements', 'coordination'],
    new: true,
    outcomes: [
      'Create and send advancing requests',
      'Track completion and follow up',
      'Manage technical and hospitality riders',
      'Coordinate with all stakeholders',
    ],
    chapters: [
      { id: 'ch1', title: 'Creating Advancing Requests', description: 'Set up advancing forms for stakeholders', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Artist Advancing', description: 'Collect rider and hospitality requirements', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Venue Advancing', description: 'Gather venue specifications and logistics', estimatedTime: '4 min' },
      { id: 'ch4', title: 'Tracking & Follow-up', description: 'Monitor completion and chase missing info', estimatedTime: '5 min' },
    ],
  },

  // ============================================
  // ROLE-SPECIFIC GUIDES
  // ============================================
  {
    id: 'rs-001',
    title: 'Guide for Production Managers',
    description: 'Comprehensive guide for production managers covering the full workflow from deal to settlement. Your complete reference for managing productions in GHXSTSHIP.',
    category: 'role-specific',
    difficulty: 'intermediate',
    estimatedTime: '35 minutes',
    platform: 'all',
    tags: ['production manager', 'pm', 'management', 'workflow'],
    featured: true,
    prerequisites: ['gs-001', 'gs-003'],
    outcomes: [
      'Manage productions from creation to wrap',
      'Coordinate between business and operations',
      'Track budgets and timelines effectively',
      'Generate reports for stakeholders',
    ],
    chapters: [
      { id: 'ch1', title: 'Production Setup', description: 'Creating and configuring productions', estimatedTime: '5 min' },
      { id: 'ch2', title: 'Team Management', description: 'Building and managing your team', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Budget Oversight', description: 'Managing production finances', estimatedTime: '6 min' },
      { id: 'ch4', title: 'Vendor Coordination', description: 'Working with vendors and contractors', estimatedTime: '5 min' },
      { id: 'ch5', title: 'Timeline Management', description: 'Tracking milestones and deadlines', estimatedTime: '5 min' },
      { id: 'ch6', title: 'Event Execution', description: 'Managing show day operations', estimatedTime: '5 min' },
      { id: 'ch7', title: 'Wrap & Settlement', description: 'Post-event closeout procedures', estimatedTime: '4 min' },
    ],
  },
  {
    id: 'rs-002',
    title: 'Guide for Crew Coordinators',
    description: 'Everything crew coordinators need to know about scheduling, credentials, timekeeping, and safety management in COMPVSS.',
    category: 'role-specific',
    difficulty: 'intermediate',
    estimatedTime: '28 minutes',
    platform: 'compvss',
    tags: ['crew coordinator', 'scheduling', 'crew', 'operations'],
    prerequisites: ['gs-003'],
    outcomes: [
      'Schedule and assign crew efficiently',
      'Manage credentials and access',
      'Track time and approve timesheets',
      'Handle safety and incident reporting',
    ],
    chapters: [
      { id: 'ch1', title: 'Crew Database', description: 'Managing your crew roster', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Scheduling', description: 'Creating shifts and assignments', estimatedTime: '6 min' },
      { id: 'ch3', title: 'Credentials', description: 'Issuing and managing access', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Timekeeping', description: 'Clock in/out and approvals', estimatedTime: '5 min' },
      { id: 'ch5', title: 'Communication', description: 'Crew messaging and updates', estimatedTime: '4 min' },
      { id: 'ch6', title: 'Safety', description: 'Safety protocols and incident reporting', estimatedTime: '4 min' },
    ],
  },
  {
    id: 'rs-003',
    title: 'Guide for Finance Teams',
    description: 'Complete finance workflow guide covering budgets, expenses, invoices, and reporting. Essential for finance professionals using ATLVS.',
    category: 'role-specific',
    difficulty: 'intermediate',
    estimatedTime: '30 minutes',
    platform: 'atlvs',
    tags: ['finance', 'accounting', 'budget', 'invoices'],
    prerequisites: ['gs-001'],
    outcomes: [
      'Manage production budgets effectively',
      'Process expenses and invoices',
      'Generate financial reports',
      'Integrate with accounting systems',
    ],
    chapters: [
      { id: 'ch1', title: 'Budget Management', description: 'Creating and tracking budgets', estimatedTime: '6 min' },
      { id: 'ch2', title: 'Expense Processing', description: 'Submitting and approving expenses', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Invoice Management', description: 'Processing vendor invoices', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Accounts Receivable', description: 'Managing incoming payments', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Settlement', description: 'Event settlement and reconciliation', estimatedTime: '5 min' },
      { id: 'ch6', title: 'Reporting', description: 'Financial reports and analytics', estimatedTime: '5 min' },
    ],
  },
  {
    id: 'rs-004',
    title: 'Guide for Artists & Agents',
    description: 'Portal guide for artists and their representatives. Learn to manage advancing, view schedules, and access hospitality information.',
    category: 'role-specific',
    difficulty: 'beginner',
    estimatedTime: '12 minutes',
    platform: 'compvss',
    workflowRefs: ['WF-ATLVS-026', 'WF-COMPVSS-028'],
    tags: ['artist', 'agent', 'portal', 'advancing'],
    outcomes: [
      'Navigate the artist portal',
      'Submit advancing information',
      'View schedules and call times',
      'Access hospitality and credentials',
    ],
    chapters: [
      { id: 'ch1', title: 'Portal Access', description: 'Logging in and navigating', estimatedTime: '2 min' },
      { id: 'ch2', title: 'Advancing', description: 'Submitting rider and requirements', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Schedule', description: 'Viewing your schedule and call times', estimatedTime: '3 min' },
      { id: 'ch4', title: 'Hospitality', description: 'Accessing hospitality information', estimatedTime: '3 min' },
    ],
  },
  {
    id: 'rs-005',
    title: 'Guide for Vendors',
    description: 'Vendor portal guide covering purchase orders, deliveries, invoicing, and payment tracking.',
    category: 'role-specific',
    difficulty: 'beginner',
    estimatedTime: '12 minutes',
    platform: 'atlvs',
    workflowRefs: ['WF-ATLVS-030', 'WF-COMPVSS-030'],
    tags: ['vendor', 'portal', 'invoices', 'deliveries'],
    outcomes: [
      'Navigate the vendor portal',
      'View and acknowledge purchase orders',
      'Submit invoices for payment',
      'Track delivery and payment status',
    ],
    chapters: [
      { id: 'ch1', title: 'Portal Access', description: 'Logging in and navigating', estimatedTime: '2 min' },
      { id: 'ch2', title: 'Purchase Orders', description: 'Viewing and acknowledging POs', estimatedTime: '3 min' },
      { id: 'ch3', title: 'Deliveries', description: 'Coordinating deliveries', estimatedTime: '3 min' },
      { id: 'ch4', title: 'Invoicing', description: 'Submitting invoices', estimatedTime: '4 min' },
    ],
  },

  // ============================================
  // BEST PRACTICES
  // ============================================
  {
    id: 'bp-001',
    title: 'Production Planning Best Practices',
    description: 'Industry best practices for production planning. Learn from experienced producers how to plan successful events.',
    category: 'best-practices',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    platform: 'all',
    tags: ['planning', 'best practices', 'tips', 'production'],
    outcomes: [
      'Apply proven planning methodologies',
      'Avoid common production pitfalls',
      'Build realistic timelines',
      'Manage stakeholder expectations',
    ],
    chapters: [
      { id: 'ch1', title: 'Timeline Planning', description: 'Building realistic production timelines', estimatedTime: '5 min' },
      { id: 'ch2', title: 'Budget Best Practices', description: 'Creating accurate budgets with contingency', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Team Structure', description: 'Organizing your production team', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Risk Management', description: 'Identifying and mitigating risks', estimatedTime: '5 min' },
    ],
  },
  {
    id: 'bp-002',
    title: 'Crew Management Best Practices',
    description: 'Best practices for managing production crews. Scheduling, communication, and retention strategies from industry veterans.',
    category: 'best-practices',
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    platform: 'compvss',
    tags: ['crew', 'management', 'best practices', 'scheduling'],
    outcomes: [
      'Schedule crews efficiently',
      'Communicate effectively with crew',
      'Handle conflicts and issues',
      'Build a reliable crew network',
    ],
    chapters: [
      { id: 'ch1', title: 'Scheduling Strategies', description: 'Efficient crew scheduling approaches', estimatedTime: '5 min' },
      { id: 'ch2', title: 'Communication', description: 'Keeping crew informed and engaged', estimatedTime: '4 min' },
      { id: 'ch3', title: 'Conflict Resolution', description: 'Handling scheduling conflicts', estimatedTime: '4 min' },
      { id: 'ch4', title: 'Building Your Network', description: 'Developing reliable crew relationships', estimatedTime: '5 min' },
    ],
  },
  {
    id: 'bp-003',
    title: 'Financial Management Best Practices',
    description: 'Financial best practices for live entertainment. Budget management, cash flow, and profitability strategies.',
    category: 'best-practices',
    difficulty: 'intermediate',
    estimatedTime: '22 minutes',
    platform: 'atlvs',
    tags: ['finance', 'best practices', 'budget', 'profitability'],
    outcomes: [
      'Build accurate production budgets',
      'Manage cash flow effectively',
      'Track profitability by event',
      'Implement financial controls',
    ],
    chapters: [
      { id: 'ch1', title: 'Budgeting', description: 'Creating accurate, realistic budgets', estimatedTime: '6 min' },
      { id: 'ch2', title: 'Cash Flow', description: 'Managing production cash flow', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Profitability', description: 'Tracking and improving margins', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Controls', description: 'Implementing financial controls', estimatedTime: '6 min' },
    ],
  },

  // ============================================
  // API & INTEGRATIONS
  // ============================================
  {
    id: 'api-001',
    title: 'API Getting Started',
    description: 'Introduction to the GHXSTSHIP API. Authentication, basic requests, and common use cases for developers.',
    category: 'api-integrations',
    difficulty: 'advanced',
    estimatedTime: '25 minutes',
    platform: 'all',
    tags: ['api', 'developer', 'integration', 'rest'],
    outcomes: [
      'Authenticate with the GHXSTSHIP API',
      'Make basic API requests',
      'Handle responses and errors',
      'Implement common use cases',
    ],
    chapters: [
      { id: 'ch1', title: 'Authentication', description: 'API keys and OAuth setup', estimatedTime: '5 min' },
      { id: 'ch2', title: 'Basic Requests', description: 'Making GET, POST, PUT, DELETE requests', estimatedTime: '6 min' },
      { id: 'ch3', title: 'Response Handling', description: 'Parsing responses and handling errors', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Common Use Cases', description: 'Practical API examples', estimatedTime: '6 min' },
      { id: 'ch5', title: 'Rate Limits', description: 'Understanding and working with limits', estimatedTime: '3 min' },
    ],
  },
  {
    id: 'api-002',
    title: 'Webhook Integration Guide',
    description: 'Set up webhooks to receive real-time notifications from GHXSTSHIP. Event types, payload handling, and best practices.',
    category: 'api-integrations',
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    platform: 'all',
    tags: ['webhooks', 'integration', 'real-time', 'events'],
    outcomes: [
      'Configure webhook endpoints',
      'Handle webhook payloads',
      'Implement retry logic',
      'Secure webhook endpoints',
    ],
    chapters: [
      { id: 'ch1', title: 'Webhook Setup', description: 'Configuring webhook endpoints', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Event Types', description: 'Available webhook events', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Payload Handling', description: 'Processing webhook payloads', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Security', description: 'Verifying and securing webhooks', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Best Practices', description: 'Webhook implementation tips', estimatedTime: '2 min' },
    ],
  },
  {
    id: 'api-003',
    title: 'Accounting Integration Guide',
    description: 'Integrate GHXSTSHIP with QuickBooks, Xero, or other accounting systems. Sync chart of accounts, invoices, and payments.',
    category: 'api-integrations',
    difficulty: 'intermediate',
    estimatedTime: '18 minutes',
    platform: 'atlvs',
    tags: ['quickbooks', 'xero', 'accounting', 'sync'],
    outcomes: [
      'Connect accounting software',
      'Map chart of accounts',
      'Sync invoices and expenses',
      'Reconcile payments',
    ],
    chapters: [
      { id: 'ch1', title: 'Connection Setup', description: 'Connecting your accounting software', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Account Mapping', description: 'Mapping chart of accounts', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Data Sync', description: 'Syncing invoices and expenses', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Reconciliation', description: 'Reconciling synced data', estimatedTime: '4 min' },
    ],
  },

  // ============================================
  // ADVANCED FEATURES
  // ============================================
  {
    id: 'af-001',
    title: 'Custom Reports & Analytics',
    description: 'Build custom reports and dashboards. Advanced analytics, data visualization, and scheduled reporting.',
    category: 'advanced-features',
    difficulty: 'advanced',
    estimatedTime: '22 minutes',
    platform: 'all',
    tags: ['reports', 'analytics', 'dashboards', 'data'],
    outcomes: [
      'Build custom reports',
      'Create data visualizations',
      'Schedule automated reports',
      'Share insights with stakeholders',
    ],
    chapters: [
      { id: 'ch1', title: 'Report Builder', description: 'Using the custom report builder', estimatedTime: '6 min' },
      { id: 'ch2', title: 'Visualizations', description: 'Creating charts and graphs', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Scheduling', description: 'Automating report delivery', estimatedTime: '4 min' },
      { id: 'ch4', title: 'Sharing', description: 'Distributing reports to stakeholders', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Advanced Filters', description: 'Complex filtering and segmentation', estimatedTime: '3 min' },
    ],
  },
  {
    id: 'af-002',
    title: 'Automation & Workflows',
    description: 'Automate repetitive tasks with workflow automation. Triggers, actions, and conditional logic.',
    category: 'advanced-features',
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    platform: 'all',
    tags: ['automation', 'workflows', 'triggers', 'efficiency'],
    new: true,
    outcomes: [
      'Create automated workflows',
      'Set up triggers and conditions',
      'Configure automated actions',
      'Monitor automation performance',
    ],
    chapters: [
      { id: 'ch1', title: 'Automation Basics', description: 'Understanding workflow automation', estimatedTime: '4 min' },
      { id: 'ch2', title: 'Triggers', description: 'Setting up workflow triggers', estimatedTime: '5 min' },
      { id: 'ch3', title: 'Actions', description: 'Configuring automated actions', estimatedTime: '5 min' },
      { id: 'ch4', title: 'Conditions', description: 'Adding conditional logic', estimatedTime: '4 min' },
      { id: 'ch5', title: 'Monitoring', description: 'Tracking automation performance', estimatedTime: '2 min' },
    ],
  },
];

/**
 * Get guides by category
 */
export function getGuidesByCategory(category: GuideCategory): Guide[] {
  return GUIDES.filter((guide) => guide.category === category);
}

/**
 * Get guides by platform
 */
export function getGuidesByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): Guide[] {
  return GUIDES.filter((guide) => guide.platform === platform || guide.platform === 'all');
}

/**
 * Get guides by difficulty
 */
export function getGuidesByDifficulty(difficulty: GuideDifficulty): Guide[] {
  return GUIDES.filter((guide) => guide.difficulty === difficulty);
}

/**
 * Get featured guides
 */
export function getFeaturedGuides(): Guide[] {
  return GUIDES.filter((guide) => guide.featured);
}

/**
 * Get new guides
 */
export function getNewGuides(): Guide[] {
  return GUIDES.filter((guide) => guide.new);
}

/**
 * Search guides by keyword
 */
export function searchGuides(query: string): Guide[] {
  const lowerQuery = query.toLowerCase();
  return GUIDES.filter(
    (guide) =>
      guide.title.toLowerCase().includes(lowerQuery) ||
      guide.description.toLowerCase().includes(lowerQuery) ||
      guide.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get total estimated time for a learning path
 */
export function getLearningPathTime(guideIds: string[]): string {
  const totalMinutes = guideIds.reduce((total, id) => {
    const guide = GUIDES.find((g) => g.id === id);
    if (guide) {
      const minutes = parseInt(guide.estimatedTime);
      return total + (isNaN(minutes) ? 0 : minutes);
    }
    return total;
  }, 0);
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
}

export default GUIDES;
