"use client";

/**
 * Cookie Policy Page - 2026 Landing Page Best Practices
 * Full-width marketing layout for cookie policy
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Settings } from "lucide-react";
import {
  MarketingPage,
  HeroSection,
  CTABanner,
  Container,
  Stack,
  Card,
  Body,
  H3,
  Button,
} from "@ghxstship/ui";

const SECTIONS = [
  { id: "what", title: "1. What Are Cookies", content: "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site." },
  { id: "types", title: "2. Types of Cookies We Use", content: "We use essential cookies for site functionality, analytics cookies to understand how visitors use our site, and preference cookies to remember your settings. We may also use marketing cookies to deliver relevant advertisements." },
  { id: "essential", title: "3. Essential Cookies", content: "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you, such as setting your privacy preferences, logging in, or filling in forms." },
  { id: "analytics", title: "4. Analytics Cookies", content: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are the most and least popular and see how visitors move around the site." },
  { id: "manage", title: "5. Managing Cookies", content: "You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly." },
  { id: "updates", title: "6. Updates to This Policy", content: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we post changes to this policy, we will revise the 'last updated' date at the top of this policy." },
];

export default function CookiePolicyPage() {
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
              title="Cookie Policy"
              description="How we use cookies and similar technologies to improve your experience on ATLVS."
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
                      <Body className="text-white font-weight-bold">Cookie Policy</Body>
                      <Body size="sm" className="text-grey-400">Last updated: November 15, 2024</Body>
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
                        <Body className="text-grey-300 leading-relaxed">{section.content}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                <Card className="p-6 border-2 border-primary rounded-card">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Settings className="size-6 text-primary" />
                      <Body className="text-white font-weight-bold">Cookie Preferences</Body>
                    </Stack>
                    <Body className="text-grey-400">You can manage your cookie preferences at any time.</Body>
                    <Button variant="outline" className="w-fit">Manage Preferences</Button>
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
              title="Questions About Cookies?"
              description="Contact us if you have any questions about how we use cookies."
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
