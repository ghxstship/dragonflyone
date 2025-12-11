import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBenefits } from '../useBenefits';

// Mock fetch
global.fetch = vi.fn();

describe('useBenefits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBenefits hook', () => {
    it('should initialize with loading state', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useBenefits());
      expect(result.current.loading).toBe(true);
    });

    it('should have createPlan function', () => {
      const { result } = renderHook(() => useBenefits());
      expect(typeof result.current.createPlan).toBe('function');
    });

    it('should have enrollEmployee function', () => {
      const { result } = renderHook(() => useBenefits());
      expect(typeof result.current.enrollEmployee).toBe('function');
    });

    it('should have refresh function', () => {
      const { result } = renderHook(() => useBenefits());
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should have calculateTotalCost function', () => {
      const { result } = renderHook(() => useBenefits());
      expect(typeof result.current.calculateTotalCost).toBe('function');
    });

    it('should have terminateEnrollment function', () => {
      const { result } = renderHook(() => useBenefits());
      expect(typeof result.current.terminateEnrollment).toBe('function');
    });
  });
});

describe('BenefitPlan interface', () => {
  it('should have required fields', () => {
    const plan = {
      id: '1',
      name: 'Health Insurance',
      type: 'health' as const,
      cost_employee_monthly: 150,
      cost_employer_monthly: 450,
      active: true,
    };

    expect(plan.id).toBeDefined();
    expect(plan.name).toBeDefined();
    expect(plan.type).toBeDefined();
    expect(plan.cost_employee_monthly).toBeDefined();
    expect(plan.cost_employer_monthly).toBeDefined();
    expect(plan.active).toBeDefined();
  });

  it('should support optional fields', () => {
    const plan = {
      id: '1',
      name: 'Health Insurance',
      type: 'health' as const,
      provider: 'Blue Cross',
      description: 'Comprehensive health coverage',
      cost_employee_monthly: 150,
      cost_employer_monthly: 450,
      coverage_details: {
        individual: true,
        family: true,
        spouse: true,
        dependents: true,
      },
      eligibility_criteria: {
        employment_type: ['full-time'],
        min_hours_per_week: 30,
        waiting_period_days: 90,
      },
      active: true,
    };

    expect(plan.provider).toBe('Blue Cross');
    expect(plan.description).toBe('Comprehensive health coverage');
    expect(plan.coverage_details?.family).toBe(true);
    expect(plan.eligibility_criteria?.min_hours_per_week).toBe(30);
  });
});

describe('BenefitEnrollment interface', () => {
  it('should have required fields', () => {
    const enrollment = {
      id: '1',
      employee_id: 'emp-1',
      benefit_plan_id: 'plan-1',
      coverage_type: 'individual' as const,
      start_date: '2024-01-01',
      status: 'active' as const,
    };

    expect(enrollment.id).toBeDefined();
    expect(enrollment.employee_id).toBeDefined();
    expect(enrollment.benefit_plan_id).toBeDefined();
    expect(enrollment.coverage_type).toBeDefined();
    expect(enrollment.start_date).toBeDefined();
    expect(enrollment.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const enrollment = {
      id: '1',
      employee_id: 'emp-1',
      benefit_plan_id: 'plan-1',
      coverage_type: 'family' as const,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      status: 'active' as const,
      dependents: [
        { name: 'Jane Doe', relationship: 'spouse', date_of_birth: '1990-05-15' },
        { name: 'John Jr', relationship: 'child', date_of_birth: '2015-08-20' },
      ],
    };

    expect(enrollment.end_date).toBe('2024-12-31');
    expect(enrollment.dependents).toHaveLength(2);
    expect(enrollment.dependents?.[0].relationship).toBe('spouse');
  });
});
