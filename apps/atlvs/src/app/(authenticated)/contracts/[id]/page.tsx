'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Send, FileText, Clock, User, Calendar, CheckCircle, XCircle, Download, AlertTriangle } from 'lucide-react';
import { useContract, useSendContract } from '@/hooks/useContracts';

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  signed_at?: string;
}

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params?.id as string;

  const { data: contract, isLoading, error } = useContract(contractId);
  const sendMutation = useSendContract();

  const [showSendModal, setShowSendModal] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(contractId);
      setShowSendModal(false);
    } catch (err) {
      console.error('Failed to send contract:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'bg-muted text-muted-foreground' };
      case 'sent':
        return { label: 'Sent', color: 'bg-primary/20 text-primary' };
      case 'viewed':
        return { label: 'Viewed', color: 'bg-warning/20 text-warning' };
      case 'signed':
        return { label: 'Signed', color: 'bg-success/20 text-success' };
      case 'declined':
        return { label: 'Declined', color: 'bg-destructive/20 text-destructive' };
      case 'expired':
        return { label: 'Expired', color: 'bg-muted text-muted-foreground' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const getSignerStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'viewed':
        return <FileText className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading contract...</div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <H2 className="text-h3-md font-weight-bold text-foreground mb-2">Contract Not Found</H2>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'The requested contract could not be found.'}
          </Body>
          <Link
            href="/contracts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);

  // Mock signers for display (signers not yet implemented in Contract type)
  const signers: Signer[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', role: 'Client', status: 'pending' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/contracts"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <H1 className="text-h2-md font-weight-bold text-foreground">{contract.title}</H1>
              <Text className={`px-3 py-1 rounded-badge text-body-sm font-weight-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </Text>
            </div>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {contract.type} Contract
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {contract.status === 'draft' && (
            <>
              <Button
                onClick={() => router.push(`/contracts/${contractId}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                onClick={() => setShowSendModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
                Send for Signature
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Client</Text>
          </div>
          <Body className="text-body-lg font-weight-medium text-foreground">
            {contract.vendor?.name || 'Not specified'}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Created</Text>
          </div>
          <Body className="text-body-lg font-weight-medium text-foreground">
            {formatDate(contract.created_at)}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Expires</Text>
          </div>
          <Body className="text-body-lg font-weight-medium text-foreground">
            {contract.end_date ? formatDate(contract.end_date) : 'No expiration'}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Value</Text>
          </div>
          <Body className="text-body-lg font-weight-medium text-foreground">
            {contract.value ? formatCurrency(contract.value) : 'N/A'}
          </Body>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Signers</H2>
        <div className="space-y-3">
          {signers.map((signer) => (
            <div
              key={signer.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-avatar flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">{signer.name}</Body>
                  <Body className="text-body-xs text-muted-foreground">{signer.email}</Body>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Text className="text-body-xs text-muted-foreground">{signer.role}</Text>
                <div className="flex items-center gap-2">
                  {getSignerStatusIcon(signer.status)}
                  <Text className="text-body-sm font-weight-medium capitalize">{signer.status}</Text>
                </div>
                {signer.signed_at && (
                  <Text className="text-body-xs text-muted-foreground">
                    {formatDate(signer.signed_at)}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {contract.terms && (
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Terms & Conditions</H2>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <pre className="whitespace-pre-wrap font-body text-body-sm">{contract.terms}</pre>
          </div>
        </div>
      )}

      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-md">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Send Contract
            </H2>
            <Body className="text-body-sm text-muted-foreground mb-4">
              This will send the contract to all signers for electronic signature.
            </Body>
            <div className="space-y-2 mb-6">
              {signers.map((signer) => (
                <div key={signer.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-card">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Body className="text-body-sm font-weight-medium text-foreground">{signer.name}</Body>
                    <Body className="text-body-xs text-muted-foreground">{signer.email}</Body>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sendMutation.isPending ? 'Sending...' : 'Send Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
