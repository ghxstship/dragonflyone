'use client';

import { useState } from 'react';

type ReportType = 'financial' | 'project' | 'asset' | 'workforce' | 'custom';
type ReportFormat = 'json' | 'csv' | 'pdf';

interface GenerateReportParams {
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  format?: ReportFormat;
  filters?: Record<string, any>;
  grouping?: string[];
  metrics?: string[];
}

export function useReportGeneration() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (params: GenerateReportParams) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_type: params.reportType,
          period_start: params.periodStart,
          period_end: params.periodEnd,
          format: params.format || 'json',
          filters: params.filters,
          grouping: params.grouping,
          metrics: params.metrics,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReport(data);
        return data;
      } else {
        setError(data.error || 'Failed to generate report');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    loading,
    error,
    generateReport,
  };
}
