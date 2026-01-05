/**
 * Quality Metrics System
 * 
 * Comprehensive metrics collection, analysis, and reporting for
 * component quality assessment and improvement tracking.
 */

import { type QualityGateReport } from "./quality-gates.js";

export interface QualityMetrics {
  /** Component name */
  componentName: string;
  
  /** Overall quality score */
  overallScore: number;
  
  /** Category scores */
  categoryScores: {
    performance: number;
    accessibility: number;
    design: number;
    code: number;
    testing: number;
    documentation: number;
  };
  
  /** Trend data */
  trend: {
    direction: 'improving' | 'declining' | 'stable';
    change: number;
    period: number;
  };
  
  /** Benchmark comparison */
  benchmark: {
    teamAverage: number;
    organizationAverage: number;
    industryStandard: number;
  };
  
  /** Risk assessment */
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  };
  
  /** Quality debt */
  qualityDebt: {
    estimatedHours: number;
    priorityIssues: number;
    technicalDebt: string[];
  };
  
  /** Compliance status */
  compliance: {
    designSystem: number;
    accessibility: number;
    security: number;
    performance: number;
  };
  
  /** Historical data */
  historical: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  /** Timestamp */
  timestamp: Date;
  
  /** Quality score */
  score: number;
  
  /** Category scores */
  categoryScores: QualityMetrics['categoryScores'];
  
  /** Gate results */
  gateResults: string[];
  
  /** Environment */
  environment: string;
  
  /** Build context */
  buildContext: {
    gitCommit: string;
    branch: string;
    buildNumber?: number;
  };
}

export interface QualityTrend {
  /** Component name */
  componentName: string;
  
  /** Trend direction */
  direction: 'improving' | 'declining' | 'stable';
  
  /** Trend percentage */
  percentage: number;
  
  /** Time period */
  period: number;
  
  /** Data points */
  dataPoints: HistoricalDataPoint[];
  
  /** Significance */
  significance: 'significant' | 'moderate' | 'minimal';
}

export interface QualityBenchmark {
  /** Benchmark name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Category */
  category: string;
  
  /** Threshold values */
  thresholds: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  
  /** Industry standards */
  industryStandards: {
    minimum: number;
    average: number;
    excellent: number;
  };
  
  /** Calculation method */
  calculationMethod: string;
  
  /** Data source */
  dataSource: string;
}

export interface QualityDashboard {
  /** Dashboard identifier */
  id: string;
  
  /** Dashboard name */
  name: string;
  
  /** Description */
  description: string;
  
  /** Components covered */
  components: string[];
  
  /** Overall metrics */
  overallMetrics: {
    totalComponents: number;
    averageScore: number;
    complianceRate: number;
    qualityDebt: number;
  };
  
  /** Category breakdown */
  categoryBreakdown: {
    [category: string]: {
      average: number;
      best: number;
      worst: number;
      trend: string;
    };
  };
  
  /** Top performers */
  topPerformers: {
    componentName: string;
    score: number;
    improvement: number;
  }[];
  
  /** Areas of concern */
  areasOfConcern: {
    componentName: string;
    issues: string[];
    priority: 'high' | 'medium' | 'low';
  }[];
  
  /** Recommendations */
  recommendations: string[];
  
  /** Last updated */
  lastUpdated: Date;
}

/**
 * Quality Metrics Manager
 * 
 * Manages quality metrics collection, analysis, and reporting.
 */
export class QualityMetricsManager {
  private metrics: Map<string, QualityMetrics> = new Map();
  private benchmarks: Map<string, QualityBenchmark> = new Map();
  private dashboards: Map<string, QualityDashboard> = new Map();

  constructor() {
    this.initializeBenchmarks();
  }

  /**
   * Calculate quality metrics for component
   */
  async calculateMetrics(
    componentName: string,
    reports: QualityGateReport[]
  ): Promise<QualityMetrics> {
    const latestReport = this.getLatestReport(reports);
    const historicalReports = this.getHistoricalReports(reports);
    
    const categoryScores = this.calculateCategoryScores(latestReport);
    const overallScore = this.calculateOverallScore(categoryScores);
    const trend = this.calculateTrend(historicalReports);
    const benchmark = this.getBenchmarkComparison(componentName, overallScore);
    const risk = this.assessRisk(latestReport, categoryScores);
    const qualityDebt = this.calculateQualityDebt(latestReport);
    const compliance = this.calculateCompliance(latestReport);
    const historical = this.buildHistoricalData(historicalReports);

    const metrics: QualityMetrics = {
      componentName,
      overallScore,
      categoryScores,
      trend,
      benchmark,
      risk,
      qualityDebt,
      compliance,
      historical,
    };

    this.metrics.set(componentName, metrics);
    return metrics;
  }

  /**
   * Get quality metrics for component
   */
  getMetrics(componentName: string): QualityMetrics | undefined {
    return this.metrics.get(componentName);
  }

  /**
   * Get all quality metrics
   */
  getAllMetrics(): QualityMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Generate quality dashboard
   */
  async generateDashboard(componentNames: string[]): Promise<QualityDashboard> {
    const componentMetrics = componentNames
      .map(name => this.metrics.get(name))
      .filter((metric): metric is QualityMetrics => metric !== undefined);

    const overallMetrics = this.calculateOverallDashboardMetrics(componentMetrics);
    const categoryBreakdown = this.calculateCategoryBreakdown(componentMetrics);
    const topPerformers = this.identifyTopPerformers(componentMetrics);
    const areasOfConcern = this.identifyAreasOfConcern(componentMetrics);
    const recommendations = this.generateDashboardRecommendations(componentMetrics);

    const dashboard: QualityDashboard = {
      id: `dashboard-${Date.now()}`,
      name: 'Component Quality Dashboard',
      description: 'Comprehensive quality metrics dashboard for UI components',
      components: componentNames,
      overallMetrics,
      categoryBreakdown,
      topPerformers,
      areasOfConcern,
      recommendations,
      lastUpdated: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Get quality dashboard
   */
  getDashboard(dashboardId: string): QualityDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get quality trend for component
   */
  getQualityTrend(componentName: string, period: number = 30): QualityTrend | undefined {
    const metrics = this.metrics.get(componentName);
    if (!metrics) return undefined;

    const relevantData = metrics.historical.filter(
      point => Date.now() - point.timestamp.getTime() <= period * 24 * 60 * 60 * 1000
    );

    if (relevantData.length < 2) return undefined;

    const firstScore = relevantData[0].score;
    const lastScore = relevantData[relevantData.length - 1].score;
    const change = ((lastScore - firstScore) / firstScore) * 100;

    let direction: QualityTrend['direction'] = 'stable';
    if (change > 5) direction = 'improving';
    else if (change < -5) direction = 'declining';

    let significance: QualityTrend['significance'] = 'minimal';
    if (Math.abs(change) > 20) significance = 'significant';
    else if (Math.abs(change) > 10) significance = 'moderate';

    return {
      componentName,
      direction,
      percentage: change,
      period,
      dataPoints: relevantData,
      significance,
    };
  }

  /**
   * Get quality benchmark
   */
  getBenchmark(benchmarkName: string): QualityBenchmark | undefined {
    return this.benchmarks.get(benchmarkName);
  }

  /**
   * Get all benchmarks
   */
  getAllBenchmarks(): QualityBenchmark[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Calculate category scores
   */
  private calculateCategoryScores(report: QualityGateReport): QualityMetrics['categoryScores'] {
    const categoryScores: QualityMetrics['categoryScores'] = {
      performance: 0,
      accessibility: 0,
      design: 0,
      code: 0,
      testing: 0,
      documentation: 0,
    };

    const categoryGateMap: Record<string, keyof QualityMetrics['categoryScores']> = {
      'performance': 'performance',
      'accessibility': 'accessibility',
      'design': 'design',
      'code': 'code',
      'testing': 'testing',
      'documentation': 'documentation',
    };

    report.gateResults.forEach(result => {
      const gateId = result.gateId;
      const category = Object.keys(categoryGateMap).find(cat => gateId.startsWith(cat.substring(0, 3)));
      
      if (category) {
        const categoryKey = categoryGateMap[category];
        categoryScores[categoryKey] += result.score;
      }
    });

    // Normalize scores
    Object.keys(categoryScores).forEach(key => {
      const category = key as keyof QualityMetrics['categoryScores'];
      const gateCount = report.gateResults.filter(r => r.gateId.startsWith(category.substring(0, 3))).length;
      categoryScores[category] = gateCount > 0 ? categoryScores[category] / gateCount : 0;
    });

    return categoryScores;
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(categoryScores: QualityMetrics['categoryScores']): number {
    const weights = {
      performance: 0.2,
      accessibility: 0.25,
      design: 0.15,
      code: 0.2,
      testing: 0.15,
      documentation: 0.05,
    };

    return Object.entries(categoryScores).reduce((sum, [category, score]) => {
      return sum + score * weights[category as keyof typeof weights];
    }, 0);
  }

  /**
   * Calculate trend
   */
  private calculateTrend(historicalReports: QualityGateReport[]): QualityMetrics['trend'] {
    if (historicalReports.length < 2) {
      return {
        direction: 'stable',
        change: 0,
        period: 0,
      };
    }

    const firstScore = historicalReports[0].overallScore;
    const lastScore = historicalReports[historicalReports.length - 1].overallScore;
    const change = ((lastScore - firstScore) / firstScore) * 100;

    let direction: QualityMetrics['trend']['direction'] = 'stable';
    if (change > 5) direction = 'improving';
    else if (change < -5) direction = 'declining';

    return {
      direction,
      change,
      period: historicalReports.length,
    };
  }

  /**
   * Get benchmark comparison
   */
  private getBenchmarkComparison(
    _componentName: string,
    score: number
  ): QualityMetrics['benchmark'] {
    // Mock benchmark data - in production would come from actual data
    return {
      teamAverage: 75,
      organizationAverage: 70,
      industryStandard: 65,
    };
  }

  /**
   * Assess risk
   */
  private assessRisk(
    report: QualityGateReport,
    categoryScores: QualityMetrics['categoryScores']
  ): QualityMetrics['risk'] {
    const factors: string[] = [];
    const recommendations: string[] = [];

    if (categoryScores.accessibility < 80) {
      factors.push('Low accessibility score');
      recommendations.push('Improve accessibility compliance');
    }

    if (categoryScores.performance < 70) {
      factors.push('Performance issues detected');
      recommendations.push('Optimize component performance');
    }

    if (categoryScores.testing < 80) {
      factors.push('Insufficient test coverage');
      recommendations.push('Increase test coverage');
    }

    if (report.summary.criticalFailures > 0) {
      factors.push('Critical quality gate failures');
      recommendations.push('Address critical failures immediately');
    }

    let level: QualityMetrics['risk']['level'] = 'low';
    if (factors.length > 3) level = 'critical';
    else if (factors.length > 1) level = 'high';
    else if (factors.length > 0) level = 'medium';

    return {
      level,
      factors,
      recommendations,
    };
  }

  /**
   * Calculate quality debt
   */
  private calculateQualityDebt(report: QualityGateReport): QualityMetrics['qualityDebt'] {
    const failedGates = report.gateResults.filter(r => r.status === 'failed');
    const estimatedHours = failedGates.length * 4; // 4 hours per failed gate
    const technicalDebt = failedGates.map(g => g.gateId);

    return {
      estimatedHours,
      priorityIssues: failedGates.filter(g => g.gateId.includes('critical')).length,
      technicalDebt,
    };
  }

  /**
   * Calculate compliance
   */
  private calculateCompliance(report: QualityGateReport): QualityMetrics['compliance'] {
    const complianceScores: QualityMetrics['compliance'] = {
      designSystem: 100,
      accessibility: 100,
      security: 100,
      performance: 100,
    };

    report.gateResults.forEach(result => {
      if (result.status === 'failed') {
        if (result.gateId.startsWith('design-')) {
          complianceScores.designSystem -= 25;
        } else if (result.gateId.startsWith('a11y-')) {
          complianceScores.accessibility -= 25;
        } else if (result.gateId.startsWith('perf-')) {
          complianceScores.performance -= 25;
        }
      }
    });

    return complianceScores;
  }

  /**
   * Build historical data
   */
  private buildHistoricalData(reports: QualityGateReport[]): HistoricalDataPoint[] {
    return reports.map(report => ({
      timestamp: report.timestamp,
      score: report.overallScore,
      categoryScores: this.calculateCategoryScores(report),
      gateResults: report.gateResults.map(r => r.gateId),
      environment: 'production', // Would come from report context
      buildContext: {
        gitCommit: 'abc123', // Would come from report context
        branch: 'main',
        buildNumber: 1,
      },
    }));
  }

  /**
   * Get latest report
   */
  private getLatestReport(reports: QualityGateReport[]): QualityGateReport {
    return reports.reduce((latest, report) => 
      report.timestamp > latest.timestamp ? report : latest
    );
  }

  /**
   * Get historical reports
   */
  private getHistoricalReports(reports: QualityGateReport[]): QualityGateReport[] {
    return reports.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Calculate overall dashboard metrics
   */
  private calculateOverallDashboardMetrics(metrics: QualityMetrics[]): QualityDashboard['overallMetrics'] {
    const totalComponents = metrics.length;
    const averageScore = metrics.reduce((sum, m) => sum + m.overallScore, 0) / totalComponents;
    const complianceRate = metrics.filter(m => m.overallScore >= 80).length / totalComponents * 100;
    const qualityDebt = metrics.reduce((sum, m) => sum + m.qualityDebt.estimatedHours, 0);

    return {
      totalComponents,
      averageScore,
      complianceRate,
      qualityDebt,
    };
  }

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(metrics: QualityMetrics[]): QualityDashboard['categoryBreakdown'] {
    const categories: (keyof QualityMetrics['categoryScores'])[] = [
      'performance', 'accessibility', 'design', 'code', 'testing', 'documentation'
    ];

    return categories.reduce((breakdown, category) => {
      const scores = metrics.map(m => m.categoryScores[category]);
      breakdown[category] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        best: Math.max(...scores),
        worst: Math.min(...scores),
        trend: 'stable', // Would calculate from historical data
      };
      return breakdown;
    }, {} as QualityDashboard['categoryBreakdown']);
  }

  /**
   * Identify top performers
   */
  private identifyTopPerformers(metrics: QualityMetrics[]): QualityDashboard['topPerformers'] {
    return metrics
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5)
      .map(metric => ({
        componentName: metric.componentName,
        score: metric.overallScore,
        improvement: metric.trend.change,
      }));
  }

  /**
   * Identify areas of concern
   */
  private identifyAreasOfConcern(metrics: QualityMetrics[]): QualityDashboard['areasOfConcern'] {
    return metrics
      .filter(m => m.risk.level === 'high' || m.risk.level === 'critical')
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 5)
      .map(metric => ({
        componentName: metric.componentName,
        issues: metric.risk.factors,
        priority: metric.risk.level === 'critical' ? 'high' : 'medium' as 'high' | 'medium' | 'low',
      }));
  }

  /**
   * Generate dashboard recommendations
   */
  private generateDashboardRecommendations(metrics: QualityMetrics[]): string[] {
    const recommendations: string[] = [];

    const avgAccessibility = metrics.reduce((sum, m) => sum + m.categoryScores.accessibility, 0) / metrics.length;
    if (avgAccessibility < 80) {
      recommendations.push('Focus on improving accessibility compliance across components');
    }

    const avgPerformance = metrics.reduce((sum, m) => sum + m.categoryScores.performance, 0) / metrics.length;
    if (avgPerformance < 70) {
      recommendations.push('Address performance issues to improve user experience');
    }

    const totalQualityDebt = metrics.reduce((sum, m) => sum + m.qualityDebt.estimatedHours, 0);
    if (totalQualityDebt > 100) {
      recommendations.push('Allocate resources to reduce technical debt');
    }

    return recommendations;
  }

  /**
   * Initialize benchmarks
   */
  private initializeBenchmarks(): void {
    // Performance benchmarks
    this.benchmarks.set('render-time', {
      name: 'Render Time',
      description: 'Component render time performance',
      category: 'performance',
      thresholds: {
        excellent: 16,
        good: 33,
        acceptable: 50,
        poor: 100,
      },
      industryStandards: {
        minimum: 100,
        average: 50,
        excellent: 16,
      },
      calculationMethod: 'Time in milliseconds for initial render',
      dataSource: 'Performance monitoring tools',
    });

    // Accessibility benchmarks
    this.benchmarks.set('accessibility-score', {
      name: 'Accessibility Score',
      description: 'Overall accessibility compliance score',
      category: 'accessibility',
      thresholds: {
        excellent: 95,
        good: 80,
        acceptable: 60,
        poor: 40,
      },
      industryStandards: {
        minimum: 40,
        average: 60,
        excellent: 95,
      },
      calculationMethod: 'WCAG 2.1 AA compliance percentage',
      dataSource: 'Accessibility testing tools',
    });

    // Test coverage benchmarks
    this.benchmarks.set('test-coverage', {
      name: 'Test Coverage',
      description: 'Code coverage by tests',
      category: 'testing',
      thresholds: {
        excellent: 90,
        good: 80,
        acceptable: 70,
        poor: 50,
      },
      industryStandards: {
        minimum: 50,
        average: 70,
        excellent: 90,
      },
      calculationMethod: 'Percentage of code covered by tests',
      dataSource: 'Code coverage tools',
    });
  }
}

/**
 * Global quality metrics manager instance
 */
export const qualityMetrics = new QualityMetricsManager();
