"use client";

/**
 * Sub-processors Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for sub-processors list
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Bell } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Card, Body, H3, Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Box} from "@ghxstship/ui";

interface SubProcessor {
  name: string;
  purpose: string;
  location: string;
  category: string;
}

const SUB_PROCESSORS: SubProcessor[] = [
  { name: "Amazon Web Services", purpose: "Cloud infrastructure and hosting", location: "United States", category: "Infrastructure" },
  { name: "Google Cloud Platform", purpose: "Cloud services and analytics", location: "United States", category: "Infrastructure" },
  { name: "Stripe", purpose: "Payment processing", location: "United States", category: "Payments" },
  { name: "SendGrid", purpose: "Email delivery", location: "United States", category: "Communications" },
  { name: "Intercom", purpose: "Customer support", location: "United States", category: "Support" },
  { name: "Sentry", purpose: "Error monitoring", location: "United States", category: "Monitoring" },
  { name: "Mixpanel", purpose: "Product analytics", location: "United States", category: "Analytics" },
  { name: "Cloudflare", purpose: "CDN and security", location: "United States", category: "Security" },
];

export default function SubProcessorsPage() {
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
              title="Sub-processors"
              description="Third-party services that process data on our behalf. We carefully vet all sub-processors to ensure they meet our security and privacy standards."
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
                <Card className="p-6 border-2 border-grey-800 rounded-card">
                  <Box className="flex items-center justify-between flex-wrap gap-4">
                    <Stack gap={1}>
                      <Body className="text-white font-weight-bold">Sub-processor List</Body>
                      <Body size="sm" className="text-on-dark-muted">Last updated: November 1, 2024</Body>
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

                <Card className="p-6 border-2 border-grey-800 rounded-card">
                  <Stack gap={4}>
                    <H3 className="text-white text-h5-md">About Sub-processors</H3>
                    <Body className="text-on-dark-secondary leading-relaxed">
                      ATLVS uses third-party service providers (sub-processors) to help deliver our services. 
                      These sub-processors may process personal data on our behalf. We carefully vet all sub-processors 
                      to ensure they meet our security and privacy standards.
                    </Body>
                  </Stack>
                </Card>

                <Card className="overflow-hidden border-2 border-grey-800 rounded-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sub-processor</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SUB_PROCESSORS.map((processor, idx) => (
                        <TableRow key={idx}>
                          <TableCell><Body className="font-weight-medium text-white">{processor.name}</Body></TableCell>
                          <TableCell><Body size="sm" className="text-on-dark-muted">{processor.purpose}</Body></TableCell>
                          <TableCell><Body size="sm" className="text-on-dark-secondary">{processor.location}</Body></TableCell>
                          <TableCell><Badge variant="outline">{processor.category}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <Card className="p-6 border-2 border-primary rounded-card">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Bell className="size-6 text-primary" />
                      <Body className="text-white font-weight-bold">Subscribe to Updates</Body>
                    </Stack>
                    <Body className="text-on-dark-muted">Get notified when we add or change sub-processors.</Body>
                    <Button variant="outline" className="w-fit">Subscribe</Button>
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
              title="Questions About Our Sub-processors?"
              description="Contact us if you have any questions about our third-party service providers."
              primaryCta={{
                label: "Contact Us",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View Privacy Policy",
                onClick: () => router.push("/legal/privacy"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
