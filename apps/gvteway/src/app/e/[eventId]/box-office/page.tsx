'use client';

import { useState, useEffect } from 'react';
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
import { GvtewayAppLayout } from '../../../../components/app-layout';

interface TicketTier {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
  available: number;
  revenue: number;
}

const MOCK_TIERS: TicketTier[] = [
  { id: '1', name: 'General Admission', price: 75, capacity: 500, sold: 423, available: 77, revenue: 31725 },
  { id: '2', name: 'VIP', price: 150, capacity: 100, sold: 87, available: 13, revenue: 13050 },
  { id: '3', name: 'Premium', price: 250, capacity: 50, sold: 42, available: 8, revenue: 10500 },
  { id: '4', name: 'Table Service', price: 500, capacity: 20, sold: 18, available: 2, revenue: 9000 },
];

export default function EventBoxOfficePage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [tiers, setTiers] = useState(MOCK_TIERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const totals = tiers.reduce(
    (acc, tier) => ({
      capacity: acc.capacity + tier.capacity,
      sold: acc.sold + tier.sold,
      available: acc.available + tier.available,
      revenue: acc.revenue + tier.revenue,
    }),
    { capacity: 0, sold: 0, available: 0, revenue: 0 }
  );

  const soldPercentage = Math.round((totals.sold / totals.capacity) * 100);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/box-office`);
      if (response.ok) {
        const data = await response.json();
        if (data.tiers) setTiers(data.tiers);
      }
      setLastUpdated(new Date());
    } catch (_error) {
      // Handle error
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <Stack direction="horizontal" className="items-start justify-between">
          <SectionHeader
            kicker="Event"
            title="Box Office"
            description="Real-time ticket sales and revenue tracking"
            colorScheme="on-dark"
          />
          <Stack direction="horizontal" gap={2} className="items-center">
            <Body className="text-body-sm text-on-dark-muted">
              <Clock size={14} className="mr-1 inline" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Body>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </Button>
          </Stack>
        </Stack>

        <Grid cols={4} gap={4}>
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

        <Grid cols={2} gap={6}>
          {tiers.map((tier) => {
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
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Price</Body>
                        <Body className="font-weight-semibold text-white">${tier.price}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Revenue</Body>
                        <Body className="font-weight-semibold text-white">${tier.revenue.toLocaleString()}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Sold</Body>
                        <Body className="font-weight-semibold text-white">{tier.sold} / {tier.capacity}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm text-on-dark-muted">Available</Body>
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
    </GvtewayAppLayout>
  );
}
