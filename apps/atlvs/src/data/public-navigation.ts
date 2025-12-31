// =============================================================================
// PUBLIC MARKETING NAVIGATION DATA
// Used for public-facing pages with mega-menu dropdowns
// =============================================================================

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  features?: string[];
  icon?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface ProductNavItem extends NavItem {
  tagline: string;
  features: string[];
}

// =============================================================================
// PRODUCTS NAVIGATION
// =============================================================================

export const productsNavigation = {
  label: 'Products',
  href: '/products',
  products: [
    {
      label: 'ATLVS',
      href: '/products/atlvs',
      tagline: 'Production Management',
      description: 'The command center for live event production.',
      features: [
        'Project Management',
        'Financial Tools',
        'Asset Tracking',
        'Vendor Management',
      ],
      icon: 'command',
    },
    {
      label: 'COMPVSS',
      href: '/products/compvss',
      tagline: 'Crew & Operations',
      description: 'Workforce management for production crews.',
      features: [
        'Crew Database',
        'Scheduling',
        'Timekeeping',
        'Communications',
      ],
      icon: 'users',
    },
    {
      label: 'GVTEWAY',
      href: '/products/gvteway',
      tagline: 'Ticketing & Experience',
      description: 'Fan-facing platform for ticket sales.',
      features: [
        'Event Discovery',
        'Ticket Sales',
        'Fan Engagement',
        'Merch & Upsells',
      ],
      icon: 'ticket',
    },
    {
      label: 'Experience Generator',
      href: '/generator',
      tagline: 'AI-Powered Design',
      description: 'Transform any idea into a production blueprint.',
      features: [
        'AI Blueprint Generation',
        '5-Senses Design',
        'Guest Journey Mapping',
        'Production Docs',
      ],
      icon: 'sparkles',
    },
  ] as ProductNavItem[],
  quickLinks: [
    { label: 'Compare Products', href: '/products/compare' },
    { label: 'Integrations', href: '/integrations' },
    { label: 'Security', href: '/security' },
    { label: 'API Documentation', href: '/docs/api' },
  ],
};

// =============================================================================
// SOLUTIONS NAVIGATION
// =============================================================================

export const solutionsNavigation = {
  label: 'Solutions',
  href: '/solutions',
  groups: [
    {
      title: 'Business Leaders',
      items: [
        { label: 'Producers', href: '/solutions/producers', description: 'Production companies and executive producers' },
        { label: 'Promoters', href: '/solutions/promoters', description: 'Event promoters and marketing teams' },
        { label: 'Investors', href: '/solutions/investors', description: 'Financial stakeholders and investors' },
        { label: 'Sponsors', href: '/solutions/sponsors', description: 'Brand sponsors and activation partners' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Project Managers', href: '/solutions/project-managers', description: 'Production and project managers' },
        { label: 'Contractors', href: '/solutions/contractors', description: 'General contractors and vendors' },
        { label: 'Subcontractors', href: '/solutions/subcontractors', description: 'Specialty subcontractors' },
        { label: 'Independent Contractors', href: '/solutions/independent-contractors', description: 'Freelancers and gig workers' },
      ],
    },
    {
      title: 'Venues & Destinations',
      items: [
        { label: 'Venues', href: '/solutions/venues', description: 'Event venues and spaces' },
        { label: 'Destinations', href: '/solutions/destinations', description: 'Destination event locations' },
      ],
    },
    {
      title: 'Creative',
      items: [
        { label: 'Artists', href: '/solutions/artists', description: 'Performers and creative talent' },
        { label: 'Vendors', href: '/solutions/vendors', description: 'Service providers and suppliers' },
      ],
    },
    {
      title: 'Workforce',
      items: [
        { label: 'Production Crews', href: '/solutions/production-crews', description: 'Technical and production staff' },
        { label: 'Event Staff', href: '/solutions/event-staff', description: 'Front-of-house and operations staff' },
        { label: 'Brand Ambassadors', href: '/solutions/brand-ambassadors', description: 'Promotional and activation staff' },
      ],
    },
    {
      title: 'Safety & Services',
      items: [
        { label: 'Public Safety Teams', href: '/solutions/public-safety', description: 'Security and emergency services' },
      ],
    },
  ] as NavGroup[],
  verticals: [
    { label: 'Productions', href: '/verticals/productions' },
    { label: 'Brand Activations', href: '/verticals/activations' },
    { label: 'Art Installations', href: '/verticals/installations' },
    { label: 'Destination Events', href: '/verticals/destinations' },
  ],
};

// =============================================================================
// RESOURCES NAVIGATION
// =============================================================================

export const resourcesNavigation = {
  label: 'Resources',
  href: '/resources',
  groups: [
    {
      title: 'Learn',
      items: [
        { label: 'Help Center', href: '/help', description: 'Documentation and guides' },
        { label: 'Guides & Tutorials', href: '/guides', description: 'Step-by-step walkthroughs' },
        { label: 'API Documentation', href: '/docs/api', description: 'Developer reference' },
        { label: 'Blog', href: '/blog', description: 'Industry insights and news' },
        { label: 'Case Studies', href: '/case-studies', description: 'Customer success stories' },
        { label: 'Templates', href: '/templates', description: 'Downloadable templates' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Contact Support', href: '/contact', description: 'Get help from our team' },
        { label: 'System Status', href: '/status', description: 'Platform availability' },
        { label: 'Community', href: '/community', description: 'User forums and discussions' },
        { label: 'Training', href: '/training', description: 'Certification programs' },
        { label: 'Webinars', href: '/webinars', description: 'Live and recorded sessions' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About Us', href: '/about', description: 'Our story and mission' },
        { label: 'Careers', href: '/careers', description: 'Join our team' },
        { label: 'Press', href: '/press', description: 'Media kit and news' },
        { label: 'Partners', href: '/partners', description: 'Partner program' },
        { label: 'Contact', href: '/contact', description: 'Get in touch' },
      ],
    },
  ] as NavGroup[],
  featured: [
    { label: 'Getting Started Guide', href: '/guides/getting-started' },
    { label: 'Watch Demo', href: '/demo' },
    { label: 'Request Demo', href: '/demo/request' },
    { label: 'Changelog', href: '/changelog' },
  ],
};

// =============================================================================
// V3 EXPANSION FEATURES FOR MARKETING
// =============================================================================

export const v3ExpansionFeatures = {
  venueManagement: {
    title: 'Venue Management Module',
    tagline: 'Complete venue sales and event management in one platform',
    features: [
      { id: 'LM-001', name: 'Lead Capture Web Forms', description: 'AI-optimized forms that convert 40% better' },
      { id: 'LM-002', name: 'Visual Pipeline Management', description: 'Kanban pipeline with predictive win probability' },
      { id: 'LM-003', name: 'Contact & Account Database', description: 'Unified CRM for all relationships' },
      { id: 'BK-001', name: 'Master Event Calendar', description: 'Real-time availability across all spaces' },
      { id: 'BK-002', name: 'Space/Room Management', description: 'Manage multiple spaces and configurations' },
      { id: 'BK-003', name: 'Availability & Holds System', description: 'Priority holds with automatic expiration' },
      { id: 'BK-004', name: 'Event Booking Workflow', description: 'Streamlined booking from inquiry to confirmation' },
      { id: 'DG-001', name: 'Proposal Builder', description: 'Interactive proposals with client customization' },
      { id: 'DG-002', name: 'Contract Generation & E-Signatures', description: 'Smart clause assembly with DocuSign integration' },
      { id: 'DG-003', name: 'BEO Generation', description: 'Department-specific views and exports' },
      { id: 'CP-001', name: 'Client Self-Service Portal', description: 'Reduce email back-and-forth by 60%' },
      { id: 'PM-001', name: 'Integrated Payment Gateway', description: 'Accept payments directly in proposals' },
    ],
  },
  vendorServices: {
    title: 'Vendor Services Module',
    tagline: "The industry's most comprehensive vendor management system",
    features: [
      { id: 'VD-001', name: 'Vendor/Supplier Database', description: 'Centralized vendor profiles with ratings' },
      { id: 'PC-001', name: 'Global Product/Service Catalog', description: '329+ items across 24 categories' },
      { id: 'VO-001', name: 'Vendor Order/Request System', description: 'Streamlined ordering and tracking' },
      { id: 'VO-002', name: 'RFP/Quote Request System', description: 'Reduce procurement costs by 10-20%' },
      { id: 'VO-003', name: 'Purchase Order Management', description: 'Three-way matching prevents fraud' },
      { id: 'VF-003', name: 'Event Cost Tracking & Profitability', description: 'Real-time P&L per event' },
      { id: 'VS-001', name: 'Vendor Scheduling & Load-In', description: 'Smart scheduling with optimization' },
    ],
  },
  blueOcean: {
    title: 'Blue Ocean Differentiators',
    tagline: 'Features no one else has',
    features: [
      { id: 'DF-001', name: 'Immersive Experience Design Studio', description: 'Plan multi-sensory experiences with 5-senses framework' },
      { id: 'DF-002', name: 'XYZ Spatial-Temporal Engine', description: 'Map guest journeys through space and time' },
      { id: 'DF-003', name: 'Pre-Event Gamification', description: 'Build anticipation with challenges and rewards' },
      { id: 'DF-004', name: 'Global Asset Category Intelligence', description: 'Benchmark costs against industry averages' },
    ],
  },
};

// =============================================================================
// PRICING TIERS
// =============================================================================

export const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    price: { monthly: 49, annual: 39 },
    userLimit: '1-5 users',
    features: [
      'Up to 5 team members',
      'Basic project management',
      'Contact management',
      'Invoice generation',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing production teams',
    price: { monthly: 149, annual: 119 },
    userLimit: '6-25 users',
    features: [
      'Up to 25 team members',
      'Advanced project management',
      'CRM & pipeline management',
      'Asset tracking',
      'Financial reporting',
      'API access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: null, annual: null },
    userLimit: '25+ users',
    features: [
      'Unlimited team members',
      'Custom workflows',
      'Advanced analytics',
      'SSO integration',
      'Dedicated success manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

// =============================================================================
// PUBLIC NAVIGATION EXPORT
// =============================================================================

export const publicNavigation = {
  products: productsNavigation,
  solutions: solutionsNavigation,
  resources: resourcesNavigation,
  pricing: { label: 'Pricing', href: '/pricing' },
};

export default publicNavigation;
