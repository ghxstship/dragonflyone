export const compvssNavigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Crew", href: "/crew" },
  { label: "Schedule", href: "/schedule" },
  { label: "Equipment", href: "/equipment" },
  { label: "Venues", href: "/venues" },
  { label: "Safety", href: "/safety" },
  { label: "Settings", href: "/settings" },
];

// Sidebar navigation with full route structure
// Optimized for UX: Task-based grouping aligned with production workflow phases
export const compvssSidebarNavigation = [
  {
    section: "Home",
    icon: "LayoutDashboard",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", primary: true },
      { label: "Schedule", href: "/schedule", icon: "Calendar" },
      { label: "Projects", href: "/projects", icon: "FolderKanban" },
    ],
  },
  {
    section: "Crew",
    icon: "Users",
    items: [
      { label: "All Crew", href: "/crew", icon: "Users", primary: true },
      { label: "Assign Crew", href: "/crew/assign", icon: "UserPlus" },
      { label: "Availability", href: "/availability", icon: "CalendarCheck" },
      { label: "Timekeeping", href: "/timekeeping", icon: "Clock" },
      { label: "Skills Matrix", href: "/skills", icon: "Zap" },
      { label: "Certifications", href: "/certifications", icon: "Award" },
    ],
    subsections: [
      {
        label: "Crew Admin",
        items: [
          { label: "Background Checks", href: "/background-checks", icon: "ShieldCheck" },
          { label: "Travel", href: "/travel", icon: "Plane" },
          { label: "Expenses", href: "/expenses", icon: "Receipt" },
          { label: "Mentorship", href: "/mentorship", icon: "GraduationCap" },
          { label: "Crew Social", href: "/crew-social", icon: "Heart" },
        ],
      },
    ],
  },
  {
    section: "Production",
    icon: "Clapperboard",
    items: [
      { label: "Run of Show", href: "/run-of-show", icon: "ListOrdered", primary: true },
      { label: "Stage Management", href: "/stage-management", icon: "Monitor" },
      { label: "Build & Strike", href: "/build-strike", icon: "Hammer" },
      { label: "Show Call", href: "/show-call", icon: "Phone" },
      { label: "Set Times", href: "/set-times", icon: "Clock" },
    ],
    subsections: [
      {
        label: "Pre-Production",
        items: [
          { label: "Templates", href: "/templates", icon: "Copy" },
          { label: "Site Surveys", href: "/site-surveys", icon: "MapPin" },
          { label: "Drawings", href: "/drawings", icon: "PenTool" },
          { label: "Tech Rehearsal", href: "/tech-rehearsal", icon: "Play" },
          { label: "Soundcheck", href: "/soundcheck", icon: "Volume2" },
        ],
      },
      {
        label: "Quality & Completion",
        items: [
          { label: "QA Checkpoints", href: "/qa-checkpoints", icon: "CheckSquare" },
          { label: "Punch List", href: "/punch-list", icon: "ClipboardList" },
          { label: "Photo Documentation", href: "/photo-documentation", icon: "Camera" },
        ],
      },
    ],
  },
  {
    section: "Resources",
    icon: "Package",
    items: [
      { label: "Equipment", href: "/equipment", icon: "Package", primary: true },
      { label: "Venues", href: "/venues", icon: "Building" },
      { label: "Artists", href: "/artists", icon: "Music" },
      { label: "Logistics", href: "/logistics", icon: "Truck" },
    ],
    subsections: [
      {
        label: "Resource Management",
        items: [
          { label: "Deliveries", href: "/deliveries", icon: "PackageCheck" },
          { label: "Maintenance", href: "/maintenance", icon: "Wrench" },
          { label: "Catering", href: "/catering", icon: "UtensilsCrossed" },
          { label: "Files", href: "/files", icon: "FileArchive" },
          { label: "Site Access", href: "/site-access", icon: "Key" },
        ],
      },
      {
        label: "Vendors",
        items: [
          { label: "Compare Vendors", href: "/vendors/compare", icon: "GitCompare" },
          { label: "Subcontractors", href: "/subcontractors", icon: "Users" },
          { label: "Permits", href: "/permits", icon: "FileCheck" },
        ],
      },
    ],
  },
  {
    section: "Safety",
    icon: "Shield",
    items: [
      { label: "Safety Dashboard", href: "/safety", icon: "Shield", primary: true },
      { label: "Incidents", href: "/incidents", icon: "AlertTriangle" },
      { label: "Issues", href: "/issues", icon: "AlertCircle" },
      { label: "Weather", href: "/weather", icon: "Cloud" },
    ],
    subsections: [
      {
        label: "Risk Management",
        items: [
          { label: "Risk Register", href: "/risk-register", icon: "FileWarning" },
          { label: "Emergency Plans", href: "/emergency", icon: "Siren" },
          { label: "Weather Contingency", href: "/weather-contingency", icon: "CloudRain" },
          { label: "Backup Plans", href: "/backup-plans", icon: "LifeBuoy" },
        ],
      },
    ],
  },
  {
    section: "Communications",
    icon: "MessageSquare",
    items: [
      { label: "Comms Hub", href: "/communications", icon: "MessageSquare", primary: true },
      { label: "Channels", href: "/channels", icon: "Radio" },
      { label: "Messages", href: "/messages", icon: "Mail" },
      { label: "Stakeholder Portal", href: "/stakeholder-portal", icon: "Users" },
    ],
  },
  {
    section: "Hospitality",
    icon: "Crown",
    items: [
      { label: "VIP Management", href: "/vip-management", icon: "Crown", primary: true },
      { label: "Settlement", href: "/settlement", icon: "DollarSign" },
    ],
  },
  {
    section: "Directory",
    icon: "BookOpen",
    items: [
      { label: "Directory", href: "/directory", icon: "BookOpen", primary: true },
      { label: "Knowledge Base", href: "/knowledge", icon: "Library" },
      { label: "Opportunities", href: "/opportunities", icon: "Target" },
    ],
    subsections: [
      {
        label: "Resources",
        items: [
          { label: "Best Practices", href: "/best-practices", icon: "Lightbulb" },
          { label: "Case Studies", href: "/case-studies", icon: "FileText" },
          { label: "Glossary", href: "/glossary", icon: "Book" },
          { label: "Troubleshooting", href: "/troubleshooting", icon: "HelpCircle" },
          { label: "Spec Sheets", href: "/spec-sheets", icon: "FileSpreadsheet" },
        ],
      },
      {
        label: "Jobs & Bids",
        items: [
          { label: "Mobile Jobs", href: "/opportunities/mobile", icon: "Smartphone" },
          { label: "Proposals", href: "/opportunities/proposals", icon: "FileText" },
          { label: "Bid Portal", href: "/bid-portal", icon: "Gavel" },
          { label: "Win/Loss Analysis", href: "/opportunities/win-loss", icon: "TrendingUp" },
        ],
      },
    ],
  },
  {
    section: "Advancing",
    icon: "ArrowUpRight",
    items: [
      { label: "Advances", href: "/advancing", icon: "ArrowUpRight", primary: true },
      { label: "Catalog", href: "/advancing/catalog", icon: "Grid" },
      { label: "New Request", href: "/advancing/new", icon: "Plus" },
    ],
  },
  {
    section: "Settings",
    icon: "Settings",
    items: [
      { label: "Settings", href: "/settings", icon: "Settings", primary: true },
      { label: "Integrations", href: "/integrations", icon: "Plug" },
      { label: "Offline Mode", href: "/offline", icon: "WifiOff" },
      { label: "Social Amplification", href: "/social-amplification", icon: "Share2" },
    ],
  },
];

// Quick actions for command palette and shortcuts
export const compvssQuickActions = [
  { label: "New Project", href: "/projects/new", icon: "Plus", shortcut: "P" },
  { label: "Assign Crew", href: "/crew/assign", icon: "UserPlus", shortcut: "C" },
  { label: "New Advance", href: "/advancing/new", icon: "Plus", shortcut: "A" },
  { label: "Report Incident", href: "/incidents/new", icon: "AlertTriangle", shortcut: "I" },
  { label: "Search", href: "/search", icon: "Search", shortcut: "/" },
];

// Bottom navigation for mobile (max 5 items)
export const compvssBottomNavigation = [
  { label: "Home", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Crew", href: "/crew", icon: "Users" },
  { label: "Schedule", href: "/schedule", icon: "Calendar" },
  { label: "Safety", href: "/safety", icon: "Shield" },
  { label: "More", href: "/menu", icon: "Menu" },
];

// Landing page anchor navigation (for marketing/overview page)
export const compvssLandingNavigation = [
  { label: "Overview", href: "#top" },
  { label: "Command", href: "#command" },
  { label: "Intake", href: "#intake" },
  { label: "Schedule", href: "#schedule" },
  { label: "Files", href: "#files" },
  { label: "Projects", href: "#projects" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Crew", href: "#crew" },
  { label: "Field", href: "#field" },
  { label: "Show Day", href: "#show" },
  { label: "Directory", href: "#directory" },
  { label: "Knowledge", href: "#knowledge" },
  { label: "Opportunities", href: "#opportunities" },
  { label: "Analytics", href: "#analytics" },
  { label: "Risk", href: "#risk" },
  { label: "Integrations", href: "#integrations" },
  { label: "Workflow", href: "#workflow" },
  { label: "Contact", href: "#cta" },
];

export const compvssRunOfShow = [
  {
    cue: "House Open",
    time: "17:00",
    owner: "Show Call",
    channel: "All",
    notes: "House lights to 75%, background playlist loop",
  },
  {
    cue: "Pre-Show Hype",
    time: "17:45",
    owner: "Lighting",
    channel: "LX",
    notes: "Beam sweep + haze, call FOH for crowd count",
  },
  {
    cue: "Intro VT",
    time: "17:58",
    owner: "Video",
    channel: "VX",
    notes: "Roll package, audio track stems 1-4",
  },
  {
    cue: "Artist On",
    time: "18:00",
    owner: "Stage Mgmt",
    channel: "SM",
    notes: "Trigger pyro standby, clear wing left",
  },
  {
    cue: "Guest Segment",
    time: "19:10",
    owner: "Audio",
    channel: "A1",
    notes: "Switch to lectern RF-B, spotlight 2 follow",
  },
  {
    cue: "Encore",
    time: "21:45",
    owner: "Show Call",
    channel: "All",
    notes: "Confirm curfew, enable confetti sweep",
  },
  {
    cue: "House Close",
    time: "22:05",
    owner: "Guest Ops",
    channel: "GO",
    notes: "Walk-out playlist, open egress routes",
  },
];

export const compvssHero = {
  kicker: "GHXSTSHIP // COMPVSS",
  headline: "Production Operation Spine",
  description:
    "Mission control interface for everything between deal close and doors open: projects, crews, trucks, incidents, and show day telemetry.",
  tags: ["Production", "Crew", "Build & Strike", "Event Ops"],
  status: "BUILD 0.1.0 · INTERNAL",
  cta: "Launch Runbook",
};

export const compvssSignal = {
  highlights: [
    "Project intake + change order workflows drafted",
    "Crew availability + credential matrix defined",
    "Run-of-show builder + cue stack concept locked",
  ],
  indicators: [
    { label: "Live Builds", value: "37", detail: "across festivals, tours, corporate" },
    { label: "Crew Ready", value: "412", detail: "pre-vetted + scheduled" },
    { label: "Risk Flags", value: "5", detail: "tracking weather + compliance" },
  ],
};

export const compvssStats = [
  { label: "Active Projects", value: "37" },
  { label: "Crew Roster", value: "1.8K" },
  { label: "Vendors", value: "240" },
  { label: "Venues", value: "82" },
];

export const compvssCommandPanels = [
  {
    kicker: "Project Intake",
    title: "Production Brief Engine",
    description:
      "Customizable intake wizard captures client requirements, technical riders, and risk envelopes before greenlighting builds.",
    bullets: ["Scope + requirements templates", "Permit + compliance checklist", "Automated approvals"],
  },
  {
    kicker: "Interlocks",
    title: "ATLVS → COMPVSS Handoff",
    description:
      "ATLVS deals instantiate COMPVSS projects with budgets, roles, and asset reservations already linked for zero drift.",
    bullets: ["Budget + change order sync", "Crew payroll + compliance bridge", "Asset readiness telemetry"],
  },
];

export const compvssVendors = [
  {
    name: "Quantum Scenic",
    category: "Fabrication",
    rating: 4.9,
    location: "Brooklyn, NY",
    specialties: ["Scenic", "Automation", "Custom Fabrication"],
    contact: "ops@quantumscenic.com",
  },
  {
    name: "Pulse Audio Group",
    category: "Audio",
    rating: 4.8,
    location: "Los Angeles, CA",
    specialties: ["FOH", "RF Coordination", "Backline"],
    contact: "crew@pulseaudio.com",
  },
  {
    name: "Signal Vision",
    category: "Video",
    rating: 4.7,
    location: "Austin, TX",
    specialties: ["LED", "Cameras", "IMAG"],
    contact: "hello@signalvision.tv",
  },
];

export const compvssVenues = [
  {
    name: "Harbor Dome",
    city: "Seattle, WA",
    capacity: "18K",
    specs: ["Rigging grid 250k lbs", "48x40 stage", "200A shore power"],
    contact: "tech@harbordome.com",
  },
  {
    name: "Sunset Pavilion",
    city: "Phoenix, AZ",
    capacity: "8K",
    specs: ["Open air", "Motor points pre-rigged", "Integrated fiber"],
    contact: "production@sunsetpavilion.com",
  },
  {
    name: "Metropolitan Hall",
    city: "Chicago, IL",
    capacity: "4.5K",
    specs: ["Fly system", "Orchestra pit", "Broadcast tie-lines"],
    contact: "bookings@metropolitanhall.com",
  },
];

export const compvssEmergencyDirectory = [
  {
    region: "NYC Metro",
    contacts: [
      { label: "Medical", details: "Metro EMS · +1 (212) 555-9012" },
      { label: "Fire Marshal", details: "FDNY Special Events · +1 (212) 555-7345" },
      { label: "Police", details: "NYPD Detail · +1 (212) 555-1180" },
    ],
  },
  {
    region: "Los Angeles",
    contacts: [
      { label: "Medical", details: "Cedars EMS · +1 (310) 555-3300" },
      { label: "Fire Marshal", details: "LAFD Film Unit · +1 (213) 555-6642" },
      { label: "Police", details: "LAPD Event Desk · +1 (213) 555-2044" },
    ],
  },
  {
    region: "Austin",
    contacts: [
      { label: "Medical", details: "Travis EMS · +1 (512) 555-7789" },
      { label: "Fire Marshal", details: "AFD Permits · +1 (512) 555-9921" },
      { label: "Police", details: "APD Special Events · +1 (512) 555-1107" },
    ],
  },
];

export const compvssCrewDirectory = [
  {
    name: "Avery Morgan",
    role: "Production Manager",
    skills: ["Logistics", "Budget", "Client Comms"],
    location: "Brooklyn, NY",
    contact: "avery@ghxstship.com",
    availability: "Next open: Jun 24",
  },
  {
    name: "Lena Ortiz",
    role: "Lighting Director",
    skills: ["Lighting", "CAD", "Focus"],
    location: "Austin, TX",
    contact: "lena@ghxstship.com",
    availability: "Booked · blackout Jul 4-6",
  },
  {
    name: "Noah Kim",
    role: "Audio Lead",
    skills: ["FOH", "RF Coordination", "Comms"],
    location: "Los Angeles, CA",
    contact: "noah@ghxstship.com",
    availability: "On tour · returns Jul 1",
  },
  {
    name: "Priya Shah",
    role: "Stage Manager",
    skills: ["Cue Calling", "Hospitality", "Security"],
    location: "Chicago, IL",
    contact: "priya@ghxstship.com",
    availability: "Openings starting Jun 28",
  },
  {
    name: "Miles Grant",
    role: "Rigger",
    skills: ["Automation", "Climbing", "Safety"],
    location: "Nashville, TN",
    contact: "miles@ghxstship.com",
    availability: "Night calls only",
  },
  {
    name: "Sora Tanaka",
    role: "Video Director",
    skills: ["Switching", "Cameras", "Shaders"],
    location: "Seattle, WA",
    contact: "sora@ghxstship.com",
    availability: "Remote + hybrid",
  },
];

export const compvssCrewSkills = [
  "Logistics",
  "Budget",
  "Client Comms",
  "Lighting",
  "CAD",
  "Focus",
  "FOH",
  "RF Coordination",
  "Comms",
  "Cue Calling",
  "Hospitality",
  "Security",
  "Automation",
  "Climbing",
  "Safety",
  "Switching",
  "Cameras",
  "Shaders",
];

export const compvssCrewCallSchedule = [
  {
    id: "call-001",
    date: "2025-06-12",
    location: "Formula Drift · Orlando",
    department: "Lighting",
    callTime: "07:30",
    crew: ["Lena Ortiz", "Miles Grant"],
    status: "confirmed",
    notification: { channel: "SMS", sentAt: "2025-06-10 09:00" },
  },
  {
    id: "call-002",
    date: "2025-06-13",
    location: "Corporate Summit · NYC",
    department: "Audio",
    callTime: "06:00",
    crew: ["Noah Kim"],
    status: "notified",
    notification: { channel: "Email", sentAt: "2025-06-11 08:10" },
    alert: "Awaiting confirmation",
  },
  {
    id: "call-003",
    date: "2025-06-14",
    location: "Stadium Run · Chicago",
    department: "Stage Mgmt",
    callTime: "08:00",
    crew: ["Priya Shah", "Avery Morgan"],
    status: "scheduled",
  },
  {
    id: "call-004",
    date: "2025-06-15",
    location: "Night Market · LA",
    department: "Video",
    callTime: "16:00",
    crew: ["Sora Tanaka"],
    status: "delayed",
    notification: { channel: "Push", sentAt: "2025-06-11 12:45" },
    alert: "Travel hold due to weather",
  },
];

export const compvssCheckIns = [
  {
    id: "ci-001",
    name: "Lena Ortiz",
    role: "Lighting Director",
    department: "Lighting",
    location: "Formula Drift · Orlando",
    scheduled: "07:30",
    actual: "07:18",
    method: "Badge",
    status: "checked-in",
  },
  {
    id: "ci-002",
    name: "Miles Grant",
    role: "Rigger",
    department: "Rigging",
    location: "Formula Drift · Orlando",
    scheduled: "07:30",
    actual: null,
    method: "Mobile",
    status: "pending",
  },
  {
    id: "ci-003",
    name: "Noah Kim",
    role: "Audio Lead",
    department: "Audio",
    location: "Corporate Summit · NYC",
    scheduled: "06:00",
    actual: "06:24",
    method: "QR",
    status: "delayed",
  },
  {
    id: "ci-004",
    name: "Avery Morgan",
    role: "Production Manager",
    department: "Production",
    location: "Stadium Run · Chicago",
    scheduled: "08:00",
    actual: "07:55",
    method: "Badge",
    status: "checked-in",
  },
];

export const compvssRiskProtocols = [
  {
    title: "Risk register + escalation",
    description: "Unified log for issues, SLAs, owners, and mitigation steps spanning project, field, and show ops.",
    bullets: [
      "Critical path impact scoring",
      "Auto-alerts to exec + client channels",
      "Post-mortem tagging + knowledge links",
    ],
  },
  {
    title: "Safety + compliance",
    description: "Union, labor law, and OSHA guardrails built into crew scheduling, credentialing, and site inspections.",
    bullets: [
      "Union + jurisdiction logic",
      "Digital safety walks w/ signatures",
      "Incident + near-miss reporting",
    ],
  },
  {
    title: "Resilience playbooks",
    description: "Weather, power, and contingency workflows with trigger thresholds and predefined backup plans.",
    bullets: [
      "Weather API + threshold alerts",
      "Backup vendor + asset packages",
      "Automated stakeholder comms",
    ],
  },
];

export const compvssIntegrationLinks = [
  {
    title: "ATLVS ↔ COMPVSS",
    description: "Deals graduating in ATLVS spin up COMPVSS with scope, budgets, asset holds, and crew permissions ready to deploy.",
    bullets: [
      "Auto project + budget provisioning",
      "Crew payroll + compliance data loop",
      "Asset incident feedback to ATLVS",
    ],
  },
  {
    title: "COMPVSS ↔ GVTEWAY",
    description: "Production metadata, capacity, and show updates flow to GVTEWAY for guest comms + ticketing accuracy.",
    bullets: [
      "Run-of-show → guest notifications",
      "Venue layout → ticket maps",
      "Incident + delay alerts to guests",
    ],
  },
  {
    title: "Tri-platform analytics",
    description: "Closed-loop reporting: COMPVSS sends settlement + performance data back to ATLVS finance and GVTEWAY CX dashboards.",
    bullets: [
      "Expense + settlement sync",
      "Guest feedback → vendor scoring",
      "Cross-platform KPI tiles",
    ],
  },
];

export const compvssShowConsole = [
  {
    kicker: "Run Sheet",
    title: "Minute-by-minute timeline",
    description:
      "Centralized cue stack with visual timing bars so stage management, lighting, audio, and video teams stay synchronized.",
    bullets: ["Cue ownership + confirmations", "Auto-curfew + encore alerts", "Inline contingency notes"],
  },
  {
    kicker: "Talent Ops",
    title: "Artist + guest logistics",
    description:
      "Check-in, dressing room assignments, hospitality notes, and movement tracking with escalation routing to security and hospitality leads.",
    bullets: ["Badge tier + room access", "Catering + hospitality tracker", "Emergency / medical contact tree"],
  },
  {
    kicker: "Incident Desk",
    title: "Live issue triage",
    description:
      "Multi-channel console for technical issues, safety events, and audience impacts with SLA timers and auto-report generation.",
    bullets: ["Priority tagging + owners", "Broadcast to radios/SMS", "Post-show incident digest"],
  },
];

export const compvssDirectory = [
  {
    title: "Crew network",
    description: "Searchable roster filtered by discipline, credentials, geography, rate, and union status.",
    bullets: ["Skills + certification badges", "Availability + blackout overlay", "Rehire notes + ratings"],
  },
  {
    title: "Vendor + venue graph",
    description: "Curated database of vendors, venues, and emergency partners with performance history and documentation.",
    bullets: ["Technical spec sheets + CAD", "Insurance + COI verification", "Past show scorecards"],
  },
  {
    title: "Emergency services",
    description: "Rapid-access list for medical, safety, security, and municipal contacts tied to each jurisdiction.",
    bullets: ["Geo-aware contact tree", "Permitting authority linkage", "Template brief packets"],
  },
];

export const compvssKnowledgeBase = [
  {
    title: "SOP library",
    description: "Operational checklists, equipment guides, and compliance docs with version history and approvals.",
    bullets: ["Discipline-specific SOPs", "OSHA + safety references", "Downloadable PDF + offline mode"],
  },
  {
    title: "Training hub",
    description: "Video walkthroughs, certification tracks, and quizzes to onboard crew and vendors quickly.",
    bullets: ["Role-based learning paths", "Certification expiry reminders", "Progress analytics"],
  },
  {
    title: "Troubleshooting decks",
    description: "Decision trees and escalation scripts for power, RF, networking, and staging incidents.",
    bullets: ["Scenario-driven playbooks", "Inline chat + annotations", "Auto-sync to incident reports"],
  },
];

export const compvssOpportunities = [
  {
    title: "RFP / RFQ Center",
    description: "Weighted scoring sheets, redline tracking, and collaborative proposal editing with version control.",
    bullets: ["Bid/no-bid decision workflow", "Integrated e-sign + approval routing", "Source-of-truth document locker"],
  },
  {
    title: "Crew + gig board",
    description: "Full-time roles, day-call gigs, and subcontractor postings with automated notifications and messaging.",
    bullets: ["Skill + location matching", "Candidate pipeline + notes", "Offer + onboarding triggers"],
  },
  {
    title: "Partner & internship hub",
    description: "Channel for internships, partnerships, and joint venture opportunities with referral + reward tracking.",
    bullets: ["Referral incentives dashboard", "Collaboration brief templates", "Status + analytics"],
  },
];

export const compvssAnalytics = [
  {
    title: "Executive dashboards",
    description: "Drag-and-drop BI views for project profitability, crew utilization, and asset ROI with scheduled digests.",
    bullets: ["Margin + variance tiles", "Utilization + capacity heatmaps", "Auto-email stakeholder packets"],
  },
  {
    title: "Predictive signals",
    description: "Anomaly detection on budget overrun, weather risk, and staffing gaps using telemetry from ATLVS + GVTEWAY.",
    bullets: ["Risk scoring + alerts", "Scenario modeling", "Cross-platform KPI linking"],
  },
  {
    title: "Data portability",
    description: "Exports, APIs, and warehouse feeds so finance, ops, and partners can query COMPVSS data directly.",
    bullets: ["CSV/Excel/PDF exports", "Looker/Tableau connectors", "Webhook + API access"],
  },
];

export const compvssProjectLanes = [
  {
    id: "projects",
    kicker: "01 — Production Project Management",
    title: "Timeline + Health",
    description:
      "Milestones, dependencies, risk registers, and settlement workflows mapped across every production template.",
    bullets: [
      "Gantt + critical path visualizer",
      "Change order + approval routing",
      "Risk + issue heat mapping with owners",
    ],
  },
  {
    id: "crew",
    kicker: "02 — Team Management",
    title: "Crew Logistics",
    description:
      "Skills, credentials, travel, and per-diem automation to keep every department resourced and compliant.",
    bullets: [
      "Availability calendars + blackout dates",
      "Credential + safety certification tracking",
      "Crew call sheets with notifications",
    ],
  },
  {
    id: "field",
    kicker: "03 — Build & Strike",
    title: "Field Execution",
    description:
      "Load-in choreography, truck sequencing, inspections, and punch list resolution with photographic proof.",
    bullets: [
      "Load-in/load-out sequencing",
      "Equipment check-in/out with scanning",
      "Safety walk-through + QA sign-off",
    ],
  },
  {
    id: "show",
    kicker: "04 — Event Operations",
    title: "Minute-by-Minute Control",
    description:
      "Cue stacks, artist logistics, hospitality, and incident reporting from rehearsal through encore.",
    bullets: [
      "Run-of-show + cue management",
      "VIP/backstage credential tiers",
      "Incident + escalation console",
    ],
  },
  {
    id: "directory",
    kicker: "05 — Directory",
    title: "Vetted Partners",
    description:
      "Searchable roster of crew, vendors, venues, and emergency partners with ratings + verification.",
    bullets: [
      "Vendor + venue scorecards",
      "Specialty + geography filters",
      "Reviews + credential verification",
    ],
  },
  {
    id: "knowledge",
    kicker: "06 — Knowledge Base",
    title: "Operational Intelligence",
    description:
      "SOPs, safety playbooks, training vids, and troubleshooting guides accessible online/offline.",
    bullets: [
      "Template + rider library",
      "Video walkthroughs + certification paths",
      "Decision trees + escalation scripts",
    ],
  },
  {
    id: "opportunities",
    kicker: "07 — Opportunities",
    title: "RFPs + Gigs",
    description:
      "Central board for bids, gigs, careers, and subcontractor opportunities with automated comms.",
    bullets: [
      "RFP submission portal",
      "Gig + shift marketplace",
      "Candidate pipeline + comms",
    ],
  },
];

export const compvssFieldInsights = [
  {
    title: "Load-In Velocity",
    metrics: [
      { label: "Stages Online", value: "6" },
      { label: "Avg Hours", value: "9.5" },
    ],
    description: "Sequenced truck + crew deployment prevents dock congestion across campuses.",
  },
  {
    title: "Safety Status",
    metrics: [
      { label: "Inspections", value: "14" },
      { label: "Open Punches", value: "3" },
    ],
    description: "Digital walk-through logs with geo-stamped photo proof and escalation routes.",
  },
  {
    title: "Asset Turnover",
    metrics: [
      { label: "Kits Deployed", value: "58" },
      { label: "Returns", value: "92%" },
    ],
    description: "Check-in/out + condition reports linked directly to ATLVS asset registry.",
  },
];

export const compvssWorkflowTimeline = [
  {
    label: "01",
    title: "Deal → Production Brief",
    description: "ATLVS deal closure triggers COMPVSS intake, scope reconciliation, and resource reservation.",
    tags: ["ATLVS", "COMPVSS"],
  },
  {
    label: "02",
    title: "Crew + Asset Sync",
    description: "Availability, credentials, and asset telemetry sync into the build schedule with conflict detection.",
    tags: ["Crew", "Assets"],
  },
  {
    label: "03",
    title: "Field Execution",
    description: "Truck calls, build phases, QA checkpoints, and incident reporting tracked in real time.",
    tags: ["Build & Strike"],
  },
  {
    label: "04",
    title: "Show Day Broadcast",
    description: "Run-of-show updates push to GVTEWAY guest comms while control room tracks cues + issues.",
    tags: ["COMPVSS", "GVTEWAY"],
  },
  {
    label: "05",
    title: "Settlement + Intelligence",
    description: "Post-show settlement, expense reconciliation, and lessons learned fed back to ATLVS analytics.",
    tags: ["Finance", "Analytics"],
  },
];

export const compvssFinalCta = {
  kicker: "Command the field",
  title: "Activate COMPVSS mission control",
  description:
    "Deploy the complete production operating system for crews, vendors, and show callers across every GHXSTSHIP activation.",
  primary: {
    label: "Schedule Production Review",
    href: "#",
  },
  secondary: {
    label: "Download Runbook",
    href: "#",
  },
};

export type ProjectIntakeRecord = {
  id: string;
  name: string;
  client: string;
  venue: string;
  window: string;
  owner: string;
  budget: string;
  risk: "Low" | "Medium" | "High";
  status: "Intake" | "Scheduled" | "Tracking" | "Closeout";
};

export const compvssProjectIntakeQueue: ProjectIntakeRecord[] = [
  {
    id: "orbit-run",
    name: "Orbit Runway Showcase",
    client: "Formula Drift",
    venue: "Orlando Speedway",
    window: "Jun 12 → Jun 18",
    owner: "Production Ops",
    budget: "$1.8M",
    risk: "Medium",
    status: "Intake",
  },
  {
    id: "northstar",
    name: "Northstar Corporate Summit",
    client: "Polar Dynamics",
    venue: "Pier 17 NYC",
    window: "Jun 24 → Jun 27",
    owner: "Corporate Live",
    budget: "$940K",
    risk: "Low",
    status: "Scheduled",
  },
  {
    id: "afterglow",
    name: "Afterglow Tour",
    client: "Helio Entertainment",
    venue: "Multi-city",
    window: "Jul 03 → Aug 11",
    owner: "Touring",
    budget: "$6.5M",
    risk: "High",
    status: "Tracking",
  },
];

export type SchedulePhaseStatus = "planned" | "in-progress" | "blocked" | "complete";

type SchedulePhase = {
  name: string;
  start: string;
  end: string;
  owner: string;
  status: SchedulePhaseStatus;
  progress: number;
  dependencies?: string[];
};

export const compvssScheduleTracks: Array<{
  id: string;
  dateLabel: string;
  location: string;
  phases: SchedulePhase[];
}> = [
  {
    id: "day-1",
    dateLabel: "Jun 12 · Load-in",
    location: "Formula Drift · Orlando",
    phases: [
      {
        name: "Advance brief",
        start: "07:00",
        end: "08:00",
        owner: "Production",
        status: "complete",
        progress: 100,
      },
      {
        name: "Rigging & grid",
        start: "08:30",
        end: "13:00",
        owner: "Rigging",
        status: "in-progress",
        progress: 68,
        dependencies: ["Advance brief"],
      },
      {
        name: "Audio deployment",
        start: "09:00",
        end: "15:00",
        owner: "Audio",
        status: "planned",
        progress: 15,
      },
      {
        name: "Lighting focus",
        start: "14:00",
        end: "18:00",
        owner: "Lighting",
        status: "planned",
        progress: 5,
      },
    ],
  },
  {
    id: "day-2",
    dateLabel: "Jun 13 · Tech",
    location: "Formula Drift · Orlando",
    phases: [
      {
        name: "Video walls",
        start: "07:30",
        end: "11:30",
        owner: "Video",
        status: "in-progress",
        progress: 54,
      },
      {
        name: "FOH calibration",
        start: "12:00",
        end: "15:00",
        owner: "Audio",
        status: "planned",
        progress: 0,
        dependencies: ["Video walls"],
      },
      {
        name: "Client walk-through",
        start: "16:00",
        end: "17:00",
        owner: "Account",
        status: "blocked",
        progress: 0,
        dependencies: ["FOH calibration"],
      },
      {
        name: "Cue to cue",
        start: "18:00",
        end: "20:00",
        owner: "Stage Mgmt",
        status: "planned",
        progress: 0,
      },
    ],
  },
  {
    id: "day-3",
    dateLabel: "Jun 14 · Show",
    location: "Formula Drift · Orlando",
    phases: [
      {
        name: "Doors open",
        start: "17:00",
        end: "17:45",
        owner: "Guest Ops",
        status: "planned",
        progress: 0,
      },
      {
        name: "Run of show",
        start: "18:00",
        end: "22:00",
        owner: "Show Call",
        status: "planned",
        progress: 0,
      },
      {
        name: "Strike",
        start: "22:30",
        end: "02:00",
        owner: "Build & Strike",
        status: "planned",
        progress: 0,
      },
    ],
  },
];

export type FileStatus = "Pending QA" | "Approved" | "Needs Revision";

export type FileVaultEntry = {
  id: string;
  filename: string;
  type: string;
  owner: string;
  department: string;
  status: FileStatus;
  updatedAt: string;
};

export const compvssFileVaultEntries: FileVaultEntry[] = [
  {
    id: "spec-pack",
    filename: "Formula-Drift-Specs.pdf",
    type: "Technical Rider",
    owner: "Priya Shah",
    department: "Stage Mgmt",
    status: "Approved",
    updatedAt: "2025-06-08 14:32",
  },
  {
    id: "safety-deck",
    filename: "Night-Market-SafetyPlan.docx",
    type: "Safety",
    owner: "Miles Grant",
    department: "Rigging",
    status: "Pending QA",
    updatedAt: "2025-06-09 09:12",
  },
  {
    id: "vendor-coi",
    filename: "Quantum-Scenic-COI.pdf",
    type: "Insurance",
    owner: "Avery Morgan",
    department: "Assets",
    status: "Needs Revision",
    updatedAt: "2025-06-07 18:44",
  },
];
