'use client';

import { useRouter } from 'next/navigation';
import { Download, TrendingUp, DollarSign, Receipt, PieChart, BarChart3 } from 'lucide-react';
// Layout provided by route group
import { useExpenseStats, useExpenses, useExpenseCategories } from '../../../../hooks/useExpenses';
import {
  Container,
  Section,
  Stack,
  Grid,
  Card,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Box,
  StatCard,
} from '@ghxstship/ui';

export default function ExpenseReportsPage() {
  const router = useRouter();
  const { data: stats } = useExpenseStats();
  const { data: expenses } = useExpenses();
  const { data: categories } = useExpenseCategories();

  // Calculate category distribution
  const categoryDistribution = categories?.map(category => {
    const categoryExpenses = expenses?.filter(e => e.category_id === category.id) || [];
    const totalAmount = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const budgetUsed = category.budget_amount ? Math.round((totalAmount / category.budget_amount) * 100) : 0;
    return {
      ...category,
      expenseCount: categoryExpenses.length,
      totalAmount,
      budgetUsed,
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount) || [];

  // Calculate status distribution
  const statusDistribution = [
    { status: 'Paid', count: stats?.paid || 0, amount: stats?.paidAmount || 0, color: '#22c55e' },
    { status: 'Approved', count: stats?.approved || 0, amount: stats?.approvedAmount || 0, color: '#3b82f6' },
    { status: 'Pending', count: stats?.pending || 0, amount: stats?.pendingAmount || 0, color: '#f59e0b' },
    { status: 'Rejected', count: stats?.rejected || 0, amount: 0, color: '#ef4444' },
  ];

  const approvalRate = stats?.total ? Math.round(((stats.approved + stats.paid) / stats.total) * 100) : 0;

  return (
    <>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H2>Expense Reports</H2>
                <Body className="text-grey-600">Analytics and insights for expense management</Body>
              </Stack>
              <Button
                onClick={() => {}}
                className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
              >
                <Download className="size-4" />
                Export Report
              </Button>
            </Stack>

            {/* Key Metrics */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Expenses"
                value={stats?.total || 0}
                icon={<Receipt className="size-5" />}
              />
              <StatCard
                label="Total Amount"
                value={`$${(stats?.totalAmount || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Pending Approval"
                value={`$${(stats?.pendingAmount || 0).toLocaleString()}`}
                icon={<TrendingUp className="size-5" />}
              />
              <StatCard
                label="Paid Out"
                value={`$${(stats?.paidAmount || 0).toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
                trend="up"
                trendValue={`${approvalRate}%`}
              />
            </Grid>

            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              {/* Category Breakdown */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <PieChart className="size-5 text-grey-500" />
                    <H3>Expenses by Category</H3>
                  </Stack>
                  <Stack gap={3}>
                    {categoryDistribution.slice(0, 6).map(category => (
                      <Box key={category.id} className="flex flex-col gap-2">
                        <Stack direction="horizontal" gap={4} className="items-center justify-between">
                          <Body className="font-weight-semibold">{category.name}</Body>
                          <Body size="sm" className=" text-grey-500">${category.totalAmount.toLocaleString()}</Body>
                        </Stack>
                        {category.budget_amount && (
                          <>
                            <Box className="h-2 overflow-hidden rounded-badge bg-grey-200">
                              <Box 
                                className={`h-full ${category.budgetUsed > 100 ? 'bg-error' : category.budgetUsed > 80 ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${Math.min(100, category.budgetUsed)}%` }} 
                              />
                            </Box>
                            <Body size="sm" className=" text-grey-500">
                              {category.budgetUsed}% of ${category.budget_amount.toLocaleString()} budget
                            </Body>
                          </>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Status Distribution */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <BarChart3 className="size-5 text-grey-500" />
                    <H3>Expense Status</H3>
                  </Stack>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    {statusDistribution.map(item => (
                      <Card key={item.status} className="border-2 border-grey-200 p-4">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Box 
                              className="size-3 rounded-avatar" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <Body size="sm" className=" text-grey-500">{item.status}</Body>
                          </Stack>
                          <Body className="text-body-lg font-weight-bold">{item.count}</Body>
                          <Body size="sm" className=" text-grey-500">${item.amount.toLocaleString()}</Body>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                </Stack>
              </Card>

              {/* Approval Progress */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Approval Progress</H3>
                  <Box className="h-6 overflow-hidden rounded-card bg-grey-200">
                    <Box 
                      className="h-full bg-success" 
                      style={{ width: `${approvalRate}%` }} 
                    />
                  </Box>
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Body size="sm" className=" text-grey-500">
                      {stats?.approved || 0} approved + {stats?.paid || 0} paid of {stats?.total || 0} total
                    </Body>
                    <Badge variant="success">{approvalRate}%</Badge>
                  </Stack>
                </Stack>
              </Card>

              {/* Monthly Trend */}
              <Card className="border-2 border-grey-200 p-6">
                <Stack gap={4}>
                  <H3>Monthly Trend</H3>
                  <Stack gap={2}>
                    {[
                      { month: 'Oct', amount: 45000, percent: 60 },
                      { month: 'Nov', amount: 62000, percent: 82 },
                      { month: 'Dec', amount: 38000, percent: 50 },
                    ].map((item) => (
                      <Stack key={item.month} gap={1}>
                        <Stack direction="horizontal" className="items-center justify-between">
                          <Body size="sm" className=" text-grey-600">{item.month}</Body>
                          <Body size="sm" className=" font-weight-semibold">${item.amount.toLocaleString()}</Body>
                        </Stack>
                        <Box className="h-2 overflow-hidden rounded-badge bg-grey-200">
                          <Box 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${item.percent}%` }} 
                          />
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                  <Body size="sm" className=" text-grey-500">
                    Total Q4: ${(45000 + 62000 + 38000).toLocaleString()}
                  </Body>
                </Stack>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                <H3>Quick Actions</H3>
                <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                  <Button
                    onClick={() => router.push('/expenses')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Receipt className="size-4" />
                    View All Expenses
                  </Button>
                  <Button
                    onClick={() => router.push('/expenses?status=submitted')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <TrendingUp className="size-4" />
                    Pending Approval
                  </Button>
                  <Button
                    onClick={() => router.push('/expenses/categories')}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <PieChart className="size-4" />
                    Categories
                  </Button>
                  <Button
                    onClick={() => {}}
                    className="flex items-center justify-center gap-2 border-2 border-grey-300 bg-white p-4"
                  >
                    <Download className="size-4" />
                    Export Data
                  </Button>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </>
  );
}
