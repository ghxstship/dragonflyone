'use client';

/**
 * Edit Bill Page
 * Form for editing existing vendor bills
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, DollarSign, Calendar } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Textarea, useToast,
  type FormSection } from "@ghxstship/ui";
import { useBill, useUpdateBill, useDeleteBill } from '@/hooks/useBills';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select category' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'services', label: 'Services' },
  { value: 'venue', label: 'Venue' },
  { value: 'talent', label: 'Talent' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'travel', label: 'Travel' },
  { value: 'catering', label: 'Catering' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  vendor_id: string;
  vendor_name: string;
  bill_number: string;
  description: string;
  amount: string;
  currency: string;
  issue_date: string;
  due_date: string;
  category: string;
  reference_number: string;
  status: string;
  notes: string;
}

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: bill, isLoading, error } = useBill(billId);
  const updateMutation = useUpdateBill();
  const deleteMutation = useDeleteBill();

  const canManageBills = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    vendor_id: '',
    vendor_name: '',
    bill_number: '',
    description: '',
    amount: '',
    currency: 'USD',
    issue_date: '',
    due_date: '',
    category: '',
    reference_number: '',
    status: 'draft',
    notes: '' });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (bill) {
      setFormData({
        vendor_id: bill.vendor_id || '',
        vendor_name: bill.vendor?.name || '',
        bill_number: bill.bill_number || '',
        description: bill.description || '',
        amount: bill.amount?.toString() || '',
        currency: bill.currency || 'USD',
        issue_date: bill.issue_date?.split('T')[0] || '',
        due_date: bill.due_date?.split('T')[0] || '',
        category: bill.category || '',
        reference_number: bill.reference_number || '',
        status: bill.status || 'draft',
        notes: bill.notes || '' });
    }
  }, [bill]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateMutation.mutateAsync({
        id: billId,
        vendor_id: formData.vendor_id || undefined,
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        issue_date: formData.issue_date || undefined,
        due_date: formData.due_date,
        category: formData.category || undefined,
        reference_number: formData.reference_number.trim() || undefined,
        status: formData.status as 'pending' | 'approved' | 'paid' | 'partial' | 'cancelled',
        notes: formData.notes.trim() || undefined });

      toast.success('Bill Updated', `Bill ${bill?.bill_number} has been updated.`);

      router.push(`/bills/${billId}`);
    } catch (err) {
      toast.error('Failed to Update Bill', err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(billId);

      toast.success('Bill Deleted', `Bill ${bill?.bill_number} has been removed.`);

      router.push('/bills');
    } catch (err) {
      toast.error('Failed to Delete Bill', err instanceof Error ? err.message : 'An error occurred');
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

  const sections: FormSection[] = useMemo(() => [
    {
      id: 'details',
      title: 'Bill Details',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Bill Number</Body>
            <Input
              id="bill_number"
              value={formData.bill_number}
              disabled
              className="bg-surface-elevated"
            />
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Vendor</Body>
            <Input
              id="vendor_name"
              value={formData.vendor_name}
              onChange={(e) => handleChange('vendor_name', e.target.value)}
              placeholder="Enter vendor name"
            />
          </Stack>

          <Stack gap={2} className="md:col-span-2">
            <Body size="sm" className="font-weight-medium">Description *</Body>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter bill description"
              rows={2}
              className={errors.description ? 'border-error' : ''}
            />
            {errors.description && (
              <Body size="xs" className="text-error">{errors.description}</Body>
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
            <Body size="sm" className="font-weight-medium">Reference Number</Body>
            <Input
              id="reference_number"
              value={formData.reference_number}
              onChange={(e) => handleChange('reference_number', e.target.value)}
              placeholder="PO or invoice reference"
            />
          </Stack>
        </Grid>
      ) },
    {
      id: 'amount',
      title: 'Amount & Status',
      icon: <DollarSign className="h-5 w-5" />,
      content: (
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Amount *</Body>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="0.00"
              className={errors.amount ? 'border-error' : ''}
            />
            {errors.amount && (
              <Body size="xs" className="text-error">{errors.amount}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Currency</Body>
            <Select
              id="currency"
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </Select>
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
      id: 'dates',
      title: 'Dates & Notes',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Issue Date</Body>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleChange('issue_date', e.target.value)}
              />
            </Stack>

            <Stack gap={2}>
              <Body size="sm" className="font-weight-medium">Due Date *</Body>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className={errors.due_date ? 'border-error' : ''}
              />
              {errors.due_date && (
                <Body size="xs" className="text-error">{errors.due_date}</Body>
              )}
            </Stack>
          </Grid>

          <Stack gap={2}>
            <Body size="sm" className="font-weight-medium">Notes</Body>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any internal notes..."
              rows={3}
            />
          </Stack>
        </Stack>
      ) },
  ], [formData, errors, handleChange]);

  return (
    <EditPage
      title={bill ? `Edit Bill ${bill.bill_number}` : 'Edit Bill'}
      subtitle="Update bill information"
      breadcrumbs={bill ? [
        { label: 'Bills', href: '/bills' },
        { label: bill.bill_number, href: `/bills/${billId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={bill ? `/bills/${billId}` : '/bills'}
      backLabel="Back to Bill"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !bill) ? {
        title: 'Bill Not Found',
        description: "The bill you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Bills', onClick: () => router.push('/bills') } } : undefined}
      accessDenied={!canManageBills ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit bills.',
        action: { label: 'Back to Bills', onClick: () => router.push('/bills') } } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the bill and all associated payment records."
    />
  );
}
