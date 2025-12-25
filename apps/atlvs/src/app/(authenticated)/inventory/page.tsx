'use client';

import {
  Badge,
  Body,
  Box,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  Input,
  MainContent,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, AlertTriangle, CheckCircle, Archive, Filter, BarChart3 } from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'bg-success/20 text-success' },
  low_stock: { label: 'Low Stock', color: 'bg-warning/20 text-warning' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-destructive/20 text-destructive' },
  discontinued: { label: 'Discontinued', color: 'bg-muted text-muted-foreground' },
};

const CATEGORIES = ['All', 'Furniture', 'Linens', 'Decor', 'Lighting', 'Audio/Visual', 'Catering'];

export default function InventoryPage() {
  const router = useRouter();
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
      <>
        <EnterprisePageHeader title="Inventory" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={4} gap={4}>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Inventory" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load inventory"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
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
    <>
      <EnterprisePageHeader
        title="Inventory"
        subtitle="Track and manage rental inventory items"
        primaryAction={{ label: 'Add Item', onClick: () => router.push('/inventory/new') }}
        secondaryActions={[
          { label: 'Transfers', onClick: () => router.push('/inventory/transfers') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-4">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <Text size="sm" className="text-muted-foreground">Total Items</Text>
                </Stack>
                <Body className="font-weight-bold">{stats.total}</Body>
              </Card>
              <Card className="p-4 border-success/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Text size="sm" className="text-muted-foreground">In Stock</Text>
                </Stack>
                <Body className="font-weight-bold text-success">{stats.inStock}</Body>
              </Card>
              <Card className="p-4 border-warning/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <Text size="sm" className="text-muted-foreground">Low Stock</Text>
                </Stack>
                <Body className="font-weight-bold text-warning">{stats.lowStock}</Body>
              </Card>
              <Card className="p-4 border-destructive/50">
                <Stack direction="horizontal" gap={2} className="items-center mb-2">
                  <Archive className="h-5 w-5 text-destructive" />
                  <Text size="sm" className="text-muted-foreground">Out of Stock</Text>
                </Stack>
                <Body className="font-weight-bold text-destructive">{stats.outOfStock}</Body>
              </Card>
            </Grid>

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </Stack>
            </Stack>

            {filteredInventory.length === 0 ? (
              <EmptyState
                title="No inventory items found"
                description={searchQuery ? 'Try adjusting your search' : 'Add your first inventory item'}
                icon={<Package className="h-12 w-12" />}
                action={{ label: 'Add Item', onClick: () => router.push('/inventory/new') }}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Min Qty</TableHead>
                      <TableHead className="text-right">Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
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
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link href={`/inventory/${item.id}`} className="hover:text-primary">
                              {item.product_id}
                            </Link>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.location?.name || 'Unassigned'}
                          </TableCell>
                          <TableCell className="text-right font-weight-medium">
                            {item.min_quantity}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.reorder_point || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig?.color || 'bg-muted text-muted-foreground'}>
                              {hasAlert ? (alertType === 'out_of_stock' ? 'Out of Stock' : 'Low Stock') : 'In Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
