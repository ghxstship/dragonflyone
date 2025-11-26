'use client';

import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  ButtonGroup,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Field,
  Textarea,
  Input,
  H3,
  H4,
  Body,
  LoadingSpinner,
} from '@ghxstship/ui';
import {
  useAdvancingRequest,
  useApproveAdvance,
  useRejectAdvance,
} from '@ghxstship/config';

interface AdvanceRequestDetailProps {
  requestId: string;
  onUpdate?: () => void;
}

export function AdvanceRequestDetail({ requestId, onUpdate }: AdvanceRequestDetailProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [approvedCost, setApprovedCost] = useState('');

  const { data: request, isLoading } = useAdvancingRequest(requestId);
  const { mutate: approveRequest, isPending: isApproving } = useApproveAdvance();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectAdvance();

  if (isLoading) return <LoadingSpinner />;
  if (!request) return <Alert variant="error">Request not found</Alert>;

  const canApprove = ['submitted', 'under_review'].includes(request.status);

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApprove = () => {
    approveRequest(
      {
        id: requestId,
        payload: {
          reviewer_notes: reviewerNotes || undefined,
          approved_cost: approvedCost ? parseFloat(approvedCost) : undefined,
        },
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          onUpdate?.();
        },
      }
    );
  };

  const handleReject = () => {
    if (!reviewerNotes.trim()) return;

    rejectRequest(
      { id: requestId, payload: { reviewer_notes: reviewerNotes } },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          onUpdate?.();
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <H3>Advance Request</H3>
          <Badge>{request.status}</Badge>
        </CardHeader>

        <CardBody>
          <Field label="Team/Workspace">
            <Body>{request.team_workspace || '-'}</Body>
          </Field>

          <Field label="Submitter">
            <Body>{request.submitter?.full_name}</Body>
          </Field>

          <Field label="Estimated Cost">
            <Body>{formatCurrency(request.estimated_cost)}</Body>
          </Field>

          <H4>Items</H4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {request.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                  <TableCell>{formatCurrency(item.total_cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>

        {canApprove && (
          <CardFooter>
            <ButtonGroup>
              <Button variant="solid" onClick={() => setShowApproveModal(true)}>
                Approve
              </Button>
              <Button variant="outline" onClick={() => setShowRejectModal(true)}>
                Reject
              </Button>
            </ButtonGroup>
          </CardFooter>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal open={showApproveModal} onClose={() => setShowApproveModal(false)}>
        <ModalHeader>
          <H3>Approve Request</H3>
        </ModalHeader>
        <ModalBody>
          <Field label="Notes">
            <Textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Optional approval notes"
            />
          </Field>
          <Field label="Approved Cost">
            <Input
              type="number"
              value={approvedCost}
              onChange={(e) => setApprovedCost(e.target.value)}
              placeholder="Override estimated cost"
            />
          </Field>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="solid" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <ModalHeader>
          <H3>Reject Request</H3>
        </ModalHeader>
        <ModalBody>
          <Field label="Rejection Reason *" required>
            <Textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Explain why this request is being rejected"
            />
          </Field>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleReject}
              disabled={isRejecting || !reviewerNotes.trim()}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  );
}
