'use client';

import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Spinner,
  Stack,
} from '@ghxstship/ui';
import { useEmployees } from '@/hooks/useEmployees';

export default function WorkforcePage() {
  const router = useRouter();
  const { data: employees, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" />
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Stack className="border-b-2 border-black py-8 mb-8">
          <Display>WORKFORCE</Display>
          <Stack direction="horizontal" gap={4} className="mt-4">
            <Button variant="solid" onClick={() => router.push('/employees/new')}>Add Employee</Button>
            <Button variant="outline" onClick={() => router.push('/schedule')}>View Calendar</Button>
          </Stack>
        </Stack>

        <Grid cols={4} className="mb-8">
          <Card className="p-6 text-center">
            <H2>{employees?.filter((e: any) => e.status === 'active').length || 0}</H2>
            <Body>Active</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{employees?.length || 0}</H2>
            <Body>Total Employees</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{employees?.filter((e: any) => e.department === 'Operations').length || 0}</H2>
            <Body>Operations</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{employees?.filter((e: any) => e.status === 'onleave').length || 0}</H2>
            <Body>On Leave</Body>
          </Card>
        </Grid>

        <Stack gap={4}>
          {employees?.map((employee: any) => (
            <Card key={employee.id} className="p-6">
              <Grid cols={4} gap={4}>
                <Stack gap={1}>
                  <H2>{employee.name}</H2>
                  <Body size="sm">{employee.role || 'N/A'}</Body>
                  <Body size="sm">{employee.department || 'N/A'}</Body>
                </Stack>
                <Stack>
                  <Badge>{employee.status?.toUpperCase() || 'ACTIVE'}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm">Email: {employee.email || 'N/A'}</Body>
                  <Body size="sm">Phone: {employee.phone || 'N/A'}</Body>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/employees/${employee.id}`)}>Profile</Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/employees/${employee.id}/assign`)}>Assign</Button>
                </Stack>
              </Grid>
            </Card>
          ))}
        </Stack>
      </Container>
    </Section>
  );
}
