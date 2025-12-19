'use client';

import { useState } from 'react';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  H3,
} from '@ghxstship/ui';
import {
  Calendar,
  Clock,
  FileText,
  DollarSign,
  CheckCircle,
  Download,
  Upload,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { DEMO_CREW_ASSIGNMENTS, type DemoCrewAssignment } from '../../../lib/demo-data';

export default function CrewPortalPage() {
  const [assignments] = useState<DemoCrewAssignment[]>(DEMO_CREW_ASSIGNMENTS);

  const upcomingCount = assignments.filter(a => a.status === 'confirmed' || a.status === 'pending').length;
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const totalEarnings = assignments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.rate, 0);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Crew Portal" title="My Dashboard" description="View your assignments, documents, and payments" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Upcoming" value={upcomingCount.toString()} icon={<Calendar size={20} />} inverted />
          <StatCard label="Completed" value={completedCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Hours This Month" value="48" icon={<Clock size={20} />} inverted />
          <StatCard label="Earnings YTD" value={`$${totalEarnings.toLocaleString()}`} icon={<DollarSign size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Assignments</H3>
                <Stack gap={3}>
                  {assignments.map(assignment => (
                    <Stack key={assignment.id} direction="horizontal" className="items-center justify-between rounded border-2 border-ink-700 p-4">
                      <Stack gap={1}>
                        <Body className="font-weight-semibold text-white">{assignment.production}</Body>
                        <Body size="sm" className=" text-on-dark-muted">{assignment.role} - {assignment.dates}</Body>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Body className="text-white">${assignment.rate}/day</Body>
                        <Badge variant={assignment.status === 'confirmed' ? 'success' : assignment.status === 'pending' ? 'warning' : 'info'}>
                          {assignment.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={6}>
            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Documents</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">W-9 Form</Body>
                      </Stack>
                      <Badge variant="success">Submitted</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Emergency Contact</Body>
                      </Stack>
                      <Badge variant="success">Complete</Badge>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Direct Deposit</Body>
                      </Stack>
                      <Badge variant="warning">Pending</Badge>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Upload size={14} className="mr-2" />Upload Document</Button>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Recent Payments</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Concert Series - Week 1</Body>
                      <Body className="font-weight-semibold text-success">$2,000</Body>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-white">Tech Rehearsal</Body>
                      <Body className="font-weight-semibold text-success">$500</Body>
                    </Stack>
                  </Stack>
                  <Button variant="outline" size="sm"><Download size={14} className="mr-2" />Download Pay Stubs</Button>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
