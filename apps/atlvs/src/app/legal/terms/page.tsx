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

export default function TermsPage() {
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
              TERMS OF SERVICE
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
              <H2 className="text-ink-950">1. Acceptance of Terms</H2>
              <Body className="text-grey-700">
                By accessing or using ATLVS, you agree to be bound by these Terms of Service and all
                applicable laws and regulations. If you do not agree with any of these terms, you are
                prohibited from using or accessing this platform.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">2. Use License</H2>
              <Body className="text-grey-700">
                Permission is granted to temporarily access and use ATLVS for personal or commercial
                production management purposes. This is the grant of a license, not a transfer of title,
                and under this license you may not modify or copy the materials, use the materials for
                any commercial purpose outside of production management, or attempt to decompile or
                reverse engineer any software contained on ATLVS.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">3. Account Responsibilities</H2>
              <Body className="text-grey-700">
                You are responsible for maintaining the confidentiality of your account and password
                and for restricting access to your computer. You agree to accept responsibility for
                all activities that occur under your account or password.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">4. Service Availability</H2>
              <Body className="text-grey-700">
                We strive to maintain 99.9% uptime for our services. However, we do not guarantee
                uninterrupted access and may suspend service for maintenance, updates, or other
                operational reasons.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">5. Payment Terms</H2>
              <Body className="text-grey-700">
                Subscription fees are billed in advance on a monthly or annual basis. All fees are
                non-refundable except as required by law. We reserve the right to change our prices
                with 30 days notice.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">6. Data Ownership</H2>
              <Body className="text-grey-700">
                You retain all rights to your data. We do not claim ownership over any content you
                upload to ATLVS. You grant us a license to use your data solely for the purpose of
                providing our services to you.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">7. Limitation of Liability</H2>
              <Body className="text-grey-700">
                In no event shall ATLVS or its suppliers be liable for any damages arising out of
                the use or inability to use the materials on ATLVS, even if ATLVS or an authorized
                representative has been notified orally or in writing of the possibility of such damage.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">8. Governing Law</H2>
              <Body className="text-grey-700">
                These terms and conditions are governed by and construed in accordance with the laws
                of the State of California and you irrevocably submit to the exclusive jurisdiction
                of the courts in that State.
              </Body>
            </Stack>

            <Stack gap={4}>
              <H2 className="text-ink-950">9. Contact</H2>
              <Body className="text-grey-700">
                If you have any questions about these Terms of Service, please contact us at
                legal@atlvs.io or through our contact page.
              </Body>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
