'use client';

import {
  Body,
  Box,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  H3,
  Input,
  Label,
  MainContent,
  ProgressBar,
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
import { Search, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Filter } from 'lucide-react';
import { useProjectCosts } from '@/hooks/useProjectCosts';

export default function ProjectCostsPage() {
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data, isLoading, error } = useProjectCosts(selectedBookingId || undefined);

  const costs = data?.costs || [];
  const summary = data?.summary || {
    total_budgeted: 0,
    total_actual: 0,
    total_variance: 0,
    variance_percent: 0,
    is_over_budget: false,
    projected_profit: 0,
    projected_margin: 0,
  };
  const categoryTotals = data?.by_category || [];

  const filteredCosts = costs.filter((cost) => {
    return categoryFilter === 'all' || cost.category === categoryFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const categories = [...new Set(costs.map((c) => c.category || 'Uncategorized'))];

  if (isLoading && selectedBookingId) {
    return (
      <>
        <EnterprisePageHeader title="Project Costs" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={4} gap={4}>
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error && selectedBookingId) {
    return (
      <>
        <EnterprisePageHeader title="Project Costs" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load project costs"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Project Costs"
        subtitle="Track budget vs actual costs for your projects"
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Card className="p-4">
              <Label className="block mb-2">Select Project</Label>
              <Box className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  placeholder="Enter booking ID to view costs..."
                  className="pl-10"
                />
              </Box>
            </Card>

            {selectedBookingId && data && (
              <>
                <Grid cols={4} gap={4}>
                  <Card className="p-4">
                    <Stack direction="horizontal" gap={2} className="items-center mb-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <Text size="sm" className="text-muted-foreground">Budgeted</Text>
                    </Stack>
                    <Body className="font-weight-bold">{formatCurrency(summary.total_budgeted)}</Body>
                  </Card>
                  <Card className="p-4">
                    <Stack direction="horizontal" gap={2} className="items-center mb-2">
                      <DollarSign className="h-5 w-5 text-secondary" />
                      <Text size="sm" className="text-muted-foreground">Actual</Text>
                    </Stack>
                    <Body className="font-weight-bold">{formatCurrency(summary.total_actual)}</Body>
                  </Card>
                  <Card className={`p-4 ${summary.is_over_budget ? 'border-destructive/50' : 'border-success/50'}`}>
                    <Stack direction="horizontal" gap={2} className="items-center mb-2">
                      {summary.is_over_budget ? (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-success" />
                      )}
                      <Text size="sm" className="text-muted-foreground">Variance</Text>
                    </Stack>
                    <Body className={`font-weight-bold ${summary.is_over_budget ? 'text-destructive' : 'text-success'}`}>
                      {formatCurrency(Math.abs(summary.total_variance))}
                      <Text size="sm" className="ml-1">({summary.is_over_budget ? '-' : '+'}{Math.abs(summary.variance_percent)}%)</Text>
                    </Body>
                  </Card>
                  <Card className="p-4">
                    <Stack direction="horizontal" gap={2} className="items-center mb-2">
                      <BarChart3 className="h-5 w-5 text-accent" />
                      <Text size="sm" className="text-muted-foreground">Projected Margin</Text>
                    </Stack>
                    <Body className="font-weight-bold">{summary.projected_margin.toFixed(1)}%</Body>
                  </Card>
                </Grid>

                <Grid cols={2} gap={6}>
                  <Card className="p-6">
                    <Stack direction="horizontal" className="justify-between items-center mb-4">
                      <H2>By Category</H2>
                      <PieChart className="h-5 w-5 text-muted-foreground" />
                    </Stack>
                    {categoryTotals.length === 0 ? (
                      <Body className="py-8 text-center text-muted-foreground">No category data available</Body>
                    ) : (
                      <Stack gap={3}>
                        {categoryTotals.map((cat, index) => {
                          const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning'];
                          const percentage = summary.total_actual > 0 ? (cat.actual / summary.total_actual) * 100 : 0;
                          return (
                            <Box key={cat.category}>
                              <Stack direction="horizontal" className="justify-between items-center mb-1">
                                <Stack direction="horizontal" gap={2} className="items-center">
                                  <Box className={`w-3 h-3 rounded-avatar ${colors[index % colors.length]}`} />
                                  <Text size="sm">{cat.category}</Text>
                                </Stack>
                                <Text size="sm" className="font-weight-medium">{formatCurrency(cat.actual)}</Text>
                              </Stack>
                              <ProgressBar value={percentage} max={100} className={colors[index % colors.length]} />
                            </Box>
                          );
                        })}
                      </Stack>
                    )}
                  </Card>

                  <Card className="p-6">
                    <Stack direction="horizontal" className="justify-between items-center mb-4">
                      <H2>Budget vs Actual</H2>
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </Stack>
                    {categoryTotals.length === 0 ? (
                      <Body className="py-8 text-center text-muted-foreground">No comparison data available</Body>
                    ) : (
                      <Stack gap={4}>
                        {categoryTotals.map((cat) => (
                          <Box key={cat.category}>
                            <Stack direction="horizontal" className="justify-between items-center mb-1">
                              <Text size="sm">{cat.category}</Text>
                              <Text size="sm" className={`font-weight-medium ${cat.variance < 0 ? 'text-destructive' : 'text-success'}`}>
                                {cat.variance >= 0 ? '+' : ''}{formatCurrency(cat.variance)}
                              </Text>
                            </Stack>
                            <Stack direction="horizontal" gap={2} className="text-muted-foreground">
                              <Text size="xs">Budget: {formatCurrency(cat.budgeted)}</Text>
                              <Text size="xs">|</Text>
                              <Text size="xs">Actual: {formatCurrency(cat.actual)}</Text>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Card>
                </Grid>

                <Card>
                  <Stack direction="horizontal" className="justify-between items-center p-4 border-b border-border">
                    <H2>Cost Details</H2>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </Select>
                    </Stack>
                  </Stack>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead className="text-right">Budgeted</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No costs found</TableCell>
                        </TableRow>
                      ) : (
                        filteredCosts.map((cost) => (
                          <TableRow key={cost.id}>
                            <TableCell>{cost.description}</TableCell>
                            <TableCell className="text-muted-foreground">{cost.category}</TableCell>
                            <TableCell className="text-muted-foreground">{cost.vendor_profile?.name || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cost.budgeted_amount || 0)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(cost.actual_amount || 0)}</TableCell>
                            <TableCell className={`text-right font-weight-medium ${(cost.variance || 0) < 0 ? 'text-destructive' : 'text-success'}`}>
                              {(cost.variance || 0) >= 0 ? '+' : ''}{formatCurrency(cost.variance || 0)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </>
            )}

            {!selectedBookingId && (
              <EmptyState
                title="Select a Project"
                description="Enter a booking ID above to view project costs and budget analysis"
                icon={<DollarSign className="h-12 w-12" />}
              />
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
