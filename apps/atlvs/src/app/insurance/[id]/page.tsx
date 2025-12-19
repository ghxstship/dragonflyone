'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, FileText, Calendar, DollarSign, Shield, Phone, Mail, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useInsurancePolicy } from '../../../hooks/useCompliance';
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

export default function InsurancePolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;
  
  const { data: policy, isLoading } = useInsurancePolicy(policyId);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'solid'> = {
    active: 'success',
    pending: 'warning',
    expired: 'error',
    cancelled: 'error',
  };

  const policyTypeLabels: Record<string, string> = {
    general_liability: 'General Liability',
    workers_comp: 'Workers Compensation',
    equipment: 'Equipment',
    event_cancellation: 'Event Cancellation',
    auto: 'Auto',
    umbrella: 'Umbrella',
    other: 'Other',
  };

  const isExpired = policy?.expiration_date ? new Date(policy.expiration_date) < new Date() : false;
  const isExpiringSoon = policy?.expiration_date 
    ? new Date(policy.expiration_date) > new Date() && 
      new Date(policy.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

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

  if (!policy) {
    return (
      <AtlvsAppLayout>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Policy not found</Body>
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
                  Back to Insurance
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{policy.policy_name}</H2>
                    <Badge variant={statusColors[policy.status] || 'solid'}>
                      {policy.status.toUpperCase()}
                    </Badge>
                    {isExpired && <Badge variant="error">EXPIRED</Badge>}
                    {isExpiringSoon && <Badge variant="warning">EXPIRING SOON</Badge>}
                  </Stack>
                  <Body className="text-grey-600">
                    {policyTypeLabels[policy.policy_type] || policy.policy_type} | {policy.provider}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {policy.document_url && (
                  <Button
                    onClick={() => window.open(policy.document_url, '_blank')}
                    className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                  >
                    <FileText className="size-4" />
                    View Document
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/insurance/${policyId}/edit`)}
                  className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </Stack>
            </Stack>

            {/* Alert for expiring/expired */}
            {(isExpired || isExpiringSoon) && (
              <Card className={`border-2 p-4 ${isExpired ? 'border-error bg-error/10' : 'border-warning bg-warning/10'}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <AlertTriangle className={`size-6 ${isExpired ? 'text-error' : 'text-warning'}`} />
                  <Stack gap={0}>
                    <Body className={`font-weight-semibold ${isExpired ? 'text-error' : 'text-warning'}`}>
                      {isExpired ? 'Policy Expired' : 'Policy Expiring Soon'}
                    </Body>
                    <Body size="sm" className={isExpired ? 'text-error' : 'text-warning'}>
                      {isExpired 
                        ? `Expired on ${new Date(policy.expiration_date).toLocaleDateString()}`
                        : `Expires on ${new Date(policy.expiration_date).toLocaleDateString()}`
                      }
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Stats */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Coverage Amount"
                value={`$${(policy.coverage_amount / 1000000).toFixed(1)}M`}
                icon={<Shield className="size-5" />}
              />
              <StatCard
                label="Premium"
                value={policy.premium ? `$${policy.premium.toLocaleString()}` : '—'}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Deductible"
                value={policy.deductible ? `$${policy.deductible.toLocaleString()}` : '—'}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Expiration"
                value={new Date(policy.expiration_date).toLocaleDateString()}
                icon={<Calendar className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Policy Details */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Policy Details</H3>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Policy Type</Body>
                          <Body>{policyTypeLabels[policy.policy_type] || policy.policy_type}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Provider</Body>
                          <Body>{policy.provider}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Policy Number</Body>
                          <Body>{policy.policy_number}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Status</Body>
                          <Badge variant={statusColors[policy.status] || 'solid'}>
                            {policy.status.toUpperCase()}
                          </Badge>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Coverage */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Coverage Details</H3>
                      <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Coverage Amount</Body>
                          <Body className="font-weight-semibold">${policy.coverage_amount?.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Deductible</Body>
                          <Body className="font-weight-semibold">{policy.deductible ? `$${policy.deductible.toLocaleString()}` : 'Not specified'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Premium</Body>
                          <Body className="font-weight-semibold">{policy.premium ? `$${policy.premium.toLocaleString()}` : 'Not specified'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Dates */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Policy Period</H3>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Effective Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{new Date(policy.effective_date).toLocaleDateString()}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Expiration Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className={`size-4 ${isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : 'text-grey-400'}`} />
                            <Body className={isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : ''}>
                              {new Date(policy.expiration_date).toLocaleDateString()}
                            </Body>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Contact */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Agent Contact</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Contact Name</Body>
                        <Body>{policy.contact_name || 'Not provided'}</Body>
                      </Stack>
                      {policy.contact_email && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Email</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Mail className="size-4 text-grey-400" />
                            <Body>{policy.contact_email}</Body>
                          </Stack>
                        </Stack>
                      )}
                      {policy.contact_phone && (
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Phone</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Phone className="size-4 text-grey-400" />
                            <Body>{policy.contact_phone}</Body>
                          </Stack>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>

                {/* Document */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Document</H3>
                    {policy.document_url ? (
                      <Button
                        onClick={() => window.open(policy.document_url, '_blank')}
                        className="flex w-full items-center justify-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                      >
                        <FileText className="size-4" />
                        View Policy Document
                      </Button>
                    ) : (
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-4 text-center">
                        <Body className="text-grey-500">No document attached.</Body>
                      </Box>
                    )}
                  </Stack>
                </Card>

                {/* Notes */}
                {policy.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Notes</H3>
                      <Body className="text-grey-600">{policy.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </AtlvsAppLayout>
  );
}
