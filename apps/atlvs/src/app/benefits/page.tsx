'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Heart, Shield, Users } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { useBenefitPlans, useBenefitEnrollments, useCreateBenefitPlan, useDeleteBenefitPlan } from '../../hooks/useBenefits';

interface BenefitPlan {
  id: string;
  name: string;
  type: string;
  provider?: string;
  description?: string;
  cost_employee_monthly: number;
  cost_employer_monthly: number;
  active: boolean;
  created_at: string;
}

const typeColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  health: 'success',
  dental: 'info',
  vision: 'info',
  life: 'warning',
  disability: 'warning',
  retirement: 'ghost',
  pto: 'success',
  other: 'ghost',
};

const typeLabels: Record<string, string> = {
  health: 'Health',
  dental: 'Dental',
  vision: 'Vision',
  life: 'Life Insurance',
  disability: 'Disability',
  retirement: 'Retirement',
  pto: 'PTO',
  other: 'Other',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const columns: ListPageColumn<BenefitPlan>[] = [
  {
    key: 'name',
    label: 'Plan Name',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'type',
    label: 'Type',
    accessor: 'type',
    sortable: true,
    render: (value) => (
      <Badge variant={typeColors[String(value)] || 'ghost'}>
        {typeLabels[String(value)] || String(value).toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'provider',
    label: 'Provider',
    accessor: 'provider',
    render: (value) => value || '—',
  },
  {
    key: 'cost_employee_monthly',
    label: 'Employee Cost',
    accessor: 'cost_employee_monthly',
    sortable: true,
    render: (value) => formatCurrency(Number(value) || 0),
  },
  {
    key: 'cost_employer_monthly',
    label: 'Employer Cost',
    accessor: 'cost_employer_monthly',
    sortable: true,
    render: (value) => formatCurrency(Number(value) || 0),
  },
  {
    key: 'active',
    label: 'Status',
    accessor: 'active',
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'health', label: 'Health' },
      { value: 'dental', label: 'Dental' },
      { value: 'vision', label: 'Vision' },
      { value: 'life', label: 'Life Insurance' },
      { value: 'disability', label: 'Disability' },
      { value: 'retirement', label: 'Retirement' },
      { value: 'pto', label: 'PTO' },
    ],
  },
  {
    key: 'active',
    label: 'Status',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Plan Name', type: 'text', required: true, colSpan: 2 },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'health', label: 'Health' },
      { value: 'dental', label: 'Dental' },
      { value: 'vision', label: 'Vision' },
      { value: 'life', label: 'Life Insurance' },
      { value: 'disability', label: 'Disability' },
      { value: 'retirement', label: 'Retirement' },
      { value: 'pto', label: 'PTO' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'provider', label: 'Provider', type: 'text' },
  { name: 'cost_employee_monthly', label: 'Employee Monthly Cost', type: 'number', required: true },
  { name: 'cost_employer_monthly', label: 'Employer Monthly Cost', type: 'number', required: true },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  {
    name: 'active',
    label: 'Active',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
];

export default function BenefitsPage() {
  const router = useRouter();
  const { data: plansData, isLoading, error, refetch } = useBenefitPlans();
  const createMutation = useCreateBenefitPlan();
  const deleteMutation = useDeleteBenefitPlan();

  const plans = (plansData?.plans || []) as BenefitPlan[];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<BenefitPlan | null>(null);

  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.active).length;
  const totalEmployeeCost = plans.reduce((sum, p) => sum + (p.cost_employee_monthly || 0), 0);
  const totalEmployerCost = plans.reduce((sum, p) => sum + (p.cost_employer_monthly || 0), 0);

  const rowActions: ListPageAction<BenefitPlan>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedPlan(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/benefits/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setPlanToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      ...data,
      active: data.active === 'true' || data.active === true,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (planToDelete) {
      await deleteMutation.mutateAsync(planToDelete.id);
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
      refetch();
    }
  };

  const detailSections: DetailSection[] = selectedPlan
    ? [
        {
          title: 'Plan Information',
          fields: [
            { label: 'Name', value: selectedPlan.name },
            { label: 'Type', value: typeLabels[selectedPlan.type] || selectedPlan.type },
            { label: 'Provider', value: selectedPlan.provider || '—' },
            { label: 'Status', value: selectedPlan.active ? 'Active' : 'Inactive' },
          ],
        },
        {
          title: 'Costs',
          fields: [
            { label: 'Employee Monthly', value: formatCurrency(selectedPlan.cost_employee_monthly) },
            { label: 'Employer Monthly', value: formatCurrency(selectedPlan.cost_employer_monthly) },
            { label: 'Total Monthly', value: formatCurrency(selectedPlan.cost_employee_monthly + selectedPlan.cost_employer_monthly) },
          ],
        },
        {
          title: 'Description',
          fields: [{ label: 'Description', value: selectedPlan.description || 'No description provided' }],
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      <ListPage
        title="Benefits Management"
        description="Manage employee benefit plans and enrollments"
        data={plans}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        loading={isLoading}
        error={error ? String(error) : undefined}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Add Plan"
        stats={[
          { label: 'Total Plans', value: totalPlans },
          { label: 'Active Plans', value: activePlans },
          { label: 'Avg Employee Cost', value: formatCurrency(totalEmployeeCost / (totalPlans || 1)) },
          { label: 'Avg Employer Cost', value: formatCurrency(totalEmployerCost / (totalPlans || 1)) },
        ]}
        emptyState={{
          title: 'No benefit plans found',
          description: 'Create your first benefit plan to get started.',
          action: {
            label: 'Add Plan',
            onClick: () => setCreateModalOpen(true),
          },
        }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Benefit Plan"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Create Plan"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPlan?.name || 'Benefit Plan Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Benefit Plan"
        description={`Are you sure you want to delete "${planToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
