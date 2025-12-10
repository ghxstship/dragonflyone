import { describe, it, expect } from 'vitest';
import type { MerchItem } from '../useMerch';

describe('useMerch', () => {
  describe('MerchItem interface', () => {
    it('should have all required fields', () => {
      const item: MerchItem = {
        id: 'merch-123',
        name: 'Event T-Shirt',
        description: 'Official event merchandise',
        price: 29.99,
        category: 'Apparel',
        stock: 100,
        images: ['https://example.com/tshirt.jpg'],
        status: 'active',
      };

      expect(item.id).toBe('merch-123');
      expect(item.name).toBe('Event T-Shirt');
      expect(item.price).toBe(29.99);
      expect(item.category).toBe('Apparel');
      expect(item.stock).toBe(100);
      expect(item.status).toBe('active');
    });

    it('should support all status values', () => {
      const statuses: MerchItem['status'][] = ['active', 'inactive', 'sold_out'];
      expect(statuses.length).toBe(3);
    });

    it('should support active status', () => {
      const item: MerchItem = {
        id: 'merch-1',
        name: 'Cap',
        description: 'Baseball cap',
        price: 24.99,
        category: 'Accessories',
        stock: 50,
        images: [],
        status: 'active',
      };
      expect(item.status).toBe('active');
    });

    it('should support inactive status', () => {
      const item: MerchItem = {
        id: 'merch-2',
        name: 'Limited Edition Poster',
        description: 'No longer available',
        price: 19.99,
        category: 'Collectibles',
        stock: 0,
        images: [],
        status: 'inactive',
      };
      expect(item.status).toBe('inactive');
    });

    it('should support sold_out status', () => {
      const item: MerchItem = {
        id: 'merch-3',
        name: 'VIP Hoodie',
        description: 'Sold out',
        price: 79.99,
        category: 'Apparel',
        stock: 0,
        images: [],
        status: 'sold_out',
      };
      expect(item.status).toBe('sold_out');
    });

    it('should support optional sizes', () => {
      const item: MerchItem = {
        id: 'merch-1',
        name: 'T-Shirt',
        description: 'Cotton tee',
        price: 29.99,
        category: 'Apparel',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 200,
        images: [],
        status: 'active',
      };
      expect(item.sizes?.length).toBe(5);
      expect(item.sizes).toContain('M');
    });

    it('should support optional colors', () => {
      const item: MerchItem = {
        id: 'merch-1',
        name: 'Hoodie',
        description: 'Pullover hoodie',
        price: 59.99,
        category: 'Apparel',
        colors: ['Black', 'Navy', 'Gray'],
        stock: 75,
        images: [],
        status: 'active',
      };
      expect(item.colors?.length).toBe(3);
      expect(item.colors).toContain('Black');
    });

    it('should support multiple images', () => {
      const item: MerchItem = {
        id: 'merch-1',
        name: 'Premium Jacket',
        description: 'Event jacket',
        price: 149.99,
        category: 'Apparel',
        stock: 25,
        images: [
          'https://example.com/jacket-front.jpg',
          'https://example.com/jacket-back.jpg',
          'https://example.com/jacket-detail.jpg',
        ],
        status: 'active',
      };
      expect(item.images.length).toBe(3);
    });

    it('should support event association', () => {
      const item: MerchItem = {
        id: 'merch-1',
        name: 'Festival Tee',
        description: 'Summer Festival 2025',
        price: 34.99,
        category: 'Apparel',
        stock: 500,
        images: [],
        event_id: 'event-123',
        status: 'active',
      };
      expect(item.event_id).toBe('event-123');
    });

    it('should track inventory', () => {
      const items: MerchItem[] = [
        { id: 'm1', name: 'Shirt', description: '', price: 25, category: 'Apparel', stock: 100, images: [], status: 'active' },
        { id: 'm2', name: 'Hat', description: '', price: 20, category: 'Accessories', stock: 50, images: [], status: 'active' },
        { id: 'm3', name: 'Poster', description: '', price: 15, category: 'Collectibles', stock: 0, images: [], status: 'sold_out' },
        { id: 'm4', name: 'Mug', description: '', price: 12, category: 'Accessories', stock: 75, images: [], status: 'active' },
      ];

      const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
      const inStock = items.filter((i) => i.stock > 0).length;
      const soldOut = items.filter((i) => i.status === 'sold_out').length;

      expect(totalStock).toBe(225);
      expect(inStock).toBe(3);
      expect(soldOut).toBe(1);
    });

    it('should calculate total value', () => {
      const items: MerchItem[] = [
        { id: 'm1', name: 'Shirt', description: '', price: 25, category: 'Apparel', stock: 100, images: [], status: 'active' },
        { id: 'm2', name: 'Hat', description: '', price: 20, category: 'Accessories', stock: 50, images: [], status: 'active' },
      ];

      const totalValue = items.reduce((sum, i) => sum + i.price * i.stock, 0);
      expect(totalValue).toBe(3500); // (25*100) + (20*50)
    });
  });
});
