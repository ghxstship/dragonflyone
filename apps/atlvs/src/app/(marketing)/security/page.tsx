"use client";

/**
 * Security Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, security features, certifications, and trust signals
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import { Shield, Lock, Key, Eye, CheckCircle, FileText, Download, Server, Database, Globe } from "lucide-react";
import {
  MarketingPage, HeroSection, FeatureGrid, CTABanner, Container, Stack, Grid, Card, Body, H3, Button, Badge, Box} from "@ghxstship/ui";

const SECURITY_FEATURES: FeatureItem[] = [
  { id: "encryption", icon: <Lock className="size-8" />, title: "End-to-End Encryption", description: "All data encrypted at rest using AES-256 and in transit using TLS 1.3" },
  { id: "auth", icon: <Key className="size-8" />, title: "Multi-Factor Authentication", description: "Secure access with MFA, SSO, and passwordless authentication options" },
  { id: "access", icon: <Eye className="size-8" />, title: "Role-Based Access Control", description: "Granular permissions with role-based access control and audit logging" },
  { id: "infra", icon: <Shield className="size-8" />, title: "Secure Infrastructure", description: "Hosted on SOC 2 compliant cloud infrastructure with 99.99% uptime SLA" },
  { id: "backup", icon: <Database className="size-8" />, title: "Automated Backups", description: "Daily automated backups with point-in-time recovery and geo-redundancy" },
  { id: "monitoring", icon: <Server className="size-8" />, title: "24/7 Monitoring", description: "Continuous security monitoring with real-time threat detection and response" },
];

const CERTIFICATIONS = [
  { id: "soc2", name: "SOC 2 Type II", description: "Annual audit for security, availability, and confidentiality controls", icon: <Shield className="size-6" /> },
  { id: "gdpr", name: "GDPR Compliant", description: "Full compliance with EU General Data Protection Regulation", icon: <Globe className="size-6" /> },
  { id: "iso", name: "ISO 27001", description: "International standard for information security management", icon: <CheckCircle className="size-6" /> },
  { id: "pci", name: "PCI DSS", description: "Payment Card Industry Data Security Standard compliance", icon: <Lock className="size-6" /> },
];

const TRUST_STATS = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "0", label: "Data Breaches" },
  { value: "24/7", label: "Security Monitoring" },
  { value: "AES-256", label: "Encryption Standard" },
];

export default function SecurityPage() {
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
              kicker="Trust"
              title="Enterprise-Grade Security"
              description="Your data security is our top priority. We employ industry-leading security practices and maintain compliance with global standards to protect your production data."
              primaryCta={{
                label: "Download Security Whitepaper",
                onClick: () => window.open("/security-whitepaper.pdf", "_blank"),
              }}
              secondaryCta={{
                label: "Contact Security Team",
                onClick: () => router.push("/contact?reason=security"),
              }}
              background="gradient"
              pattern="none"
              fullHeight={false}
              align="center"
            />
          ),
        },
        {
          id: "trust-stats",
          background: "primary",
          content: (
            <Container size="xl" className="py-12">
              <Grid cols={4} gap={8} className="grid-cols-2 md:grid-cols-4">
                {TRUST_STATS.map((stat, idx) => (
                  <Stack key={idx} gap={1} className="text-center">
                    <Body className="text-white font-weight-bold text-h3-md">{stat.value}</Body>
                    <Body className="text-white/80">{stat.label}</Body>
                  </Stack>
                ))}
              </Grid>
            </Container>
          ),
        },
        {
          id: "features",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <FeatureGrid
              kicker="Security Features"
              title="How We Protect Your Data"
              description="Comprehensive security measures at every layer of our platform"
              features={SECURITY_FEATURES}
              columns={3}
              variant="bordered"
              background="ink"
              align="center"
            />
          ),
        },
        {
          id: "certifications",
          background: "black",
          content: (
            <Container size="xl" className="py-20">
              <Stack gap={8}>
                <Stack gap={4} className="text-center items-center">
                  <Body className="text-primary uppercase tracking-kicker font-weight-semibold">Compliance</Body>
                  <H3 className="text-white">Certifications & Standards</H3>
                  <Body className="text-on-dark-muted max-w-2xl">We maintain rigorous compliance with industry standards and undergo regular third-party audits.</Body>
                </Stack>

                <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
                  {CERTIFICATIONS.map((cert) => (
                    <Card key={cert.id} className="p-6 border-2 border-grey-800 rounded-card hover:border-success/30 transition-all">
                      <Stack direction="horizontal" gap={4} className="items-start">
                        <Box className="p-3 bg-success/20 rounded-card text-success">
                          {cert.icon}
                        </Box>
                        <Stack gap={2} className="flex-1">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body className="text-white font-weight-bold">{cert.name}</Body>
                            <Badge className="bg-success/20 text-success border-success/30">Certified</Badge>
                          </Stack>
                          <Body className="text-on-dark-muted">{cert.description}</Body>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Container>
          ),
        },
        {
          id: "whitepaper",
          background: "ink",
          content: (
            <Container size="lg" className="py-20">
              <Card className="p-12 border-2 border-primary/30 rounded-card bg-gradient-to-br from-primary/10 to-secondary/10">
                <Stack direction="horizontal" className="justify-between items-center flex-wrap gap-8">
                  <Stack direction="horizontal" gap={6} className="items-center">
                    <Box className="p-4 bg-primary/20 rounded-card">
                      <FileText className="size-10 text-primary" />
                    </Box>
                    <Stack gap={2}>
                      <Body className="text-white font-weight-bold text-h5-md">Security Whitepaper</Body>
                      <Body className="text-on-dark-muted">Download our comprehensive security documentation detailing our practices, architecture, and compliance measures.</Body>
                    </Stack>
                  </Stack>
                  <Button variant="solid" size="lg" icon={<Download className="size-5" />} iconPosition="left">
                    Download PDF
                  </Button>
                </Stack>
              </Card>
            </Container>
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
          content: (
            <CTABanner
              title="Have Security Questions?"
              description="Our security team is here to help. Contact us for security assessments, compliance documentation, or any security-related inquiries."
              primaryCta={{
                label: "Contact Security Team",
                onClick: () => router.push("/contact?reason=security"),
              }}
              secondaryCta={{
                label: "View Trust Center",
                onClick: () => router.push("/trust"),
              }}
              background="primary"
            />
          ),
        },
      ]}
    />
  );
}
