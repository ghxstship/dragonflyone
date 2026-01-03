"use client";

/**
 * Terms of Service Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for terms of service
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Card, Body, H3, Button, Box} from "@ghxstship/ui";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using ATLVS, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site." },
  { id: "use", title: "2. Use License", content: "Permission is granted to temporarily access the materials on ATLVS for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title." },
  { id: "disclaimer", title: "3. Disclaimer", content: "The materials on ATLVS are provided on an 'as is' basis. ATLVS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights." },
  { id: "limitations", title: "4. Limitations", content: "In no event shall ATLVS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ATLVS." },
  { id: "revisions", title: "5. Revisions", content: "ATLVS may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service." },
  { id: "governing", title: "6. Governing Law", content: "These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location." },
];

export default function TermsPage() {
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
              title="Terms of Service"
              description="Please read these terms carefully before using ATLVS. By using our services, you agree to be bound by these terms."
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
                      <Body className="text-white font-weight-bold">Terms of Service</Body>
                      <Body size="sm" className="text-text-muted">Last updated: December 1, 2024</Body>
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
                        <H3 className="text-white text-h5-md">{section.title}</H3>
                        <Body className="text-text-secondary leading-relaxed">{section.content}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "black",
          content: (
            <CTABanner
              title="Questions About Our Terms?"
              description="Contact our legal team if you have any questions about these terms of service."
              primaryCta={{
                label: "Contact Legal Team",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View All Legal Docs",
                onClick: () => router.push("/legal"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
