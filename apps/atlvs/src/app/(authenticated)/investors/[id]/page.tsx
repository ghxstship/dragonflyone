'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, DollarSign, FileText, CheckCircle, Mail, Phone } from 'lucide-react';
// Layout provided by route group
import { useInvestor, useRecordFunding } from '../../../../hooks/useInvestors';
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

export default function InvestorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const investorId = params.id as string;
  
  const { data: investor, isLoading, refetch } = useInvestor(investorId);
  const recordFundingMutation = useRecordFunding();
  
  const [fundingDialogOpen, setFundingDialogOpen] = useState(false);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    funded: 'success',
    committed: 'warning',
    prospect: 'info',
    exited: 'default',
  };

  const typeLabels: Record<string, string> = {
    individual: 'Individual',
    entity: 'Entity',
    fund: 'Fund',
  };

  const handleRecordFunding = async () => {
    await recordFundingMutation.mutateAsync({
      id: investorId,
      amount: investor?.investment_amount || 0,
    });
    setFundingDialogOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Loading...</Body>
          </Container>
        </Section>
      </>
    );
  }

  if (!investor) {
    return (
      <>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Investor not found</Body>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
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
                  Back to Investors
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{investor.name}</H2>
                    <Badge variant={statusColors[investor.status] || 'ghost'}>
                      {investor.status.toUpperCase()}
                    </Badge>
                  </Stack>
                  <Body className="text-grey-600">
                    {typeLabels[investor.investor_type] || investor.investor_type} | {investor.round?.name || 'No round'}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {investor.status === 'committed' && (
                  <Button
                    onClick={() => setFundingDialogOpen(true)}
                    className="flex items-center gap-2 border-2 border-success bg-success px-4 py-2 text-white"
                  >
                    <DollarSign className="size-4" />
                    Record Funding
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/investors/${investorId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            {/* Stats */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Investment Amount"
                value={`$${investor.investment_amount?.toLocaleString() || 0}`}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Ownership"
                value={investor.ownership_percentage ? `${investor.ownership_percentage}%` : '—'}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Status"
                value={investor.status.toUpperCase()}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Round"
                value={investor.round?.name || 'None'}
                icon={<FileText className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Investment Details */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Investment Details</H3>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Investment Amount</Body>
                          <Body className="font-weight-semibold">${investor.investment_amount?.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Ownership Percentage</Body>
                          <Body className="font-weight-semibold">{investor.ownership_percentage ? `${investor.ownership_percentage}%` : 'Not specified'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Investment Round</Body>
                          <Body className="font-weight-semibold">{investor.round?.name || 'No round assigned'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Round Type</Body>
                          <Body className="font-weight-semibold">{investor.round?.round_type?.replace('_', ' ').toUpperCase() || '—'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Timeline */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Investment Timeline</H3>
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Box className={`flex size-10 items-center justify-center rounded-avatar ${investor.commitment_date ? 'bg-success' : 'bg-grey-200'}`}>
                            <CheckCircle className={`size-5 ${investor.commitment_date ? 'text-white' : 'text-grey-400'}`} />
                          </Box>
                          <Stack gap={0}>
                            <Body className="font-weight-semibold">Commitment</Body>
                            <Body size="sm" className=" text-grey-500">
                              {investor.commitment_date ? new Date(investor.commitment_date).toLocaleDateString() : 'Not yet committed'}
                            </Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Box className={`flex size-10 items-center justify-center rounded-avatar ${investor.funding_date ? 'bg-success' : 'bg-grey-200'}`}>
                            <DollarSign className={`size-5 ${investor.funding_date ? 'text-white' : 'text-grey-400'}`} />
                          </Box>
                          <Stack gap={0}>
                            <Body className="font-weight-semibold">Funding Received</Body>
                            <Body size="sm" className=" text-grey-500">
                              {investor.funding_date ? new Date(investor.funding_date).toLocaleDateString() : 'Not yet funded'}
                            </Body>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Documents */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-center justify-between">
                        <H3>Documents</H3>
                        <Button
                          onClick={() => router.push(`/investors/documents?investor=${investorId}`)}
                          className="border-2 border-grey-300 bg-white px-4 py-2"
                        >
                          View All
                        </Button>
                      </Stack>
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-8 text-center">
                        <Body className="text-grey-500">No documents uploaded yet.</Body>
                      </Box>
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
                        <Body>{investor.contact_name || 'Not provided'}</Body>
                      </Stack>
                      {investor.contact_email && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Email</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Mail className="size-4 text-grey-400" />
                            <Body>{investor.contact_email}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {investor.contact_phone && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Phone</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Phone className="size-4 text-grey-400" />
                            <Body>{investor.contact_phone}</Body>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Investor Details */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Investor Details</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Type</Body>
                        <Body>{typeLabels[investor.investor_type] || investor.investor_type}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Status</Body>
                        <Badge variant={statusColors[investor.status] || 'ghost'}>
                          {investor.status.toUpperCase()}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Notes */}
                {investor.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Notes</H3>
                      <Body className="text-grey-600">{investor.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Record Funding Confirmation */}
      <ConfirmDialog
        open={fundingDialogOpen}
        title="Record Funding"
        message={`Confirm that ${investor.name} has funded their investment of $${investor.investment_amount?.toLocaleString()}?`}
        variant="default"
        confirmLabel="Confirm Funding"
        onConfirm={handleRecordFunding}
        onCancel={() => setFundingDialogOpen(false)}
      />
    </>
  );
}
