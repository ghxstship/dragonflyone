export const atlvsNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Finance", href: "/finance" },
  { label: "Assets", href: "/assets" },
  { label: "Contacts", href: "/contacts" },
  { label: "Deals", href: "/deals" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
];

// Sidebar navigation with full route structure
// Optimized for UX: 6 primary sections, task-based grouping, progressive disclosure
export const atlvsSidebarNavigation = [
  {
    section: "Home",
    icon: "LayoutDashboard",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", primary: true },
      { label: "Portfolio", href: "/portfolio", icon: "Briefcase" },
      { label: "OKRs & Goals", href: "/okrs", icon: "Target" },
      { label: "Strategic Alignment", href: "/alignment", icon: "Crosshair" },
    ],
  },
  {
    section: "Sales & CRM",
    icon: "Users",
    items: [
      { label: "Pipeline", href: "/pipeline", icon: "GitBranch", primary: true },
      { label: "Deals", href: "/deals", icon: "Handshake" },
      { label: "Contacts", href: "/contacts", icon: "Contact" },
      { label: "Leads", href: "/leads/scoring", icon: "Star" },
      { label: "Quotes & Proposals", href: "/quotes", icon: "FileQuestion" },
      { label: "RFPs", href: "/rfp", icon: "FileSearch" },
      { label: "Partnerships", href: "/partnerships", icon: "Link" },
      { label: "Stakeholders", href: "/stakeholders", icon: "Users" },
    ],
    subsections: [
      {
        label: "CRM Tools",
        items: [
          { label: "CRM Dashboard", href: "/crm", icon: "LayoutDashboard" },
          { label: "Tasks", href: "/crm/tasks", icon: "CheckSquare" },
          { label: "Calendar", href: "/crm/calendar", icon: "Calendar" },
          { label: "Email Integration", href: "/crm/email-integration", icon: "Mail" },
          { label: "Relationships", href: "/crm/relationships", icon: "Link2" },
          { label: "Contact Relationships", href: "/contacts/relationships", icon: "Network" },
        ],
      },
    ],
  },
  {
    section: "Projects",
    icon: "FolderKanban",
    items: [
      { label: "All Projects", href: "/projects", icon: "FolderKanban", primary: true },
      { label: "Contracts", href: "/contracts", icon: "FileText" },
      { label: "Scenarios", href: "/scenarios", icon: "GitCompare" },
      { label: "Advances", href: "/advances", icon: "ArrowUpRight" },
      { label: "Advancing", href: "/advancing", icon: "FastForward" },
    ],
  },
  {
    section: "Finance",
    icon: "DollarSign",
    items: [
      { label: "Overview", href: "/finance", icon: "DollarSign", primary: true },
      { label: "Invoices", href: "/invoices", icon: "FileText" },
      { label: "Billing", href: "/billing", icon: "Receipt" },
      { label: "Budgets", href: "/budgets", icon: "PieChart" },
      { label: "Payroll", href: "/payroll", icon: "Wallet" },
      { label: "Taxes", href: "/taxes", icon: "Calculator" },
    ],
    subsections: [
      {
        label: "Accounting",
        items: [
          { label: "Revenue Recognition", href: "/revenue-recognition", icon: "TrendingUp" },
          { label: "Bank Reconciliation", href: "/finance/bank-reconciliation", icon: "RefreshCw" },
          { label: "Accounts Receivable", href: "/finance/accounts-receivable", icon: "ArrowDownRight" },
          { label: "Credit Cards", href: "/finance/credit-cards", icon: "CreditCard" },
          { label: "Commissions", href: "/finance/commissions", icon: "Percent" },
        ],
      },
    ],
  },
  {
    section: "Resources",
    icon: "Package",
    items: [
      { label: "Assets", href: "/assets", icon: "Package", primary: true },
      { label: "Employees", href: "/employees", icon: "Users" },
      { label: "Vendors", href: "/vendors", icon: "Building" },
      { label: "Documents", href: "/documents", icon: "FileArchive" },
      { label: "Training", href: "/training", icon: "GraduationCap" },
    ],
    subsections: [
      {
        label: "Asset Management",
        items: [
          { label: "Tracking", href: "/assets/tracking", icon: "MapPin" },
          { label: "Maintenance", href: "/assets/maintenance", icon: "Wrench" },
          { label: "Utilization", href: "/assets/utilization", icon: "BarChart" },
          { label: "Rentals", href: "/assets/rentals", icon: "Key" },
          { label: "Kits & Bundles", href: "/assets/kits", icon: "Package" },
          { label: "Specifications", href: "/assets/specifications", icon: "FileText" },
          { label: "Calibration", href: "/assets/calibration", icon: "Settings" },
          { label: "Storage", href: "/assets/storage", icon: "Archive" },
          { label: "Scan", href: "/assets/scan", icon: "QrCode" },
          { label: "Serialized", href: "/assets/serialized", icon: "Hash" },
          { label: "Optimization", href: "/assets/optimization", icon: "Zap" },
          { label: "Performance", href: "/assets/performance", icon: "Activity" },
          { label: "Idle Analysis", href: "/assets/idle-analysis", icon: "Clock" },
          { label: "Damage Reports", href: "/assets/damage-reports", icon: "AlertTriangle" },
        ],
      },
      {
        label: "Vendor Management",
        items: [
          { label: "Vendor Contracts", href: "/vendors/contracts", icon: "FileText" },
          { label: "Rate Cards", href: "/vendors/rate-cards", icon: "DollarSign" },
        ],
      },
      {
        label: "Procurement",
        items: [
          { label: "Procurement", href: "/procurement", icon: "ShoppingCart" },
          { label: "Categories", href: "/procurement/categories", icon: "Grid" },
          { label: "Vendor Selection", href: "/procurement/vendor-selection", icon: "UserCheck" },
          { label: "Vendor Audits", href: "/procurement/vendor-audits", icon: "ClipboardCheck" },
          { label: "Emergency", href: "/procurement/emergency", icon: "AlertCircle" },
          { label: "Logistics", href: "/procurement/logistics", icon: "Truck" },
        ],
      },
    ],
  },
  {
    section: "People",
    icon: "Users",
    items: [
      { label: "Workforce", href: "/workforce", icon: "Users", primary: true },
      { label: "Performance", href: "/performance", icon: "TrendingUp" },
      { label: "Compensation", href: "/workforce/compensation", icon: "DollarSign" },
      { label: "Succession", href: "/workforce/succession", icon: "ArrowUpRight" },
      { label: "Referrals", href: "/workforce/referrals", icon: "UserPlus" },
    ],
    subsections: [
      {
        label: "Compliance",
        items: [
          { label: "Background Checks", href: "/workforce/background-checks", icon: "ShieldCheck" },
          { label: "Labor Laws", href: "/workforce/labor-laws", icon: "Scale" },
          { label: "Union Compliance", href: "/workforce/union-compliance", icon: "Shield" },
          { label: "Union Rules", href: "/workforce/union-rules", icon: "FileText" },
          { label: "Handbook", href: "/workforce/handbook", icon: "Book" },
        ],
      },
    ],
  },
  {
    section: "Analytics",
    icon: "BarChart3",
    items: [
      { label: "Overview", href: "/analytics", icon: "BarChart3", primary: true },
      { label: "KPIs", href: "/analytics/kpi", icon: "Target" },
      { label: "Reports", href: "/reports", icon: "FileBarChart" },
      { label: "Dashboard Builder", href: "/analytics/dashboard-builder", icon: "LayoutGrid" },
    ],
    subsections: [
      {
        label: "Advanced Analytics",
        items: [
          { label: "Data Warehouse", href: "/analytics/data-warehouse", icon: "Database" },
          { label: "Client Retention", href: "/analytics/client-retention", icon: "UserCheck" },
          { label: "Scheduled Reports", href: "/reports/scheduled", icon: "Clock" },
          { label: "Marketing Attribution", href: "/marketing/attribution", icon: "BarChart" },
        ],
      },
      {
        label: "Risk & Compliance",
        items: [
          { label: "Audit Trail", href: "/audit", icon: "Shield" },
          { label: "Compliance", href: "/compliance", icon: "CheckCircle" },
          { label: "Risks", href: "/risks", icon: "AlertTriangle" },
        ],
      },
      {
        label: "Governance",
        items: [
          { label: "Governance", href: "/governance", icon: "Landmark" },
          { label: "Subsidiaries", href: "/subsidiaries", icon: "Building2" },
          { label: "IP Tracking", href: "/ip-tracking", icon: "Shield" },
        ],
      },
    ],
  },
  {
    section: "Settings",
    icon: "Settings",
    items: [
      { label: "Settings", href: "/settings", icon: "Settings", primary: true },
      { label: "Integrations", href: "/integrations", icon: "Plug" },
      { label: "Design System", href: "/design-system", icon: "Palette" },
    ],
  },
];

// Quick actions for command palette and shortcuts
export const atlvsQuickActions = [
  { label: "New Deal", href: "/deals/new", icon: "Plus", shortcut: "D" },
  { label: "New Project", href: "/projects/new", icon: "Plus", shortcut: "P" },
  { label: "New Contact", href: "/contacts/new", icon: "Plus", shortcut: "C" },
  { label: "New Invoice", href: "/invoices/new", icon: "Plus", shortcut: "I" },
  { label: "Search", href: "/search", icon: "Search", shortcut: "/" },
];

// Bottom navigation for mobile (max 5 items)
export const atlvsBottomNavigation = [
  { label: "Home", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Deals", href: "/deals", icon: "Handshake" },
  { label: "Projects", href: "/projects", icon: "FolderKanban" },
  { label: "Finance", href: "/finance", icon: "DollarSign" },
  { label: "More", href: "/menu", icon: "Menu" },
];

// Landing page anchor navigation (for marketing/overview page)
export const atlvsLandingNavigation = [
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export const atlvsEntities = [
  {
    id: "direction",
    name: "Direction",
    vertical: "Strategy",
    headcount: 34,
    revenue: "$42M",
    utilization: 0.81,
    description: "Executive leadership, governance, and OKR steering across the portfolio.",
    okrs: [
      "Deliver quarterly board packs within 48 hours",
      "Maintain cross-vertical margin >30%",
      "Close three joint ventures in FY26",
    ],
    dependencies: ["Development", "Finance"],
  },
  {
    id: "development",
    name: "Development",
    vertical: "Studios",
    headcount: 57,
    revenue: "$68M",
    utilization: 0.74,
    description: "Product + experience development pods delivering new shows and formats.",
    okrs: [
      "Ship 12 net-new programs",
      "Reduce change-order overruns to <5%",
      "Launch asset telemetry across all studios",
    ],
    dependencies: ["Direction", "Assets"],
  },
  {
    id: "design",
    name: "Design",
    vertical: "Creative",
    headcount: 41,
    revenue: "$33M",
    utilization: 0.79,
    description: "Creative direction, experience design, and brand guardianship.",
    okrs: [
      "Maintain NPS 9.2+ across concept reviews",
      "Template 100% of production riders",
      "Codify 25 reusable scenic kits",
    ],
    dependencies: ["Development"],
  },
  {
    id: "disruption",
    name: "Disruption",
    vertical: "Incubation",
    headcount: 18,
    revenue: "$22M",
    utilization: 0.66,
    description: "Skunkworks team piloting AI, Web3, and immersive guest tech.",
    okrs: [
      "Launch 3 AI copilots for internal ops",
      "Deploy blockchain ticketing at two tours",
      "Prototype AR backstage flow for GVTEWAY",
    ],
    dependencies: ["Direction", "GVTEWAY"],
  },
];

export const atlvsDocumentVault = [
  { id: "nda-2026", title: "Global NDA Template", owner: "Legal Ops", category: "Legal", status: "approved", updated: "2025-10-04" },
  { id: "bc-dr", title: "Business Continuity Runbook", owner: "Direction", category: "Governance", status: "in-review", updated: "2025-11-01" },
  { id: "asset-registry", title: "Asset Registry SOP", owner: "Assets", category: "Operations", status: "draft", updated: "2025-10-28" },
  { id: "tax-kit", title: "Multi-Entity Tax Kit", owner: "Finance", category: "Finance", status: "approved", updated: "2025-09-12" },
  { id: "risk-matrix", title: "Risk Matrix 2026", owner: "Direction", category: "Risk", status: "in-review", updated: "2025-10-30" },
];

export const atlvsComplianceAlerts = [
  { id: "ins-cert", area: "Insurance", severity: "high", detail: "Stage Roof policy expires in 14 days", owner: "Assets", due: "2025-11-15" },
  { id: "lic-renewal", area: "Licensing", severity: "medium", detail: "NYC filming permit renewals pending signatures", owner: "Legal", due: "2025-11-05" },
  { id: "nda-gap", area: "NDA", severity: "low", detail: "Two vendors missing new NDA template", owner: "Procurement", due: "2025-11-20" },
];

export const atlvsInnovationTracks = [
  {
    title: "AI + Machine Learning",
    bullets: [
      "Predictive demand forecasting for ticket pricing",
      "Automated crew skills matching",
      "Intelligent event + account recommendations",
      "Fraud detection across ticketing + finance",
      "Chatbots + copilots for support",
      "Predictive maintenance + budget optimization",
    ],
  },
  {
    title: "Blockchain & Web3",
    bullets: [
      "NFT tickets with proof of attendance",
      "Smart contracts for artist + venue settlements",
      "Transparent secondary market and fan tokens",
      "Digital collectibles + memorabilia drops",
    ],
  },
  {
    title: "AR/VR & Immersive",
    bullets: [
      "Virtual venue tours + remote site surveys",
      "3D production planning + immersive previews",
      "Virtual backstage + guest experiences",
    ],
  },
  {
    title: "IoT + Edge",
    bullets: [
      "Smart wristbands for access + payments",
      "Real-time capacity + environmental monitoring",
      "Automated inventory + equipment telemetry",
      "Low-latency crew comms + streaming",
    ],
  },
];

export const atlvsPortfolioSync = [
  {
    id: "sync-ops",
    project: "Formula Drift Residency",
    compvssSlug: "comp-fdr-45",
    status: "pending",
    lastSync: "2025-11-07",
    delta: "+3 change orders awaiting approval",
    blockers: ["COMPVSS stage plot not published"],
  },
  {
    id: "sync-assets",
    project: "Global Fan Village",
    compvssSlug: "comp-gfv-12",
    status: "in-progress",
    lastSync: "2025-11-08",
    delta: "Updating asset reservations + crew payroll",
    blockers: ["Awaiting GVTEWAY merch feed"],
  },
  {
    id: "sync-exec",
    project: "Legionnaire Summit",
    compvssSlug: "comp-leg-05",
    status: "synced",
    lastSync: "2025-11-09",
    delta: "All metrics aligned",
    blockers: [],
  },
  {
    id: "sync-risk",
    project: "Neon Harbor Residency",
    compvssSlug: "comp-nhr-33",
    status: "failed",
    lastSync: "2025-11-06",
    delta: "2 unresolved risk alerts",
    blockers: ["Stripe payout variance", "Crew overtime export"],
  },
];

export const atlvsGtmPlan = [
  {
    phase: "Year 1 · Foundation",
    target: "Internal programs + 10 strategic clients",
    tactics: [
      "Use GHXSTSHIP productions as proof-of-concept",
      "Beta program with trusted venues + artists",
      "Focus on perfecting core workflows and case studies",
      "Build initial sales collateral + testimonials",
    ],
    metrics: [
      "20+ events managed",
      "95% user satisfaction",
      "Zero critical production failures",
      "$500K+ ticket volume",
    ],
  },
  {
    phase: "Year 2 · Penetration",
    target: "100+ clients across festival, concert, corporate, venue segments",
    tactics: [
      "Content marketing + webinars + trade shows",
      "Industry partnerships + referral incentives",
      "Freemium GVTEWAY motion to drive adoption",
    ],
    metrics: [
      "$5M+ platform revenue",
      "1M+ tickets sold",
      "500+ productions",
      "50+ companies on ATLVS",
    ],
  },
  {
    phase: "Year 3 · Leadership",
    target: "Top 3 live entertainment platform",
    tactics: [
      "Enterprise sales for large operators + promoters",
      "International expansion + strategic acquisitions",
      "Developer ecosystem + API partnerships",
    ],
    metrics: [
      "$20M+ revenue",
      "10M+ tickets",
      "5K+ productions",
      "500+ enterprise customers",
    ],
  },
];

export const atlvsSuccessMetrics = [
  {
    id: "atlvs",
    title: "ATLVS KPIs",
    metrics: [
      "Number of active business users",
      "Projects managed per month",
      "Asset utilization rate",
      "Budget accuracy (planned vs actual)",
      "Days sales outstanding",
      "Vendor payment cycle time",
      "Employee satisfaction score",
      "Time saved vs. manual processes",
      "Revenue per employee",
      "Client retention rate",
    ],
  },
  {
    id: "cross",
    title: "Cross-platform KPIs",
    metrics: [
      "Total platform revenue",
      "Cross-platform adoption rate",
      "Data synchronization accuracy",
      "Platform uptime (99.9% target)",
      "API response time",
      "Customer satisfaction (CSAT)",
      "Support ticket resolution time",
      "Feature adoption rate",
      "Year-over-year growth",
    ],
  },
];

export const atlvsCompetitiveMatrix = [
  {
    feature: "Business Operations",
    competitors: "Monday.com, Asana, Notion",
    advantage: "Industry-specific workflows, native asset management, financial integration",
  },
  {
    feature: "CRM",
    competitors: "Salesforce, HubSpot, Pipedrive",
    advantage: "Live entertainment relationship tracking with venue/artist/crew fields",
  },
  {
    feature: "Finance",
    competitors: "QuickBooks, NetSuite, Xero",
    advantage: "Project-based accounting with multi-stakeholder settlements and production P&L",
  },
  {
    feature: "Asset Management",
    competitors: "EZOfficeInventory, Asset Panda",
    advantage: "Production equipment focus, cross-project allocation, maintenance for AV/staging gear",
  },
  {
    feature: "Workforce",
    competitors: "Workday, BambooHR, Deputy",
    advantage: "Union compliance, gig workforce management, skills-based crew matching",
  },
];

export const atlvsDevelopmentPhases = [
  {
    id: "phase-1",
    phase: "Phase 1 — Foundation",
    timeframe: "Months 1-2",
    description: "Stand up the core executive control surface with identity, CRM, finance, and workforce baselines.",
    deliverables: [
      "Authentication + user management with role-aware access",
      "Basic CRM covering contacts, companies, and deal tracking",
      "Initial finance stack for AP/AR and invoicing",
      "Employee directory + org chart mapped to Legend roles",
    ],
  },
  {
    id: "phase-1b",
    phase: "Phase 1 — Infrastructure",
    timeframe: "Months 1-2",
    description: "Shared cloud + data foundations so ATLVS can coordinate with COMPVSS + GVTEWAY.",
    deliverables: [
      "Cloud environments, PostgreSQL, and API gateway online",
      "Authentication backbone (Auth0/Cognito) with SSO hooks",
      "File storage (S3) + CDN patterns for secure asset sharing",
    ],
  },
  {
    id: "phase-2",
    phase: "Phase 2 — Essential Operations",
    timeframe: "Months 3-4",
    description: "Layer in operational intelligence for assets, procurement, and workforce finance.",
    deliverables: [
      "Asset registry with basic tracking + location metadata",
      "Purchase order workflow tied to finance approvals",
      "Expense management with receipts + policy enforcement",
      "Staff time tracking feeding utilization + payroll",
      "Executive-ready reporting tiles",
    ],
  },
  {
    id: "phase-3",
    phase: "Phase 3 — Integration Prep",
    timeframe: "Months 5-6",
    description: "Ready ATLVS for tri-platform launch with automation between COMPVSS and GVTEWAY.",
    deliverables: [
      "Project sync with COMPVSS (deal → production)",
      "Financial sync with GVTEWAY for ticket + merch revenue",
      "Automation hooks for Stripe reconciliation + refunds",
      "Cross-platform KPI dashboard surfacing build readiness",
    ],
  },
];

export const atlvsAssetInsights = [
  {
    title: "Maintenance windows",
    metrics: [
      { label: "Scheduled", value: "82" },
      { label: "Overdue", value: "4" },
    ],
    description: "Preventive cycles across warehouses + on-site depots.",
  },
  {
    title: "Asset readiness",
    metrics: [
      { label: "Available", value: "91%" },
      { label: "In transit", value: "7%" },
    ],
    description: "Telemetry-driven availability before crew call.",
  },
  {
    title: "Incident queue",
    metrics: [
      { label: "Open", value: "3" },
      { label: "Resolved this week", value: "12" },
    ],
    description: "Damage + repair tickets linked to insurance + budgeting.",
  },
];

export const atlvsAutomationProgram = [
  {
    id: "zapier",
    title: "Zapier Integration Roadmap",
    bullets: [
      "OAuth + SCIM-friendly auth with role-scoped tokens",
      "12+ core triggers (deal, invoice, crew assignment, ticket sale, asset alert)",
      "10+ actions (create deal, log payment, issue PO, notify guests)",
      "Search actions for contacts, deals, assets, events",
      "Sample Zaps covering ATLVS→Slack, GVTEWAY→Mailchimp, COMPVSS→Jira",
      "Usage analytics dashboard for tasks, top Zaps, error rate",
    ],
  },
  {
    id: "make",
    title: "Make (Integromat) Scenarios",
    bullets: [
      "Module coverage for Finance Ops, Production Ops, Guest Marketing",
      "Advanced error handling with auto-retry + break-on-fail",
      "Iterator-friendly endpoints supporting 10k record syncs",
      "Secured webhooks via HMAC + timestamp validation",
      "JSON schema bundles + throttling guidance in Dev Hub",
      "Pilot with 3 enterprise partners ahead of GA",
    ],
  },
  {
    id: "n8n",
    title: "n8n Integration Blueprint",
    bullets: [
      "Official GHXSTSHIP node package with TypeScript typings",
      "Credential types for OAuth2 + scoped API keys",
      "Trigger + regular nodes across ATLVS/COMPVSS/GVTEWAY",
      "Helper nodes for webhook verification + pagination",
      "8 reference workflows (asset maintenance, finance recon, crew onboarding, etc.)",
      "Self-hosted templates + automated regression tests via n8n CLI",
    ],
  },
  {
    id: "openapi",
    title: "OpenAPI & Developer Experience",
    bullets: [
      "Single-source OpenAPI 3.1 specs in /packages/api-specs",
      "Auto-generated SDKs (TS, Python, Go) each release",
      "Postman + Insomnia collections synced from spec",
      "Endpoint-level changelog + deprecation policy",
      "Interactive docs with SSO + key management portal",
      "Webhook catalogs with payloads, retries, and error codes",
    ],
  },
  {
    id: "governance",
    title: "Governance & Timeline",
    bullets: [
      "Month 4: OpenAPI baseline freeze + Zapier private beta",
      "Month 5: Make pilot + n8n alpha",
      "Month 6: Zapier public listing, OpenAPI portal, n8n GA",
      "Month 8: Automation analytics + partner certification",
    ],
  },
];

export const atlvsIntegrationWorkflows = [
  {
    id: "atlvs-compvss",
    title: "ATLVS ↔ COMPVSS",
    description: "Bridge executive operations with production execution so deals, budgets, and crews stay aligned.",
    items: [
      "Auto-create COMPVSS projects when ATLVS deals close",
      "Bidirectional budget sync (planned vs actual)",
      "Asset availability checks from ATLVS inventory",
      "Crew assignments with payroll data looping to ATLVS",
      "Expense submissions in COMPVSS routing into ATLVS AP",
      "Production hours syncing into ATLVS payroll + utilization",
      "Vendor invoices matching to ATLVS purchase orders",
      "Risk/compliance alerts surfaced inside ATLVS dashboards",
      "Status + change orders reflected in ATLVS portfolio views",
      "Damage reports updating ATLVS maintenance schedules",
      "Project completion triggering ATLVS financial closeout",
      "Resource conflicts flagged across both systems",
      "Client satisfaction signals feeding ATLVS CRM",
    ],
  },
  {
    id: "atlvs-gvteway",
    title: "ATLVS ↔ GVTEWAY",
    description: "Finance + CRM telemetry flows from executive ops into guest experiences and revenue surfaces.",
    items: [
      "Client CRM data syncing to GVTEWAY guest profiles",
      "Ticket + merch revenue landing in ATLVS ledgers",
      "Inventory parity between ATLVS assets and GVTEWAY merch",
      "Marketing spend in GVTEWAY reporting into ATLVS finance",
      "Customer lifetime value combining CRM + purchase data",
      "Payment settlements reconciling back to ATLVS accounting",
      "Vendor + artist performance updates feeding ATLVS databases",
      "Artist bookings in ATLVS generating GVTEWAY events",
      "Financial reconciliation with discrepancy alerts",
      "Shared tax reporting across both stacks",
    ],
  },
  {
    id: "compvss-gvteway",
    title: "COMPVSS ↔ GVTEWAY",
    description: "Production timelines, capacity, and guest comms stay synchronized show-day through wrap.",
    items: [
      "Event metadata flowing from COMPVSS to GVTEWAY listings",
      "Production schedule updates pushing guest notifications",
      "Capacity + layout driving GVTEWAY ticket inventory",
      "Seating charts from COMPVSS powering GVTEWAY maps",
      "Show day alerts arriving via GVTEWAY",
      "Production media feeding GVTEWAY memory galleries",
      "Guest services directory accessible in GVTEWAY apps",
      "Incidents in COMPVSS triggering GVTEWAY comms",
      "Ticket scans feeding COMPVSS show reports",
      "VIP lists syncing for backstage + access control",
      "Merch sales insights informing COMPVSS inventory",
      "Weather + transport intel surfacing in GVTEWAY",
      "Set times + curfews publishing to GVTEWAY pages",
    ],
  },
];

export const atlvsTriPlatformFlows = [
  {
    title: "Inquiry → Event Lifecycle",
    detail: "ATLVS CRM intake → COMPVSS project build → GVTEWAY event listing keeps every stage tracked.",
  },
  {
    title: "Asset Investment Loop",
    detail: "Asset purchased in ATLVS → deployed via COMPVSS → showcased in GVTEWAY guest experience.",
  },
  {
    title: "Crew + Content Signal",
    detail: "Crew hired in ATLVS → scheduled in COMPVSS → generates content surfaced to guests in GVTEWAY.",
  },
  {
    title: "Campaign Intelligence",
    detail: "Marketing in GVTEWAY → spend + performance logged in ATLVS → informs COMPVSS production decisions.",
  },
  {
    title: "Revenue → Capacity Feedback",
    detail: "Ticket sales in GVTEWAY → revenue + KPIs in ATLVS → capacity adjustments within COMPVSS.",
  },
  {
    title: "Guest Feedback Loop",
    detail: "GVTEWAY feedback → incident logged in COMPVSS → vendor + quality scores updated in ATLVS.",
  },
  {
    title: "Unified Intelligence",
    detail: "Single dashboard shows KPIs across ATLVS, COMPVSS, and GVTEWAY with SSO + shared notifications.",
  },
  {
    title: "Cross-Platform Foundations",
    detail: "Universal notifications, search, and SSO keep teams in lockstep across all mission surfaces.",
  },
];

export const atlvsFinanceKPIs = [
  {
    label: "Runway",
    value: "18 mo",
    detail: "Multi-entity cash position with capex allocation.",
  },
  {
    label: "Utilization",
    value: "78%",
    detail: "Billable vs. available crew hours across verticals.",
  },
  {
    label: "Margin",
    value: "32%",
    detail: "Project weighted average with change-order uplift.",
  },
  {
    label: "Collections",
    value: "96%",
    detail: "AR inside 45-day SLA with automated dunning.",
  },
];

export const atlvsSlaCommitments = [
  {
    category: "Executive Ops",
    entries: [
      "Board brief within 4 hours of request",
      "OKR updates nightly with confidence scoring",
    ],
  },
  {
    category: "Asset Intelligence",
    entries: [
      "Maintenance conflict alerts within 15 minutes",
      "Insurance coverage check automated per assignment",
    ],
  },
  {
    category: "Finance",
    entries: [
      "3-way match completed within 24 hours",
      "Daily variance alerts for budget overrun >5%",
    ],
  },
];

export const atlvsHero = {
  kicker: "FOR PRODUCTION PROFESSIONALS",
  headline: "PRODUCTION MANAGEMENT THAT SCALES",
  description:
    "The all-in-one platform for managing productions, activations, installations, and destinations at any scale.",
  tags: ["Productions", "Activations", "Installations", "Destinations"],
  status: "BUILD 0.1.0 · INTERNAL",
  cta: "START FREE TRIAL",
  secondaryCta: "WATCH DEMO",
  tagline: "Where chaos becomes choreography.",
};

// Landing page hero for marketing
export const atlvsLandingHero = {
  kicker: "FOR PRODUCTION PROFESSIONALS",
  headline: "PRODUCTION MANAGEMENT THAT SCALES",
  description:
    "The all-in-one platform for managing productions, activations, installations, and destinations at any scale.",
  primaryCta: { label: "START FREE TRIAL", href: "/auth/signup" },
  secondaryCta: { label: "WATCH DEMO", href: "#demo" },
  tagline: "Where chaos becomes choreography.",
  trustedBy: ["INSOMNIAC", "RED BULL", "SUPERFLY", "AEG", "C3 PRESENTS"],
};

// Four verticals for landing page
export const atlvsVerticals = [
  {
    id: "productions",
    icon: "Tent",
    title: "PRODUCTIONS",
    description: "Live entertainment at any scale — from 200-person club shows to 400K-attendee festivals",
    features: ["Festivals", "Concerts", "Tours", "Live events"],
    workflows: ["Run-of-show", "Stage management", "Artist advancing", "Crew scheduling"],
    href: "/verticals/productions",
  },
  {
    id: "activations",
    icon: "Zap",
    title: "ACTIVATIONS",
    description: "Brand experiences that create lasting impressions — pop-ups, roadshows, experiential marketing",
    features: ["Brand experiences", "Pop-ups", "Roadshows", "Launches"],
    workflows: ["Brand asset management", "Footprint planning", "Activation calendars"],
    href: "/verticals/activations",
  },
  {
    id: "installations",
    icon: "Palette",
    title: "INSTALLATIONS",
    description: "Immersive environments and artistic exhibitions — permanent and temporary",
    features: ["Art", "Immersive", "Exhibitions", "Themed environments"],
    workflows: ["Build schedules", "Technical specs", "Maintenance workflows"],
    href: "/verticals/installations",
  },
  {
    id: "destinations",
    icon: "MapPin",
    title: "DESTINATIONS",
    description: "Venues, retreats, and experience properties — spaces designed for extraordinary moments",
    features: ["Venues", "Retreats", "Resorts", "Experience properties"],
    workflows: ["Property operations", "Booking management", "Guest experience flows"],
    href: "/verticals/destinations",
  },
];

// Problem section for landing page
export const atlvsProblemSection = {
  headline: "THE OLD WAY IS BREAKING",
  tagline: "You didn't get into this industry to manage spreadsheets. You got into it to create experiences.",
  problems: [
    {
      icon: "chaos",
      title: "SPREADSHEET CHAOS",
      description: "Your production lives in 47 spreadsheets, 3 Slack channels, and someone's email inbox.",
    },
    {
      icon: "silos",
      title: "DISCONNECTED TEAMS",
      description: "Crew in Slack. Budget in Sheets. Timeline in Asana. Nothing talks to anything.",
    },
    {
      icon: "clock",
      title: "LAST-MINUTE FIRES",
      description: '"Where\'s the updated call sheet?" at 2am the night before load-in.',
    },
  ],
};

// Three pillars for landing page
export const atlvsPillarsSolution = [
  {
    id: "project-management",
    title: "PROJECT MANAGEMENT",
    description:
      "From concept to wrap, manage every phase of your production with purpose-built tools. Gantt timelines, milestone tracking, and production calendars that understand how shows actually get made.",
    features: [
      "Production timelines with dependencies",
      "Milestone tracking with automated alerts",
      "Multi-project portfolio views",
      "Template library for repeatable productions",
    ],
    replaces: "Asana, Monday.com, Smartsheet",
    screenshot: "/images/atlvs-project-dashboard.png",
  },
  {
    id: "workflow-management",
    title: "WORKFLOW MANAGEMENT",
    description:
      "Production advancing, vendor coordination, and approval chains that keep everyone aligned. From artist riders to site plans, nothing falls through the cracks.",
    features: [
      "Production advancing workflows",
      "Approval chains with digital sign-off",
      "Document management and version control",
      "Automated status updates and notifications",
    ],
    replaces: "DocuSign workflows, email chains, paper forms",
    screenshot: "/images/atlvs-workflow-board.png",
  },
  {
    id: "resource-management",
    title: "RESOURCE MANAGEMENT",
    description:
      "People, equipment, and budget — all in one view. Know who's where, what's allocated, and how much you've spent before you overspend.",
    features: [
      "Crew scheduling and availability",
      "Equipment inventory and allocation",
      "Budget tracking with real-time spend",
      "Vendor and contractor management",
    ],
    replaces: "Sortly, ConnectTeam, spreadsheet budgets",
    screenshot: "/images/atlvs-resource-allocation.png",
  },
];

// Feature grid for landing page
export const atlvsFeatureGrid = [
  {
    icon: "Calendar",
    title: "PRODUCTION CALENDAR",
    description:
      "Multi-view calendars with production phases, load-in, show days, and strike windows.",
  },
  {
    icon: "Users",
    title: "CREW MANAGEMENT",
    description:
      "Build your team, manage availability, and schedule shifts across multiple simultaneous shows.",
  },
  {
    icon: "Box",
    title: "INVENTORY",
    description:
      "Track every piece of gear from warehouse to site and back again.",
  },
  {
    icon: "FileText",
    title: "DOCUMENT HUB",
    description:
      "Contracts, riders, tech specs, site plans — organized, versioned, and always accessible.",
  },
  {
    icon: "DollarSign",
    title: "BUDGET & FINANCE",
    description:
      "Real-time budget tracking, expense management, and vendor payments in one place.",
  },
  {
    icon: "Zap",
    title: "AUTOMATIONS",
    description:
      "Trigger-based workflows that eliminate manual tasks and keep you moving.",
  },
  {
    icon: "BarChart",
    title: "ANALYTICS & REPORTS",
    description:
      "Production KPIs, budget variance, resource utilization — know your numbers.",
  },
  {
    icon: "Shield",
    title: "COMPLIANCE & SAFETY",
    description:
      "Union rules, safety briefings, incident reporting — stay compliant at scale.",
  },
  {
    icon: "Puzzle",
    title: "INTEGRATIONS",
    description:
      "Connect to Zapier, Make, n8n, and your existing stack.",
  },
];

// COMPVSS section for landing page
export const atlvsCompvssSection = {
  kicker: "INTRODUCING",
  title: "COMPVSS",
  subtitle: "The collaboration portal for your extended production team",
  description:
    "ATLVS is your command center. COMPVSS is how you bring everyone else into the mission — crew, vendors, freelancers, partners, and collaborators who need access without the complexity.",
  features: [
    {
      icon: "HardHat",
      title: "CREW",
      description: "Schedules, call sheets, check-ins",
    },
    {
      icon: "Building",
      title: "VENDORS",
      description: "POs, invoices, deliverables, contracts",
    },
    {
      icon: "Handshake",
      title: "PARTNERS",
      description: "Shared views, approvals, co-production",
    },
  ],
  note: "Included with Navigator and Aviator plans",
  cta: { label: "LEARN MORE ABOUT COMPVSS →", href: "/compvss" },
};

// Social proof for landing page
export const atlvsSocialProof = {
  headline: "TRUSTED BY PRODUCTION TEAMS WORLDWIDE",
  testimonial: {
    quote:
      "ATLVS transformed how we manage our festival portfolio. What used to take 3 production managers and endless spreadsheets now runs from a single dashboard. We shipped 12 festivals last year with half the coordination overhead.",
    author: "PRODUCTION DIRECTOR",
    company: "MAJOR FESTIVAL COMPANY",
  },
  stats: [
    { value: "2,400+", label: "Productions Managed" },
    { value: "50M+", label: "Attendees Served" },
    { value: "$2.1B", label: "Budgets Tracked" },
    { value: "99.9%", label: "Uptime SLA" },
  ],
};

// Pricing tiers for landing page
export const atlvsPricing = {
  headline: "PRICING THAT SCALES WITH YOUR PRODUCTION",
  subheadline: "Get 2 months free on annual plans.",
  tiers: [
    {
      id: "deviator",
      name: "DEVIATOR",
      price: "$29",
      period: "/month",
      description: "Best for Independent Contractors and Vendors",
      features: [
        "ATLVS only",
        "Unlimited Projects",
        "Unlimited Records",
        "Unlimited Internal Seats",
        "Unlimited Guest Seats",
        "Unlimited Integrations",
        "Unlimited Automations",
        "24/7/365 Support",
      ],
      cta: { label: "START FREE", href: "/auth/signup?plan=deviator" },
      popular: false,
    },
    {
      id: "navigator",
      name: "NAVIGATOR",
      price: "$99",
      period: "/month",
      description: "Best for Contractors, Subcontractors, and Project Managers",
      features: [
        "ATLVS + COMPVSS",
        "Unlimited Projects",
        "Unlimited Records",
        "Unlimited Internal Seats",
        "Unlimited Guest Seats",
        "Unlimited Integrations",
        "Unlimited Automations",
        "24/7/365 Support",
      ],
      cta: { label: "START TRIAL", href: "/auth/signup?plan=navigator" },
      popular: true,
    },
    {
      id: "aviator",
      name: "AVIATOR",
      price: "$999",
      period: "/month",
      description: "Best for Executives, Producers, and Directors",
      features: [
        "ATLVS + COMPVSS + GVTEWAY",
        "Unlimited Projects",
        "Unlimited Records",
        "Unlimited Internal Seats",
        "Unlimited Guest Seats",
        "Unlimited Integrations",
        "Unlimited Automations",
        "24/7/365 Support",
      ],
      cta: { label: "START TRIAL", href: "/auth/signup?plan=aviator" },
      popular: false,
    },
  ],
  footnote: "All plans include: Unlimited Projects, Records, Seats, Integrations, Automations, and 24/7/365 Support",
};

// Final CTA for landing page
export const atlvsLandingCta = {
  headline: "READY TO SHIP YOUR NEXT SHOW?",
  subheadline: "Join 2,400+ productions running on ATLVS",
  primaryCta: { label: "START FREE TRIAL", href: "/auth/signup" },
  secondaryCta: { label: "SCHEDULE DEMO", href: "/demo" },
  footnote: "No credit card required • 14-day free trial",
};

// Footer navigation for landing page
export const atlvsFooterNavigation = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Security", href: "/security" },
    { label: "Roadmap", href: "/roadmap" },
  ],
  verticals: [
    { label: "Productions", href: "/verticals/productions" },
    { label: "Activations", href: "/verticals/activations" },
    { label: "Installations", href: "/verticals/installations" },
    { label: "Destinations", href: "/verticals/destinations" },
  ],
  resources: [
    { label: "Help Center", href: "/help" },
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: "/guides" },
    { label: "Templates", href: "/templates" },
    { label: "API Docs", href: "/docs/api" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  ecosystem: [
    { label: "ATLVS", href: "/", current: true },
    { label: "COMPVSS", href: "https://compvss.ghxstship.com" },
    { label: "GVTEWAY", href: "https://gvteway.ghxstship.com" },
  ],
};

export const atlvsExecutiveSummary = {
  highlights: [
    "All verticals operating under BUILD 0.1.0 with monochrome design system applied",
    "Tri-platform workflows defined end-to-end with integration mappings",
    "Contact wizard + mobile nav implemented per design directives",
  ],
  signals: [
    { label: "OKR Confidence", value: "0.82", trend: "up" },
    { label: "Risk Heat", value: "Low", trend: "stable" },
    { label: "Audit Readiness", value: "87%", trend: "up" },
  ],
};

export const atlvsStats = [
  { label: "Entities", value: "4" },
  { label: "Live Programs", value: "52" },
  { label: "Assets", value: "3.1K" },
  { label: "Crew", value: "1.2K" },
];

export const atlvsCapabilityPanels = [
  {
    kicker: "Mission Control",
    title: "Executive Telemetry",
    description:
      "Portfolio-level clarity with live health scoring, risk heat maps, dependency insights, and board-ready reporting across every vertical.",
    bullets: [
      "Real-time OKR + initiative alignment",
      "Decision log with approval lineage",
      "Scenario planning + forecasting sandbox",
    ],
  },
  {
    kicker: "Integrations",
    title: "Tri-Platform Continuity",
    description:
      "Signal flow across ATLVS, COMPVSS, and GVTEWAY: deals become productions, productions become guest experiences, finances reconcile automatically.",
    bullets: [
      "Bidirectional budget + asset sync",
      "Crew payroll + compliance bridge",
      "Incident + risk escalation across platforms",
    ],
  },
];

export const atlvsWorkflowTimeline = [
  {
    label: "01",
    title: "Inquiry → CRM Intelligence",
    description:
      "New client inquiry lands in ATLVS CRM with org charts, NDA enforcement, and stakeholder scoring.",
    tags: ["ATLVS", "CRM"],
  },
  {
    label: "02",
    title: "Deal Won → Production Spin-Up",
    description:
      "ATLVS automatically provisions COMPVSS projects with scope, risk register, and initial budget envelopes.",
    tags: ["ATLVS", "COMPVSS"],
  },
  {
    label: "03",
    title: "Asset + Crew Allocation",
    description:
      "Inventory, maintenance windows, and crew availability sync between ATLVS asset ops and COMPVSS scheduling.",
    tags: ["Assets", "Workforce"],
  },
  {
    label: "04",
    title: "Guest Experience Broadcast",
    description:
      "COMPVSS event metadata and set times publish to GVTEWAY, triggering ticketing, seating, and guest comms.",
    tags: ["COMPVSS", "GVTEWAY"],
  },
  {
    label: "05",
    title: "Financial Close + Intelligence",
    description:
      "Post-event data flows back to ATLVS for P&L, audit trails, and roadmap retrospectives across all platforms.",
    tags: ["Finance", "Analytics"],
  },
];

export const atlvsFormGuidelines = [
  {
    title: "Multi-step contact wizard",
    description:
      "Break complex engagement briefs into bite-size panels with geometric progress indicators and inline validation.",
    bullets: [
      "Uppercase Bebas Neue labels with Share Tech body copy",
      "Bold outlined inputs + high-contrast focus states",
      "File upload + drag zones for decks and riders",
    ],
  },
  {
    title: "Inline intelligence",
    description:
      "Surface role-based guidance (admin, finance, ops) next to each input so teams submit clean data the first time.",
    bullets: [
      "Share Tech Mono metadata for hints + requirements",
      "Validation copy stays monochrome with iconography",
      "Auto-save drafts with audit timestamps",
    ],
  },
  {
    title: "Submission states",
    description:
      "Success + error states use inverted palettes, halftone icons, and CTA guidance for next steps or escalations.",
    bullets: [
      "Geometric success glyphs, no drop shadows",
      "Inline retry for failed uploads",
      "Route escalations to Legend support with context",
    ],
  },
];

export const atlvsIntegrationMatrix = [
  {
    title: "ATLVS ↔ COMPVSS",
    description: "Projects, budgets, crew, and asset telemetry stay synchronized across executive + production layers.",
    bullets: [
      "Auto project handoff when ATLVS deals close",
      "Bidirectional budget + change-order sync",
      "Crew hours + payroll data looped back to finance",
    ],
  },
  {
    title: "ATLVS ↔ GVTEWAY",
    description: "Financial + CRM data feed directly into fan experiences and monetization flows.",
    bullets: [
      "Client CRM data seeding guest profiles",
      "Ticket + merch revenue settling to ATLVS GL",
      "Artist booking + marketing spend reconciled",
    ],
  },
  {
    title: "COMPVSS ↔ GVTEWAY",
    description: "Production timelines and guest touchpoints stay in lockstep for on-site execution.",
    bullets: [
      "Event metadata powering ticketing + seating maps",
      "Real-time show day alerts pushed to guests",
      "Attendance + incident data feeding production reports",
    ],
  },
];

export const atlvsComplianceChecklist = [
  {
    title: "Accessibility",
    description: "WCAG 2.1 AA coverage with keyboard-first UX and contrast-tested monochrome palette.",
    bullets: [
      "4.5:1 contrast verified for all text",
      "Focus rings + skip-nav patterns included",
      "ARIA labeling for data visualizations",
    ],
  },
  {
    title: "Security & Permissions",
    description: "Role-based access aligned with Legend → ATLVS inheritance plus audit logging.",
    bullets: [
      "Granular RBAC by persona + scope",
      "Session + token rotation policies",
      "Impersonation trails for support workflows",
    ],
  },
  {
    title: "Quality Gates",
    description: "Full-stack audit checklist baked into CI for zero-regression deployments.",
    bullets: [
      "Strict TypeScript + ESLint enforcement",
      "Automated Lighthouse & performance budgets",
      "End-to-end workflow validation per release",
    ],
  },
];

export const atlvsFinalCta = {
  kicker: "Command the entire ecosystem",
  title: "Activate ATLVS mission control",
  description:
    "Secure executive visibility, production readiness, and guest experience synchronization across GHXSTSHIP Industries' tri-platform stack.",
  primary: {
    label: "Book Architecture Review",
    href: "#",
  },
  secondary: {
    label: "Download Full Roadmap",
    href: "#",
  },
};

export const atlvsPillars = [
  {
    label: "Business Operations",
    items: [
      "Multi-entity hierarchy across Direction/Development/Design/Disruption",
      "Governance + compliance vault with audit-ready reporting",
      "Risk and incident management linked to board packs",
    ],
  },
  {
    label: "Executive Projects",
    items: [
      "Portfolio view with health and profitability scoring",
      "Dependency + capacity mapping to prevent conflicts",
      "Stakeholder communication hub with approvals",
    ],
  },
  {
    label: "Asset Intelligence",
    items: [
      "Global registry with telemetry + maintenance history",
      "Utilization + ROI analytics",
      "Kit + package builder with barcode scanning",
    ],
  },
  {
    label: "Finance Stack",
    items: [
      "Multi-ledger GL with project job costing",
      "AP/AR automation and deferred revenue",
      "Cash flow forecasting + scenario modeling",
    ],
  },
];

export const atlvsRoadmapSections = [
  {
    id: "operations",
    kicker: "01 — Business Operations",
    title: "Governance + Compliance Fabric",
    description:
      "Bring every legal entity, contract, compliance artifact, and incident into a single view with traceable approvals and disaster recovery readiness.",
    bullets: [
      "Org hierarchy visualization with meeting + decision logs",
      "Document + contract lifecycle with NDA + IP tracking",
      "Risk management workflows with incident heat mapping",
    ],
  },
  {
    id: "projects",
    kicker: "02 — Executive Project Management",
    title: "Strategic Portfolio Intelligence",
    description:
      "Monitor budget, timeline, margin, and client satisfaction across all initiatives with predictive resourcing and initiative alignment scoring.",
    bullets: [
      "Scenario planning + forecasting tools",
      "Resource allocation optimizer with utilization forecasting",
      "Stakeholder comms hub and retrospective knowledge base",
    ],
  },
  {
    id: "assets",
    kicker: "03 — Asset Management",
    title: "Telemetry-Driven Asset Ops",
    description:
      "Complete registry for production equipment, AV gear, staging, and vehicles with maintenance automation and insurance coverage linkage.",
    bullets: [
      "Maintenance scheduling + history with failure prediction",
      "Asset checkout / return workflows with approvals",
      "Depreciation + valuation with utilization reports",
    ],
  },
  {
    id: "finance",
    kicker: "04 — Finance Management",
    title: "Multi-Entity Financial Stack",
    description:
      "Unify GL, AP/AR, purchase orders, billing, and scenario modeling for every vertical with automated compliance and audit trails.",
    bullets: [
      "AP automation with 3-way match + vendor portals",
      "Revenue recognition and deferred revenue management",
      "Cash flow forecasting with multi-scenario modeling",
    ],
  },
  {
    id: "workforce",
    kicker: "05 — Workforce Intelligence",
    title: "People + Skills Graph",
    description:
      "Dynamic org charts, onboarding automation, training, certifications, and labor law compliance across employees, contractors, and freelancers.",
    bullets: [
      "Automated onboarding/offboarding playbooks",
      "Shift scheduling with conflict + geofenced time tracking",
      "Skills inventory matrix with certification alerts",
    ],
  },
  {
    id: "crm",
    kicker: "06 — CRM",
    title: "360° Client Relationship Engine",
    description:
      "Unified contact graph spanning clients, vendors, partners, venues, and artists with deal pipelines, onboarding workflows, and predictive health scoring.",
    bullets: [
      "Deal pipeline management with lead scoring",
      "Client onboarding + renewal automation",
      "Account health scoring with predictive alerts",
    ],
  },
];

export const atlvsRoles = [
  {
    name: "Legend Super Admin",
    detail: "God-mode platform access, impersonation without request",
  },
  {
    name: "ATLVS Admin",
    detail: "Full administrative access, budgets, team management",
  },
  {
    name: "ATLVS Team Member",
    detail: "Task execution, collaboration, uploads, sub-task creation",
  },
  {
    name: "ATLVS Viewer",
    detail: "Read-only intelligence with light export permissions",
  },
];

export const atlvsImmediateNextSteps = [
  {
    title: "Validate feature priorities",
    detail: "Run stakeholder sessions with executive ops + finance leads to sequence MVP scope.",
  },
  {
    title: "Technical architecture review",
    detail: "Finalize service boundaries + data contracts for ATLVS ↔ COMPVSS ↔ GVTEWAY flows.",
  },
  {
    title: "Budget + resource allocation",
    detail: "Lock engineering pods, delivery milestones, and capex/opex envelopes.",
  },
];

export const atlvsAuditFocus = [
  {
    title: "Build & Code Quality",
    detail: "Zero TypeScript, lint, or runtime errors with strict mode everywhere.",
    bullets: [
      "All TS files compile without errors",
      "Strict mode + explicit return types enforced",
      "ESLint + Prettier pipelines stay green",
    ],
  },
  {
    title: "Design System Compliance",
    detail: "No rogue colors or typography — only monochrome tokens and approved fonts.",
    bullets: [
      "Tokens applied for every color + spacing decision",
      "WCAG contrast validated for all UI surfaces",
      "Component variants mapped to brand guidelines",
    ],
  },
  {
    title: "End-to-End Workflow Validation",
    detail: "Role-based testing matrix across personas before production toggle.",
    bullets: [
      "Persona journeys documented + verified",
      "Critical path flows tested (deal → project → event)",
      "Cross-platform parity confirmed",
    ],
  },
];

export const atlvsFeatureChecklist = [
  {
    id: "business-ops",
    kicker: "01 — Business Operations",
    title: "Governance & Continuity",
    items: [
      "Multi-entity hierarchy across Direction/Development/Design/Disruption",
      "Contract + NDA lifecycle management with version control",
      "Compliance vault for insurance, licenses, certifications",
      "Risk + incident reporting tied to board/executive packs",
      "Business continuity + disaster recovery planning logs",
    ],
  },
  {
    id: "executive-projects",
    kicker: "02 — Executive Project Management",
    title: "Portfolio Intelligence",
    items: [
      "Portfolio health scoring with budget, timeline, margin",
      "Cross-project dependency + conflict mapping",
      "Scenario planning + forecasting sandbox",
      "Stakeholder comms hub with approval lineage",
      "Retrospectives + lessons learned knowledge base",
    ],
  },
  {
    id: "asset-management",
    kicker: "03 — Asset Management",
    title: "Telemetry Ops",
    items: [
      "Complete asset registry with custom tagging",
      "Maintenance scheduling + preventive alerts",
      "Insurance linkage + coverage verification",
      "Checkout/return workflows with approvals",
      "Depreciation, valuation, and utilization reports",
    ],
  },
  {
    id: "finance-management",
    kicker: "04 — Finance Management",
    title: "Multi-Entity Stack",
    items: [
      "Multi-ledger GL + project job costing",
      "AP automation with 3-way match + vendor portals",
      "AR, collections, and dunning automation",
      "Cash flow forecasting + scenario modeling",
      "Revenue recognition + deferred revenue tracking",
    ],
  },
  {
    id: "workforce-intelligence",
    kicker: "05 — Workforce Intelligence",
    title: "People Graph",
    items: [
      "Dynamic org charts with reporting lines",
      "Automated onboarding/offboarding playbooks",
      "Shift scheduling with conflict + geofenced tracking",
      "Skills inventory + certification alerts",
      "Performance reviews, goals, and compliance training",
    ],
  },
  {
    id: "crm",
    kicker: "06 — CRM",
    title: "Client Relationship Engine",
    items: [
      "Unified contact + organization profiles",
      "Deal pipeline with custom stages + lead scoring",
      "Account health scoring + renewal automation",
      "Quote/proposal + contract lifecycle management",
      "Client onboarding workflows with automated touchpoints",
    ],
  },
];
