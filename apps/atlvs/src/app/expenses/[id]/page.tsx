'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, CheckCircle, XCircle, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useExpense, useApproveExpense, useRejectExpense, useMarkExpensePaid } from '../../../hooks/useExpenses';
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
  ConfirmDialog,
} from '@ghxstship/ui';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  
  const { data: expense, isLoading, refetch } = useExpense(expenseId);
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const markPaidMutation = useMarkExpensePaid();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'solid'> = {
    paid: 'success',
    reimbursed: 'success',
    approved: 'info',
    submitted: 'warning',
    draft: 'solid',
    rejected: 'error',
  };

  const handleApprove = async () => {
    await approveMutation.mutateAsync({ id: expenseId, approverId: 'current-user-id' });
    setApproveDialogOpen(false);
    refetch();
  };

  const handleReject = async () => {
    await rejectMutation.mutateAsync({ id: expenseId });
    setRejectDialogOpen(false);
    refetch();
  };

  const handleMarkPaid = async () => {
    await markPaidMutation.mutateAsync({ id: expenseId });
    setPaidDialogOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Loading...</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  if (!expense) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Expense not found</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Section className="min-h-screen bg-grey-100 py-8">
        <Container>
          <Stack gap={6}>
            {/* Header */}
            <Stack direction="horizontal" gap={4} className="items-start justify-between">
              <Stack gap={4}>
                <Button
                  onClick={() => router.back()}
                  className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <ArrowLeft className="size-4" />
                  Back to Expenses
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{expense.description}</H2>
                    <Badge variant={statusColors[expense.status] || 'solid'}>
                      {expense.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {expense.vendor_name || 'No vendor'} | {expense.category?.name || 'Uncategorized'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {expense.status === 'submitted' && (
                  <>
                    <Button
                      onClick={() => setApproveDialogOpen(true)}
                      className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                    >
                      <CheckCircle className="size-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setRejectDialogOpen(true)}
                      className="flex items-center gap-2 border-2 border-error bg-error px-4 py-2 text-white"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                  </>
                )}
                {expense.status === 'approved' && (
                  <Button
                    onClick={() => setPaidDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <DollarSign className="size-4" />
                    Mark as Paid
                  </Button>
                )}
                {(expense.status === 'draft' || expense.status === 'rejected') && (
                  <Button
                    onClick={() => router.push(`/expenses/${expenseId}/edit`)}
                    className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Amount"
                value={`${expense.currency || '$'}${expense.amount?.toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Expense Date"
                value={new Date(expense.expense_date).toLocaleDateString()}
                icon={<Calendar className="size-5" />}
              />
              <StatCard
                label="Status"
                value={expense.status.toUpperCase()}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Category"
                value={expense.category?.name || 'None'}
                icon={<FileText className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Expense Details */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Expense Details</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Description</Body>
                          <Body>{expense.description}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Vendor</Body>
                          <Body>{expense.vendor_name || 'Not specified'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Amount</Body>
                          <Body className="font-weight-semibold">{expense.currency || '$'}{expense.amount?.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Category</Body>
                          <Body>{expense.category?.name || 'Uncategorized'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Expense Date</Body>
                          <Body>{new Date(expense.expense_date).toLocaleDateString()}</Body>
                        </Stack>
                        {expense.tags && expense.tags.length > 0 && (
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Tags</Body>
                            <Stack direction="horizontal" gap={2}>
                              {expense.tags.map((tag, index) => (
                                <Badge key={index}>{tag}</Badge>
                              ))}
                            </Stack>
                          </Stack>
                        )}
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Receipt */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Receipt</H3>
                      {expense.receipt_url ? (
                        <Box className="rounded-card border-2 border-grey-200 p-4">
                          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            View Receipt
                          </a>
                        </Box>
                      ) : (
                        <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                          <Body className="text-grey-500">No receipt attached.</Body>
                        </Box>
                      )}
                    </Stack>
                  </Card>

                  {/* Notes */}
                  {expense.notes && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={3}>
                        <H3>Notes</H3>
                        <Body className="text-grey-700">{expense.notes}</Body>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Submission Info */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Submission</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Submitted By</Body>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <User className="size-4 text-grey-400" />
                          <Body>{expense.submitter ? `${expense.submitter.first_name} ${expense.submitter.last_name}` : 'Unknown'}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-grey-500">Created</Body>
                        <Body>{new Date(expense.created_at).toLocaleString()}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Approval Info */}
                {(expense.status === 'approved' || expense.status === 'paid' || expense.status === 'reimbursed') && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Approval</H3>
                      <Stack gap={3}>
                        <Stack gap={1}>
                          <Body className="text-body-sm text-grey-500">Approved By</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <User className="size-4 text-grey-400" />
                            <Body>{expense.approver ? `${expense.approver.first_name} ${expense.approver.last_name}` : 'Unknown'}</Body>
                          </Stack>
                        </Stack>
                        {expense.approved_at && (
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Approved At</Body>
                            <Body>{new Date(expense.approved_at).toLocaleString()}</Body>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                )}

                {/* Payment Info */}
                {(expense.status === 'paid' || expense.status === 'reimbursed') && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Payment</H3>
                      <Stack gap={3}>
                        {expense.paid_at && (
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Paid At</Body>
                            <Body>{new Date(expense.paid_at).toLocaleString()}</Body>
                          </Stack>
                        )}
                        {expense.payment_method && (
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Payment Method</Body>
                            <Body>{expense.payment_method}</Body>
                          </Stack>
                        )}
                        {expense.payment_reference && (
                          <Stack gap={1}>
                            <Body className="text-body-sm text-grey-500">Reference</Body>
                            <Body>{expense.payment_reference}</Body>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <ConfirmDialog
        open={approveDialogOpen}
        title="Approve Expense"
        message={`Approve expense "${expense.description}" for ${expense.currency || '$'}${expense.amount?.toLocaleString()}?`}
        variant="info"
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => setApproveDialogOpen(false)}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        title="Reject Expense"
        message={`Reject expense "${expense.description}"?`}
        variant="danger"
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => setRejectDialogOpen(false)}
      />

      <ConfirmDialog
        open={paidDialogOpen}
        title="Mark as Paid"
        message={`Mark expense "${expense.description}" as paid?`}
        variant="info"
        confirmLabel="Mark Paid"
        onConfirm={handleMarkPaid}
        onCancel={() => setPaidDialogOpen(false)}
      />
    </AtlvsAppLayout>
  );
}
