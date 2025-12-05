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

export default function ProductionWrapPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const [isGenerating, setIsGenerating] = useState(false);
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const wrapMetrics = {
    totalShows: 24,
    totalAttendance: 12450,
    totalRevenue: 485000,
    totalExpenses: 312000,
    netProfit: 173000,
    profitMargin: 35.7,
    avgAttendance: 519,
    capacityUtilization: 87,
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await fetch(`/api/productions/${productionId}/wrap-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonsLearned, recommendations }),
      });
    } catch (_error) {
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker="Production"
        title="Wrap Report"
        description="Generate the final production wrap report with key metrics and insights"
        colorScheme="on-dark"
      />

      <Grid cols={4} gap={4}>
        <StatCard
          label="Total Shows"
          value={wrapMetrics.totalShows.toString()}
          icon={<FileText size={20} />}
          inverted
        />
        <StatCard
          label="Total Attendance"
          value={wrapMetrics.totalAttendance.toLocaleString()}
          icon={<Users size={20} />}
          inverted
        />
        <StatCard
          label="Total Revenue"
          value={`$${(wrapMetrics.totalRevenue / 1000).toFixed(0)}K`}
          icon={<DollarSign size={20} />}
          trend="up"
          inverted
        />
        <StatCard
          label="Net Profit"
          value={`$${(wrapMetrics.netProfit / 1000).toFixed(0)}K`}
          icon={<TrendingUp size={20} />}
          trend="up"
          inverted
        />
      </Grid>

      <Grid cols={2} gap={6}>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Financial Summary</H3>
              <Stack gap={3}>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Gross Revenue</Body>
                  <Body className="font-weight-semibold text-white">${wrapMetrics.totalRevenue.toLocaleString()}</Body>
                </Stack>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Total Expenses</Body>
                  <Body className="font-weight-semibold text-white">${wrapMetrics.totalExpenses.toLocaleString()}</Body>
                </Stack>
                <Stack direction="horizontal" className="justify-between border-t border-ink-700 pt-3">
                  <Body className="text-on-dark-muted">Net Profit</Body>
                  <Body className="font-weight-bold text-success">${wrapMetrics.netProfit.toLocaleString()}</Body>
                </Stack>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Profit Margin</Body>
                  <Badge variant="success">{wrapMetrics.profitMargin}%</Badge>
                </Stack>
              </Stack>
            </Stack>
          </CardBody>
        </Card>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <H3 className="text-white">Operational Metrics</H3>
              <Stack gap={3}>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Total Shows</Body>
                  <Body className="font-weight-semibold text-white">{wrapMetrics.totalShows}</Body>
                </Stack>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Avg Attendance</Body>
                  <Body className="font-weight-semibold text-white">{wrapMetrics.avgAttendance}</Body>
                </Stack>
                <Stack direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Capacity Utilization</Body>
                  <Badge variant={wrapMetrics.capacityUtilization >= 80 ? 'success' : 'warning'}>
                    {wrapMetrics.capacityUtilization}%
                  </Badge>
                </Stack>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Lessons Learned</H3>
            <Textarea
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="Document key learnings from this production..."
              rows={4}
            />
          </Stack>
        </CardBody>
      </Card>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Recommendations</H3>
            <Textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Recommendations for future productions..."
              rows={4}
            />
          </Stack>
        </CardBody>
      </Card>

      <Stack direction="horizontal" gap={4} className="justify-end">
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export PDF
        </Button>
        <Button
          variant="solid"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            'Generating...'
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </Stack>
    </Stack>
  );
}
