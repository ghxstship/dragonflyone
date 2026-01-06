"use client";

/**
 * Case Studies Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, featured stories, and case study grid
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Building2, ArrowRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  MarketingPage, HeroSection, StatsSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge, Spinner, Box,
  type StatItem} from "@ghxstship/ui";

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  summary: string;
  results: { metric: string; value: string }[];
  image: string;
  featured: boolean;
}

const DEMO_CASE_STUDIES: CaseStudy[] = [
  { id: "1", title: "How Festival Corp Managed 50K Attendees", company: "Festival Corp", industry: "Music Festivals", summary: "Learn how Festival Corp streamlined their production workflow and reduced costs by 40% while managing their largest event ever.", results: [{ metric: "Cost Reduction", value: "40%" }, { metric: "Time Saved", value: "200hrs" }, { metric: "Team Size", value: "150+" }], image: "/case-studies/festival.jpg", featured: true },
  { id: "2", title: "Corporate Events at Scale", company: "TechGiant Inc", industry: "Corporate Events", summary: "TechGiant manages 100+ corporate events annually with ATLVS, achieving unprecedented efficiency and cost savings.", results: [{ metric: "Events/Year", value: "100+" }, { metric: "Team Efficiency", value: "+60%" }, { metric: "Budget Saved", value: "$500K" }], image: "/case-studies/corporate.jpg", featured: true },
  { id: "3", title: "Theater Production Excellence", company: "Broadway Stars", industry: "Theater", summary: "Broadway Stars transformed their production management process, achieving 99% on-time delivery across 25 productions.", results: [{ metric: "Productions", value: "25" }, { metric: "On-Time Delivery", value: "99%" }], image: "/case-studies/theater.jpg", featured: false },
  { id: "4", title: "Sports Event Management", company: "Championship League", industry: "Sports", summary: "Managing major sporting events across multiple venues with real-time coordination and resource tracking.", results: [{ metric: "Venues", value: "12" }, { metric: "Attendees", value: "500K+" }], image: "/case-studies/sports.jpg", featured: false },
];

const INDUSTRIES = ["All", "Music Festivals", "Corporate Events", "Theater", "Sports"];

export default function CaseStudiesPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState("All");

  const { data: caseStudies = [], isLoading } = useQuery({
    queryKey: ["case-studies"],
    queryFn: async () => {
      const response = await fetch("/api/case-studies");
      if (!response.ok) return DEMO_CASE_STUDIES;
      const data = await response.json();
      return data.caseStudies?.length ? data.caseStudies : DEMO_CASE_STUDIES;
    },
  });

  const filteredStudies = selectedIndustry === "All" ? caseStudies : caseStudies.filter((cs: CaseStudy) => cs.industry === selectedIndustry);
  const featuredStudies = caseStudies.filter((cs: CaseStudy) => cs.featured);

  const stats: StatItem[] = [
    { id: "studies", value: caseStudies.length, label: "Case Studies", description: "Success stories" },
    { id: "industries", value: new Set(caseStudies.map((cs: CaseStudy) => cs.industry)).size, label: "Industries", description: "Sectors served" },
    { id: "customers", value: 1000, suffix: "+", label: "Happy Customers", description: "And counting" },
    { id: "events", value: 10000, suffix: "+", label: "Events Managed", description: "Successful productions" },
  ];

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      "Music Festivals": "bg-accent/20 text-accent border-accent/30",
      "Corporate Events": "bg-primary/20 text-primary border-primary/30",
      Theater: "bg-secondary/20 text-secondary border-secondary/30",
      Sports: "bg-success/20 text-success border-success/30",
    };
    return colors[industry] || "bg-surface-elevated text-text-muted border-border";
  };

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
              kicker="Success Stories"
              title="See How Teams Transform with ATLVS"
              description="Discover how leading organizations use ATLVS to streamline production workflows, reduce costs, and deliver exceptional experiences."
              primaryCta={{
                label: "Request a Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "View All Stories",
                onClick: () => document.getElementById("all-studies")?.scrollIntoView({ behavior: "smooth" }),
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
            <StatsSection
              stats={stats}
              background="primary"
              animate
            />
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
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Featured</Body>
                  <H3 className="text-text-primary">Top Success Stories</H3>
                  <Body className="text-text-muted max-w-2xl">Our most impactful customer transformations</Body>
                </Stack>

                <Stack gap={6}>
                  {featuredStudies.map((cs: CaseStudy) => (
                    <Card
                      key={cs.id}
                      className="p-8 border-2 border-primary/30 rounded-card pop-card-atlvs group"
                      onClick={() => router.push(`/case-studies/${cs.id}`)}
                    >
                      <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
                        <Box className="aspect-video bg-surface-elevated rounded-card overflow-hidden">
                          <Box className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Building2 className="size-16 text-text-disabled" />
                          </Box>
                        </Box>
                        <Stack gap={4}>
                          <Stack direction="horizontal" gap={2}>
                            <Badge className="bg-accent/20 text-accent border-accent/30">Featured</Badge>
                            <Badge className={getIndustryColor(cs.industry)}>{cs.industry}</Badge>
                          </Stack>
                          <Body className="text-text-primary font-weight-bold text-h4-md group-hover:text-primary transition-colors">{cs.title}</Body>
                          <Body className="text-text-disabled">{cs.company}</Body>
                          <Body className="text-text-muted">{cs.summary}</Body>
                          <Grid cols={3} gap={4} className="grid-cols-3 mt-2">
                            {cs.results.map((result, idx) => (
                              <Stack key={idx} gap={0} className="text-center p-3 bg-surface-elevated/50 rounded-card">
                                <Body className="text-primary font-weight-bold">{result.value}</Body>
                                <Body size="sm" className="text-text-disabled">{result.metric}</Body>
                              </Stack>
                            ))}
                          </Grid>
                          <Button variant="outline" className="w-fit group-hover:bg-primary group-hover:text-text-primary group-hover:border-primary transition-colors" icon={<ArrowRight className="size-4" />} iconPosition="right">
                            Read Case Study
                          </Button>
                        </Stack>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "all-studies",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">All Stories</Body>
                  <H3 className="text-text-primary">Browse by Industry</H3>
                </Stack>

                {/* Industry Filters */}
                <Stack direction="horizontal" gap={2} className="flex-wrap justify-center">
                  {INDUSTRIES.map((ind) => (
                    <Button
                      key={ind}
                      variant={selectedIndustry === ind ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedIndustry(ind)}
                    >
                      {ind}
                    </Button>
                  ))}
                </Stack>

                {/* Case Studies Grid */}
                {isLoading ? (
                  <Stack className="items-center py-12">
                    <Spinner size="lg" />
                    <Body className="text-text-muted mt-4">Loading case studies...</Body>
                  </Stack>
                ) : filteredStudies.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <FileText className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-text-primary font-weight-medium mb-2">No Case Studies Found</Body>
                    <Body className="text-text-muted mb-4">Check back soon for more success stories in this industry</Body>
                    <Button variant="outline" onClick={() => setSelectedIndustry("All")}>View All Industries</Button>
                  </Card>
                ) : (
                  <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                    {filteredStudies.map((cs: CaseStudy) => (
                      <Card
                        key={cs.id}
                        className="p-6 border-2 border-border rounded-card pop-card-atlvs group"
                        onClick={() => router.push(`/case-studies/${cs.id}`)}
                      >
                        <Stack gap={4}>
                          <Stack direction="horizontal" gap={2}>
                            {cs.featured && <Badge className="bg-accent/20 text-accent border-accent/30">Featured</Badge>}
                            <Badge className={getIndustryColor(cs.industry)}>{cs.industry}</Badge>
                          </Stack>
                          <Body className="text-text-primary font-weight-bold group-hover:text-primary transition-colors">{cs.title}</Body>
                          <Body size="sm" className="text-text-disabled">{cs.company}</Body>
                          <Body className="text-text-muted">{cs.summary}</Body>
                          <Stack direction="horizontal" gap={4} className="mt-2">
                            {cs.results.slice(0, 2).map((result, idx) => (
                              <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                                <TrendingUp className="size-4 text-success" />
                                <Body size="sm" className="text-primary font-weight-bold">{result.value}</Body>
                                <Body size="sm" className="text-text-secondary">{result.metric}</Body>
                              </Stack>
                            ))}
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
              title="Ready to Write Your Success Story?"
              description="Join thousands of production teams already using ATLVS to deliver exceptional experiences."
              primaryCta={{
                label: "Request a Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Sales",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Request a Demo",
        onClick: () => router.push("/demo"),
      }}
    />
  );
}
