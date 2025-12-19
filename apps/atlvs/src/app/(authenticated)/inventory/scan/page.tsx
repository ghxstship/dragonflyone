'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scan, Package, CheckCircle, XCircle, ArrowRightLeft, Search } from 'lucide-react';
import { useInventoryScan } from '@/hooks/useInventory';

export default function InventoryScanPage() {
  const [barcode, setBarcode] = useState('');
  const [action, setAction] = useState<'lookup' | 'check_out' | 'check_in'>('lookup');
  const [checkedOutTo, setCheckedOutTo] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{
    success: boolean;
    action: string;
    item?: {
      id: string;
      name: string;
      sku: string;
      category: string;
      quantity_total: number;
      quantity_available: number;
      location?: string;
      status: string;
    };
    message?: string;
    error?: string;
  } | null>(null);

  const scanMutation = useInventoryScan();

  const handleScan = async () => {
    if (!barcode.trim()) return;

    try {
      const response = await scanMutation.mutateAsync({
        barcode: barcode.trim(),
        action,
        checked_out_to: checkedOutTo || undefined,
        notes: notes || undefined,
      });
      setResult(response);
    } catch (err) {
      setResult({
        success: false,
        action,
        error: err instanceof Error ? err.message : 'Scan failed',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const clearResult = () => {
    setResult(null);
    setBarcode('');
    setCheckedOutTo('');
    setNotes('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/inventory"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Inventory Scanner</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Scan barcodes to look up, check out, or check in items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="h-5 w-5 text-primary" />
            <h2 className="text-h4-md font-weight-semibold text-foreground">Scan Item</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Barcode / SKU
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scan or enter barcode..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Action
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAction('lookup')}
                  className={`flex-1 px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                    action === 'lookup'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  Lookup
                </button>
                <button
                  onClick={() => setAction('check_out')}
                  className={`flex-1 px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                    action === 'check_out'
                      ? 'bg-warning text-warning-foreground border-warning'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  Check Out
                </button>
                <button
                  onClick={() => setAction('check_in')}
                  className={`flex-1 px-4 py-2 rounded-button text-body-sm font-weight-medium border-2 transition-colors ${
                    action === 'check_in'
                      ? 'bg-success text-success-foreground border-success'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  Check In
                </button>
              </div>
            </div>

            {action === 'check_out' && (
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Checked Out To
                </label>
                <input
                  type="text"
                  value={checkedOutTo}
                  onChange={(e) => setCheckedOutTo(e.target.value)}
                  placeholder="Name or event..."
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes..."
                rows={2}
                className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button
              onClick={handleScan}
              disabled={!barcode.trim() || scanMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Scan className="h-4 w-4" />
              {scanMutation.isPending ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-secondary" />
            <h2 className="text-h4-md font-weight-semibold text-foreground">Result</h2>
          </div>

          {!result ? (
            <div className="py-12 text-center">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-body-sm text-muted-foreground">
                Scan a barcode to see item details
              </p>
            </div>
          ) : result.error ? (
            <div className="py-8 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-body-sm text-destructive font-weight-medium">{result.error}</p>
              <button
                onClick={clearResult}
                className="mt-4 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Scan Another
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-body-sm font-weight-medium text-success capitalize">
                  {result.action.replace('_', ' ')} Successful
                </span>
              </div>

              {result.item && (
                <div className="bg-muted/30 rounded-card p-4 space-y-3">
                  <div>
                    <p className="text-body-xs text-muted-foreground">Item Name</p>
                    <p className="text-body-sm font-weight-medium text-foreground">{result.item.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-body-xs text-muted-foreground">SKU</p>
                      <p className="text-body-sm text-foreground">{result.item.sku}</p>
                    </div>
                    <div>
                      <p className="text-body-xs text-muted-foreground">Category</p>
                      <p className="text-body-sm text-foreground">{result.item.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-body-xs text-muted-foreground">Total Quantity</p>
                      <p className="text-body-sm font-weight-bold text-foreground">{result.item.quantity_total}</p>
                    </div>
                    <div>
                      <p className="text-body-xs text-muted-foreground">Available</p>
                      <p className="text-body-sm font-weight-bold text-success">{result.item.quantity_available}</p>
                    </div>
                  </div>
                  {result.item.location && (
                    <div>
                      <p className="text-body-xs text-muted-foreground">Location</p>
                      <p className="text-body-sm text-foreground">{result.item.location}</p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={clearResult}
                className="w-full px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Scan Another Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
