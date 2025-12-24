'use client';

import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Send, Eye, BarChart3, Copy, Calendar, User, Clock } from 'lucide-react';
import { useProposal, useSendProposal, useDeleteProposal } from '@/hooks/useProposals';
import { useState } from 'react';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: proposal, isLoading, error } = useProposal(proposalId);
  const sendProposal = useSendProposal();
  const deleteProposal = useDeleteProposal();

  const lineItems = proposal?.pricing_items || [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'sent':
        return 'bg-info-100 text-info-800 border-info-200';
      case 'viewed':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'draft':
        return 'bg-ink-100 text-ink-800 border-ink-200';
      case 'declined':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'expired':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      default:
        return 'bg-ink-100 text-ink-800 border-ink-200';
    }
  };

  const handleSend = async () => {
    await sendProposal.mutateAsync(proposalId);
  };

  const handleDelete = async () => {
    await deleteProposal.mutateAsync(proposalId);
    window.location.href = '/proposals';
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading proposal...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Proposal not found</Body>
          <Link href="/proposals" className="text-primary hover:underline mt-2 inline-block">
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/proposals"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <H1 className="text-h2-md font-weight-bold text-foreground">
                {proposal.name || 'Untitled Proposal'}
              </H1>
              <Text className={`px-3 py-1 rounded-avatar text-body-xs font-weight-medium border capitalize ${getStatusColor(proposal.status)}`}>
                {proposal.status}
              </Text>
            </div>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {proposal.proposal_number}
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {proposal.status === 'draft' && (
            <Button
              onClick={handleSend}
              disabled={sendProposal.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-button hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <Text className="text-body-sm font-weight-medium">
                {sendProposal.isPending ? 'Sending...' : 'Send'}
              </Text>
            </Button>
          )}
          <Link
            href={`/proposals/${proposalId}/analytics`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <Text className="text-body-sm">Analytics</Text>
          </Link>
          <Link
            href={`/p/${proposal.public_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Eye className="h-4 w-4" />
            <Text className="text-body-sm">Preview</Text>
          </Link>
          <Link
            href={`/proposals/${proposalId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Edit</Text>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</H2>
            {lineItems.length === 0 ? (
              <Body className="text-body-sm text-muted-foreground">No line items added yet</Body>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="py-2 text-left text-body-sm font-weight-medium text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id} className="border-b border-border">
                      <TableCell className="py-3">
                        <Body className="text-body-sm text-foreground">{item.description}</Body>
                        {item.category && (
                          <Body className="text-body-xs text-muted-foreground">{item.category}</Body>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-body-sm text-foreground text-right">{item.quantity}</TableCell>
                      <TableCell className="py-3 text-body-sm text-foreground text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="py-3 text-body-sm font-weight-medium text-foreground text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {proposal.terms && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Terms & Conditions</H2>
              <Body className="text-body-sm text-muted-foreground whitespace-pre-wrap">
                {proposal.terms}
              </Body>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Summary</H2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Subtotal</Text>
                <Text className="text-body-sm text-foreground">
                  {formatCurrency(proposal.subtotal || 0)}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Tax</Text>
                <Text className="text-body-sm text-foreground">
                  {formatCurrency(proposal.tax_amount || 0)}
                </Text>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <Text className="text-body-md font-weight-semibold text-foreground">Total</Text>
                <Text className="text-h4-md font-weight-bold text-foreground">
                  {formatCurrency(proposal.total || 0)}
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Client</Body>
                  <Body className="text-body-md text-foreground">
                    {proposal.contact ? `${proposal.contact.first_name} ${proposal.contact.last_name}` : 'Not specified'}
                  </Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Valid Until</Body>
                  <Body className="text-body-md text-foreground">
                    {proposal.valid_until ? formatDate(proposal.valid_until) : 'No expiry'}
                  </Body>
                </div>
              </div>
              {proposal.sent_at && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Sent</Body>
                    <Body className="text-body-md text-foreground">
                      {formatDate(proposal.sent_at)}
                    </Body>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Share Link</H2>
            <div className="bg-muted p-3 rounded font-mono text-body-xs break-all">
              {typeof window !== 'undefined' ? `${window.location.origin}/p/${proposal.public_token}` : ''}
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${proposal.public_token}`)}
              className="mt-3 flex items-center gap-2 px-4 py-2 w-full justify-center border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4" />
              <Text className="text-body-sm">Copy Link</Text>
            </Button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-2">Delete Proposal</H3>
            <Body className="text-body-sm text-muted-foreground mb-4">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </Body>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteProposal.isPending}
                className="px-4 py-2 bg-destructive text-white rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteProposal.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
