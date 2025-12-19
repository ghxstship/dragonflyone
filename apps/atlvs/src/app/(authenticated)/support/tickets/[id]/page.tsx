'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ticket, Clock, AlertCircle, CheckCircle, Send, User, Paperclip } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TicketReply {
  id: string;
  author: string;
  author_type: 'user' | 'support';
  message: string;
  created_at: string;
  attachments?: string[];
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  replies: TicketReply[];
}

const DEMO_TICKET: SupportTicket = {
  id: 'TKT-001',
  subject: 'Cannot export budget reports',
  description: 'When I try to export the budget report to PDF, it shows an error message. I\'ve tried this on multiple browsers (Chrome, Firefox, Safari) and the issue persists. The export works fine for CSV but not for PDF format. This is urgent as I need to send the report to stakeholders by end of day.',
  status: 'in_progress',
  priority: 'high',
  category: 'Bug Report',
  created_at: '2025-01-13T10:00:00Z',
  updated_at: '2025-01-13T14:30:00Z',
  assigned_to: 'Sarah M.',
  replies: [
    {
      id: 'r-001',
      author: 'Sarah M.',
      author_type: 'support',
      message: 'Thank you for reporting this issue. I\'ve been able to reproduce the problem on our end. Our engineering team is investigating and we should have a fix deployed within the next few hours. In the meantime, as a workaround, you can export to CSV and use an online converter to convert to PDF.',
      created_at: '2025-01-13T11:30:00Z',
    },
    {
      id: 'r-002',
      author: 'You',
      author_type: 'user',
      message: 'Thanks for the quick response! I\'ll use the CSV workaround for now. Please let me know once the fix is deployed.',
      created_at: '2025-01-13T12:00:00Z',
    },
    {
      id: 'r-003',
      author: 'Sarah M.',
      author_type: 'support',
      message: 'Good news! The fix has been deployed. You should now be able to export PDF reports without any issues. Please try again and let me know if you encounter any further problems.',
      created_at: '2025-01-13T14:30:00Z',
    },
  ],
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      if (!response.ok) {
        return { ticket: { ...DEMO_TICKET, id: ticketId } };
      }
      return response.json();
    },
  });

  const ticket: SupportTicket = data?.ticket || { ...DEMO_TICKET, id: ticketId };

  const addReply = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch(`/api/support/tickets/${ticketId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error('Failed to add reply');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      setReplyMessage('');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-primary/10 text-primary border-primary';
      case 'in_progress': return 'bg-warning/10 text-warning border-warning';
      case 'waiting': return 'bg-muted text-muted-foreground border-border';
      case 'resolved': return 'bg-success/10 text-success border-success';
      case 'closed': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
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
        <div className="animate-pulse text-muted-foreground">Loading ticket details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Failed to load ticket details</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/support/tickets"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-body-xs text-muted-foreground font-mono">{ticket.id}</span>
            <span className={`px-2 py-0.5 text-body-xs rounded capitalize flex items-center gap-1 border ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            {ticket.subject}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Original Message */}
          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-avatar flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-body-sm font-weight-medium text-foreground">You</p>
                <p className="text-body-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
              </div>
            </div>
            <p className="text-body-md text-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Replies */}
          {ticket.replies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Conversation</h2>
              {ticket.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`border-2 rounded-card p-4 ${
                    reply.author_type === 'support'
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-avatar flex items-center justify-center ${
                      reply.author_type === 'support' ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <User className={`h-4 w-4 ${
                        reply.author_type === 'support' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <p className="text-body-sm font-weight-medium text-foreground flex items-center gap-2">
                        {reply.author}
                        {reply.author_type === 'support' && (
                          <span className="text-body-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Support</span>
                        )}
                      </p>
                      <p className="text-body-xs text-muted-foreground">{formatDate(reply.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-body-sm text-foreground whitespace-pre-wrap">{reply.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {ticket.status !== 'closed' && (
            <div className="bg-background border-2 border-border rounded-card p-4">
              <h3 className="text-body-sm font-weight-medium text-foreground mb-3">Add Reply</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (replyMessage.trim()) {
                    addReply.mutate(replyMessage);
                  }
                }}
              >
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="h-4 w-4" />
                    Attach File
                  </button>
                  <button
                    type="submit"
                    disabled={!replyMessage.trim() || addReply.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {addReply.isPending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ticket Info */}
          <div className="bg-background border-2 border-border rounded-card p-4">
            <h3 className="text-body-sm font-weight-semibold text-foreground mb-4">Ticket Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-body-xs text-muted-foreground">Status</p>
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus.mutate(e.target.value)}
                  disabled={ticket.status === 'closed'}
                  className="w-full mt-1 px-3 py-1.5 border-2 border-border rounded-button focus:outline-none focus:border-primary text-body-sm"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Priority</p>
                <p className={`text-body-sm capitalize px-2 py-1 rounded inline-block mt-1 ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Category</p>
                <p className="text-body-sm text-foreground">{ticket.category}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Assigned To</p>
                <p className="text-body-sm text-foreground">{ticket.assigned_to || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Created</p>
                <p className="text-body-sm text-foreground">{formatDate(ticket.created_at)}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Last Updated</p>
                <p className="text-body-sm text-foreground">{formatDate(ticket.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {ticket.status !== 'closed' && (
            <div className="bg-background border-2 border-border rounded-card p-4">
              <h3 className="text-body-sm font-weight-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {ticket.status === 'resolved' && (
                  <button
                    onClick={() => updateStatus.mutate('closed')}
                    className="w-full px-3 py-2 text-body-sm border-2 border-border rounded-button hover:bg-muted transition-colors text-left"
                  >
                    Close Ticket
                  </button>
                )}
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => updateStatus.mutate('resolved')}
                    className="w-full px-3 py-2 text-body-sm border-2 border-success text-success rounded-button hover:bg-success/10 transition-colors text-left"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
