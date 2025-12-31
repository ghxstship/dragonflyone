/**
 * Marketing Integrations Content
 * Comprehensive integration categories, providers, and workflow examples
 * for the GHXSTSHIP Platform marketing pages
 */

export type IntegrationCategory = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  providerCount: number;
  featured: boolean;
  department: string;
  useCases: string[];
  benefits: string[];
};

export type IntegrationDepartment = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  categories: string[];
};

export type IntegrationProvider = {
  slug: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  website?: string;
  featured: boolean;
  premium: boolean;
  features: string[];
};

export type IntegrationWorkflow = {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: {
    number: number;
    title: string;
    description: string;
    integration?: string;
  }[];
  benefits: string[];
  timeSaved: string;
};

// ============================================================================
// INTEGRATION DEPARTMENTS
// ============================================================================

export const INTEGRATION_DEPARTMENTS: IntegrationDepartment[] = [
  {
    id: "people",
    name: "People & Workforce",
    description: "Manage your entire workforce lifecycle from hiring to payroll",
    icon: "Users",
    color: "primary",
    categories: ["ats", "hr", "payroll", "scheduling"],
  },
  {
    id: "finance",
    name: "Finance & Operations",
    description: "Streamline financial operations and revenue tracking",
    icon: "DollarSign",
    color: "success",
    categories: ["accounting", "pos", "payment"],
  },
  {
    id: "sales",
    name: "Sales & Marketing",
    description: "Drive revenue with CRM, ticketing, and marketing tools",
    icon: "TrendingUp",
    color: "accent",
    categories: ["crm", "ticketing", "email_marketing", "social_media"],
  },
  {
    id: "operations",
    name: "Production & Operations",
    description: "Coordinate venues, assets, and production logistics",
    icon: "Settings",
    color: "secondary",
    categories: ["venue", "inventory", "project_management", "catering", "transportation"],
  },
  {
    id: "technology",
    name: "Technology & Data",
    description: "Connect your tech stack and unlock data insights",
    icon: "Database",
    color: "info",
    categories: ["communication", "file_storage", "analytics", "automation"],
  },
];

// ============================================================================
// INTEGRATION CATEGORIES (Organized by Department)
// ============================================================================

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  // =========================================================================
  // PEOPLE & WORKFORCE DEPARTMENT
  // =========================================================================
  {
    id: "ats",
    name: "Applicant Tracking Systems",
    shortName: "Recruiting",
    description: "Streamline hiring with integrated applicant tracking",
    longDescription: "Connect with leading ATS platforms to streamline your event staffing and crew hiring. Automatically sync job postings, track candidates through your pipeline, and seamlessly onboard new team members directly into your production workforce.",
    icon: "UserPlus",
    color: "accent",
    providerCount: 24,
    featured: true,
    department: "people",
    useCases: [
      "Event staff recruitment",
      "Crew hiring and onboarding",
      "Seasonal workforce management",
      "Contractor sourcing",
    ],
    benefits: [
      "Faster time-to-hire",
      "Centralized candidate tracking",
      "Seamless onboarding flow",
      "Better talent pipeline visibility",
    ],
  },
  {
    id: "hr",
    name: "Human Resources",
    shortName: "HR",
    description: "Manage your workforce with integrated HR platforms",
    longDescription: "Connect your production team management with comprehensive HR platforms. Sync employee data, manage time-off requests, track performance, and maintain compliance across your entire workforce.",
    icon: "Building2",
    color: "secondary",
    providerCount: 12,
    featured: true,
    department: "people",
    useCases: [
      "Employee data synchronization",
      "Time-off and leave management",
      "Performance tracking",
      "Compliance documentation",
    ],
    benefits: [
      "Single source of truth for employee data",
      "Streamlined HR workflows",
      "Better workforce visibility",
      "Reduced administrative overhead",
    ],
  },
  {
    id: "payroll",
    name: "Payroll & Payments",
    shortName: "Payroll",
    description: "Automate payroll processing and contractor payments",
    longDescription: "Integrate with leading payroll providers to automate compensation for your production teams. Handle complex pay structures, contractor payments, and multi-state compliance with ease.",
    icon: "Wallet",
    color: "warning",
    providerCount: 15,
    featured: true,
    department: "people",
    useCases: [
      "Automated payroll processing",
      "Contractor payment management",
      "Multi-state tax compliance",
      "Expense reimbursement",
    ],
    benefits: [
      "Faster payment processing",
      "Reduced payroll errors",
      "Automated tax compliance",
      "Happy, paid-on-time workforce",
    ],
  },
  {
    id: "scheduling",
    name: "Scheduling & Workforce",
    shortName: "Scheduling",
    description: "Coordinate schedules across your entire team",
    longDescription: "Connect with workforce management platforms to optimize scheduling, track time and attendance, and ensure you have the right people in the right place at the right time.",
    icon: "Calendar",
    color: "info",
    providerCount: 10,
    featured: false,
    department: "people",
    useCases: [
      "Shift scheduling and management",
      "Time and attendance tracking",
      "Labor cost optimization",
      "Schedule conflict resolution",
    ],
    benefits: [
      "Optimized labor costs",
      "Reduced scheduling conflicts",
      "Better workforce utilization",
      "Improved team communication",
    ],
  },

  // =========================================================================
  // FINANCE & OPERATIONS DEPARTMENT
  // =========================================================================
  {
    id: "accounting",
    name: "Accounting & Finance",
    shortName: "Accounting",
    description: "Sync financial data with your accounting software",
    longDescription: "Connect your production finances with leading accounting platforms. Automatically sync invoices, expenses, and revenue data to maintain accurate financial records and streamline reconciliation.",
    icon: "Calculator",
    color: "primary",
    providerCount: 8,
    featured: true,
    department: "finance",
    useCases: [
      "Invoice synchronization",
      "Expense tracking",
      "Revenue recognition",
      "Budget vs. actual reporting",
    ],
    benefits: [
      "Accurate financial records",
      "Faster month-end close",
      "Real-time budget visibility",
      "Reduced manual data entry",
    ],
  },
  {
    id: "pos",
    name: "Point of Sale",
    shortName: "POS",
    description: "Integrate with restaurant and retail POS systems for real-time sales data",
    longDescription: "Connect your event and venue operations with leading POS systems to track sales, inventory, and revenue in real-time. Get instant visibility into F&B performance, merchandise sales, and transaction data across all your venues and events.",
    icon: "CreditCard",
    color: "success",
    providerCount: 20,
    featured: true,
    department: "finance",
    useCases: [
      "Real-time event sales tracking",
      "F&B revenue monitoring",
      "Merchandise inventory management",
      "Multi-venue sales consolidation",
    ],
    benefits: [
      "Live revenue dashboards",
      "Automated sales reporting",
      "Inventory optimization",
      "Faster financial reconciliation",
    ],
  },
  {
    id: "payment",
    name: "Payment Processing",
    shortName: "Payments",
    description: "Accept payments and manage transactions seamlessly",
    longDescription: "Connect with payment processors to accept credit cards, ACH transfers, and digital wallets. Manage refunds, disputes, and reconciliation from a single platform.",
    icon: "CreditCard",
    color: "success",
    providerCount: 8,
    featured: false,
    department: "finance",
    useCases: [
      "Online payment acceptance",
      "Invoice payment collection",
      "Refund processing",
      "Payment reconciliation",
    ],
    benefits: [
      "Faster payment collection",
      "Reduced transaction fees",
      "Automated reconciliation",
      "Better cash flow visibility",
    ],
  },

  // =========================================================================
  // SALES & MARKETING DEPARTMENT
  // =========================================================================
  {
    id: "crm",
    name: "Customer Relationship Management",
    shortName: "CRM",
    description: "Sync contacts, deals, and customer data with your CRM",
    longDescription: "Connect your production management with leading CRM platforms to maintain seamless customer relationships. Automatically sync attendee data, sponsor contacts, and vendor relationships to keep your sales and production teams aligned.",
    icon: "Users",
    color: "primary",
    providerCount: 8,
    featured: true,
    department: "sales",
    useCases: [
      "Sync event attendees to CRM contacts",
      "Track sponsor relationships and deals",
      "Manage vendor and supplier contacts",
      "Automate post-event follow-ups",
    ],
    benefits: [
      "360-degree view of customer relationships",
      "Automated data synchronization",
      "Improved sales pipeline visibility",
      "Better sponsor retention",
    ],
  },
  {
    id: "ticketing",
    name: "Ticketing & Registration",
    shortName: "Ticketing",
    description: "Integrate with ticketing platforms for attendee management",
    longDescription: "Connect with leading ticketing and registration platforms to sync attendee data, track ticket sales, and manage access control for your events.",
    icon: "Ticket",
    color: "accent",
    providerCount: 8,
    featured: true,
    department: "sales",
    useCases: [
      "Attendee data synchronization",
      "Ticket sales tracking",
      "Access control integration",
      "VIP management",
    ],
    benefits: [
      "Unified attendee database",
      "Real-time sales visibility",
      "Streamlined check-in",
      "Better attendee insights",
    ],
  },
  {
    id: "email_marketing",
    name: "Email Marketing",
    shortName: "Email",
    description: "Automate email campaigns and attendee communications",
    longDescription: "Connect with email marketing platforms to automate event announcements, ticket reminders, and post-event follow-ups. Segment audiences and track engagement across campaigns.",
    icon: "Mail",
    color: "primary",
    providerCount: 6,
    featured: false,
    department: "sales",
    useCases: [
      "Event announcement campaigns",
      "Ticket reminder sequences",
      "Post-event surveys",
      "Sponsor communications",
    ],
    benefits: [
      "Automated attendee outreach",
      "Higher open and click rates",
      "Better audience segmentation",
      "Improved event attendance",
    ],
  },
  {
    id: "social_media",
    name: "Social Media",
    shortName: "Social",
    description: "Manage social presence and event promotion",
    longDescription: "Connect with social media platforms to schedule posts, track engagement, and amplify your event marketing across channels.",
    icon: "Share2",
    color: "accent",
    providerCount: 5,
    featured: false,
    department: "sales",
    useCases: [
      "Event promotion scheduling",
      "Social listening and engagement",
      "Influencer coordination",
      "User-generated content curation",
    ],
    benefits: [
      "Consistent social presence",
      "Increased event visibility",
      "Better audience engagement",
      "Streamlined content management",
    ],
  },

  // =========================================================================
  // PRODUCTION & OPERATIONS DEPARTMENT
  // =========================================================================
  {
    id: "venue",
    name: "Venue & Hospitality",
    shortName: "Venue",
    description: "Connect with venue management and hospitality systems",
    longDescription: "Integrate with venue management platforms, property management systems, and hospitality tools to coordinate spaces, manage bookings, and deliver exceptional guest experiences.",
    icon: "Building",
    color: "success",
    providerCount: 6,
    featured: true,
    department: "operations",
    useCases: [
      "Venue booking management",
      "Room block coordination",
      "Catering integration",
      "Guest services",
    ],
    benefits: [
      "Streamlined venue operations",
      "Better space utilization",
      "Improved guest experience",
      "Centralized booking management",
    ],
  },
  {
    id: "inventory",
    name: "Inventory & Assets",
    shortName: "Inventory",
    description: "Track equipment, supplies, and production assets",
    longDescription: "Connect with inventory management systems to track production equipment, supplies, and assets across events and warehouses.",
    icon: "Package",
    color: "warning",
    providerCount: 6,
    featured: false,
    department: "operations",
    useCases: [
      "Equipment tracking",
      "Supply chain management",
      "Asset maintenance scheduling",
      "Warehouse management",
    ],
    benefits: [
      "Reduced equipment loss",
      "Optimized inventory levels",
      "Better asset utilization",
      "Streamlined logistics",
    ],
  },
  {
    id: "project_management",
    name: "Project Management",
    shortName: "Projects",
    description: "Coordinate tasks and timelines with PM tools",
    longDescription: "Connect with project management platforms to sync tasks, timelines, and milestones. Keep production teams aligned across tools.",
    icon: "ClipboardList",
    color: "primary",
    providerCount: 8,
    featured: false,
    department: "operations",
    useCases: [
      "Task synchronization",
      "Timeline management",
      "Team collaboration",
      "Milestone tracking",
    ],
    benefits: [
      "Unified task management",
      "Better deadline visibility",
      "Improved team coordination",
      "Reduced tool switching",
    ],
  },
  {
    id: "catering",
    name: "Catering & F&B",
    shortName: "Catering",
    description: "Manage food and beverage operations",
    longDescription: "Connect with catering management platforms to coordinate menus, dietary requirements, and F&B logistics for your events.",
    icon: "UtensilsCrossed",
    color: "warning",
    providerCount: 4,
    featured: false,
    department: "operations",
    useCases: [
      "Menu planning",
      "Dietary tracking",
      "Vendor coordination",
      "Cost management",
    ],
    benefits: [
      "Streamlined F&B operations",
      "Better dietary compliance",
      "Reduced food waste",
      "Improved guest satisfaction",
    ],
  },
  {
    id: "transportation",
    name: "Transportation & Logistics",
    shortName: "Transport",
    description: "Coordinate ground transportation and logistics",
    longDescription: "Connect with transportation and logistics platforms to manage shuttles, artist transport, equipment delivery, and guest transportation.",
    icon: "Truck",
    color: "secondary",
    providerCount: 4,
    featured: false,
    department: "operations",
    useCases: [
      "Shuttle scheduling",
      "Equipment delivery tracking",
      "Artist transportation",
      "Guest transport coordination",
    ],
    benefits: [
      "On-time arrivals",
      "Reduced logistics costs",
      "Better coordination",
      "Real-time tracking",
    ],
  },

  // =========================================================================
  // TECHNOLOGY & DATA DEPARTMENT
  // =========================================================================
  {
    id: "communication",
    name: "Communication & Collaboration",
    shortName: "Communication",
    description: "Keep your team connected with integrated messaging",
    longDescription: "Connect with the communication tools your team already uses. Send notifications, share updates, and collaborate seamlessly across Slack, Teams, and other platforms.",
    icon: "MessageSquare",
    color: "secondary",
    providerCount: 6,
    featured: true,
    department: "technology",
    useCases: [
      "Real-time notifications",
      "Team announcements",
      "Task assignments",
      "Status updates",
    ],
    benefits: [
      "Faster team communication",
      "Reduced email overload",
      "Centralized notifications",
      "Better team alignment",
    ],
  },
  {
    id: "file_storage",
    name: "File Storage & Documents",
    shortName: "Storage",
    description: "Sync files and documents with cloud storage",
    longDescription: "Connect with cloud storage providers to keep all your production documents, contracts, and media files organized and accessible from anywhere.",
    icon: "FolderOpen",
    color: "info",
    providerCount: 5,
    featured: false,
    department: "technology",
    useCases: [
      "Document synchronization",
      "Media asset management",
      "Contract storage",
      "Team file sharing",
    ],
    benefits: [
      "Centralized document access",
      "Version control",
      "Secure file sharing",
      "Reduced storage silos",
    ],
  },
  {
    id: "analytics",
    name: "Analytics & Business Intelligence",
    shortName: "Analytics",
    description: "Export data to your BI tools for advanced analysis",
    longDescription: "Connect with analytics and business intelligence platforms to create custom dashboards, run advanced analyses, and gain deeper insights into your production performance.",
    icon: "BarChart3",
    color: "primary",
    providerCount: 6,
    featured: true,
    department: "technology",
    useCases: [
      "Custom dashboard creation",
      "Advanced data analysis",
      "Trend identification",
      "Executive reporting",
    ],
    benefits: [
      "Deeper performance insights",
      "Data-driven decisions",
      "Custom visualizations",
      "Cross-platform analytics",
    ],
  },
  {
    id: "automation",
    name: "Automation & Workflows",
    shortName: "Automation",
    description: "Build custom automations with no-code tools",
    longDescription: "Connect with automation platforms like Zapier and Make to build custom workflows that connect ATLVS with thousands of other apps.",
    icon: "Zap",
    color: "accent",
    providerCount: 4,
    featured: false,
    department: "technology",
    useCases: [
      "Custom workflow automation",
      "Cross-app data sync",
      "Trigger-based actions",
      "No-code integrations",
    ],
    benefits: [
      "Unlimited integration possibilities",
      "No engineering required",
      "Custom business logic",
      "Reduced manual work",
    ],
  },
];

// ============================================================================
// FEATURED INTEGRATION PROVIDERS
// ============================================================================

export const FEATURED_PROVIDERS: IntegrationProvider[] = [
  // POS
  { slug: "toast", name: "Toast", description: "Restaurant POS and management platform", category: "pos", featured: true, premium: false, features: ["Orders", "Menu", "Payments", "Inventory", "Reports"] },
  { slug: "square_pos", name: "Square POS", description: "Point of sale and business management", category: "pos", featured: true, premium: false, features: ["Orders", "Payments", "Inventory", "Customers", "Loyalty"] },
  { slug: "clover", name: "Clover", description: "Business management and POS system", category: "pos", featured: true, premium: false, features: ["Orders", "Payments", "Inventory", "Apps"] },
  { slug: "lightspeed_pos", name: "Lightspeed", description: "Retail and restaurant POS", category: "pos", featured: true, premium: false, features: ["Orders", "Inventory", "Reports", "eCommerce"] },
  
  // ATS
  { slug: "greenhouse_ats", name: "Greenhouse", description: "Structured hiring platform", category: "ats", featured: true, premium: false, features: ["Jobs", "Candidates", "Interviews", "Scorecards", "Offers"] },
  { slug: "lever_ats", name: "Lever", description: "Talent acquisition suite", category: "ats", featured: true, premium: false, features: ["Jobs", "Candidates", "Analytics", "Offers"] },
  { slug: "workday_recruiting", name: "Workday Recruiting", description: "Enterprise talent acquisition", category: "ats", featured: true, premium: true, features: ["Jobs", "Candidates", "Onboarding"] },
  { slug: "indeed_hiring", name: "Indeed", description: "Job posting and hiring platform", category: "ats", featured: true, premium: false, features: ["Jobs", "Candidates", "Analytics"] },
  
  // HR & Payroll
  { slug: "gusto", name: "Gusto", description: "Payroll and HR platform", category: "payroll", featured: true, premium: false, features: ["Payroll", "Benefits", "HR", "Compliance"] },
  { slug: "rippling", name: "Rippling", description: "HR, IT, and Finance platform", category: "payroll", featured: true, premium: false, features: ["Payroll", "HR", "IT", "Finance"] },
  { slug: "deel", name: "Deel", description: "Global payroll and compliance", category: "payroll", featured: true, premium: false, features: ["Payroll", "Contractors", "Compliance"] },
  { slug: "bamboohr", name: "BambooHR", description: "HR software for SMB", category: "hr", featured: true, premium: false, features: ["Employees", "Time Off", "Performance", "Onboarding"] },
  
  // CRM
  { slug: "salesforce", name: "Salesforce", description: "Enterprise CRM platform", category: "crm", featured: true, premium: true, features: ["Contacts", "Deals", "Accounts", "Reports"] },
  { slug: "hubspot", name: "HubSpot", description: "CRM and marketing platform", category: "crm", featured: true, premium: false, features: ["Contacts", "Deals", "Marketing", "Analytics"] },
  
  // Communication
  { slug: "slack", name: "Slack", description: "Team messaging platform", category: "communication", featured: true, premium: false, features: ["Notifications", "Channels", "Workflows"] },
  { slug: "microsoft_teams", name: "Microsoft Teams", description: "Collaboration platform", category: "communication", featured: true, premium: false, features: ["Chat", "Meetings", "Files"] },
  
  // Accounting
  { slug: "quickbooks", name: "QuickBooks", description: "Accounting software", category: "accounting", featured: true, premium: false, features: ["Invoices", "Expenses", "Reports"] },
  { slug: "xero", name: "Xero", description: "Cloud accounting", category: "accounting", featured: true, premium: false, features: ["Invoices", "Bank Feeds", "Reports"] },
];

// ============================================================================
// INTEGRATION WORKFLOWS
// ============================================================================

export const INTEGRATION_WORKFLOWS: IntegrationWorkflow[] = [
  {
    id: "event-sales-tracking",
    title: "Real-Time Event Sales Tracking",
    description: "Automatically sync POS transactions to get live revenue dashboards during your events",
    category: "pos",
    steps: [
      { number: 1, title: "Connect POS", description: "Link your Toast, Square, or Clover account", integration: "toast" },
      { number: 2, title: "Map Locations", description: "Associate POS terminals with event venues" },
      { number: 3, title: "Go Live", description: "Sales data flows automatically to your dashboard" },
      { number: 4, title: "Analyze", description: "View real-time revenue, top sellers, and trends" },
    ],
    benefits: ["Live revenue visibility", "Instant sales alerts", "Automated reporting"],
    timeSaved: "10+ hours per event",
  },
  {
    id: "crew-hiring-pipeline",
    title: "Streamlined Crew Hiring",
    description: "Post jobs, track candidates, and onboard new crew members seamlessly",
    category: "ats",
    steps: [
      { number: 1, title: "Post Jobs", description: "Create positions that sync to Greenhouse or Lever", integration: "greenhouse_ats" },
      { number: 2, title: "Track Candidates", description: "View applicant pipeline in ATLVS" },
      { number: 3, title: "Hire & Onboard", description: "Convert candidates to crew members automatically" },
      { number: 4, title: "Schedule", description: "Assign new hires to upcoming productions" },
    ],
    benefits: ["Faster hiring", "Unified pipeline", "Seamless onboarding"],
    timeSaved: "5 hours per hire",
  },
  {
    id: "automated-payroll",
    title: "Automated Crew Payroll",
    description: "Sync timesheets and automatically process payroll for your production teams",
    category: "payroll",
    steps: [
      { number: 1, title: "Track Time", description: "Crew logs hours in ATLVS" },
      { number: 2, title: "Approve Timesheets", description: "Managers review and approve hours" },
      { number: 3, title: "Sync to Payroll", description: "Approved hours flow to Gusto or Rippling", integration: "gusto" },
      { number: 4, title: "Pay Crew", description: "Payroll processes automatically" },
    ],
    benefits: ["Zero manual entry", "Accurate payments", "Happy crew"],
    timeSaved: "8 hours per pay period",
  },
  {
    id: "sponsor-crm-sync",
    title: "Sponsor Relationship Management",
    description: "Keep sponsor data synchronized between ATLVS and your CRM",
    category: "crm",
    steps: [
      { number: 1, title: "Connect CRM", description: "Link Salesforce or HubSpot", integration: "salesforce" },
      { number: 2, title: "Map Fields", description: "Configure data mapping for sponsors" },
      { number: 3, title: "Sync Contacts", description: "Sponsor contacts flow bidirectionally" },
      { number: 4, title: "Track Deals", description: "Sponsorship deals update in real-time" },
    ],
    benefits: ["360-degree sponsor view", "No duplicate entry", "Better retention"],
    timeSaved: "3 hours per week",
  },
  {
    id: "team-notifications",
    title: "Real-Time Team Notifications",
    description: "Keep your team informed with automated Slack or Teams notifications",
    category: "communication",
    steps: [
      { number: 1, title: "Connect Slack", description: "Authorize ATLVS in your workspace", integration: "slack" },
      { number: 2, title: "Configure Channels", description: "Set up channels for different event types" },
      { number: 3, title: "Set Triggers", description: "Choose which events trigger notifications" },
      { number: 4, title: "Stay Informed", description: "Team gets instant updates" },
    ],
    benefits: ["Instant awareness", "Reduced email", "Better coordination"],
    timeSaved: "2 hours per day",
  },
];

// ============================================================================
// INTEGRATION STATS
// ============================================================================

export const INTEGRATION_STATS = {
  totalIntegrations: 150,
  categories: 18,
  departments: 5,
  apiEndpoints: 500,
  webhookEvents: 50,
  averageSetupTime: "5 minutes",
  dataPointsSynced: "10M+",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getIntegrationsByCategory(categoryId: string): IntegrationProvider[] {
  return FEATURED_PROVIDERS.filter(p => p.category === categoryId);
}

export function getFeaturedCategories(): IntegrationCategory[] {
  return INTEGRATION_CATEGORIES.filter(c => c.featured);
}

export function getCategoryById(id: string): IntegrationCategory | undefined {
  return INTEGRATION_CATEGORIES.find(c => c.id === id);
}

export function getWorkflowsByCategory(categoryId: string): IntegrationWorkflow[] {
  return INTEGRATION_WORKFLOWS.filter(w => w.category === categoryId);
}

export function searchIntegrations(query: string): IntegrationProvider[] {
  const lowerQuery = query.toLowerCase();
  return FEATURED_PROVIDERS.filter(
    p => p.name.toLowerCase().includes(lowerQuery) ||
         p.description.toLowerCase().includes(lowerQuery) ||
         p.category.toLowerCase().includes(lowerQuery)
  );
}

export function getDepartmentById(id: string): IntegrationDepartment | undefined {
  return INTEGRATION_DEPARTMENTS.find(d => d.id === id);
}

export function getCategoriesByDepartment(departmentId: string): IntegrationCategory[] {
  return INTEGRATION_CATEGORIES.filter(c => c.department === departmentId);
}

export function getProvidersByDepartment(departmentId: string): IntegrationProvider[] {
  const departmentCategories = getCategoriesByDepartment(departmentId).map(c => c.id);
  return FEATURED_PROVIDERS.filter(p => departmentCategories.includes(p.category));
}

export function getDepartmentStats(): { id: string; name: string; categoryCount: number; providerCount: number }[] {
  return INTEGRATION_DEPARTMENTS.map(dept => {
    const categories = getCategoriesByDepartment(dept.id);
    const providerCount = categories.reduce((sum, cat) => sum + cat.providerCount, 0);
    return {
      id: dept.id,
      name: dept.name,
      categoryCount: categories.length,
      providerCount,
    };
  });
}
