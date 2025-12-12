'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Pencil, DollarSign, CheckCircle, Plus, ExternalLink, Mail, Phone } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useSponsor, useRecordPayment, useCreateDeliverable, useCompleteDeliverable } from '../../../hooks/useSponsors';
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
  RecordFormModal,
  ConfirmDialog,
  type FormFieldConfig,
} from '@ghxstship/ui';

const paymentFormFields: FormFieldConfig[] = [
  { name: 'amount', label: 'Payment Amount', type: 'number', required: true, placeholder: '0.00' },
  { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Payment notes...' },
];

const deliverableFormFields: FormFieldConfig[] = [
  { name: 'title', label: 'Deliverable Title', type: 'text', required: true, placeholder: 'e.g., Logo on main stage banner' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Describe the deliverable...' },
  { name: 'due_date', label: 'Due Date', type: 'date' },
];

export default function SponsorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sponsorId = params.id as string;
  const action = searchParams.get('action');
  
  const { data: sponsor, isLoading, refetch } = useSponsor(sponsorId);
  const recordPaymentMutation = useRecordPayment();
  const createDeliverableMutation = useCreateDeliverable();
  const completeDeliverableMutation = useCompleteDeliverable();
  
  const [paymentModalOpen, setPaymentModalOpen] = useState(action === 'payment');
  const [deliverableModalOpen, setDeliverableModalOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [deliverableToComplete, setDeliverableToComplete] = useState<string | null>(null);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    confirmed: 'success',
    active: 'success',
    negotiating: 'warning',
    prospect: 'info',
    completed: 'default',
    cancelled: 'error',
  };

  const paymentColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    paid: 'success',
    partial: 'warning',
    pending: 'default',
    overdue: 'error',
  };

  const handleRecordPayment = async (data: Record<string, unknown>) => {
    await recordPaymentMutation.mutateAsync({
      id: sponsorId,
      amount: Number(data.amount),
    });
    setPaymentModalOpen(false);
    refetch();
  };

  const handleCreateDeliverable = async (data: Record<string, unknown>) => {
    await createDeliverableMutation.mutateAsync({
      sponsor_id: sponsorId,
      title: String(data.title),
      description: data.description ? String(data.description) : undefined,
      due_date: data.due_date ? String(data.due_date) : undefined,
      status: 'pending',
    });
    setDeliverableModalOpen(false);
    refetch();
  };

  const handleCompleteDeliverable = async () => {
    if (deliverableToComplete) {
      await completeDeliverableMutation.mutateAsync({
        id: deliverableToComplete,
        sponsorId,
        completedBy: user?.id || '', 
      });
      setCompleteDialogOpen(false);
      setDeliverableToComplete(null);
      refetch();
    }
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

  if (!sponsor) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Sponsor not found</Body>
          </Container>
        </Section>
      </AtlvsAppLayout>
    );
  }

  const outstanding = (sponsor.contract_value || 0) - (sponsor.amount_paid || 0);
  const paidPercentage = sponsor.contract_value ? Math.round((sponsor.amount_paid / sponsor.contract_value) * 100) : 0;
  const completedDeliverables = sponsor.deliverables?.filter(d => d.status === 'completed').length || 0;
  const totalDeliverables = sponsor.deliverables?.length || 0;

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
                  Back to Sponsors
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{sponsor.company_name}</H2>
                    <Badge variant={statusColors[sponsor.status] || 'ghost'}>
                      {sponsor.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {sponsor.tier?.name || 'No tier'} Sponsor
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                >
                  <DollarSign className="size-4" />
                  Record Payment
                </Button>
                <Button
                  onClick={() => router.push(`/sponsors/${sponsorId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={4}>
              <StatCard
                label="Contract Value"
                value={`$${sponsor.contract_value?.toLocaleString() || 0}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Amount Paid"
                value={`$${sponsor.amount_paid?.toLocaleString() || 0}`}
                icon={<DollarSign className="size-5" />}
                trend="up"
                trendValue={`${paidPercentage}%`}
              />
              <StatCard
                label="Outstanding"
                value={`$${outstanding.toLocaleString()}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Deliverables"
                value={`${completedDeliverables}/${totalDeliverables}`}
                icon={<CheckCircle className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6}>
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Deliverables */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-center justify-between">
                        <H3>Deliverables</H3>
                        <Button
                          onClick={() => setDeliverableModalOpen(true)}
                          className="flex items-center gap-2 border-2 border-primary bg-primary px-4 py-2 text-white"
                        >
                          <Plus className="size-4" />
                          Add Deliverable
                        </Button>
                      </Stack>

                      {sponsor.deliverables && sponsor.deliverables.length > 0 ? (
                        <Stack gap={3}>
                          {sponsor.deliverables.map(deliverable => (
                            <Card
                              key={deliverable.id}
                              className={`border-2 p-4 ${deliverable.status === 'completed' ? 'border-success/30 bg-success/5' : 'border-grey-200'}`}
                            >
                              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                                <Stack gap={1}>
                                  <Body className="font-weight-semibold">{deliverable.title}</Body>
                                  {deliverable.description && (
                                    <Body size="sm" className=" text-grey-500">{deliverable.description}</Body>
                                  )}
                                  {deliverable.due_date && (
                                    <Body size="sm" className=" text-grey-400">
                                      Due: {new Date(deliverable.due_date).toLocaleDateString()}
                                    </Body>
                                  )}
                                </Stack>
                                <Stack direction="horizontal" gap={2} className="items-center">
                                  <Badge variant={deliverable.status === 'completed' ? 'success' : 'ghost'}>
                                    {deliverable.status.toUpperCase()}
                                  </Badge>
                                  {deliverable.status !== 'completed' && (
                                    <Button
                                      onClick={() => {
                                        setDeliverableToComplete(deliverable.id);
                                        setCompleteDialogOpen(true);
                                      }}
                                      className="border-2 border-success bg-white px-3 py-1 text-success"
                                    >
                                      <CheckCircle className="size-4" />
                                    </Button>
                                  )}
                                </Stack>
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      ) : (
                        <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                          <Body className="text-grey-500">No deliverables defined yet.</Body>
                        </Box>
                      )}
                    </Stack>
                  </Card>

                  {/* Payment History */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Payment Progress</H3>
                      <Box className="h-4 overflow-hidden rounded-card bg-grey-200">
                        <Box 
                          className="h-full bg-success" 
                          style={{ width: `${paidPercentage}%` }} 
                        />
                      </Box>
                      <Stack direction="horizontal" gap={4} className="items-center justify-between">
                        <Body size="sm" className=" text-grey-500">
                          ${sponsor.amount_paid?.toLocaleString() || 0} of ${sponsor.contract_value?.toLocaleString() || 0}
                        </Body>
                        <Badge variant={paymentColors[sponsor.payment_status] || 'ghost'}>
                          {sponsor.payment_status.toUpperCase()}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Contact Info */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Contact Information</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Contact Name</Body>
                        <Body>{sponsor.contact_name || 'Not provided'}</Body>
                      </Stack>
                      {sponsor.contact_email && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Email</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Mail className="size-4 text-grey-400" />
                            <Body>{sponsor.contact_email}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {sponsor.contact_phone && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Phone</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Phone className="size-4 text-grey-400" />
                            <Body>{sponsor.contact_phone}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {sponsor.website_url && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Website</Body>
                          <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary">
                            <ExternalLink className="size-4" />
                            <Body>Visit Website</Body>
                          </a>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Sponsor Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Sponsor Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Tier</Body>
                        <Body>{sponsor.tier?.name || 'No tier assigned'}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Status</Body>
                        <Badge variant={statusColors[sponsor.status] || 'ghost'}>
                          {sponsor.status.toUpperCase()}
                        </Badge>
                      </Stack>
                      {sponsor.contract_signed_at && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Contract Signed</Body>
                          <Body>{new Date(sponsor.contract_signed_at).toLocaleDateString()}</Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Notes */}
                {sponsor.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Notes</H3>
                      <Body className="text-grey-600">{sponsor.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Record Payment Modal */}
      <RecordFormModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        mode="create"
        title="Record Payment"
        fields={paymentFormFields}
        onSubmit={handleRecordPayment}
        size="sm"
        record={{ amount: outstanding > 0 ? outstanding : 0 }}
      />

      {/* Add Deliverable Modal */}
      <RecordFormModal
        open={deliverableModalOpen}
        onClose={() => setDeliverableModalOpen(false)}
        mode="create"
        title="Add Deliverable"
        fields={deliverableFormFields}
        onSubmit={handleCreateDeliverable}
        size="md"
      />

      {/* Complete Deliverable Confirmation */}
      <ConfirmDialog
        open={completeDialogOpen}
        title="Complete Deliverable"
        message="Mark this deliverable as completed?"
        variant="default"
        confirmLabel="Complete"
        onConfirm={handleCompleteDeliverable}
        onCancel={() => { setCompleteDialogOpen(false); setDeliverableToComplete(null); }}
      />
    </AtlvsAppLayout>
  );
}
