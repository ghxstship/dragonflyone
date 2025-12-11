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
  ProgressBar,
} from '@ghxstship/ui';
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Download,
  FileText,
  BarChart3,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { DEMO_SPONSORSHIPS, type DemoSponsorship } from '../../../lib/demo-data';

export default function SponsorPortalPage() {
  const [sponsorships] = useState<DemoSponsorship[]>(DEMO_SPONSORSHIPS);

  const totalInvestment = sponsorships.reduce((sum, s) => sum + s.value, 0);
  const totalImpressions = sponsorships.reduce((sum, s) => sum + s.impressions, 0);
  const avgEngagement = sponsorships.filter(s => s.engagement > 0).reduce((sum, s, _, arr) => sum + s.engagement / arr.length, 0);

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Sponsor Portal" title="My Dashboard" description="Track sponsorship performance and ROI" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Investment" value={`$${(totalInvestment / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Impressions" value={`${(totalImpressions / 1000000).toFixed(1)}M`} icon={<Eye size={20} />} inverted />
          <StatCard label="Avg Engagement" value={`${avgEngagement.toFixed(1)}%`} icon={<TrendingUp size={20} />} inverted />
          <StatCard label="Active Deals" value={sponsorships.filter(s => s.status === 'active').length.toString()} icon={<Users size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6}>
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Sponsorships</H3>
                <Stack gap={3}>
                  {sponsorships.map(sponsorship => (
                    <Stack key={sponsorship.id} className="rounded border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{sponsorship.production}</Body>
                          <Badge variant={sponsorship.tier === 'Platinum' ? 'error' : sponsorship.tier === 'Gold' ? 'warning' : 'info'}>
                            {sponsorship.tier} Sponsor
                          </Badge>
                        </Stack>
                        <Badge variant={sponsorship.status === 'active' ? 'success' : sponsorship.status === 'pending' ? 'warning' : 'info'}>
                          {sponsorship.status}
                        </Badge>
                      </Stack>
                      <Stack direction="horizontal" className="mt-3 justify-between border-t border-ink-700 pt-3">
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Investment</Body>
                          <Body className="font-weight-semibold text-white">${sponsorship.value.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Impressions</Body>
                          <Body className="text-white">{sponsorship.impressions > 0 ? `${(sponsorship.impressions / 1000000).toFixed(1)}M` : '-'}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body className="text-body-sm text-on-dark-muted">Engagement</Body>
                          <Body className="text-white">{sponsorship.engagement > 0 ? `${sponsorship.engagement}%` : '-'}</Body>
                        </Stack>
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
                  <H3 className="text-white">Deliverables Status</H3>
                  <Stack gap={3}>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-white">Logo Placement</Body>
                        <Body className="text-success">Complete</Body>
                      </Stack>
                      <ProgressBar value={100} />
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-white">Social Media Posts</Body>
                        <Body className="text-white">8/12</Body>
                      </Stack>
                      <ProgressBar value={67} />
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-white">VIP Experiences</Body>
                        <Body className="text-white">2/4</Body>
                      </Stack>
                      <ProgressBar value={50} />
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>

            <Card variant="elevated" inverted>
              <CardBody>
                <Stack gap={4}>
                  <H3 className="text-white">Reports</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <BarChart3 size={16} />
                        <Body className="text-white">ROI Analysis</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Brand Exposure Report</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <FileText size={16} />
                        <Body className="text-white">Social Media Analytics</Body>
                      </Stack>
                      <Button variant="ghost" size="sm"><Download size={14} /></Button>
                    </Stack>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
