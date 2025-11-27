'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Select,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  ProjectCard,
} from '@ghxstship/ui';

interface Deal {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_image?: string;
  original_price: number;
  deal_price: number;
  discount_percent: number;
  deal_type: 'flash_sale' | 'last_minute' | 'early_bird' | 'group' | 'member';
  expires_at?: string;
  quantity_available?: number;
  promo_code?: string;
}

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dealType, setDealType] = useState('all');
  const [sortBy, setSortBy] = useState('discount');

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(dealType !== 'all' && { type: dealType }),
        sort: sortBy,
      });
      
      const response = await fetch(`/api/deals?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error('Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, [dealType, sortBy]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getDealTypeBadge = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return <Badge className="bg-error-500 text-white">Flash Sale</Badge>;
      case 'last_minute':
        return <Badge className="bg-warning-500 text-white">Last Minute</Badge>;
      case 'early_bird':
        return <Badge className="bg-info-500 text-white">Early Bird</Badge>;
      case 'group':
        return <Badge className="bg-purple-500 text-white">Group Deal</Badge>;
      case 'member':
        return <Badge className="bg-success-500 text-white">Member Exclusive</Badge>;
      default:
        return <Badge>Deal</Badge>;
    }
  };

  const flashSales = deals.filter(d => d.deal_type === 'flash_sale');
  const lastMinute = deals.filter(d => d.deal_type === 'last_minute');
  const otherDeals = deals.filter(d => !['flash_sale', 'last_minute'].includes(d.deal_type));

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading deals..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Deals & Offers</H1>
            <Body className="text-grey-600">
              Score amazing discounts on upcoming events
            </Body>
          </Stack>
            <Stack direction="horizontal" gap={4}>
              <Select
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
              >
                <option value="all">All Deals</option>
                <option value="flash_sale">Flash Sales</option>
                <option value="last_minute">Last Minute</option>
                <option value="early_bird">Early Bird</option>
                <option value="group">Group Deals</option>
                <option value="member">Member Exclusive</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="discount">Biggest Discount</option>
                <option value="expiring">Expiring Soon</option>
                <option value="price">Lowest Price</option>
                <option value="date">Event Date</option>
              </Select>
          </Stack>
        </Stack>

        {flashSales.length > 0 && (
          <Section className="mb-12">
            <Stack direction="horizontal" gap={3} className="items-center mb-6">
              <H2>FLASH SALES</H2>
              <Badge className="bg-error-500 text-white animate-pulse">Limited Time</Badge>
            </Stack>
            <Grid cols={3} gap={6}>
              {flashSales.map(deal => (
                <Card key={deal.id} className="overflow-hidden border-2 border-error-500">
                  <Stack className="relative">
                    <Stack className="absolute top-2 left-2 z-10" direction="horizontal" gap={2}>
                      {getDealTypeBadge(deal.deal_type)}
                      <Badge className="bg-black text-white">
                        {deal.discount_percent}% OFF
                      </Badge>
                    </Stack>
                    {deal.expires_at && (
                      <Badge className="absolute top-2 right-2 z-10 bg-error-600 text-white">
                        {getTimeRemaining(deal.expires_at)}
                      </Badge>
                    )}
                  </Stack>
                  <ProjectCard
                    title={deal.event_title}
                    image={deal.event_image || ''}
                    metadata={`${deal.event_date} • ${deal.event_venue}`}
                    onClick={() => handleEventClick(deal.event_id)}
                  />
                  <Stack className="p-4 bg-grey-50 border-t">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack>
                        <Body className="text-grey-500 line-through text-sm">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-bold text-xl text-error-600">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="solid" onClick={() => handleEventClick(deal.event_id)}>
                        Get Deal
                      </Button>
                    </Stack>
                    {deal.quantity_available && deal.quantity_available < 50 && (
                      <Body className="text-sm text-error-600 mt-2">
                        Only {deal.quantity_available} left at this price!
                      </Body>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {lastMinute.length > 0 && (
          <Section className="mb-12">
            <Stack direction="horizontal" gap={3} className="items-center mb-6">
              <H2>LAST MINUTE DEALS</H2>
              <Body className="text-grey-600">Events happening soon</Body>
            </Stack>
            <Grid cols={3} gap={6}>
              {lastMinute.map(deal => (
                <Card key={deal.id} className="overflow-hidden">
                  <Stack className="relative">
                    <Stack className="absolute top-2 left-2 z-10" direction="horizontal" gap={2}>
                      {getDealTypeBadge(deal.deal_type)}
                      <Badge className="bg-black text-white">
                        {deal.discount_percent}% OFF
                      </Badge>
                    </Stack>
                  </Stack>
                  <ProjectCard
                    title={deal.event_title}
                    image={deal.event_image || ''}
                    metadata={`${deal.event_date} • ${deal.event_venue}`}
                    onClick={() => handleEventClick(deal.event_id)}
                  />
                  <Stack className="p-4 bg-grey-50 border-t">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack>
                        <Body className="text-grey-500 line-through text-sm">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-bold text-xl">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="solid" onClick={() => handleEventClick(deal.event_id)}>
                        Get Deal
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {otherDeals.length > 0 && (
          <Section className="mb-12">
            <H2 className="mb-6">MORE DEALS</H2>
            <Grid cols={3} gap={6}>
              {otherDeals.map(deal => (
                <Card key={deal.id} className="overflow-hidden">
                  <Stack className="relative">
                    <Stack className="absolute top-2 left-2 z-10" direction="horizontal" gap={2}>
                      {getDealTypeBadge(deal.deal_type)}
                      <Badge variant="outline">
                        {deal.discount_percent}% OFF
                      </Badge>
                    </Stack>
                  </Stack>
                  <ProjectCard
                    title={deal.event_title}
                    image={deal.event_image || ''}
                    metadata={`${deal.event_date} • ${deal.event_venue}`}
                    onClick={() => handleEventClick(deal.event_id)}
                  />
                  <Stack className="p-4 bg-grey-50 border-t">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack>
                        <Body className="text-grey-500 line-through text-sm">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-bold text-xl">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="outline" onClick={() => handleEventClick(deal.event_id)}>
                        View
                      </Button>
                    </Stack>
                    {deal.promo_code && (
                      <Stack className="mt-2 p-2 bg-grey-100 rounded">
                        <Stack direction="horizontal" gap={1}>
                          <Body className="text-sm text-grey-600">Use code:</Body>
                          <Label className="font-mono font-bold">{deal.promo_code}</Label>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {deals.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO DEALS AVAILABLE</H3>
            <Body className="text-grey-600 mb-6">
              Check back soon for new deals and offers.
            </Body>
            <Button variant="outline" onClick={() => router.push('/browse')}>
              Browse All Events
            </Button>
          </Card>
        )}

        <Card className="p-6 bg-black text-white mt-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <H3 className="text-white">GET DEAL ALERTS</H3>
              <Body className="text-grey-600">
                Be the first to know about flash sales and special offers.
              </Body>
            </Stack>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => router.push('/settings/notifications')}>
              Enable Alerts
            </Button>
          </Stack>
        </Card>
        </Stack>
      </Container>
    </Section>
  );
}
