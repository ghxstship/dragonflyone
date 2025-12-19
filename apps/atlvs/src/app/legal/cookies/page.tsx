import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { Cookie, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const cookiesData = {
  lastUpdated: "December 1, 2024",
  sections: [
    {
      title: "WHAT ARE COOKIES",
      content: `Cookies are small text files that are stored on your device when you visit a website. They help websites remember your preferences and improve your browsing experience. ATLVS uses cookies and similar technologies to provide, protect, and improve our services.`,
    },
    {
      title: "HOW WE USE COOKIES",
      content: `We use cookies for several purposes:

Essential Cookies: These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.

Performance Cookies: These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services.

Functionality Cookies: These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, more personal features.

Analytics Cookies: We use analytics cookies to understand how our services are being used and to improve them. This includes tracking page views, session duration, and user interactions.`,
    },
    {
      title: "TYPES OF COOKIES WE USE",
      content: `Session Cookies: Temporary cookies that are deleted when you close your browser. They are used to maintain your session while you navigate our platform.

Persistent Cookies: Cookies that remain on your device for a set period or until you delete them. They are used to remember your preferences and settings.

First-Party Cookies: Cookies set by ATLVS directly when you visit our website.

Third-Party Cookies: Cookies set by our partners and service providers for analytics, advertising, and other purposes.`,
    },
    {
      title: "THIRD-PARTY COOKIES",
      content: `We work with trusted third-party services that may set cookies on your device:

Analytics: Google Analytics helps us understand how users interact with our platform.

Authentication: Auth0 and similar services use cookies to manage secure login sessions.

Customer Support: Intercom and similar tools use cookies to provide chat support and track support interactions.

Payment Processing: Stripe uses cookies to process payments securely.`,
    },
    {
      title: "MANAGING COOKIES",
      content: `You can control and manage cookies in several ways:

Browser Settings: Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites. Check your browser's help documentation for instructions.

Cookie Preferences: You can adjust your cookie preferences in your ATLVS account settings.

Opt-Out Tools: Many analytics and advertising services offer opt-out mechanisms. For example, you can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.

Please note that disabling certain cookies may affect the functionality of our services.`,
    },
    {
      title: "COOKIE RETENTION",
      content: `The retention period for cookies varies depending on their purpose:

Session cookies are deleted when you close your browser.

Persistent cookies may remain for up to 2 years, depending on their purpose.

Analytics cookies typically expire after 26 months.

You can delete cookies at any time through your browser settings.`,
    },
    {
      title: "UPDATES TO THIS POLICY",
      content: `We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a new effective date.`,
    },
    {
      title: "CONTACT US",
      content: `If you have questions about our use of cookies or this Cookie Policy, please contact us at privacy@atlvs.io or through our contact page.`,
    },
  ],
};

export default function CookiesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Cookie className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEGAL
            </Label>
            <Display size="lg" className="text-white">
              COOKIE POLICY
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Last updated: {cookiesData.lastUpdated}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Content */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            {cookiesData.sections.map((section) => (
              <Stack key={section.title} gap={4}>
                <H3 className="text-ink-950">{section.title}</H3>
                <Body size="sm" className="whitespace-pre-line text-grey-700">
                  {section.content}
                </Body>
              </Stack>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Related Links */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <H1 className="text-white">RELATED POLICIES</H1>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/legal/privacy">
                <Button variant="outlineWhite" size="lg">
                  Privacy Policy
                </Button>
              </NextLink>
              <NextLink href="/legal/terms">
                <Button variant="outlineWhite" size="lg">
                  Terms of Service
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Contact Us
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
