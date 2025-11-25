'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Select, Card, Grid, Badge, LoadingSpinner, ProgressBar, Stack, Breadcrumb, BreadcrumbItem } from '@ghxstship/ui';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Download, Plus } from 'lucide-react';
import { useBudgets } from '@/hooks/useBudgets';

export default function BudgetsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('2024-q4');
  const { data: budgets, isLoading } = useBudgets({ period: selectedPeriod });

  const handleExport = () => {
    // Trigger download
    alert('Exporting budget report...');
  };

  const handleNewBudget = () => {
    router.push('/budgets/new');
  };

  const handleViewDetails = (budgetId: string) => {
    router.push(`/budgets/${budgetId}`);
  };

  const handleAdjustBudget = (budgetId: string) => {
    router.push(`/budgets/${budgetId}/edit`);
  };

  const mockBudgets = [
    {
      id: '1',
      name: 'Ultra Music Festival 2025',
      category: 'Events',
      budgeted: 2500000,
      actual: 2350000,
      variance: 150000,
      status: 'on-track',
    },
    {
      id: '2',
      name: 'Operations & Overhead',
      category: 'Operations',
      budgeted: 450000,
      actual: 475000,
      variance: -25000,
      status: 'over',
    },
    {
      id: '3',
      name: 'Marketing & Sales',
      category: 'Marketing',
      budgeted: 320000,
      actual: 298000,
      variance: 22000,
      status: 'on-track',
    },
    {
      id: '4',
      name: 'Technology & Infrastructure',
      category: 'Technology',
      budgeted: 180000,
      actual: 195000,
      variance: -15000,
      status: 'over',
    },
  ];

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading budgets..." />
      </Section>
    );
  }

  const displayBudgets = budgets || mockBudgets;
  const totalBudgeted = displayBudgets.reduce((sum: number, b: any) => sum + b.budgeted, 0);
  const totalActual = displayBudgets.reduce((sum: number, b: any) => sum + (b.actual || 0), 0);
  const totalVariance = totalBudgeted - totalActual;
  const variancePercent = ((totalVariance / totalBudgeted) * 100).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-white text-black border-2 border-black';
      case 'over': return 'bg-grey-900 text-white';
      case 'under': return 'bg-grey-400 text-white';
      default: return 'bg-grey-200 text-black';
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <Section className="min-h-screen bg-ink-950 text-white">
      <Navigation />
      <Section className="py-8">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/finance">Finance</BreadcrumbItem>
            <BreadcrumbItem active>Budgets</BreadcrumbItem>
          </Breadcrumb>
        <Stack gap={4} direction="horizontal" className="justify-between items-start mb-8">
          <Stack gap={2}>
            <Display>BUDGET MANAGEMENT</Display>
            <Body className="text-grey-600">Track and analyze financial performance</Body>
          </Stack>
          <Stack gap={3} direction="horizontal">
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-48"
            >
              <option value="2024-q4">Q4 2024</option>
              <option value="2024-q3">Q3 2024</option>
              <option value="2024-ytd">YTD 2024</option>
              <option value="2024-annual">Annual 2024</option>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              EXPORT
            </Button>
            <Button onClick={handleNewBudget}>
              <Plus className="w-4 h-4 mr-2" />
              NEW BUDGET
            </Button>
          </Stack>
        </Stack>

        {/* Summary Cards */}
        <Grid cols={4} gap={6} className="mb-8">
          <Card className="p-6">
            <Stack gap={2} direction="horizontal" className="items-center mb-2">
              <DollarSign className="w-5 h-5 text-grey-600" />
              <H3>BUDGETED</H3>
            </Stack>
            <Display size="md" className="mb-1">{formatCurrency(totalBudgeted)}</Display>
            <Body className="text-sm text-grey-600">Total planned spend</Body>
          </Card>

          <Card className="p-6">
            <Stack gap={2} direction="horizontal" className="items-center mb-2">
              <DollarSign className="w-5 h-5 text-grey-600" />
              <H3>ACTUAL</H3>
            </Stack>
            <Display size="md" className="mb-1">{formatCurrency(totalActual)}</Display>
            <Body className="text-sm text-grey-600">Total actual spend</Body>
          </Card>

          <Card className="p-6">
            <Stack gap={2} direction="horizontal" className="items-center mb-2">
              {totalVariance >= 0 ? (
                <TrendingUp className="w-5 h-5 text-black" />
              ) : (
                <TrendingDown className="w-5 h-5 text-black" />
              )}
              <H3>VARIANCE</H3>
            </Stack>
            <Display size="md" className={`mb-1 ${totalVariance < 0 ? 'text-grey-900' : ''}`}>
              {formatCurrency(Math.abs(totalVariance))}
            </Display>
            <Body className="text-sm text-grey-600">
              {totalVariance >= 0 ? 'Under' : 'Over'} budget ({variancePercent}%)
            </Body>
          </Card>

          <Card className="p-6 bg-grey-100">
            <Stack gap={2} direction="horizontal" className="items-center mb-2">
              <AlertCircle className="w-5 h-5" />
              <H3>ALERTS</H3>
            </Stack>
            <Display size="md" className="mb-1">2</Display>
            <Body className="text-sm text-grey-600">Items need attention</Body>
          </Card>
        </Grid>

        {/* Budget Details */}
        <Card className="mb-8">
          <Stack className="p-6 border-b-2 border-grey-200">
            <H2>BUDGET BREAKDOWN</H2>
          </Stack>
          <Stack gap={0} className="divide-y divide-grey-200">
            {displayBudgets.map((budget: any) => (
              <Stack key={budget.id} gap={4} className="p-6">
                <Stack gap={4} direction="horizontal" className="justify-between items-start">
                  <Stack gap={1} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <H3>{budget.name}</H3>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status.toUpperCase().replace('-', ' ')}
                      </Badge>
                    </Stack>
                    <Body className="text-sm text-grey-600">{budget.category}</Body>
                  </Stack>
                </Stack>

                <Grid cols={4} gap={6} className="mb-3">
                  <Stack gap={1}>
                    <Body className="text-sm text-grey-600 mb-1">Budgeted</Body>
                    <H3>{formatCurrency(budget.budgeted)}</H3>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-sm text-grey-600">Actual</Body>
                    <H3>{formatCurrency(budget.actual)}</H3>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-sm text-grey-600">Variance</Body>
                    <H3 className={budget.variance < 0 ? 'text-grey-900' : ''}>
                      {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)}
                    </H3>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-sm text-grey-600">Utilization</Body>
                    <H3>{((budget.actual / budget.budgeted) * 100).toFixed(0)}%</H3>
                  </Stack>
                </Grid>

                {/* Progress Bar */}
                <Stack className="mt-2">
                  <ProgressBar 
                    value={(budget.actual / budget.budgeted) * 100} 
                    size="lg"
                  />
                </Stack>

                <Stack gap={2} direction="horizontal" className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(budget.id)}>VIEW DETAILS</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAdjustBudget(budget.id)}>ADJUST BUDGET</Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Card>

        {/* Category Analysis */}
        <Grid cols={2} gap={6}>
          <Card className="p-6">
            <H2 className="mb-4">SPENDING BY CATEGORY</H2>
            <Stack gap={3}>
              {[
                { name: 'Events', amount: 2350000, percent: 72 },
                { name: 'Operations', amount: 475000, percent: 15 },
                { name: 'Marketing', amount: 298000, percent: 9 },
                { name: 'Technology', amount: 195000, percent: 6 },
              ].map((cat, idx) => (
                <Stack key={idx} gap={1}>
                  <Stack gap={2} direction="horizontal" className="justify-between">
                    <Body>{cat.name}</Body>
                    <Body className="font-bold">{formatCurrency(cat.amount)}</Body>
                  </Stack>
                  <ProgressBar value={cat.percent} />
                </Stack>
              ))}
            </Stack>
          </Card>

          <Card className="p-6">
            <H2 className="mb-4">FORECAST VS ACTUAL</H2>
            <Stack gap={4}>
              <Stack gap={8} direction="horizontal" className="justify-between pb-3 border-b border-grey-200">
                <Body className="text-grey-600">Month</Body>
                <Stack gap={8} direction="horizontal">
                  <Body className="text-grey-600">Forecast</Body>
                  <Body className="text-grey-600">Actual</Body>
                </Stack>
              </Stack>
              {[
                { month: 'October', forecast: 890000, actual: 875000 },
                { month: 'November', forecast: 920000, actual: 945000 },
                { month: 'December', forecast: 1100000, actual: 1098000 },
              ].map((row, idx) => (
                <Stack key={idx} gap={8} direction="horizontal" className="justify-between">
                  <Body>{row.month}</Body>
                  <Stack gap={8} direction="horizontal">
                    <Body className="w-20 text-right">{formatCurrency(row.forecast)}</Body>
                    <Body className="w-20 text-right font-bold">{formatCurrency(row.actual)}</Body>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Container>
      </Section>
    </Section>
  );
}
