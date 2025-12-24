'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ticket, Plus, Search, Filter, Clock, AlertCircle, CheckCircle, MessageSquare, User } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  replies_count: number;
  assigned_to?: string;
}

const DEMO_TICKETS: SupportTicket[] = [
  { id: 'TKT-001', subject: 'Cannot export budget reports', description: 'When I try to export the budget report to PDF, it shows an error message.', status: 'open', priority: 'high', category: 'Bug Report', created_at: '2025-01-13T10:00:00Z', updated_at: '2025-01-13T10:00:00Z', replies_count: 0 },
  { id: 'TKT-002', subject: 'Feature request: Bulk invoice generation', description: 'It would be great to generate multiple invoices at once.', status: 'in_progress', priority: 'medium', category: 'Feature Request', created_at: '2025-01-12T15:30:00Z', updated_at: '2025-01-13T09:15:00Z', replies_count: 3, assigned_to: 'Sarah M.' },
  { id: 'TKT-003', subject: 'How to set up calendar sync?', description: 'I need help connecting my Google Calendar to ATLVS.', status: 'waiting', priority: 'low', category: 'Question', created_at: '2025-01-11T08:00:00Z', updated_at: '2025-01-12T14:20:00Z', replies_count: 2, assigned_to: 'John D.' },
  { id: 'TKT-004', subject: 'Billing discrepancy on last invoice', description: 'The amount charged does not match what was quoted.', status: 'resolved', priority: 'urgent', category: 'Billing', created_at: '2025-01-10T11:00:00Z', updated_at: '2025-01-11T16:45:00Z', replies_count: 5, assigned_to: 'Mike R.' },
  { id: 'TKT-005', subject: 'Team member cannot access production', description: 'One of our team members is getting a permission error.', status: 'closed', priority: 'medium', category: 'Access Issue', created_at: '2025-01-08T09:00:00Z', updated_at: '2025-01-09T10:30:00Z', replies_count: 4, assigned_to: 'Sarah M.' },
];

const STATUS_OPTIONS = ['all', 'open', 'in_progress', 'waiting', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'urgent'];
const CATEGORY_OPTIONS = ['All Categories', 'Bug Report', 'Feature Request', 'Question', 'Billing', 'Access Issue', 'Other'];

export default function SupportTicketsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState<{ subject: string; description: string; category: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>({ subject: '', description: '', category: 'Question', priority: 'medium' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['support-tickets', statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(`/api/support/tickets?${params}`);
      if (!response.ok) {
        return { tickets: DEMO_TICKETS };
      }
      return response.json();
    },
  });

  const tickets: SupportTicket[] = data?.tickets || DEMO_TICKETS;

  const createTicket = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      if (!response.ok) throw new Error('Failed to create ticket');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setShowNewTicketModal(false);
      setNewTicket({ subject: '', description: '', category: 'Question', priority: 'medium' });
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!ticket.subject.toLowerCase().includes(query) && !ticket.id.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-primary/10 text-primary';
      case 'in_progress': return 'bg-warning/10 text-warning';
      case 'waiting': return 'bg-muted text-muted-foreground';
      case 'resolved': return 'bg-success/10 text-success';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-primary/10 text-primary';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'waiting': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading support tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <Text className="text-destructive">Failed to load support tickets</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Support Tickets
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              View and manage your support requests
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-background border-2 border-border rounded-card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-background border-2 border-border rounded-card">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Body className="text-body-md text-muted-foreground">No tickets found</Body>
            <Button
              onClick={() => setShowNewTicketModal(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              Create Your First Ticket
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/tickets/${ticket.id}`}
                className="block p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Text className="text-body-xs text-muted-foreground font-mono">{ticket.id}</Text>
                      <Text className={`px-2 py-0.5 text-body-xs rounded capitalize flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </Text>
                      <Text className={`px-2 py-0.5 text-body-xs rounded capitalize ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Text>
                    </div>
                    <H3 className="text-body-md font-weight-medium text-foreground truncate">{ticket.subject}</H3>
                    <Body className="text-body-sm text-muted-foreground mt-1 line-clamp-1">{ticket.description}</Body>
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                      <Text className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(ticket.created_at)}
                      </Text>
                      <Text className="px-2 py-0.5 bg-muted rounded">{ticket.category}</Text>
                      {ticket.replies_count > 0 && (
                        <Text className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.replies_count} {ticket.replies_count === 1 ? 'reply' : 'replies'}
                        </Text>
                      )}
                      {ticket.assigned_to && (
                        <Text className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.assigned_to}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Create Support Ticket
            </H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                createTicket.mutate(newTicket);
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Subject *
                </Label>
                <Input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description *
                </Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Provide detailed information about your issue..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Category
                  </Label>
                  <Select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    {CATEGORY_OPTIONS.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Priority
                  </Label>
                  <Select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTicket.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
