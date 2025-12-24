'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Input,
  Label,
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
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, XCircle, BarChart3, Filter, RefreshCw } from 'lucide-react';
import { useInventoryAvailability } from '@/hooks/useInventory';

export default function InventoryAvailabilityPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading, error, refetch } = useInventoryAvailability({
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const items = data?.items || [];
  const summary = data?.summary || {
    total_items: 0,
    available_items: 0,
    fully_booked_items: 0,
    average_utilization: 0,
  };

  const categories = [...new Set(items.map((item) => item.category))];
  const filteredItems = items.filter((item) =>
    categoryFilter === 'all' || item.category === categoryFilter
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading availability...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load availability</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/inventory"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Inventory Availability</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Check item availability for specific date ranges
            </Body>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="block text-body-xs font-weight-medium text-muted-foreground mb-1">
              Start Date
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <Label className="block text-body-xs font-weight-medium text-muted-foreground mb-1">
              End Date
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-1">
            <Label className="block text-body-xs font-weight-medium text-muted-foreground mb-1">
              Category
            </Label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Items</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{summary.total_items}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Available</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">{summary.available_items}</Body>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Fully Booked</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{summary.fully_booked_items}</Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            <Text className="text-body-sm text-muted-foreground">Avg Utilization</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{summary.average_utilization}%</Body>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <H2 className="text-h4-md font-weight-semibold text-foreground">Item Availability</H2>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Text className="text-body-sm text-muted-foreground">
              {filteredItems.length} items
            </Text>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-4 py-3 text-left text-body-xs font-weight-semibold text-muted-foreground">Item</TableHead>
                <TableHead className="px-4 py-3 text-left text-body-xs font-weight-semibold text-muted-foreground">Category</TableHead>
                <TableHead className="px-4 py-3 text-center text-body-xs font-weight-semibold text-muted-foreground">Total</TableHead>
                <TableHead className="px-4 py-3 text-center text-body-xs font-weight-semibold text-muted-foreground">Reserved</TableHead>
                <TableHead className="px-4 py-3 text-center text-body-xs font-weight-semibold text-muted-foreground">Available</TableHead>
                <TableHead className="px-4 py-3 text-center text-body-xs font-weight-semibold text-muted-foreground">Utilization</TableHead>
                <TableHead className="px-4 py-3 text-right text-body-xs font-weight-semibold text-muted-foreground">Unit Cost</TableHead>
                <TableHead className="px-4 py-3 text-center text-body-xs font-weight-semibold text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="px-4 py-3">
                      <div>
                        <Body className="text-body-sm font-weight-medium text-foreground">{item.name}</Body>
                        <Body className="text-body-xs text-muted-foreground">{item.sku}</Body>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">{item.category}</TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-center text-foreground">{item.quantity_total}</TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-center text-warning">{item.quantity_reserved}</TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-center font-weight-bold text-success">{item.quantity_free}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-avatar overflow-hidden">
                          <div
                            className={`h-full rounded-avatar ${
                              item.utilization_rate > 80 ? 'bg-destructive' :
                              item.utilization_rate > 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${item.utilization_rate}%` }}
                          />
                        </div>
                        <Text className="text-body-xs text-muted-foreground w-12 text-right">
                          {item.utilization_rate}%
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-right text-foreground">
                      {item.unit_cost ? formatCurrency(item.unit_cost) : '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      {item.is_available ? (
                        <Text className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-badge text-body-xs font-weight-medium">
                          <CheckCircle className="h-3 w-3" />
                          Available
                        </Text>
                      ) : (
                        <Text className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded-badge text-body-xs font-weight-medium">
                          <XCircle className="h-3 w-3" />
                          Booked
                        </Text>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
