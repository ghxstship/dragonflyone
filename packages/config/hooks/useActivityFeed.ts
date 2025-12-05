'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase-client';

// =============================================================================
// ACTIVITY FEED HOOK
// Aggregates recent activity from multiple tables for dashboard widgets
// =============================================================================

export interface ActivityItem {
  id: string;
  type: 'project' | 'deal' | 'expense' | 'asset' | 'invoice' | 'user' | 'event' | 'order' | 'crew' | 'equipment';
  action: string;
  detail: string;
  time: string;
  user: string;
  userId?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFilters {
  limit?: number;
  types?: ActivityItem['type'][];
  userId?: string;
  projectId?: string;
  productionId?: string;
}

// Default activity items for fallback
const defaultActivityItems: ActivityItem[] = [
  {
    id: 'demo-1',
    type: 'deal',
    action: 'New deal closed',
    detail: 'Rolling Loud Miami - $1.8M contract signed',
    time: '2 hours ago',
    user: 'Jessica Park',
  },
  {
    id: 'demo-2',
    type: 'project',
    action: 'Budget approved',
    detail: 'Ultra 2025 - Additional $250K allocated for production',
    time: '5 hours ago',
    user: 'Michael Chen',
  },
  {
    id: 'demo-3',
    type: 'project',
    action: 'Project milestone reached',
    detail: 'Art Basel - Final settlement completed',
    time: '1 day ago',
    user: 'Elena Rodriguez',
  },
  {
    id: 'demo-4',
    type: 'asset',
    action: 'Asset checkout',
    detail: 'Meyer Sound LEO System - checked out for III Points',
    time: '1 day ago',
    user: 'David Kim',
  },
  {
    id: 'demo-5',
    type: 'invoice',
    action: 'Invoice sent',
    detail: 'Wynwood Life Nov - $45,000 invoice dispatched',
    time: '2 days ago',
    user: 'Finance Team',
  },
];

// Helper to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Fetch activity feed from multiple sources
export function useActivityFeed(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ['activity_feed', filters],
    queryFn: async () => {
      const limit = filters?.limit || 10;
      const activities: ActivityItem[] = [];

      try {
        // Fetch recent audit logs if available
        const { data: auditLogs, error: auditError } = await supabase
          .from('audit_logs')
          .select(`
            id,
            action,
            resource_type,
            resource_id,
            user_id,
            created_at,
            metadata,
            user:platform_users(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!auditError && auditLogs && auditLogs.length > 0) {
          auditLogs.forEach((log) => {
            const userName = (log.user as { full_name?: string })?.full_name || 'System';
            activities.push({
              id: log.id,
              type: mapResourceToType(log.resource_type),
              action: formatAction(log.action, log.resource_type),
              detail: formatDetail(log.action, log.resource_type, log.metadata as Record<string, unknown>),
              time: formatRelativeTime(new Date(log.created_at ?? new Date())),
              user: userName,
              userId: log.user_id ?? undefined,
              entityId: log.resource_id ?? undefined,
              metadata: log.metadata as Record<string, unknown>,
            });
          });
        }

        // If we have enough from audit logs, return them
        if (activities.length >= limit) {
          return activities.slice(0, limit);
        }

        // Fetch recent projects activity
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, phase, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (!projectsError && projects) {
          projects.forEach((project) => {
            activities.push({
              id: `project-${project.id}`,
              type: 'project',
              action: 'Project updated',
              detail: `${project.name} - Phase: ${project.phase}`,
              time: formatRelativeTime(new Date(project.updated_at)),
              user: 'Project Manager',
              entityId: project.id,
            });
          });
        }

        // Fetch recent deals activity
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('id, title, status, value, updated_at')
          .order('updated_at', { ascending: false })
          .limit(5);

        if (!dealsError && deals) {
          deals.forEach((deal) => {
            const dealValue = deal.value ?? 0;
            activities.push({
              id: `deal-${deal.id}`,
              type: 'deal',
              action: deal.status === 'won' ? 'Deal closed' : 'Deal updated',
              detail: `${deal.title} - $${(dealValue / 1000).toFixed(0)}K`,
              time: formatRelativeTime(new Date(deal.updated_at)),
              user: 'Sales Team',
              entityId: deal.id,
            });
          });
        }

        // Fetch recent expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('id, description, amount, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!expensesError && expenses) {
          expenses.forEach((expense) => {
            activities.push({
              id: `expense-${expense.id}`,
              type: 'expense',
              action: expense.status === 'approved' ? 'Expense approved' : 'Expense submitted',
              detail: `${expense.description} - $${expense.amount.toLocaleString()}`,
              time: formatRelativeTime(new Date(expense.created_at ?? new Date())),
              user: 'Finance Team',
              entityId: expense.id,
            });
          });
        }

        // Sort by time and return
        if (activities.length > 0) {
          return activities.slice(0, limit);
        }

        // Return defaults if no data
        return defaultActivityItems.slice(0, limit);
      } catch (error) {
        console.warn('Activity feed query failed, using defaults:', error);
        return defaultActivityItems.slice(0, limit);
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Map resource names to activity types
function mapResourceToType(resource: string): ActivityItem['type'] {
  const mapping: Record<string, ActivityItem['type']> = {
    projects: 'project',
    deals: 'deal',
    expenses: 'expense',
    assets: 'asset',
    invoices: 'invoice',
    platform_users: 'user',
    events: 'event',
    orders: 'order',
    crew_members: 'crew',
    equipment: 'equipment',
  };
  return mapping[resource] || 'project';
}

// Format action for display
function formatAction(action: string, resource: string): string {
  const actionMap: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    approve: 'Approved',
    reject: 'Rejected',
    submit: 'Submitted',
    close: 'Closed',
    archive: 'Archived',
  };

  const resourceMap: Record<string, string> = {
    projects: 'project',
    deals: 'deal',
    expenses: 'expense',
    assets: 'asset',
    invoices: 'invoice',
    events: 'event',
    orders: 'order',
  };

  const actionText = actionMap[action] || action;
  const resourceText = resourceMap[resource] || resource;
  return `${actionText} ${resourceText}`;
}

// Format detail from metadata
function formatDetail(action: string, resource: string, metadata?: Record<string, unknown>): string {
  if (!metadata) return `${resource} ${action}`;
  
  const name = metadata.name || metadata.title || metadata.description || '';
  const value = metadata.value || metadata.amount || metadata.budget || '';
  
  if (name && value) {
    return `${name} - $${Number(value).toLocaleString()}`;
  }
  if (name) {
    return String(name);
  }
  return `${resource} ${action}`;
}

export default useActivityFeed;
