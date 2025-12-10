import { describe, it, expect } from 'vitest';
import type {
  ExportFormat,
  ExportConfig,
  ExportJob,
  ExportTemplate,
} from '../data-export';

describe('data-export', () => {
  describe('ExportFormat', () => {
    it('should include all export formats', () => {
      const formats: ExportFormat[] = ['csv', 'excel', 'pdf', 'json'];
      expect(formats.length).toBe(4);
    });
  });

  describe('ExportConfig interface', () => {
    it('should have required fields', () => {
      const config: ExportConfig = {
        entityType: 'projects',
        format: 'csv',
      };

      expect(config.entityType).toBe('projects');
      expect(config.format).toBe('csv');
    });

    it('should support optional filters', () => {
      const config: ExportConfig = {
        entityType: 'events',
        format: 'excel',
        filters: {
          status: 'active',
          date_range: { start: '2025-01-01', end: '2025-12-31' },
        },
      };

      expect(config.filters?.status).toBe('active');
    });

    it('should support column selection', () => {
      const config: ExportConfig = {
        entityType: 'tasks',
        format: 'csv',
        columns: ['name', 'status', 'due_date', 'assignee'],
      };

      expect(config.columns?.length).toBe(4);
      expect(config.columns).toContain('name');
    });

    it('should support includeHeaders option', () => {
      const config: ExportConfig = {
        entityType: 'contacts',
        format: 'csv',
        includeHeaders: true,
      };

      expect(config.includeHeaders).toBe(true);
    });

    it('should support template reference', () => {
      const config: ExportConfig = {
        entityType: 'reports',
        format: 'pdf',
        template: 'monthly_report_template',
      };

      expect(config.template).toBe('monthly_report_template');
    });

    it('should support custom fileName', () => {
      const config: ExportConfig = {
        entityType: 'invoices',
        format: 'pdf',
        fileName: 'Q4_2025_Invoices',
      };

      expect(config.fileName).toBe('Q4_2025_Invoices');
    });
  });

  describe('ExportJob interface', () => {
    it('should have all required fields', () => {
      const job: ExportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'projects',
        format: 'csv',
        status: 'pending',
        config: {
          entityType: 'projects',
          format: 'csv',
        },
        created_at: new Date().toISOString(),
      };

      expect(job.id).toBe('job-123');
      expect(job.status).toBe('pending');
    });

    it('should support processing status', () => {
      const job: ExportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'events',
        format: 'excel',
        status: 'processing',
        config: { entityType: 'events', format: 'excel' },
        created_at: new Date().toISOString(),
      };

      expect(job.status).toBe('processing');
    });

    it('should support completed status with file URL', () => {
      const job: ExportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'tasks',
        format: 'json',
        status: 'completed',
        config: { entityType: 'tasks', format: 'json' },
        file_url: 'https://storage.example.com/exports/tasks_123.json',
        record_count: 150,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      expect(job.status).toBe('completed');
      expect(job.file_url).toContain('tasks_123.json');
      expect(job.record_count).toBe(150);
    });

    it('should support failed status with error message', () => {
      const job: ExportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'reports',
        format: 'pdf',
        status: 'failed',
        config: { entityType: 'reports', format: 'pdf' },
        error_message: 'PDF generation failed: Template not found',
        created_at: new Date().toISOString(),
      };

      expect(job.status).toBe('failed');
      expect(job.error_message).toContain('Template not found');
    });
  });

  describe('ExportTemplate interface', () => {
    it('should have all required fields', () => {
      const template: ExportTemplate = {
        id: 'template-123',
        name: 'Monthly Report',
        entity_type: 'reports',
        format: 'pdf',
        columns: ['title', 'date', 'summary', 'metrics'],
        user_id: 'user-456',
        is_public: false,
        created_at: new Date().toISOString(),
      };

      expect(template.id).toBe('template-123');
      expect(template.name).toBe('Monthly Report');
      expect(template.columns.length).toBe(4);
    });

    it('should support optional filters', () => {
      const template: ExportTemplate = {
        id: 'template-123',
        name: 'Active Projects Export',
        entity_type: 'projects',
        format: 'excel',
        columns: ['name', 'status', 'budget'],
        filters: { status: 'active' },
        user_id: 'user-456',
        is_public: true,
        created_at: new Date().toISOString(),
      };

      expect(template.filters?.status).toBe('active');
      expect(template.is_public).toBe(true);
    });
  });
});
