'use client';

import { Suspense } from 'react';
import { useTabState } from '@ghxstship/config/hooks';
import { Sprout, Leaf, TreeDeciduous, Star, Sparkles, Crown } from 'lucide-react';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  Kicker,
} from '@ghxstship/ui';
import { useReputationData } from '@/hooks/useReputation';

const KARMA_LEVELS = [
  { level: 1, name: 'Newcomer', min: 0, icon: <Sprout className="size-4" /> },
  { level: 2, name: 'Regular', min: 100, icon: <Leaf className="size-4" /> },
  { level: 3, name: 'Contributor', min: 500, icon: <TreeDeciduous className="size-4" /> },
  { level: 4, name: 'Trusted', min: 1500, icon: <Star className="size-4" /> },
  { level: 5, name: 'Expert', min: 5000, icon: <Sparkles className="size-4" /> },
  { level: 6, name: 'Master', min: 15000, icon: <Sparkles className="size-4 text-warning-500" /> },
  { level: 7, name: 'Legend', min: 50000, icon: <Crown className="size-4 text-warning-500" /> },
];

function ReputationPageContent() {
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'overview',
    validTabs: ['overview', 'history', 'achievements'],
  });

  const {
    stats,
    transactions,
    achievements,
    isLoading: loading,
    error,
  } = useReputationData();

  const getCurrentLevel = (karma: number) => {
    for (let i = KARMA_LEVELS.length - 1; i >= 0; i--) {
      if (karma >= KARMA_LEVELS[i].min) {
        return KARMA_LEVELS[i];
      }
    }
    return KARMA_LEVELS[0];
  };

  const getNextLevel = (karma: number) => {
    for (const level of KARMA_LEVELS) {
      if (karma < level.min) {
        return level;
      }
    }
    return null;
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading reputation..." />;
  }

  const currentLevel = stats ? getCurrentLevel(stats.total_karma) : KARMA_LEVELS[0];
  const nextLevel = stats ? getNextLevel(stats.total_karma) : KARMA_LEVELS[1];
  const progressToNext = nextLevel && stats
    ? ((stats.total_karma - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Profile</Kicker>
              <H2 size="lg" className="text-white">Reputation</H2>
              <Body className="text-on-dark-muted">
                Your community standing and karma
              </Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="p-8 mb-8 bg-ink-950 text-white">
          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <Stack className="col-span-2">
              <Stack direction="horizontal" gap={4} className="items-center">
                <Stack className="w-20 h-20 bg-white/10 rounded-avatar flex items-center justify-center">
                  <Body className="text-h3-md">{currentLevel.icon}</Body>
                </Stack>
                <Stack>
                  <Body className="text-ink-600">LEVEL {currentLevel.level}</Body>
                  <H2 className="text-white">{currentLevel.name}</H2>
                  <Body className="text-h5-md font-weight-bold text-white">
                    {stats?.total_karma.toLocaleString() || 0} karma
                  </Body>
                </Stack>
              </Stack>
              {nextLevel && (
                <Stack className="mt-4">
                  <Stack className="w-full bg-white/20 h-3 rounded-avatar overflow-hidden">
                    <Stack
                      className="bg-white h-full transition-all"
                      style={{ '--progress-width': `${progressToNext}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                    />
                  </Stack>
                  <Body className="text-ink-600 mt-2">
                    {nextLevel.min - (stats?.total_karma || 0)} karma to {nextLevel.name}
                  </Body>
                </Stack>
              )}
            </Stack>
            <Stack className="items-center justify-center border-l border-white/20">
              <Body className="text-ink-600">RANK</Body>
              <H2 className="text-white">Top {stats?.rank_percentile || 50}%</H2>
            </Stack>
            <Stack className="items-center justify-center border-l border-white/20">
              <Body className="text-ink-600">HELPFUL VOTES</Body>
              <H2 className="text-white">{stats?.helpful_votes || 0}</H2>
            </Stack>
          </Grid>
        </Card>

        <Stack direction="horizontal" gap={2} className="mb-8">
          <Button
            variant={isActive('overview') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={isActive('history') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            Karma History
          </Button>
          <Button
            variant={isActive('achievements') ? 'solid' : 'outline'}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </Button>
        </Stack>

        {isActive('overview') && (
          <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <H3 className="mb-6">HOW TO EARN KARMA</H3>
              <Stack gap={3}>
                {[
                  { action: 'Write a helpful review', karma: '+10' },
                  { action: 'Receive a helpful vote', karma: '+5' },
                  { action: 'Answer a question', karma: '+3' },
                  { action: 'Attend an event', karma: '+2' },
                  { action: 'Daily login', karma: '+1' },
                  { action: 'Refer a friend', karma: '+25' },
                  { action: 'Report spam (confirmed)', karma: '+5' },
                ].map((item, index) => (
                  <Stack
                    key={index}
                    direction="horizontal"
                    className="justify-between items-center py-2 border-b border-ink-100"
                  >
                    <Body>{item.action}</Body>
                    <Badge className="bg-success-500 text-white">{item.karma}</Badge>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-6">YOUR CONTRIBUTIONS</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Card className="p-4 bg-ink-50 text-center">
                  <Body className="text-h4-md font-weight-bold">{stats?.reviews_count || 0}</Body>
                  <Body className="text-ink-500">Reviews</Body>
                </Card>
                <Card className="p-4 bg-ink-50 text-center">
                  <Body className="text-h4-md font-weight-bold">{stats?.answers_count || 0}</Body>
                  <Body className="text-ink-500">Answers</Body>
                </Card>
                <Card className="p-4 bg-ink-50 text-center">
                  <Body className="text-h4-md font-weight-bold">{stats?.events_attended || 0}</Body>
                  <Body className="text-ink-500">Events</Body>
                </Card>
                <Card className="p-4 bg-ink-50 text-center">
                  <Body className="text-h4-md font-weight-bold">{stats?.helpful_votes || 0}</Body>
                  <Body className="text-ink-500">Helpful Votes</Body>
                </Card>
              </Grid>
            </Card>

            <Card className="p-6 col-span-2">
              <H3 className="mb-6">KARMA LEVELS</H3>
              <Stack direction="horizontal" gap={2} className="overflow-x-auto pb-2">
                {KARMA_LEVELS.map(level => (
                  <Card
                    key={level.level}
                    className={`p-4 min-w-36 text-center ${
                      currentLevel.level >= level.level ? 'bg-black text-white' : 'bg-ink-100'
                    }`}
                  >
                    <Body className="text-h5-md mb-2">{level.icon}</Body>
                    <Body className={`font-weight-bold ${currentLevel.level >= level.level ? 'text-white' : ''}`}>
                      {level.name}
                    </Body>
                    <Body className={`text-mono-xs ${currentLevel.level >= level.level ? 'text-ink-600' : 'text-ink-500'}`}>
                      {level.min.toLocaleString()}+ karma
                    </Body>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid>
        )}

        {isActive('history') && (
          <Card className="p-6">
            <H3 className="mb-6">KARMA HISTORY</H3>
            {transactions.length > 0 ? (
              <Stack gap={2}>
                {transactions.map(tx => (
                  <Stack
                    key={tx.id}
                    direction="horizontal"
                    className="justify-between items-center py-3 border-b border-ink-100"
                  >
                    <Stack>
                      <Body className="font-weight-medium">{tx.description}</Body>
                      <Body className="text-mono-xs text-ink-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Body>
                    </Stack>
                    <Badge className={tx.amount >= 0 ? 'bg-success-500 text-white' : 'bg-error-500 text-white'}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </Badge>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Body className="text-ink-500 text-center py-8">
                No karma transactions yet
              </Body>
            )}
          </Card>
        )}

        {isActive('achievements') && (
          <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map(achievement => (
              <Card
                key={achievement.id}
                className={`p-4 ${achievement.earned_at ? '' : 'opacity-50'}`}
              >
                <Stack className="items-center text-center" gap={3}>
                  <Stack className={`w-16 h-16 rounded-avatar flex items-center justify-center ${
                    achievement.earned_at ? 'bg-black' : 'bg-ink-200'
                  }`}>
                    <Body className="text-h4-md">{achievement.icon}</Body>
                  </Stack>
                  <Stack>
                    <Body className="font-weight-bold">{achievement.name}</Body>
                    <Body className="text-mono-xs text-ink-500">{achievement.description}</Body>
                  </Stack>
                  <Badge className={achievement.earned_at ? 'bg-success-500 text-white' : 'bg-ink-300'}>
                    +{achievement.karma_reward} karma
                  </Badge>
                  {achievement.earned_at ? (
                    <Body className="text-mono-xs text-ink-600">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </Body>
                  ) : achievement.progress !== undefined && (
                    <Stack className="w-full">
                      <Stack className="w-full bg-ink-200 h-2 rounded-avatar overflow-hidden">
                        <Stack
                          className="bg-black h-full"
                          style={{ '--progress-width': `${(achievement.progress / (achievement.total || 1)) * 100}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                        />
                      </Stack>
                      <Body className="text-mono-xs text-ink-500 mt-1">
                        {achievement.progress} / {achievement.total}
                      </Body>
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Grid>
        )}
          </Stack>
    </>
  );
}

export default function ReputationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ReputationPageContent />
    </Suspense>
  );
}
