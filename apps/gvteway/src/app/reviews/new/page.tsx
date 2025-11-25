'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  image?: string;
}

function NewReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Review form state
  const [overallRating, setOverallRating] = useState(0);
  const [venueRating, setVenueRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [atmosphereRating, setAtmosphereRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);

  const highlightOptions = [
    'Great Performance',
    'Amazing Venue',
    'Good Sound Quality',
    'Easy Entry',
    'Great Crowd',
    'Good Food/Drinks',
    'Clean Facilities',
    'Friendly Staff',
    'Good Parking',
    'Worth the Price',
  ];

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
      }
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      setError('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          overall_rating: overallRating,
          venue_rating: venueRating || null,
          value_rating: valueRating || null,
          atmosphere_rating: atmosphereRating || null,
          title,
          content,
          would_recommend: wouldRecommend,
          highlights,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/events/${eventId}`);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHighlight = (highlight: string) => {
    setHighlights(prev =>
      prev.includes(highlight)
        ? prev.filter(h => h !== highlight)
        : [...prev, highlight]
    );
  };

  const renderStars = (rating: number, setRating: (r: number) => void, label: string) => (
    <Stack gap={2}>
      <Label>{label}</Label>
      <Stack direction="horizontal" gap={1}>
        {[1, 2, 3, 4, 5].map(star => (
          <Button
            key={star}
            type="button"
            variant="ghost"
            className={`text-2xl p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
          >
            ★
          </Button>
        ))}
      </Stack>
    </Stack>
  );

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (!event) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Card className="p-12 text-center mt-12">
            <H2 className="mb-4">EVENT NOT FOUND</H2>
            <Body className="text-gray-600 mb-6">
              Please select an event to review.
            </Body>
            <Button variant="solid" onClick={() => router.push('/my-events')}>
              View My Events
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  if (success) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Card className="p-12 text-center mt-12">
            <H2 className="mb-4">THANK YOU!</H2>
            <Body className="text-gray-600 mb-6">
              Your review has been submitted successfully.
            </Body>
            <LoadingSpinner size="sm" />
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Display>WRITE A REVIEW</Display>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2">
            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                <Card className="p-6">
                  <H3 className="mb-6">OVERALL RATING</H3>
                  {renderStars(overallRating, setOverallRating, 'How would you rate this event overall?')}
                </Card>

                <Card className="p-6">
                  <H3 className="mb-6">DETAILED RATINGS</H3>
                  <Grid cols={3} gap={6}>
                    {renderStars(venueRating, setVenueRating, 'Venue')}
                    {renderStars(valueRating, setValueRating, 'Value for Money')}
                    {renderStars(atmosphereRating, setAtmosphereRating, 'Atmosphere')}
                  </Grid>
                </Card>

                <Card className="p-6">
                  <H3 className="mb-6">YOUR REVIEW</H3>
                  <Stack gap={4}>
                    <Field label="Review Title">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience..."
                      />
                    </Field>

                    <Field label="Your Review">
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share details of your experience..."
                        rows={6}
                      />
                    </Field>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <H3 className="mb-6">HIGHLIGHTS</H3>
                  <Body className="text-gray-600 mb-4">
                    What stood out about this event?
                  </Body>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {highlightOptions.map(highlight => (
                      <Button
                        key={highlight}
                        type="button"
                        variant={highlights.includes(highlight) ? 'solid' : 'outline'}
                        size="sm"
                        onClick={() => toggleHighlight(highlight)}
                      >
                        {highlight}
                      </Button>
                    ))}
                  </Stack>
                </Card>

                <Card className="p-6">
                  <H3 className="mb-6">WOULD YOU RECOMMEND?</H3>
                  <Stack direction="horizontal" gap={4}>
                    <Button
                      type="button"
                      variant={wouldRecommend === true ? 'solid' : 'outline'}
                      onClick={() => setWouldRecommend(true)}
                      className="flex-1"
                    >
                      Yes, I would recommend
                    </Button>
                    <Button
                      type="button"
                      variant={wouldRecommend === false ? 'solid' : 'outline'}
                      onClick={() => setWouldRecommend(false)}
                      className="flex-1"
                    >
                      No, I would not
                    </Button>
                  </Stack>
                </Card>

                <Stack direction="horizontal" gap={4}>
                  <Button type="submit" variant="solid" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Stack>

          <Stack>
            <Card className="p-6 sticky top-6">
              <H3 className="mb-4">REVIEWING</H3>
              {event.image && (
                <Figure className="relative h-40 bg-gray-100 mb-4 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </Figure>
              )}
              <Body className="font-bold">{event.title}</Body>
              <Body className="text-gray-600 text-sm">{event.date}</Body>
              <Body className="text-gray-500 text-sm">{event.venue}</Body>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    }>
      <NewReviewContent />
    </Suspense>
  );
}
