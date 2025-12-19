'use client';

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
          <a
            href="/purchase-orders"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-card">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-h2-md font-weight-bold text-foreground">{po.po_number}</h1>
                <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {po.vendor?.company_name || po.vendor?.name || 'Unknown Vendor'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {po.status === 'approved' && (
            <button
              onClick={handleIssue}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Issue to Vendor
            </button>
          )}
          {['issued', 'acknowledged', 'partially_received'].includes(po.status) && (
            <a
              href={`/purchase-orders/${id}/receive`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success font-weight-medium text-body-sm hover:bg-success/90 transition-colors"
            >
              <Package className="h-4 w-4" />
              Record Receipt
            </a>
          )}
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</h2>
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 text-body-xs font-weight-medium text-muted-foreground">Description</th>
                  <th className="text-center py-2 text-body-xs font-weight-medium text-muted-foreground">Qty</th>
                  <th className="text-center py-2 text-body-xs font-weight-medium text-muted-foreground">Received</th>
                  <th className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Unit Price</th>
                  <th className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {po.line_items?.map((item: { description: string; quantity: number; quantity_received?: number; unit_price: number; total: number }, index: number) => (
                  <tr key={index}>
                    <td className="py-3 text-body-sm">{item.description}</td>
                    <td className="py-3 text-body-sm text-center">{item.quantity}</td>
                    <td className="py-3 text-body-sm text-center">
                      {item.quantity_received !== undefined ? (
                        <span className={item.quantity_received >= item.quantity ? 'text-success' : 'text-warning'}>
                          {item.quantity_received}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 text-body-sm text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-body-sm text-right font-weight-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(po.subtotal)}</span>
              </div>
              {po.tax_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(po.tax_amount)}</span>
                </div>
              )}
              {po.shipping_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(po.shipping_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-body-lg font-weight-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(po.total)}</span>
              </div>
            </div>
          </div>

          {po.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</h2>
              <p className="text-body-sm text-foreground">{po.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-body-xs text-muted-foreground">Vendor</p>
                <p className="text-body-sm font-weight-medium">
                  {po.vendor?.company_name || po.vendor?.name || 'Unknown'}
                </p>
              </div>
              {po.delivery_date && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Delivery Date</p>
                  <p className="text-body-sm font-weight-medium">
                    {new Date(po.delivery_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {po.delivery_location && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Delivery Location</p>
                  <p className="text-body-sm font-weight-medium">{po.delivery_location}</p>
                </div>
              )}
              {po.payment_terms && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Payment Terms</p>
                  <p className="text-body-sm font-weight-medium">{po.payment_terms}</p>
                </div>
              )}
              {po.shipping_method && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Shipping Method</p>
                  <p className="text-body-sm font-weight-medium">{po.shipping_method}</p>
                </div>
              )}
              <div>
                <p className="text-body-xs text-muted-foreground">Created</p>
                <p className="text-body-sm font-weight-medium">
                  {new Date(po.created_at).toLocaleDateString()}
                </p>
              </div>
              {po.issued_at && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Issued</p>
                  <p className="text-body-sm font-weight-medium">
                    {new Date(po.issued_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {po.vendor_order && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Related Order</h2>
              <a
                href={`/vendor-orders/${po.vendor_order.id}`}
                className="text-body-sm text-primary hover:underline"
              >
                {po.vendor_order.order_number}
              </a>
            </div>
          )}

          {po.receipts && po.receipts.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Receipts</h2>
              <div className="space-y-2">
                {po.receipts.map((receipt: { id: string; receipt_number: string; received_at: string }) => (
                  <div key={receipt.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-body-sm font-weight-medium">{receipt.receipt_number}</span>
                    <span className="text-body-xs text-muted-foreground">
                      {new Date(receipt.received_at).toLocaleDateString()}
                    </span>
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
