/**
 * Gap 14 Remediation: Export Service
 * Enterprise-grade export service with permissions and audit logging
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  table: string;
  columns?: string[];
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  includeSensitive?: boolean;
}

export interface ExportPermissionCheck {
  allowed: boolean;
  reason: string;
  includeSensitive: boolean;
  remainingExportsToday?: number;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename?: string;
  recordCount?: number;
  error?: string;
  auditLogId?: string;
}

export interface ExportStatistics {
  totalExports: number;
  totalRecordsExported: number;
  totalSizeBytes: number;
  byType: Record<ExportFormat, number>;
  byTable: Record<string, number>;
  byStatus: Record<string, number>;
  sensitiveExports: number;
  uniqueUsers: number;
  periodStart: Date;
  periodEnd: Date;
}

// ============================================================================
// SENSITIVE FIELDS CONFIGURATION
// ============================================================================

const SENSITIVE_FIELDS: Record<string, string[]> = {
  platform_users: ['email', 'phone'],
  contacts: ['email', 'phone', 'ssn', 'tax_id'],
  vendors: ['tax_id', 'bank_account', 'routing_number'],
  sponsors: ['tax_id', 'bank_account'],
  investors: ['tax_id', 'bank_account', 'ssn'],
  expenses: ['receipt_data', 'card_number'],
  invoices: ['payment_details', 'bank_info'],
  crew_members: ['ssn', 'bank_account', 'emergency_contact_phone'],
};

// ============================================================================
// EXPORT SERVICE CLASS
// ============================================================================

export class ExportService {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /**
   * Check if user can export data
   */
  async checkPermission(
    format: ExportFormat,
    table: string,
    recordCount: number = 0
  ): Promise<ExportPermissionCheck> {
    const { data, error } = await this.supabase.rpc('can_export', {
      p_user_id: this.userId,
      p_export_type: format,
      p_table_name: table,
      p_record_count: recordCount,
    });

    if (error) {
      return {
        allowed: false,
        reason: error.message,
        includeSensitive: false,
      };
    }

    const result = data as {
      allowed: boolean;
      reason: string;
      include_sensitive: boolean;
      remaining_exports_today?: number;
    };

    return {
      allowed: result.allowed,
      reason: result.reason,
      includeSensitive: result.include_sensitive,
      remainingExportsToday: result.remaining_exports_today,
    };
  }

  /**
   * Export data with permission check and audit logging
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    const { format, table, columns, filters, orderBy, limit, includeSensitive } = options;

    // Check permissions first
    const permission = await this.checkPermission(format, table);

    if (!permission.allowed) {
      // Log blocked export
      await this.logExport({
        format,
        table,
        recordCount: 0,
        status: 'blocked',
        error: permission.reason,
      });

      return {
        success: false,
        error: permission.reason,
      };
    }

    // Determine which columns to export
    const sensitiveFields = SENSITIVE_FIELDS[table] || [];
    const shouldIncludeSensitive = includeSensitive && permission.includeSensitive;

    let selectColumns = columns || ['*'];
    if (!shouldIncludeSensitive && sensitiveFields.length > 0) {
      // Filter out sensitive columns if not allowed
      if (selectColumns.includes('*')) {
        // Need to get actual columns and filter
        const { data: tableInfo } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);

        if (tableInfo && tableInfo.length > 0) {
          selectColumns = Object.keys(tableInfo[0]).filter(
            col => !sensitiveFields.includes(col)
          );
        }
      } else {
        selectColumns = selectColumns.filter(col => !sensitiveFields.includes(col));
      }
    }

    // Build query
    let query = this.supabase
      .from(table)
      .select(selectColumns.join(','));

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      await this.logExport({
        format,
        table,
        recordCount: 0,
        status: 'failed',
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }

    const records = (data || []) as unknown as Record<string, unknown>[];
    const recordCount = records.length;

    // Convert to requested format
    let exportData: string;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'csv':
        exportData = this.toCSV(records);
        filename = `${table}_export_${timestamp}.csv`;
        break;
      case 'json':
        exportData = JSON.stringify(records, null, 2);
        filename = `${table}_export_${timestamp}.json`;
        break;
      case 'excel':
        // For Excel, return CSV with .xlsx extension (actual Excel conversion would need a library)
        exportData = this.toCSV(records);
        filename = `${table}_export_${timestamp}.xlsx`;
        break;
      case 'pdf':
        // For PDF, return JSON (actual PDF conversion would need a library)
        exportData = JSON.stringify(records, null, 2);
        filename = `${table}_export_${timestamp}.pdf`;
        break;
      default:
        exportData = JSON.stringify(records);
        filename = `${table}_export_${timestamp}.txt`;
    }

    // Calculate size
    const sizeBytes = new Blob([exportData]).size;

    // Log successful export
    const auditLogId = await this.logExport({
      format,
      table,
      recordCount,
      fileSize: sizeBytes,
      columns: selectColumns,
      filters,
      includedSensitive: shouldIncludeSensitive,
      status: 'completed',
    });

    return {
      success: true,
      data: exportData,
      filename,
      recordCount,
      auditLogId,
    };
  }

  /**
   * Convert records to CSV format
   */
  private toCSV(records: Record<string, unknown>[]): string {
    if (records.length === 0) {
      return '';
    }

    const headers = Object.keys(records[0]);
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(headers.map(h => this.escapeCSV(h)).join(','));

    // Add data rows
    for (const record of records) {
      const values = headers.map(header => {
        const value = record[header];
        return this.escapeCSV(String(value ?? ''));
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Escape CSV value
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Log export to audit table
   */
  private async logExport(params: {
    format: ExportFormat;
    table: string;
    recordCount: number;
    fileSize?: number;
    columns?: string[];
    filters?: Record<string, unknown>;
    includedSensitive?: boolean;
    status: 'started' | 'completed' | 'failed' | 'blocked';
    error?: string;
  }): Promise<string | undefined> {
    const { data } = await this.supabase.rpc('log_export', {
      p_export_type: params.format,
      p_table_name: params.table,
      p_record_count: params.recordCount,
      p_file_size_bytes: params.fileSize || null,
      p_filters: params.filters || {},
      p_columns: params.columns || null,
      p_included_sensitive: params.includedSensitive || false,
      p_status: params.status,
      p_error_message: params.error || null,
    });

    return data as string | undefined;
  }

  /**
   * Get export statistics
   */
  async getStatistics(days: number = 30): Promise<ExportStatistics | null> {
    const { data, error } = await this.supabase.rpc('get_export_statistics', {
      p_days: days,
    });

    if (error || !data) {
      return null;
    }

    const stats = data as {
      total_exports: number;
      total_records_exported: number;
      total_size_bytes: number;
      by_type: Record<string, number>;
      by_table: Record<string, number>;
      by_status: Record<string, number>;
      sensitive_exports: number;
      unique_users: number;
      period_start: string;
      period_end: string;
    };

    return {
      totalExports: stats.total_exports || 0,
      totalRecordsExported: stats.total_records_exported || 0,
      totalSizeBytes: stats.total_size_bytes || 0,
      byType: (stats.by_type || {}) as Record<ExportFormat, number>,
      byTable: stats.by_table || {},
      byStatus: stats.by_status || {},
      sensitiveExports: stats.sensitive_exports || 0,
      uniqueUsers: stats.unique_users || 0,
      periodStart: new Date(stats.period_start),
      periodEnd: new Date(stats.period_end),
    };
  }

  /**
   * Get user's export history
   */
  async getExportHistory(limit: number = 50): Promise<Array<{
    id: string;
    format: ExportFormat;
    table: string;
    recordCount: number;
    status: string;
    createdAt: Date;
  }>> {
    const { data, error } = await this.supabase
      .from('export_audit_log')
      .select('id, export_type, table_name, record_count, status, created_at')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(record => ({
      id: record.id,
      format: record.export_type as ExportFormat,
      table: record.table_name,
      recordCount: record.record_count,
      status: record.status,
      createdAt: new Date(record.created_at),
    }));
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createExportService(
  supabase: SupabaseClient,
  userId: string
): ExportService {
  return new ExportService(supabase, userId);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download export data as file
 */
export function downloadExport(
  data: string | Blob,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    csv: 'text/csv',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    json: 'application/json',
  };
  return mimeTypes[format];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
