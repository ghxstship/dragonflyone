"use client";

/**
 * Guides Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, guide categories, and featured tutorials
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book, Clock, Star, ArrowRight, Search } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge, Input} from "@ghxstship/ui";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  featured: boolean;
}

const DEMO_GUIDES: Guide[] = [
  { id: "1", title: "Getting Started with ATLVS", description: "Learn the basics of production management and navigate the platform with confidence.", category: "Basics", difficulty: "beginner", duration: "15 min", featured: true },
  { id: "2", title: "Creating Your First Production", description: "Step-by-step guide to setting up a production from scratch with all essential elements.", category: "Basics", difficulty: "beginner", duration: "20 min", featured: true },
  { id: "3", title: "Team Collaboration Best Practices", description: "How to work effectively with your team using real-time collaboration features.", category: "Collaboration", difficulty: "intermediate", duration: "25 min", featured: false },
  { id: "4", title: "Advanced Workflow Automation", description: "Automate repetitive tasks and workflows to save time and reduce errors.", category: "Automation", difficulty: "advanced", duration: "30 min", featured: false },
  { id: "5", title: "Budget Management Guide", description: "Track and manage production budgets with real-time cost monitoring.", category: "Finance", difficulty: "intermediate", duration: "20 min", featured: false },
  { id: "6", title: "Reporting and Analytics", description: "Generate actionable insights from your production data with custom reports.", category: "Analytics", difficulty: "intermediate", duration: "25 min", featured: true },
];

const CATEGORIES = ["All", "Basics", "Collaboration", "Automation", "Finance", "Analytics"];

const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner", color: "bg-success/20 text-success border-success/30" },
  intermediate: { label: "Intermediate", color: "bg-accent/20 text-accent border-accent/30" },
  advanced: { label: "Advanced", color: "bg-error/20 text-error border-error/30" },
};

export default function GuidesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGuides = DEMO_GUIDES.filter((guide) => {
    const matchesSearch = !search || guide.title.toLowerCase().includes(search.toLowerCase()) || guide.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredGuides = DEMO_GUIDES.filter((g) => g.featured);

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
              title="Guides & Tutorials"
              description="Step-by-step guides to help you get the most out of ATLVS. From beginner basics to advanced automation."
              primaryCta={{
                label: "Start Learning",
                onClick: () => document.getElementById("guides")?.scrollIntoView({ behavior: "smooth" }),
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
          id: "featured",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Featured</Body>
                  <H3 className="text-white">Popular Guides</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Our most popular tutorials to get you started quickly.</Body>
                </Stack>

                <Stack gap={6}>
                  {featuredGuides.map((guide) => (
                    <Card
                      key={guide.id}
                      className="p-8 border-2 border-primary/30 rounded-card cursor-pointer hover:border-primary/50 transition-all group"
                      onClick={() => router.push(`/guides/${guide.id}`)}
                    >
                      <Stack direction="horizontal" className="justify-between items-center gap-6 flex-wrap">
                        <Stack direction="horizontal" gap={6} className="items-center">
                          <div className="p-4 bg-primary/20 rounded-card group-hover:bg-primary group-hover:text-white transition-all">
                            <Star className="size-8 text-primary group-hover:text-white transition-colors" />
                          </div>
                          <Stack gap={2}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Badge variant="outline">{guide.category}</Badge>
                              <Badge className={DIFFICULTY_CONFIG[guide.difficulty].color}>{DIFFICULTY_CONFIG[guide.difficulty].label}</Badge>
                              <Stack direction="horizontal" gap={1} className="items-center text-on-dark-disabled">
                                <Clock className="size-4" />
                                <Body size="sm">{guide.duration}</Body>
                              </Stack>
                            </Stack>
                            <Body className="text-white font-weight-bold text-h5-md group-hover:text-primary transition-colors">{guide.title}</Body>
                            <Body className="text-on-dark-muted">{guide.description}</Body>
                          </Stack>
                        </Stack>
                        <Button variant="solid" icon={<ArrowRight className="size-4" />} iconPosition="right">
                          Start Guide
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "guides",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">All Guides</Body>
                  <H3 className="text-white">Browse Tutorials</H3>
                </Stack>

                {/* Search and Filters */}
                <Card className="p-4 border-2 border-grey-800 rounded-card">
                  <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
                    <div className="flex-1 min-w-[200px] relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                      <Input
                        placeholder="Search guides..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? "solid" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                {/* Guides Grid */}
                {filteredGuides.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-grey-800 rounded-card">
                    <Book className="size-16 text-on-dark-disabled mx-auto mb-4" />
                    <Body className="text-white font-weight-medium mb-2">No Guides Found</Body>
                    <Body className="text-on-dark-muted mb-4">Try a different search term or category</Body>
                    <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory("All"); }}>Clear Filters</Button>
                  </Card>
                ) : (
                  <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                    {filteredGuides.map((guide) => (
                      <Card
                        key={guide.id}
                        className="p-6 border-2 border-grey-800 rounded-card cursor-pointer hover:border-primary/50 transition-all group"
                        onClick={() => router.push(`/guides/${guide.id}`)}
                      >
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="justify-between items-start">
                            <Badge variant="outline">{guide.category}</Badge>
                            <Badge className={DIFFICULTY_CONFIG[guide.difficulty].color}>{DIFFICULTY_CONFIG[guide.difficulty].label}</Badge>
                          </Stack>
                          <Stack gap={2}>
                            <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{guide.title}</Body>
                            <Body className="text-on-dark-muted">{guide.description}</Body>
                          </Stack>
                          <Stack direction="horizontal" className="justify-between items-center">
                            <Stack direction="horizontal" gap={2} className="items-center text-on-dark-disabled">
                              <Clock className="size-4" />
                              <Body size="sm">{guide.duration}</Body>
                            </Stack>
                            <Button variant="ghost" size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right" className="group-hover:text-primary">
                              Read
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Need Personalized Training?"
              description="Our team offers personalized onboarding and training sessions to help your team get up to speed quickly."
              primaryCta={{
                label: "Schedule Training",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
