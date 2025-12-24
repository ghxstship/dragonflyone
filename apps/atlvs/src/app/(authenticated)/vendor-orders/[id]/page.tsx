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
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Send, Edit, Printer } from 'lucide-react';
import { useVendorOrder, useApproveVendorOrder, useSendVendorOrder } from '@/hooks/useVendorOrders';
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning', icon: Clock },
  approved: { label: 'Approved', color: 'bg-success/20 text-success', icon: CheckCircle },
  sent: { label: 'Sent to Vendor', color: 'bg-primary/20 text-primary', icon: Send },
  confirmed: { label: 'Confirmed', color: 'bg-success/20 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  completed: { label: 'Completed', color: 'bg-success/20 text-success', icon: CheckCircle },
};

export default function VendorOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data, isLoading, error } = useVendorOrder(id);
  const approveMutation = useApproveVendorOrder();
  const sendMutation = useSendVendorOrder();

  const order = data?.order;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApprove = async () => {
    if (confirm('Approve this order?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleSend = async () => {
    if (confirm('Send this order to the vendor?')) {
      await sendMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load order. The order may not exist.
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/vendor-orders"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <H1 className="text-h2-md font-weight-bold text-foreground">
                Order #{order.order_number}
              </H1>
              <Text className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-badge text-body-sm font-weight-medium ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig.label}
              </Text>
            </div>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Created {new Date(order.created_at).toLocaleDateString()}
            </Body>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'draft' && (
            <Link
              href={`/vendor-orders/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          )}
          {order.status === 'pending_approval' && (
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success font-weight-medium text-body-sm hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {approveMutation.isPending ? 'Approving...' : 'Approve'}
            </Button>
          )}
          {order.status === 'approved' && (
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? 'Sending...' : 'Send to Vendor'}
            </Button>
          )}
          <Button
            onClick={() => window.print()}
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
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Order Items</H2>
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground">Item</TableHead>
                      <TableHead className="text-center px-4 py-3 text-body-xs font-weight-medium text-muted-foreground">Qty</TableHead>
                      <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground">Unit Price</TableHead>
                      <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {order.items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="px-4 py-3">
                          <Body className="font-weight-medium text-foreground">{item.description}</Body>
                          {item.sku && (
                            <Body className="text-body-xs text-muted-foreground">SKU: {item.sku}</Body>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-center text-body-sm">
                          {item.quantity} {item.unit || 'units'}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right text-body-sm">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-weight-medium">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-card">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <Body className="text-body-sm text-muted-foreground">No items in this order</Body>
              </div>
            )}
          </div>

          {order.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</H2>
              <Body className="text-body-sm text-foreground whitespace-pre-wrap">{order.notes}</Body>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Order Summary</H2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Subtotal</Text>
                <Text className="text-body-sm font-weight-medium">{formatCurrency(order.subtotal)}</Text>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Tax</Text>
                  <Text className="text-body-sm font-weight-medium">{formatCurrency(order.tax_amount)}</Text>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Text className="text-body-sm font-weight-semibold">Total</Text>
                <Text className="text-h4-md font-weight-bold text-primary">{formatCurrency(order.total)}</Text>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Vendor</H2>
            {order.vendor ? (
              <div className="space-y-2">
                <Body className="font-weight-medium text-foreground">{order.vendor.name}</Body>
                                <Link
                  href={`/vendors/${order.vendor.id}`}
                  className="inline-block text-body-sm text-primary hover:underline mt-2"
                >
                  View Vendor Profile →
                </Link>
              </div>
            ) : (
              <Body className="text-body-sm text-muted-foreground italic">No vendor assigned</Body>
            )}
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Delivery</H2>
            <div className="space-y-2">
              {order.delivery_date && (
                <div>
                  <Body className="text-body-xs text-muted-foreground">Expected Date</Body>
                  <Body className="text-body-sm font-weight-medium">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </Body>
                </div>
              )}
              {order.delivery_location && (
                <div className="mt-3">
                  <Body className="text-body-xs text-muted-foreground">Delivery Location</Body>
                  <Body className="text-body-sm font-weight-medium">{order.delivery_location}</Body>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
