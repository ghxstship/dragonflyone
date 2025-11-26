'use client';

import { useState } from 'react';
import { useAdvanceForReview, useApproveAdvance, useRejectAdvance } from '@/hooks/useAdvanceReview';
import { useRouter } from 'next/navigation';
import { Alert, Skeleton, SkeletonCard, Button, Card, H1, H2, H3, Body, Container, Stack, Grid, Input, Textarea, Modal, ModalHeader, ModalBody, ModalFooter, Display } from '@ghxstship/ui';

export default function AdvanceReviewDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data, isLoading, error } = useAdvanceForReview(params.id);
  const { mutate: approve, isPending: isApproving } = useApproveAdvance(params.id);
  const { mutate: reject, isPending: isRejecting } = useRejectAdvance(params.id);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [approvedCost, setApprovedCost] = useState<number>();

  const handleApprove = () => {
    approve(
      {
        reviewer_notes: reviewerNotes || undefined,
        approved_cost: approvedCost,
      },
      {
        onSuccess: () => {
          router.push('/advances');
        },
      }
    );
  };

  const handleReject = () => {
    if (!reviewerNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    reject(
      { reviewer_notes: reviewerNotes },
      {
        onSuccess: () => {
          router.push('/advances');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Container className="p-6">
        <Stack gap={4}>
          <Skeleton className="h-8 w-1/3" />
          <SkeletonCard />
        </Stack>
      </Container>
    );
  }

  if (error || !data?.advance) {
    return (
      <Container className="p-6">
        <Alert variant="error" title="Error Loading Advance">
          {error?.message || 'Advance not found'}
        </Alert>
      </Container>
    );
  }

  const advance = data.advance;
  const cost = advance.estimated_cost || 0;

  return (
    <Container className="p-6">
      <Stack gap={6}>
        {/* Header */}
        <Stack direction="horizontal" className="justify-between items-start">
          <Stack gap={1}>
            <H1>
              {advance.activation_name || advance.project?.name || 'Production Advance Review'}
            </H1>
            <Body className="text-grey-600">
              Review request details and approve or reject
            </Body>
          </Stack>
          <Stack direction="horizontal" gap={3}>
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              disabled={isRejecting}
              className="border-black text-black hover:bg-black hover:text-white"
            >
              Reject
            </Button>
            <Button
              variant="solid"
              onClick={() => setShowApproveModal(true)}
              disabled={isApproving}
            >
              Approve
            </Button>
          </Stack>
        </Stack>

      {/* Main Details Card */}
      <Card className="p-6">
        <Stack gap={6}>
          <Grid cols={2} gap={6}>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-500">Organization</Body>
              <Body size="lg">{advance.organization?.name || 'N/A'}</Body>
            </Stack>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-500">Project</Body>
              <Body size="lg">{advance.project?.name || 'N/A'}</Body>
              {advance.project?.budget && (
                <Body size="sm" className="text-grey-600">
                  Budget: ${advance.project.budget.toLocaleString()}
                </Body>
              )}
            </Stack>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-500">Team/Workspace</Body>
              <Body size="lg">{advance.team_workspace || 'N/A'}</Body>
            </Stack>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-500">Activation</Body>
              <Body size="lg">{advance.activation_name || 'N/A'}</Body>
            </Stack>
          </Grid>

          <Stack direction="horizontal" className="justify-between items-center border-t pt-6">
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-500">Submitted By</Body>
              <Body size="lg">{advance.submitter?.full_name || 'Unknown'}</Body>
              <Body size="sm" className="text-grey-600">{advance.submitter?.email}</Body>
            </Stack>
            <Stack className="text-right">
              <Body size="sm" className="font-medium text-grey-500">Estimated Cost</Body>
              <Display>${cost.toLocaleString()}</Display>
            </Stack>
          </Stack>
        </Stack>
      </Card>

      {/* Items List */}
      <Card className="p-6">
        <H2 className="mb-4">Requested Items ({advance.items?.length || 0})</H2>
        <Stack gap={3}>
          {advance.items?.map((item) => (
            <Card key={item.id} variant="outlined" className="p-4">
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={1} className="flex-1">
                  <H3>{item.item_name}</H3>
                  {item.description && (
                    <Body size="sm" className="text-grey-600 mt-1">{item.description}</Body>
                  )}
                  {item.catalog_item && (
                    <Body size="xs" className="text-grey-500 mt-1">
                      Catalog: {item.catalog_item.category} → {item.catalog_item.subcategory}
                    </Body>
                  )}
                </Stack>
                <Stack className="text-right ml-6">
                  <Body size="lg" className="font-semibold">
                    {item.quantity} {item.unit}
                  </Body>
                  {item.unit_cost && (
                    <Body size="sm" className="text-grey-600">
                      ${item.unit_cost.toLocaleString()} / {item.unit}
                    </Body>
                  )}
                  {item.total_cost && (
                    <Body size="lg" className="font-bold mt-1">
                      ${item.total_cost.toLocaleString()}
                    </Body>
                  )}
                </Stack>
              </Stack>
              {item.notes && (
                <Stack className="mt-3 pt-3 border-t">
                  <Body size="sm" className="text-grey-600"><strong>Notes:</strong> {item.notes}</Body>
                </Stack>
              )}
            </Card>
          ))}
        </Stack>
      </Card>

      {/* Approve Modal */}
      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)}>
        <ModalHeader>
          <H2>Approve Advance</H2>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-700">
                Reviewer Notes (Optional)
              </Body>
              <Textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </Stack>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-700">
                Approved Cost (Optional)
              </Body>
              <Input
                type="number"
                value={approvedCost || ''}
                onChange={(e) => setApprovedCost(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder={`Default: $${cost.toLocaleString()}`}
              />
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => setShowApproveModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleApprove}
            disabled={isApproving}
          >
            {isApproving ? 'Approving...' : 'Confirm Approval'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <ModalHeader>
          <H2 className="text-error-900">Reject Advance</H2>
        </ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={1}>
              <Body size="sm" className="font-medium text-grey-700">
                Reason for Rejection (Required)
              </Body>
              <Textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                rows={4}
                placeholder="Please provide a detailed reason for rejection..."
                required
              />
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setShowRejectModal(false);
              setReviewerNotes('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleReject}
            disabled={isRejecting || !reviewerNotes.trim()}
            className="bg-error-600 hover:bg-error-700"
          >
            {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </ModalFooter>
      </Modal>
      </Stack>
    </Container>
  );
}
