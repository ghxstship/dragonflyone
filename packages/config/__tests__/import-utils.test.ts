import { describe, it, expect } from 'vitest';
import {
  applyMapping,
  getImportTemplates,
} from '../import-utils';

describe('import-utils', () => {
  describe('applyMapping', () => {
    it('should map columns to entity fields', () => {
      const data = [
        { 'First Name': 'John', 'Last Name': 'Doe', 'Email Address': 'john@example.com' },
      ];
      const mapping = {
        'First Name': 'firstName',
        'Last Name': 'lastName',
        'Email Address': 'email',
      };
      
      const result = applyMapping(data, mapping);
      
      expect(result[0]).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
    });

    it('should handle empty data', () => {
      const result = applyMapping([], { name: 'name' });
      expect(result).toEqual([]);
    });

    it('should skip unmapped columns', () => {
      const data = [{ name: 'John', extra: 'ignored' }];
      const mapping = { name: 'name' };
      
      const result = applyMapping(data, mapping);
      
      expect(result[0]).toEqual({ name: 'John' });
      expect(result[0]).not.toHaveProperty('extra');
    });

    it('should skip empty mapping values', () => {
      const data = [{ name: 'John', age: 30 }];
      const mapping = { name: 'name', age: '' };
      
      const result = applyMapping(data, mapping);
      
      expect(result[0]).toEqual({ name: 'John' });
    });

    it('should handle missing source columns', () => {
      const data = [{ name: 'John' }];
      const mapping = { name: 'name', email: 'email' };
      
      const result = applyMapping(data, mapping);
      
      expect(result[0]).toEqual({ name: 'John' });
    });

    it('should handle multiple rows', () => {
      const data = [
        { name: 'John' },
        { name: 'Jane' },
        { name: 'Bob' },
      ];
      const mapping = { name: 'fullName' };
      
      const result = applyMapping(data, mapping);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ fullName: 'John' });
      expect(result[1]).toEqual({ fullName: 'Jane' });
      expect(result[2]).toEqual({ fullName: 'Bob' });
    });

    it('should preserve value types', () => {
      const data = [{ count: 42, active: true, tags: ['a', 'b'] }];
      const mapping = { count: 'count', active: 'active', tags: 'tags' };
      
      const result = applyMapping(data, mapping);
      
      expect(result[0].count).toBe(42);
      expect(result[0].active).toBe(true);
      expect(result[0].tags).toEqual(['a', 'b']);
    });
  });

  describe('getImportTemplates', () => {
    it('should return templates for contacts', () => {
      const templates = getImportTemplates('contacts');
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.find(t => t.id === 'basic')).toBeDefined();
      expect(templates.find(t => t.id === 'full')).toBeDefined();
    });

    it('should return templates for crew', () => {
      const templates = getImportTemplates('crew');
      
      expect(templates.length).toBeGreaterThan(0);
      const basic = templates.find(t => t.id === 'basic');
      expect(basic).toBeDefined();
      expect(basic?.mapping).toHaveProperty('name');
      expect(basic?.mapping).toHaveProperty('role');
    });

    it('should return templates for assets', () => {
      const templates = getImportTemplates('assets');
      
      expect(templates.length).toBeGreaterThan(0);
      const basic = templates.find(t => t.id === 'basic');
      expect(basic?.mapping).toHaveProperty('name');
      expect(basic?.mapping).toHaveProperty('category');
    });

    it('should return templates for equipment', () => {
      const templates = getImportTemplates('equipment');
      
      expect(templates.length).toBeGreaterThan(0);
      const basic = templates.find(t => t.id === 'basic');
      expect(basic?.mapping).toHaveProperty('name');
      expect(basic?.mapping).toHaveProperty('type');
    });

    it('should return default template for unknown entity type', () => {
      const templates = getImportTemplates('unknown');
      
      expect(templates.length).toBe(1);
      expect(templates[0].id).toBe('default');
      expect(templates[0].mapping).toHaveProperty('id');
      expect(templates[0].mapping).toHaveProperty('name');
    });

    it('should have mapping as field-to-field', () => {
      const templates = getImportTemplates('contacts');
      const basic = templates.find(t => t.id === 'basic');
      
      // Mapping should map field name to itself
      expect(basic?.mapping.first_name).toBe('first_name');
      expect(basic?.mapping.last_name).toBe('last_name');
      expect(basic?.mapping.email).toBe('email');
    });

    it('should have name property on all templates', () => {
      const entityTypes = ['contacts', 'crew', 'assets', 'equipment'];
      
      entityTypes.forEach(type => {
        const templates = getImportTemplates(type);
        templates.forEach(template => {
          expect(template.name).toBeTruthy();
          expect(typeof template.name).toBe('string');
        });
      });
    });
  });
});
