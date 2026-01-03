"use client";

/**
 * Products Page - 2026 Landing Page Best Practices
 * Full-width marketing layout showcasing the product suite
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Zap, Users, Ticket, ArrowRight, Check } from "lucide-react";
import {
  MarketingPage, HeroSection, ComparisonTable, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Box,
  type ComparisonColumn, type ComparisonRow} from "@ghxstship/ui";

const PRODUCTS = [
  {
    id: "atlvs",
    name: "ATLVS",
    tagline: "Production Management",
    description: "Complete production management platform for live events. Plan, collaborate, and deliver exceptional productions.",
    icon: <Zap className="size-10" />,
    href: "/products/atlvs",
    color: "primary",
    features: ["Production planning & scheduling", "Team collaboration tools", "Document management", "Budget tracking & reporting", "Resource allocation", "Timeline management"],
  },
  {
    id: "compvss",
    name: "COMPVSS",
    tagline: "Crew Management",
    description: "Comprehensive crew and talent management solution. Schedule, track, and pay your production team efficiently.",
    icon: <Users className="size-10" />,
    href: "/products/compvss",
    color: "secondary",
    features: ["Crew scheduling & dispatch", "Talent database & profiles", "Availability tracking", "Payroll integration", "Time & attendance", "Certification tracking"],
  },
  {
    id: "gvteway",
    name: "GVTEWAY",
    tagline: "Ticketing & Access",
    description: "Modern ticketing and access control platform. Sell tickets, manage access, and delight your audience.",
    icon: <Ticket className="size-10" />,
    href: "/products/gvteway",
    color: "accent",
    features: ["Ticket sales & distribution", "Access control & scanning", "Event discovery platform", "Real-time analytics", "Customer management", "Marketing tools"],
  },
];

const COMPARISON_COLUMNS: ComparisonColumn[] = [
  { id: "atlvs", name: "ATLVS", price: "From $29/mo" },
  { id: "compvss", name: "COMPVSS", price: "From $49/mo" },
  { id: "gvteway", name: "GVTEWAY", price: "From $99/mo" },
];

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: "Production Planning", category: "Core Features", values: { atlvs: true, compvss: false, gvteway: false } },
  { feature: "Crew Scheduling", category: "Core Features", values: { atlvs: false, compvss: true, gvteway: false } },
  { feature: "Ticket Sales", category: "Core Features", values: { atlvs: false, compvss: false, gvteway: true } },
  { feature: "Team Collaboration", category: "Collaboration", values: { atlvs: true, compvss: true, gvteway: "partial" } },
  { feature: "Document Management", category: "Collaboration", values: { atlvs: true, compvss: "partial", gvteway: false } },
  { feature: "Budget Tracking", category: "Financial", values: { atlvs: true, compvss: false, gvteway: "partial" } },
  { feature: "Payroll Integration", category: "Financial", values: { atlvs: false, compvss: true, gvteway: false } },
  { feature: "Analytics Dashboard", category: "Reporting", values: { atlvs: true, compvss: true, gvteway: true } },
  { feature: "API Access", category: "Integration", values: { atlvs: true, compvss: true, gvteway: true } },
];

export default function ProductsPage() {
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
              title="The Complete Suite for Live Events"
              description="Three powerful products designed to work together. Manage productions, crews, and ticketing all in one ecosystem."
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
          id: "products",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={12}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Our Products</Body>
                  <H3 className="text-white">Choose Your Solution</H3>
                  <Body className="text-text-muted max-w-2xl">Each product is powerful on its own, but together they create an unmatched production management ecosystem.</Body>
                </Stack>

                <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                  {PRODUCTS.map((product) => (
                    <Card
                      key={product.id}
                      className="p-8 border-2 border-border rounded-card pop-card-atlvs group"
                      onClick={() => router.push(product.href)}
                    >
                      <Stack gap={6}>
                        <Box className="p-4 bg-primary/20 rounded-card text-primary w-fit group-hover:scale-110 transition-transform">
                          {product.icon}
                        </Box>

                        <Stack gap={2}>
                          <Body className="text-white font-weight-bold text-h5-md">{product.name}</Body>
                          <Body className="text-primary font-weight-medium">{product.tagline}</Body>
                          <Body className="text-text-muted">{product.description}</Body>
                        </Stack>

                        <Stack gap={3}>
                          {product.features.map((feature, idx) => (
                            <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                              <Check className="size-4 text-success flex-shrink-0" />
                              <Body size="sm" className="text-text-secondary">{feature}</Body>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                          icon={<ArrowRight className="size-4" />}
                          iconPosition="right"
                        >
                          Learn More
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
          id: "compare",
          background: "black",
          content: (
            <ComparisonTable
              kicker="Compare"
              title="Feature Comparison"
              description="See how our products stack up against each other"
              columns={COMPARISON_COLUMNS}
              rows={COMPARISON_ROWS}
              showCategories
              background="black"
            />
          ),
        },
        {
          id: "bundle",
          background: "ink",
          content: (
            <Container size="2xl" className="py-20">
              <Card className="p-12 border-2 border-primary/30 rounded-card bg-gradient-to-br from-primary/10 to-secondary/10">
                <Stack gap={6} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Best Value</Body>
                  <H3 className="text-white">Get the Complete GHXSTSHIP Suite</H3>
                  <Body className="text-text-secondary max-w-2xl">
                    Bundle all three products and save 30%. Perfect for organizations that need end-to-end event management.
                  </Body>
                  <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                    <Button variant="solid" size="lg" onClick={() => router.push("/pricing")}>
                      View Bundle Pricing
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => router.push("/products/compare")}>
                      Full Comparison
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Ready to Get Started?"
              description="Schedule a demo to see how our products can transform your event operations."
              primaryCta={{
                label: "Request Demo",
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
      stickyCta={{
        label: "Request Demo",
        onClick: () => router.push("/demo"),
      }}
    />
  );
}
