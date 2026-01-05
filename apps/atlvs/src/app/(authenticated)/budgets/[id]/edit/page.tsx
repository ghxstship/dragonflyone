'use client';

/**
 * Edit Budget Page
 * Form for editing existing budgets
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DollarSign, Calendar, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Textarea, useToast,
  type FormSection } from "@ghxstship/ui";
import { useBudget, useUpdateBudget, useDeleteBudget } from '@/hooks/useBudgets';

const CATEGORY_OPTIONS = [
  { value: 'production', label: 'Production' },
  { value: 'talent', label: 'Talent' },
  { value: 'venue', label: 'Venue' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'staffing', label: 'Staffing' },
  { value: 'travel', label: 'Travel' },
  { value: 'catering', label: 'Catering' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'on-track', label: 'On Track' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'over', label: 'Over Budget' },
  { value: 'under', label: 'Under Budget' },
];

interface FormData {
  name: string;
  category: string;
  budgeted: string;
  actual: string;
  period: string;
  status: string;
  notes: string;
}

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: budget, isLoading, error } = useBudget(budgetId);
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const canManageBudgets = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: 'production',
    budgeted: '',
    actual: '',
    period: '',
    status: 'on-track',
    notes: '' });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        category: 'production',
        budgeted: budget.total_amount?.toString() || '',
        actual: '',
        period: budget.fiscal_year?.toString() || '',
        status: budget.status || 'draft',
        notes: budget.notes || '' });
    }
  }, [budget]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    if (!formData.budgeted.trim()) {
      newErrors.budgeted = 'Budgeted amount is required';
    } else if (isNaN(parseFloat(formData.budgeted))) {
      newErrors.budgeted = 'Budgeted amount must be a valid number';
    }
    if (formData.actual && isNaN(parseFloat(formData.actual))) {
      newErrors.actual = 'Actual amount must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const totalAmount = parseFloat(formData.budgeted);

      await updateMutation.mutateAsync({
        id: budgetId,
        name: formData.name.trim(),
        total_amount: totalAmount,
        fiscal_year: formData.period ? parseInt(formData.period) : undefined,
        status: formData.status as 'active' | 'draft' | 'closed',
        notes: formData.notes.trim() || undefined });

      toast.success('Budget Updated', `${formData.name} has been updated.`);

      router.push(`/budgets/${budgetId}`);
    } catch (err) {
      toast.error('Failed to Update Budget', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(budgetId);

      toast.success('Budget Deleted', `${budget?.name} has been removed.`);

      router.push('/budgets');
    } catch (err) {
      toast.error('Failed to Delete Budget', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  }, []);

  // Calculate variance for display
  const budgetedNum = parseFloat(formData.budgeted) || 0;
  const actualNum = parseFloat(formData.actual) || 0;
  const variance = budgetedNum - actualNum;
  const utilization = budgetedNum > 0 ? ((actualNum / budgetedNum) * 100).toFixed(1) : '0';

  const sections: FormSection[] = useMemo(() => [
    {
      id: 'details',
      title: 'Budget Details',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Budget Name *</Body>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter budget name"
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <Body size="xs" className="text-error">{errors.name}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Category</Body>
            <Select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Period</Body>
            <Input
              id="period"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              placeholder="e.g., 2024-Q4, FY2024"
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Status</Body>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>
        </Grid>
      ) },
    {
      id: 'amounts',
      title: 'Budget Amounts',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Budgeted Amount *</Body>
              <Input
                id="budgeted"
                type="number"
                step="0.01"
                value={formData.budgeted}
                onChange={(e) => handleChange('budgeted', e.target.value)}
                placeholder="0.00"
                className={errors.budgeted ? 'border-error' : ''}
              />
              {errors.budgeted && (
                <Body size="xs" className="text-error">{errors.budgeted}</Body>
              )}
            </Stack>

            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Actual Spent</Body>
              <Input
                id="actual"
                type="number"
                step="0.01"
                value={formData.actual}
                onChange={(e) => handleChange('actual', e.target.value)}
                placeholder="0.00"
                className={errors.actual ? 'border-error' : ''}
              />
              {errors.actual && (
                <Body size="xs" className="text-error">{errors.actual}</Body>
              )}
            </Stack>
          </Grid>

          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 p-4 bg-surface-elevated rounded-card">
            <Stack gap={1}>
              <Body size="xs" className="text-muted-foreground">Variance</Body>
              <Body className={`font-weight-bold ${variance >= 0 ? 'text-success' : 'text-error'}`}>
                {variance >= 0 ? '+' : ''}{variance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </Body>
            </Stack>
            <Stack gap={1}>
              <Body size="xs" className="text-muted-foreground">Utilization</Body>
              <Body className="font-weight-bold">{utilization}%</Body>
            </Stack>
          </Grid>
        </Stack>
      ) },
    {
      id: 'notes',
      title: 'Notes',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <Stack gap={2}>
          <Body size="sm" className="font-weight-medium">Notes</Body>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes about this budget..."
            rows={4}
          />
        </Stack>
      ) },
  ], [formData, errors, handleChange, variance, utilization]);

  return (
    <EditPage
      title={budget ? `Edit ${budget.name}` : 'Edit Budget'}
      subtitle="Update budget information"
      breadcrumbs={budget ? [
        { label: 'Budgets', href: '/budgets' },
        { label: budget.name, href: `/budgets/${budgetId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={budget ? `/budgets/${budgetId}` : '/budgets'}
      backLabel="Back to Budget"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !budget) ? {
        title: 'Budget Not Found',
        description: "The budget you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Budgets', onClick: () => router.push('/budgets') } } : undefined}
      accessDenied={!canManageBudgets ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit budgets.',
        action: { label: 'Back to Budgets', onClick: () => router.push('/budgets') } } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the budget and all associated line items."
    />
  );
}
