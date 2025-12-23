'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil, FileText, Calendar, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react';
// Layout provided by route group
import { usePermit } from '../../../../hooks/useCompliance';
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

export default function PermitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const permitId = params.id as string;
  
  const { data: permit, isLoading } = usePermit(permitId);

  const statusColors: Record<string, 'solid' | 'outline' | 'ghost'> = {
    approved: 'solid',
    submitted: 'outline',
    pending: 'outline',
    denied: 'ghost',
    expired: 'ghost',
  };

  const permitTypeLabels: Record<string, string> = {
    event: 'Event Permit',
    noise: 'Noise Permit',
    fire: 'Fire Permit',
    health: 'Health Permit',
    alcohol: 'Alcohol License',
    street_closure: 'Street Closure',
    building: 'Building Permit',
    other: 'Other',
  };

  const isExpired = permit?.expiration_date ? new Date(permit.expiration_date) < new Date() : false;
  const isExpiringSoon = permit?.expiration_date 
    ? new Date(permit.expiration_date) > new Date() && 
      new Date(permit.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;

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

  if (!permit) {
    return (
      <>
        <Section className="min-h-screen bg-grey-100 py-8">
          <Container>
            <Body>Permit not found</Body>
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
                  Back to Permits
                </Button>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <H2>{permit.name}</H2>
                    <Badge variant={statusColors[permit.status] || 'ghost'}>
                      {permit.status.toUpperCase()}
                    </Badge>
                    {isExpired && <Badge variant="error">EXPIRED</Badge>}
                    {isExpiringSoon && <Badge variant="warning">EXPIRING SOON</Badge>}
                  </Stack>
                  <Body className="text-grey-600">
                    {permitTypeLabels[permit.permit_type] || permit.permit_type} | {permit.issuing_authority}
                  </Body>
                </Stack>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {permit.document_url && (
                  <Button
                    onClick={() => window.open(permit.document_url, '_blank')}
                    className="flex items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                  >
                    <FileText className="size-4" />
                    View Document
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/permits/${permitId}/edit`)}
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
                      {isExpired ? 'Permit Expired' : 'Permit Expiring Soon'}
                    </Body>
                    <Body size="sm" className={isExpired ? 'text-error' : 'text-warning'}>
                      {isExpired 
                        ? `Expired on ${new Date(permit.expiration_date!).toLocaleDateString()}`
                        : `Expires on ${new Date(permit.expiration_date!).toLocaleDateString()}`
                      }
                    </Body>
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Stats */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Permit Number"
                value={permit.permit_number || '—'}
                icon={<FileText className="size-5" />}
              />
              <StatCard
                label="Cost"
                value={permit.cost ? `$${permit.cost.toLocaleString()}` : '—'}
                icon={<DollarSign className="size-5" />}
              />
              <StatCard
                label="Status"
                value={permit.status.toUpperCase()}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Expiration"
                value={permit.expiration_date ? new Date(permit.expiration_date).toLocaleDateString() : '—'}
                icon={<Calendar className="size-5" />}
              />
            </Grid>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              {/* Main Content */}
              <Box className="col-span-2">
                <Stack gap={4}>
                  {/* Permit Details */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Permit Details</H3>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Permit Type</Body>
                          <Body>{permitTypeLabels[permit.permit_type] || permit.permit_type}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Issuing Authority</Body>
                          <Body>{permit.issuing_authority}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Permit Number</Body>
                          <Body>{permit.permit_number || 'Not assigned'}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Cost</Body>
                          <Body>{permit.cost ? `$${permit.cost.toLocaleString()}` : 'Not specified'}</Body>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Timeline */}
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={4}>
                      <H3>Timeline</H3>
                      <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Application Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="size-4 text-grey-400" />
                            <Body>{permit.application_date ? new Date(permit.application_date).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Approval Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <CheckCircle className="size-4 text-grey-400" />
                            <Body>{permit.approval_date ? new Date(permit.approval_date).toLocaleDateString() : 'Not set'}</Body>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className=" text-grey-500">Expiration Date</Body>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <AlertTriangle className={`size-4 ${isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : 'text-grey-400'}`} />
                            <Body className={isExpired ? 'text-error' : isExpiringSoon ? 'text-warning' : ''}>
                              {permit.expiration_date ? new Date(permit.expiration_date).toLocaleDateString() : 'Not set'}
                            </Body>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  {/* Description */}
                  {permit.description && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={3}>
                        <H3>Description</H3>
                        <Body className="text-grey-700">{permit.description}</Body>
                      </Stack>
                    </Card>
                  )}

                  {/* Requirements */}
                  {permit.requirements && permit.requirements.length > 0 && (
                    <Card className="border-2 border-grey-200 p-6">
                      <Stack gap={4}>
                        <H3>Requirements</H3>
                        <Stack gap={2}>
                          {permit.requirements.map((req, index) => (
                            <Stack key={index} direction="horizontal" gap={2} className="items-center">
                              <CheckCircle className="size-4 text-grey-400" />
                              <Body>{req}</Body>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Box>

              {/* Sidebar */}
              <Stack gap={4}>
                {/* Status */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Status</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-grey-500">Current Status</Body>
                        <Badge variant={statusColors[permit.status] || 'ghost'}>
                          {permit.status.toUpperCase()}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                {/* Document */}
                <Card className="border-2 border-grey-200 p-6">
                  <Stack gap={4}>
                    <H3>Document</H3>
                    {permit.document_url ? (
                      <Button
                        onClick={() => window.open(permit.document_url, '_blank')}
                        className="flex w-full items-center justify-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
                      >
                        <FileText className="size-4" />
                        View Document
                      </Button>
                    ) : (
                      <Box className="rounded-card border-2 border-dashed border-grey-300 p-4 text-center">
                        <Body className="text-grey-500">No document attached.</Body>
                      </Box>
                    )}
                  </Stack>
                </Card>

                {/* Notes */}
                {permit.notes && (
                  <Card className="border-2 border-grey-200 p-6">
                    <Stack gap={2}>
                      <H3>Notes</H3>
                      <Body className="text-grey-600">{permit.notes}</Body>
                    </Stack>
                  </Card>
                )}
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </>
  );
}
