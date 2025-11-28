'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Figure,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Kicker,
} from '@ghxstship/ui';
import Image from 'next/image';

interface SetlistItem {
  id: string;
  order: number;
  title: string;
  artist?: string;
  duration?: string;
  notes?: string;
  is_encore?: boolean;
}

interface ProgramSection {
  id: string;
  title: string;
  start_time?: string;
  description?: string;
  items: SetlistItem[];
}

interface EventProgram {
  event_id: string;
  event_title: string;
  event_date: string;
  venue_name: string;
  program_notes?: string;
  sections: ProgramSection[];
  performers: {
    id: string;
    name: string;
    role?: string;
    image?: string;
    bio?: string;
  }[];
  sponsors?: {
    name: string;
    logo?: string;
    tier: string;
  }[];
}

export default function EventProgramPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [program, setProgram] = useState<EventProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const fetchProgram = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/program`);
      if (response.ok) {
        const data = await response.json();
        setProgram(data.program);
        if (data.program?.sections?.length > 0) {
          setActiveSection(data.program.sections[0].id);
        }
      } else {
        setError('Program not available');
      }
    } catch (err) {
      setError('Failed to load program');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Events">
        <FooterLink href="/events">Events</FooterLink>
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
          <LoadingSpinner size="lg" />
        </Section>
      </PageLayout>
    );
  }

  if (!program) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <Card inverted className="p-12 text-center mt-12">
              <H2 className="mb-4 text-white">PROGRAM NOT AVAILABLE</H2>
              <Body className="text-on-dark-muted mb-6">
                The program for this event is not yet available.
              </Body>
              <Button variant="solid" inverted onClick={() => router.back()}>
                Go Back
              </Button>
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
              <Kicker colorScheme="on-dark">Events</Kicker>
              <Body className="text-on-dark-muted">{program.event_date}</Body>
              <H2 size="lg" className="text-white">{program.event_title}</H2>
              <Body className="text-on-dark-muted">{program.venue_name}</Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            {program.program_notes && (
              <Card className="p-6 bg-ink-50">
                <Body>{program.program_notes}</Body>
              </Card>
            )}

            <Card className="p-6">
              <H2 className="mb-6">PROGRAM</H2>
              
              {program.sections.length > 1 && (
                <Stack direction="horizontal" gap={2} className="mb-6 overflow-x-auto pb-2">
                  {program.sections.map(section => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'solid' : 'outline'}
                      onClick={() => setActiveSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  ))}
                </Stack>
              )}

              {program.sections
                .filter(s => !activeSection || s.id === activeSection || program.sections.length === 1)
                .map(section => (
                  <Stack key={section.id} gap={4} className="mb-8 last:mb-0">
                    <Stack direction="horizontal" className="justify-between items-center border-b-2 border-black pb-2">
                      <H3>{section.title}</H3>
                      {section.start_time && (
                        <Badge variant="outline">{section.start_time}</Badge>
                      )}
                    </Stack>

                    {section.description && (
                      <Body className="text-ink-600">{section.description}</Body>
                    )}

                    <Stack gap={2}>
                      {section.items.map((item, index) => (
                        <Stack
                          key={item.id}
                          direction="horizontal"
                          className={`py-3 border-b border-ink-100 last:border-0 ${
                            item.is_encore ? 'bg-warning-50 -mx-2 px-2' : ''
                          }`}
                        >
                          <Body className="w-8 text-ink-600 font-mono">
                            {item.order || index + 1}
                          </Body>
                          <Stack className="flex-1">
                            <Body className="font-medium">
                              {item.title}
                              {item.is_encore && (
                                <Badge className="ml-2 bg-warning-500 text-white text-mono-xs">
                                  ENCORE
                                </Badge>
                              )}
                            </Body>
                            {item.artist && (
                              <Body className="text-body-sm text-ink-500">{item.artist}</Body>
                            )}
                            {item.notes && (
                              <Body className="text-mono-xs text-ink-600 mt-1">{item.notes}</Body>
                            )}
                          </Stack>
                          {item.duration && (
                            <Body className="text-body-sm text-ink-600">{item.duration}</Body>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                ))}
            </Card>
          </Stack>

          <Stack gap={6}>
            {program.performers.length > 0 && (
              <Card className="p-6">
                <H3 className="mb-4">PERFORMERS</H3>
                <Stack gap={4}>
                  {program.performers.map(performer => (
                    <Stack key={performer.id} direction="horizontal" gap={3}>
                      {performer.image && (
                        <Figure className="relative w-12 h-12 bg-ink-100 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={performer.image}
                            alt={performer.name}
                            fill
                            className="object-cover"
                          />
                        </Figure>
                      )}
                      <Stack>
                        <Body className="font-medium">{performer.name}</Body>
                        {performer.role && (
                          <Body className="text-body-sm text-ink-500">{performer.role}</Body>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}

            {program.sponsors && program.sponsors.length > 0 && (
              <Card className="p-6">
                <H3 className="mb-4">SPONSORS</H3>
                <Stack gap={3}>
                  {program.sponsors.map((sponsor, index) => (
                    <Stack key={index} direction="horizontal" gap={3} className="items-center">
                      {sponsor.logo && (
                        <Figure className="relative w-16 h-8 bg-ink-100 flex items-center justify-center">
                          <Image
                            src={sponsor.logo}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </Figure>
                      )}
                      <Stack>
                        <Body className="text-body-sm">{sponsor.name}</Body>
                        <Body className="text-mono-xs text-ink-600">{sponsor.tier}</Body>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            )}

            <Card className="p-6 bg-black text-white">
              <H3 className="text-white mb-4">SHARE PROGRAM</H3>
              <Body className="text-ink-600 mb-4">
                Share this program with friends
              </Body>
              <Button
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-black"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: program.event_title,
                      text: `Check out the program for ${program.event_title}`,
                      url: window.location.href,
                    });
                  }
                }}
              >
                Share
              </Button>
            </Card>
          </Stack>
        </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
