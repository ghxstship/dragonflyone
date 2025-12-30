"use client";

/**
 * Privacy Policy Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for privacy policy
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import {
  MarketingPage, HeroSection, CTABanner, Container, Stack, Card, Body, H3, Button} from "@ghxstship/ui";

const SECTIONS = [
  { id: "collection", title: "1. Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any other information you choose to provide." },
  { id: "use", title: "2. How We Use Your Information", content: "We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your experience. We may also use the information to send you updates and marketing communications." },
  { id: "sharing", title: "3. Information Sharing", content: "We do not sell, trade, or otherwise transfer your personal information to outside parties except as described in this policy. We may share information with trusted third parties who assist us in operating our website and conducting our business." },
  { id: "security", title: "4. Data Security", content: "We implement a variety of security measures to maintain the safety of your personal information. All data is encrypted in transit and at rest. We are SOC 2 Type II certified and undergo regular security audits." },
  { id: "rights", title: "5. Your Rights", content: "You have the right to access, correct, or delete your personal information. You can also object to processing, request data portability, and withdraw consent at any time. Contact us to exercise these rights." },
  { id: "cookies", title: "6. Cookies", content: "We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent." },
  { id: "changes", title: "7. Changes to This Policy", content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'last updated' date." },
];

export default function PrivacyPolicyPage() {
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
              title="Privacy Policy"
              description="How we collect, use, and protect your information. Your privacy is important to us."
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
            <Container size="lg" className="py-20">
              <Stack gap={8}>
                <Card className="p-6 border-2 border-grey-800 rounded-card">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <Stack gap={1}>
                      <Body className="text-white font-weight-bold">Privacy Policy</Body>
                      <Body size="sm" className="text-on-dark-muted">Last updated: December 1, 2024</Body>
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
                  </div>
                </Card>

                <Stack gap={6}>
                  {SECTIONS.map((section) => (
                    <Card key={section.id} className="p-6 border-2 border-grey-800 rounded-card">
                      <Stack gap={4}>
                        <H3 className="text-white text-h5-md">{section.title}</H3>
                        <Body className="text-on-dark-secondary leading-relaxed">{section.content}</Body>
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
              title="Privacy Questions?"
              description="Contact our privacy team for any questions about how we handle your data."
              primaryCta={{
                label: "Contact Privacy Team",
                onClick: () => router.push("/contact"),
              }}
              secondaryCta={{
                label: "View Sub-processors",
                onClick: () => router.push("/legal/sub-processors"),
              }}
              background="ink"
            />
          ),
        },
      ]}
    />
  );
}
