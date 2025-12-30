"use client";

/**
 * Legal Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for legal documents hub
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { FileText, Shield, Cookie, Users, Globe, ArrowRight } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Box} from "@ghxstship/ui";

const LEGAL_DOCS = [
  { id: "terms", title: "Terms of Service", description: "Our terms and conditions for using ATLVS", icon: <FileText className="size-8" />, href: "/legal/terms", updated: "2024-12-01" },
  { id: "privacy", title: "Privacy Policy", description: "How we collect, use, and protect your data", icon: <Shield className="size-8" />, href: "/legal/privacy", updated: "2024-12-01" },
  { id: "cookies", title: "Cookie Policy", description: "How we use cookies and similar technologies", icon: <Cookie className="size-8" />, href: "/legal/cookies", updated: "2024-11-15" },
  { id: "accessibility", title: "Accessibility Statement", description: "Our commitment to accessibility", icon: <Users className="size-8" />, href: "/legal/accessibility", updated: "2024-10-01" },
  { id: "sub-processors", title: "Sub-processors", description: "Third-party services we use to process data", icon: <Globe className="size-8" />, href: "/legal/sub-processors", updated: "2024-11-01" },
];

export default function LegalPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

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
              kicker="Company"
              title="Legal"
              description="Legal documents and policies governing your use of ATLVS. We believe in transparency and protecting your rights."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "documents",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Documents</Body>
                  <H3 className="text-white">Legal Documents</H3>
                  <Body className="text-on-dark-muted max-w-2xl">Important legal information about using ATLVS</Body>
                </Stack>

                <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {LEGAL_DOCS.map((doc) => (
                    <Card 
                      key={doc.id} 
                      className="p-6 border-2 border-grey-800 rounded-card cursor-pointer hover:border-primary transition-colors group"
                      onClick={() => router.push(doc.href)}
                    >
                      <Stack gap={4}>
                        <Box className="p-4 bg-primary/20 rounded-card text-primary w-fit">
                          {doc.icon}
                        </Box>
                        <Stack gap={2}>
                          <Body className="text-white font-weight-bold group-hover:text-primary transition-colors">{doc.title}</Body>
                          <Body size="sm" className="text-on-dark-muted">{doc.description}</Body>
                          <Body size="sm" className="text-on-dark-disabled">Last updated: {formatDate(doc.updated)}</Body>
                        </Stack>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-fit mt-2"
                          icon={<ArrowRight className="size-4" />}
                          iconPosition="right"
                        >
                          Read Document
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
          id: "cta",
          background: "black",
          content: (
            <CTABanner
              title="Questions About Our Policies?"
              description="Contact our legal team for any questions or concerns about our legal documents."
              primaryCta={{
                label: "Contact Legal Team",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Email Us",
                onClick: () => window.location.href = "mailto:legal@atlvs.com",
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
