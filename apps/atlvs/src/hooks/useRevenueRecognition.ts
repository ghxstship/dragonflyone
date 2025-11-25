import { useState, useEffect, useCallback } from 'react';

export interface RevenueRule {
  id: string;
  project_id: string;
  revenue_type: 'upfront' | 'milestone' | 'time_based' | 'completion' | 'subscription';
  total_amount: number;
  recognition_start_date: string;
  recognition_end_date?: string;
  milestones?: Array<{
    name: string;
    percentage: number;
    date: string;
    status: 'pending' | 'completed' | 'deferred';
  }>;
  schedule_type?: 'monthly' | 'quarterly' | 'custom';
  status: string;
  created_at: string;
  projects?: {
    id: string;
    name: string;
    client_name: string;
    total_budget: number;
  };
}

export interface ScheduleEntry {
  id: string;
  rule_id: string;
  recognition_date: string;
  amount: number;
  status: 'pending' | 'recognized' | 'deferred';
  description: string;
  recognized_at?: string;
  metadata?: Record<string, any>;
}

export function useRevenueRecognition(projectId?: string) {
  const [rules, setRules] = useState<RevenueRule[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch revenue recognition rules
  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (projectId) params.append('project_id', projectId);
      
      const response = await fetch(`/api/revenue-recognition?${params.toString()}`);
      const data = await response.json();
      setRules(data.rules || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revenue recognition rules');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Create new revenue recognition rule
  const createRule = async (ruleData: Partial<RevenueRule>) => {
    try {
      setError(null);
      const response = await fetch('/api/revenue-recognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create rule');
      }
      
      const data = await response.json();
      await fetchRules(); // Refresh list
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Process revenue recognition (recognize scheduled entry)
  const processRecognition = async (scheduleId: string, status?: string) => {
    try {
      setError(null);
      const response = await fetch('/api/revenue-recognition', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule_id: scheduleId, status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process recognition');
      }
      
      await fetchRules(); // Refresh data
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Get recognition schedule for a rule
  const getSchedule = async (ruleId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/revenue-recognition/schedule?rule_id=${ruleId}`);
      const data = await response.json();
      setSchedule(data.schedule || []);
      return data.schedule;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedule');
      return [];
    }
  };

  // Calculate total recognized revenue
  const calculateRecognized = (ruleId: string) => {
    return schedule
      .filter(entry => entry.rule_id === ruleId && entry.status === 'recognized')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  // Calculate pending revenue
  const calculatePending = (ruleId: string) => {
    return schedule
      .filter(entry => entry.rule_id === ruleId && entry.status === 'pending')
      .reduce((sum, entry) => sum + entry.amount, 0);
  };

  // Get upcoming recognitions (next 30 days)
  const getUpcomingRecognitions = () => {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return schedule.filter(entry => {
      const entryDate = new Date(entry.recognition_date);
      return entry.status === 'pending' && 
             entryDate >= today && 
             entryDate <= thirtyDaysLater;
    }).sort((a, b) => new Date(a.recognition_date).getTime() - new Date(b.recognition_date).getTime());
  };

  // Get analytics
  const getAnalytics = () => {
    const totalRevenue = rules.reduce((sum, rule) => sum + rule.total_amount, 0);
    const recognizedRevenue = schedule
      .filter(entry => entry.status === 'recognized')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const pendingRevenue = schedule
      .filter(entry => entry.status === 'pending')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const deferredRevenue = schedule
      .filter(entry => entry.status === 'deferred')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalRevenue,
      recognizedRevenue,
      pendingRevenue,
      deferredRevenue,
      recognitionRate: totalRevenue > 0 ? (recognizedRevenue / totalRevenue) * 100 : 0
    };
  };

  useEffect(() => {
    fetchRules();
  }, [projectId, fetchRules]);

  return {
    rules,
    schedule,
    loading,
    error,
    createRule,
    processRecognition,
    getSchedule,
    calculateRecognized,
    calculatePending,
    getUpcomingRecognitions,
    getAnalytics,
    refresh: fetchRules
  };
}
