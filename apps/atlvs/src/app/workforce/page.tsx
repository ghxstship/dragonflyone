'use client';

import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  Display,
  H1,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  LoadingSpinner,
  Stack,
} from '@ghxstship/ui';
import { useEmployees } from '@/hooks/useEmployees';

export default function WorkforcePage() {
  const router = useRouter();
  const { data: employees, isLoading } = useEmployees();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-ink-50">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading workforce data..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-ink-950 text-ink-50">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b border-ink-800 pb-8">
            <Stack gap={2}>
              <H1>Workforce Management</H1>
              <Body className="text-ink-400">Manage employees, schedules, and team assignments</Body>
            </Stack>
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={() => router.push('/employees/new')}>Add Employee</Button>
              <Button variant="outline" onClick={() => router.push('/schedule')}>View Calendar</Button>
            </Stack>
          </Stack>

          <Grid cols={4} gap={6}>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <H2 className="text-white">{employees?.filter((e: any) => e.status === 'active').length || 0}</H2>
              <Body className="text-ink-400">Active</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <H2 className="text-white">{employees?.length || 0}</H2>
              <Body className="text-ink-400">Total Employees</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <H2 className="text-white">{employees?.filter((e: any) => e.department === 'Operations').length || 0}</H2>
              <Body className="text-ink-400">Operations</Body>
            </Card>
            <Card className="p-6 text-center border-2 border-ink-800 bg-transparent">
              <H2 className="text-white">{employees?.filter((e: any) => e.status === 'onleave').length || 0}</H2>
              <Body className="text-ink-400">On Leave</Body>
            </Card>
          </Grid>

          <Stack gap={4}>
            {employees?.map((employee: any) => (
              <Card key={employee.id} className="p-6 border-2 border-ink-800 bg-transparent hover:border-ink-600 transition-colors">
                <Grid cols={4} gap={4}>
                  <Stack gap={1}>
                    <H2 className="text-white">{employee.name}</H2>
                    <Body size="sm" className="text-ink-400">{employee.role || 'N/A'}</Body>
                    <Body size="sm" className="text-ink-400">{employee.department || 'N/A'}</Body>
                  </Stack>
                  <Stack>
                    <Badge variant="solid">{employee.status?.toUpperCase() || 'ACTIVE'}</Badge>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="sm" className="text-ink-300">Email: {employee.email || 'N/A'}</Body>
                    <Body size="sm" className="text-ink-300">Phone: {employee.phone || 'N/A'}</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/employees/${employee.id}`)}>Profile</Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/employees/${employee.id}/assign`)}>Assign</Button>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
