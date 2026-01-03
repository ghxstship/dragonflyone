"use client";

/**
 * Investors Solution Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for investors
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { TrendingUp, Check, BarChart3, PieChart, FileText, Target, DollarSign } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3} from "@ghxstship/ui";

const FEATURES: FeatureItem[] = [
  { id: "portfolio", icon: <PieChart className="size-8" />, title: "Portfolio Tracking", description: "Track all your event industry investments in one comprehensive dashboard." },
  { id: "roi", icon: <TrendingUp className="size-8" />, title: "ROI Analytics", description: "Measure returns with detailed analytics and performance benchmarks." },
  { id: "reports", icon: <FileText className="size-8" />, title: "Investment Reports", description: "Generate professional reports for stakeholders and LPs." },
  { id: "dealflow", icon: <Target className="size-8" />, title: "Deal Flow Management", description: "Manage deal pipeline from sourcing to close with full tracking." },
  { id: "metrics", icon: <BarChart3 className="size-8" />, title: "Industry Metrics", description: "Access industry benchmarks and market intelligence." },
  { id: "returns", icon: <DollarSign className="size-8" />, title: "Return Tracking", description: "Track distributions, valuations, and IRR across your portfolio." },
];

const BENEFITS = [
  "Clear visibility",
  "Data-driven decisions",
  "Professional reporting",
  "Streamlined investments",
  "Industry benchmarks",
  "Deal tracking",
  "LP reporting",
  "Market intelligence",
  "Secure access",
];

const STATS = [
  { value: "$500M+", label: "AUM Tracked" },
  { value: "200+", label: "Investors" },
  { value: "25%", label: "Avg IRR" },
  { value: "Enterprise", label: "Security" },
];

export default function InvestorsSolutionPage() {
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
              kicker="For Investors"
              title="Invest in Live Events with Confidence"
              description="Specialized tools for investors in the live events industry. Track portfolios, analyze returns, and make data-driven decisions."
              primaryCta={{
                label: "Request Demo",
                onClick: () => router.push("/demo"),
              }}
              secondaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
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
          id: "features",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Features"
              title="Investment Management Tools"
              description="Everything you need to manage event industry investments"
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
                  <H3 className="text-white">Why Investors Choose ATLVS</H3>
                </Stack>

                <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3">
                  {BENEFITS.map((benefit, idx) => (
                    <Card key={idx} className="p-5 border-2 border-grey-800 rounded-card">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Check className="size-5 text-success flex-shrink-0" />
                        <Body className="text-white">{benefit}</Body>
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
              title="Ready to Optimize Your Event Investments?"
              description="See how ATLVS can help you make better investment decisions in the live events industry."
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
