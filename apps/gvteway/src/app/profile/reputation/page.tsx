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

interface ReputationStats {
  total_karma: number;
  level: number;
  level_name: string;
  next_level_karma: number;
  rank_percentile: number;
  helpful_votes: number;
  reviews_count: number;
  answers_count: number;
  events_attended: number;
}

interface KarmaTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  karma_reward: number;
  earned_at?: string;
  progress?: number;
  total?: number;
}

const KARMA_LEVELS = [
  { level: 1, name: 'Newcomer', min: 0, icon: '🌱' },
  { level: 2, name: 'Regular', min: 100, icon: '🌿' },
  { level: 3, name: 'Contributor', min: 500, icon: '🌳' },
  { level: 4, name: 'Trusted', min: 1500, icon: '⭐' },
  { level: 5, name: 'Expert', min: 5000, icon: '🌟' },
  { level: 6, name: 'Master', min: 15000, icon: '💫' },
  { level: 7, name: 'Legend', min: 50000, icon: '👑' },
];

export default function ReputationPage() {
  const router = useRouter();
  const [stats, setStats] = useState<ReputationStats | null>(null);
  const [transactions, setTransactions] = useState<KarmaTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');

  const fetchReputation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/reputation');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTransactions(data.transactions || []);
        setAchievements(data.achievements || []);
      }
    } catch (err) {
      setError('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReputation();
  }, [fetchReputation]);

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
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading reputation..." />
        </Container>
      </Section>
    );
  }

  const currentLevel = stats ? getCurrentLevel(stats.total_karma) : KARMA_LEVELS[0];
  const nextLevel = stats ? getNextLevel(stats.total_karma) : KARMA_LEVELS[1];
  const progressToNext = nextLevel && stats
    ? ((stats.total_karma - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Reputation</H1>
          <Body className="text-grey-600">
            Your community standing and karma
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Card className="p-8 mb-8 bg-gradient-to-r from-black to-gray-800 text-white">
          <Grid cols={4} gap={6}>
            <Stack className="col-span-2">
              <Stack direction="horizontal" gap={4} className="items-center">
                <Stack className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                  <Body className="text-4xl">{currentLevel.icon}</Body>
                </Stack>
                <Stack>
                  <Body className="text-grey-400 text-sm">LEVEL {currentLevel.level}</Body>
                  <H2 className="text-white">{currentLevel.name}</H2>
                  <Body className="text-2xl font-bold text-white">
                    {stats?.total_karma.toLocaleString() || 0} karma
                  </Body>
                </Stack>
              </Stack>
              {nextLevel && (
                <Stack className="mt-4">
                  <Stack className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                    <Stack
                      className="bg-white h-full transition-all"
                      style={{ '--progress-width': `${progressToNext}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                    />
                  </Stack>
                  <Body className="text-grey-400 text-sm mt-2">
                    {nextLevel.min - (stats?.total_karma || 0)} karma to {nextLevel.name}
                  </Body>
                </Stack>
              )}
            </Stack>
            <Stack className="items-center justify-center border-l border-white/20">
              <Body className="text-grey-400 text-sm">RANK</Body>
              <H2 className="text-white">Top {stats?.rank_percentile || 50}%</H2>
            </Stack>
            <Stack className="items-center justify-center border-l border-white/20">
              <Body className="text-grey-400 text-sm">HELPFUL VOTES</Body>
              <H2 className="text-white">{stats?.helpful_votes || 0}</H2>
            </Stack>
          </Grid>
        </Card>

        <Stack direction="horizontal" gap={2} className="mb-8">
          <Button
            variant={activeTab === 'overview' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'history' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            Karma History
          </Button>
          <Button
            variant={activeTab === 'achievements' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </Button>
        </Stack>

        {activeTab === 'overview' && (
          <Grid cols={2} gap={6}>
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
                    className="justify-between items-center py-2 border-b border-grey-100"
                  >
                    <Body>{item.action}</Body>
                    <Badge className="bg-success-500 text-white">{item.karma}</Badge>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card className="p-6">
              <H3 className="mb-6">YOUR CONTRIBUTIONS</H3>
              <Grid cols={2} gap={4}>
                <Card className="p-4 bg-grey-50 text-center">
                  <Body className="text-3xl font-bold">{stats?.reviews_count || 0}</Body>
                  <Body className="text-grey-500 text-sm">Reviews</Body>
                </Card>
                <Card className="p-4 bg-grey-50 text-center">
                  <Body className="text-3xl font-bold">{stats?.answers_count || 0}</Body>
                  <Body className="text-grey-500 text-sm">Answers</Body>
                </Card>
                <Card className="p-4 bg-grey-50 text-center">
                  <Body className="text-3xl font-bold">{stats?.events_attended || 0}</Body>
                  <Body className="text-grey-500 text-sm">Events</Body>
                </Card>
                <Card className="p-4 bg-grey-50 text-center">
                  <Body className="text-3xl font-bold">{stats?.helpful_votes || 0}</Body>
                  <Body className="text-grey-500 text-sm">Helpful Votes</Body>
                </Card>
              </Grid>
            </Card>

            <Card className="p-6 col-span-2">
              <H3 className="mb-6">KARMA LEVELS</H3>
              <Stack direction="horizontal" gap={2} className="overflow-x-auto pb-2">
                {KARMA_LEVELS.map(level => (
                  <Card
                    key={level.level}
                    className={`p-4 min-w-[140px] text-center ${
                      currentLevel.level >= level.level ? 'bg-black text-white' : 'bg-grey-100'
                    }`}
                  >
                    <Body className="text-2xl mb-2">{level.icon}</Body>
                    <Body className={`font-bold ${currentLevel.level >= level.level ? 'text-white' : ''}`}>
                      {level.name}
                    </Body>
                    <Body className={`text-xs ${currentLevel.level >= level.level ? 'text-grey-300' : 'text-grey-500'}`}>
                      {level.min.toLocaleString()}+ karma
                    </Body>
                  </Card>
                ))}
              </Stack>
            </Card>
          </Grid>
        )}

        {activeTab === 'history' && (
          <Card className="p-6">
            <H3 className="mb-6">KARMA HISTORY</H3>
            {transactions.length > 0 ? (
              <Stack gap={2}>
                {transactions.map(tx => (
                  <Stack
                    key={tx.id}
                    direction="horizontal"
                    className="justify-between items-center py-3 border-b border-grey-100"
                  >
                    <Stack>
                      <Body className="font-medium">{tx.description}</Body>
                      <Body className="text-xs text-grey-500">
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
              <Body className="text-grey-500 text-center py-8">
                No karma transactions yet
              </Body>
            )}
          </Card>
        )}

        {activeTab === 'achievements' && (
          <Grid cols={3} gap={4}>
            {achievements.map(achievement => (
              <Card
                key={achievement.id}
                className={`p-4 ${achievement.earned_at ? '' : 'opacity-50'}`}
              >
                <Stack className="items-center text-center" gap={3}>
                  <Stack className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    achievement.earned_at ? 'bg-black' : 'bg-grey-200'
                  }`}>
                    <Body className="text-3xl">{achievement.icon}</Body>
                  </Stack>
                  <Stack>
                    <Body className="font-bold">{achievement.name}</Body>
                    <Body className="text-xs text-grey-500">{achievement.description}</Body>
                  </Stack>
                  <Badge className={achievement.earned_at ? 'bg-success-500 text-white' : 'bg-grey-300'}>
                    +{achievement.karma_reward} karma
                  </Badge>
                  {achievement.earned_at ? (
                    <Body className="text-xs text-grey-400">
                      Earned {new Date(achievement.earned_at).toLocaleDateString()}
                    </Body>
                  ) : achievement.progress !== undefined && (
                    <Stack className="w-full">
                      <Stack className="w-full bg-grey-200 h-2 rounded-full overflow-hidden">
                        <Stack
                          className="bg-black h-full"
                          style={{ '--progress-width': `${(achievement.progress / (achievement.total || 1)) * 100}%`, width: 'var(--progress-width)' } as React.CSSProperties}
                        />
                      </Stack>
                      <Body className="text-xs text-grey-500 mt-1">
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
      </Container>
    </Section>
  );
}
