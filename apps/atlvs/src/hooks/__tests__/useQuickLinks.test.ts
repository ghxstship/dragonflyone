import { describe, it, expect } from 'vitest';
import type { QuickLink, UserQuickLinkFavorite } from '../useQuickLinks';

describe('useQuickLinks', () => {
  describe('QuickLink interface', () => {
    it('should have all required fields', () => {
      const link: QuickLink = {
        id: 'link-123',
        name: 'Create New Project',
        href: '/projects/new',
        icon: 'FolderPlus',
        category: 'projects',
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(link.id).toBe('link-123');
      expect(link.name).toBe('Create New Project');
      expect(link.href).toBe('/projects/new');
      expect(link.icon).toBe('FolderPlus');
      expect(link.category).toBe('projects');
      expect(link.is_active).toBe(true);
    });

    it('should support optional description', () => {
      const link: QuickLink = {
        id: 'link-123',
        name: 'Submit Expense',
        description: 'Submit a new expense report for reimbursement',
        href: '/expenses/new',
        icon: 'Receipt',
        category: 'finance',
        is_active: true,
        sort_order: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(link.description).toBe('Submit a new expense report for reimbursement');
    });

    it('should support all categories', () => {
      const categories: QuickLink['category'][] = [
        'projects',
        'finance',
        'assets',
        'crm',
        'reports',
        'settings',
        'general',
      ];
      expect(categories.length).toBe(7);
    });

    it('should support projects category', () => {
      const link: QuickLink = {
        id: 'link-1',
        name: 'View Projects',
        href: '/projects',
        icon: 'Folder',
        category: 'projects',
        is_active: true,
        sort_order: 1,
        created_at: '',
        updated_at: '',
      };
      expect(link.category).toBe('projects');
    });

    it('should support finance category', () => {
      const link: QuickLink = {
        id: 'link-2',
        name: 'View Budgets',
        href: '/budgets',
        icon: 'DollarSign',
        category: 'finance',
        is_active: true,
        sort_order: 2,
        created_at: '',
        updated_at: '',
      };
      expect(link.category).toBe('finance');
    });

    it('should support inactive links', () => {
      const link: QuickLink = {
        id: 'link-3',
        name: 'Deprecated Feature',
        href: '/old-feature',
        icon: 'Archive',
        category: 'general',
        is_active: false,
        sort_order: 99,
        created_at: '',
        updated_at: '',
      };
      expect(link.is_active).toBe(false);
    });
  });

  describe('UserQuickLinkFavorite interface', () => {
    it('should have all required fields', () => {
      const favorite: UserQuickLinkFavorite = {
        id: 'fav-123',
        user_id: 'user-456',
        quick_link_id: 'link-789',
        sort_order: 0,
        created_at: new Date().toISOString(),
      };

      expect(favorite.id).toBe('fav-123');
      expect(favorite.user_id).toBe('user-456');
      expect(favorite.quick_link_id).toBe('link-789');
      expect(favorite.sort_order).toBe(0);
    });

    it('should support optional quick_link relation', () => {
      const favorite: UserQuickLinkFavorite = {
        id: 'fav-123',
        user_id: 'user-456',
        quick_link_id: 'link-789',
        sort_order: 1,
        created_at: new Date().toISOString(),
        quick_link: {
          id: 'link-789',
          name: 'Create Project',
          href: '/projects/new',
          icon: 'FolderPlus',
          category: 'projects',
          is_active: true,
          sort_order: 1,
          created_at: '',
          updated_at: '',
        },
      };

      expect(favorite.quick_link?.name).toBe('Create Project');
      expect(favorite.quick_link?.href).toBe('/projects/new');
    });

    it('should track sort order for user customization', () => {
      const favorites: UserQuickLinkFavorite[] = [
        { id: 'fav-1', user_id: 'user-1', quick_link_id: 'link-1', sort_order: 0, created_at: '' },
        { id: 'fav-2', user_id: 'user-1', quick_link_id: 'link-2', sort_order: 1, created_at: '' },
        { id: 'fav-3', user_id: 'user-1', quick_link_id: 'link-3', sort_order: 2, created_at: '' },
      ];

      const sorted = favorites.sort((a, b) => a.sort_order - b.sort_order);
      expect(sorted[0].sort_order).toBe(0);
      expect(sorted[2].sort_order).toBe(2);
    });
  });

  describe('Default quick links', () => {
    const defaultQuickLinks: QuickLink[] = [
      { id: 'default-1', name: 'Create New Project', description: 'Start a new project from scratch', href: '/projects/new', icon: 'FolderPlus', category: 'projects', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
      { id: 'default-2', name: 'Submit Expense Report', description: 'Submit a new expense for reimbursement', href: '/expenses/new', icon: 'Receipt', category: 'finance', is_active: true, sort_order: 10, created_at: '', updated_at: '' },
      { id: 'default-3', name: 'Check Asset Availability', description: 'View asset availability calendar', href: '/assets/availability', icon: 'Calendar', category: 'assets', is_active: true, sort_order: 20, created_at: '', updated_at: '' },
      { id: 'default-4', name: 'Generate Financial Report', description: 'Create financial summary report', href: '/reports/financial/new', icon: 'FileBarChart', category: 'reports', is_active: true, sort_order: 40, created_at: '', updated_at: '' },
    ];

    it('should have default links for fallback', () => {
      expect(defaultQuickLinks.length).toBe(4);
    });

    it('should cover multiple categories', () => {
      const categories = new Set(defaultQuickLinks.map((l) => l.category));
      expect(categories.size).toBe(4);
      expect(categories.has('projects')).toBe(true);
      expect(categories.has('finance')).toBe(true);
      expect(categories.has('assets')).toBe(true);
      expect(categories.has('reports')).toBe(true);
    });

    it('should all be active', () => {
      const allActive = defaultQuickLinks.every((l) => l.is_active);
      expect(allActive).toBe(true);
    });
  });
});
