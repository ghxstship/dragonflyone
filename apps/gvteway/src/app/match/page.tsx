'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
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
  Modal,
  LoadingSpinner,
  StatCard,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface UserMatch {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  interests: string[];
  favorite_genres: string[];
  events_attended: number;
  mutual_friends: number;
  match_score: number;
  is_following: boolean;
}

interface Interest {
  id: string;
  name: string;
  category: string;
  icon: string;
}

interface RecommendedEvent {
  id: string;
  title: string;
  date: string;
  venue_name: string;
  image_url?: string;
  match_reason: string;
  match_score: number;
}

export default function MatchPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<UserMatch[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<UserMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [matchesRes, interestsRes, eventsRes] = await Promise.all([
        fetch('/api/match/users'),
        fetch('/api/match/interests'),
        fetch('/api/match/events'),
      ]);

      if (matchesRes.ok) {
        const data = await matchesRes.json();
        setMatches(data.matches || []);
      }

      if (interestsRes.ok) {
        const data = await interestsRes.json();
        setInterests(data.interests || []);
        setUserInterests(data.user_interests || []);
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setRecommendedEvents(data.events || []);
      }
    } catch (err) {
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleInterest = async (interestId: string) => {
    const isSelected = userInterests.includes(interestId);
    const newInterests = isSelected
      ? userInterests.filter(i => i !== interestId)
      : [...userInterests, interestId];

    setUserInterests(newInterests);

    try {
      await fetch('/api/match/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: newInterests }),
      });
    } catch (err) {
      setError('Failed to update interests');
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      const response = await fetch(`/api/follows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        setMatches(matches.map(m =>
          m.id === userId ? { ...m, is_following: true } : m
        ));
        setSuccess('Now following!');
      }
    } catch (err) {
      setError('Failed to follow');
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-ink-600';
  };

  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  if (loading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Social">
              <FooterLink href="/match">Find Fans</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const highMatches = matches.filter(m => m.match_score >= 70);

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Social">
            <FooterLink href="/match">Find Fans</FooterLink>
            <FooterLink href="/friends">Friends</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Social</Kicker>
                <H2 size="lg" className="text-white">Find Your People</H2>
                <Body className="text-on-dark-muted">Connect with fans who share your interests</Body>
              </Stack>
              <Button variant="solid" inverted onClick={() => setShowInterestsModal(true)}>
                Update Interests
              </Button>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6}>
          <StatCard
            label="Your Interests"
            value={userInterests.length.toString()}
            inverted
          />
          <StatCard
            label="High Matches"
            value={highMatches.length.toString()}
            inverted
          />
          <StatCard
            label="Recommended Events"
            value={recommendedEvents.length.toString()}
            inverted
          />
          <StatCard
            label="Mutual Friends"
            value={matches.reduce((sum, m) => sum + m.mutual_friends, 0).toString()}
            inverted
          />
        </Grid>

        {userInterests.length === 0 && (
          <Alert variant="info" className="mb-6">
            Add your interests to get personalized matches and recommendations!
            <Button variant="outline" size="sm" className="ml-4" onClick={() => setShowInterestsModal(true)}>
              Add Interests
            </Button>
          </Alert>
        )}

        <H2 className="mb-4 text-white">Recommended For You</H2>
        <Grid cols={4} gap={4}>
          {recommendedEvents.length > 0 ? (
            recommendedEvents.slice(0, 4).map(event => (
              <Card
                key={event.id}
                inverted
                interactive
                className="cursor-pointer overflow-hidden"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <Stack className="relative h-32 bg-ink-900">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                  ) : (
                    <Stack className="flex size-full items-center justify-center">
                      <Body className="text-h3-md">🎫</Body>
                    </Stack>
                  )}
                  <Stack className="absolute right-2 top-2">
                    <Badge variant="solid">{event.match_score}% Match</Badge>
                  </Stack>
                </Stack>
                <Stack className="p-3" gap={1}>
                  <Body className="line-clamp-1 font-display text-white">{event.title}</Body>
                  <Body size="sm" className="font-mono text-on-dark-disabled">{event.venue_name}</Body>
                  <Body size="sm" className="font-mono text-on-dark-muted">{event.match_reason}</Body>
                </Stack>
              </Card>
            ))
          ) : (
            <Card inverted className="col-span-4 p-8 text-center">
              <Body className="text-on-dark-muted">Add interests to see personalized event recommendations</Body>
            </Card>
          )}
        </Grid>

        <H2 className="mb-4 text-white">Fans Like You</H2>
        <Grid cols={3} gap={6}>
          {matches.length > 0 ? (
            matches.map(match => (
              <Card
                key={match.id}
                inverted
                interactive
                className="cursor-pointer p-6"
                onClick={() => setSelectedMatch(match)}
              >
                <Stack direction="horizontal" gap={4}>
                  <Stack className="relative size-16 shrink-0 overflow-hidden rounded-avatar bg-ink-800">
                    {match.avatar_url ? (
                      <Image src={match.avatar_url} alt={match.name} fill className="object-cover" />
                    ) : (
                      <Stack className="flex size-full items-center justify-center">
                        <Body className="text-h3-md">👤</Body>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="flex-1">
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack>
                        <Body className="font-display text-white">{match.name}</Body>
                        {match.location && (
                          <Body size="sm" className="font-mono text-on-dark-disabled">📍 {match.location}</Body>
                        )}
                      </Stack>
                      <Body className={`font-display ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score}%
                      </Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
                      {match.interests.slice(0, 3).map(interest => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                      {match.interests.length > 3 && (
                        <Badge variant="outline">
                          +{match.interests.length - 3}
                        </Badge>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="mt-2 text-on-dark-disabled">
                      <Body size="sm">{match.events_attended} events</Body>
                      {match.mutual_friends > 0 && (
                        <Body size="sm">{match.mutual_friends} mutual friends</Body>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))
          ) : (
            <Card inverted className="col-span-3 p-12 text-center">
              <H3 className="mb-4 text-white">No Matches Yet</H3>
              <Body className="mb-6 text-on-dark-muted">
                Add your interests to find fans like you
              </Body>
              <Button variant="solid" inverted onClick={() => setShowInterestsModal(true)}>
                Add Interests
              </Button>
            </Card>
          )}
        </Grid>

        <Modal
          open={showInterestsModal}
          onClose={() => setShowInterestsModal(false)}
          title="Your Interests"
        >
          <Stack gap={6}>
            <Body className="text-ink-600">
              Select your interests to get better matches and recommendations
            </Body>
            {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
              <Stack key={category} gap={3}>
                <H3>{category}</H3>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {categoryInterests.map(interest => (
                    <Button
                      key={interest.id}
                      variant={userInterests.includes(interest.id) ? 'solid' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleInterest(interest.id)}
                    >
                      {interest.icon} {interest.name}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            ))}
            <Button variant="solid" onClick={() => {
              setShowInterestsModal(false);
              fetchData();
            }}>
              Done
            </Button>
          </Stack>
        </Modal>

        <Modal
          open={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title=""
        >
          {selectedMatch && (
            <Stack gap={6}>
              <Stack direction="horizontal" gap={6} className="items-center">
                <Stack className="w-24 h-24 rounded-full bg-ink-200 overflow-hidden relative flex-shrink-0">
                  {selectedMatch.avatar_url ? (
                    <Image src={selectedMatch.avatar_url} alt={selectedMatch.name} fill className="object-cover" />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-h3-md">👤</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack>
                  <H2>{selectedMatch.name}</H2>
                  {selectedMatch.location && (
                    <Body className="text-ink-500">📍 {selectedMatch.location}</Body>
                  )}
                  <Body className={`text-h5-md font-bold ${getMatchScoreColor(selectedMatch.match_score)}`}>
                    {selectedMatch.match_score}% Match
                  </Body>
                </Stack>
              </Stack>

              {selectedMatch.bio && (
                <Stack gap={2}>
                  <Label className="text-ink-500">About</Label>
                  <Body>{selectedMatch.bio}</Body>
                </Stack>
              )}

              <Stack gap={2}>
                <Label className="text-ink-500">Interests</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMatch.interests.map(interest => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Stack gap={2}>
                <Label className="text-ink-500">Favorite Genres</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMatch.favorite_genres.map(genre => (
                    <Badge key={genre} className="bg-purple-500 text-white">{genre}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Grid cols={2} gap={4}>
                <Stack className="text-center p-4 bg-ink-50 rounded">
                  <Body className="text-h5-md font-bold">{selectedMatch.events_attended}</Body>
                  <Body className="text-mono-xs text-ink-500">Events Attended</Body>
                </Stack>
                <Stack className="text-center p-4 bg-ink-50 rounded">
                  <Body className="text-h5-md font-bold">{selectedMatch.mutual_friends}</Body>
                  <Body className="text-mono-xs text-ink-500">Mutual Friends</Body>
                </Stack>
              </Grid>

              <Stack direction="horizontal" gap={4}>
                {!selectedMatch.is_following ? (
                  <Button variant="solid" onClick={() => handleFollow(selectedMatch.id)}>
                    Follow
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Following
                  </Button>
                )}
                <Button variant="outline">
                  Message
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
