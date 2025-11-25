import { useState, useEffect, useCallback } from 'react';

export interface BenefitPlan {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement' | 'pto' | 'other';
  provider?: string;
  description?: string;
  cost_employee_monthly: number;
  cost_employer_monthly: number;
  coverage_details?: {
    individual?: boolean;
    family?: boolean;
    spouse?: boolean;
    dependents?: boolean;
  };
  eligibility_criteria?: {
    employment_type?: string[];
    min_hours_per_week?: number;
    waiting_period_days?: number;
  };
  active: boolean;
}

export interface BenefitEnrollment {
  id: string;
  employee_id: string;
  benefit_plan_id: string;
  coverage_type: 'individual' | 'family' | 'spouse' | 'dependents';
  start_date: string;
  end_date?: string;
  status: 'active' | 'pending' | 'terminated' | 'declined';
  dependents?: Array<{
    name: string;
    relationship: string;
    date_of_birth: string;
  }>;
}

export function useBenefits(employeeId?: string) {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async (activeOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'plans' });
      if (activeOnly) params.append('active', 'true');
      
      const response = await fetch(`/api/benefits?${params.toString()}`);
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch benefit plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: 'enrollments' });
      if (employeeId) params.append('employee_id', employeeId);
      
      const response = await fetch(`/api/benefits?${params.toString()}`);
      const data = await response.json();
      setEnrollments(data.enrollments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  const createPlan = async (planData: Partial<BenefitPlan>) => {
    try {
      setError(null);
      const response = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: planData })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create plan');
      }
      
      await fetchPlans();
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const enrollEmployee = async (enrollmentData: Partial<BenefitEnrollment>) => {
    try {
      setError(null);
      const response = await fetch('/api/benefits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'enrollment', data: enrollmentData })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enroll employee');
      }
      
      await fetchEnrollments();
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updatePlan = async (id: string, updates: Partial<BenefitPlan>) => {
    try {
      setError(null);
      const response = await fetch('/api/benefits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'plan', updates })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update plan');
      }
      
      await fetchPlans();
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const terminateEnrollment = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/benefits?id=${id}&type=enrollment`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to terminate enrollment');
      }
      
      await fetchEnrollments();
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const calculateTotalCost = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return { employee: 0, employer: 0, total: 0 };
    
    const plan = plans.find(p => p.id === enrollment.benefit_plan_id);
    if (!plan) return { employee: 0, employer: 0, total: 0 };
    
    return {
      employee: plan.cost_employee_monthly,
      employer: plan.cost_employer_monthly,
      total: plan.cost_employee_monthly + plan.cost_employer_monthly
    };
  };

  useEffect(() => {
    fetchPlans(true);
    if (employeeId) {
      fetchEnrollments();
    }
  }, [employeeId, fetchPlans, fetchEnrollments]);

  return {
    plans,
    enrollments,
    loading,
    error,
    createPlan,
    enrollEmployee,
    updatePlan,
    terminateEnrollment,
    calculateTotalCost,
    refresh: () => {
      fetchPlans();
      fetchEnrollments();
    }
  };
}
