import { describe, it, expect } from 'vitest';
import type { Vendor } from '../useVendors';

describe('useVendors', () => {
  describe('Vendor interface', () => {
    it('should have all required fields', () => {
      const vendor: Vendor = {
        id: 'vendor-123',
        name: 'Acme Productions',
        email: 'contact@acme.com',
        category: 'Equipment Rental',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(vendor.id).toBe('vendor-123');
      expect(vendor.name).toBe('Acme Productions');
      expect(vendor.email).toBe('contact@acme.com');
      expect(vendor.category).toBe('Equipment Rental');
      expect(vendor.status).toBe('active');
    });

    it('should support all status values', () => {
      const statuses: Vendor['status'][] = ['active', 'inactive', 'pending'];
      expect(statuses.length).toBe(3);
    });

    it('should support active status', () => {
      const vendor: Vendor = {
        id: 'vendor-1',
        name: 'Active Vendor',
        email: 'active@vendor.com',
        category: 'Catering',
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      expect(vendor.status).toBe('active');
    });

    it('should support inactive status', () => {
      const vendor: Vendor = {
        id: 'vendor-2',
        name: 'Inactive Vendor',
        email: 'inactive@vendor.com',
        category: 'Lighting',
        status: 'inactive',
        created_at: '',
        updated_at: '',
      };
      expect(vendor.status).toBe('inactive');
    });

    it('should support pending status', () => {
      const vendor: Vendor = {
        id: 'vendor-3',
        name: 'New Vendor',
        email: 'new@vendor.com',
        category: 'Audio',
        status: 'pending',
        created_at: '',
        updated_at: '',
      };
      expect(vendor.status).toBe('pending');
    });

    it('should support optional contact info', () => {
      const vendor: Vendor = {
        id: 'vendor-1',
        name: 'Full Contact Vendor',
        email: 'contact@vendor.com',
        phone: '+1-555-123-4567',
        address: '123 Main St, City, ST 12345',
        contact_name: 'John Smith',
        category: 'Staging',
        status: 'active',
        created_at: '',
        updated_at: '',
      };
      expect(vendor.phone).toBe('+1-555-123-4567');
      expect(vendor.address).toBeDefined();
      expect(vendor.contact_name).toBe('John Smith');
    });

    it('should support optional financial info', () => {
      const vendor: Vendor = {
        id: 'vendor-1',
        name: 'Financial Vendor',
        email: 'finance@vendor.com',
        category: 'Equipment',
        status: 'active',
        payment_terms: 'Net 30',
        tax_id: '12-3456789',
        created_at: '',
        updated_at: '',
      };
      expect(vendor.payment_terms).toBe('Net 30');
      expect(vendor.tax_id).toBe('12-3456789');
    });

    it('should support optional performance metrics', () => {
      const vendor: Vendor = {
        id: 'vendor-1',
        name: 'Top Vendor',
        email: 'top@vendor.com',
        category: 'Catering',
        status: 'active',
        rating: 4.8,
        total_orders: 150,
        total_spend: 250000,
        created_at: '',
        updated_at: '',
      };
      expect(vendor.rating).toBe(4.8);
      expect(vendor.total_orders).toBe(150);
      expect(vendor.total_spend).toBe(250000);
    });

    it('should track vendor categories', () => {
      const vendors: Vendor[] = [
        { id: 'v1', name: 'Catering Co', email: 'c@c.com', category: 'Catering', status: 'active', created_at: '', updated_at: '' },
        { id: 'v2', name: 'Light Pro', email: 'l@l.com', category: 'Lighting', status: 'active', created_at: '', updated_at: '' },
        { id: 'v3', name: 'Sound Systems', email: 's@s.com', category: 'Audio', status: 'active', created_at: '', updated_at: '' },
        { id: 'v4', name: 'Stage Builders', email: 'st@st.com', category: 'Staging', status: 'active', created_at: '', updated_at: '' },
      ];

      const categories = new Set(vendors.map((v) => v.category));
      expect(categories.size).toBe(4);
    });

    it('should filter by status', () => {
      const vendors: Vendor[] = [
        { id: 'v1', name: 'Active 1', email: 'a1@v.com', category: 'Catering', status: 'active', created_at: '', updated_at: '' },
        { id: 'v2', name: 'Active 2', email: 'a2@v.com', category: 'Lighting', status: 'active', created_at: '', updated_at: '' },
        { id: 'v3', name: 'Inactive', email: 'i@v.com', category: 'Audio', status: 'inactive', created_at: '', updated_at: '' },
        { id: 'v4', name: 'Pending', email: 'p@v.com', category: 'Staging', status: 'pending', created_at: '', updated_at: '' },
      ];

      const active = vendors.filter((v) => v.status === 'active');
      expect(active.length).toBe(2);
    });
  });
});
