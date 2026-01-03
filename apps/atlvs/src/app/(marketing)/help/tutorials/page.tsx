"use client";

/**
 * Tutorials Page - 2026 Landing Page Best Practices
 * Video tutorials and guides
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Clock, Star, Search } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Badge, Body, Button, Card, Grid, Input, Stack, Box
} from "@ghxstship/ui";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured: boolean;
}

const TUTORIALS: Tutorial[] = [
  { id: "1", title: "Platform Overview", description: "A complete tour of the ATLVS platform", duration: "10 min", category: "Getting Started", difficulty: "beginner", featured: true },
  { id: "2", title: "Creating Your First Project", description: "Step-by-step project creation guide", duration: "8 min", category: "Getting Started", difficulty: "beginner", featured: true },
  { id: "3", title: "Team Collaboration", description: "How to work with your team effectively", duration: "12 min", category: "Collaboration", difficulty: "intermediate", featured: false },
  { id: "4", title: "Advanced Workflows", description: "Automate your production workflows", duration: "15 min", category: "Advanced", difficulty: "advanced", featured: false },
  { id: "5", title: "Reporting & Analytics", description: "Generate insights from your data", duration: "10 min", category: "Analytics", difficulty: "intermediate", featured: true },
  { id: "6", title: "Integrations Setup", description: "Connect third-party tools", duration: "8 min", category: "Integrations", difficulty: "intermediate", featured: false },
];

const CATEGORIES = ["All", "Getting Started", "Collaboration", "Advanced", "Analytics", "Integrations"];
const DIFFICULTY_COLORS = { beginner: "success", intermediate: "warning", advanced: "error" } as const;

const STATS = [
  { value: "6+", label: "Video Tutorials" },
  { value: "60+", label: "Minutes of Content" },
  { value: "Free", label: "Access" },
  { value: "HD", label: "Quality" },
];

export default function TutorialsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTutorials = TUTORIALS.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTutorials = TUTORIALS.filter((t) => t.featured);

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
              title="Video Tutorials"
              description="Learn ATLVS with step-by-step video guides. From basics to advanced workflows."
              primaryCta={{
                label: "Start Learning",
                onClick: () => router.push("#tutorials"),
              }}
              secondaryCta={{
                label: "View Documentation",
                onClick: () => router.push("/docs"),
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
                {STATS.map((stat, idx) => (
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
          id: "featured",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Popular</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Featured Tutorials</Body>
                  <Body className="text-text-muted">Our most popular video guides</Body>
                </Stack>

                <Stack gap={6}>
                  {featuredTutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="p-6 border-2 border-border rounded-card pop-card cursor-pointer">
                      <Box className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                        <Box className="w-full md:w-48 aspect-video bg-surface-elevated rounded-card flex items-center justify-center flex-shrink-0">
                          <Play className="size-10 text-text-muted" />
                        </Box>
                        <Box className="flex-1">
                          <Box className="flex items-center gap-2 mb-2 flex-wrap">
                            <Star className="size-4 text-warning" />
                            <Badge variant="outline">{tutorial.category}</Badge>
                            <Badge variant={DIFFICULTY_COLORS[tutorial.difficulty]}>{tutorial.difficulty}</Badge>
                          </Box>
                          <Body className="text-white font-weight-bold">{tutorial.title}</Body>
                          <Body className="text-text-muted mb-2">{tutorial.description}</Body>
                          <Box className="flex items-center gap-2 text-text-disabled">
                            <Clock className="size-4" />
                            <Body size="sm">{tutorial.duration}</Body>
                          </Box>
                        </Box>
                        <Button variant="solid" icon={<Play className="size-4" />} iconPosition="left">Watch</Button>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "tutorials",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Browse</Body>
                  <Body className="text-white font-weight-bold text-h3-md">All Tutorials</Body>
                </Stack>

                <Card className="p-6 border-2 border-border rounded-card">
                  <Stack gap={4}>
                    <Box className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-muted" />
                      <Input placeholder="Search tutorials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-12 h-14" />
                    </Box>
                    <Box className="flex gap-2 flex-wrap">
                      {CATEGORIES.map((cat) => (
                        <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                          {cat}
                        </Button>
                      ))}
                    </Box>
                  </Stack>
                </Card>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="p-6 border-2 border-border rounded-card pop-card cursor-pointer">
                      <Box className="aspect-video bg-surface-elevated rounded-card flex items-center justify-center mb-4">
                        <Play className="size-10 text-text-muted" />
                      </Box>
                      <Box className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline">{tutorial.category}</Badge>
                        <Badge variant={DIFFICULTY_COLORS[tutorial.difficulty]}>{tutorial.difficulty}</Badge>
                      </Box>
                      <Body className="text-white font-weight-bold">{tutorial.title}</Body>
                      <Body size="sm" className="text-text-muted mb-2">{tutorial.description}</Body>
                      <Box className="flex items-center gap-2 text-text-disabled">
                        <Clock className="size-4" />
                        <Body size="sm">{tutorial.duration}</Body>
                      </Box>
                    </Card>
                  ))}
                </Grid>

                {filteredTutorials.length === 0 && (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <Play className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-bold mb-2">No Tutorials Found</Body>
                    <Body className="text-text-muted mb-4">Try a different search term or category</Body>
                    <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>Clear Filters</Button>
                  </Card>
                )}
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
              title="Need More Help?"
              description="Our support team is available to answer your questions and guide you through ATLVS."
              primaryCta={{
                label: "Contact Support",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Help Center",
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
