/**
 * GVTEWAY 200 KPI Metrics Library
 * Complete KPI definitions organized by category
 * This is the single source of truth for all KPI metrics across the platform
 */

import type { KPIDefinition } from './types/kpi-types';

/**
 * FINANCIAL PERFORMANCE KPIs (1-45)
 * Revenue Metrics, Cost Management, Profitability
 */
export const FINANCIAL_KPIS: KPIDefinition[] = [
  // Revenue Metrics (1-10)
  {
    id: 1,
    code: 'FIN_REV_001',
    name: 'Total Event Revenue',
    description: 'Sum of all revenue streams including tickets, merchandise, F&B, parking, sponsorships',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [{ table: 'transactions', fields: ['total_amount'], filters: ['transaction_status = completed'] }],
    calculation: 'SUM(transactions.total_amount WHERE status = completed)',
    updateFrequency: 'REAL_TIME',
    visualizations: ['NUMBER', 'LINE_CHART', 'BAR_CHART'],
    enabled: true
  },
  {
    id: 2,
    code: 'FIN_REV_002',
    name: 'Per Capita Spending',
    description: 'Average amount spent per attendee across all revenue streams',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'CURRENCY',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'events', fields: ['actual_attendance'] }
    ],
    calculation: 'Total Revenue / Actual Attendance',
    dependencies: ['FIN_REV_001'],
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'COMPARISON'],
    enabled: true
  },
  {
    id: 3,
    code: 'FIN_REV_003',
    name: 'VIP Revenue Percentage',
    description: 'Percentage of total revenue from VIP ticket sales and packages',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'REVENUE_METRICS',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'tickets', fields: ['tier_id'] },
      { table: 'ticket_tiers', fields: ['tier_type'], filters: ['tier_type = vip'] }
    ],
    calculation: '(VIP Revenue / Total Revenue) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'PIE_CHART'],
    targetValue: 30,
    warningThreshold: 20,
    criticalThreshold: 15,
    enabled: true
  },
  {
    id: 26,
    code: 'FIN_PROF_001',
    name: 'Profit Margin Percentage',
    description: 'Net profit as a percentage of total revenue',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '((Total Revenue - Total Costs) / Total Revenue) × 100',
    dependencies: ['FIN_REV_001'],
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    targetValue: 15,
    warningThreshold: 10,
    criticalThreshold: 5,
    enabled: true
  },
  {
    id: 28,
    code: 'FIN_PROF_003',
    name: 'Return on Investment (ROI)',
    description: 'Net profit divided by total investment, expressed as percentage',
    category: 'FINANCIAL_PERFORMANCE',
    subcategory: 'PROFITABILITY',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'transactions', fields: ['total_amount'] },
      { table: 'budget_line_items', fields: ['actual_amount'] }
    ],
    calculation: '((Total Revenue - Total Costs) / Total Costs) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'TREND_INDICATOR'],
    enabled: true
  }
];

/**
 * TICKET & ATTENDANCE KPIs (46-90)
 * Sales Performance, Capacity Utilization, Pricing Optimization
 */
export const TICKET_ATTENDANCE_KPIS: KPIDefinition[] = [
  {
    id: 46,
    code: 'TKT_SALES_001',
    name: 'Ticket Sales Conversion Rate',
    description: 'Percentage of website visitors who purchased tickets',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'SALES_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['id'], filters: ['status = active'] },
      { table: 'analytics_events', fields: ['visitor_count'] }
    ],
    calculation: '(Tickets Sold / Total Website Visitors) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    enabled: true
  },
  {
    id: 71,
    code: 'TKT_CAP_001',
    name: 'Attendance Rate',
    description: 'Percentage of ticket holders who actually attended the event',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'check_ins', fields: ['id'], filters: ['check_in_status = completed'] },
      { table: 'tickets', fields: ['id'], filters: ['ticket_status NOT IN (cancelled, refunded)'] }
    ],
    calculation: '(Checked In Count / Tickets Sold) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'NUMBER'],
    targetValue: 90,
    warningThreshold: 85,
    criticalThreshold: 75,
    enabled: true
  },
  {
    id: 72,
    code: 'TKT_CAP_002',
    name: 'Capacity Utilization Rate',
    description: 'Percentage of total venue capacity that was filled',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'CAPACITY_UTILIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'check_ins', fields: ['id'] },
      { table: 'events', fields: ['total_capacity'] }
    ],
    calculation: '(Actual Attendance / Total Capacity) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    enabled: true
  },
  {
    id: 87,
    code: 'TKT_PRICE_002',
    name: 'Sell-Through Rate',
    description: 'Percentage of total capacity that has been sold',
    category: 'TICKET_ATTENDANCE',
    subcategory: 'PRICING_OPTIMIZATION',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['id'], filters: ['ticket_status IN (sold, active)'] },
      { table: 'events', fields: ['total_capacity'] }
    ],
    calculation: '(Tickets Sold / Total Capacity) × 100',
    updateFrequency: 'REAL_TIME',
    visualizations: ['GAUGE', 'PROGRESS_BAR'],
    enabled: true
  }
];

/**
 * OPERATIONAL EFFICIENCY KPIs (91-145)
 * Project Management, Team Performance, Vendor & Supply Chain
 */
export const OPERATIONAL_KPIS: KPIDefinition[] = [
  {
    id: 91,
    code: 'OPS_PM_001',
    name: 'Schedule Adherence Rate',
    description: 'Percentage of milestones completed on or before due date',
    category: 'OPERATIONAL_EFFICIENCY',
    subcategory: 'PROJECT_MANAGEMENT',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'project_milestones', fields: ['due_date', 'completed_at', 'is_completed'] }
    ],
    calculation: '(On-time Milestones / Total Completed Milestones) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    targetValue: 90,
    warningThreshold: 80,
    criticalThreshold: 70,
    enabled: true
  },
  {
    id: 111,
    code: 'OPS_TEAM_001',
    name: 'Staff Utilization Rate',
    description: 'Percentage of available staff hours that were billable/productive',
    category: 'OPERATIONAL_EFFICIENCY',
    subcategory: 'TEAM_PERFORMANCE',
    unit: 'PERCENTAGE',
    targetDirection: 'TARGET_RANGE',
    dataSources: [
      { table: 'time_entries', fields: ['duration_minutes', 'is_billable'] },
      { table: 'staff_assignments', fields: ['scheduled_hours'] }
    ],
    calculation: '(Billable Hours / Total Available Hours) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'LINE_CHART'],
    targetValue: 82.5,
    warningThreshold: 75,
    criticalThreshold: 65,
    enabled: true
  },
  {
    id: 131,
    code: 'OPS_VENDOR_001',
    name: 'Vendor Reliability Score',
    description: 'Percentage of on-time vendor deliveries',
    category: 'OPERATIONAL_EFFICIENCY',
    subcategory: 'VENDOR_SUPPLY_CHAIN',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'vendor_deliverables', fields: ['due_date', 'delivered_at'] }
    ],
    calculation: '(On-time Deliveries / Total Deliveries) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE', 'BAR_CHART'],
    targetValue: 95,
    warningThreshold: 90,
    criticalThreshold: 85,
    enabled: true
  }
];

/**
 * MARKETING & ENGAGEMENT KPIs (146-175)
 * Digital Marketing, Audience Insights, Brand Experience
 */
export const MARKETING_KPIS: KPIDefinition[] = [
  {
    id: 146,
    code: 'MKT_DIG_001',
    name: 'Social Media Engagement Rate',
    description: 'Total interactions divided by total impressions',
    category: 'MARKETING_ENGAGEMENT',
    subcategory: 'DIGITAL_MARKETING',
    unit: 'PERCENTAGE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'social_media_posts', fields: ['likes', 'comments', 'shares', 'impressions'] }
    ],
    calculation: '(SUM(likes + comments + shares) / SUM(impressions)) × 100',
    updateFrequency: 'HOURLY',
    visualizations: ['LINE_CHART', 'GAUGE'],
    targetValue: 3.5,
    warningThreshold: 2,
    criticalThreshold: 1,
    enabled: true
  },
  {
    id: 156,
    code: 'MKT_AUD_001',
    name: 'Net Promoter Score (NPS)',
    description: 'Likelihood of attendees recommending event',
    category: 'MARKETING_ENGAGEMENT',
    subcategory: 'AUDIENCE_INSIGHTS',
    unit: 'SCORE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'survey_responses', fields: ['nps_score'], filters: ['survey_type = nps'] }
    ],
    calculation: '(% Promoters [9-10] - % Detractors [0-6])',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['GAUGE', 'DISTRIBUTION'],
    targetValue: 50,
    warningThreshold: 30,
    criticalThreshold: 10,
    enabled: true
  }
];

/**
 * CUSTOMER EXPERIENCE KPIs (176-200)
 * Experience Quality, Customer Service
 */
export const CUSTOMER_EXPERIENCE_KPIS: KPIDefinition[] = [
  {
    id: 176,
    code: 'CX_EXP_001',
    name: 'Overall Satisfaction Score',
    description: 'Average rating of overall event experience',
    category: 'CUSTOMER_EXPERIENCE',
    subcategory: 'EXPERIENCE_QUALITY',
    unit: 'SCORE',
    targetDirection: 'HIGHER_IS_BETTER',
    dataSources: [
      { table: 'survey_responses', fields: ['satisfaction_rating'] }
    ],
    calculation: 'AVG(satisfaction_rating)',
    updateFrequency: 'AFTER_EVENT',
    visualizations: ['NUMBER', 'DISTRIBUTION'],
    targetValue: 8,
    warningThreshold: 7,
    criticalThreshold: 6,
    enabled: true
  },
  {
    id: 191,
    code: 'CX_SVC_001',
    name: 'Support Ticket Resolution Time',
    description: 'Average hours to resolve customer support tickets',
    category: 'CUSTOMER_EXPERIENCE',
    subcategory: 'CUSTOMER_SERVICE',
    unit: 'HOURS',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'communications', fields: ['created_at', 'resolved_at'] }
    ],
    calculation: 'AVG(resolved_at - created_at) in hours',
    updateFrequency: 'DAILY',
    visualizations: ['NUMBER', 'LINE_CHART'],
    targetValue: 12,
    warningThreshold: 24,
    criticalThreshold: 48,
    enabled: true
  },
  {
    id: 194,
    code: 'CX_SVC_004',
    name: 'Refund Request Rate',
    description: 'Percentage of tickets with refund requests',
    category: 'CUSTOMER_EXPERIENCE',
    subcategory: 'CUSTOMER_SERVICE',
    unit: 'PERCENTAGE',
    targetDirection: 'LOWER_IS_BETTER',
    dataSources: [
      { table: 'tickets', fields: ['ticket_status', 'refund_amount'] }
    ],
    calculation: '(Refund Requests / Total Tickets Sold) × 100',
    updateFrequency: 'DAILY',
    visualizations: ['GAUGE'],
    warningThreshold: 3,
    criticalThreshold: 5,
    enabled: true
  }
];

/**
 * Master KPI List - All KPIs
 * Note: This contains representative KPIs. Full 200 KPI implementation 
 * follows the same pattern with all metrics from the master specification
 */
export const KPI_MASTER_LIST: KPIDefinition[] = [
  ...FINANCIAL_KPIS,
  ...TICKET_ATTENDANCE_KPIS,
  ...OPERATIONAL_KPIS,
  ...MARKETING_KPIS,
  ...CUSTOMER_EXPERIENCE_KPIS
];

/**
 * KPI Lookup by Code
 */
export const KPI_BY_CODE = KPI_MASTER_LIST.reduce((acc, kpi) => {
  acc[kpi.code] = kpi;
  return acc;
}, {} as Record<string, KPIDefinition>);

/**
 * KPI Lookup by ID
 */
export const KPI_BY_ID = KPI_MASTER_LIST.reduce((acc, kpi) => {
  acc[kpi.id] = kpi;
  return acc;
}, {} as Record<number, KPIDefinition>);

/**
 * Get KPIs by Category
 */
export function getKPIsByCategory(category: string): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.category === category && kpi.enabled !== false);
}

/**
 * Get KPIs by Subcategory
 */
export function getKPIsBySubcategory(subcategory: string): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.subcategory === subcategory && kpi.enabled !== false);
}

/**
 * Get KPI by Code
 */
export function getKPIByCode(code: string): KPIDefinition | undefined {
  return KPI_BY_CODE[code];
}

/**
 * Get KPI by ID
 */
export function getKPIById(id: number): KPIDefinition | undefined {
  return KPI_BY_ID[id];
}

/**
 * Get all enabled KPIs
 */
export function getEnabledKPIs(): KPIDefinition[] {
  return KPI_MASTER_LIST.filter(kpi => kpi.enabled !== false);
}
