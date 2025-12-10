import { describe, it, expect } from 'vitest';
import type {
  Document,
  DocumentVersion,
  DocumentType,
  AccessLevel,
} from '../document-management';

describe('document-management', () => {
  describe('DocumentType', () => {
    it('should include all document types', () => {
      const types: DocumentType[] = [
        'contract',
        'invoice',
        'receipt',
        'agreement',
        'report',
        'presentation',
        'spreadsheet',
        'image',
        'video',
        'audio',
        'other',
      ];
      expect(types.length).toBe(11);
    });

    it('should include business document types', () => {
      const businessTypes: DocumentType[] = ['contract', 'invoice', 'receipt', 'agreement'];
      expect(businessTypes.length).toBe(4);
    });

    it('should include media types', () => {
      const mediaTypes: DocumentType[] = ['image', 'video', 'audio'];
      expect(mediaTypes.length).toBe(3);
    });

    it('should include office document types', () => {
      const officeTypes: DocumentType[] = ['report', 'presentation', 'spreadsheet'];
      expect(officeTypes.length).toBe(3);
    });
  });

  describe('AccessLevel', () => {
    it('should include all access levels', () => {
      const levels: AccessLevel[] = ['private', 'team', 'organization', 'public'];
      expect(levels.length).toBe(4);
    });
  });

  describe('Document interface', () => {
    it('should have all required fields', () => {
      const doc: Document = {
        id: 'doc-123',
        name: 'Contract.pdf',
        file_path: 'user-123/1234567890_Contract.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        document_type: 'contract',
        version: 1,
        access_level: 'private',
        tags: ['legal', 'signed'],
        metadata: {},
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(doc.id).toBe('doc-123');
      expect(doc.name).toBe('Contract.pdf');
      expect(doc.document_type).toBe('contract');
      expect(doc.version).toBe(1);
      expect(doc.access_level).toBe('private');
    });

    it('should support optional description', () => {
      const doc: Document = {
        id: 'doc-123',
        name: 'Report.pdf',
        description: 'Q4 Financial Report',
        file_path: 'user-123/report.pdf',
        file_size: 2048000,
        mime_type: 'application/pdf',
        document_type: 'report',
        version: 1,
        access_level: 'team',
        tags: [],
        metadata: {},
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(doc.description).toBe('Q4 Financial Report');
    });

    it('should support entity linking', () => {
      const doc: Document = {
        id: 'doc-123',
        name: 'Invoice.pdf',
        file_path: 'user-123/invoice.pdf',
        file_size: 512000,
        mime_type: 'application/pdf',
        document_type: 'invoice',
        entity_type: 'project',
        entity_id: 'proj-456',
        version: 1,
        access_level: 'organization',
        tags: ['billing'],
        metadata: { invoice_number: 'INV-001' },
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(doc.entity_type).toBe('project');
      expect(doc.entity_id).toBe('proj-456');
    });

    it('should support versioning with parent_id', () => {
      const doc: Document = {
        id: 'doc-456',
        name: 'Contract_v2.pdf',
        file_path: 'user-123/contract_v2.pdf',
        file_size: 1100000,
        mime_type: 'application/pdf',
        document_type: 'contract',
        version: 2,
        parent_id: 'doc-123',
        access_level: 'private',
        tags: ['legal', 'revised'],
        metadata: {},
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(doc.version).toBe(2);
      expect(doc.parent_id).toBe('doc-123');
    });

    it('should support custom metadata', () => {
      const doc: Document = {
        id: 'doc-123',
        name: 'Image.jpg',
        file_path: 'user-123/image.jpg',
        file_size: 3000000,
        mime_type: 'image/jpeg',
        document_type: 'image',
        version: 1,
        access_level: 'public',
        tags: ['photo', 'event'],
        metadata: {
          width: 1920,
          height: 1080,
          camera: 'Canon EOS R5',
          location: 'New York',
        },
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(doc.metadata.width).toBe(1920);
      expect(doc.metadata.camera).toBe('Canon EOS R5');
    });
  });

  describe('DocumentVersion interface', () => {
    it('should have all required fields', () => {
      const version: DocumentVersion = {
        id: 'ver-123',
        document_id: 'doc-456',
        version: 2,
        file_path: 'user-123/contract_v2.pdf',
        file_size: 1100000,
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
      };

      expect(version.id).toBe('ver-123');
      expect(version.document_id).toBe('doc-456');
      expect(version.version).toBe(2);
    });

    it('should support optional change_summary', () => {
      const version: DocumentVersion = {
        id: 'ver-123',
        document_id: 'doc-456',
        version: 3,
        file_path: 'user-123/contract_v3.pdf',
        file_size: 1150000,
        change_summary: 'Updated payment terms in section 4',
        uploaded_by: 'user-123',
        created_at: new Date().toISOString(),
      };

      expect(version.change_summary).toBe('Updated payment terms in section 4');
    });
  });
});
