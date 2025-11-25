/**
 * KPI Type Definitions
 * Core types for the KPI Master List system
 */

export type KPICategory = 
  | 'FINANCIAL_PERFORMANCE'
  | 'TICKET_ATTENDANCE'
  | 'OPERATIONAL_EFFICIENCY'
  | 'MARKETING_ENGAGEMENT'
  | 'CUSTOMER_EXPERIENCE';

export type KPISubcategory = 
  // Financial Performance
  | 'REVENUE_METRICS'
  | 'COST_MANAGEMENT'
  | 'PROFITABILITY'
  // Ticket & Attendance
  | 'SALES_PERFORMANCE'
  | 'CAPACITY_UTILIZATION'
  | 'PRICING_OPTIMIZATION'
  // Operational Efficiency
  | 'PROJECT_MANAGEMENT'
  | 'TEAM_PERFORMANCE'
  | 'VENDOR_SUPPLY_CHAIN'
  // Marketing & Engagement
  | 'DIGITAL_MARKETING'
  | 'AUDIENCE_INSIGHTS'
  | 'BRAND_EXPERIENCE'
  // Customer Experience
  | 'EXPERIENCE_QUALITY'
  | 'CUSTOMER_SERVICE';

export type KPIUnit = 
  | 'CURRENCY'
  | 'PERCENTAGE'
  | 'COUNT'
  | 'DAYS'
  | 'HOURS'
  | 'MINUTES'
  | 'SECONDS'
  | 'RATIO'
  | 'SCORE'
  | 'RATE'
  | 'INDEX';

export type TargetDirection = 
  | 'HIGHER_IS_BETTER' 
  | 'LOWER_IS_BETTER' 
  | 'TARGET_RANGE' 
  | 'INFORMATIONAL';

export type UpdateFrequency = 
  | 'REAL_TIME'
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'AFTER_EVENT'
  | 'ON_DEMAND';

export type VisualizationType = 
  | 'NUMBER'
  | 'GAUGE'
  | 'LINE_CHART'
  | 'BAR_CHART'
  | 'PIE_CHART'
  | 'AREA_CHART'
  | 'SCATTER_PLOT'
  | 'HEATMAP'
  | 'FUNNEL'
  | 'PROGRESS_BAR'
  | 'COMPARISON'
  | 'TREND_INDICATOR'
  | 'DISTRIBUTION';

export interface DataSource {
  table: string;
  fields: string[];
  filters?: string[];
  joins?: string[];
}

export interface KPIDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  category: KPICategory;
  subcategory: KPISubcategory;
  unit: KPIUnit;
  targetDirection: TargetDirection;
  dataSources: DataSource[];
  calculation: string;
  dependencies?: string[];
  updateFrequency: UpdateFrequency;
  visualizations: VisualizationType[];
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  enabled?: boolean;
}

export interface KPIDataPoint {
  id: string;
  kpi_code: string;
  organization_id: string;
  project_id?: string;
  event_id?: string;
  value: number;
  metadata?: Record<string, any>;
  calculated_at: string;
  period_start?: string;
  period_end?: string;
}

export interface KPIReport {
  id: string;
  name: string;
  description?: string;
  kpi_codes: string[];
  filters?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
