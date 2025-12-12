'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
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
  Kicker,
} from '@ghxstship/ui';
import { useBadgesData } from '@/hooks/useBadges';

function BadgesPageContent() {
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'earned',
    validTabs: ['earned', 'available', 'tiers'],
  });

  const {
    earnedBadges,
    availableBadges,
    fanTiers,
    currentPoints,
    isLoading: loading,
    error,
    featureBadge,
  } = useBadgesData();

  const handleFeatureBadge = async (badgeId: string, featured: boolean) => {
    try {
      await featureBadge({ badgeId, featured });
    } catch {
      setLocalError('Failed to update badge');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-warning-600';
      case 'silver': return 'bg-ink-400';
      case 'gold': return 'bg-warning-500';
      case 'platinum': return 'bg-purple-500';
      case 'diamond': return 'bg-cyan-400';
      default: return 'bg-ink-500';
    }
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading badges..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Profile</Kicker>
              <H2 size="lg" className="text-white">Badges & Status</H2>
              <Body className="text-on-dark-muted">
                Your achievements and fan tier status
              </Body>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        <Card className="p-6 mb-8 bg-ink-950 text-white">
          <Grid cols={3} gap={6}>
            <Stack className="items-center">
              <Body className="text-ink-600">TOTAL BADGES</Body>
              <H2 className="text-white">{earnedBadges.length}</H2>
            </Stack>
            <Stack className="items-center">
              <Body className="text-ink-600">FAN POINTS</Body>
              <H2 className="text-white">{currentPoints.toLocaleString()}</H2>
            </Stack>
            <Stack className="items-center">
              <Body className="text-ink-600">CURRENT TIER</Body>
              <H2 className="text-white">
                {fanTiers.find(t => t.is_current)?.name || 'New Fan'}
              </H2>
            </Stack>
          </Grid>
        </Card>

        <Stack direction="horizontal" gap={2} className="mb-8">
          <Button
            variant={isActive('earned') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('earned')}
          >
            Earned ({earnedBadges.length})
          </Button>
          <Button
            variant={isActive('available') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('available')}
          >
            Available ({availableBadges.filter(b => !b.is_earned).length})
          </Button>
          <Button
            variant={isActive('tiers') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('tiers')}
          >
            Fan Tiers
          </Button>
        </Stack>

        {isActive('earned') && (
          <Grid cols={4} gap={4}>
            {earnedBadges.length > 0 ? (
              earnedBadges.map(badge => (
                <Card key={badge.id} className="p-4 text-center">
                  <Stack className="items-center" gap={3}>
                    <Stack className={`w-16 h-16 rounded-avatar ${getTierColor(badge.tier)} flex items-center justify-center`}>
                      <Body className="text-h4-md">{badge.icon}</Body>
                    </Stack>
                    <Stack>
                      <Body className="font-weight-bold">{badge.name}</Body>
                      <Body className="text-mono-xs text-ink-500">{badge.description}</Body>
                    </Stack>
                    <Badge className={getTierColor(badge.tier) + ' text-white'}>
                      {badge.tier.toUpperCase()}
                    </Badge>
                    <Body className="text-mono-xs text-ink-600">
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
                <Body className="text-ink-600 mb-6">
                  Start attending events and engaging with the community to earn badges!
                </Body>
                <Button variant="solid" onClick={() => router.push('/browse')}>
                  Browse Events
                </Button>
              </Card>
            )}
          </Grid>
        )}

        {isActive('available') && (
          <Grid cols={3} gap={4}>
            {availableBadges.filter(b => !b.is_earned).map(badge => (
              <Card key={badge.id} className="p-4">
                <Stack direction="horizontal" gap={4}>
                  <Stack className="w-12 h-12 bg-ink-200 rounded-avatar flex items-center justify-center flex-shrink-0">
                    <Body className="text-h5-md opacity-50">{badge.icon}</Body>
                  </Stack>
                  <Stack className="flex-1">
                    <Body className="font-weight-bold">{badge.name}</Body>
                    <Body className="text-mono-xs text-ink-500">{badge.description}</Body>
                    <Body className="text-mono-xs text-ink-600 mt-1">{badge.requirement}</Body>
                    <Stack className="mt-2">
                      <Stack className="w-full bg-ink-200 h-2 rounded-avatar overflow-hidden">
                        <Stack
                          className="bg-black h-full transition-all"
                          style={{ '--progress-width': `${(badge.progress / badge.total) * 100}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                        />
                      </Stack>
                      <Body className="text-mono-xs text-ink-500 mt-1">
                        {badge.progress} / {badge.total}
                      </Body>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {isActive('tiers') && (
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
                    <Stack className={`w-20 h-20 rounded-avatar flex items-center justify-center ${
                      isUnlocked ? 'bg-black text-white' : 'bg-ink-200'
                    }`}>
                      <Body className="text-h4-md">{tier.icon}</Body>
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
                          <Body className="text-ink-500">
                            {tier.points_required.toLocaleString()} points required
                          </Body>
                        </Stack>
                        <Body className="text-h5-md font-weight-bold">Level {tier.level}</Body>
                      </Stack>
                      <Stack className="mt-4">
                        <Label className="text-ink-500 mb-2">PERKS</Label>
                        <Grid cols={2} gap={2}>
                          {tier.perks.map((perk, i) => (
                            <Body key={i} size="sm" className="">✓ {perk}</Body>
                          ))}
                        </Grid>
                      </Stack>
                      {tier.is_current && nextTier && (
                        <Stack className="mt-4">
                          <Stack className="w-full bg-ink-200 h-2 rounded-avatar overflow-hidden">
                            <Stack
                              className="bg-black h-full transition-all"
                              style={{ '--progress-width': `${Math.min(progress, 100)}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                            />
                          </Stack>
                          <Body className="text-mono-xs text-ink-500 mt-1">
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
    </GvtewayAppLayout>
  );
}

export default function BadgesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <BadgesPageContent />
    </Suspense>
  );
}
