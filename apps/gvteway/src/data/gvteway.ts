// Consumer-facing navigation for the root experience
export const gvtewayNavigation = [
  { label: "Events", href: "/events" },
  { label: "Tickets", href: "/tickets" },
  { label: "Artists", href: "/artists" },
  { label: "Venues", href: "/venues" },
  { label: "Community", href: "/community" },
];

// Creator/Organizer SaaS landing page navigation (anchor links)
export const gvtewayCreatorNavigation = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Roadmap", href: "#roadmap" },
];

// Membership landing page navigation (minimal, exclusive positioning)
export const gvtewayMembershipNavigation = [
  { label: "Membership", href: "#membership" },
  { label: "Experiences", href: "/experiences" },
];

// Sidebar navigation for authenticated users
// Optimized for UX: Consumer-focused journey with clear primary actions
export const gvtewaySidebarNavigation = [
  {
    section: "Discover",
    icon: "Compass",
    items: [
      { label: "Browse Events", href: "/events", icon: "Calendar", primary: true },
      { label: "Search", href: "/search", icon: "Search" },
      { label: "Artists", href: "/artists", icon: "Music" },
      { label: "Venues", href: "/venues", icon: "MapPin" },
      { label: "Near Me", href: "/nearby", icon: "Navigation" },
    ],
    subsections: [
      {
        label: "Explore More",
        items: [
          { label: "Browse All", href: "/browse", icon: "Compass" },
          { label: "Map View", href: "/map", icon: "Map" },
          { label: "New Events", href: "/new-events", icon: "Sparkles" },
          { label: "Tours", href: "/tours", icon: "Route" },
          { label: "Destinations", href: "/destinations", icon: "Plane" },
          { label: "Packages", href: "/packages", icon: "Package" },
          { label: "Discovery Quiz", href: "/discover/quiz", icon: "HelpCircle" },
          { label: "Universal Search", href: "/search/universal", icon: "Globe" },
        ],
      },
    ],
  },
  {
    section: "My Tickets",
    icon: "Ticket",
    items: [
      { label: "All Tickets", href: "/tickets", icon: "Ticket", primary: true },
      { label: "My Events", href: "/my-events", icon: "CalendarCheck" },
      { label: "Orders", href: "/orders", icon: "ShoppingBag" },
      { label: "Calendar", href: "/calendar", icon: "Calendar" },
    ],
    subsections: [
      {
        label: "Ticket Actions",
        items: [
          { label: "Transfer Tickets", href: "/tickets/transfer", icon: "ArrowRightLeft" },
          { label: "Gift Tickets", href: "/tickets/gift", icon: "Gift" },
          { label: "Group Tickets", href: "/tickets/groups", icon: "Users" },
          { label: "Track Delivery", href: "/tickets/tracking", icon: "Truck" },
          { label: "Print at Home", href: "/tickets/print-at-home", icon: "Printer" },
          { label: "Resale", href: "/resale", icon: "RefreshCw" },
          { label: "Groups", href: "/groups", icon: "Users" },
        ],
      },
      {
        label: "History",
        items: [
          { label: "Order History", href: "/orders/history", icon: "History" },
          { label: "Urgency Alerts", href: "/tickets/urgency", icon: "Clock" },
        ],
      },
    ],
  },
  {
    section: "Community",
    icon: "Users",
    items: [
      { label: "Community", href: "/community", icon: "Users", primary: true },
      { label: "Friends", href: "/friends", icon: "Users" },
      { label: "Reviews", href: "/reviews", icon: "Star" },
      { label: "Social", href: "/social", icon: "Share2" },
    ],
    subsections: [
      {
        label: "Connect",
        items: [
          { label: "Forums", href: "/forums", icon: "MessageCircle" },
          { label: "Watch Parties", href: "/watch-parties", icon: "Video" },
          { label: "Q&A Sessions", href: "/qa-sessions", icon: "MessageSquare" },
          { label: "Fan Clubs", href: "/fan-clubs", icon: "Heart" },
          { label: "Match Fans", href: "/match", icon: "Sparkles" },
          { label: "Activity Feed", href: "/activity", icon: "Activity" },
        ],
      },
      {
        label: "Content",
        items: [
          { label: "Photos", href: "/photos", icon: "Image" },
          { label: "User Content", href: "/ugc", icon: "Camera" },
          { label: "Exclusive Content", href: "/content", icon: "FileText" },
        ],
      },
    ],
  },
  {
    section: "Rewards",
    icon: "Gift",
    items: [
      { label: "Rewards", href: "/rewards", icon: "Gift", primary: true },
      { label: "Membership", href: "/membership", icon: "Crown" },
      { label: "Referrals", href: "/referrals", icon: "UserPlus" },
      { label: "Deals", href: "/deals", icon: "Percent" },
    ],
    subsections: [
      {
        label: "Benefits",
        items: [
          { label: "Member Benefits", href: "/membership/benefits", icon: "Gift" },
          { label: "Gift Cards", href: "/gift-cards", icon: "CreditCard" },
        ],
      },
    ],
  },
  {
    section: "Shop",
    icon: "ShoppingBag",
    items: [
      { label: "Merch Store", href: "/merch", icon: "ShoppingCart", primary: true },
      { label: "Cart", href: "/cart", icon: "ShoppingCart" },
      { label: "Bundles", href: "/merch/bundles", icon: "Package" },
    ],
    subsections: [
      {
        label: "Checkout",
        items: [
          { label: "Checkout", href: "/checkout", icon: "CreditCard" },
          { label: "Currency", href: "/checkout/currency", icon: "DollarSign" },
          { label: "Shoppable Posts", href: "/shop/shoppable", icon: "ShoppingBag" },
        ],
      },
    ],
  },
  {
    section: "Account",
    icon: "User",
    items: [
      { label: "Profile", href: "/profile", icon: "User", primary: true },
      { label: "Wallet", href: "/wallet", icon: "Wallet" },
      { label: "Wishlist", href: "/wishlist", icon: "Heart" },
      { label: "Favorites", href: "/favorites", icon: "Heart" },
    ],
    subsections: [
      {
        label: "Profile",
        items: [
          { label: "Badges", href: "/profile/badges", icon: "Award" },
          { label: "Reputation", href: "/profile/reputation", icon: "Star" },
          { label: "Saved Searches", href: "/saved-searches", icon: "Bookmark" },
          { label: "Price Alerts", href: "/price-alerts", icon: "Bell" },
          { label: "Offline Wallet", href: "/wallet/offline", icon: "WifiOff" },
        ],
      },
    ],
  },
  {
    section: "Help",
    icon: "HelpCircle",
    items: [
      { label: "Help Center", href: "/help", icon: "HelpCircle", primary: true },
      { label: "Support Chat", href: "/support/chat", icon: "MessageCircle" },
      { label: "Accessibility", href: "/accessibility", icon: "Accessibility" },
    ],
    subsections: [
      {
        label: "Support",
        items: [
          { label: "Lost & Found", href: "/lost-found", icon: "Search" },
          { label: "Directions", href: "/directions", icon: "Navigation" },
          { label: "Messages", href: "/messages", icon: "Mail" },
          { label: "Notifications", href: "/notifications", icon: "Bell" },
        ],
      },
      {
        label: "Settings",
        items: [
          { label: "Settings", href: "/settings", icon: "Settings" },
          { label: "Privacy", href: "/settings/privacy", icon: "Lock" },
          { label: "Language", href: "/settings/language", icon: "Globe" },
          { label: "Notification Preferences", href: "/settings/notifications", icon: "Bell" },
        ],
      },
    ],
  },
];

// Quick actions for consumers
export const gvtewayQuickActions = [
  { label: "Find Events", href: "/events", icon: "Search", shortcut: "E" },
  { label: "My Tickets", href: "/tickets", icon: "Ticket", shortcut: "T" },
  { label: "Cart", href: "/cart", icon: "ShoppingCart", shortcut: "C" },
  { label: "Search", href: "/search", icon: "Search", shortcut: "/" },
];

// Bottom navigation for mobile (max 5 items) - Consumer-focused
export const gvtewayBottomNavigation = [
  { label: "Events", href: "/events", icon: "Calendar" },
  { label: "Tickets", href: "/tickets", icon: "Ticket" },
  { label: "Search", href: "/search", icon: "Search" },
  { label: "Rewards", href: "/rewards", icon: "Gift" },
  { label: "Profile", href: "/profile", icon: "User" },
];

// Admin navigation for event organizers
export const gvtewayAdminNavigation = [
  {
    section: "Event Management",
    items: [
      { label: "Create Event", href: "/events/create", icon: "Plus" },
      { label: "Clone Event", href: "/events/clone", icon: "Copy" },
      { label: "Templates", href: "/events/templates", icon: "FileText" },
      { label: "Compare Events", href: "/events/compare", icon: "GitCompare" },
    ],
  },
  {
    section: "Marketing",
    items: [
      { label: "Analytics", href: "/marketing/analytics", icon: "BarChart" },
      { label: "A/B Testing", href: "/marketing/ab-testing", icon: "Split" },
      { label: "Early Bird", href: "/marketing/early-bird", icon: "Clock" },
      { label: "Influencers", href: "/marketing/influencers", icon: "Users" },
      { label: "Pixels", href: "/marketing/pixels", icon: "Code" },
      { label: "Media Kit", href: "/marketing/media-kit", icon: "FileText" },
    ],
  },
  {
    section: "Social Management",
    items: [
      { label: "Social Dashboard", href: "/social", icon: "Share2" },
      { label: "Inbox", href: "/social/inbox", icon: "Inbox" },
      { label: "Sentiment", href: "/social/sentiment", icon: "TrendingUp" },
      { label: "Story Templates", href: "/social/story-templates", icon: "Image" },
      { label: "TikTok Challenges", href: "/social/tiktok-challenges", icon: "Video" },
      { label: "Crisis Management", href: "/social/crisis-management", icon: "AlertTriangle" },
    ],
  },
  {
    section: "Admin Tools",
    items: [
      { label: "Integrations", href: "/admin/integrations", icon: "Plug" },
      { label: "Moderation", href: "/moderate", icon: "Shield" },
      { label: "Admin Moderation", href: "/admin/moderation", icon: "Shield" },
      { label: "Promo Codes", href: "/admin/promo-codes", icon: "Tag" },
      { label: "Anti-Scalping", href: "/admin/anti-scalping", icon: "ShieldOff" },
      { label: "Will Call", href: "/admin/will-call", icon: "ClipboardList" },
      { label: "POS", href: "/admin/pos", icon: "Monitor" },
      { label: "Cashless", href: "/admin/pos/cashless", icon: "CreditCard" },
      { label: "Inventory Sync", href: "/admin/inventory-sync", icon: "RefreshCw" },
      { label: "Sales Reporting", href: "/admin/sales-reporting", icon: "BarChart" },
      { label: "Content Calendar", href: "/admin/content-calendar", icon: "Calendar" },
      { label: "Contests", href: "/admin/contests", icon: "Trophy" },
      { label: "SMS Marketing", href: "/admin/marketing/sms", icon: "MessageSquare" },
      { label: "Early Bird Pricing", href: "/admin/pricing/early-bird", icon: "Clock" },
    ],
  },
  {
    section: "Community Admin",
    items: [
      { label: "Community", href: "/community", icon: "Users" },
      { label: "Challenges", href: "/community/challenges", icon: "Target" },
      { label: "Fan Content", href: "/community/fan-content", icon: "Heart" },
      { label: "Guidelines", href: "/community/guidelines", icon: "FileText" },
      { label: "Polls", href: "/community/polls", icon: "BarChart2" },
    ],
  },
];

// Landing page anchor navigation (for marketing/overview page)
export const gvtewayLandingNavigation = [
  { label: "Overview", href: "#top" },
  { label: "Event Stack", href: "#event-stack" },
  { label: "Seating", href: "#seating" },
  { label: "Event Creation", href: "#event-creation" },
  { label: "Ticketing", href: "#ticketing" },
  { label: "Mobile Tickets", href: "#mobile-tickets" },
  { label: "Revenue", href: "#revenue" },
  { label: "Payouts", href: "#reconciliation" },
  { label: "Commerce", href: "#commerce" },
  { label: "Guest", href: "#guest" },
  { label: "Community", href: "#community" },
  { label: "Social", href: "#social" },
  { label: "Discovery", href: "#discovery" },
  { label: "Automation", href: "#automation" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Integrations", href: "#integrations" },
];

export const gvtewayEmailNotifications = {
  status: "active",
  provider: "Resend",
  checklist: [
    "Checkout confirmation email",
    "Fallback logging when provider missing",
    "HTML receipt with order summary",
  ],
  cta: "Send test confirmation",
};

export type SeatingNode = {
  id: string;
  label: string;
  capacity: number;
  availability: number;
  perks: string[];
  priceRange: string;
  access: string;
};

export const gvtewaySeatingBlueprint: SeatingNode[] = [
  {
    id: "grid-a",
    label: "Command Deck",
    capacity: 220,
    availability: 112,
    perks: ["Concierge lane", "Chef tasting", "Private bar"],
    priceRange: "$$$",
    access: "VIP",
  },
  {
    id: "grid-b",
    label: "Immersion Floor",
    capacity: 800,
    availability: 468,
    perks: ["Projection tunnels", "Merch voucher"],
    priceRange: "$$",
    access: "GA",
  },
  {
    id: "grid-c",
    label: "Ultra Ghost Row",
    capacity: 40,
    availability: 12,
    perks: ["Backstage roam", "Creator meet"],
    priceRange: "$$$$",
    access: "Ultra",
  },
  {
    id: "grid-d",
    label: "Studio Suites",
    capacity: 18,
    availability: 6,
    perks: ["Boardroom console", "Dedicated runner"],
    priceRange: "$$$$",
    access: "Legend",
  },
];

export const MAX_TICKETS_PER_ORDER = 8;

export type GvtewayEvent = {
  id: string;
  slug: string;
  title: string;
  headliner: string;
  venue: string;
  city: string;
  startDate: string;
  status: "draft" | "on-sale" | "sold-out";
  currency: "usd";
  genres: string[];
  priceRange: "$" | "$$" | "$$$";
  isTrending: boolean;
  isNew: boolean;
  hasLastMinuteOffers: boolean;
  friendsAttending: number;
  distanceMiles: number;
  tourStops: string[];
  experienceTags: string[];
};

export const gvtewayMobileTickets = [
  {
    id: "mt-001",
    attendee: "Naiomi Verge",
    eventId: "event-ghxstship-miami-2025",
    ticketTypeId: "ticket-miami-vip",
    entryWindow: "Doors 18:30 · VIP lane",
    access: "Command Deck",
    seat: "Zone A · Pod 3",
    issuedAt: "2025-07-01T10:05:00-04:00",
    status: "active",
    qrData: "GVTEWAY|mt-001|2025-07-12T19:00:00-04:00",
  },
  {
    id: "mt-002",
    attendee: "Jalen Cross",
    eventId: "event-sound-lab-la-2025",
    ticketTypeId: "ticket-miami-ga",
    entryWindow: "Doors 20:30",
    access: "Immersion Floor",
    seat: "Free Roam",
    issuedAt: "2025-05-15T09:12:00-07:00",
    status: "active",
    qrData: "GVTEWAY|mt-002|2025-06-01T21:00:00-07:00",
  },
  {
    id: "mt-003",
    attendee: "Sera Molina",
    eventId: "event-aurora-tour-2025",
    ticketTypeId: "ticket-miami-ultra",
    entryWindow: "Check-in 17:45",
    access: "Ultra Backstage",
    seat: "Escort · Trackside",
    issuedAt: "2025-05-05T08:45:00-05:00",
    status: "revoked",
    qrData: "GVTEWAY|mt-003|2025-05-18T19:30:00-05:00",
  },
];

export type TicketTier = "ga" | "vip" | "ultra";

export type TicketType = {
  id: string;
  eventId: string;
  name: string;
  tier: TicketTier;
  priceCents: number;
  serviceFeeCents: number;
  currency: "usd";
  quantity: number;
  sold: number;
  description: string;
  metadata?: Record<string, string>;
};

export const gvtewayEvents: GvtewayEvent[] = [
  {
    id: "event-ghxstship-miami-2025",
    slug: "ghxstship-miami-2025",
    title: "GHXSTSHIP // Miami Immersion",
    headliner: "GHXSTSHIP Collective",
    venue: "Harbour Terminal",
    city: "Miami, FL",
    startDate: "2025-07-12T19:00:00-04:00",
    status: "on-sale",
    currency: "usd",
    genres: ["Immersive", "Electronic", "Art"],
    priceRange: "$$$",
    isTrending: true,
    isNew: false,
    hasLastMinuteOffers: true,
    friendsAttending: 18,
    distanceMiles: 43,
    tourStops: ["Miami", "New York", "Austin"],
    experienceTags: ["Flash Sale", "VIP", "Projection"],
  },
  {
    id: "event-ghxstship-nyc-2025",
    slug: "ghxstship-nyc-2025",
    title: "GHXSTSHIP // NYC Vanguard Week",
    headliner: "Vanguard Ensemble",
    venue: "Brooklyn Navy Yard",
    city: "New York, NY",
    startDate: "2025-09-05T20:00:00-04:00",
    status: "draft",
    currency: "usd",
    genres: ["Avant-garde", "Immersive"],
    priceRange: "$$",
    isTrending: true,
    isNew: true,
    hasLastMinuteOffers: false,
    friendsAttending: 9,
    distanceMiles: 0,
    tourStops: ["New York", "Toronto"],
    experienceTags: ["New", "Editor Pick"],
  },
  {
    id: "event-sound-lab-la-2025",
    slug: "sound-lab-los-angeles-2025",
    title: "Sound Lab: Neon Echo",
    headliner: "Neon Echo",
    venue: "Lotus Warehouse",
    city: "Los Angeles, CA",
    startDate: "2025-06-01T21:00:00-07:00",
    status: "on-sale",
    currency: "usd",
    genres: ["Electronic", "Multi-sensory"],
    priceRange: "$$",
    isTrending: false,
    isNew: true,
    hasLastMinuteOffers: true,
    friendsAttending: 5,
    distanceMiles: 2450,
    tourStops: ["Los Angeles"],
    experienceTags: ["Near Me", "Last Minute"],
  },
  {
    id: "event-aurora-tour-2025",
    slug: "aurora-tour-2025",
    title: "Aurora Pulse Tour",
    headliner: "Aurora Pulse",
    venue: "Various",
    city: "Multi-City",
    startDate: "2025-05-18T19:30:00-05:00",
    status: "on-sale",
    currency: "usd",
    genres: ["Synthwave", "Tour"],
    priceRange: "$",
    isTrending: false,
    isNew: false,
    hasLastMinuteOffers: false,
    friendsAttending: 14,
    distanceMiles: 12,
    tourStops: ["Atlanta", "Charlotte", "Chicago", "Seattle"],
    experienceTags: ["Tour", "Multi-City"],
  },
];

export const gvtewayReconciliationInsights = {
  stats: [
    { label: "Net Payout (24h)", value: "$482K", delta: "+4.2% WoW" },
    { label: "Variance Threshold", value: "0.35%", delta: "Target < 0.5%" },
    { label: "Open Investigations", value: "2", delta: "1 high priority" },
  ],
  payouts: [
    {
      id: "run-2025-11-02",
      date: "2025-11-02",
      window: "00:00 – 23:59 ET",
      gross: "$612K",
      fees: "$38K",
      refunds: "$14K",
      net: "$560K",
      status: "cleared",
      variance: "+0.2%",
    },
    {
      id: "run-2025-11-01",
      date: "2025-11-01",
      window: "00:00 – 23:59 ET",
      gross: "$534K",
      fees: "$34K",
      refunds: "$18K",
      net: "$482K",
      status: "cleared",
      variance: "-0.1%",
    },
    {
      id: "run-2025-10-31",
      date: "2025-10-31",
      window: "00:00 – 23:59 ET",
      gross: "$448K",
      fees: "$29K",
      refunds: "$26K",
      net: "$393K",
      status: "investigating",
      variance: "+0.8%",
    },
  ],
  alerts: [
    {
      id: "variance-alert-312",
      label: "Variance Escalation",
      detail: "GVTEWAY → ATLVS ledger delta above 0.5% for Miami Immersion cost center.",
      owner: "Finance Ops",
      severity: "high",
    },
    {
      id: "payout-delay-118",
      label: "Delayed Payout",
      detail: "Stripe balance transfer awaiting tax ID confirmation for EU marketplace." ,
      owner: "Compliance",
      severity: "medium",
    },
  ],
};

export const gvtewayTicketTypes: TicketType[] = [
  {
    id: "ticket-miami-ga",
    eventId: "event-ghxstship-miami-2025",
    name: "GA Immersion",
    tier: "ga",
    priceCents: 19000,
    serviceFeeCents: 1500,
    currency: "usd",
    quantity: 800,
    sold: 320,
    description: "Main floor access, projection tunnels, and baseline merch voucher.",
    metadata: { access_window: "standard", badge: "GA" },
  },
  {
    id: "ticket-miami-vip",
    eventId: "event-ghxstship-miami-2025",
    name: "VIP Command Deck",
    tier: "vip",
    priceCents: 42000,
    serviceFeeCents: 2500,
    currency: "usd",
    quantity: 220,
    sold: 110,
    description: "Raised deck seating, concierge lane, limited-edition merch drop.",
    metadata: { access_window: "vip", badge: "VIP" },
  },
  {
    id: "ticket-miami-ultra",
    eventId: "event-ghxstship-miami-2025",
    name: "Ultra // Backstage Ghost",
    tier: "ultra",
    priceCents: 82000,
    serviceFeeCents: 4700,
    currency: "usd",
    quantity: 40,
    sold: 12,
    description: "Backstage roam, meet the creators, and concierge transport.",
    metadata: { access_window: "all", badge: "ULTRA" },
  },
];

export function getEventById(eventId: string) {
  return gvtewayEvents.find((event) => event.id === eventId);
}

export function getTicketTypeById(ticketTypeId: string) {
  return gvtewayTicketTypes.find((ticket) => ticket.id === ticketTypeId);
}

export function getTicketAvailability(ticketTypeId: string) {
  const ticket = getTicketTypeById(ticketTypeId);
  if (!ticket) {
    return 0;
  }
  return Math.max(0, ticket.quantity - ticket.sold);
}

export function adjustTicketSales(ticketTypeId: string, delta: number) {
  const ticket = getTicketTypeById(ticketTypeId);

  if (!ticket) {
    return null;
  }

  ticket.sold = Math.min(ticket.quantity, Math.max(0, ticket.sold + delta));
  return ticket;
}

export const gvtewayHero = {
  kicker: "Consumer Experience Platform",
  headline: "GVTEWAY",
  subhead: "Ticketing, memberships, commerce, and community wrapped in a monochrome sensory system for GHXSTSHIP experiences.",
  status: "ALPHA ∙ ROADMAP IN PROGRESS",
  ctaPrimary: "Join the waitlist",
  ctaSecondary: "View ecosystem",
  stats: [
    { label: "Ticket + Membership Models", value: "27" },
    { label: "Marketplace Touchpoints", value: "63" },
    { label: "Experience Taxonomy", value: "312" },
  ],
};

export const gvtewayEventBlueprint = [
  {
    title: "Event Management",
    description:
      "Guided creation wizards, venue intelligence, and promoter/artist collaboration spaces keep every listing audit-ready.",
    bullets: [
      "Event templates spanning concerts, festivals, experiential",
      "Dynamic seating + VIP zoning",
      "Capacity, ADA, and weather policy controls",
      "Series + season orchestration",
    ],
  },
  {
    title: "Marketing + Sales",
    description:
      "Drag-and-drop landing pages, paid + organic channel orchestration, and attribution dashboards calibrated for conversion velocity.",
    bullets: [
      "Landing page builder + countdowns",
      "SEO + social syndication",
      "Referral + affiliate infrastructure",
      "Demand-based dynamic pricing",
    ],
  },
  {
    title: "Ticketing & Memberships",
    description:
      "Multi-tier ticket classes, bundles, and loyalty constructs align with the roadmap's anti-scalping, P2P transfer, and payments requirements.",
    bullets: [
      "GA, reserved, VIP, platinum tiers",
      "Bundles + subscription passes",
      "NFT + wallet delivery options",
      "Refunds, waitlists, resale guardrails",
    ],
  },
];

export const gvtewayDiscoveryStreams = [
  {
    title: "Search & Filters",
    bullets: [
      "Universal search across events, artists, venues, genres",
      "Advanced filters for date, location, genre, price, capacity",
      "Interactive map and calendar views",
      "Saved searches with alerts and price triggers",
    ],
  },
  {
    title: "Personalization",
    bullets: [
      "AI-powered recommendations and \"Because you liked\" logic",
      "Friends' activity feed plus social graph integration",
      "Follow artists/venues with instant notifications",
      "Curated collections, trending, and destination spotlights",
    ],
  },
  {
    title: "Commerce Signals",
    bullets: [
      "Flash sales, last-minute deals, and multi-city bundles",
      "Travel + experience packaging recommendations",
      "Discovery quiz with preference matching",
      "Voice and visual search hooks for on-the-go planning",
    ],
  },
];

export const gvtewayAutomationProgram = [
  {
    title: "Zapier",
    description:
      "OAuth-secured listing with 12+ triggers, 10+ actions, search endpoints, and usage analytics for certification.",
    bullets: [
      "Triggers for deals, invoices, crew assignments, ticket sales, guest feedback, asset alerts",
      "Actions for creating deals, issuing POs, notifying guests, logging payments",
      "Search actions (contacts, deals, assets, events) for dynamic lookups",
      "Sample Zaps covering ATLVS→Slack, GVTEWAY→Mailchimp, COMPVSS→Jira",
    ],
  },
  {
    title: "Make (Integromat)",
    description: "Scenario templates spanning Finance Ops, Production Ops, and Guest Marketing with hardened error handling.",
    bullets: [
      "Iterator-friendly endpoints supporting 10k record syncs",
      "Secure HMAC webhooks + timestamp validation",
      "JSON schema bundles and throttling guidance",
      "Enterprise pilot prior to GA release",
    ],
  },
  {
    title: "n8n Blueprint",
    description: "Official GHXSTSHIP node package with TS typings, helper nodes, and reference workflows.",
    bullets: [
      "Trigger + regular nodes across ATLVS / COMPVSS / GVTEWAY",
      "Helpers for webhook verification + pagination cursors",
      "Eight reference workflows (maintenance loop, ticket escalation, VIP concierge, etc.)",
      "Self-hosted env templates + regression tests",
    ],
  },
];

export const gvtewayStripePlan = [
  {
    step: "Account & Keys",
    detail: "Confirm production ownership, create restricted keys per environment, store secrets securely.",
  },
  {
    step: "Catalog Mapping",
    detail: "Map events, ticket types, and add-ons to Stripe Products/Prices with metadata and tax behavior.",
  },
  {
    step: "Checkout Flow",
    detail: "Server-side Checkout Session creation with Apple/Google Pay, inventory validation, and anti-bot guards.",
  },
  {
    step: "Webhooks & Orders",
    detail: "Handle checkout.session + payment_intent events, persist orders, trigger ATLVS financial syncs.",
  },
  {
    step: "Refunds & Disputes",
    detail: "Admin-triggered refunds via Stripe API, dispute SLAs, and notification routing to finance/legal.",
  },
  {
    step: "Reconciliation",
    detail: "Nightly balance transaction pulls with dashboard widgets for gross/net sales and payout schedules.",
  },
  {
    step: "Compliance",
    detail: "Rate-limited endpoints, webhook monitoring, PCI scope documentation, and Sentry/New Relic alerting.",
  },
];

export const gvtewayDevelopmentPhases = [
  {
    phase: "Phase 1 — Foundation (Months 1-6)",
    focus: "Event creation, basic ticketing, payment processing, and listings.",
    bullets: [
      "Event creation wizard + listing pages",
      "Stripe checkout + payment flows",
      "Mobile tickets (QR) + basic notifications",
      "Infra: auth, DB, file storage, CDN",
    ],
  },
  {
    phase: "Phase 2 — Enhancement (Months 7-12)",
    focus: "Memberships, advanced marketing, merch, fan profiles.",
    bullets: [
      "Membership + subscription system",
      "Advanced marketing + email tooling",
      "Social media integrations + merch store",
      "Fan profiles, preferences, loyalty",
    ],
  },
  {
    phase: "Phase 3 — Scale (Year 2)",
    focus: "Secondary market, VR/AR, live streaming, enterprise readiness.",
    bullets: [
      "Secondary marketplace + NFT rails",
      "VR/AR previews + live streaming hooks",
      "Gamification + social commerce",
      "Enterprise SSO, compliance, multi-tenant",
    ],
  },
  {
    phase: "Phase 4 — Dominance (Year 2-3)",
    focus: "AI-driven discovery, global expansion, ecosystem.",
    bullets: [
      "AI demand forecasting + trend detection",
      "Blockchain + biometric access pilots",
      "Global payments + localization",
      "Public API marketplace + third-party app store",
    ],
  },
];

export const gvtewayTicketingStack = [
  {
    title: "Access & Packaging",
    description:
      "Ticket archetypes, bundles, and memberships mirror the roadmap's demand-gen strategy across GA, premium, and subscription flows.",
    bullets: [
      "Multiple ticket types (GA, reserved, VIP, meet & greet, platinum)",
      "Tiered pricing structures with demand-based rules",
      "Group ticket sales with organizer dashboards",
      "Bundle packages for multi-event, merch, parking, concierge",
      "Membership + season pass creation with benefit ladders",
    ],
  },
  {
    title: "Trust & Identity",
    description:
      "Anti-scalping, identity verification, and secure delivery ensure compliance with venue and regulatory guardrails.",
    bullets: [
      "Peer-to-peer transfer + resale with price controls",
      "Anti-scalping protection and fraud signals",
      "Digital wallet delivery (Apple Wallet, Google Pay, NFTs)",
      "Dynamic QR codes with tamper detection",
      "Will call + gift ticket workflows with ID verification",
    ],
  },
  {
    title: "Financial Controls",
    description:
      "Payments, taxation, and incentives pipe into ATLVS ledgers while protecting every jurisdictional rule set.",
    bullets: [
      "International currency + localized pricing",
      "Automatic tax calculation by jurisdiction",
      "Split payments, payment plans, and installments",
      "Promo code engine with stacked rule sets",
      "Discount verification for student/military/senior tiers",
    ],
  },
];

export const gvtewayCommerceLanes = [
  {
    title: "Merch Marketplace",
    bullets: [
      "Full-featured storefront with artist/event catalogs",
      "Limited drops, pre-orders, and bundle logic",
      "Size, color, variant, and personalization controls",
      "Abandoned cart recovery + save for later",
      "Gift cards, store credit, and wishlist orchestration",
    ],
  },
  {
    title: "Venue & POS",
    bullets: [
      "Box office POS with offline mode",
      "Concession + merch booth POS with inventory sync",
      "Cashless payments (tap, chip, swipe, NFC, RFID wristbands)",
      "Tips/gratuity presets and split tender",
      "Vendor booth management + commission tracking",
    ],
  },
  {
    title: "Fulfillment & Loyalty",
    bullets: [
      "Real-time inventory sync between online + physical",
      "Vendor portal + marketplace payouts",
      "Digital product delivery + streaming unlocks",
      "Subscription boxes + recurring bundles",
      "Loyalty program integration with points + tiers",
    ],
  },
];

export const gvtewaySocialPlaybook = [
  {
    title: "Signal Capture",
    bullets: [
      "Integrated social feed embeds on event pages",
      "User-generated content aggregation with hashtag tracking",
      "Photo booth + live stream ingestion",
      "Social proof widgets (attendee count, trending)",
    ],
  },
  {
    title: "Activation",
    bullets: [
      "Content calendar + multi-platform scheduling",
      "Influencer collaboration + tracking",
      "Contests, giveaways, and referral boosts",
      "Live tweet walls + takeover coordination",
    ],
  },
  {
    title: "Intelligence",
    bullets: [
      "Social listening + sentiment monitoring",
      "Keyword moderation + crisis playbooks",
      "Engagement analytics dashboards",
      "Shoppable posts + tag integrations",
    ],
  },
];

export const gvtewayRevenuePanels = [
  {
    kicker: "Commerce",
    title: "Ecommerce & POS",
    description:
      "Unified inventory across online merch, venue concessions, and pop-up booths with cashless, RFID-enabled fulfillment.",
    metrics: [
      { label: "SKU coverage", value: "480+" },
      { label: "POS nodes", value: "42" },
    ],
  },
  {
    kicker: "Payouts",
    title: "Reconciliation Dashboard",
    description:
      "Real-time payout tracking and reconciliation for accurate financial reporting.",
    metrics: [
      { label: "Payout frequency", value: "Daily" },
      { label: "Payout methods", value: "5" },
    ],
  },
  {
    kicker: "Marketing",
    title: "Campaign Intelligence",
    description:
      "Retargeting, SMS, push, and influencer flows stitched to conversion funnels with anomaly alerts for drop-offs.",
    metrics: [
      { label: "Channels", value: "12" },
      { label: "Attribution windows", value: "6" },
    ],
  },
  {
    kicker: "Monetization",
    title: "Membership Fabric",
    description:
      "Member → Plus → Extra ladders with perks, concierge, and loyalty loops syncing back to ATLVS finance.",
    metrics: [
      { label: "Tiers", value: "4" },
      { label: "Benefit types", value: "28" },
    ],
  },
];

export const gvtewayGuestSignals = [
  {
    label: "Personalization",
    items: [
      "AI recommendations",
      "Saved favorites + playlists",
      "Cross-platform calendar + reminders",
      "Notification preferences with granular controls",
      "Seat upgrade bidding + auction placements",
    ],
  },
  {
    label: "In-Venue",
    items: [
      "Interactive maps + AR layers",
      "Turn-by-turn and parking guidance",
      "Virtual queueing for concessions + merch",
      "In-app guest services chat + lost & found",
      "Friend finder + meetup coordination",
    ],
  },
  {
    label: "Post-Show",
    items: [
      "Memory books + highlight reels",
      "Feedback + NPS automation",
      "Loyalty points + gamified achievements",
      "Post-event exclusive content + setlists",
      "Accessibility + dietary preference follow-ups",
    ],
  },
];

export const gvtewayCommunityTracks = [
  {
    title: "Engagement Rooms",
    bullets: [
      "Threaded forums + event rooms",
      "Event-specific chat with auto-archive",
      "Artist Q&A with moderation",
      "Virtual meetups + watch parties",
    ],
  },
  {
    title: "Trust & Safety",
    bullets: [
      "Community guidelines + moderation tooling",
      "User reporting + blocking",
      "Verified fan badges + reputation",
      "Reputation + karma systems",
    ],
  },
  {
    title: "Fan Programs",
    bullets: [
      "Local fan chapters + geo communities",
      "Fan club management + exclusive perks",
      "Early access to tickets + announcements",
      "Community challenges, badges, and rewards",
    ],
  },
];

export const gvtewayIntegrationLinks = [
  {
    title: "ATLVS ↔ GVTEWAY",
    bullets: [
      "Client CRM → guest profiles",
      "Ticket + merch revenue → GL",
      "Artist bookings → event shells",
    ],
  },
  {
    title: "COMPVSS ↔ GVTEWAY",
    bullets: [
      "Production metadata → ticketing maps",
      "Set times + delays → push alerts",
      "Access control scans → show reports",
    ],
  },
  {
    title: "Tri-Platform",
    bullets: [
      "New deal → project → event workflow",
      "Shared SSO + notification spine",
      "Unified KPI observability",
    ],
  },
];
