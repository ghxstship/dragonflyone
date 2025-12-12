'use client';

import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  Container,
  EnterprisePageHeader,
  MainContent,
  Card,
  CardBody,
  Stack,
  StatCard,
  Grid,
  Body,
  Box,
  H3,
  Badge,
} from '@ghxstship/ui';
import { Layout, Wrench, FileText, Settings, Monitor, Speaker, Lightbulb } from 'lucide-react';

const DEMO_STAGES = [
  { id: '1', name: 'Main Stage', type: 'Outdoor', dimensions: '60ft x 40ft', capacity: 5000, status: 'Active' },
  { id: '2', name: 'Side Stage A', type: 'Outdoor', dimensions: '30ft x 20ft', capacity: 1500, status: 'Active' },
  { id: '3', name: 'Side Stage B', type: 'Outdoor', dimensions: '30ft x 20ft', capacity: 1500, status: 'Setup' },
  { id: '4', name: 'VIP Lounge Stage', type: 'Indoor', dimensions: '20ft x 15ft', capacity: 300, status: 'Active' },
];

/**
 * Stage Management Page
 * Manages stage configurations, layouts, and technical requirements
 */
export default function StageManagementPage() {
  const router = useRouter();

  const stats = {
    stages: DEMO_STAGES.length,
    activeStages: DEMO_STAGES.filter(s => s.status === 'Active').length,
    equipment: 93,
    techSpecs: 12,
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Stage Management"
        subtitle="Manage stage configurations, layouts, and technical requirements for productions."
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Total Stages" value={stats.stages.toString()} icon={<Layout size={20} />} />
              <StatCard label="Active Stages" value={stats.activeStages.toString()} icon={<Monitor size={20} />} trend="up" />
              <StatCard label="Equipment Items" value={stats.equipment.toString()} icon={<Wrench size={20} />} />
              <StatCard label="Tech Specs" value={stats.techSpecs.toString()} icon={<FileText size={20} />} />
            </div>

            <Grid cols={4} gap={4}>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push('/stage-management/stages')}>
                <CardBody>
                  <Stack gap={3} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded bg-ink-100">
                      <Layout size={24} className="text-primary" />
                    </Box>
                    <Body className="font-weight-bold">Stage Layouts</Body>
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push('/stage-management/equipment')}>
                <CardBody>
                  <Stack gap={3} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded bg-ink-100">
                      <Wrench size={24} className="text-secondary" />
                    </Box>
                    <Body className="font-weight-bold">Equipment</Body>
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push('/stage-management/tech-specs')}>
                <CardBody>
                  <Stack gap={3} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded bg-ink-100">
                      <FileText size={24} className="text-warning" />
                    </Box>
                    <Body className="font-weight-bold">Tech Specs</Body>
                  </Stack>
                </CardBody>
              </Card>
              <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push('/stage-management/settings')}>
                <CardBody>
                  <Stack gap={3} className="items-center text-center">
                    <Box className="flex size-12 items-center justify-center rounded bg-ink-100">
                      <Settings size={24} className="text-accent" />
                    </Box>
                    <Body className="font-weight-bold">Settings</Body>
                  </Stack>
                </CardBody>
              </Card>
            </Grid>

            <Card variant="elevated">
              <CardBody>
                <Stack gap={4}>
                  <H3>Stage Overview</H3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {DEMO_STAGES.map((stage) => (
                      <Card key={stage.id} variant="outlined">
                        <CardBody>
                          <Stack gap={2}>
                            <div className="flex items-center justify-between">
                              <Body className="font-weight-bold">{stage.name}</Body>
                              <Badge variant={stage.status === 'Active' ? 'success' : 'warning'}>{stage.status}</Badge>
                            </div>
                            <div className="flex gap-4 text-muted">
                              <span className="flex items-center gap-1">
                                <Layout size={14} /> {stage.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Speaker size={14} /> {stage.dimensions}
                              </span>
                              <span className="flex items-center gap-1">
                                <Lightbulb size={14} /> {stage.capacity.toLocaleString()} cap
                              </span>
                            </div>
                          </Stack>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}