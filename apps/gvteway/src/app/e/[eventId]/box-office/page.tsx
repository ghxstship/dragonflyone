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
} from '@ghxstship/ui';
import {
  Ticket,
  DollarSign,
  Users,
  TrendingUp,
  RefreshCw,
  Clock,
} from 'lucide-react';
// Layout provided by route group
import { useEventBoxOfficeData, type TicketTier } from '@/hooks/useEventOperations';

export default function EventBoxOfficePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { tiers, isLoading, refetch } = useEventBoxOfficeData(eventId);

  const totals = tiers.reduce(
    (acc: { capacity: number; sold: number; available: number; revenue: number }, tier: TicketTier) => ({
      capacity: acc.capacity + tier.capacity,
      sold: acc.sold + tier.sold,
      available: acc.available + tier.available,
      revenue: acc.revenue + tier.revenue,
    }),
    { capacity: 0, sold: 0, available: 0, revenue: 0 }
  );

  const soldPercentage = totals.capacity > 0 ? Math.round((totals.sold / totals.capacity) * 100) : 0;

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  if (isLoading) {
    return (
      <>
        <Stack className="items-center py-12">
          <RefreshCw size={24} className="animate-spin" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader
            kicker="Event"
            title="Box Office"
            description="Real-time ticket sales and revenue tracking"
            colorScheme="on-dark"
          />
          <Stack direction="horizontal" gap={2} className="items-center">
            <Body size="sm" className=" text-on-dark-muted">
              <Clock size={14} className="mr-1 inline" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Body>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw size={16} />
            </Button>
          </Stack>
        </Stack>

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sold"
            value={totals.sold.toLocaleString()}
            icon={<Ticket size={20} />}
            trend="up"
            inverted
          />
          <StatCard
            label="Available"
            value={totals.available.toLocaleString()}
            icon={<Users size={20} />}
            inverted
          />
          <StatCard
            label="Gross Revenue"
            value={`$${totals.revenue.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            trend="up"
            inverted
          />
          <StatCard
            label="Sold %"
            value={`${soldPercentage}%`}
            icon={<TrendingUp size={20} />}
            trend={soldPercentage >= 80 ? 'up' : undefined}
            inverted
          />
        </Grid>

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          {tiers.map((tier: TicketTier) => {
            const tierSoldPct = Math.round((tier.sold / tier.capacity) * 100);
            return (
              <Card key={tier.id} variant="elevated" inverted>
                <CardBody>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <H3 className="text-white">{tier.name}</H3>
                      <Badge variant={tierSoldPct >= 90 ? 'error' : tierSoldPct >= 70 ? 'warning' : 'success'}>
                        {tierSoldPct}% Sold
                      </Badge>
                    </Stack>
                    <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Stack gap={1}>
                        <Body size="sm" className=" text-on-dark-muted">Price</Body>
                        <Body className="font-weight-semibold text-white">${tier.price}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-on-dark-muted">Revenue</Body>
                        <Body className="font-weight-semibold text-white">${tier.revenue.toLocaleString()}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-on-dark-muted">Sold</Body>
                        <Body className="font-weight-semibold text-white">{tier.sold} / {tier.capacity}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className=" text-on-dark-muted">Available</Body>
                        <Body className={`font-weight-semibold ${tier.available <= 10 ? 'text-error' : 'text-white'}`}>
                          {tier.available}
                        </Body>
                      </Stack>
                    </Grid>
                  </Stack>
                </CardBody>
              </Card>
            );
          })}
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <H3 className="text-white">Sales Summary</H3>
                <Body className="text-on-dark-muted">
                  {totals.sold} tickets sold out of {totals.capacity} total capacity
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline">View Will-Call</Button>
                <Button variant="solid">Process Refund</Button>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </>
  );
}
