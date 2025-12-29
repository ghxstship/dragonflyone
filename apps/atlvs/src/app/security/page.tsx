"use client";

/**
 * Security Page
 * Security information and compliance
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Shield, Lock, Key, Eye, CheckCircle, FileText, List, Award } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const SECURITY_FEATURES = [
  { icon: <Lock className="size-6" />, title: "Encryption", description: "All data encrypted at rest and in transit using AES-256" },
  { icon: <Key className="size-6" />, title: "Authentication", description: "Multi-factor authentication and SSO support" },
  { icon: <Eye className="size-6" />, title: "Access Control", description: "Role-based access control with granular permissions" },
  { icon: <Shield className="size-6" />, title: "Infrastructure", description: "Hosted on SOC 2 compliant cloud infrastructure" },
];

const CERTIFICATIONS = [
  { name: "SOC 2 Type II", description: "Annual audit for security, availability, and confidentiality" },
  { name: "GDPR Compliant", description: "Full compliance with EU data protection regulations" },
  { name: "ISO 27001", description: "Information security management certification" },
  { name: "PCI DSS", description: "Payment card industry data security standard" },
];

export default function SecurityPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "security",
      label: "Security",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <Body className="font-weight-bold text-grey-300 leading-relaxed">
              Security is at the core of everything we do. We employ industry-leading security practices 
              to protect your data and ensure compliance with global standards.
            </Body>
          </Card>

          <SectionHeader title="Security Features" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {SECURITY_FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{feature.icon}</div>
                  <div>
                    <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                    <Body className="text-grey-400">{feature.description}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: <Award className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Certifications & Compliance" description="Our security certifications and compliance standards" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {CERTIFICATIONS.map((cert, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="size-6 text-success" />
                  <div>
                    <Body className="font-weight-bold">{cert.name}</Body>
                    <Body size="sm" className="text-grey-400">{cert.description}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Security Whitepaper</Body>
                <Body size="sm" className="text-grey-400">Download our detailed security documentation</Body>
              </div>
              <Button variant="outline" icon={<FileText className="size-4" />} iconPosition="left">Download PDF</Button>
            </div>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Trust", title: "Security", description: "Enterprise-grade security for your data" }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/contact")}>Security Questions?</Button>}
    />
  );
}
