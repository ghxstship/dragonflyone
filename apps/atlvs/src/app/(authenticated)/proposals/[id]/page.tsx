'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Modal,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Send, Eye, BarChart3, Copy, Calendar, User, Clock } from 'lucide-react';
import { useProposal, useSendProposal, useDeleteProposal } from '@/hooks/useProposals';
import { useState } from 'react';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;
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

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'accepted': return 'success';
      case 'sent':
      case 'viewed': return 'info';
      case 'declined': return 'error';
      case 'expired': return 'warning';
      default: return 'info';
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
      <>
        <EnterprisePageHeader title="Proposal Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={6}>
              <Box className="col-span-2"><Skeleton className="h-64" /></Box>
              <Skeleton className="h-64" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !proposal) {
    return (
      <>
        <EnterprisePageHeader title="Proposal Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Proposal not found"
              description="The proposal you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Proposals', onClick: () => router.push('/proposals') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title={proposal.name || 'Untitled Proposal'}
        subtitle={proposal.proposal_number}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Badge variant={getStatusVariant(proposal.status)} className="capitalize">
          {proposal.status}
        </Badge>
        <Stack direction="horizontal" gap={2}>
          {proposal.status === 'draft' && (
            <Button onClick={handleSend} disabled={sendProposal.isPending}>
              <Send className="h-4 w-4 mr-2" />
              {sendProposal.isPending ? 'Sending...' : 'Send'}
            </Button>
          )}
          <Link href={`/proposals/${proposalId}/analytics`}>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href={`/p/${proposal.public_token}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Link href={`/proposals/${proposalId}/edit`}>
            <Button>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">Line Items</H2>
                {lineItems.length === 0 ? (
                  <Body size="sm" className="text-muted-foreground">No line items added yet</Body>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Body size="sm">{item.description}</Body>
                            {item.category && (
                              <Body size="xs" className="text-muted-foreground">{item.category}</Body>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-weight-medium">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>

              {proposal.terms && (
                <Card className="p-6">
                  <H2 className="mb-4">Terms & Conditions</H2>
                  <Body size="sm" className="text-muted-foreground whitespace-pre-wrap">
                    {proposal.terms}
                  </Body>
                </Card>
              )}
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H2 className="mb-4">Summary</H2>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Subtotal</Text>
                    <Text size="sm">{formatCurrency(proposal.subtotal || 0)}</Text>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Tax</Text>
                    <Text size="sm">{formatCurrency(proposal.tax_amount || 0)}</Text>
                  </Stack>
                  <Box className="pt-3 border-t border-border">
                    <Stack direction="horizontal" className="justify-between">
                      <Text className="font-weight-semibold">Total</Text>
                      <Text className="font-weight-bold">{formatCurrency(proposal.total || 0)}</Text>
                    </Stack>
                  </Box>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Details</H2>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={3} className="items-start">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={0}>
                      <Body size="xs" className="text-muted-foreground">Client</Body>
                      <Body>
                        {proposal.contact ? `${proposal.contact.first_name} ${proposal.contact.last_name}` : 'Not specified'}
                      </Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={3} className="items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={0}>
                      <Body size="xs" className="text-muted-foreground">Valid Until</Body>
                      <Body>{proposal.valid_until ? formatDate(proposal.valid_until) : 'No expiry'}</Body>
                    </Stack>
                  </Stack>
                  {proposal.sent_at && (
                    <Stack direction="horizontal" gap={3} className="items-start">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={0}>
                        <Body size="xs" className="text-muted-foreground">Sent</Body>
                        <Body>{formatDate(proposal.sent_at)}</Body>
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Share Link</H2>
                <Box className="bg-muted p-3 rounded font-mono text-mono-xs break-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/p/${proposal.public_token}` : ''}
                </Box>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${proposal.public_token}`)}
                  className="mt-3 w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </Card>
            </Stack>
          </Grid>

          <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Proposal">
            <Body size="sm" className="text-muted-foreground mb-4">
              Are you sure you want to delete this proposal? This action cannot be undone.
            </Body>
            <Stack direction="horizontal" gap={3} className="justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteProposal.isPending}>
                {deleteProposal.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </Modal>
        </Container>
      </MainContent>
    </>
  );
}
