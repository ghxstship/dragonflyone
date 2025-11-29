'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
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
  ProjectCard,
  Kicker,
} from '@ghxstship/ui';
import { Bell } from 'lucide-react';

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
        return <Badge variant="solid">Flash Sale</Badge>;
      case 'last_minute':
        return <Badge variant="outline">Last Minute</Badge>;
      case 'early_bird':
        return <Badge variant="solid">Early Bird</Badge>;
      case 'group':
        return <Badge variant="outline">Group Deal</Badge>;
      case 'member':
        return <Badge variant="solid">Member Exclusive</Badge>;
      default:
        return <Badge variant="ghost">Deal</Badge>;
    }
  };

  const flashSales = deals.filter(d => d.deal_type === 'flash_sale');
  const lastMinute = deals.filter(d => d.deal_type === 'last_minute');
  const otherDeals = deals.filter(d => !['flash_sale', 'last_minute'].includes(d.deal_type));

  if (loading) {
    return <GvtewayLoadingLayout text="Loading deals..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Save Big</Kicker>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={1}>
                  <H2 size="lg" className="text-white">Deals & Offers</H2>
                  <Body className="text-on-dark-muted">Score amazing discounts on upcoming events</Body>
                </Stack>
                <Stack direction="horizontal" gap={4}>
                  <Select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value)}
                    inverted
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
                    inverted
                  >
                    <option value="discount">Biggest Discount</option>
                    <option value="expiring">Expiring Soon</option>
                    <option value="price">Lowest Price</option>
                    <option value="date">Event Date</option>
                  </Select>
                </Stack>
              </Stack>
            </Stack>

        {flashSales.length > 0 && (
          <Stack gap={6}>
            <Stack direction="horizontal" gap={3} className="items-center">
              <H2 className="text-white">Flash Sales</H2>
              <Badge variant="solid" className="animate-pulse">Limited Time</Badge>
            </Stack>
            <Grid cols={3} gap={6}>
              {flashSales.map(deal => (
                <Card key={deal.id} inverted interactive className="overflow-hidden ring-2 ring-error-500">
                  <Stack className="relative">
                    <Stack className="absolute left-2 top-2 z-10" direction="horizontal" gap={2}>
                      {getDealTypeBadge(deal.deal_type)}
                      <Badge variant="solid">
                        {deal.discount_percent}% OFF
                      </Badge>
                    </Stack>
                    {deal.expires_at && (
                      <Badge variant="solid" className="absolute right-2 top-2 z-10">
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
                  <Stack className="border-t border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack>
                        <Body size="sm" className="text-on-dark-disabled line-through">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-display text-white">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="solid" inverted onClick={() => handleEventClick(deal.event_id)}>
                        Get Deal
                      </Button>
                    </Stack>
                    {deal.quantity_available && deal.quantity_available < 50 && (
                      <Body size="sm" className="mt-2 text-error-400">
                        Only {deal.quantity_available} left at this price!
                      </Body>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {lastMinute.length > 0 && (
          <Stack gap={6}>
            <Stack direction="horizontal" gap={3} className="items-center">
              <H2 className="text-white">Last Minute Deals</H2>
              <Body className="text-on-dark-muted">Events happening soon</Body>
            </Stack>
            <Grid cols={3} gap={6}>
              {lastMinute.map(deal => (
                <Card key={deal.id} inverted interactive className="overflow-hidden">
                  <Stack className="relative">
                    <Stack className="absolute left-2 top-2 z-10" direction="horizontal" gap={2}>
                      {getDealTypeBadge(deal.deal_type)}
                      <Badge variant="solid">
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
                  <Stack className="border-t border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack>
                        <Body size="sm" className="text-on-dark-disabled line-through">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-display text-white">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="solid" inverted onClick={() => handleEventClick(deal.event_id)}>
                        Get Deal
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {otherDeals.length > 0 && (
          <Stack gap={6}>
            <H2 className="text-white">More Deals</H2>
            <Grid cols={3} gap={6}>
              {otherDeals.map(deal => (
                <Card key={deal.id} inverted interactive className="overflow-hidden">
                  <Stack className="relative">
                    <Stack className="absolute left-2 top-2 z-10" direction="horizontal" gap={2}>
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
                  <Stack className="border-t border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack>
                        <Body size="sm" className="text-on-dark-disabled line-through">
                          ${deal.original_price}
                        </Body>
                        <Body className="font-display text-white">
                          ${deal.deal_price}
                        </Body>
                      </Stack>
                      <Button variant="outlineInk" onClick={() => handleEventClick(deal.event_id)}>
                        View
                      </Button>
                    </Stack>
                    {deal.promo_code && (
                      <Stack className="mt-2 rounded-card bg-ink-900 p-2">
                        <Stack direction="horizontal" gap={1}>
                          <Body size="sm" className="text-on-dark-muted">Use code:</Body>
                          <Label className="font-mono text-white">{deal.promo_code}</Label>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {deals.length === 0 && (
          <Card inverted variant="elevated" className="p-12 text-center">
            <H3 className="mb-4 text-white">No Deals Available</H3>
            <Body className="mb-6 text-on-dark-muted">
              Check back soon for new deals and offers.
            </Body>
            <Button variant="outlineInk" onClick={() => router.push('/browse')}>
              Browse All Events
            </Button>
          </Card>
        )}

            <Card inverted variant="elevated" className="p-6">
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={1}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Bell className="size-5 text-on-dark-muted" />
                    <H3 className="text-white">Get Deal Alerts</H3>
                  </Stack>
                  <Body className="text-on-dark-muted">
                    Be the first to know about flash sales and special offers.
                  </Body>
                </Stack>
                <Button variant="solid" inverted onClick={() => router.push('/settings/notifications')}>
                  Enable Alerts
                </Button>
              </Stack>
            </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
