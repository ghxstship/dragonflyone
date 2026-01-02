"use client";

/**
 * Training Page - 2026 Landing Page Best Practices
 * Certification programs and training resources
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { GraduationCap, Award, BookOpen, Video, Clock, CheckCircle, ArrowRight } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const TRAINING_STATS = [
  { value: "50+", label: "Courses" },
  { value: "10,000+", label: "Certified Users" },
  { value: "4.9/5", label: "Rating" },
  { value: "Free", label: "Basic Tier" },
];

const CERTIFICATION_TRACKS = [
  {
    id: "fundamentals",
    title: "ATLVS Fundamentals",
    level: "Beginner",
    duration: "4 hours",
    modules: 8,
    description: "Master the basics of production management with ATLVS.",
    topics: ["Dashboard Navigation", "Project Setup", "Contact Management", "Basic Reporting"],
  },
  {
    id: "professional",
    title: "ATLVS Professional",
    level: "Intermediate",
    duration: "12 hours",
    modules: 16,
    description: "Advanced workflows and team collaboration features.",
    topics: ["Advanced Workflows", "Financial Management", "Asset Tracking", "Team Collaboration"],
  },
  {
    id: "expert",
    title: "ATLVS Expert",
    level: "Advanced",
    duration: "20 hours",
    modules: 24,
    description: "Enterprise features, integrations, and custom solutions.",
    topics: ["API Integration", "Custom Workflows", "Analytics & BI", "Enterprise Security"],
  },
];

const TRAINING_FEATURES: FeatureItem[] = [
  { id: "self-paced", icon: <Clock className="size-8" />, title: "Self-Paced Learning", description: "Learn at your own speed with on-demand video content." },
  { id: "certification", icon: <Award className="size-8" />, title: "Industry Certification", description: "Earn recognized credentials to boost your career." },
  { id: "resources", icon: <BookOpen className="size-8" />, title: "Comprehensive Resources", description: "Access guides, templates, and best practices." },
  { id: "live", icon: <Video className="size-8" />, title: "Live Workshops", description: "Join interactive sessions with industry experts." },
];

const UPCOMING_WORKSHOPS = [
  { id: "1", title: "Production Planning Masterclass", date: "Jan 15, 2026", time: "2:00 PM EST", spots: 25 },
  { id: "2", title: "Financial Management Deep Dive", date: "Jan 22, 2026", time: "11:00 AM EST", spots: 30 },
  { id: "3", title: "Advanced Reporting Workshop", date: "Jan 29, 2026", time: "3:00 PM EST", spots: 20 },
];

export default function TrainingPage() {
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
              title="Training & Certification"
              description="Master ATLVS with comprehensive training programs. Earn industry-recognized certifications and advance your career."
              primaryCta={{
                label: "Start Learning",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "View Courses",
                onClick: () => router.push("#tracks"),
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
            <Container size="xl" className="py-12">
              <Grid cols={4} gap={8} className="grid-cols-2 md:grid-cols-4">
                {TRAINING_STATS.map((stat, idx) => (
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
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Why Train With Us</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Learning Benefits</Body>
                </Stack>
                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {TRAINING_FEATURES.map((feature) => (
                    <Card key={feature.id} className="p-6 border-2 border-grey-800 rounded-card pop-card text-center">
                      <Box className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                        {feature.icon}
                      </Box>
                      <Body className="text-white font-weight-bold mb-2">{feature.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">{feature.description}</Body>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "tracks",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Certification Paths</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Choose Your Track</Body>
                  <Body className="text-on-dark-muted max-w-2xl">Progress through our structured certification program to become an ATLVS expert.</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
                  {CERTIFICATION_TRACKS.map((track) => (
                    <Card key={track.id} className="p-6 border-2 border-grey-800 rounded-card pop-card">
                      <Stack gap={4}>
                        <Box className="flex items-center justify-between">
                          <GraduationCap className="size-10 text-primary" />
                          <Badge variant={track.level === "Beginner" ? "success" : track.level === "Intermediate" ? "warning" : "error"}>
                            {track.level}
                          </Badge>
                        </Box>
                        <Stack gap={2}>
                          <Body className="text-white font-weight-bold text-h5-md">{track.title}</Body>
                          <Body size="sm" className="text-on-dark-muted">{track.description}</Body>
                        </Stack>
                        <Box className="flex items-center gap-4 text-on-dark-disabled">
                          <Box className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <Body size="sm">{track.duration}</Body>
                          </Box>
                          <Box className="flex items-center gap-1">
                            <BookOpen className="size-4" />
                            <Body size="sm">{track.modules} modules</Body>
                          </Box>
                        </Box>
                        <Stack gap={2}>
                          <Body size="sm" className="text-on-dark-secondary font-weight-medium">Topics covered:</Body>
                          {track.topics.map((topic, idx) => (
                            <Box key={idx} className="flex items-center gap-2">
                              <CheckCircle className="size-4 text-success" />
                              <Body size="sm" className="text-on-dark-muted">{topic}</Body>
                            </Box>
                          ))}
                        </Stack>
                        <Button variant="outline" fullWidth icon={<ArrowRight className="size-4" />} iconPosition="right">
                          Start Track
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "workshops",
          background: "ink",
          content: (
            <Container size="lg" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Live Learning</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Upcoming Workshops</Body>
                  <Body className="text-on-dark-muted">Join live sessions with industry experts</Body>
                </Stack>

                <Stack gap={4}>
                  {UPCOMING_WORKSHOPS.map((workshop) => (
                    <Card key={workshop.id} className="p-5 border-2 border-grey-800 rounded-card">
                      <Box className="flex items-center justify-between flex-wrap gap-4">
                        <Box className="flex items-center gap-4">
                          <Box className="p-3 bg-primary/20 rounded-card">
                            <Video className="size-6 text-primary" />
                          </Box>
                          <Box>
                            <Body className="text-white font-weight-medium">{workshop.title}</Body>
                            <Body size="sm" className="text-on-dark-muted">{workshop.date} at {workshop.time}</Body>
                          </Box>
                        </Box>
                        <Box className="flex items-center gap-4">
                          <Badge variant="outline">{workshop.spots} spots left</Badge>
                          <Button variant="solid" size="sm">Register</Button>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>
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
              title="Start Your Learning Journey"
              description="Get certified and join thousands of production professionals who have advanced their careers with ATLVS training."
              primaryCta={{
                label: "Enroll Now",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "View All Courses",
                onClick: () => router.push("/guides"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
