"use client";

/**
 * Community Page - 2026 Landing Page Best Practices
 * User community and forums
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Users, MessageSquare, Star, Trophy, ExternalLink } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Stack, Box,
  type FeatureItem
} from "@ghxstship/ui";

const COMMUNITY_STATS = [
  { value: "5,000+", label: "Members" },
  { value: "2,500+", label: "Discussions" },
  { value: "1,200+", label: "Solutions" },
  { value: "24/7", label: "Active" },
];

const FEATURED_DISCUSSIONS = [
  { id: "1", title: "Best practices for large-scale productions", author: "Sarah M.", replies: 45, views: 1200 },
  { id: "2", title: "How to automate your workflow", author: "John D.", replies: 32, views: 890 },
  { id: "3", title: "Tips for team collaboration", author: "Emily R.", replies: 28, views: 750 },
  { id: "4", title: "Managing multi-venue events", author: "Mike T.", replies: 24, views: 680 },
];

const TOP_CONTRIBUTORS = [
  { name: "Alex Chen", points: 2500, badge: "Expert" },
  { name: "Maria Garcia", points: 1800, badge: "Pro" },
  { name: "James Wilson", points: 1500, badge: "Pro" },
  { name: "Sarah Kim", points: 1200, badge: "Rising Star" },
];

const COMMUNITY_FEATURES: FeatureItem[] = [
  { id: "forums", icon: <MessageSquare className="size-8" />, title: "Discussion Forums", description: "Ask questions, share knowledge, and connect with peers." },
  { id: "experts", icon: <Star className="size-8" />, title: "Expert Network", description: "Get advice from experienced production professionals." },
  { id: "events", icon: <Users className="size-8" />, title: "Community Events", description: "Join webinars, meetups, and virtual conferences." },
  { id: "rewards", icon: <Trophy className="size-8" />, title: "Recognition Program", description: "Earn badges and rewards for helping others." },
];

export default function CommunityPage() {
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
              kicker="Help"
              title="Community"
              description="Connect with thousands of ATLVS users. Share knowledge, get help, and grow together."
              primaryCta={{
                label: "Join Community",
                onClick: () => router.push("/signup"),
              }}
              secondaryCta={{
                label: "Browse Discussions",
                onClick: () => router.push("#discussions"),
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
                {COMMUNITY_STATS.map((stat, idx) => (
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
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Features</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Community Benefits</Body>
                </Stack>
                <Grid cols={4} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {COMMUNITY_FEATURES.map((feature) => (
                    <Card key={feature.id} className="p-6 border-2 border-border rounded-card pop-card text-center">
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
          id: "discussions",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Trending</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Featured Discussions</Body>
                </Stack>

                <Stack gap={4}>
                  {FEATURED_DISCUSSIONS.map((discussion) => (
                    <Card key={discussion.id} className="p-6 border-2 border-border rounded-card pop-card cursor-pointer">
                      <Box className="flex items-center justify-between">
                        <Box>
                          <Body className="text-white font-weight-medium">{discussion.title}</Body>
                          <Body size="sm" className="text-on-dark-muted">by {discussion.author}</Body>
                        </Box>
                        <Box className="flex items-center gap-6 text-on-dark-disabled">
                          <Body size="sm">{discussion.replies} replies</Body>
                          <Body size="sm">{discussion.views} views</Body>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Stack>

                <Box className="text-center">
                  <Button variant="outline" icon={<ExternalLink className="size-4" />} iconPosition="right">
                    View All Discussions
                  </Button>
                </Box>
              </Stack>
            </Container>
          ),
        },
        {
          id: "leaderboard",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Recognition</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Top Contributors</Body>
                  <Body className="text-on-dark-muted">Our most helpful community members</Body>
                </Stack>

                <Stack gap={4}>
                  {TOP_CONTRIBUTORS.map((contributor, idx) => (
                    <Card key={idx} className="p-5 border-2 border-border rounded-card">
                      <Box className="flex items-center gap-4">
                        <Box className="size-12 rounded-avatar bg-primary flex items-center justify-center text-white font-weight-bold text-h5-md">
                          #{idx + 1}
                        </Box>
                        <Box className="flex-1">
                          <Body className="text-white font-weight-medium">{contributor.name}</Body>
                          <Badge variant="outline">{contributor.badge}</Badge>
                        </Box>
                        <Box className="flex items-center gap-2">
                          <Trophy className="size-5 text-warning" />
                          <Body className="text-white font-weight-bold">{contributor.points} pts</Body>
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
              title="Ready to Join?"
              description="Become part of the ATLVS community and connect with production professionals worldwide."
              primaryCta={{
                label: "Join Community",
                onClick: () => router.push("/signup"),
              }}
              secondaryCta={{
                label: "Learn More",
                onClick: () => router.push("/help"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
