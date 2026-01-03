"use client";

/**
 * Webinars Page - 2026 Landing Page Best Practices
 * Live and recorded webinar sessions
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Video, Calendar, Clock, Users, Play, ArrowRight, CheckCircle } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const WEBINAR_STATS = [
  { value: "100+", label: "Sessions" },
  { value: "25,000+", label: "Attendees" },
  { value: "4.8/5", label: "Rating" },
  { value: "Weekly", label: "New Content" },
];

const UPCOMING_WEBINARS = [
  {
    id: "1",
    title: "Production Planning 101: From Concept to Execution",
    date: "Jan 15, 2026",
    time: "2:00 PM EST",
    duration: "60 min",
    speaker: "Sarah Mitchell",
    role: "Head of Production",
    spots: 150,
    category: "Fundamentals",
  },
  {
    id: "2",
    title: "Advanced Financial Management for Productions",
    date: "Jan 22, 2026",
    time: "11:00 AM EST",
    duration: "90 min",
    speaker: "Michael Chen",
    role: "CFO, EventCorp",
    spots: 100,
    category: "Finance",
  },
  {
    id: "3",
    title: "Scaling Your Production Team Effectively",
    date: "Jan 29, 2026",
    time: "3:00 PM EST",
    duration: "45 min",
    speaker: "Emily Rodriguez",
    role: "Operations Director",
    spots: 200,
    category: "Operations",
  },
];

const FEATURED_RECORDINGS = [
  {
    id: "1",
    title: "2025 Year in Review: Industry Trends",
    views: 5200,
    duration: "75 min",
    category: "Industry",
  },
  {
    id: "2",
    title: "Building High-Performance Production Teams",
    views: 3800,
    duration: "60 min",
    category: "Leadership",
  },
  {
    id: "3",
    title: "Mastering Vendor Relationships",
    views: 2900,
    duration: "45 min",
    category: "Operations",
  },
  {
    id: "4",
    title: "Event Technology Deep Dive",
    views: 2400,
    duration: "90 min",
    category: "Technology",
  },
];

const WEBINAR_FEATURES: FeatureItem[] = [
  { id: "live", icon: <Video className="size-8" />, title: "Live Sessions", description: "Interactive webinars with Q&A and real-time engagement." },
  { id: "recordings", icon: <Play className="size-8" />, title: "On-Demand Library", description: "Access 100+ recorded sessions anytime, anywhere." },
  { id: "experts", icon: <Users className="size-8" />, title: "Industry Experts", description: "Learn from leading production professionals." },
  { id: "calendar", icon: <Calendar className="size-8" />, title: "Weekly Schedule", description: "New content every week covering diverse topics." },
];

const WEBINAR_TOPICS = [
  "Production Management",
  "Financial Planning",
  "Team Leadership",
  "Vendor Relations",
  "Event Technology",
  "Risk Management",
  "Client Relations",
  "Industry Trends",
];

export default function WebinarsPage() {
  const router = useRouter();

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Learn"
              title="Webinars"
              description="Join live sessions and access on-demand recordings from industry experts. Stay ahead with the latest production insights."
              primaryCta={{
                label: "Register Now",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "View Schedule",
                onClick: () => router.push("#upcoming"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <Container size="2xl" className="py-12">
              <Grid cols={4} gap={8} className="grid-cols-2 md:grid-cols-4">
                {WEBINAR_STATS.map((stat, idx) => (
                  <Stack key={idx} gap={1} className="text-center">
                    <Body className="text-white font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-white/80">{stat.label}</Body>
                  </Stack>
                ))}
              </Grid>
            </Container>
          ),
        },
        {
          id: "features",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Why Attend</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Webinar Benefits</Body>
                </Stack>
                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {WEBINAR_FEATURES.map((feature) => (
                    <Card key={feature.id} className="p-6 border-2 border-border rounded-card pop-card text-center">
                      <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                        {feature.icon}
                      </Box>
                      <Body className="text-white font-weight-bold mb-2">{feature.title}</Body>
                      <Body size="sm" className="text-text-muted">{feature.description}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "upcoming",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Live Sessions</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Upcoming Webinars</Body>
                  <Body className="text-text-muted">Register now to secure your spot</Body>
                </Stack>

                <Stack gap={4}>
                  {UPCOMING_WEBINARS.map((webinar) => (
                    <Card key={webinar.id} className="p-6 border-2 border-border rounded-card pop-card">
                      <Box className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <Box className="flex items-start gap-4">
                          <Box className="p-3 bg-primary/20 rounded-card shrink-0">
                            <Video className="size-6 text-primary" />
                          </Box>
                          <Box>
                            <Box className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{webinar.category}</Badge>
                            </Box>
                            <Body className="text-white font-weight-bold mb-1">{webinar.title}</Body>
                            <Body size="sm" className="text-text-muted">{webinar.speaker}, {webinar.role}</Body>
                          </Box>
                        </Box>
                        <Box className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                          <Box className="flex items-center gap-4 text-text-disabled">
                            <Box className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              <Body size="sm">{webinar.date}</Body>
                            </Box>
                            <Box className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <Body size="sm">{webinar.time}</Body>
                            </Box>
                          </Box>
                          <Box className="flex items-center gap-3">
                            <Badge variant="success">{webinar.spots} spots</Badge>
                            <Button variant="solid" size="sm">Register</Button>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>

                <Box className="text-center">
                  <Button variant="outline" icon={<Calendar className="size-4" />} iconPosition="right">
                    View Full Schedule
                  </Button>
                </Box>
              </Stack>
            </Container>
          ),
        },
        {
          id: "recordings",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">On-Demand</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Featured Recordings</Body>
                  <Body className="text-text-muted">Watch our most popular sessions anytime</Body>
                </Stack>

                <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {FEATURED_RECORDINGS.map((recording) => (
                    <Card key={recording.id} className="p-5 border-2 border-border rounded-card pop-card cursor-pointer group">
                      <Stack gap={3}>
                        <Box className="relative aspect-video bg-surface-elevated rounded-card flex items-center justify-center">
                          <Box className="p-3 bg-primary/20 rounded-avatar group-hover:bg-primary/40 transition-colors">
                            <Play className="size-8 text-primary" />
                          </Box>
                        </Box>
                        <Box>
                          <Badge variant="outline" className="mb-2">{recording.category}</Badge>
                          <Body className="text-white font-weight-medium">{recording.title}</Body>
                          <Box className="flex items-center gap-3 mt-2 text-text-disabled">
                            <Body size="sm">{recording.duration}</Body>
                            <Body size="sm">{recording.views.toLocaleString()} views</Body>
                          </Box>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Grid>

                <Box className="text-center">
                  <Button variant="outline" icon={<ArrowRight className="size-4" />} iconPosition="right">
                    Browse All Recordings
                  </Button>
                </Box>
              </Stack>
            </Container>
          ),
        },
        {
          id: "topics",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Coverage</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Topics We Cover</Body>
                </Stack>

                <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4">
                  {WEBINAR_TOPICS.map((topic, idx) => (
                    <Box key={idx} className="flex items-center gap-2 p-3 border-2 border-border rounded-card">
                      <CheckCircle className="size-5 text-success shrink-0" />
                      <Body size="sm" className="text-white">{topic}</Body>
                    </Box>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Never Miss a Session"
              description="Subscribe to get notified about upcoming webinars and new recordings."
              primaryCta={{
                label: "Subscribe Now",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "View Schedule",
                onClick: () => router.push("#upcoming"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
