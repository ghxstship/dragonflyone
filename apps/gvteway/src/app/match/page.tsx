'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '../../components/navigation';
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
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
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
    return 'text-grey-600';
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
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  const highMatches = matches.filter(m => m.match_score >= 70);

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
            <Stack gap={2}>
              <H1>Find Your People</H1>
              <Body className="text-grey-600">
                Connect with fans who share your interests
              </Body>
            </Stack>
            <Button variant="solid" onClick={() => setShowInterestsModal(true)}>
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

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Your Interests"
            value={userInterests.length}
            icon={<Body>❤️</Body>}
          />
          <StatCard
            label="High Matches"
            value={highMatches.length}
            icon={<Body>🎯</Body>}
          />
          <StatCard
            label="Recommended Events"
            value={recommendedEvents.length}
            icon={<Body>🎫</Body>}
          />
          <StatCard
            label="Mutual Friends"
            value={matches.reduce((sum, m) => sum + m.mutual_friends, 0)}
            icon={<Body>👥</Body>}
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

        <H2 className="mb-4">RECOMMENDED FOR YOU</H2>
        <Grid cols={4} gap={4} className="mb-8">
          {recommendedEvents.length > 0 ? (
            recommendedEvents.slice(0, 4).map(event => (
              <Card
                key={event.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <Stack className="relative h-32 bg-grey-100">
                  {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-3xl">🎫</Body>
                    </Stack>
                  )}
                  <Stack className="absolute top-2 right-2">
                    <Badge className="bg-success-500 text-white">{event.match_score}% Match</Badge>
                  </Stack>
                </Stack>
                <Stack className="p-3" gap={1}>
                  <Body className="font-bold line-clamp-1">{event.title}</Body>
                  <Body className="text-xs text-grey-500">{event.venue_name}</Body>
                  <Body className="text-xs text-grey-400">{event.match_reason}</Body>
                </Stack>
              </Card>
            ))
          ) : (
            <Card className="col-span-4 p-8 text-center">
              <Body className="text-grey-600">Add interests to see personalized event recommendations</Body>
            </Card>
          )}
        </Grid>

        <H2 className="mb-4">FANS LIKE YOU</H2>
        <Grid cols={3} gap={6}>
          {matches.length > 0 ? (
            matches.map(match => (
              <Card
                key={match.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedMatch(match)}
              >
                <Stack direction="horizontal" gap={4}>
                  <Stack className="w-16 h-16 rounded-full bg-grey-200 overflow-hidden relative flex-shrink-0">
                    {match.avatar_url ? (
                      <Image src={match.avatar_url} alt={match.name} fill className="object-cover" />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center">
                        <Body className="text-2xl">👤</Body>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="flex-1">
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack>
                        <Body className="font-bold">{match.name}</Body>
                        {match.location && (
                          <Body className="text-xs text-grey-500">📍 {match.location}</Body>
                        )}
                      </Stack>
                      <Body className={`font-bold ${getMatchScoreColor(match.match_score)}`}>
                        {match.match_score}%
                      </Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="mt-2 flex-wrap">
                      {match.interests.slice(0, 3).map(interest => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {match.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.interests.length - 3}
                        </Badge>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={4} className="mt-2 text-xs text-grey-500">
                      <Body>{match.events_attended} events</Body>
                      {match.mutual_friends > 0 && (
                        <Body>{match.mutual_friends} mutual friends</Body>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))
          ) : (
            <Card className="col-span-3 p-12 text-center">
              <H3 className="mb-4">NO MATCHES YET</H3>
              <Body className="text-grey-600 mb-6">
                Add your interests to find fans like you
              </Body>
              <Button variant="solid" onClick={() => setShowInterestsModal(true)}>
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
            <Body className="text-grey-600">
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
                <Stack className="w-24 h-24 rounded-full bg-grey-200 overflow-hidden relative flex-shrink-0">
                  {selectedMatch.avatar_url ? (
                    <Image src={selectedMatch.avatar_url} alt={selectedMatch.name} fill className="object-cover" />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-4xl">👤</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack>
                  <H2>{selectedMatch.name}</H2>
                  {selectedMatch.location && (
                    <Body className="text-grey-500">📍 {selectedMatch.location}</Body>
                  )}
                  <Body className={`text-2xl font-bold ${getMatchScoreColor(selectedMatch.match_score)}`}>
                    {selectedMatch.match_score}% Match
                  </Body>
                </Stack>
              </Stack>

              {selectedMatch.bio && (
                <Stack gap={2}>
                  <Label className="text-grey-500">About</Label>
                  <Body>{selectedMatch.bio}</Body>
                </Stack>
              )}

              <Stack gap={2}>
                <Label className="text-grey-500">Interests</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMatch.interests.map(interest => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Stack gap={2}>
                <Label className="text-grey-500">Favorite Genres</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMatch.favorite_genres.map(genre => (
                    <Badge key={genre} className="bg-purple-500 text-white">{genre}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Grid cols={2} gap={4}>
                <Stack className="text-center p-4 bg-grey-50 rounded">
                  <Body className="text-2xl font-bold">{selectedMatch.events_attended}</Body>
                  <Body className="text-xs text-grey-500">Events Attended</Body>
                </Stack>
                <Stack className="text-center p-4 bg-grey-50 rounded">
                  <Body className="text-2xl font-bold">{selectedMatch.mutual_friends}</Body>
                  <Body className="text-xs text-grey-500">Mutual Friends</Body>
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
  );
}
