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
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FileText, Calendar, Check, X, Building2 } from 'lucide-react';

interface PublicProposal {
  id: string;
  proposal_number: string;
  name: string;
  introduction?: string;
  terms?: string;
  valid_until?: string;
  status: string;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
  };
  organization: {
    name: string;
    logo_url?: string;
  };
  pricing_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  created_at: string;
}

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [proposal, setProposal] = useState<PublicProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    async function fetchProposal() {
      try {
        const response = await fetch(`/api/proposals/public/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Proposal not found or has expired');
          } else {
            setError('Failed to load proposal');
          }
          return;
        }
        const data = await response.json();
        setProposal(data);
      } catch (err) {
        setError('Failed to load proposal');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchProposal();
    }
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const response = await fetch(`/api/proposals/public/${token}/accept`, {
        method: 'POST',
      });
      if (response.ok) {
        setProposal((prev) => prev ? { ...prev, status: 'accepted' } : null);
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const response = await fetch(`/api/proposals/public/${token}/decline`, {
        method: 'POST',
      });
      if (response.ok) {
        setProposal((prev) => prev ? { ...prev, status: 'declined' } : null);
      }
    } finally {
      setDeclining(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="animate-pulse text-ink-500">Loading proposal...</div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-ink-400 mx-auto mb-4" />
          <H1 className="text-h5-md font-weight-semibold text-ink-900 mb-2">Proposal Not Found</H1>
          <Body className="text-ink-500">{error || 'This proposal may have expired or been removed.'}</Body>
        </div>
      </div>
    );
  }

  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();
  const canRespond = proposal.status === 'sent' || proposal.status === 'viewed';

  return (
    <div className="min-h-screen bg-ink-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-card shadow-sm border-2 border-ink-200 overflow-hidden">
          <div className="p-8 border-b border-ink-200">
            <div className="flex items-start justify-between">
              <div>
                {proposal.organization.logo_url ? (
                  <Image
                    src={proposal.organization.logo_url}
                    alt={proposal.organization.name}
                    width={48}
                    height={48}
                    className="h-12 w-auto mb-4"
                  />
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-8 w-8 text-violet-600" />
                    <Text className="text-h5-md font-weight-semibold text-ink-900">
                      {proposal.organization.name}
                    </Text>
                  </div>
                )}
                <H1 className="text-h4-md font-weight-bold text-ink-900">{proposal.name}</H1>
                <Body className="text-body-sm text-ink-500 mt-1">
                  Proposal #{proposal.proposal_number}
                </Body>
              </div>
              <div className="text-right">
                <Text className={`inline-flex items-center px-3 py-1 rounded-radius-full text-body-sm font-weight-medium ${
                  proposal.status === 'accepted'
                    ? 'bg-success-100 text-success-800'
                    : proposal.status === 'declined'
                    ? 'bg-error-100 text-error-800'
                    : isExpired
                    ? 'bg-ink-200 text-ink-800'
                    : 'bg-info-100 text-info-800'
                }`}>
                  {proposal.status === 'accepted' && <Check className="h-4 w-4 mr-1" />}
                  {proposal.status === 'declined' && <X className="h-4 w-4 mr-1" />}
                  {isExpired ? 'Expired' : proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </Text>
              </div>
            </div>
          </div>

          <div className="p-8 border-b border-ink-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <H3 className="text-body-sm font-weight-medium text-ink-500 mb-2">Prepared For</H3>
                <Body className="text-ink-900 font-weight-medium">
                  {proposal.contact.first_name} {proposal.contact.last_name}
                </Body>
                <Body className="text-ink-500 text-body-sm">{proposal.contact.email}</Body>
              </div>
              <div>
                <H3 className="text-body-sm font-weight-medium text-ink-500 mb-2">Valid Until</H3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ink-400" />
                  <Text className={isExpired ? 'text-error-600' : 'text-ink-900'}>
                    {proposal.valid_until ? formatDate(proposal.valid_until) : 'No expiration'}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {proposal.introduction && (
            <div className="p-8 border-b border-ink-200">
              <H2 className="text-h6-md font-weight-semibold text-ink-900 mb-4">Introduction</H2>
              <Body className="text-ink-600 whitespace-pre-wrap">{proposal.introduction}</Body>
            </div>
          )}

          <div className="p-8 border-b border-ink-200">
            <H2 className="text-h6-md font-weight-semibold text-ink-900 mb-4">Pricing</H2>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-ink-200">
                  <TableHead className="text-left py-3 text-body-sm font-weight-medium text-ink-500">Description</TableHead>
                  <TableHead className="text-right py-3 text-body-sm font-weight-medium text-ink-500 w-24">Qty</TableHead>
                  <TableHead className="text-right py-3 text-body-sm font-weight-medium text-ink-500 w-32">Unit Price</TableHead>
                  <TableHead className="text-right py-3 text-body-sm font-weight-medium text-ink-500 w-32">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-ink-100">
                {proposal.pricing_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="py-3 text-ink-900">{item.description}</TableCell>
                    <TableCell className="py-3 text-ink-600 text-right">{item.quantity}</TableCell>
                    <TableCell className="py-3 text-ink-600 text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="py-3 text-ink-900 font-weight-medium text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6 pt-4 border-t border-ink-200 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-body-sm">
                  <Text className="text-ink-500">Subtotal</Text>
                  <Text className="text-ink-900">{formatCurrency(proposal.subtotal)}</Text>
                </div>
                {proposal.tax_amount > 0 && (
                  <div className="flex justify-between text-body-sm">
                    <Text className="text-ink-500">Tax</Text>
                    <Text className="text-ink-900">{formatCurrency(proposal.tax_amount)}</Text>
                  </div>
                )}
                <div className="flex justify-between text-h6-md font-weight-semibold pt-2 border-t border-ink-200">
                  <Text className="text-ink-900">Total</Text>
                  <Text className="text-ink-900">{formatCurrency(proposal.total_amount)}</Text>
                </div>
              </div>
            </div>
          </div>

          {proposal.terms && (
            <div className="p-8 border-b border-ink-200">
              <H2 className="text-h6-md font-weight-semibold text-ink-900 mb-4">Terms & Conditions</H2>
              <Body className="text-ink-600 whitespace-pre-wrap text-body-sm">{proposal.terms}</Body>
            </div>
          )}

          {canRespond && !isExpired && (
            <div className="p-8 bg-ink-100">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleDecline}
                  disabled={declining}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-ink-300 rounded-button text-ink-700 hover:bg-ink-200 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  {declining ? 'Declining...' : 'Decline'}
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-button hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  {accepting ? 'Accepting...' : 'Accept Proposal'}
                </Button>
              </div>
            </div>
          )}

          {proposal.status === 'accepted' && (
            <div className="p-8 bg-success-50 text-center">
              <Check className="h-8 w-8 text-success-600 mx-auto mb-2" />
              <Body className="text-success-800 font-weight-medium">This proposal has been accepted</Body>
            </div>
          )}

          {proposal.status === 'declined' && (
            <div className="p-8 bg-error-50 text-center">
              <X className="h-8 w-8 text-error-600 mx-auto mb-2" />
              <Body className="text-error-800 font-weight-medium">This proposal has been declined</Body>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
