'use client';

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
  Skeleton,
} from '@ghxstship/ui';
import {
  TrendingUp,
  DollarSign,
  Eye,
  Users,
  Download,
  FileText,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useSponsors, type Sponsor } from '@ghxstship/config';
import { DEMO_SPONSORSHIPS, type DemoSponsorship } from '../../../lib/demo-data';

export default function SponsorPortalPage() {
  const { sponsors: apiSponsors, isLoading, error, refetch } = useSponsors({ status: 'active' });

  // Map API sponsors to display format or fall back to demo data
  const sponsorships: DemoSponsorship[] = apiSponsors.length > 0
    ? apiSponsors.map((s: Sponsor) => ({
        id: s.id,
        event: s.company_name,
        tier: s.sponsor_tiers?.name || 'Standard',
        value: s.contract_value,
        status: (s.status === 'active' ? 'active' : s.status === 'completed' ? 'completed' : 'pending') as 'active' | 'pending' | 'completed',
        deliverables: 0,
        completedDeliverables: 0,
      }))
    : DEMO_SPONSORSHIPS;

  const totalInvestment = sponsorships.reduce((sum, s) => sum + s.value, 0);
  const activeDeals = sponsorships.filter(s => s.status === 'active').length;
  const completionRate = sponsorships.length > 0
    ? sponsorships.reduce((sum, s) => sum + (s.deliverables > 0 ? (s.completedDeliverables / s.deliverables) * 100 : 0), 0) / sponsorships.length
    : 0;

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Dashboard" description="Track sponsorship performance and ROI" colorScheme="on-dark" />
          <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} inverted className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </Card>
            ))}
          </Grid>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  if (error) {
    return (
      <AtlvsAppLayout>
        <Stack gap={8}>
          <SectionHeader kicker="Sponsor Portal" title="My Dashboard" description="Track sponsorship performance and ROI" colorScheme="on-dark" />
          <Card inverted className="p-8 text-center">
            <Stack gap={4} className="items-center">
              <AlertCircle size={48} className="text-error" />
              <H3 className="text-white">Failed to Load Sponsorships</H3>
              <Body className="text-grey-300">{error.message}</Body>
              <Button variant="solid" onClick={() => refetch()}>
                Try Again
              </Button>
            </Stack>
          </Card>
        </Stack>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Sponsor Portal" title="My Dashboard" description="Track sponsorship performance and ROI" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Investment" value={`$${(totalInvestment / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
          <StatCard label="Deliverables" value={sponsorships.reduce((sum, s) => sum + s.deliverables, 0).toString()} icon={<Eye size={20} />} inverted />
          <StatCard label="Completion Rate" value={`${completionRate.toFixed(0)}%`} icon={<TrendingUp size={20} />} inverted />
          <StatCard label="Active Deals" value={activeDeals.toString()} icon={<Users size={20} />} inverted />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <H3 className="text-white">My Sponsorships</H3>
                <Stack gap={3}>
                  {sponsorships.map(sponsorship => (
                    <Stack key={sponsorship.id} className="rounded border-2 border-ink-700 p-4">
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-weight-semibold text-white">{sponsorship.event}</Body>
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
                          <Body size="sm" className=" text-on-dark-muted">Investment</Body>
                          <Body className="font-weight-semibold text-white">${sponsorship.value.toLocaleString()}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Deliverables</Body>
                          <Body className="text-white">{sponsorship.completedDeliverables}/{sponsorship.deliverables}</Body>
                        </Stack>
                        <Stack gap={0}>
                          <Body size="sm" className=" text-on-dark-muted">Progress</Body>
                          <Body className="text-white">{sponsorship.deliverables > 0 ? `${Math.round((sponsorship.completedDeliverables / sponsorship.deliverables) * 100)}%` : '-'}</Body>
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
