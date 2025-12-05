'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
  Textarea,
} from '@ghxstship/ui';
import {
  FileText,
  DollarSign,
  Users,
  TrendingUp,
  Download,
  CheckCircle,
} from 'lucide-react';
import { CompvssAppLayout } from '../../../../components/app-layout';

export default function ProductionWrapReportPage() {
  const params = useParams();
  const _productionId = params?.productionId as string;
  const [isGenerating, setIsGenerating] = useState(false);
  const [crewNotes, setCrewNotes] = useState('');
  const [operationalNotes, setOperationalNotes] = useState('');

  const metrics = {
    totalShows: 24,
    crewHours: 1840,
    incidents: 3,
    laborCost: 92000,
    equipmentCost: 45000,
    cateringCost: 18000,
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <CompvssAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Production" title="Wrap Report" description="Generate the production wrap report" colorScheme="on-dark" />

        <Grid cols={3} gap={4}>
          <StatCard label="Total Shows" value={metrics.totalShows.toString()} icon={<FileText size={20} />} inverted />
          <StatCard label="Crew Hours" value={metrics.crewHours.toLocaleString()} icon={<Users size={20} />} inverted />
          <StatCard label="Incidents" value={metrics.incidents.toString()} icon={<TrendingUp size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Cost Summary</H3>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Labor</Body>
                    <Body className="font-weight-semibold text-white">${metrics.laborCost.toLocaleString()}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Equipment</Body>
                    <Body className="font-weight-semibold text-white">${metrics.equipmentCost.toLocaleString()}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Catering</Body>
                    <Body className="font-weight-semibold text-white">${metrics.cateringCost.toLocaleString()}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between border-t border-ink-700 pt-3">
                    <Body className="text-on-dark-muted">Total</Body>
                    <Body className="font-weight-bold text-white">
                      ${(metrics.laborCost + metrics.equipmentCost + metrics.cateringCost).toLocaleString()}
                    </Body>
                  </Stack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>

          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">Report Status</H3>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Daily Reports</Body>
                    <Badge variant="success">24/24 Complete</Badge>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Incident Reports</Body>
                    <Badge variant="success">3/3 Closed</Badge>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-on-dark-muted">Expense Reports</Body>
                    <Badge variant="warning">Pending Review</Badge>
                  </Stack>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Crew Notes</H3>
              <Textarea value={crewNotes} onChange={(e) => setCrewNotes(e.target.value)} placeholder="Notes from crew leads..." rows={4} />
            </Stack>
          </CardBody>
        </Card>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Operational Notes</H3>
              <Textarea value={operationalNotes} onChange={(e) => setOperationalNotes(e.target.value)} placeholder="Operational observations and recommendations..." rows={4} />
            </Stack>
          </CardBody>
        </Card>

        <Stack direction="horizontal" gap={4} className="justify-end">
          <Button variant="outline"><Download size={16} className="mr-2" />Export PDF</Button>
          <Button variant="solid" onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : <><CheckCircle size={16} className="mr-2" />Generate Report</>}
          </Button>
        </Stack>
      </Stack>
    </CompvssAppLayout>
  );
}
