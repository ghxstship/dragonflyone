import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { Shield, Lock, Eye, Server, FileCheck, Users, ArrowRight, Check } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const securityData = {
  hero: {
    headline: "ENTERPRISE-GRADE SECURITY",
    description: "Your production data is protected by industry-leading security practices and compliance standards.",
  },
  certifications: [
    { name: "SOC 2 Type II", description: "Audited annually for security, availability, and confidentiality" },
    { name: "GDPR Compliant", description: "Full compliance with European data protection regulations" },
    { name: "CCPA Compliant", description: "California Consumer Privacy Act compliance" },
    { name: "ISO 27001", description: "Information security management certification" },
  ],
  features: [
    {
      icon: Lock,
      title: "ENCRYPTION",
      description: "All data encrypted at rest (AES-256) and in transit (TLS 1.3). Zero-knowledge architecture for sensitive data.",
    },
    {
      icon: Users,
      title: "ACCESS CONTROL",
      description: "Role-based permissions, SSO integration, and multi-factor authentication for all accounts.",
    },
    {
      icon: Eye,
      title: "AUDIT LOGGING",
      description: "Complete audit trail of all actions. Real-time monitoring and anomaly detection.",
    },
    {
      icon: Server,
      title: "INFRASTRUCTURE",
      description: "Hosted on AWS with redundant systems across multiple availability zones. 99.99% uptime SLA.",
    },
    {
      icon: FileCheck,
      title: "DATA BACKUP",
      description: "Automated daily backups with point-in-time recovery. Geographic redundancy for disaster recovery.",
    },
    {
      icon: Shield,
      title: "PENETRATION TESTING",
      description: "Regular third-party security assessments and bug bounty program for continuous improvement.",
    },
  ],
  practices: [
    "24/7 security monitoring",
    "Incident response team",
    "Regular security training",
    "Vendor security assessments",
    "Data retention policies",
    "Privacy by design",
  ],
};

export default function SecurityPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <Shield className="size-8 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              SECURITY
            </Label>
            <Display size="lg" className="text-white">
              {securityData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {securityData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Certifications */}
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            {securityData.certifications.map((cert) => (
              <Card key={cert.name} className="border-2 border-ink-950 bg-white p-6 text-center shadow-md">
                <Stack gap={2}>
                  <H3 size="sm" className="text-ink-950">{cert.name}</H3>
                  <Label size="xs" className="text-grey-500">{cert.description}</Label>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Security Features */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">HOW WE PROTECT YOUR DATA</H1>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
            {securityData.features.map((feature) => (
              <Card key={feature.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <feature.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">{feature.title}</H3>
                  <Body size="sm" className="text-grey-600">
                    {feature.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Security Practices */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={6}>
              <H1 className="text-white">SECURITY PRACTICES</H1>
              <Body size="lg" className="text-on-dark-secondary">
                Security is not just a feature - it&apos;s foundational to everything we build.
              </Body>
            </Stack>
            <Card inverted className="border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                {securityData.practices.map((practice) => (
                  <Stack key={practice} direction="horizontal" gap={3} className="items-center">
                    <Check className="size-4 text-brand-pink" />
                    <Label size="sm" className="text-white">{practice}</Label>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              QUESTIONS ABOUT SECURITY?
            </Display>
            <Body size="lg" className="text-grey-600">
              Our security team is happy to discuss our practices and answer any questions.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Contact Security Team
                </Button>
              </NextLink>
              <NextLink href="/legal/privacy">
                <Button variant="outline" size="lg">
                  Privacy Policy
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
