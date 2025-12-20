'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Check, Pencil } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
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

import {
  DEMO_COMPENSATION_PLANS,
  type DemoCompensationPlan as CompensationPlan,
} from '../../../../lib/demo-data';

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
  const [plans, setPlans] = useState<CompensationPlan[]>(DEMO_COMPENSATION_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<CompensationPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalBudget = plans.reduce((sum, p) => sum + (p.proposedSalary - p.currentSalary), 0);
  const pendingCount = plans.filter(p => p.status === 'Pending Approval').length;

  const rowActions: ListPageAction<CompensationPlan>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedPlan(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: <Check className="size-4" />, onClick: (r) => setPlans(plans.map(p => p.id === r.id ? { ...p, status: 'Approved' as const } : p)) },
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
    <AtlvsAppLayout>
      <ListPage<CompensationPlan>
        title="Compensation Planning & Equity"
        subtitle="Manage compensation plans and equity grants"
        data={plans}
        columns={columns}
        rowKey="id"
        loading={false}
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
            setPlans(prev => prev.filter(p => !ids.includes(p.id)));
          } else if (action === 'approve') {
            setPlans(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: 'Approved' as const } : p));
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
          onAction={(id, p) => {
            if (id === 'approve') setPlans(plans.map(plan => plan.id === p.id ? { ...plan, status: 'Approved' as const } : plan));
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
