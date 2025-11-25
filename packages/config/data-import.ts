/**
 * Data Import System
 * CSV/Excel file parsing and bulk data import with validation and error handling
 */

import { createClient } from '@supabase/supabase-js';

export type ImportFormat = 'csv' | 'excel' | 'json';
export type ImportAction = 'create' | 'update' | 'upsert';

export interface ImportJob {
  id: string;
  user_id: string;
  entity_type: string;
  file_name: string;
  file_path: string;
  format: ImportFormat;
  action: ImportAction;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: ImportError[];
  mapping?: Record<string, string>; // CSV column -> DB field mapping
  options?: ImportOptions;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: any;
}

export interface ImportOptions {
  skip_header?: boolean;
  delimiter?: string;
  quote_char?: string;
  validate_only?: boolean;
  batch_size?: number;
  update_existing?: boolean;
  unique_field?: string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  entity_type: string;
  field_mapping: Record<string, string>;
  required_fields: string[];
  validation_rules?: Record<string, any>;
  default_values?: Record<string, any>;
}

/**
 * Data Import Engine
 * Handles CSV/Excel parsing and bulk data imports
 */
export class DataImportEngine {
  constructor(private supabase: ReturnType<typeof createClient>) {}

  /**
   * Create a new import job
   */
  async createImportJob(
    userId: string,
    entityType: string,
    file: File,
    action: ImportAction,
    options?: ImportOptions
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      // Detect format from file extension
      const format = this.detectFileFormat(file.name);
      if (!format) {
        return { success: false, error: 'Unsupported file format' };
      }

      // Upload file to storage
      const timestamp = Date.now();
      const filePath = `imports/${userId}/${timestamp}_${file.name}`;
      
      const { error: uploadError } = await this.supabase.storage
        .from('imports')
        .upload(filePath, file);

      if (uploadError) {
        return { success: false, error: uploadError.message };
      }

      // Create import job record
      const { data, error } = await this.supabase
        .from('import_jobs')
        .insert({
          user_id: userId,
          entity_type: entityType,
          file_name: file.name,
          file_path: filePath,
          format,
          action,
          status: 'pending',
          total_rows: 0,
          processed_rows: 0,
          successful_rows: 0,
          failed_rows: 0,
          errors: [],
          options: options || {},
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, jobId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process import job
   */
  async processImportJob(
    jobId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get job details
      const { data: job, error: fetchError } = await this.supabase
        .from('import_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError || !job) {
        return { success: false, error: 'Import job not found' };
      }

      // Update status to processing
      await this.supabase
        .from('import_jobs')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', jobId);

      // Download file from storage
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('imports')
        .download(job.file_path);

      if (downloadError || !fileData) {
        await this.updateJobStatus(jobId, 'failed', [
          { row: 0, message: 'Failed to download import file' },
        ]);
        return { success: false, error: 'Failed to download import file' };
      }

      // Parse file based on format
      const rows = await this.parseFile(fileData, job.format, job.options);
      
      // Update total rows
      await this.supabase
        .from('import_jobs')
        .update({ total_rows: rows.length })
        .eq('id', jobId);

      // Process rows in batches
      const batchSize = job.options?.batch_size || 100;
      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;
      const errors: ImportError[] = [];

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        for (const [index, row] of batch.entries()) {
          const rowNumber = i + index + 1;
          
          try {
            // Validate row
            const validationResult = await this.validateRow(
              row,
              job.entity_type,
              job.mapping
            );

            if (!validationResult.valid) {
              errors.push({
                row: rowNumber,
                message: validationResult.error || 'Validation failed',
              });
              failedCount++;
              continue;
            }

            // Transform row using mapping
            const transformedRow = this.transformRow(row, job.mapping);

            // Import row
            if (job.action === 'create') {
              await this.createRow(job.entity_type, transformedRow);
            } else if (job.action === 'update') {
              await this.updateRow(
                job.entity_type,
                transformedRow,
                job.options?.unique_field
              );
            } else if (job.action === 'upsert') {
              await this.upsertRow(
                job.entity_type,
                transformedRow,
                job.options?.unique_field
              );
            }

            successCount++;
          } catch (error: any) {
            errors.push({
              row: rowNumber,
              message: error.message,
            });
            failedCount++;
          }

          processedCount++;
        }

        // Update progress
        await this.supabase
          .from('import_jobs')
          .update({
            processed_rows: processedCount,
            successful_rows: successCount,
            failed_rows: failedCount,
          })
          .eq('id', jobId);
      }

      // Determine final status
      const finalStatus =
        failedCount === 0 ? 'completed' : failedCount < rows.length ? 'partial' : 'failed';

      await this.updateJobStatus(jobId, finalStatus, errors);

      return { success: true };
    } catch (error: any) {
      await this.updateJobStatus(jobId, 'failed', [
        { row: 0, message: error.message },
      ]);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse file based on format
   */
  private async parseFile(
    file: Blob,
    format: ImportFormat,
    options?: ImportOptions
  ): Promise<any[]> {
    const text = await file.text();

    if (format === 'csv') {
      return this.parseCSV(text, options);
    } else if (format === 'json') {
      return JSON.parse(text);
    }

    // Excel parsing would require a library like xlsx
    throw new Error('Excel parsing not yet implemented');
  }

  /**
   * Parse CSV file
   */
  private parseCSV(content: string, options?: ImportOptions): any[] {
    const delimiter = options?.delimiter || ',';
    const quoteChar = options?.quote_char || '"';
    const skipHeader = options?.skip_header !== false;

    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    // Parse header
    const header = this.parseCSVLine(lines[0], delimiter, quoteChar);
    const startIndex = skipHeader ? 1 : 0;

    // Parse data rows
    const rows: any[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i], delimiter, quoteChar);
      const row: Record<string, any> = {};

      header.forEach((key, index) => {
        row[key] = values[index] || null;
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse single CSV line
   */
  private parseCSVLine(
    line: string,
    delimiter: string,
    quoteChar: string
  ): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === quoteChar) {
        if (inQuotes && nextChar === quoteChar) {
          current += quoteChar;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Validate row data
   */
  private async validateRow(
    row: any,
    entityType: string,
    mapping?: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    // Basic validation - can be extended based on entity type
    if (!row || typeof row !== 'object') {
      return { valid: false, error: 'Invalid row data' };
    }

    // Check required fields based on mapping
    if (mapping) {
      for (const [csvField, dbField] of Object.entries(mapping)) {
        if (row[csvField] === undefined || row[csvField] === null || row[csvField] === '') {
          // Check if field is required (basic check)
          return { valid: false, error: `Missing required field: ${csvField}` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Transform row using field mapping
   */
  private transformRow(
    row: any,
    mapping?: Record<string, string>
  ): Record<string, any> {
    if (!mapping) return row;

    const transformed: Record<string, any> = {};

    for (const [csvField, dbField] of Object.entries(mapping)) {
      transformed[dbField] = row[csvField];
    }

    return transformed;
  }

  /**
   * Create new row
   */
  private async createRow(entityType: string, data: Record<string, any>): Promise<void> {
    const { error } = await this.supabase.from(entityType).insert(data);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update existing row
   */
  private async updateRow(
    entityType: string,
    data: Record<string, any>,
    uniqueField?: string
  ): Promise<void> {
    if (!uniqueField || !data[uniqueField]) {
      throw new Error('Unique field required for update');
    }

    const { error } = await this.supabase
      .from(entityType)
      .update(data)
      .eq(uniqueField, data[uniqueField]);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Upsert row (create or update)
   */
  private async upsertRow(
    entityType: string,
    data: Record<string, any>,
    uniqueField?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from(entityType)
      .upsert(data, { onConflict: uniqueField });

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: ImportJob['status'],
    errors: ImportError[]
  ): Promise<void> {
    await this.supabase
      .from('import_jobs')
      .update({
        status,
        errors,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }

  /**
   * Get import job status
   */
  async getImportJob(jobId: string): Promise<ImportJob | null> {
    const { data, error } = await this.supabase
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ImportJob;
  }

  /**
   * Get user's import jobs
   */
  async getUserImportJobs(userId: string, limit: number = 20): Promise<ImportJob[]> {
    const { data, error } = await this.supabase
      .from('import_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data as ImportJob[];
  }

  /**
   * Cancel import job
   */
  async cancelImportJob(jobId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('import_jobs')
      .update({ status: 'failed' })
      .eq('id', jobId)
      .eq('status', 'pending');

    return !error;
  }

  /**
   * Delete import job
   */
  async deleteImportJob(jobId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('import_jobs')
      .delete()
      .eq('id', jobId);

    return !error;
  }

  /**
   * Detect file format from filename
   */
  private detectFileFormat(filename: string): ImportFormat | null {
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'csv') return 'csv';
    if (ext === 'xlsx' || ext === 'xls') return 'excel';
    if (ext === 'json') return 'json';

    return null;
  }

  /**
   * Save import template
   */
  async saveImportTemplate(
    template: Omit<ImportTemplate, 'id'>
  ): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('import_templates')
        .insert(template)
        .select('id')
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, templateId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get import templates
   */
  async getImportTemplates(entityType?: string): Promise<ImportTemplate[]> {
    let query = this.supabase.from('import_templates').select('*');

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as ImportTemplate[];
  }
}

/**
 * Export data import utilities
 */
export const dataImport = {
  createEngine: (supabase: ReturnType<typeof createClient>) =>
    new DataImportEngine(supabase),
};

export default dataImport;
