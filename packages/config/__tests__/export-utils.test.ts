import { describe, it, expect } from 'vitest';
import {
  generateExportFilename,
  toCSV,
  toJSON,
} from '../export-utils';

describe('export-utils', () => {
  describe('generateExportFilename', () => {
    it('should generate filename with date and csv extension', () => {
      const filename = generateExportFilename('crew', 'csv');
      expect(filename).toMatch(/^crew-export-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate filename with json extension', () => {
      const filename = generateExportFilename('assets', 'json');
      expect(filename).toMatch(/^assets-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should generate filename with xlsx extension for excel', () => {
      const filename = generateExportFilename('projects', 'excel');
      expect(filename).toMatch(/^projects-export-\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should generate filename with pdf extension', () => {
      const filename = generateExportFilename('reports', 'pdf');
      expect(filename).toMatch(/^reports-export-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should use current date', () => {
      const today = new Date().toISOString().split('T')[0];
      const filename = generateExportFilename('test', 'csv');
      expect(filename).toContain(today);
    });
  });

  describe('toCSV', () => {
    it('should convert data to CSV format', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const columns = ['name', 'age'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name,age\nJohn,30\nJane,25');
    });

    it('should handle empty data', () => {
      const csv = toCSV([], ['name', 'age']);
      expect(csv).toBe('name,age');
    });

    it('should escape values with commas', () => {
      const data = [{ name: 'Doe, John', city: 'New York' }];
      const columns = ['name', 'city'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name,city\n"Doe, John",New York');
    });

    it('should escape values with quotes', () => {
      const data = [{ name: 'John "Johnny" Doe' }];
      const columns = ['name'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name\n"John ""Johnny"" Doe"');
    });

    it('should escape values with newlines', () => {
      const data = [{ description: 'Line 1\nLine 2' }];
      const columns = ['description'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('description\n"Line 1\nLine 2"');
    });

    it('should handle null and undefined values', () => {
      const data = [{ name: null, age: undefined }];
      const columns = ['name', 'age'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name,age\n,');
    });

    it('should only include selected columns', () => {
      const data = [{ name: 'John', age: 30, city: 'NYC' }];
      const columns = ['name', 'city'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name,city\nJohn,NYC');
    });

    it('should handle missing columns in data', () => {
      const data = [{ name: 'John' }];
      const columns = ['name', 'age'];
      const csv = toCSV(data, columns);
      
      expect(csv).toBe('name,age\nJohn,');
    });
  });

  describe('toJSON', () => {
    it('should convert data to JSON format', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const columns = ['name', 'age'];
      const json = toJSON(data, columns);
      const parsed = JSON.parse(json);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({ name: 'John', age: 30 });
      expect(parsed[1]).toEqual({ name: 'Jane', age: 25 });
    });

    it('should handle empty data', () => {
      const json = toJSON([], ['name', 'age']);
      const parsed = JSON.parse(json);
      
      expect(parsed).toEqual([]);
    });

    it('should only include selected columns', () => {
      const data = [{ name: 'John', age: 30, city: 'NYC' }];
      const columns = ['name', 'city'];
      const json = toJSON(data, columns);
      const parsed = JSON.parse(json);
      
      expect(parsed[0]).toEqual({ name: 'John', city: 'NYC' });
      expect(parsed[0]).not.toHaveProperty('age');
    });

    it('should handle null and undefined values', () => {
      const data = [{ name: null, age: undefined }];
      const columns = ['name', 'age'];
      const json = toJSON(data, columns);
      const parsed = JSON.parse(json);
      
      expect(parsed[0].name).toBeNull();
      expect(parsed[0].age).toBeUndefined();
    });

    it('should format JSON with indentation', () => {
      const data = [{ name: 'John' }];
      const columns = ['name'];
      const json = toJSON(data, columns);
      
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should handle nested objects', () => {
      const data = [{ user: { name: 'John', id: 1 } }];
      const columns = ['user'];
      const json = toJSON(data, columns);
      const parsed = JSON.parse(json);
      
      expect(parsed[0].user).toEqual({ name: 'John', id: 1 });
    });

    it('should handle arrays in data', () => {
      const data = [{ tags: ['a', 'b', 'c'] }];
      const columns = ['tags'];
      const json = toJSON(data, columns);
      const parsed = JSON.parse(json);
      
      expect(parsed[0].tags).toEqual(['a', 'b', 'c']);
    });
  });
});
