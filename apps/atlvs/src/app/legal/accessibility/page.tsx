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
import { Accessibility, ArrowRight, Mail } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const accessibilityData = {
  lastUpdated: "December 1, 2024",
  sections: [
    {
      title: "OUR COMMITMENT",
      content: `ATLVS is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

We believe that the web should be accessible to all users, regardless of their abilities or the assistive technologies they use. Our goal is to provide an inclusive experience that allows all users to access and interact with our platform effectively.`,
    },
    {
      title: "CONFORMANCE STATUS",
      content: `The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.

ATLVS strives to conform to WCAG 2.1 Level AA standards. We regularly audit our platform to identify and address accessibility issues.`,
    },
    {
      title: "ACCESSIBILITY FEATURES",
      content: `ATLVS includes the following accessibility features:

Keyboard Navigation: All functionality is accessible via keyboard navigation. Users can navigate through the interface using Tab, Enter, and arrow keys.

Screen Reader Support: Our platform is designed to work with popular screen readers including NVDA, JAWS, and VoiceOver.

Color Contrast: We maintain sufficient color contrast ratios to ensure text is readable for users with low vision or color blindness.

Text Resizing: Content can be resized up to 200% without loss of functionality or content.

Focus Indicators: Visible focus indicators help keyboard users understand where they are on the page.

Alternative Text: Images include descriptive alternative text for screen reader users.

Form Labels: All form inputs have associated labels for screen reader accessibility.

Error Identification: Form errors are clearly identified and described to users.`,
    },
    {
      title: "ASSISTIVE TECHNOLOGIES",
      content: `ATLVS is designed to be compatible with the following assistive technologies:

Screen Readers: NVDA, JAWS, VoiceOver, TalkBack
Voice Recognition: Dragon NaturallySpeaking
Screen Magnification: ZoomText, Windows Magnifier
Alternative Input Devices: Switch access, eye tracking

We test our platform regularly with these technologies to ensure compatibility.`,
    },
    {
      title: "KNOWN LIMITATIONS",
      content: `While we strive for full accessibility, some areas of our platform may have limitations:

Third-Party Content: Some embedded content from third-party services may not be fully accessible.

Legacy Features: Some older features may not meet current accessibility standards and are being updated.

Complex Visualizations: Some data visualizations may require alternative formats for full accessibility.

We are actively working to address these limitations and improve accessibility across all areas of our platform.`,
    },
    {
      title: "FEEDBACK",
      content: `We welcome your feedback on the accessibility of ATLVS. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:

Email: accessibility@atlvs.io
Phone: +1 (305) 555-0123
Contact Form: Use our contact page to submit accessibility feedback

We aim to respond to accessibility feedback within 2 business days and will work with you to resolve any issues.`,
    },
    {
      title: "ASSESSMENT APPROACH",
      content: `ATLVS assesses the accessibility of our platform through:

Self-Evaluation: Regular internal audits using automated testing tools and manual testing.

External Audits: Periodic third-party accessibility audits by certified accessibility experts.

User Testing: Testing with users who rely on assistive technologies.

Continuous Monitoring: Ongoing monitoring of accessibility issues through our bug tracking system.`,
    },
    {
      title: "FORMAL COMPLAINTS",
      content: `If you are not satisfied with our response to your accessibility feedback, you may file a formal complaint:

1. Contact our Accessibility Coordinator at accessibility@atlvs.io
2. Provide details about the accessibility barrier you encountered
3. Include information about the assistive technology you use
4. Describe the impact on your ability to use our services

We will investigate all formal complaints and respond within 10 business days.`,
    },
  ],
};

export default function AccessibilityPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Accessibility className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              LEGAL
            </Label>
            <Display size="lg" className="text-white">
              ACCESSIBILITY STATEMENT
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Last updated: {accessibilityData.lastUpdated}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Content */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-3xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            {accessibilityData.sections.map((section) => (
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

      {/* Contact */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <H1 className="text-white">ACCESSIBILITY SUPPORT</H1>
            <Body size="lg" className="text-on-dark-secondary">
              Need help or want to report an accessibility issue? We&apos;re here to help.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="mailto:accessibility@atlvs.io">
                <Button variant="pop" size="lg" icon={<Mail />}>
                  accessibility@atlvs.io
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Contact Form
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
