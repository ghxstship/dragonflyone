import { describe, it, expect } from 'vitest';
import type {
  ImportFormat,
  ImportAction,
  ImportJob,
  ImportError,
  ImportOptions,
  ImportTemplate,
} from '../data-import';

describe('data-import', () => {
  describe('ImportFormat', () => {
    it('should include all import formats', () => {
      const formats: ImportFormat[] = ['csv', 'excel', 'json'];
      expect(formats.length).toBe(3);
    });
  });

  describe('ImportAction', () => {
    it('should include all import actions', () => {
      const actions: ImportAction[] = ['create', 'update', 'upsert'];
      expect(actions.length).toBe(3);
    });
  });

  describe('ImportJob interface', () => {
    it('should have all required fields', () => {
      const job: ImportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'contacts',
        file_name: 'contacts.csv',
        file_path: 'imports/user-456/123_contacts.csv',
        format: 'csv',
        action: 'create',
        status: 'pending',
        total_rows: 0,
        processed_rows: 0,
        successful_rows: 0,
        failed_rows: 0,
        errors: [],
        created_at: new Date().toISOString(),
      };

      expect(job.id).toBe('job-123');
      expect(job.format).toBe('csv');
      expect(job.action).toBe('create');
      expect(job.status).toBe('pending');
    });

    it('should track processing progress', () => {
      const job: ImportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'products',
        file_name: 'products.xlsx',
        file_path: 'imports/user-456/products.xlsx',
        format: 'excel',
        action: 'upsert',
        status: 'processing',
        total_rows: 100,
        processed_rows: 50,
        successful_rows: 48,
        failed_rows: 2,
        errors: [
          { row: 15, field: 'price', message: 'Invalid number format', value: 'abc' },
          { row: 32, field: 'sku', message: 'Duplicate SKU', value: 'SKU-001' },
        ],
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      expect(job.total_rows).toBe(100);
      expect(job.processed_rows).toBe(50);
      expect(job.errors.length).toBe(2);
    });

    it('should support completed status', () => {
      const job: ImportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'events',
        file_name: 'events.json',
        file_path: 'imports/user-456/events.json',
        format: 'json',
        action: 'create',
        status: 'completed',
        total_rows: 50,
        processed_rows: 50,
        successful_rows: 50,
        failed_rows: 0,
        errors: [],
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      expect(job.status).toBe('completed');
      expect(job.successful_rows).toBe(50);
      expect(job.completed_at).toBeDefined();
    });

    it('should support column mapping', () => {
      const job: ImportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'contacts',
        file_name: 'contacts.csv',
        file_path: 'imports/contacts.csv',
        format: 'csv',
        action: 'create',
        status: 'pending',
        total_rows: 0,
        processed_rows: 0,
        successful_rows: 0,
        failed_rows: 0,
        errors: [],
        mapping: {
          'First Name': 'first_name',
          'Last Name': 'last_name',
          'Email Address': 'email',
          'Phone': 'phone_number',
        },
        created_at: new Date().toISOString(),
      };

      expect(job.mapping?.['First Name']).toBe('first_name');
    });

    it('should support import options', () => {
      const job: ImportJob = {
        id: 'job-123',
        user_id: 'user-456',
        entity_type: 'products',
        file_name: 'products.csv',
        file_path: 'imports/products.csv',
        format: 'csv',
        action: 'upsert',
        status: 'pending',
        total_rows: 0,
        processed_rows: 0,
        successful_rows: 0,
        failed_rows: 0,
        errors: [],
        options: {
          skip_header: true,
          delimiter: ',',
          batch_size: 100,
          update_existing: true,
          unique_field: 'sku',
        },
        created_at: new Date().toISOString(),
      };

      expect(job.options?.skip_header).toBe(true);
      expect(job.options?.unique_field).toBe('sku');
    });
  });

  describe('ImportError interface', () => {
    it('should have required fields', () => {
      const error: ImportError = {
        row: 5,
        message: 'Required field missing',
      };

      expect(error.row).toBe(5);
      expect(error.message).toBe('Required field missing');
    });

    it('should support optional field', () => {
      const error: ImportError = {
        row: 10,
        field: 'email',
        message: 'Invalid email format',
        value: 'not-an-email',
      };

      expect(error.field).toBe('email');
      expect(error.value).toBe('not-an-email');
    });
  });

  describe('ImportOptions interface', () => {
    it('should support all options', () => {
      const options: ImportOptions = {
        skip_header: true,
        delimiter: ';',
        quote_char: '"',
        validate_only: false,
        batch_size: 50,
        update_existing: true,
        unique_field: 'id',
      };

      expect(options.skip_header).toBe(true);
      expect(options.delimiter).toBe(';');
      expect(options.batch_size).toBe(50);
    });

    it('should support validation-only mode', () => {
      const options: ImportOptions = {
        validate_only: true,
      };

      expect(options.validate_only).toBe(true);
    });
  });

  describe('ImportTemplate interface', () => {
    it('should have all required fields', () => {
      const template: ImportTemplate = {
        id: 'template-123',
        name: 'Contact Import',
        entity_type: 'contacts',
        field_mapping: {
          'Name': 'full_name',
          'Email': 'email',
          'Company': 'organization',
        },
        required_fields: ['full_name', 'email'],
      };

      expect(template.id).toBe('template-123');
      expect(template.name).toBe('Contact Import');
      expect(template.required_fields.length).toBe(2);
    });

    it('should support validation rules', () => {
      const template: ImportTemplate = {
        id: 'template-123',
        name: 'Product Import',
        entity_type: 'products',
        field_mapping: { 'SKU': 'sku', 'Price': 'price' },
        required_fields: ['sku', 'price'],
        validation_rules: {
          price: { type: 'number', min: 0 },
          sku: { type: 'string', pattern: '^[A-Z]{3}-\\d{3}$' },
        },
      };

      expect(template.validation_rules?.price.min).toBe(0);
    });

    it('should support default values', () => {
      const template: ImportTemplate = {
        id: 'template-123',
        name: 'Event Import',
        entity_type: 'events',
        field_mapping: { 'Name': 'name', 'Date': 'event_date' },
        required_fields: ['name'],
        default_values: {
          status: 'draft',
          visibility: 'private',
        },
      };

      expect(template.default_values?.status).toBe('draft');
    });
  });
});
