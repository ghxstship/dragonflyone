// =============================================================================
// GHXSTSHIP PRICING TIERS - 7-Tier BYO Model
// Centralized pricing configuration for all marketing pages
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type TierId = 
  | 'gvteway' 
  | 'compvss' 
  | 'atlvs' 
  | 'operations' 
  | 'experience' 
  | 'production' 
  | 'enterprise';

export type TierCategory = 'single' | 'bundle' | 'fullstack';

export type TierIcon = 'Ticket' | 'Users' | 'Briefcase' | 'Layers' | 'Zap' | 'Rocket' | 'Crown';

export interface PricingTier {
  id: TierId;
  name: string;
  tagline: string;
  category: TierCategory;
  products: string[];
  price: {
    monthly: number | null; // null = custom/contact
    transactionFee: number | null; // percentage
    perTicket: number | null; // fixed fee per ticket
    display: string;
    period: string;
  };
  byo: {
    items: string[];
    competitors: string[];
  };
  replaces: string[];
  ifYouUse: string;
  valueProposition: string;
  features: string[];
  upgradePaths: TierId[];
  icon: TierIcon;
  color: 'brand-yellow' | 'brand-cyan' | 'brand-pink' | 'brand-purple' | 'ink';
  popular?: boolean;
  ctaText: string;
  ctaHref: string;
}

export interface Competitor {
  name: string;
  category: 'ticketing' | 'crews' | 'pm' | 'crm' | 'finance';
  ourCounter: string;
  byoMessage: string;
}

// =============================================================================
// PRICING TIERS DATA
// =============================================================================

export const pricingTiers: Record<TierId, PricingTier> = {
  // ---------------------------------------------------------------------------
  // SINGLE PRODUCTS (BYO Everything Else)
  // ---------------------------------------------------------------------------
  gvteway: {
    id: 'gvteway',
    name: 'GVTEWAY',
    tagline: 'OWN THE DOOR',
    category: 'single',
    products: ['GVTEWAY'],
    price: {
      monthly: 0,
      transactionFee: 3.5,
      perTicket: 0.75,
      display: '$0',
      period: '+ 3.5% + $0.75/ticket',
    },
    byo: {
      items: ['CRM', 'Finance', 'Crews'],
      competitors: ['Salesforce', 'HubSpot', 'QuickBooks', 'ConnectTeam', 'Deputy'],
    },
    replaces: ['Eventbrite', 'DICE', 'Ticketmaster', 'Universe', 'See Tickets', 'Ticket Tailor'],
    ifYouUse: '"I have Salesforce for CRM and Deputy for crews—I just need ticketing."',
    valueProposition: 'Keep HubSpot. Keep ConnectTeam. Just add ticketing.',
    features: [
      'Full ticketing platform',
      'Event publishing & discovery',
      'Fan engagement tools',
      'Membership & loyalty',
      'Marketing automation',
      'Box office & will-call',
      'Own your fan data',
    ],
    upgradePaths: ['experience', 'operations'],
    icon: 'Ticket',
    color: 'brand-cyan',
    ctaText: 'START GVTEWAY',
    ctaHref: '/auth/signup?plan=gvteway',
  },

  compvss: {
    id: 'compvss',
    name: 'COMPVSS',
    tagline: 'WORK THE SITE',
    category: 'single',
    products: ['COMPVSS'],
    price: {
      monthly: 299,
      transactionFee: null,
      perTicket: null,
      display: '$299',
      period: '/month',
    },
    byo: {
      items: ['CRM', 'Finance', 'Ticketing'],
      competitors: ['Salesforce', 'HubSpot', 'QuickBooks', 'Eventbrite', 'DICE'],
    },
    replaces: ['ConnectTeam', 'Deputy', 'When I Work', 'Sling', 'Homebase', '7shifts'],
    ifYouUse: '"I have Monday for projects and Eventbrite for tickets—I just need crew management."',
    valueProposition: 'Keep your CRM. Keep your ticketing. Manage crews here.',
    features: [
      'Unlimited crew members',
      'Punch lists & task management',
      'Digital timekeeping',
      'Crew scheduling',
      'Site communications',
      'Safety reporting',
      'Cross-org JOIN',
    ],
    upgradePaths: ['production', 'operations'],
    icon: 'Users',
    color: 'brand-yellow',
    ctaText: 'START COMPVSS',
    ctaHref: '/auth/signup?plan=compvss',
  },

  atlvs: {
    id: 'atlvs',
    name: 'ATLVS',
    tagline: 'RUN THE SHOW',
    category: 'single',
    products: ['ATLVS'],
    price: {
      monthly: 799,
      transactionFee: null,
      perTicket: null,
      display: '$799',
      period: '/month',
    },
    byo: {
      items: ['Crews', 'Ticketing'],
      competitors: ['ConnectTeam', 'Deputy', 'Eventbrite', 'DICE', 'Ticketmaster'],
    },
    replaces: ['Monday + QuickBooks + HubSpot', 'Salesforce', 'Airtable + spreadsheets'],
    ifYouUse: '"I have Deputy for crews and DICE for tickets—I just need CRM and finance."',
    valueProposition: 'Keep your crew app. Keep your ticketing. Run the business here.',
    features: [
      'Full CRM (deals, contacts, venues, artists)',
      'Project management',
      'Financial management',
      'Vendor management',
      'Documents & e-sign',
      'Reporting & analytics',
      'Third-party integrations',
    ],
    upgradePaths: ['production', 'experience'],
    icon: 'Briefcase',
    color: 'brand-pink',
    ctaText: 'START ATLVS',
    ctaHref: '/auth/signup?plan=atlvs',
  },

  // ---------------------------------------------------------------------------
  // BUNDLES (Fill the Gaps)
  // ---------------------------------------------------------------------------
  operations: {
    id: 'operations',
    name: 'OPERATIONS',
    tagline: 'CREWS + TICKETS. BYO BUSINESS.',
    category: 'bundle',
    products: ['GVTEWAY', 'COMPVSS'],
    price: {
      monthly: 299,
      transactionFee: 2.5,
      perTicket: 0.50,
      display: '$299',
      period: '/mo + 2.5% + $0.50/ticket',
    },
    byo: {
      items: ['CRM', 'Finance'],
      competitors: ['Salesforce', 'HubSpot', 'QuickBooks', 'Xero', 'NetSuite'],
    },
    replaces: ['ConnectTeam + Eventbrite', 'Deputy + DICE', 'When I Work + Ticketmaster'],
    ifYouUse: '"I have HubSpot for CRM and QuickBooks for finance—I just need crews + tickets."',
    valueProposition: 'Love Salesforce? Love HubSpot? Keep it. We\'ll handle crews and tickets.',
    features: [
      'Everything in GVTEWAY',
      'Everything in COMPVSS',
      'Native crew-to-event sync',
      'Unified scheduling',
      'Lower transaction fees',
    ],
    upgradePaths: ['enterprise'],
    icon: 'Layers',
    color: 'brand-purple',
    ctaText: 'START OPERATIONS',
    ctaHref: '/auth/signup?plan=operations',
  },

  experience: {
    id: 'experience',
    name: 'EXPERIENCE',
    tagline: 'DEALS + TICKETS. BYO CREWS.',
    category: 'bundle',
    products: ['ATLVS', 'GVTEWAY'],
    price: {
      monthly: 799,
      transactionFee: 2.5,
      perTicket: 0.50,
      display: '$799',
      period: '/mo + 2.5% + $0.50/ticket',
    },
    byo: {
      items: ['Crews'],
      competitors: ['ConnectTeam', 'Deputy', 'When I Work', 'external labor vendors'],
    },
    replaces: ['Salesforce + Ticketmaster', 'HubSpot + Eventbrite', 'Monday + DICE + QuickBooks'],
    ifYouUse: '"I have ConnectTeam for crews—I just need CRM, finance, and ticketing."',
    valueProposition: 'Love your crew app? Love your labor vendors? Keep them. We\'ll run the business and sell the tickets.',
    features: [
      'Everything in ATLVS',
      'Everything in GVTEWAY',
      'Deal-to-door revenue tracking',
      'Fan CRM integration',
      'Lower transaction fees',
    ],
    upgradePaths: ['enterprise'],
    icon: 'Zap',
    color: 'brand-pink',
    ctaText: 'START EXPERIENCE',
    ctaHref: '/auth/signup?plan=experience',
  },

  production: {
    id: 'production',
    name: 'PRODUCTION',
    tagline: 'BOARDROOM TO BUILD SITE',
    category: 'bundle',
    products: ['ATLVS', 'COMPVSS'],
    price: {
      monthly: 999,
      transactionFee: null,
      perTicket: null,
      display: '$999',
      period: '/month',
    },
    byo: {
      items: ['Ticketing'],
      competitors: ['Eventbrite', 'DICE', 'Ticketmaster', 'venue box office'],
    },
    replaces: ['Monday + ConnectTeam + QuickBooks', 'Asana + Deputy + Xero', 'spreadsheets + WhatsApp'],
    ifYouUse: '"I have Eventbrite for tickets—I just need CRM, finance, and crew management."',
    valueProposition: 'Love your ticketing platform? Keep it. We\'ll run the entire operation.',
    features: [
      'Everything in ATLVS',
      'Everything in COMPVSS',
      'Native sync between business & site',
      'Project handoff automation',
      'Consolidated financials',
      'Unified SSO',
    ],
    upgradePaths: ['enterprise'],
    icon: 'Rocket',
    color: 'brand-cyan',
    popular: true,
    ctaText: 'START PRODUCTION',
    ctaHref: '/auth/signup?plan=production',
  },

  // ---------------------------------------------------------------------------
  // FULL STACK
  // ---------------------------------------------------------------------------
  enterprise: {
    id: 'enterprise',
    name: 'ENTERPRISE',
    tagline: 'REPLACE EVERYTHING',
    category: 'fullstack',
    products: ['ATLVS', 'COMPVSS', 'GVTEWAY'],
    price: {
      monthly: 1499,
      transactionFee: 2.0,
      perTicket: 0.40,
      display: '$1,499',
      period: '/mo + 2.0% + $0.40/ticket',
    },
    byo: {
      items: [],
      competitors: [],
    },
    replaces: ['Everything—Salesforce, ConnectTeam, Eventbrite, QuickBooks, all of it'],
    ifYouUse: '"We want one platform for everything."',
    valueProposition: 'Replace Salesforce. Replace ConnectTeam. Replace Eventbrite. Replace QuickBooks. One platform.',
    features: [
      'Everything in PRODUCTION + EXPERIENCE',
      'Lowest transaction fees',
      'Multi-property dashboard',
      'Advanced analytics & BI',
      'Full API access',
      'Dedicated CSM',
      'SLA guarantee',
      'Custom integrations',
    ],
    upgradePaths: [],
    icon: 'Crown',
    color: 'ink',
    ctaText: 'GO ENTERPRISE',
    ctaHref: '/contact?plan=enterprise',
  },
};

// =============================================================================
// COMPETITORS DATA
// =============================================================================

export const competitors: Competitor[] = [
  // Ticketing
  { name: 'Ticketmaster', category: 'ticketing', ourCounter: 'Lower fees, no exclusivity, own your data', byoMessage: 'Keep your CRM. Just add GVTEWAY.' },
  { name: 'Eventbrite', category: 'ticketing', ourCounter: 'Native CRM + finance in bundles', byoMessage: 'Keep your CRM. Just add GVTEWAY.' },
  { name: 'DICE', category: 'ticketing', ourCounter: 'Upgrade path to full ops', byoMessage: 'Keep your CRM. Just add GVTEWAY.' },
  { name: 'Universe', category: 'ticketing', ourCounter: 'Entertainment-native, not generic', byoMessage: 'Keep your CRM. Just add GVTEWAY.' },
  { name: 'See Tickets', category: 'ticketing', ourCounter: 'Own your data, lower fees', byoMessage: 'Keep your CRM. Just add GVTEWAY.' },
  
  // Crews
  { name: 'ConnectTeam', category: 'crews', ourCounter: 'Cross-org JOIN, punch lists, entertainment-specific', byoMessage: 'Keep your CRM. Just add COMPVSS.' },
  { name: 'Deputy', category: 'crews', ourCounter: 'Entertainment-specific workflows', byoMessage: 'Keep your CRM. Just add COMPVSS.' },
  { name: 'When I Work', category: 'crews', ourCounter: 'Project-based, not shift-based', byoMessage: 'Keep your CRM. Just add COMPVSS.' },
  { name: 'Sling', category: 'crews', ourCounter: 'JOIN feature for vendors', byoMessage: 'Keep your CRM. Just add COMPVSS.' },
  { name: '7shifts', category: 'crews', ourCounter: 'Entertainment, not hospitality', byoMessage: 'Keep your CRM. Just add COMPVSS.' },
  
  // PM
  { name: 'Monday', category: 'pm', ourCounter: 'Entertainment-native, not generic PM', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  { name: 'Asana', category: 'pm', ourCounter: 'Deal memos, production advances', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  { name: 'Basecamp', category: 'pm', ourCounter: 'Venue holds, settlements', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  
  // CRM
  { name: 'Salesforce', category: 'crm', ourCounter: 'Deals/artists/venues, not "leads"', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  { name: 'HubSpot', category: 'crm', ourCounter: 'Entertainment-native entities', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  { name: 'Pipedrive', category: 'crm', ourCounter: 'Integrated finance, not just sales', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  
  // Finance
  { name: 'QuickBooks', category: 'finance', ourCounter: 'Project-based P&L, crew cost tracking', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
  { name: 'Xero', category: 'finance', ourCounter: 'Entertainment-specific chart of accounts', byoMessage: 'Keep your ticketing. Just add ATLVS.' },
];

// =============================================================================
// TIER RECOMMENDATION LOGIC
// =============================================================================

export interface UserNeeds {
  needsTicketing: boolean;
  needsCrews: boolean;
  needsBusiness: boolean;
  existingTools: string[];
}

export function recommendTier(needs: UserNeeds): TierId {
  const { needsTicketing, needsCrews, needsBusiness } = needs;
  
  // Full stack
  if (needsTicketing && needsCrews && needsBusiness) {
    return 'enterprise';
  }
  
  // Bundles
  if (needsBusiness && needsTicketing && !needsCrews) {
    return 'experience';
  }
  if (needsBusiness && needsCrews && !needsTicketing) {
    return 'production';
  }
  if (needsTicketing && needsCrews && !needsBusiness) {
    return 'operations';
  }
  
  // Single products
  if (needsTicketing && !needsCrews && !needsBusiness) {
    return 'gvteway';
  }
  if (needsCrews && !needsTicketing && !needsBusiness) {
    return 'compvss';
  }
  if (needsBusiness && !needsTicketing && !needsCrews) {
    return 'atlvs';
  }
  
  // Default to production as most popular
  return 'production';
}

export function getTiersByCategory(category: TierCategory): PricingTier[] {
  return Object.values(pricingTiers).filter(tier => tier.category === category);
}

export function getTierById(id: TierId): PricingTier {
  return pricingTiers[id];
}

// =============================================================================
// FAQ DATA
// =============================================================================

export const pricingFAQ = [
  {
    question: 'I already have Salesforce—what do I need?',
    answer: 'If you love Salesforce, keep it! Choose OPERATIONS (crews + tickets) or PRODUCTION (crews only) and integrate with your existing CRM.',
  },
  {
    question: 'I already have ConnectTeam—what do I need?',
    answer: 'If ConnectTeam works for your crews, stick with it. Choose EXPERIENCE (business + tickets) or just ATLVS + GVTEWAY separately.',
  },
  {
    question: 'I already have Eventbrite—what do I need?',
    answer: 'If you\'re happy with Eventbrite, use PRODUCTION (business + crews). You can always migrate ticketing later for lower fees.',
  },
  {
    question: 'Can I start with one product and add more later?',
    answer: 'Absolutely. Start where you are. Every tier has clear upgrade paths, and your data migrates seamlessly when you\'re ready.',
  },
  {
    question: 'How does GHXSTSHIP compare to Ticketmaster?',
    answer: 'Lower fees (2.0-3.5% vs 5-10%), you own your fan data, no exclusivity contracts, and native CRM/finance if you want it.',
  },
  {
    question: 'Why no per-seat charges?',
    answer: 'We believe in removing friction. COMPVSS includes unlimited crew members. ATLVS includes unlimited users. Scale your team without scaling your bill.',
  },
  {
    question: 'What\'s the difference between OPERATIONS and PRODUCTION?',
    answer: 'OPERATIONS = crews + ticketing (BYO CRM/finance). PRODUCTION = business + crews (BYO ticketing). Pick based on what you already have.',
  },
];
