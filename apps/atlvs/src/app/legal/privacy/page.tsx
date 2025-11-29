import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Stack,
  Body,
  H2,
  Label,
  Container,
  Display,
  FullBleedSection,
} from "@ghxstship/ui";

export const runtime = "edge";

export default function PrivacyPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={6} className="text-center">
            <Label size="xs" className="text-on-dark-muted">
              LEGAL
            </Label>
            <Display size="lg" className="text-white">
              PRIVACY POLICY
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Last updated: January 1, 2025
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Content */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-3xl px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4}>
              <H2 className="text-ink-950">1. Information We Collect</H2>
              <Body className="text-grey-700">
                We collect information you provide directly to us, such as when you create an account,
                use our services, or contact us for support. This may include your name, email address,
                company information, and payment details.
              </Body>
              <Body className="text-grey-700">
                We also automatically collect certain information when you use our platform, including
                your IP address, browser type, device information, and usage data.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">2. How We Use Your Information</H2>
              <Body className="text-grey-700">
                We use the information we collect to provide, maintain, and improve our services,
                process transactions, send you technical notices and support messages, and respond
                to your comments and questions.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">3. Information Sharing</H2>
              <Body className="text-grey-700">
                We do not sell your personal information. We may share your information with third-party
                service providers who perform services on our behalf, such as payment processing,
                data analysis, and customer service.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">4. Data Security</H2>
              <Body className="text-grey-700">
                We implement appropriate technical and organizational measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">5. Your Rights</H2>
              <Body className="text-grey-700">
                You have the right to access, correct, or delete your personal information. You may also
                have the right to data portability and to object to or restrict certain processing of
                your information.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">6. Cookies</H2>
              <Body className="text-grey-700">
                We use cookies and similar tracking technologies to collect and track information about
                your use of our services. You can control cookies through your browser settings.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">7. Changes to This Policy</H2>
              <Body className="text-grey-700">
                We may update this privacy policy from time to time. We will notify you of any changes
                by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">8. Contact Us</H2>
              <Body className="text-grey-700">
                If you have any questions about this privacy policy, please contact us at
                privacy@atlvs.io or through our contact page.
              </Body>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
