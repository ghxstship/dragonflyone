'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Field,
  Input,
  Textarea,
  Grid,
  Stack,
  Alert,
  LoadingSpinner,
  Figure,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
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

  const handleSubmit = async () => {
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
            className={`text-h5-md p-1 ${star <= rating ? 'text-warning-500' : 'text-ink-600'}`}
            onClick={() => setRating(star)}
          >
            ★
          </Button>
        ))}
      </Stack>
    </Stack>
  );

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Reviews">
        <FooterLink href="/reviews">Reviews</FooterLink>
        <FooterLink href="/my-events">My Events</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  if (loading) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Section>
      </PageLayout>
    );
  }

  if (!event) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <Card inverted className="p-12 text-center mt-12">
              <H2 className="mb-4 text-white">Event Not Found</H2>
              <Body className="text-on-dark-muted mb-6">
                Please select an event to review.
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/my-events')}>
                View My Events
              </Button>
            </Card>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (success) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <Card inverted className="p-12 text-center mt-12">
              <H2 className="mb-4 text-white">Thank You!</H2>
              <Body className="text-on-dark-muted mb-6">
                Your review has been submitted successfully.
              </Body>
              <LoadingSpinner size="sm" />
            </Card>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
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
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Reviews</Kicker>
              <H2 size="lg" className="text-white">Write a Review</H2>
              <Body className="text-on-dark-muted">Share your experience</Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2">
            <Form onSubmit={handleSubmit}>
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
                  <Body className="text-ink-600 mb-4">
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
            </Form>
          </Stack>

          <Stack>
            <Card className="p-6 sticky top-6">
              <H3 className="mb-4">REVIEWING</H3>
              {event.image && (
                <Figure className="relative h-40 bg-ink-100 mb-4 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </Figure>
              )}
              <Body className="font-bold">{event.title}</Body>
              <Body className="text-ink-600 text-body-sm">{event.date}</Body>
              <Body className="text-ink-500 text-body-sm">{event.venue}</Body>
            </Card>
          </Stack>
        </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}

export default function NewReviewPage() {
  const fallbackFooter = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Reviews">
        <FooterLink href="/reviews">Reviews</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  return (
    <Suspense fallback={
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={fallbackFooter}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Section>
      </PageLayout>
    }>
      <NewReviewContent />
    </Suspense>
  );
}
