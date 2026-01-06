"use client";

/**
 * Careers Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, job listings, benefits, and culture
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, MapPin, Clock, DollarSign, Heart, Users, Zap, Building2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  MarketingPage, HeroSection, FeatureGrid, StatsSection, CTABanner, Container, Stack, Card, Body, H3, Button, Badge, Spinner,
  type FeatureItem, type StatItem} from "@ghxstship/ui";

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary_range: string;
  posted_at: string;
}

const DEMO_JOBS: JobPosting[] = [
  { id: "1", title: "Senior Software Engineer", department: "Engineering", location: "Remote", type: "full-time", salary_range: "$150K - $200K", posted_at: "2024-12-10" },
  { id: "2", title: "Product Designer", department: "Design", location: "New York, NY", type: "full-time", salary_range: "$120K - $160K", posted_at: "2024-12-08" },
  { id: "3", title: "Customer Success Manager", department: "Customer Success", location: "Remote", type: "full-time", salary_range: "$80K - $110K", posted_at: "2024-12-05" },
  { id: "4", title: "DevOps Engineer", department: "Engineering", location: "San Francisco, CA", type: "full-time", salary_range: "$140K - $180K", posted_at: "2024-12-01" },
  { id: "5", title: "Marketing Manager", department: "Marketing", location: "Remote", type: "full-time", salary_range: "$90K - $130K", posted_at: "2024-11-28" },
];

const BENEFITS: FeatureItem[] = [
  { id: "health", icon: <Heart className="size-8" />, title: "Health & Wellness", description: "Comprehensive health, dental, and vision coverage for you and your family" },
  { id: "flexible", icon: <Clock className="size-8" />, title: "Flexible Hours", description: "Work when you are most productive with flexible scheduling" },
  { id: "remote", icon: <MapPin className="size-8" />, title: "Remote First", description: "Work from anywhere in the world with our distributed team" },
  { id: "pay", icon: <DollarSign className="size-8" />, title: "Competitive Pay", description: "Top-of-market compensation with equity packages" },
  { id: "learning", icon: <Zap className="size-8" />, title: "Learning Budget", description: "$2,000 annual budget for courses, conferences, and books" },
  { id: "team", icon: <Users className="size-8" />, title: "Team Events", description: "Regular team offsites and virtual events to stay connected" },
];

const DEPARTMENTS = ["All", "Engineering", "Design", "Customer Success", "Marketing", "Sales"];

export default function CareersPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["job-postings"],
    queryFn: async () => {
      const response = await fetch("/api/careers");
      if (!response.ok) return DEMO_JOBS;
      const data = await response.json();
      return data.jobs?.length ? data.jobs : DEMO_JOBS;
    },
  });

  const filteredJobs = selectedDepartment === "All" ? jobs : jobs.filter((job: JobPosting) => job.department === selectedDepartment);

  const formatDate = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const stats: StatItem[] = [
    { id: "positions", value: jobs.length, label: "Open Positions", description: "Across all departments" },
    { id: "departments", value: new Set(jobs.map((j: JobPosting) => j.department)).size, label: "Departments Hiring", description: "Growing teams" },
    { id: "remote", value: jobs.filter((j: JobPosting) => j.location === "Remote").length, label: "Remote Positions", description: "Work from anywhere" },
    { id: "team", value: 50, suffix: "+", label: "Team Members", description: "And growing fast" },
  ];

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
              kicker="Join Us"
              title="Build the Future of Production Management"
              description="Join a team of passionate people building tools that power the world's best live events. Remote-first, competitive pay, and meaningful work."
              primaryCta={{
                label: "View Open Positions",
                onClick: () => document.getElementById("openings")?.scrollIntoView({ behavior: "smooth" }),
              }}
              secondaryCta={{
                label: "Learn About Us",
                onClick: () => router.push("/about"),
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
          id: "openings",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Open Positions</Body>
                  <H3 className="text-text-primary">Find Your Next Role</H3>
                  <Body className="text-text-muted max-w-2xl">We are always looking for talented people to join our team. Check out our current openings below.</Body>
                </Stack>

                {/* Department Filters */}
                <Stack direction="horizontal" gap={2} className="flex-wrap justify-center">
                  {DEPARTMENTS.map((dept) => (
                    <Button
                      key={dept}
                      variant={selectedDepartment === dept ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDepartment(dept)}
                    >
                      {dept}
                    </Button>
                  ))}
                </Stack>

                {/* Job Listings */}
                {isLoading ? (
                  <Stack className="items-center py-12">
                    <Spinner size="lg" />
                    <Body className="text-text-muted mt-4">Loading positions...</Body>
                  </Stack>
                ) : filteredJobs.length === 0 ? (
                  <Card className="p-12 text-center border-2 border-border rounded-card">
                    <Briefcase className="size-16 text-text-disabled mx-auto mb-4" />
                    <Body className="text-text-primary font-weight-medium mb-2">No Open Positions</Body>
                    <Body className="text-text-muted mb-4">Check back soon for new opportunities in this department</Body>
                    <Button variant="outline" onClick={() => setSelectedDepartment("All")}>View All Positions</Button>
                  </Card>
                ) : (
                  <Stack gap={4}>
                    {filteredJobs.map((job: JobPosting) => (
                      <Card
                        key={job.id}
                        className="p-6 border-2 border-border rounded-card pop-card-atlvs group"
                        onClick={() => router.push(`/careers/${job.id}`)}
                      >
                        <Stack direction="horizontal" className="justify-between items-start flex-wrap gap-4">
                          <Stack gap={2}>
                            <Body className="text-text-primary font-weight-bold group-hover:text-primary transition-colors">{job.title}</Body>
                            <Stack direction="horizontal" gap={4} className="flex-wrap">
                              <Stack direction="horizontal" gap={1} className="items-center text-text-muted">
                                <Building2 className="size-4" />
                                <Body size="sm">{job.department}</Body>
                              </Stack>
                              <Stack direction="horizontal" gap={1} className="items-center text-text-muted">
                                <MapPin className="size-4" />
                                <Body size="sm">{job.location}</Body>
                              </Stack>
                              <Stack direction="horizontal" gap={1} className="items-center text-text-muted">
                                <DollarSign className="size-4" />
                                <Body size="sm">{job.salary_range}</Body>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <Badge variant="outline">{job.type}</Badge>
                            <Body size="sm" className="text-text-disabled">{formatDate(job.posted_at)}</Body>
                            <ArrowRight className="size-5 text-text-disabled group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Container>
          ),
        },
        {
          id: "benefits",
          background: "black",
          content: (
            <FeatureGrid
              kicker="Benefits"
              title="Why Work at ATLVS?"
              description="We offer competitive benefits to help you do your best work"
              features={BENEFITS}
              columns={3}
              variant="bordered"
              background="black"
              align="center"
            />
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Do Not See a Role That Fits?"
              description="We are always looking for talented people. Send us your resume and we will keep you in mind for future opportunities."
              primaryCta={{
                label: "Get in Touch",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Learn About Us",
                onClick: () => router.push("/about"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
