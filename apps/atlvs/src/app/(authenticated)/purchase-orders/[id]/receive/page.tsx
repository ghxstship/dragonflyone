'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, AlertTriangle, Plus, Minus, Save } from 'lucide-react';
import { usePurchaseOrder, useReceivePurchaseOrder } from '@/hooks/usePurchaseOrders';

interface ReceiptItem {
  item_id: string;
  name: string;
  quantity_ordered: number;
  quantity_received: number;
  notes: string;
}

export default function PurchaseOrderReceivePage() {
  const params = useParams();
  const router = useRouter();
  const poId = params.id as string;

  const { data, isLoading, error } = usePurchaseOrder(poId);
  const receiveMutation = useReceivePurchaseOrder();

  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [receiptNotes, setReceiptNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  const po = data?.purchase_order;
  const items = data?.items || [];

  // Initialize receipt items from PO items
  if (!initialized && items.length > 0) {
    setReceiptItems(
      items.map((item: { id: string; name: string; quantity: number }) => ({
        item_id: item.id,
        name: item.name,
        quantity_ordered: item.quantity,
        quantity_received: item.quantity,
        notes: '',
      }))
    );
    setInitialized(true);
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setReceiptItems((prev) =>
      prev.map((item) => {
        if (item.item_id === itemId) {
          const newQty = Math.max(0, Math.min(item.quantity_ordered, item.quantity_received + delta));
          return { ...item, quantity_received: newQty };
        }
        return item;
      })
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setReceiptItems((prev) =>
      prev.map((item) => (item.item_id === itemId ? { ...item, notes } : item))
    );
  };

  const handleSubmit = async () => {
    try {
      await receiveMutation.mutateAsync({
        id: poId,
        received_items: receiptItems.map((item) => ({
          item_id: item.item_id,
          quantity_received: item.quantity_received,
          notes: item.notes || undefined,
        })),
        notes: receiptNotes || undefined,
      });
      router.push(`/purchase-orders/${poId}`);
    } catch (err) {
      console.error('Failed to record receipt:', err);
    }
  };

  const totalOrdered = receiptItems.reduce((sum, item) => sum + item.quantity_ordered, 0);
  const totalReceived = receiptItems.reduce((sum, item) => sum + item.quantity_received, 0);
  const hasDiscrepancy = totalReceived !== totalOrdered;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading purchase order...</div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load purchase order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/purchase-orders/${poId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Receive Items</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            PO #{po.po_number}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Items Ordered</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalOrdered}</p>
        </div>
        <div className={`bg-background border-2 rounded-card p-4 ${hasDiscrepancy ? 'border-warning/50' : 'border-success/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className={`h-5 w-5 ${hasDiscrepancy ? 'text-warning' : 'text-success'}`} />
            <span className="text-body-sm text-muted-foreground">Items Received</span>
          </div>
          <p className={`text-h3-md font-weight-bold ${hasDiscrepancy ? 'text-warning' : 'text-success'}`}>
            {totalReceived}
          </p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            {hasDiscrepancy ? (
              <AlertTriangle className="h-5 w-5 text-warning" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <span className="text-body-sm text-muted-foreground">Status</span>
          </div>
          <p className={`text-body-lg font-weight-bold ${hasDiscrepancy ? 'text-warning' : 'text-success'}`}>
            {hasDiscrepancy ? 'Partial Receipt' : 'Full Receipt'}
          </p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-h4-md font-weight-semibold text-foreground">Receipt Items</h2>
        </div>
        <div className="divide-y divide-border">
          {receiptItems.map((item) => (
            <div key={item.item_id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-body-sm font-weight-medium text-foreground">{item.name}</p>
                  <p className="text-body-xs text-muted-foreground">
                    Ordered: {item.quantity_ordered}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.item_id, -1)}
                    disabled={item.quantity_received === 0}
                    className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-body-lg font-weight-bold text-foreground">
                    {item.quantity_received}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.item_id, 1)}
                    disabled={item.quantity_received >= item.quantity_ordered}
                    className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {item.quantity_received < item.quantity_ordered && (
                <div>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateNotes(item.item_id, e.target.value)}
                    placeholder="Note reason for discrepancy..."
                    className="w-full px-3 py-2 border-2 border-warning/50 rounded-button bg-warning/5 text-body-sm focus:outline-none focus:ring-2 focus:ring-warning"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-4">
        <label className="block text-body-sm font-weight-medium text-foreground mb-2">
          Receipt Notes
        </label>
        <textarea
          value={receiptNotes}
          onChange={(e) => setReceiptNotes(e.target.value)}
          placeholder="Add any notes about this receipt..."
          rows={3}
          className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/purchase-orders/${poId}`}
          className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={receiveMutation.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {receiveMutation.isPending ? 'Recording...' : 'Record Receipt'}
        </button>
      </div>
    </div>
  );
}
