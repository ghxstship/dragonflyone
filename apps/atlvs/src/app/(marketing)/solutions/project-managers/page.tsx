"use client";

/**
 * Project Managers Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for project managers
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { ClipboardList, Check, Calendar, Users, BarChart3, Target, DollarSign } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "tasks", icon: <ClipboardList className="size-8" />, title: "Task Management", description: "Create, assign, and track tasks with dependencies and deadlines." },
  { id: "timeline", icon: <Calendar className="size-8" />, title: "Timeline Planning", description: "Visual timelines with milestones, critical path, and Gantt views." },
  { id: "resources", icon: <Users className="size-8" />, title: "Resource Allocation", description: "Allocate team members and track utilization across projects." },
  { id: "progress", icon: <BarChart3 className="size-8" />, title: "Progress Tracking", description: "Real-time dashboards showing project health and status." },
  { id: "budget", icon: <DollarSign className="size-8" />, title: "Budget Management", description: "Track budgets, actuals, and forecasts with variance analysis." },
  { id: "goals", icon: <Target className="size-8" />, title: "Goal Tracking", description: "Set and track project goals with OKR and KPI frameworks." },
];

const BENEFITS = [
  "Clear visibility",
  "On-time delivery",
  "Resource optimization",
  "Stakeholder alignment",
  "Budget control",
  "Risk management",
  "Team coordination",
  "Reporting automation",
  "Mobile access",
];

const STATS = [
  { value: "8K+", label: "Project Managers" },
  { value: "50K+", label: "Projects Delivered" },
  { value: "95%", label: "On-Time Rate" },
  { value: "40%", label: "Efficiency Gain" },
];

export default function ProjectManagersSolutionPage() {
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
              kicker="For Project Managers"
              title="Deliver Projects On Time, Every Time"
              description="Specialized tools for project managers in the live events industry. Plan, track, and deliver with confidence."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "View Pricing",
                onClick: () => router.push("/pricing"),
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
                    <Body className="text-text-primary font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-text-primary/80">{stat.label}</Body>
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
            <FeatureGrid
              kicker="Features"
              title="Project Management Tools"
              description="Everything you need to manage successful projects"
              features={FEATURES}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "benefits",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Benefits</Body>
                  <H3 className="text-text-primary">Why PMs Choose ATLVS</H3>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <Card key={idx} className="p-5 border-2 border-border rounded-card">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Check className="size-5 text-success flex-shrink-0" />
                        <Body className="text-text-primary">{benefit}</Body>
                      </Stack>
                    </Card>
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
              title="Ready to Transform Your Project Management?"
              description="See how ATLVS can help you deliver projects on time and on budget."
              primaryCta={{
                label: "Schedule a Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Sales",
                onClick: () => router.push("/contact"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
