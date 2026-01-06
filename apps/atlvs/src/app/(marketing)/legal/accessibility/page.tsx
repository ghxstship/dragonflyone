"use client";

/**
 * Accessibility Statement Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for accessibility statement
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, ArrowLeft, AlertCircle } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Card, Body, H3, Button, Box} from "@ghxstship/ui";

const SECTIONS = [
  { id: "commitment", title: "Our Commitment", content: "ATLVS is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards." },
  { id: "standards", title: "Conformance Status", content: "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more user-friendly for everyone." },
  { id: "features", title: "Accessibility Features", content: "Our platform includes keyboard navigation support, screen reader compatibility, sufficient color contrast, resizable text, alternative text for images, and clear focus indicators." },
  { id: "feedback", title: "Feedback", content: "We welcome your feedback on the accessibility of ATLVS. Please let us know if you encounter accessibility barriers. We take accessibility issues seriously and will work to address them promptly." },
  { id: "contact", title: "Contact Us", content: "If you have specific questions or concerns about the accessibility of this site, please contact us at accessibility@atlvs.com. We will work with you to provide the information or service you need through an alternative communication method." },
];

export default function AccessibilityPage() {
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
              kicker="Legal"
              title="Accessibility Statement"
              description="Our commitment to digital accessibility for all users. Everyone deserves equal access to our platform."
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "content",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <Container size="2xl" className="py-20">
              <Stack gap={8}>
                <Card className="p-6 border-2 border-border rounded-card">
                  <Box className="flex items-center justify-between flex-wrap gap-4">
                    <Stack gap={1}>
                      <Body className="text-text-primary font-weight-bold">Accessibility Statement</Body>
                      <Body size="sm" className="text-text-muted">Last updated: October 1, 2024</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={3}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={<ArrowLeft className="size-4" />} 
                        iconPosition="left"
                        onClick={() => router.push("/legal")}
                      >
                        Back to Legal
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        icon={<Download className="size-4" />} 
                        iconPosition="left"
                      >
                        Download PDF
                      </Button>
                    </Stack>
                  </Box>
                </Card>

                <Stack gap={6}>
                  {SECTIONS.map((section) => (
                    <Card key={section.id} className="p-6 border-2 border-border rounded-card">
                      <Stack gap={4}>
                        <H3 className="text-text-primary text-h5-md">{section.title}</H3>
                        <Body className="text-text-secondary leading-relaxed">{section.content}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                <Card className="p-6 border-2 border-accent rounded-card">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <AlertCircle className="size-6 text-accent" />
                      <Body className="text-text-primary font-weight-bold">Report an Accessibility Issue</Body>
                    </Stack>
                    <Body className="text-text-muted">Help us improve by reporting any accessibility barriers you encounter.</Body>
                    <Button variant="outline" className="w-fit" onClick={() => router.push("/contact")}>Report Issue</Button>
                  </Stack>
                </Card>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "ink",
          content: (
            <CTABanner
              title="Accessibility Questions?"
              description="Contact our accessibility team for any questions or to report barriers."
              primaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "Email accessibility@atlvs.com",
                onClick: () => window.location.href = "mailto:accessibility@atlvs.com",
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
