'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Check, Pencil } from 'lucide-react';
// Layout provided by route group
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';
import { useCompensation, type CompensationPlan as APICompensationPlan } from '@ghxstship/config';
import { DEMO_COMPENSATION_PLANS } from '../../../../lib/demo-data';

type CompensationPlan = APICompensationPlan & { [key: string]: unknown };

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case 'Approved': return 'solid';
    case 'Pending Approval': return 'outline';
    default: return 'ghost';
  }
};

const columns: ListPageColumn<CompensationPlan>[] = [
  { key: 'employeeName', label: 'Employee', accessor: 'employeeName', sortable: true },
  { key: 'department', label: 'Department', accessor: 'department', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'role', label: 'Role', accessor: 'role' },
  { key: 'currentSalary', label: 'Current', accessor: (r) => `$${r.currentSalary.toLocaleString()}`, sortable: true },
  { key: 'proposedSalary', label: 'Proposed', accessor: (r) => `$${r.proposedSalary.toLocaleString()}`, sortable: true },
  { key: 'change', label: 'Change', accessor: (r) => `+${((r.proposedSalary - r.currentSalary) / r.currentSalary * 100).toFixed(1)}%` },
  { key: 'effectiveDate', label: 'Effective', accessor: 'effectiveDate', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Draft', label: 'Draft' }, { value: 'Pending Approval', label: 'Pending Approval' }, { value: 'Approved', label: 'Approved' }] },
  { key: 'department', label: 'Department', options: [{ value: 'Production', label: 'Production' }, { value: 'Finance', label: 'Finance' }, { value: 'Operations', label: 'Operations' }] },
];

export default function CompensationPage() {
  const router = useRouter();
  const { plans: apiPlans, summary, isLoading, error, updatePlanAsync, deletePlansAsync, approvePlansAsync, refetch } = useCompensation();
  const [selectedPlan, setSelectedPlan] = useState<CompensationPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use API data or fall back to demo data
  const plans: CompensationPlan[] = apiPlans.length > 0 ? (apiPlans as CompensationPlan[]) : (DEMO_COMPENSATION_PLANS as CompensationPlan[]);

  const totalBudget = summary?.totalBudget || plans.reduce((sum, p) => sum + (p.proposedSalary - p.currentSalary), 0);
  const pendingCount = summary?.pending || plans.filter(p => p.status === 'Pending Approval').length;

  const handleApprove = async (r: CompensationPlan) => {
    try {
      await updatePlanAsync({ id: r.id, data: { status: 'Approved' } });
      refetch();
    } catch (err) {
      console.error('Failed to approve plan:', err);
    }
  };

  const rowActions: ListPageAction<CompensationPlan>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedPlan(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: <Check className="size-4" />, onClick: handleApprove },
  ];

  const stats = [
    { label: 'Total Plans', value: plans.length },
    { label: 'Pending Approval', value: pendingCount },
    { label: 'Budget Impact', value: `$${totalBudget.toLocaleString()}` },
    { label: 'Approved', value: plans.filter(p => p.status === 'Approved').length },
  ];

  const detailSections: DetailSection[] = selectedPlan ? [
    { id: 'overview', title: 'Compensation Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Employee:</strong> {selectedPlan.employeeName}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedPlan.department}</Body>
        <Body size="sm"><strong>Role:</strong> {selectedPlan.role}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedPlan.status}</Body>
        <Body size="sm"><strong>Current Salary:</strong> ${selectedPlan.currentSalary.toLocaleString()}</Body>
        <Body size="sm"><strong>Proposed Salary:</strong> ${selectedPlan.proposedSalary.toLocaleString()}</Body>
        <Body size="sm"><strong>Change:</strong> +{((selectedPlan.proposedSalary - selectedPlan.currentSalary) / selectedPlan.currentSalary * 100).toFixed(1)}%</Body>
        <Body size="sm"><strong>Effective Date:</strong> {selectedPlan.effectiveDate}</Body>
        {selectedPlan.equityGrant && <Body size="sm"><strong>Equity Grant:</strong> {selectedPlan.equityGrant.toLocaleString()} shares</Body>}
        {selectedPlan.bonus && <Body size="sm"><strong>Bonus:</strong> ${selectedPlan.bonus.toLocaleString()}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<CompensationPlan>
        title="Compensation Planning & Equity"
        subtitle="Manage compensation plans and equity grants"
        data={plans}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search compensation plans..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedPlan(r); setDrawerOpen(true); }}
        createLabel="Create Plan"
        onCreate={() => router.push('/workforce/compensation/new')}
        stats={stats}
        emptyMessage="No compensation plans found"
        emptyAction={{ label: 'Create Plan', onClick: () => router.push('/workforce/compensation/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deletePlansAsync(ids);
            refetch();
          } else if (action === 'approve') {
            await approvePlansAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedPlan && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedPlan}
          title={(p) => p.employeeName}
          subtitle={(p) => `${p.department} • ${p.role}`}
          sections={detailSections}
          actions={[{ id: 'approve', label: 'Approve', icon: <Check className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={async (id, p) => {
            if (id === 'approve') {
              await handleApprove(p);
            }
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
