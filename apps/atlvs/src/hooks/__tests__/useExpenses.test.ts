import { describe, it, expect } from 'vitest';
import type { Expense, ExpenseCategory } from '../useExpenses';

describe('useExpenses', () => {
  describe('ExpenseCategory interface', () => {
    it('should have all required fields', () => {
      const category: ExpenseCategory = {
        id: 'cat-123',
        production_id: 'prod-456',
        name: 'Travel',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(category.id).toBe('cat-123');
      expect(category.production_id).toBe('prod-456');
      expect(category.name).toBe('Travel');
      expect(category.is_active).toBe(true);
    });

    it('should support optional budget amount', () => {
      const category: ExpenseCategory = {
        id: 'cat-1',
        production_id: 'prod-1',
        name: 'Catering',
        budget_amount: 50000,
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      expect(category.budget_amount).toBe(50000);
    });

    it('should support parent category', () => {
      const category: ExpenseCategory = {
        id: 'cat-2',
        production_id: 'prod-1',
        name: 'Airfare',
        parent_category_id: 'cat-travel',
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      expect(category.parent_category_id).toBe('cat-travel');
    });
  });

  describe('Expense interface', () => {
    it('should have all required fields', () => {
      const expense: Expense = {
        id: 'exp-123',
        production_id: 'prod-456',
        submitted_by: 'user-789',
        description: 'Flight to venue',
        amount: 450.00,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'submitted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(expense.id).toBe('exp-123');
      expect(expense.production_id).toBe('prod-456');
      expect(expense.amount).toBe(450.00);
      expect(expense.currency).toBe('USD');
      expect(expense.status).toBe('submitted');
    });

    it('should support all status values', () => {
      const statuses: Expense['status'][] = ['draft', 'submitted', 'approved', 'rejected', 'paid', 'reimbursed'];
      expect(statuses.length).toBe(6);
    });

    it('should support draft status', () => {
      const expense: Expense = {
        id: 'exp-1',
        production_id: 'prod-1',
        submitted_by: 'user-1',
        description: 'Draft expense',
        amount: 100,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'draft',
        created_at: '',
        updated_at: '',
      };
      expect(expense.status).toBe('draft');
    });

    it('should support approved status with approver', () => {
      const expense: Expense = {
        id: 'exp-2',
        production_id: 'prod-1',
        submitted_by: 'user-1',
        description: 'Approved expense',
        amount: 500,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'approved',
        approved_by: 'manager-1',
        approved_at: '2025-01-16T10:00:00Z',
        created_at: '',
        updated_at: '',
      };
      expect(expense.status).toBe('approved');
      expect(expense.approved_by).toBe('manager-1');
    });

    it('should support paid status with payment info', () => {
      const expense: Expense = {
        id: 'exp-3',
        production_id: 'prod-1',
        submitted_by: 'user-1',
        description: 'Paid expense',
        amount: 750,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'paid',
        paid_at: '2025-01-20T14:00:00Z',
        payment_method: 'ACH Transfer',
        payment_reference: 'PAY-123456',
        created_at: '',
        updated_at: '',
      };
      expect(expense.status).toBe('paid');
      expect(expense.payment_method).toBe('ACH Transfer');
    });

    it('should support optional vendor and receipt', () => {
      const expense: Expense = {
        id: 'exp-1',
        production_id: 'prod-1',
        submitted_by: 'user-1',
        vendor_name: 'Delta Airlines',
        description: 'Flight booking',
        amount: 650,
        currency: 'USD',
        expense_date: '2025-01-15',
        receipt_url: 'https://storage.example.com/receipts/exp-1.pdf',
        status: 'submitted',
        created_at: '',
        updated_at: '',
      };
      expect(expense.vendor_name).toBe('Delta Airlines');
      expect(expense.receipt_url).toBeDefined();
    });

    it('should support optional tags', () => {
      const expense: Expense = {
        id: 'exp-1',
        production_id: 'prod-1',
        submitted_by: 'user-1',
        description: 'Equipment rental',
        amount: 2000,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'approved',
        tags: ['equipment', 'rental', 'stage'],
        created_at: '',
        updated_at: '',
      };
      expect(expense.tags?.length).toBe(3);
      expect(expense.tags).toContain('equipment');
    });

    it('should support joined category data', () => {
      const expense: Expense = {
        id: 'exp-1',
        production_id: 'prod-1',
        category_id: 'cat-1',
        submitted_by: 'user-1',
        description: 'Hotel stay',
        amount: 350,
        currency: 'USD',
        expense_date: '2025-01-15',
        status: 'submitted',
        created_at: '',
        updated_at: '',
        category: {
          id: 'cat-1',
          production_id: 'prod-1',
          name: 'Accommodation',
          is_active: true,
          created_at: '',
          updated_at: '',
        },
      };
      expect(expense.category?.name).toBe('Accommodation');
    });

    it('should track expense totals', () => {
      const expenses: Expense[] = [
        { id: 'e1', production_id: 'p1', submitted_by: 'u1', description: 'Flight', amount: 500, currency: 'USD', expense_date: '2025-01-15', status: 'approved', created_at: '', updated_at: '' },
        { id: 'e2', production_id: 'p1', submitted_by: 'u1', description: 'Hotel', amount: 350, currency: 'USD', expense_date: '2025-01-15', status: 'approved', created_at: '', updated_at: '' },
        { id: 'e3', production_id: 'p1', submitted_by: 'u1', description: 'Meals', amount: 150, currency: 'USD', expense_date: '2025-01-15', status: 'submitted', created_at: '', updated_at: '' },
        { id: 'e4', production_id: 'p1', submitted_by: 'u1', description: 'Rejected', amount: 100, currency: 'USD', expense_date: '2025-01-15', status: 'rejected', created_at: '', updated_at: '' },
      ];

      const approved = expenses.filter((e) => e.status === 'approved');
      const totalApproved = approved.reduce((sum, e) => sum + e.amount, 0);

      expect(approved.length).toBe(2);
      expect(totalApproved).toBe(850);
    });
  });
});
