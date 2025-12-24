'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import Link from 'next/link';
import { ArrowLeft, FileText, Send, Printer, Package } from 'lucide-react';
import { usePurchaseOrder, useUpdatePurchaseOrder } from '@/hooks/usePurchaseOrders';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  issued: { label: 'Issued', color: 'bg-primary/20 text-primary' },
  acknowledged: { label: 'Acknowledged', color: 'bg-primary/20 text-primary' },
  partially_received: { label: 'Partial', color: 'bg-warning/20 text-warning' },
  received: { label: 'Received', color: 'bg-success/20 text-success' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
  closed: { label: 'Closed', color: 'bg-muted text-muted-foreground' },
};

export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data, isLoading, error } = usePurchaseOrder(id);
  const updateMutation = useUpdatePurchaseOrder();

  const po = data?.purchase_order;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleIssue = async () => {
    if (confirm('Issue this purchase order to the vendor?')) {
      await updateMutation.mutateAsync({ id, status: 'issued' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load purchase order. The PO may not exist.
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[po.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/purchase-orders"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-card">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <H1 className="text-h2-md font-weight-bold text-foreground">{po.po_number}</H1>
                <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </Text>
              </div>
              <Body className="text-body-sm text-muted-foreground">
                {po.vendor?.company_name || po.vendor?.name || 'Unknown Vendor'}
              </Body>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {po.status === 'approved' && (
            <Button
              onClick={handleIssue}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Issue to Vendor
            </Button>
          )}
          {['issued', 'acknowledged', 'partially_received'].includes(po.status) && (
            <Link
              href={`/purchase-orders/${id}/receive`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success font-weight-medium text-body-sm hover:bg-success/90 transition-colors"
            >
              <Package className="h-4 w-4" />
              Record Receipt
            </Link>
          )}
          <Button
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</H2>
            <Table className="w-full">
              <TableHeader className="border-b border-border">
                <TableRow>
                  <TableHead className="text-left py-2 text-body-xs font-weight-medium text-muted-foreground">Description</TableHead>
                  <TableHead className="text-center py-2 text-body-xs font-weight-medium text-muted-foreground">Qty</TableHead>
                  <TableHead className="text-center py-2 text-body-xs font-weight-medium text-muted-foreground">Received</TableHead>
                  <TableHead className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Unit Price</TableHead>
                  <TableHead className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {po.line_items?.map((item: { description: string; quantity: number; quantity_received?: number; unit_price: number; total: number }, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="py-3 text-body-sm">{item.description}</TableCell>
                    <TableCell className="py-3 text-body-sm text-center">{item.quantity}</TableCell>
                    <TableCell className="py-3 text-body-sm text-center">
                      {item.quantity_received !== undefined ? (
                        <Text className={item.quantity_received >= item.quantity ? 'text-success' : 'text-warning'}>
                          {item.quantity_received}
                        </Text>
                      ) : (
                        <Text className="text-muted-foreground">-</Text>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-body-sm text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="py-3 text-body-sm text-right font-weight-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-body-sm">
                <Text className="text-muted-foreground">Subtotal</Text>
                <Text>{formatCurrency(po.subtotal)}</Text>
              </div>
              {po.tax_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <Text className="text-muted-foreground">Tax</Text>
                  <Text>{formatCurrency(po.tax_amount)}</Text>
                </div>
              )}
              {po.shipping_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <Text className="text-muted-foreground">Shipping</Text>
                  <Text>{formatCurrency(po.shipping_amount)}</Text>
                </div>
              )}
              <div className="flex justify-between text-body-lg font-weight-bold pt-2 border-t border-border">
                <Text>Total</Text>
                <Text>{formatCurrency(po.total)}</Text>
              </div>
            </div>
          </div>

          {po.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</H2>
              <Body className="text-body-sm text-foreground">{po.notes}</Body>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</H2>
            <div className="space-y-3">
              <div>
                <Body className="text-body-xs text-muted-foreground">Vendor</Body>
                <Body className="text-body-sm font-weight-medium">
                  {po.vendor?.company_name || po.vendor?.name || 'Unknown'}
                </Body>
              </div>
              {po.delivery_date && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Delivery Date</Body>
                  <Body className="text-body-sm font-weight-medium">
                    {new Date(po.delivery_date).toLocaleDateString()}
                  </Body>
                </div>
              )}
              {po.delivery_location && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Delivery Location</Body>
                  <Body className="text-body-sm font-weight-medium">{po.delivery_location}</Body>
                </div>
              )}
              {po.payment_terms && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Payment Terms</Body>
                  <Body className="text-body-sm font-weight-medium">{po.payment_terms}</Body>
                </div>
              )}
              {po.shipping_method && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Shipping Method</Body>
                  <Body className="text-body-sm font-weight-medium">{po.shipping_method}</Body>
                </div>
              )}
              <div>
                <Body className="text-body-xs text-muted-foreground">Created</Body>
                <Body className="text-body-sm font-weight-medium">
                  {new Date(po.created_at).toLocaleDateString()}
                </Body>
              </div>
              {po.issued_at && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Issued</Body>
                  <Body className="text-body-sm font-weight-medium">
                    {new Date(po.issued_at).toLocaleDateString()}
                  </Body>
                </div>
              )}
            </div>
          </div>

          {po.vendor_order && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Related Order</H2>
              <Link
                href={`/vendor-orders/${po.vendor_order.id}`}
                className="text-body-sm text-primary hover:underline"
              >
                {po.vendor_order.order_number}
              </Link>
            </div>
          )}

          {po.receipts && po.receipts.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Receipts</H2>
              <div className="space-y-2">
                {po.receipts.map((receipt: { id: string; receipt_number: string; received_at: string }) => (
                  <div key={receipt.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <Text className="text-body-sm font-weight-medium">{receipt.receipt_number}</Text>
                    <Text className="text-body-xs text-muted-foreground">
                      {new Date(receipt.received_at).toLocaleDateString()}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
