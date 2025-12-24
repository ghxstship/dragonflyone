'use client';

import {
  Body,
  H1,
  H3,
  Input,
  Link,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, CheckCircle, Archive, Filter, BarChart3 } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'bg-success/20 text-success' },
  low_stock: { label: 'Low Stock', color: 'bg-warning/20 text-warning' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-destructive/20 text-destructive' },
  discontinued: { label: 'Discontinued', color: 'bg-muted text-muted-foreground' },
};

const CATEGORIES = ['All', 'Furniture', 'Linens', 'Decor', 'Lighting', 'Audio/Visual', 'Catering'];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useInventory({
    category: categoryFilter !== 'All' ? categoryFilter : undefined,
    low_stock: statusFilter === 'low_stock' ? true : undefined,
  });

  const inventory = data?.inventory || [];
  const alerts = data?.alerts || [];
  const summary = data?.summary || { total_items: 0, low_stock_alerts: 0, out_of_stock_alerts: 0, total_alerts: 0 };

  const filteredInventory = inventory.filter((item: InventoryItem) => {
    const matchesSearch = !searchQuery || 
      item.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: summary.total_items,
    inStock: summary.total_items - summary.low_stock_alerts - summary.out_of_stock_alerts,
    lowStock: summary.low_stock_alerts,
    outOfStock: summary.out_of_stock_alerts,
    totalValue: 0, // Would need to aggregate from inventory items if unit_cost is available
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-card" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load inventory. Please try again.
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Inventory</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Track and manage rental inventory items
          </Body>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/inventory/transfers"
            className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            Transfers
          </Link>
          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Items</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{stats.total}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">In Stock</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">{stats.inStock}</Body>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Low Stock</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">{stats.lowStock}</Body>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Archive className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Out of Stock</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{stats.outOfStock}</Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Value</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{formatCurrency(stats.totalValue)}</Body>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No inventory items found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Add your first inventory item'}
          </Body>
          <Link
            href="/inventory/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Link>
        </div>
      )}

      {filteredInventory.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="text-left p-4 text-body-sm font-weight-semibold text-foreground">Product ID</TableHead>
                <TableHead className="text-left p-4 text-body-sm font-weight-semibold text-foreground">Location</TableHead>
                <TableHead className="text-right p-4 text-body-sm font-weight-semibold text-foreground">Min Qty</TableHead>
                <TableHead className="text-right p-4 text-body-sm font-weight-semibold text-foreground">Reorder Point</TableHead>
                <TableHead className="text-left p-4 text-body-sm font-weight-semibold text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item: InventoryItem) => {
                const hasAlert = alerts.some(a => a.product_id === item.product_id);
                const alertType = alerts.find(a => a.product_id === item.product_id)?.alert_type;
                const statusConfig = alertType 
                  ? STATUS_CONFIG[alertType === 'out_of_stock' ? 'out_of_stock' : 'low_stock'] 
                  : STATUS_CONFIG['in_stock'];

                return (
                  <TableRow key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <TableCell className="p-4">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="text-body-sm font-weight-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.product_id}
                      </Link>
                    </TableCell>
                    <TableCell className="p-4">
                      <Text className="text-body-sm text-muted-foreground">
                        {item.location?.name || 'Unassigned'}
                      </Text>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <Text className="text-body-sm font-weight-medium text-foreground">
                        {item.min_quantity}
                      </Text>
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <Text className="text-body-sm text-muted-foreground">
                        {item.reorder_point || '-'}
                      </Text>
                    </TableCell>
                    <TableCell className="p-4">
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig?.color || 'bg-muted text-muted-foreground'}`}>
                        {hasAlert ? (alertType === 'out_of_stock' ? 'Out of Stock' : 'Low Stock') : 'In Stock'}
                      </Text>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
