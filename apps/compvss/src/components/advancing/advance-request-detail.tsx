'use client';

import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Field,
  Alert,
  H3,
  H4,
  Body,
  LoadingSpinner,
} from '@ghxstship/ui';
import { useAdvancingRequest } from '@ghxstship/config';

interface AdvanceRequestDetailProps {
  requestId: string;
  onUpdate?: () => void;
}

export function AdvanceRequestDetail({ requestId }: AdvanceRequestDetailProps) {
  const { data: request, isLoading } = useAdvancingRequest(requestId);

  if (isLoading) return <LoadingSpinner />;
  if (!request) return <Alert variant="error">Request not found</Alert>;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <H3>Request Details</H3>
        <Badge>{request.status.replace('_', ' ')}</Badge>
      </CardHeader>

      <CardBody>
        <Field label="Team/Workspace">
          <Body>{request.team_workspace || '-'}</Body>
        </Field>

        <Field label="Activation Name">
          <Body>{request.activation_name || '-'}</Body>
        </Field>

        {request.project && (
          <Field label="Project">
            <Body>{request.project.name}</Body>
          </Field>
        )}

        <Field label="Submitter">
          <Body>{request.submitter?.full_name || 'Unknown'}</Body>
        </Field>

        <Field label="Submitted At">
          <Body>{formatDate(request.submitted_at)}</Body>
        </Field>

        <Field label="Estimated Cost">
          <Body>{formatCurrency(request.estimated_cost)}</Body>
        </Field>

        {request.actual_cost && (
          <Field label="Actual Cost">
            <Body>{formatCurrency(request.actual_cost)}</Body>
          </Field>
        )}

        {request.reviewer_notes && (
          <Field label="Reviewer Notes">
            <Body>{request.reviewer_notes}</Body>
          </Field>
        )}

        <H4>Requested Items</H4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fulfillment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {request.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Body>{item.item_name}</Body>
                  {item.catalog_item && (
                    <Badge variant="outline">{item.catalog_item.item_id}</Badge>
                  )}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{formatCurrency(item.unit_cost)}</TableCell>
                <TableCell>{formatCurrency(item.total_cost)}</TableCell>
                <TableCell>
                  <Badge variant={item.fulfillment_status === 'complete' ? 'solid' : 'outline'}>
                    {item.fulfillment_status}
                  </Badge>
                  {item.quantity_fulfilled > 0 && (
                    <Body className="text-body-sm text-ink-600">
                      {item.quantity_fulfilled} / {item.quantity}
                    </Body>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
