'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
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
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';

interface UserBadge {
  id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earned_at: string;
  is_featured: boolean;
}

interface AvailableBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  requirement: string;
  progress: number;
  total: number;
  is_earned: boolean;
}

interface FanTier {
  id: string;
  name: string;
  level: number;
  icon: string;
  perks: string[];
  points_required: number;
  is_current: boolean;
}

export default function BadgesPage() {
  const router = useRouter();
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [availableBadges, setAvailableBadges] = useState<AvailableBadge[]>([]);
  const [fanTiers, setFanTiers] = useState<FanTier[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'earned' | 'available' | 'tiers'>('earned');

  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/badges');
      if (response.ok) {
        const data = await response.json();
        setEarnedBadges(data.earned_badges || []);
        setAvailableBadges(data.available_badges || []);
        setFanTiers(data.fan_tiers || []);
        setCurrentPoints(data.current_points || 0);
      }
    } catch (err) {
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleFeatureBadge = async (badgeId: string, featured: boolean) => {
    try {
      await fetch(`/api/user/badges/${badgeId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });
      fetchBadges();
    } catch (err) {
      setError('Failed to update badge');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-warning-600';
      case 'silver': return 'bg-grey-400';
      case 'gold': return 'bg-warning-500';
      case 'platinum': return 'bg-purple-500';
      case 'diamond': return 'bg-cyan-400';
      default: return 'bg-grey-500';
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading badges..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Badges & Status</H1>
          <Body className="text-grey-600">
            Your achievements and fan tier status
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="p-6 mb-8 bg-gradient-to-r from-black to-gray-800 text-white">
          <Grid cols={3} gap={6}>
            <Stack className="items-center">
              <Body className="text-grey-400 text-sm">TOTAL BADGES</Body>
              <H2 className="text-white">{earnedBadges.length}</H2>
            </Stack>
            <Stack className="items-center">
              <Body className="text-grey-400 text-sm">FAN POINTS</Body>
              <H2 className="text-white">{currentPoints.toLocaleString()}</H2>
            </Stack>
            <Stack className="items-center">
              <Body className="text-grey-400 text-sm">CURRENT TIER</Body>
              <H2 className="text-white">
                {fanTiers.find(t => t.is_current)?.name || 'New Fan'}
              </H2>
            </Stack>
          </Grid>
        </Card>

        <Stack direction="horizontal" gap={2} className="mb-8">
          <Button
            variant={activeTab === 'earned' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('earned')}
          >
            Earned ({earnedBadges.length})
          </Button>
          <Button
            variant={activeTab === 'available' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('available')}
          >
            Available ({availableBadges.filter(b => !b.is_earned).length})
          </Button>
          <Button
            variant={activeTab === 'tiers' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('tiers')}
          >
            Fan Tiers
          </Button>
        </Stack>

        {activeTab === 'earned' && (
          <Grid cols={4} gap={4}>
            {earnedBadges.length > 0 ? (
              earnedBadges.map(badge => (
                <Card key={badge.id} className="p-4 text-center">
                  <Stack className="items-center" gap={3}>
                    <Stack className={`w-16 h-16 rounded-full ${getTierColor(badge.tier)} flex items-center justify-center`}>
                      <Body className="text-3xl">{badge.icon}</Body>
                    </Stack>
                    <Stack>
                      <Body className="font-bold">{badge.name}</Body>
                      <Body className="text-xs text-grey-500">{badge.description}</Body>
                    </Stack>
                    <Badge className={getTierColor(badge.tier) + ' text-white'}>
                      {badge.tier.toUpperCase()}
                    </Badge>
                    <Body className="text-xs text-grey-400">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </Body>
                    <Button
                      variant={badge.is_featured ? 'solid' : 'outline'}
                      size="sm"
                      onClick={() => handleFeatureBadge(badge.badge_id, !badge.is_featured)}
                    >
                      {badge.is_featured ? 'Featured' : 'Feature'}
                    </Button>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="col-span-4 p-12 text-center">
                <H3 className="mb-4">NO BADGES YET</H3>
                <Body className="text-grey-600 mb-6">
                  Start attending events and engaging with the community to earn badges!
                </Body>
                <Button variant="solid" onClick={() => router.push('/browse')}>
                  Browse Events
                </Button>
              </Card>
            )}
          </Grid>
        )}

        {activeTab === 'available' && (
          <Grid cols={3} gap={4}>
            {availableBadges.filter(b => !b.is_earned).map(badge => (
              <Card key={badge.id} className="p-4">
                <Stack direction="horizontal" gap={4}>
                  <Stack className="w-12 h-12 bg-grey-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Body className="text-2xl opacity-50">{badge.icon}</Body>
                  </Stack>
                  <Stack className="flex-1">
                    <Body className="font-bold">{badge.name}</Body>
                    <Body className="text-xs text-grey-500">{badge.description}</Body>
                    <Body className="text-xs text-grey-400 mt-1">{badge.requirement}</Body>
                    <Stack className="mt-2">
                      <Stack className="w-full bg-grey-200 h-2 rounded-full overflow-hidden">
                        <Stack
                          className="bg-black h-full transition-all"
                          style={{ '--progress-width': `${(badge.progress / badge.total) * 100}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                        />
                      </Stack>
                      <Body className="text-xs text-grey-500 mt-1">
                        {badge.progress} / {badge.total}
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {activeTab === 'tiers' && (
          <Stack gap={4}>
            {fanTiers.map((tier, index) => {
              const isUnlocked = currentPoints >= tier.points_required;
              const nextTier = fanTiers[index + 1];
              const progress = nextTier
                ? ((currentPoints - tier.points_required) / (nextTier.points_required - tier.points_required)) * 100
                : 100;

              return (
                <Card
                  key={tier.id}
                  className={`p-6 ${tier.is_current ? 'border-2 border-black' : ''} ${!isUnlocked ? 'opacity-50' : ''}`}
                >
                  <Stack direction="horizontal" gap={6}>
                    <Stack className={`w-20 h-20 rounded-full flex items-center justify-center ${
                      isUnlocked ? 'bg-black text-white' : 'bg-grey-200'
                    }`}>
                      <Body className="text-3xl">{tier.icon}</Body>
                    </Stack>
                    <Stack className="flex-1">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <H3>{tier.name}</H3>
                            {tier.is_current && (
                              <Badge className="bg-success-500 text-white">Current</Badge>
                            )}
                          </Stack>
                          <Body className="text-grey-500">
                            {tier.points_required.toLocaleString()} points required
                          </Body>
                        </Stack>
                        <Body className="text-2xl font-bold">Level {tier.level}</Body>
                      </Stack>
                      <Stack className="mt-4">
                        <Label className="text-grey-500 mb-2">PERKS</Label>
                        <Grid cols={2} gap={2}>
                          {tier.perks.map((perk, i) => (
                            <Body key={i} className="text-sm">✓ {perk}</Body>
                          ))}
                        </Grid>
                      </Stack>
                      {tier.is_current && nextTier && (
                        <Stack className="mt-4">
                          <Stack className="w-full bg-grey-200 h-2 rounded-full overflow-hidden">
                            <Stack
                              className="bg-black h-full transition-all"
                              style={{ '--progress-width': `${Math.min(progress, 100)}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                            />
                          </Stack>
                          <Body className="text-xs text-grey-500 mt-1">
                            {nextTier.points_required - currentPoints} points to {nextTier.name}
                          </Body>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
        </Stack>
      </Container>
    </Section>
  );
}
