'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface CompensationPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  currentSalary: number;
  proposedSalary: number;
  equityGrant?: number;
  bonus?: number;
  effectiveDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  [key: string]: unknown;
}

const mockPlans: CompensationPlan[] = [
  { id: 'COMP-001', employeeId: 'EMP-101', employeeName: 'John Smith', department: 'Production', role: 'Senior Engineer', currentSalary: 95000, proposedSalary: 105000, equityGrant: 5000, bonus: 10000, effectiveDate: '2025-01-01', status: 'Pending Approval' },
  { id: 'COMP-002', employeeId: 'EMP-102', employeeName: 'Sarah Johnson', department: 'Finance', role: 'Finance Manager', currentSalary: 85000, proposedSalary: 92000, bonus: 8000, effectiveDate: '2025-01-01', status: 'Approved' },
  { id: 'COMP-003', employeeId: 'EMP-103', employeeName: 'Mike Williams', department: 'Operations', role: 'Operations Lead', currentSalary: 78000, proposedSalary: 85000, equityGrant: 3000, effectiveDate: '2025-01-01', status: 'Draft' },
];

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
  const [plans, setPlans] = useState<CompensationPlan[]>(mockPlans);
  const [selectedPlan, setSelectedPlan] = useState<CompensationPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalBudget = plans.reduce((sum, p) => sum + (p.proposedSalary - p.currentSalary), 0);
  const pendingCount = plans.filter(p => p.status === 'Pending Approval').length;

  const rowActions: ListPageAction<CompensationPlan>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedPlan(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: '✓', onClick: (r) => setPlans(plans.map(p => p.id === r.id ? { ...p, status: 'Approved' as const } : p)) },
  ];

  const stats = [
    { label: 'Total Plans', value: plans.length },
    { label: 'Pending Approval', value: pendingCount },
    { label: 'Budget Impact', value: `$${totalBudget.toLocaleString()}` },
    { label: 'Approved', value: plans.filter(p => p.status === 'Approved').length },
  ];

  const detailSections: DetailSection[] = selectedPlan ? [
    { id: 'overview', title: 'Compensation Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Employee:</strong> {selectedPlan.employeeName}</div>
        <div><strong>Department:</strong> {selectedPlan.department}</div>
        <div><strong>Role:</strong> {selectedPlan.role}</div>
        <div><strong>Status:</strong> {selectedPlan.status}</div>
        <div><strong>Current Salary:</strong> ${selectedPlan.currentSalary.toLocaleString()}</div>
        <div><strong>Proposed Salary:</strong> ${selectedPlan.proposedSalary.toLocaleString()}</div>
        <div><strong>Change:</strong> +{((selectedPlan.proposedSalary - selectedPlan.currentSalary) / selectedPlan.currentSalary * 100).toFixed(1)}%</div>
        <div><strong>Effective Date:</strong> {selectedPlan.effectiveDate}</div>
        {selectedPlan.equityGrant && <div><strong>Equity Grant:</strong> {selectedPlan.equityGrant.toLocaleString()} shares</div>}
        {selectedPlan.bonus && <div><strong>Bonus:</strong> ${selectedPlan.bonus.toLocaleString()}</div>}
      </div>
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
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce', href: '/workforce' }, { label: 'Compensation' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      {selectedPlan && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedPlan}
          title={(p) => p.employeeName}
          subtitle={(p) => `${p.department} • ${p.role}`}
          sections={detailSections}
          actions={[{ id: 'approve', label: 'Approve', icon: '✓' }, { id: 'edit', label: 'Edit', icon: '✏️' }]}
          onAction={(id, p) => {
            if (id === 'approve') setPlans(plans.map(plan => plan.id === p.id ? { ...plan, status: 'Approved' as const } : plan));
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
