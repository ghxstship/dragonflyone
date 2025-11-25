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
  Input,
  Field,
  Textarea,
  Alert,
  H3,
  H4,
  Body,
  LoadingSpinner,
} from '@ghxstship/ui';
import { useAdvancingRequest, useFulfillAdvance } from '@ghxstship/config';
import type { FulfillAdvancePayload } from '@ghxstship/config/types/advancing';

interface FulfillmentItem {
  item_id: string;
  quantity_fulfilled: number;
  notes?: string;
}

interface FulfillmentManagerProps {
  requestId: string;
  onSuccess?: () => void;
}

export function FulfillmentManager({ requestId, onSuccess }: FulfillmentManagerProps) {
  const [fulfillmentItems, setFulfillmentItems] = useState<Record<string, FulfillmentItem>>({});
  const [fulfillmentNotes, setFulfillmentNotes] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: request, isLoading } = useAdvancingRequest(requestId);
  const { mutate: fulfillRequest, isPending } = useFulfillAdvance();

  if (isLoading) return <LoadingSpinner />;
  if (!request) return <Alert variant="error">Request not found</Alert>;

  const canFulfill = ['approved', 'in_progress'].includes(request.status);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setFulfillmentItems((prev) => ({
      ...prev,
      [itemId]: {
        item_id: itemId,
        quantity_fulfilled: Math.max(0, quantity),
        notes: prev[itemId]?.notes,
      },
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setFulfillmentItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        item_id: itemId,
        quantity_fulfilled: prev[itemId]?.quantity_fulfilled || 0,
        notes,
      },
    }));
  };

  const handleSubmit = () => {
    setError(null);

    const items = Object.values(fulfillmentItems).filter((item) => item.quantity_fulfilled > 0);

    if (items.length === 0) {
      setError('Please specify fulfillment quantities for at least one item');
      return;
    }

    const payload: FulfillAdvancePayload = {
      items,
      fulfillment_notes: fulfillmentNotes || undefined,
      actual_cost: actualCost ? parseFloat(actualCost) : undefined,
    };

    fulfillRequest(
      { id: requestId, payload },
      {
        onSuccess: () => {
          setFulfillmentItems({});
          setFulfillmentNotes('');
          setActualCost('');
          onSuccess?.();
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to fulfill request');
        },
      }
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <H3>Fulfillment Manager</H3>
        <Badge>{request.status}</Badge>
      </CardHeader>

      <CardBody>
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!canFulfill && (
          <Alert variant="info">
            This request must be approved before it can be fulfilled
          </Alert>
        )}

        <Field label="Request Details">
          <Body>
            <strong>Team/Workspace:</strong> {request.team_workspace || '-'}
          </Body>
          <Body>
            <strong>Activation:</strong> {request.activation_name || '-'}
          </Body>
          <Body>
            <strong>Estimated Cost:</strong> {formatCurrency(request.estimated_cost)}
          </Body>
        </Field>

        <H4>Items to Fulfill</H4>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Already Fulfilled</TableHead>
              <TableHead>Fulfill Now</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {request.items?.map((item) => {
              const remaining = item.quantity - (item.quantity_fulfilled || 0);
              const fulfillmentItem = fulfillmentItems[item.id];

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Body>{item.item_name}</Body>
                    <Body className="text-sm text-grey-500">
                      {item.unit}
                    </Body>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.quantity_fulfilled || 0}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={fulfillmentItem?.quantity_fulfilled || ''}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      min="0"
                      max={remaining}
                      step="0.1"
                      disabled={!canFulfill || remaining <= 0}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.fulfillment_status === 'complete' ? 'solid' : 'outline'}
                    >
                      {item.fulfillment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {canFulfill && (
          <>
            <Field label="Fulfillment Notes">
              <Textarea
                value={fulfillmentNotes}
                onChange={(e) => setFulfillmentNotes(e.target.value)}
                placeholder="Add notes about this fulfillment..."
              />
            </Field>

            <Field label="Actual Cost">
              <Input
                type="number"
                value={actualCost}
                onChange={(e) => setActualCost(e.target.value)}
                placeholder="Total actual cost"
                min="0"
                step="0.01"
              />
            </Field>
          </>
        )}
      </CardBody>

      {canFulfill && (
        <CardFooter>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={
              isPending || Object.keys(fulfillmentItems).filter((k) => fulfillmentItems[k].quantity_fulfilled > 0).length === 0
            }
          >
            {isPending ? 'Submitting...' : 'Submit Fulfillment'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
