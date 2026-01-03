"use client";

/**
 * Product Comparison Page - 2026 Landing Page Best Practices
 * Compare all products
 * Full-width marketing layout with hero and content sections
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Check, X, Zap, Users, Ticket } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container,
  Body, Button, Card, Grid, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Stack, Box
} from "@ghxstship/ui";

const PRODUCTS = [
  { id: "atlvs", name: "ATLVS", icon: <Zap className="size-6" />, description: "Production Management", color: "primary" },
  { id: "compvss", name: "COMPVSS", icon: <Users className="size-6" />, description: "Crew Management", color: "secondary" },
  { id: "gvteway", name: "GVTEWAY", icon: <Ticket className="size-6" />, description: "Ticketing & Access", color: "accent" },
];

const FEATURES = [
  { category: "Production", features: [
    { name: "Production Planning", atlvs: true, compvss: false, gvteway: false },
    { name: "Document Management", atlvs: true, compvss: false, gvteway: false },
    { name: "Budget Tracking", atlvs: true, compvss: false, gvteway: false },
    { name: "Vendor Management", atlvs: true, compvss: false, gvteway: false },
  ]},
  { category: "Crew", features: [
    { name: "Crew Database", atlvs: false, compvss: true, gvteway: false },
    { name: "Scheduling", atlvs: false, compvss: true, gvteway: false },
    { name: "Time Tracking", atlvs: false, compvss: true, gvteway: false },
    { name: "Payroll Integration", atlvs: false, compvss: true, gvteway: false },
  ]},
  { category: "Ticketing", features: [
    { name: "Ticket Sales", atlvs: false, compvss: false, gvteway: true },
    { name: "Access Control", atlvs: false, compvss: false, gvteway: true },
    { name: "Event Discovery", atlvs: false, compvss: false, gvteway: true },
    { name: "Attendee Analytics", atlvs: false, compvss: false, gvteway: true },
  ]},
  { category: "General", features: [
    { name: "Team Collaboration", atlvs: true, compvss: true, gvteway: true },
    { name: "Mobile App", atlvs: true, compvss: true, gvteway: true },
    { name: "API Access", atlvs: true, compvss: true, gvteway: true },
    { name: "SSO Support", atlvs: true, compvss: true, gvteway: true },
  ]},
];

export default function ProductComparePage() {
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
              kicker="Products"
              title="Compare Products"
              description="Find the right solution for your needs. Compare features across ATLVS, COMPVSS, and GVTEWAY."
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
          content: (
            <Container size="2xl" className="py-16">
              <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
                {PRODUCTS.map((product) => (
                  <Card key={product.id} className="p-6 border-2 border-border rounded-card pop-card text-center cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
                    <Box className="p-4 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">
                      {product.icon}
                    </Box>
                    <Body className="text-white font-weight-bold text-h4-md mb-2">{product.name}</Body>
                    <Body className="text-on-dark-muted">{product.description}</Body>
                  </Card>
                ))}
              </Grid>
            </Container>
          ),
        },
        {
          id: "comparison",
          background: "black",
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Features</Body>
                  <Body className="text-white font-weight-bold text-h3-md">Feature Comparison</Body>
                  <Body className="text-on-dark-muted">See which features are included in each product</Body>
                </Stack>

                <Card className="border-2 border-border rounded-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4">Feature</TableHead>
                        {PRODUCTS.map((product) => (
                          <TableHead key={product.id} className="text-center">
                            <Box className="flex items-center justify-center gap-2">
                              {product.icon}
                              <Body className="text-white font-weight-bold">{product.name}</Body>
                            </Box>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {FEATURES.map((category) => (
                        <>
                          <TableRow key={category.category}>
                            <TableCell colSpan={4} className="bg-surface-elevated">
                              <Body className="text-white font-weight-bold">{category.category}</Body>
                            </TableCell>
                          </TableRow>
                          {category.features.map((feature) => (
                            <TableRow key={feature.name}>
                              <TableCell><Body className="text-on-dark-secondary">{feature.name}</Body></TableCell>
                              <TableCell className="text-center">{feature.atlvs ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                              <TableCell className="text-center">{feature.compvss ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                              <TableCell className="text-center">{feature.gvteway ? <Check className="size-5 text-success mx-auto" /> : <X className="size-5 text-on-dark-disabled mx-auto" />}</TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </Stack>
            </Container>
          ),
        },
        {
          id: "bundle",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Card className="p-12 border-2 border-primary rounded-card text-center">
                <Body className="text-primary uppercase tracking-kicker font-weight-semibold mb-4">Best Value</Body>
                <Body className="text-white font-weight-bold text-h3-md mb-4">Complete Suite Bundle</Body>
                <Body className="text-on-dark-muted mb-8 max-w-xl mx-auto">Get all three products bundled together for the best value. Perfect for organizations that need end-to-end event management.</Body>
                <Stack direction="horizontal" gap={4} className="justify-center flex-wrap">
                  <Button variant="solid" onClick={() => router.push("/demo")}>Request Demo</Button>
                  <Button variant="outline" onClick={() => router.push("/pricing")}>View Pricing</Button>
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
              title="Not Sure Which to Choose?"
              description="Our team can help you find the right solution for your specific needs."
              primaryCta={{
                label: "Talk to Sales",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View All Products",
                onClick: () => router.push("/products"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
