"use client";

/**
 * Features Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, feature grid, stats, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Calendar, Users, FileText, BarChart3, Shield, Globe, Zap, Smartphone, Clock } from "lucide-react";
import {
  MarketingPage,
  HeroSection,
  FeatureGrid,
  BentoGrid,
  StatsSection,
  CTABanner,
  type FeatureItem,
  type StatItem,
  type BentoItem,
} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  {
    id: "planning",
    icon: <Calendar className="size-8" />,
    title: "Production Planning",
    description: "Plan and manage every aspect of your productions with powerful scheduling tools",
    highlights: ["Timeline management", "Task scheduling", "Milestone tracking", "Resource allocation"],
  },
  {
    id: "collaboration",
    icon: <Users className="size-8" />,
    title: "Team Collaboration",
    description: "Work together seamlessly with your entire team in real-time",
    highlights: ["Real-time updates", "Comments & mentions", "File sharing", "Role-based access"],
  },
  {
    id: "documents",
    icon: <FileText className="size-8" />,
    title: "Document Management",
    description: "Keep all your production documents organized and accessible",
    highlights: ["Version control", "Template library", "Digital signatures", "Secure storage"],
  },
  {
    id: "analytics",
    icon: <BarChart3 className="size-8" />,
    title: "Analytics & Reporting",
    description: "Get insights into your production performance with powerful analytics",
    highlights: ["Custom dashboards", "Automated reports", "Budget tracking", "Performance metrics"],
  },
  {
    id: "security",
    icon: <Shield className="size-8" />,
    title: "Security & Compliance",
    description: "Enterprise-grade security to protect your sensitive production data",
    highlights: ["SOC 2 certified", "Data encryption", "SSO support", "Audit logs"],
  },
  {
    id: "integrations",
    icon: <Globe className="size-8" />,
    title: "Integrations",
    description: "Connect with your favorite tools and build custom workflows",
    highlights: ["100+ integrations", "API access", "Webhooks", "Custom workflows"],
  },
];

const BENTO_ITEMS: BentoItem[] = [
  {
    id: "speed",
    title: "Lightning Fast",
    description: "Optimized for speed and performance. Load times under 100ms.",
    icon: <Zap className="size-8 text-accent" />,
    size: "medium",
    background: "primary",
  },
  {
    id: "mobile",
    title: "Mobile Ready",
    description: "Access from any device, anywhere. Native apps for iOS and Android.",
    icon: <Smartphone className="size-8 text-primary" />,
    size: "small",
    background: "default",
  },
  {
    id: "security",
    title: "Enterprise Security",
    description: "Bank-level security with SOC 2 compliance and end-to-end encryption.",
    icon: <Shield className="size-8 text-success" />,
    size: "small",
    background: "default",
  },
  {
    id: "uptime",
    title: "99.99% Uptime",
    description: "Industry-leading reliability with redundant infrastructure across multiple regions.",
    icon: <Clock className="size-8 text-primary" />,
    size: "medium",
    background: "gradient",
  },
];

const STATS: StatItem[] = [
  { id: "events", value: 10000, suffix: "+", label: "Events Managed", description: "Productions delivered successfully" },
  { id: "users", value: 50000, suffix: "+", label: "Active Users", description: "Production professionals" },
  { id: "uptime", value: 99.99, suffix: "%", label: "Uptime", description: "Industry-leading reliability" },
  { id: "support", value: 24, suffix: "/7", label: "Support", description: "Always here to help" },
];

export default function FeaturesPage() {
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
              kicker="Platform"
              title="Everything You Need to Manage Productions"
              description="Powerful features designed for modern production teams. Plan, collaborate, and deliver exceptional experiences."
              primaryCta={{
                label: "Start Free Trial",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "highlights",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <BentoGrid
              kicker="Why ATLVS"
              title="Built for Production Excellence"
              description="The tools you need to deliver world-class productions"
              items={BENTO_ITEMS}
              background="ink"
            />
          ),
        },
        {
          id: "features",
          background: "black",
          content: (
            <FeatureGrid
              kicker="Features"
              title="Comprehensive Production Management"
              description="Every tool you need to plan, execute, and analyze your productions"
              features={FEATURES}
              columns={3}
              variant="bordered"
              background="black"
              pattern="halftone"
              align="center"
            />
          ),
        },
        {
          id: "stats",
          background: "primary",
          content: (
            <StatsSection
              kicker="By the Numbers"
              title="Trusted by Industry Leaders"
              stats={STATS}
              background="primary"
              animate
            />
          ),
        },
        {
          id: "cta",
          background: "ink",
          pattern: "stripes",
          content: (
            <CTABanner
              title="Ready to Transform Your Productions?"
              description="Join thousands of production teams already using ATLVS to deliver exceptional experiences."
              primaryCta={{
                label: "Start Free Trial",
                onClick: () => router.push("/auth/signup"),
              }}
              secondaryCta={{
                label: "Talk to Sales",
                onClick: () => router.push("/contact"),
              }}
              background="ink"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Get Started",
        onClick: () => router.push("/auth/signup"),
      }}
    />
  );
}
