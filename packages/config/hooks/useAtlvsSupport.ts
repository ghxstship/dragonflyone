import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
  assignee?: string;
  requester: string;
  requesterEmail: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  ticketId: string;
  sender: string;
  senderType: 'User' | 'Agent' | 'System';
  content: string;
  attachments?: string[];
  createdAt: string;
}

interface LeadNurturing {
  id: string;
  leadId: string;
  leadName: string;
  campaignId: string;
  campaignName: string;
  stage: string;
  score: number;
  lastActivity: string;
  nextAction: string;
  nextActionDate: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Converted';
}

interface Feedback {
  id: string;
  type: 'Feature' | 'Bug';
  title: string;
  description: string;
  status: 'New' | 'Under Review' | 'Planned' | 'In Progress' | 'Completed' | 'Declined';
  priority: 'Low' | 'Medium' | 'High';
  votes: number;
  submittedBy: string;
  createdAt: string;
  updatedAt: string;
  comments: FeedbackComment[];
}

interface FeedbackComment {
  id: string;
  feedbackId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface BudgetForecast {
  id: string;
  name: string;
  period: string;
  startDate: string;
  endDate: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  actualRevenue?: number;
  actualExpenses?: number;
  variance?: number;
  status: 'Draft' | 'Active' | 'Completed';
  categories: ForecastCategory[];
}

interface ForecastCategory {
  id: string;
  name: string;
  projected: number;
  actual?: number;
  variance?: number;
}

interface FinancialReport {
  id: string;
  name: string;
  type: 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Custom';
  period: string;
  generatedAt: string;
  status: 'Generating' | 'Ready' | 'Error';
  downloadUrl?: string;
  data?: Record<string, unknown>;
}

interface PaymentPlan {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  startDate: string;
  nextPaymentDate: string;
  status: 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
}

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  layout: string;
  headerHtml?: string;
  footerHtml?: string;
  styles?: string;
  createdAt: string;
  updatedAt: string;
}

// API Base
const API_BASE = '/api/admin';

// Support Tickets
async function fetchSupportTickets(): Promise<SupportTicket[]> {
  const response = await fetch(`${API_BASE}/support/tickets`);
  if (!response.ok) throw new Error('Failed to fetch support tickets');
  return response.json();
}

async function fetchSupportTicket(id: string): Promise<SupportTicket> {
  const response = await fetch(`${API_BASE}/support/tickets/${id}`);
  if (!response.ok) throw new Error('Failed to fetch support ticket');
  return response.json();
}

export function useSupportTicketsQuery() {
  return useQuery({
    queryKey: ['support-tickets'],
    queryFn: fetchSupportTickets,
  });
}

export function useSupportTicketQuery(id: string | undefined) {
  return useQuery({
    queryKey: ['support-tickets', id],
    queryFn: () => fetchSupportTicket(id!),
    enabled: !!id,
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SupportTicket>) => {
      const response = await fetch(`${API_BASE}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create support ticket');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-tickets'] }),
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SupportTicket> & { id: string }) => {
      const response = await fetch(`${API_BASE}/support/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update support ticket');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets', variables.id] });
    },
  });
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, ...data }: Partial<TicketMessage> & { ticketId: string }) => {
      const response = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add message');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets', variables.ticketId] });
    },
  });
}

export function useSupportTickets() {
  const query = useSupportTicketsQuery();
  const tickets = query.data || [];
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const urgentTickets = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Closed').length;
  return { tickets, isLoading: query.isLoading, error: query.error, refetch: query.refetch, openTickets, urgentTickets };
}

export function useSupportTicket(id: string | undefined) {
  const query = useSupportTicketQuery(id);
  return { ticket: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
}

// Lead Nurturing
async function fetchLeadNurturing(): Promise<LeadNurturing[]> {
  const response = await fetch(`${API_BASE}/leads/nurturing`);
  if (!response.ok) throw new Error('Failed to fetch lead nurturing');
  return response.json();
}

export function useLeadNurturingQuery() {
  return useQuery({
    queryKey: ['lead-nurturing'],
    queryFn: fetchLeadNurturing,
  });
}

export function useUpdateLeadNurturing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LeadNurturing> & { id: string }) => {
      const response = await fetch(`${API_BASE}/leads/nurturing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update lead nurturing');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-nurturing'] }),
  });
}

export function useLeadNurturing() {
  const query = useLeadNurturingQuery();
  const leads = query.data || [];
  const activeLeads = leads.filter(l => l.status === 'Active').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  return { leads, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeLeads, convertedLeads };
}

// Feedback (Features & Bugs)
async function fetchFeedback(type: 'Feature' | 'Bug'): Promise<Feedback[]> {
  const response = await fetch(`${API_BASE}/feedback?type=${type}`);
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}

export function useFeatureFeedbackQuery() {
  return useQuery({
    queryKey: ['feedback', 'Feature'],
    queryFn: () => fetchFeedback('Feature'),
  });
}

export function useBugFeedbackQuery() {
  return useQuery({
    queryKey: ['feedback', 'Bug'],
    queryFn: () => fetchFeedback('Bug'),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Feedback>) => {
      const response = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create feedback');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', variables.type] });
    },
  });
}

export function useVoteFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; feedbackType: 'Feature' | 'Bug' }) => {
      const response = await fetch(`${API_BASE}/feedback/${params.id}/vote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', variables.feedbackType] });
    },
  });
}

export function useFeatureFeedback() {
  const query = useFeatureFeedbackQuery();
  const features = query.data || [];
  const plannedFeatures = features.filter(f => f.status === 'Planned').length;
  const inProgressFeatures = features.filter(f => f.status === 'In Progress').length;
  return { features, isLoading: query.isLoading, error: query.error, refetch: query.refetch, plannedFeatures, inProgressFeatures };
}

export function useBugFeedback() {
  const query = useBugFeedbackQuery();
  const bugs = query.data || [];
  const openBugs = bugs.filter(b => b.status === 'New' || b.status === 'Under Review').length;
  const highPriorityBugs = bugs.filter(b => b.priority === 'High' && b.status !== 'Completed').length;
  return { bugs, isLoading: query.isLoading, error: query.error, refetch: query.refetch, openBugs, highPriorityBugs };
}

// Budget Forecasting
async function fetchBudgetForecasts(): Promise<BudgetForecast[]> {
  const response = await fetch(`${API_BASE}/budgets/forecasts`);
  if (!response.ok) throw new Error('Failed to fetch budget forecasts');
  return response.json();
}

export function useBudgetForecastsQuery() {
  return useQuery({
    queryKey: ['budget-forecasts'],
    queryFn: fetchBudgetForecasts,
  });
}

export function useCreateBudgetForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<BudgetForecast>) => {
      const response = await fetch(`${API_BASE}/budgets/forecasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create budget forecast');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-forecasts'] }),
  });
}

export function useUpdateBudgetForecast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BudgetForecast> & { id: string }) => {
      const response = await fetch(`${API_BASE}/budgets/forecasts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update budget forecast');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-forecasts'] }),
  });
}

export function useBudgetForecasts() {
  const query = useBudgetForecastsQuery();
  const forecasts = query.data || [];
  const activeForecasts = forecasts.filter(f => f.status === 'Active').length;
  const totalProjectedProfit = forecasts.reduce((sum, f) => sum + f.projectedProfit, 0);
  return { forecasts, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeForecasts, totalProjectedProfit };
}

// Financial Reports
async function fetchFinancialReports(): Promise<FinancialReport[]> {
  const response = await fetch(`${API_BASE}/reports/financial`);
  if (!response.ok) throw new Error('Failed to fetch financial reports');
  return response.json();
}

export function useFinancialReportsQuery() {
  return useQuery({
    queryKey: ['financial-reports'],
    queryFn: fetchFinancialReports,
  });
}

export function useGenerateFinancialReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type: string; period: string; filters?: Record<string, unknown> }) => {
      const response = await fetch(`${API_BASE}/reports/financial/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['financial-reports'] }),
  });
}

export function useFinancialReports() {
  const query = useFinancialReportsQuery();
  const reports = query.data || [];
  const readyReports = reports.filter(r => r.status === 'Ready').length;
  return { reports, isLoading: query.isLoading, error: query.error, refetch: query.refetch, readyReports };
}

// Payment Plans
async function fetchPaymentPlans(): Promise<PaymentPlan[]> {
  const response = await fetch(`${API_BASE}/payments/plans`);
  if (!response.ok) throw new Error('Failed to fetch payment plans');
  return response.json();
}

export function usePaymentPlansQuery() {
  return useQuery({
    queryKey: ['payment-plans'],
    queryFn: fetchPaymentPlans,
  });
}

export function useCreatePaymentPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PaymentPlan>) => {
      const response = await fetch(`${API_BASE}/payments/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create payment plan');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-plans'] }),
  });
}

export function usePaymentPlans() {
  const query = usePaymentPlansQuery();
  const plans = query.data || [];
  const activePlans = plans.filter(p => p.status === 'Active').length;
  const totalOutstanding = plans.filter(p => p.status === 'Active').reduce((sum, p) => sum + p.remainingAmount, 0);
  return { plans, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activePlans, totalOutstanding };
}

// Invoice Templates
async function fetchInvoiceTemplates(): Promise<InvoiceTemplate[]> {
  const response = await fetch(`${API_BASE}/invoices/templates`);
  if (!response.ok) throw new Error('Failed to fetch invoice templates');
  return response.json();
}

export function useInvoiceTemplatesQuery() {
  return useQuery({
    queryKey: ['invoice-templates'],
    queryFn: fetchInvoiceTemplates,
  });
}

export function useCreateInvoiceTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<InvoiceTemplate>) => {
      const response = await fetch(`${API_BASE}/invoices/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create invoice template');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice-templates'] }),
  });
}

export function useUpdateInvoiceTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InvoiceTemplate> & { id: string }) => {
      const response = await fetch(`${API_BASE}/invoices/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update invoice template');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice-templates'] }),
  });
}

export function useDeleteInvoiceTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/invoices/templates/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete invoice template');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice-templates'] }),
  });
}

export function useInvoiceTemplates() {
  const query = useInvoiceTemplatesQuery();
  const templates = query.data || [];
  const defaultTemplate = templates.find(t => t.isDefault);
  return { templates, isLoading: query.isLoading, error: query.error, refetch: query.refetch, defaultTemplate };
}

// Community
interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  const response = await fetch(`${API_BASE}/community/posts`);
  if (!response.ok) throw new Error('Failed to fetch community posts');
  return response.json();
}

export function useCommunityPostsQuery() {
  return useQuery({
    queryKey: ['community-posts'],
    queryFn: fetchCommunityPosts,
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CommunityPost>) => {
      const response = await fetch(`${API_BASE}/community/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts'] }),
  });
}

export function useCommunityPosts() {
  const query = useCommunityPostsQuery();
  const posts = query.data || [];
  const pinnedPosts = posts.filter(p => p.isPinned).length;
  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments, 0);
  return { posts, isLoading: query.isLoading, error: query.error, refetch: query.refetch, pinnedPosts, totalEngagement };
}
