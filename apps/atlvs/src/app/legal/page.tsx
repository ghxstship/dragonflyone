"use client";

/**
 * Legal Page
 * Legal documents hub
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { FileText, Shield, Cookie, Users, Globe, List } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const LEGAL_DOCS = [
  { id: "terms", title: "Terms of Service", description: "Our terms and conditions for using ATLVS", icon: <FileText className="size-6" />, href: "/legal/terms", updated: "2024-12-01" },
  { id: "privacy", title: "Privacy Policy", description: "How we collect, use, and protect your data", icon: <Shield className="size-6" />, href: "/legal/privacy", updated: "2024-12-01" },
  { id: "cookies", title: "Cookie Policy", description: "How we use cookies and similar technologies", icon: <Cookie className="size-6" />, href: "/legal/cookies", updated: "2024-11-15" },
  { id: "accessibility", title: "Accessibility Statement", description: "Our commitment to accessibility", icon: <Users className="size-6" />, href: "/legal/accessibility", updated: "2024-10-01" },
  { id: "sub-processors", title: "Sub-processors", description: "Third-party services we use to process data", icon: <Globe className="size-6" />, href: "/legal/sub-processors", updated: "2024-11-01" },
];

export default function LegalPage() {
  const router = useRouter();

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const tabs = [
    {
      id: "legal",
      label: "Legal Documents",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Legal Documents" description="Important legal information about using ATLVS" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {LEGAL_DOCS.map((doc) => (
              <Card key={doc.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(doc.href)}>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{doc.icon}</div>
                  <div className="flex-1">
                    <Body className="font-weight-bold font-weight-medium">{doc.title}</Body>
                    <Body size="sm" className="text-grey-400 mb-2">{doc.description}</Body>
                    <Body size="sm" className="text-grey-500">Last updated: {formatDate(doc.updated)}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-6 mt-8">
            <Body className="font-weight-bold mb-2">Questions about our legal policies?</Body>
            <Body className="text-grey-400 mb-4">Contact our legal team for any questions or concerns.</Body>
            <Button variant="outline" onClick={() => router.push("/contact")}>Contact Us</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Company",
        title: "Legal",
        description: "Legal documents and policies",
      }}
      tabs={tabs}
    />
  );
}
