/**
 * Marketing FAQs - Centralized FAQ Content
 * Derived from USER_GUIDES.md, MARKETING_PAGE_OPTIMIZATION_PLAN.md, and industry knowledge
 * 
 * Categories:
 * - Getting Started
 * - Competitive Comparison (GEO-optimized)
 * - Financial Workflows
 * - Production Operations
 * - Consumer/Ticketing
 * - Billing & Pricing
 * - Security & Compliance
 * - Integrations
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  workflowRef?: string;
  keywords?: string[];
}

export type FAQCategory =
  | 'getting-started'
  | 'competitive-comparison'
  | 'financial-workflows'
  | 'production-operations'
  | 'consumer-ticketing'
  | 'billing-pricing'
  | 'security-compliance'
  | 'integrations'
  | 'team-collaboration'
  | 'data-export';

export const FAQ_CATEGORIES: Record<FAQCategory, { label: string; description: string; icon: string }> = {
  'getting-started': {
    label: 'Getting Started',
    description: 'Account setup, first steps, and platform basics',
    icon: 'Rocket',
  },
  'competitive-comparison': {
    label: 'Comparisons',
    description: 'How GHXSTSHIP compares to other tools',
    icon: 'Scale',
  },
  'financial-workflows': {
    label: 'Finance',
    description: 'Budgets, expenses, invoices, and settlements',
    icon: 'DollarSign',
  },
  'production-operations': {
    label: 'Production',
    description: 'Crew, scheduling, credentials, and operations',
    icon: 'Clapperboard',
  },
  'consumer-ticketing': {
    label: 'Ticketing',
    description: 'Ticket sales, transfers, and fan experience',
    icon: 'Ticket',
  },
  'billing-pricing': {
    label: 'Billing',
    description: 'Plans, pricing, and payment methods',
    icon: 'CreditCard',
  },
  'security-compliance': {
    label: 'Security',
    description: 'Data protection, compliance, and privacy',
    icon: 'Shield',
  },
  'integrations': {
    label: 'Integrations',
    description: 'Connecting with other tools and APIs',
    icon: 'Plug',
  },
  'team-collaboration': {
    label: 'Team',
    description: 'Inviting members, roles, and permissions',
    icon: 'Users',
  },
  'data-export': {
    label: 'Data & Export',
    description: 'Exporting data and generating reports',
    icon: 'Download',
  },
};

export const FAQS: FAQ[] = [
  // ============================================
  // GETTING STARTED
  // ============================================
  {
    id: 'gs-001',
    question: 'How do I create my first production?',
    answer: 'Navigate to Productions in the sidebar and click "New Production". Enter your production details including name, dates, type, and venue. Assign initial team members and set budget parameters. Click "Create" and your production will appear in your dashboard immediately. You can then configure additional settings, set up budget categories, and link venues.',
    category: 'getting-started',
    platform: 'atlvs',
    workflowRef: 'WF-ATLVS-001',
    keywords: ['create', 'new', 'production', 'project', 'start'],
  },
  {
    id: 'gs-002',
    question: "What's the difference between platform roles and event roles?",
    answer: 'Platform roles (like ATLVS_ADMIN, COMPVSS_TEAM_MEMBER) control your access to the application itself—what features you can see and use. Event roles (like EXECUTIVE, CREW, PRODUCTION) control your permissions on specific events or productions. You can have different event roles on different productions. For example, you might be a Production Manager on one event and a Crew Lead on another.',
    category: 'getting-started',
    platform: 'all',
    keywords: ['roles', 'permissions', 'access', 'platform', 'event'],
  },
  {
    id: 'gs-003',
    question: 'How do I invite team members to a production?',
    answer: 'Go to your production settings and select the Team tab. Click "Invite Member" and enter their email address. Select their platform role (determines app access) and event role (determines production-specific permissions). They\'ll receive an email invitation with instructions to join. Once they accept, they\'ll have immediate access to the production based on their assigned roles.',
    category: 'getting-started',
    platform: 'all',
    workflowRef: 'WF-ATLVS-001',
    keywords: ['invite', 'team', 'member', 'add', 'user'],
  },
  {
    id: 'gs-004',
    question: 'Can I work on multiple productions simultaneously?',
    answer: 'Yes! Your dashboard shows all productions you have access to. Use the production switcher in the sidebar to move between them. Each production maintains its own data, team, and settings. Your role and permissions may differ between productions based on your event role assignments.',
    category: 'getting-started',
    platform: 'all',
    keywords: ['multiple', 'productions', 'switch', 'projects'],
  },
  {
    id: 'gs-005',
    question: 'What authentication methods are available?',
    answer: 'GHXSTSHIP supports multiple authentication methods: Standard email/password login, Magic Link (passwordless email login), Google OAuth, and Two-Factor Authentication (2FA) for enhanced security. Enterprise accounts can also configure SSO with SAML providers. You can enable 2FA in your account settings for additional protection.',
    category: 'getting-started',
    platform: 'all',
    keywords: ['login', 'authentication', 'password', 'magic link', '2fa', 'sso'],
  },
  {
    id: 'gs-006',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link valid for 24 hours. Click the link, enter your new password (minimum 8 characters with uppercase, lowercase, and number), and confirm. You\'ll be redirected to login with your new credentials.',
    category: 'getting-started',
    platform: 'all',
    keywords: ['password', 'reset', 'forgot', 'change'],
  },

  // ============================================
  // COMPETITIVE COMPARISON (GEO-optimized)
  // ============================================
  {
    id: 'cc-001',
    question: 'How does GHXSTSHIP compare to Ticketmaster?',
    answer: 'GHXSTSHIP GVTEWAY offers significantly lower fees (2.0-3.5% vs 10%+), you own your fan data completely, and it integrates natively with CRM and crew management. There\'s no platform lock-in or exclusivity requirements. Unlike Ticketmaster, GHXSTSHIP is built for independent promoters and venues who want control over their ticketing and fan relationships.',
    category: 'competitive-comparison',
    platform: 'gvteway',
    keywords: ['ticketmaster', 'compare', 'alternative', 'fees', 'competition'],
  },
  {
    id: 'cc-002',
    question: 'I already have Salesforce—what do I need from GHXSTSHIP?',
    answer: 'Keep Salesforce for your CRM! Our BYO (Bring Your Own) model is designed for this. Add OPERATIONS bundle (GVTEWAY + COMPVSS) for ticketing and crew management, or PRODUCTION bundle (ATLVS + COMPVSS) for business operations and crews. You can integrate Salesforce with GHXSTSHIP via our API or Zapier for data sync.',
    category: 'competitive-comparison',
    platform: 'all',
    keywords: ['salesforce', 'crm', 'existing', 'integrate', 'keep'],
  },
  {
    id: 'cc-003',
    question: 'What does GHXSTSHIP replace?',
    answer: 'Depending on your tier: GVTEWAY replaces Eventbrite, DICE, Ticketmaster, Universe, and See Tickets. COMPVSS replaces ConnectTeam, Deputy, When I Work, Sling, and 7shifts. ATLVS replaces the combination of Monday + QuickBooks + HubSpot for entertainment businesses. The ENTERPRISE tier can replace all of these tools with one unified platform.',
    category: 'competitive-comparison',
    platform: 'all',
    keywords: ['replace', 'alternative', 'eventbrite', 'dice', 'connectteam', 'deputy', 'monday'],
  },
  {
    id: 'cc-004',
    question: 'Can I keep my existing tools and just add what\'s missing?',
    answer: 'Absolutely! Our BYO (Bring Your Own) model is designed exactly for this. Start with one product that fills your gap, bundle two if you need more, or replace everything with ENTERPRISE. Each tier clearly shows what you\'re getting and what you can keep using externally. No forced bundling—use what works for you.',
    category: 'competitive-comparison',
    platform: 'all',
    keywords: ['byo', 'bring your own', 'keep', 'existing', 'tools', 'integrate'],
  },
  {
    id: 'cc-005',
    question: 'How is GHXSTSHIP different from Monday.com or Asana?',
    answer: 'Monday and Asana are generic project management tools. GHXSTSHIP ATLVS is built specifically for live entertainment with industry-native features: deal memos, production advances, venue holds, artist riders, settlement workflows, and entertainment-specific financial tracking. You won\'t need to customize templates or build workarounds—it\'s built for how productions actually work.',
    category: 'competitive-comparison',
    platform: 'atlvs',
    keywords: ['monday', 'asana', 'project management', 'difference', 'entertainment'],
  },
  {
    id: 'cc-006',
    question: 'Why should I switch from ConnectTeam or Deputy?',
    answer: 'GHXSTSHIP COMPVSS offers entertainment-specific features those tools lack: cross-organization JOIN (crew can join projects from other orgs without duplicate accounts), production-specific punch lists, run-of-show integration, credential management with zone access, and native integration with business operations and ticketing. It\'s built for productions, not generic shift work.',
    category: 'competitive-comparison',
    platform: 'compvss',
    keywords: ['connectteam', 'deputy', 'switch', 'crew', 'scheduling'],
  },
  {
    id: 'cc-007',
    question: 'What software do concert promoters use?',
    answer: 'Concert promoters use GHXSTSHIP EXPERIENCE bundle for CRM, deal management, and ticketing in one platform. It handles the entire workflow from artist booking through ticket sales to event settlement. Many promoters previously used a combination of Salesforce + Eventbrite + spreadsheets—EXPERIENCE consolidates this into one entertainment-native system.',
    category: 'competitive-comparison',
    platform: 'all',
    keywords: ['concert', 'promoter', 'software', 'use', 'best'],
  },
  {
    id: 'cc-008',
    question: 'What\'s the best Eventbrite alternative for festivals?',
    answer: 'GHXSTSHIP GVTEWAY offers lower fees, you own your fan data, and it integrates with crew management and business operations. For festivals specifically, the ENTERPRISE tier provides ticketing + crew scheduling + business operations in one platform—something Eventbrite can\'t offer. You get timed-entry, multi-day passes, VIP tiers, and native fan engagement tools.',
    category: 'competitive-comparison',
    platform: 'gvteway',
    keywords: ['eventbrite', 'alternative', 'festival', 'ticketing', 'best'],
  },

  // ============================================
  // FINANCIAL WORKFLOWS
  // ============================================
  {
    id: 'fw-001',
    question: 'How do I track production budgets?',
    answer: 'Create a budget in your production at /p/[id]/budgets. Set up categories (talent, production, marketing, etc.) and line items with estimated amounts. As expenses are logged, actuals update automatically. The variance dashboard shows you over/under by category with real-time alerts when you\'re approaching or exceeding budget limits.',
    category: 'financial-workflows',
    platform: 'atlvs',
    workflowRef: 'WF-ATLVS-002',
    keywords: ['budget', 'track', 'expenses', 'variance', 'financial'],
  },
  {
    id: 'fw-002',
    question: 'How does expense approval work?',
    answer: 'Submit expenses at /expenses with receipt attachments and category assignment. Expenses route to the appropriate approver based on amount thresholds and department. Approvers see pending items in their dashboard and can approve, reject, or request more information. Once approved, expenses sync to your accounting system and update budget actuals.',
    category: 'financial-workflows',
    platform: 'atlvs',
    workflowRef: 'WF-ATLVS-010',
    keywords: ['expense', 'approval', 'submit', 'receipt', 'reimburse'],
  },
  {
    id: 'fw-003',
    question: 'How do I process vendor invoices?',
    answer: 'Upload invoices at /invoices or have vendors submit through their portal. Match invoices to purchase orders for automatic validation. Route for approval based on amount and vendor. Schedule payments according to terms. Track aging, payment status, and maintain a complete audit trail. Integrates with QuickBooks, Xero, and other accounting systems.',
    category: 'financial-workflows',
    platform: 'atlvs',
    workflowRef: 'WF-ATLVS-011',
    keywords: ['invoice', 'vendor', 'payment', 'process', 'accounts payable'],
  },
  {
    id: 'fw-004',
    question: 'How does event settlement work?',
    answer: 'After your event, navigate to /e/[eventId]/settlement. The system automatically calculates ticket revenue (by tier), ancillary revenue (merch, F&B), and all logged expenses. Configure splits for artists, venues, and partners. Generate settlement reports showing gross, deductions, and net for each party. Export for accounting or share directly with stakeholders.',
    category: 'financial-workflows',
    platform: 'all',
    workflowRef: 'WF-GVTEWAY-028',
    keywords: ['settlement', 'reconciliation', 'revenue', 'split', 'accounting'],
  },
  {
    id: 'fw-005',
    question: 'Can I create purchase orders?',
    answer: 'Yes! Navigate to /procurement to create purchase orders. Select the vendor, add line items with quantities and prices, set delivery dates, and route for approval. Once approved, POs are sent to vendors automatically. Track delivery status, receive goods, and match to invoices. The system maintains a complete procurement audit trail.',
    category: 'financial-workflows',
    platform: 'atlvs',
    workflowRef: 'WF-ATLVS-014',
    keywords: ['purchase order', 'po', 'procurement', 'vendor', 'buy'],
  },
  {
    id: 'fw-006',
    question: 'How do I manage artist guarantees and splits?',
    answer: 'Set up deal terms in the artist/deal record including guarantee amount, backend split percentage, and threshold. The system tracks ticket sales against the threshold automatically. At settlement, it calculates whether backend is owed and generates accurate artist settlement statements. Supports multiple artists with different deal structures on the same event.',
    category: 'financial-workflows',
    platform: 'atlvs',
    keywords: ['guarantee', 'split', 'artist', 'deal', 'backend'],
  },

  // ============================================
  // PRODUCTION OPERATIONS
  // ============================================
  {
    id: 'po-001',
    question: 'How do I schedule crew for an event?',
    answer: 'Go to /crew in COMPVSS to create shifts by department, date, and time. Assign crew members based on skills and availability. Crew receive notifications and can confirm or decline. View the master schedule to see coverage gaps. On event day, crew check in via mobile app, and you can track attendance in real-time.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-002',
    keywords: ['crew', 'schedule', 'shift', 'assign', 'staff'],
  },
  {
    id: 'po-002',
    question: 'How do credentials work?',
    answer: 'Define credential types at /credentials/types (All Access, Backstage, Production, etc.). Set up access zones that credentials grant entry to. Issue credentials to crew, artists, vendors, and guests. On event day, scan credentials at entry points to verify access. The system logs all scans for security audit. Credentials can be physical, digital, or both.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-004',
    keywords: ['credentials', 'badge', 'access', 'backstage', 'security'],
  },
  {
    id: 'po-003',
    question: 'How do I manage run of show?',
    answer: 'Build your run of show at /p/[id]/schedule with cues, timing, and responsible parties. Add notes, attachments, and dependencies. Share with crew via mobile—they see only their relevant cues. Update in real-time during the show; changes push to all devices instantly. After the event, the ROS becomes part of your production archive.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-005',
    keywords: ['run of show', 'ros', 'schedule', 'cue', 'timing'],
  },
  {
    id: 'po-004',
    question: 'How do I report safety incidents?',
    answer: 'Use /safety or /p/[id]/incidents to log incidents immediately. Capture details, photos, witness information, and initial response. The system routes to your safety officer and relevant stakeholders. Track investigation status, corrective actions, and resolution. Generate incident reports for insurance and compliance. All incidents are logged with timestamps for audit.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-006',
    keywords: ['safety', 'incident', 'report', 'accident', 'emergency'],
  },
  {
    id: 'po-005',
    question: 'How does advancing work?',
    answer: 'Create advancing requests at /advancing for artists, venues, and vendors. Send digital forms to collect technical riders, hospitality requirements, travel details, and credentials needs. Track completion status and follow up on missing information. All advancing data flows into your production planning—no re-entry required. Artists and vendors can update their info through their portal.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-003',
    keywords: ['advancing', 'rider', 'technical', 'hospitality', 'requirements'],
  },
  {
    id: 'po-006',
    question: 'Can crew clock in and out through the app?',
    answer: 'Yes! Crew use the COMPVSS mobile app to clock in at shift start and clock out at end. The system captures timestamps, location (optional), and calculates hours automatically. Supervisors can review and approve timesheets. Overtime is calculated based on your rules. Approved time syncs to payroll. Supports break tracking and department transfers.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-019',
    keywords: ['clock in', 'clock out', 'timesheet', 'hours', 'payroll'],
  },
  {
    id: 'po-007',
    question: 'How do I manage load-in and strike?',
    answer: 'Plan load-in at /p/[id]/load-in with vendor arrival slots, equipment lists, and staging areas. Track deliveries in real-time and confirm receipt. For strike, use /p/[id]/strike with department checklists and sign-offs. The system ensures nothing is missed and creates a record of what was returned, stored, or disposed.',
    category: 'production-operations',
    platform: 'compvss',
    workflowRef: 'WF-COMPVSS-009',
    keywords: ['load-in', 'strike', 'load-out', 'delivery', 'equipment'],
  },

  // ============================================
  // CONSUMER/TICKETING
  // ============================================
  {
    id: 'ct-001',
    question: 'How do fans purchase tickets?',
    answer: 'Fans browse events at /browse, /discover, or /search. They select their event, choose ticket type and quantity, and proceed to checkout. Payment options include credit card, Apple Pay, Google Pay, and buy-now-pay-later. After purchase, tickets appear immediately in their /wallet. They receive email confirmation with ticket details and event information.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-003',
    keywords: ['buy', 'purchase', 'ticket', 'checkout', 'payment'],
  },
  {
    id: 'ct-002',
    question: 'Can fans transfer or resell tickets?',
    answer: 'Yes! Fans go to /tickets, select the ticket, and choose Transfer (free, sends to another email) or Resell (lists on our secure marketplace). Transfers are instant. Resale prices can be set by the fan within limits you configure. When resold, the original ticket is voided and a new one issued to the buyer. You can enable or disable these features per event.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-009',
    keywords: ['transfer', 'resell', 'resale', 'gift', 'send'],
  },
  {
    id: 'ct-003',
    question: 'How does the live event experience work?',
    answer: 'On event day, fans access /e/[eventId] for the interactive event hub. They see their mobile tickets, interactive venue map, real-time schedule, and event updates. Engagement features include challenges, polls, Q&A, and chat. They can access event services like emergency info, lost & found, and support. The experience is designed to enhance their time at your event.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-011',
    keywords: ['live', 'event', 'experience', 'mobile', 'app'],
  },
  {
    id: 'ct-004',
    question: 'How do I set up ticket tiers and pricing?',
    answer: 'When creating an event, add ticket types with names, prices, quantities, and sale windows. Set up tiers like GA, VIP, and Backstage with different access levels. Configure early bird pricing with automatic price increases. Add fees (absorbed or passed to buyer). Set purchase limits per order. Preview your ticket page before publishing.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-021',
    keywords: ['ticket', 'tier', 'pricing', 'vip', 'early bird'],
  },
  {
    id: 'ct-005',
    question: 'How does will call work?',
    answer: 'Fans who need will call select it at checkout or you can assign tickets to will call manually. At the event, box office staff access /e/[eventId]/box-office to search by name, email, or confirmation number. Verify ID, print or issue mobile ticket, and mark as picked up. The system prevents duplicate pickups and maintains an audit log.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-027',
    keywords: ['will call', 'box office', 'pickup', 'check-in'],
  },
  {
    id: 'ct-006',
    question: 'Can I offer promo codes and discounts?',
    answer: 'Yes! Create promo codes at /admin/promo-codes with percentage or fixed discounts. Set usage limits (total and per-customer), valid date ranges, and which ticket types they apply to. Track redemptions in real-time. You can also create automatic discounts for members, fan club, or based on purchase history.',
    category: 'consumer-ticketing',
    platform: 'gvteway',
    workflowRef: 'WF-GVTEWAY-022',
    keywords: ['promo', 'discount', 'code', 'coupon', 'offer'],
  },

  // ============================================
  // BILLING & PRICING
  // ============================================
  {
    id: 'bp-001',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), ACH bank transfers for US accounts, and wire transfers for enterprise accounts. Subscription billing is monthly or annual (with discount). Ticket transaction fees are deducted from payouts or can be invoiced monthly for enterprise accounts.',
    category: 'billing-pricing',
    platform: 'all',
    keywords: ['payment', 'credit card', 'ach', 'wire', 'billing'],
  },
  {
    id: 'bp-002',
    question: 'Do you offer a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can create productions, invite team members, and explore the platform completely. At the end of your trial, choose the plan that fits your needs or contact us for a custom enterprise quote.',
    category: 'billing-pricing',
    platform: 'all',
    keywords: ['trial', 'free', 'demo', 'test', 'try'],
  },
  {
    id: 'bp-003',
    question: 'How do I cancel my subscription?',
    answer: 'Go to Settings > Billing and click "Cancel Subscription". Your access continues until the end of your current billing period. Your data is retained for 30 days after cancellation in case you change your mind. After 30 days, data is permanently deleted unless you request an export. Enterprise accounts should contact their account manager.',
    category: 'billing-pricing',
    platform: 'all',
    keywords: ['cancel', 'subscription', 'stop', 'end'],
  },
  {
    id: 'bp-004',
    question: 'What are the ticket fees?',
    answer: 'GVTEWAY (standalone): 3.5% + $0.75/ticket. OPERATIONS bundle: 2.5% + $0.50/ticket. EXPERIENCE bundle: 2.5% + $0.50/ticket. ENTERPRISE: 2.0% + $0.40/ticket. Fees can be absorbed by you or passed to the ticket buyer. Payment processing (Stripe) is additional at standard rates. Volume discounts available for enterprise.',
    category: 'billing-pricing',
    platform: 'gvteway',
    keywords: ['fees', 'ticket', 'percentage', 'cost', 'pricing'],
  },
  {
    id: 'bp-005',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! Upgrade anytime and get immediate access to new features—we\'ll prorate the difference. Downgrade at the end of your billing period to avoid losing access to features mid-cycle. Go to Settings > Billing > Change Plan. Enterprise customers should contact their account manager for plan changes.',
    category: 'billing-pricing',
    platform: 'all',
    keywords: ['upgrade', 'downgrade', 'change', 'plan', 'tier'],
  },

  // ============================================
  // SECURITY & COMPLIANCE
  // ============================================
  {
    id: 'sc-001',
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II certified and undergo annual security audits. Data is stored in secure cloud infrastructure with geographic redundancy. We never sell your data and you maintain full ownership. See our Security page for detailed information.',
    category: 'security-compliance',
    platform: 'all',
    keywords: ['security', 'encryption', 'safe', 'protect', 'soc2'],
  },
  {
    id: 'sc-002',
    question: 'Are you GDPR compliant?',
    answer: 'Yes. We\'re fully GDPR compliant for EU users. This includes data portability (export your data anytime), right to deletion, consent management, and data processing agreements. We have EU data residency options for enterprise customers. Our privacy policy details exactly how we handle personal data.',
    category: 'security-compliance',
    platform: 'all',
    keywords: ['gdpr', 'privacy', 'europe', 'compliant', 'data protection'],
  },
  {
    id: 'sc-003',
    question: 'Do you support Single Sign-On (SSO)?',
    answer: 'Yes, enterprise accounts can configure SSO with SAML 2.0 providers including Okta, Azure AD, Google Workspace, and OneLogin. SSO enforces your organization\'s authentication policies and simplifies user management. Contact your account manager to enable SSO for your organization.',
    category: 'security-compliance',
    platform: 'all',
    keywords: ['sso', 'single sign-on', 'saml', 'okta', 'azure'],
  },
  {
    id: 'sc-004',
    question: 'How do you handle PCI compliance for payments?',
    answer: 'We\'re PCI DSS Level 1 compliant—the highest level of payment security certification. We never store credit card numbers on our servers. All payment processing goes through Stripe, a certified PCI Level 1 Service Provider. Your customers\' payment data is always secure.',
    category: 'security-compliance',
    platform: 'gvteway',
    keywords: ['pci', 'payment', 'credit card', 'compliant', 'secure'],
  },

  // ============================================
  // INTEGRATIONS
  // ============================================
  {
    id: 'in-001',
    question: 'Can I integrate with other tools?',
    answer: 'Yes! GHXSTSHIP integrates with 100+ tools including Slack (notifications), Google Calendar (scheduling), Salesforce (CRM sync), QuickBooks/Xero (accounting), Mailchimp (marketing), and many more. Visit Settings > Integrations to connect your tools. We also offer a REST API and webhooks for custom integrations.',
    category: 'integrations',
    platform: 'all',
    keywords: ['integrate', 'connect', 'sync', 'api', 'zapier'],
  },
  {
    id: 'in-002',
    question: 'Do you have an API?',
    answer: 'Yes! Our REST API provides programmatic access to all platform features. Create productions, manage tickets, sync financial data, and more. API documentation is available at /docs/api. API access is included in all paid plans. Rate limits and authentication details are in the documentation. We also support webhooks for real-time event notifications.',
    category: 'integrations',
    platform: 'all',
    keywords: ['api', 'developer', 'programmatic', 'rest', 'webhook'],
  },
  {
    id: 'in-003',
    question: 'Can I sync with my accounting software?',
    answer: 'Yes! We have native integrations with QuickBooks Online, Xero, and Sage. Sync chart of accounts, push invoices and expenses, and reconcile payments automatically. For other accounting systems, use our API or Zapier integration. Enterprise customers can request custom integrations with their ERP systems.',
    category: 'integrations',
    platform: 'atlvs',
    keywords: ['quickbooks', 'xero', 'accounting', 'sync', 'finance'],
  },
  {
    id: 'in-004',
    question: 'How do I connect Slack for notifications?',
    answer: 'Go to Settings > Integrations > Slack and click "Connect". Authorize GHXSTSHIP to post to your workspace. Select which channels receive which notifications (new tickets, expense approvals, crew updates, etc.). You can customize notification preferences per channel and per user.',
    category: 'integrations',
    platform: 'all',
    keywords: ['slack', 'notifications', 'alerts', 'messages'],
  },

  // ============================================
  // TEAM COLLABORATION
  // ============================================
  {
    id: 'tc-001',
    question: 'How many team members can I add?',
    answer: 'COMPVSS: Unlimited crew members for $299/month. ATLVS: Unlimited users for $799/month. GVTEWAY: Unlimited staff for ticketing operations. We don\'t charge per seat—add your whole team without worrying about costs. Enterprise plans include dedicated support for large team onboarding.',
    category: 'team-collaboration',
    platform: 'all',
    keywords: ['team', 'members', 'users', 'seats', 'unlimited'],
  },
  {
    id: 'tc-002',
    question: 'Can external collaborators access my productions?',
    answer: 'Yes! COMPVSS features cross-organization JOIN—external crew, vendors, and collaborators can join your productions without creating duplicate accounts. They see only what you grant access to. This is perfect for labor vendors, freelance crew, and agency partners who work across multiple organizations.',
    category: 'team-collaboration',
    platform: 'compvss',
    keywords: ['external', 'collaborator', 'vendor', 'join', 'guest'],
  },
  {
    id: 'tc-003',
    question: 'How do portal users work?',
    answer: 'Portal users (artists, vendors, investors, sponsors) get limited access through dedicated portals. They can view their specific information, submit required data (riders, invoices, etc.), and communicate with your team—without accessing your full production data. Configure portal access per user and per production.',
    category: 'team-collaboration',
    platform: 'all',
    keywords: ['portal', 'artist', 'vendor', 'investor', 'external'],
  },

  // ============================================
  // DATA & EXPORT
  // ============================================
  {
    id: 'de-001',
    question: 'How do I export my data?',
    answer: 'Go to Settings > Export and select the data you want to export: productions, contacts, financial records, tickets, etc. Choose your format (CSV, Excel, PDF, or JSON for API). Large exports are processed in the background and you\'ll receive an email when ready. You own your data and can export it anytime.',
    category: 'data-export',
    platform: 'all',
    keywords: ['export', 'download', 'data', 'csv', 'backup'],
  },
  {
    id: 'de-002',
    question: 'Can I generate custom reports?',
    answer: 'Yes! Use the Analytics section to build custom reports. Select your data source, apply filters, choose visualization type, and save for reuse. Schedule reports to run automatically and email to stakeholders. Pre-built reports cover common needs: P&L by event, ticket sales, crew hours, and more.',
    category: 'data-export',
    platform: 'all',
    workflowRef: 'WF-ATLVS-019',
    keywords: ['report', 'analytics', 'custom', 'dashboard', 'metrics'],
  },
  {
    id: 'de-003',
    question: 'How long is my data retained?',
    answer: 'Active account data is retained indefinitely. Completed productions are archived but remain accessible. After account cancellation, data is retained for 30 days then permanently deleted. Enterprise accounts can configure custom retention policies. You can request data deletion at any time per GDPR requirements.',
    category: 'data-export',
    platform: 'all',
    keywords: ['retention', 'archive', 'delete', 'storage', 'history'],
  },
];

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: FAQCategory): FAQ[] {
  return FAQS.filter((faq) => faq.category === category);
}

/**
 * Get FAQs by platform
 */
export function getFAQsByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): FAQ[] {
  return FAQS.filter((faq) => faq.platform === platform || faq.platform === 'all');
}

/**
 * Search FAQs by keyword
 */
export function searchFAQs(query: string): FAQ[] {
  const lowerQuery = query.toLowerCase();
  return FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique categories that have FAQs
 */
export function getActiveCategories(): FAQCategory[] {
  const categories = new Set(FAQS.map((faq) => faq.category));
  return Array.from(categories);
}

/**
 * Get FAQ count by category
 */
export function getFAQCountByCategory(): Record<FAQCategory, number> {
  const counts: Partial<Record<FAQCategory, number>> = {};
  for (const faq of FAQS) {
    counts[faq.category] = (counts[faq.category] || 0) + 1;
  }
  return counts as Record<FAQCategory, number>;
}

export default FAQS;
