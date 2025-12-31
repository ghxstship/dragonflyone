/**
 * Marketing Tools - Interactive Calculators and Utilities
 * Tools to help users plan and estimate for their productions
 * 
 * Categories:
 * - Financial Calculators
 * - Planning Tools
 * - Estimation Tools
 */

export interface Tool {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  platform?: 'atlvs' | 'compvss' | 'gvteway' | 'all';
  tags?: string[];
  featured?: boolean;
  new?: boolean;
  industryPainPoint?: string;
  inputs: ToolInput[];
  outputs: ToolOutput[];
}

export interface ToolInput {
  id: string;
  label: string;
  type: 'number' | 'currency' | 'percentage' | 'select' | 'date' | 'text';
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  required?: boolean;
  helpText?: string;
}

export interface ToolOutput {
  id: string;
  label: string;
  type: 'currency' | 'number' | 'percentage' | 'text' | 'date';
  format?: string;
  highlight?: boolean;
}

export type ToolCategory =
  | 'financial-calculators'
  | 'planning-tools'
  | 'estimation-tools';

export const TOOL_CATEGORIES: Record<ToolCategory, { label: string; description: string; icon: string }> = {
  'financial-calculators': {
    label: 'Financial Calculators',
    description: 'Calculate costs, revenue, and profitability',
    icon: 'Calculator',
  },
  'planning-tools': {
    label: 'Planning Tools',
    description: 'Plan timelines, capacity, and resources',
    icon: 'Calendar',
  },
  'estimation-tools': {
    label: 'Estimation Tools',
    description: 'Estimate costs and requirements',
    icon: 'TrendingUp',
  },
};

export const TOOLS: Tool[] = [
  // ============================================
  // FINANCIAL CALCULATORS
  // ============================================
  {
    id: 'fc-001',
    title: 'Ticket Pricing Calculator',
    description: 'Calculate optimal ticket prices based on your costs, desired margin, and market positioning. Includes fee calculations and break-even analysis.',
    category: 'financial-calculators',
    platform: 'gvteway',
    tags: ['tickets', 'pricing', 'revenue', 'margin'],
    featured: true,
    industryPainPoint: "Don't know how to price tickets profitably",
    inputs: [
      { id: 'totalCosts', label: 'Total Production Costs', type: 'currency', placeholder: '50000', required: true, helpText: 'All costs including talent, venue, production, marketing' },
      { id: 'venueCapacity', label: 'Venue Capacity', type: 'number', placeholder: '1000', required: true, helpText: 'Total tickets available' },
      { id: 'targetSellThrough', label: 'Target Sell-Through', type: 'percentage', defaultValue: 85, min: 50, max: 100, helpText: 'Expected percentage of tickets sold' },
      { id: 'targetMargin', label: 'Target Profit Margin', type: 'percentage', defaultValue: 20, min: 0, max: 50, helpText: 'Desired profit margin' },
      { id: 'platformFee', label: 'Platform Fee', type: 'percentage', defaultValue: 3.5, helpText: 'GHXSTSHIP fee percentage' },
      { id: 'absorbFees', label: 'Absorb Fees?', type: 'select', options: [{ value: 'yes', label: 'Yes - Include in price' }, { value: 'no', label: 'No - Pass to buyer' }], defaultValue: 'no' },
    ],
    outputs: [
      { id: 'baseTicketPrice', label: 'Base Ticket Price', type: 'currency', highlight: true },
      { id: 'priceWithFees', label: 'Price with Fees (to buyer)', type: 'currency' },
      { id: 'breakEvenTickets', label: 'Break-Even Tickets', type: 'number' },
      { id: 'projectedRevenue', label: 'Projected Gross Revenue', type: 'currency' },
      { id: 'projectedProfit', label: 'Projected Profit', type: 'currency', highlight: true },
      { id: 'revenuePerTicket', label: 'Net Revenue Per Ticket', type: 'currency' },
    ],
  },
  {
    id: 'fc-002',
    title: 'Crew Cost Estimator',
    description: 'Estimate total labor costs for your production based on crew count, hours, and rates. Includes overtime calculations and department breakdowns.',
    category: 'financial-calculators',
    platform: 'compvss',
    tags: ['crew', 'labor', 'costs', 'budget'],
    featured: true,
    industryPainPoint: 'Labor costs surprise us at settlement',
    inputs: [
      { id: 'crewCount', label: 'Total Crew Count', type: 'number', placeholder: '25', required: true },
      { id: 'avgHourlyRate', label: 'Average Hourly Rate', type: 'currency', placeholder: '35', required: true },
      { id: 'regularHours', label: 'Regular Hours (per person)', type: 'number', placeholder: '8', required: true },
      { id: 'overtimeHours', label: 'Overtime Hours (per person)', type: 'number', placeholder: '2', defaultValue: 0 },
      { id: 'overtimeMultiplier', label: 'Overtime Multiplier', type: 'select', options: [{ value: '1.5', label: '1.5x (Time and a half)' }, { value: '2', label: '2x (Double time)' }], defaultValue: '1.5' },
      { id: 'numberOfDays', label: 'Number of Days', type: 'number', placeholder: '3', defaultValue: 1 },
      { id: 'includePayrollTax', label: 'Include Payroll Tax?', type: 'select', options: [{ value: 'yes', label: 'Yes - Add 15%' }, { value: 'no', label: 'No - Gross only' }], defaultValue: 'yes' },
    ],
    outputs: [
      { id: 'regularLabor', label: 'Regular Labor Cost', type: 'currency' },
      { id: 'overtimeLabor', label: 'Overtime Labor Cost', type: 'currency' },
      { id: 'subtotal', label: 'Labor Subtotal', type: 'currency' },
      { id: 'payrollTax', label: 'Payroll Tax/Burden', type: 'currency' },
      { id: 'totalLaborCost', label: 'Total Labor Cost', type: 'currency', highlight: true },
      { id: 'costPerDay', label: 'Cost Per Day', type: 'currency' },
      { id: 'costPerPerson', label: 'Cost Per Person', type: 'currency' },
    ],
  },
  {
    id: 'fc-003',
    title: 'Event ROI Calculator',
    description: 'Calculate return on investment for your event. Input revenue and costs to see ROI, profit margin, and break-even analysis.',
    category: 'financial-calculators',
    platform: 'all',
    tags: ['roi', 'profit', 'investment', 'analysis'],
    featured: true,
    industryPainPoint: "Don't know if event will be profitable until it's over",
    inputs: [
      { id: 'ticketRevenue', label: 'Ticket Revenue', type: 'currency', placeholder: '75000', required: true },
      { id: 'sponsorRevenue', label: 'Sponsor Revenue', type: 'currency', placeholder: '15000', defaultValue: 0 },
      { id: 'merchRevenue', label: 'Merch/Ancillary Revenue', type: 'currency', placeholder: '5000', defaultValue: 0 },
      { id: 'otherRevenue', label: 'Other Revenue', type: 'currency', placeholder: '0', defaultValue: 0 },
      { id: 'talentCosts', label: 'Talent Costs', type: 'currency', placeholder: '30000', required: true },
      { id: 'venueCosts', label: 'Venue Costs', type: 'currency', placeholder: '15000', required: true },
      { id: 'productionCosts', label: 'Production Costs', type: 'currency', placeholder: '20000', required: true },
      { id: 'marketingCosts', label: 'Marketing Costs', type: 'currency', placeholder: '8000', defaultValue: 0 },
      { id: 'otherCosts', label: 'Other Costs', type: 'currency', placeholder: '5000', defaultValue: 0 },
    ],
    outputs: [
      { id: 'totalRevenue', label: 'Total Revenue', type: 'currency' },
      { id: 'totalCosts', label: 'Total Costs', type: 'currency' },
      { id: 'grossProfit', label: 'Gross Profit', type: 'currency', highlight: true },
      { id: 'profitMargin', label: 'Profit Margin', type: 'percentage', highlight: true },
      { id: 'roi', label: 'Return on Investment', type: 'percentage' },
      { id: 'breakEvenRevenue', label: 'Break-Even Revenue', type: 'currency' },
    ],
  },
  {
    id: 'fc-004',
    title: 'Artist Split Calculator',
    description: 'Calculate artist payment based on deal structure. Supports guarantees, backend splits, and threshold calculations.',
    category: 'financial-calculators',
    platform: 'atlvs',
    tags: ['artist', 'split', 'guarantee', 'backend'],
    industryPainPoint: 'Confusion about artist payment calculations',
    inputs: [
      { id: 'dealType', label: 'Deal Type', type: 'select', options: [{ value: 'guarantee', label: 'Guarantee Only' }, { value: 'door', label: 'Door Deal (% of gross)' }, { value: 'vsGuarantee', label: 'Guarantee vs % (whichever greater)' }, { value: 'plusBackend', label: 'Guarantee + Backend Split' }], required: true },
      { id: 'guarantee', label: 'Guarantee Amount', type: 'currency', placeholder: '10000' },
      { id: 'grossRevenue', label: 'Gross Ticket Revenue', type: 'currency', placeholder: '50000', required: true },
      { id: 'artistPercentage', label: 'Artist Percentage', type: 'percentage', placeholder: '85', helpText: 'For door deals or backend split' },
      { id: 'threshold', label: 'Backend Threshold', type: 'currency', placeholder: '40000', helpText: 'Revenue threshold before backend kicks in' },
      { id: 'deductions', label: 'Deductions (venue, fees)', type: 'currency', placeholder: '5000', defaultValue: 0 },
    ],
    outputs: [
      { id: 'netRevenue', label: 'Net Revenue (after deductions)', type: 'currency' },
      { id: 'guaranteePayment', label: 'Guarantee Payment', type: 'currency' },
      { id: 'backendPayment', label: 'Backend Payment', type: 'currency' },
      { id: 'totalArtistPayment', label: 'Total Artist Payment', type: 'currency', highlight: true },
      { id: 'promoterShare', label: 'Promoter Share', type: 'currency' },
      { id: 'effectiveArtistPercent', label: 'Effective Artist %', type: 'percentage' },
    ],
  },
  {
    id: 'fc-005',
    title: 'GHXSTSHIP Fee Calculator',
    description: 'Calculate GHXSTSHIP platform fees for your ticket sales based on your tier and volume.',
    category: 'financial-calculators',
    platform: 'gvteway',
    tags: ['fees', 'platform', 'tickets', 'costs'],
    new: true,
    inputs: [
      { id: 'tier', label: 'GHXSTSHIP Tier', type: 'select', options: [{ value: 'gvteway', label: 'GVTEWAY (3.5% + $0.75)' }, { value: 'operations', label: 'OPERATIONS (2.5% + $0.50)' }, { value: 'experience', label: 'EXPERIENCE (2.5% + $0.50)' }, { value: 'enterprise', label: 'ENTERPRISE (2.0% + $0.40)' }], required: true },
      { id: 'ticketPrice', label: 'Average Ticket Price', type: 'currency', placeholder: '50', required: true },
      { id: 'ticketCount', label: 'Number of Tickets', type: 'number', placeholder: '1000', required: true },
      { id: 'feeAbsorption', label: 'Fee Absorption', type: 'select', options: [{ value: 'pass', label: 'Pass to buyer' }, { value: 'absorb', label: 'Absorb fees' }], defaultValue: 'pass' },
    ],
    outputs: [
      { id: 'grossRevenue', label: 'Gross Ticket Revenue', type: 'currency' },
      { id: 'percentageFee', label: 'Percentage Fee', type: 'currency' },
      { id: 'perTicketFee', label: 'Per-Ticket Fee', type: 'currency' },
      { id: 'totalFees', label: 'Total Platform Fees', type: 'currency', highlight: true },
      { id: 'netRevenue', label: 'Net Revenue to You', type: 'currency', highlight: true },
      { id: 'effectiveFeeRate', label: 'Effective Fee Rate', type: 'percentage' },
    ],
  },

  // ============================================
  // PLANNING TOOLS
  // ============================================
  {
    id: 'pt-001',
    title: 'Venue Capacity Planner',
    description: 'Calculate effective venue capacity based on layout, seating configuration, and safety requirements.',
    category: 'planning-tools',
    platform: 'all',
    tags: ['venue', 'capacity', 'layout', 'planning'],
    industryPainPoint: 'Oversell or undersell venue capacity',
    inputs: [
      { id: 'venueType', label: 'Venue Type', type: 'select', options: [{ value: 'standing', label: 'Standing/GA' }, { value: 'seated', label: 'Seated' }, { value: 'mixed', label: 'Mixed (Seated + Standing)' }], required: true },
      { id: 'totalSquareFeet', label: 'Total Square Feet', type: 'number', placeholder: '10000', required: true },
      { id: 'sqftPerPerson', label: 'Sq Ft Per Person', type: 'number', placeholder: '6', defaultValue: 6, helpText: 'Standing: 5-7, Seated: 10-15' },
      { id: 'seatedCapacity', label: 'Seated Capacity (if mixed)', type: 'number', placeholder: '500' },
      { id: 'standingArea', label: 'Standing Area Sq Ft (if mixed)', type: 'number', placeholder: '3000' },
      { id: 'safetyBuffer', label: 'Safety Buffer', type: 'percentage', defaultValue: 10, helpText: 'Reduce capacity for safety' },
      { id: 'stageArea', label: 'Stage/Production Area Sq Ft', type: 'number', placeholder: '1000', defaultValue: 0 },
    ],
    outputs: [
      { id: 'usableArea', label: 'Usable Area (Sq Ft)', type: 'number' },
      { id: 'rawCapacity', label: 'Raw Capacity', type: 'number' },
      { id: 'safeCapacity', label: 'Safe Capacity', type: 'number', highlight: true },
      { id: 'standingCapacity', label: 'Standing Capacity', type: 'number' },
      { id: 'seatedCapacity', label: 'Seated Capacity', type: 'number' },
      { id: 'densityPerSqFt', label: 'Density (people/sq ft)', type: 'number' },
    ],
  },
  {
    id: 'pt-002',
    title: 'Production Timeline Generator',
    description: 'Generate a production timeline with key milestones based on your event date. Automatically calculates when to start each phase.',
    category: 'planning-tools',
    platform: 'atlvs',
    tags: ['timeline', 'milestones', 'planning', 'schedule'],
    featured: true,
    industryPainPoint: "Don't know when to start planning",
    inputs: [
      { id: 'eventDate', label: 'Event Date', type: 'date', required: true },
      { id: 'eventType', label: 'Event Type', type: 'select', options: [{ value: 'concert', label: 'Concert/Show' }, { value: 'festival', label: 'Festival' }, { value: 'corporate', label: 'Corporate Event' }, { value: 'tour', label: 'Tour' }], required: true },
      { id: 'eventScale', label: 'Event Scale', type: 'select', options: [{ value: 'small', label: 'Small (<500 attendees)' }, { value: 'medium', label: 'Medium (500-2000)' }, { value: 'large', label: 'Large (2000-10000)' }, { value: 'major', label: 'Major (10000+)' }], required: true },
      { id: 'hasVenue', label: 'Venue Status', type: 'select', options: [{ value: 'confirmed', label: 'Venue Confirmed' }, { value: 'searching', label: 'Still Searching' }], defaultValue: 'searching' },
      { id: 'hasTalent', label: 'Talent Status', type: 'select', options: [{ value: 'confirmed', label: 'Talent Confirmed' }, { value: 'negotiating', label: 'In Negotiations' }, { value: 'searching', label: 'Still Searching' }], defaultValue: 'searching' },
    ],
    outputs: [
      { id: 'planningStart', label: 'Start Planning', type: 'date' },
      { id: 'venueDeadline', label: 'Venue Confirmation Deadline', type: 'date' },
      { id: 'talentDeadline', label: 'Talent Confirmation Deadline', type: 'date' },
      { id: 'announcementDate', label: 'Recommended Announcement', type: 'date' },
      { id: 'onSaleDate', label: 'Recommended On-Sale', type: 'date' },
      { id: 'advancingStart', label: 'Start Advancing', type: 'date' },
      { id: 'crewCallsStart', label: 'Crew Calls Start', type: 'date' },
      { id: 'loadInDate', label: 'Load-In Date', type: 'date' },
    ],
  },
  {
    id: 'pt-003',
    title: 'Crew Shift Planner',
    description: 'Plan crew shifts for your event. Calculate total crew hours, shift coverage, and identify gaps.',
    category: 'planning-tools',
    platform: 'compvss',
    tags: ['crew', 'shifts', 'planning', 'coverage'],
    inputs: [
      { id: 'eventStart', label: 'Event Start Time', type: 'text', placeholder: '19:00', required: true },
      { id: 'eventEnd', label: 'Event End Time', type: 'text', placeholder: '23:00', required: true },
      { id: 'loadInStart', label: 'Load-In Start', type: 'text', placeholder: '08:00', required: true },
      { id: 'strikeEnd', label: 'Strike End', type: 'text', placeholder: '02:00', required: true },
      { id: 'maxShiftLength', label: 'Max Shift Length (hours)', type: 'number', defaultValue: 10, min: 6, max: 12 },
      { id: 'breakRequirement', label: 'Break Requirement', type: 'select', options: [{ value: '30', label: '30 min per 6 hours' }, { value: '60', label: '1 hour per 8 hours' }], defaultValue: '30' },
      { id: 'crewNeeded', label: 'Crew Needed During Show', type: 'number', placeholder: '20', required: true },
    ],
    outputs: [
      { id: 'totalEventHours', label: 'Total Event Hours', type: 'number' },
      { id: 'shiftsNeeded', label: 'Shifts Needed', type: 'number' },
      { id: 'totalCrewHours', label: 'Total Crew Hours', type: 'number', highlight: true },
      { id: 'loadInCrew', label: 'Load-In Crew Needed', type: 'number' },
      { id: 'showCrew', label: 'Show Crew Needed', type: 'number' },
      { id: 'strikeCrew', label: 'Strike Crew Needed', type: 'number' },
    ],
  },

  // ============================================
  // ESTIMATION TOOLS
  // ============================================
  {
    id: 'et-001',
    title: 'Production Budget Estimator',
    description: 'Get a rough budget estimate for your production based on event type, size, and market. Great for initial planning.',
    category: 'estimation-tools',
    platform: 'atlvs',
    tags: ['budget', 'estimate', 'planning', 'costs'],
    featured: true,
    industryPainPoint: 'No idea where to start with budgeting',
    inputs: [
      { id: 'eventType', label: 'Event Type', type: 'select', options: [{ value: 'concert', label: 'Concert' }, { value: 'festival', label: 'Festival' }, { value: 'corporate', label: 'Corporate Event' }, { value: 'private', label: 'Private Event' }], required: true },
      { id: 'attendees', label: 'Expected Attendees', type: 'number', placeholder: '1000', required: true },
      { id: 'market', label: 'Market', type: 'select', options: [{ value: 'major', label: 'Major Market (NYC, LA, etc.)' }, { value: 'secondary', label: 'Secondary Market' }, { value: 'tertiary', label: 'Tertiary/Regional' }], required: true },
      { id: 'talentTier', label: 'Talent Tier', type: 'select', options: [{ value: 'local', label: 'Local/Regional' }, { value: 'national', label: 'National' }, { value: 'international', label: 'International/Major' }], required: true },
      { id: 'venueType', label: 'Venue Type', type: 'select', options: [{ value: 'club', label: 'Club/Bar' }, { value: 'theater', label: 'Theater' }, { value: 'arena', label: 'Arena' }, { value: 'outdoor', label: 'Outdoor/Festival' }], required: true },
      { id: 'productionLevel', label: 'Production Level', type: 'select', options: [{ value: 'basic', label: 'Basic (house sound/lights)' }, { value: 'standard', label: 'Standard (enhanced production)' }, { value: 'premium', label: 'Premium (full production)' }], required: true },
    ],
    outputs: [
      { id: 'talentEstimate', label: 'Talent Estimate', type: 'currency' },
      { id: 'venueEstimate', label: 'Venue Estimate', type: 'currency' },
      { id: 'productionEstimate', label: 'Production Estimate', type: 'currency' },
      { id: 'marketingEstimate', label: 'Marketing Estimate', type: 'currency' },
      { id: 'staffingEstimate', label: 'Staffing Estimate', type: 'currency' },
      { id: 'contingency', label: 'Contingency (10%)', type: 'currency' },
      { id: 'totalEstimate', label: 'Total Budget Estimate', type: 'currency', highlight: true },
      { id: 'perAttendee', label: 'Cost Per Attendee', type: 'currency' },
    ],
  },
  {
    id: 'et-002',
    title: 'Marketing Budget Estimator',
    description: 'Estimate marketing budget based on ticket sales goals, market, and channels.',
    category: 'estimation-tools',
    platform: 'gvteway',
    tags: ['marketing', 'budget', 'advertising', 'promotion'],
    inputs: [
      { id: 'ticketGoal', label: 'Ticket Sales Goal', type: 'number', placeholder: '1000', required: true },
      { id: 'avgTicketPrice', label: 'Average Ticket Price', type: 'currency', placeholder: '50', required: true },
      { id: 'marketType', label: 'Market Type', type: 'select', options: [{ value: 'established', label: 'Established Event (repeat)' }, { value: 'new', label: 'New Event' }, { value: 'unknown', label: 'Unknown Artist/Venue' }], required: true },
      { id: 'channels', label: 'Marketing Channels', type: 'select', options: [{ value: 'organic', label: 'Organic Only' }, { value: 'light', label: 'Light Paid (social only)' }, { value: 'standard', label: 'Standard (social + display)' }, { value: 'heavy', label: 'Heavy (all channels)' }], required: true },
      { id: 'timeline', label: 'Marketing Timeline', type: 'select', options: [{ value: 'short', label: 'Short (<4 weeks)' }, { value: 'standard', label: 'Standard (4-8 weeks)' }, { value: 'long', label: 'Long (8+ weeks)' }], required: true },
    ],
    outputs: [
      { id: 'targetRevenue', label: 'Target Ticket Revenue', type: 'currency' },
      { id: 'recommendedBudget', label: 'Recommended Marketing Budget', type: 'currency', highlight: true },
      { id: 'budgetAsPercent', label: 'Budget as % of Revenue', type: 'percentage' },
      { id: 'costPerTicket', label: 'Est. Cost Per Ticket Sold', type: 'currency' },
      { id: 'socialBudget', label: 'Social Media Budget', type: 'currency' },
      { id: 'displayBudget', label: 'Display/Programmatic Budget', type: 'currency' },
      { id: 'contentBudget', label: 'Content Creation Budget', type: 'currency' },
    ],
  },
  {
    id: 'et-003',
    title: 'Catering Estimator',
    description: 'Estimate catering costs for crew, artists, and VIPs based on headcount and service level.',
    category: 'estimation-tools',
    platform: 'compvss',
    tags: ['catering', 'hospitality', 'food', 'costs'],
    new: true,
    inputs: [
      { id: 'crewCount', label: 'Crew Count', type: 'number', placeholder: '30', required: true },
      { id: 'artistParty', label: 'Artist Party Size', type: 'number', placeholder: '15', defaultValue: 0 },
      { id: 'vipCount', label: 'VIP/Guest Count', type: 'number', placeholder: '20', defaultValue: 0 },
      { id: 'mealsPerDay', label: 'Meals Per Day', type: 'number', defaultValue: 2, min: 1, max: 3 },
      { id: 'numberOfDays', label: 'Number of Days', type: 'number', defaultValue: 1, min: 1 },
      { id: 'serviceLevel', label: 'Service Level', type: 'select', options: [{ value: 'basic', label: 'Basic (boxed/buffet)' }, { value: 'standard', label: 'Standard (hot buffet)' }, { value: 'premium', label: 'Premium (plated/chef)' }], required: true },
      { id: 'includeRider', label: 'Include Artist Rider Items?', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], defaultValue: 'yes' },
    ],
    outputs: [
      { id: 'totalHeadcount', label: 'Total Headcount', type: 'number' },
      { id: 'totalMeals', label: 'Total Meals', type: 'number' },
      { id: 'crewCatering', label: 'Crew Catering Cost', type: 'currency' },
      { id: 'artistCatering', label: 'Artist Catering Cost', type: 'currency' },
      { id: 'vipCatering', label: 'VIP Catering Cost', type: 'currency' },
      { id: 'riderItems', label: 'Rider Items Estimate', type: 'currency' },
      { id: 'totalCatering', label: 'Total Catering Estimate', type: 'currency', highlight: true },
      { id: 'perPersonPerDay', label: 'Cost Per Person/Day', type: 'currency' },
    ],
  },
];

/**
 * Get tools by category
 */
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

/**
 * Get tools by platform
 */
export function getToolsByPlatform(platform: 'atlvs' | 'compvss' | 'gvteway' | 'all'): Tool[] {
  return TOOLS.filter((tool) => tool.platform === platform || tool.platform === 'all');
}

/**
 * Get featured tools
 */
export function getFeaturedTools(): Tool[] {
  return TOOLS.filter((tool) => tool.featured);
}

/**
 * Get new tools
 */
export function getNewTools(): Tool[] {
  return TOOLS.filter((tool) => tool.new);
}

/**
 * Search tools by keyword
 */
export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase();
  return TOOLS.filter(
    (tool) =>
      tool.title.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export default TOOLS;
