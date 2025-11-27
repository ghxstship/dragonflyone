/**
 * Data Export System
 * Export data to CSV, Excel, PDF, and JSON formats with filtering and templates
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportConfig {
  entityType: string;
  format: ExportFormat;
  filters?: Record<string, any>;
  columns?: string[];
  includeHeaders?: boolean;
  template?: string;
  fileName?: string;
}

export interface ExportJob {
  id: string;
  user_id: string;
  entity_type: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  config: ExportConfig;
  file_url?: string;
  record_count?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  entity_type: string;
  format: ExportFormat;
  columns: string[];
  filters?: Record<string, any>;
  user_id: string;
  is_public: boolean;
  created_at: string;
}

/**
 * Data Export Engine
 * Handles export operations with multiple format support
 */
export class DataExportEngine {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create export job
   */
  async createExport(
    userId: string,
    config: ExportConfig
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('export_jobs')
        .insert({
          user_id: userId,
          entity_type: config.entityType,
          format: config.format,
          status: 'pending',
          config,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Trigger async export processing
      await this.processExport(data.id);

      return { success: true, jobId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process export job
   */
  private async processExport(jobId: string): Promise<void> {
    try {
      // Update status to processing
      await this.supabase
        .from('export_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Get job details
      const { data: job, error: jobError } = await this.supabase
        .from('export_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error('Job not found');
      }

      // Fetch data based on entity type and filters
      const records = await this.fetchData(job.entity_type, job.config.filters);

      // Generate export file
      const fileUrl = await this.generateFile(
        records,
        job.format,
        job.config.columns,
        job.config.includeHeaders,
        job.config.fileName
      );

      // Update job with completion
      await this.supabase
        .from('export_jobs')
        .update({
          status: 'completed',
          file_url: fileUrl,
          record_count: records.length,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    } catch (error: any) {
      // Update job with error
      await this.supabase
        .from('export_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);
    }
  }

  /**
   * Fetch data for export
   */
  private async fetchData(
    entityType: string,
    filters?: Record<string, any>
  ): Promise<any[]> {
    let query = this.supabase.from(entityType).select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Generate export file
   */
  private async generateFile(
    records: any[],
    format: ExportFormat,
    columns?: string[],
    includeHeaders: boolean = true,
    fileName?: string
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = fileName || `export-${timestamp}`;

    switch (format) {
      case 'csv':
        return this.generateCSV(records, columns, includeHeaders, filename);
      case 'json':
        return this.generateJSON(records, columns, filename);
      case 'excel':
        return this.generateExcel(records, columns, includeHeaders, filename);
      case 'pdf':
        return this.generatePDF(records, columns, filename);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate CSV file
   */
  private async generateCSV(
    records: any[],
    columns?: string[],
    includeHeaders: boolean = true,
    filename: string = 'export'
  ): Promise<string> {
    if (records.length === 0) {
      return '';
    }

    const cols = columns || Object.keys(records[0]);
    let csv = '';

    // Add headers
    if (includeHeaders) {
      csv += cols.join(',') + '\n';
    }

    // Add rows
    records.forEach((record) => {
      const row = cols.map((col) => {
        const value = record[col];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      });
      csv += row.join(',') + '\n';
    });

    // Upload to storage
    const { data, error } = await this.supabase.storage
      .from('exports')
      .upload(`${filename}.csv`, new Blob([csv], { type: 'text/csv' }), {
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload CSV: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('exports')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /**
   * Generate JSON file
   */
  private async generateJSON(
    records: any[],
    columns?: string[],
    filename: string = 'export'
  ): Promise<string> {
    const data = columns
      ? records.map((record) =>
          columns.reduce((obj, col) => ({ ...obj, [col]: record[col] }), {})
        )
      : records;

    const json = JSON.stringify(data, null, 2);

    // Upload to storage
    const { data: uploadData, error } = await this.supabase.storage
      .from('exports')
      .upload(`${filename}.json`, new Blob([json], { type: 'application/json' }), {
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload JSON: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('exports')
      .getPublicUrl(uploadData.path);

    return urlData.publicUrl;
  }

  /**
   * Generate Excel file (placeholder - requires library like exceljs)
   */
  private async generateExcel(
    records: any[],
    columns?: string[],
    includeHeaders: boolean = true,
    filename: string = 'export'
  ): Promise<string> {
    // For now, generate CSV as fallback
    // In production, use exceljs or similar library
    return this.generateCSV(records, columns, includeHeaders, filename);
  }

  /**
   * Generate PDF file (placeholder - requires library like pdfkit)
   */
  private async generatePDF(
    records: any[],
    columns?: string[],
    filename: string = 'export'
  ): Promise<string> {
    // For now, generate JSON as fallback
    // In production, use pdfkit or similar library
    return this.generateJSON(records, columns, filename);
  }

  /**
   * Get export job status
   */
  async getExportStatus(jobId: string): Promise<ExportJob | null> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      user_id: data.user_id,
      entity_type: data.entity_type,
      format: data.format,
      status: data.status,
      config: data.config,
      file_url: data.file_url,
      record_count: data.record_count,
      error_message: data.error_message,
      created_at: data.created_at,
      completed_at: data.completed_at,
    };
  }

  /**
   * Get user's export history
   */
  async getExportHistory(userId: string, limit: number = 50): Promise<ExportJob[]> {
    const { data, error } = await this.supabase
      .from('export_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      entity_type: row.entity_type,
      format: row.format,
      status: row.status,
      config: row.config,
      file_url: row.file_url,
      record_count: row.record_count,
      error_message: row.error_message,
      created_at: row.created_at,
      completed_at: row.completed_at,
    }));
  }

  /**
   * Save export template
   */
  async saveTemplate(
    userId: string,
    name: string,
    entityType: string,
    format: ExportFormat,
    columns: string[],
    filters?: Record<string, any>,
    isPublic: boolean = false
  ): Promise<{ success: boolean; template?: ExportTemplate; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('export_templates')
        .insert({
          name,
          entity_type: entityType,
          format,
          columns,
          filters,
          user_id: userId,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        template: {
          id: data.id,
          name: data.name,
          entity_type: data.entity_type,
          format: data.format,
          columns: data.columns,
          filters: data.filters,
          user_id: data.user_id,
          is_public: data.is_public,
          created_at: data.created_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get export templates
   */
  async getTemplates(userId: string, entityType?: string): Promise<ExportTemplate[]> {
    let query = this.supabase
      .from('export_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      entity_type: row.entity_type,
      format: row.format,
      columns: row.columns,
      filters: row.filters,
      user_id: row.user_id,
      is_public: row.is_public,
      created_at: row.created_at,
    }));
  }

  /**
   * Delete export job
   */
  async deleteExport(jobId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('export_jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);

    return !error;
  }
}

/**
 * Export utilities
 */
export const dataExport = {
  createEngine: (supabase: SupabaseClient<Database>) => new DataExportEngine(supabase),
};

export default dataExport;
