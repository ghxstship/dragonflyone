"use client";

/**
 * Sub-processors Page
 * Third-party data processors
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Globe, List, Download } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface SubProcessor {
  name: string;
  purpose: string;
  location: string;
  category: string;
}

const SUB_PROCESSORS: SubProcessor[] = [
  { name: "Amazon Web Services", purpose: "Cloud infrastructure and hosting", location: "United States", category: "Infrastructure" },
  { name: "Google Cloud Platform", purpose: "Cloud services and analytics", location: "United States", category: "Infrastructure" },
  { name: "Stripe", purpose: "Payment processing", location: "United States", category: "Payments" },
  { name: "SendGrid", purpose: "Email delivery", location: "United States", category: "Communications" },
  { name: "Intercom", purpose: "Customer support", location: "United States", category: "Support" },
  { name: "Sentry", purpose: "Error monitoring", location: "United States", category: "Monitoring" },
  { name: "Mixpanel", purpose: "Product analytics", location: "United States", category: "Analytics" },
  { name: "Cloudflare", purpose: "CDN and security", location: "United States", category: "Security" },
];

export default function SubProcessorsPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "processors",
      label: "Sub-processors",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Body className="font-weight-bold">Sub-processor List</Body>
                <Body size="sm" className="text-grey-400">Last updated: November 1, 2024</Body>
              </div>
              <Button variant="outline" size="sm" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <SectionHeader title="About Sub-processors" />
            <Body className="text-grey-300 mt-4">
              ATLVS uses third-party service providers (sub-processors) to help deliver our services. 
              These sub-processors may process personal data on our behalf. We carefully vet all sub-processors 
              to ensure they meet our security and privacy standards.
            </Body>
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub-processor</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUB_PROCESSORS.map((processor, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Body className="font-weight-medium">{processor.name}</Body></TableCell>
                    <TableCell><Body size="sm" className="text-grey-400">{processor.purpose}</Body></TableCell>
                    <TableCell><Body size="sm">{processor.location}</Body></TableCell>
                    <TableCell><Badge variant="outline">{processor.category}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-6 mt-6">
            <Body className="font-weight-bold mb-2">Subscribe to Updates</Body>
            <Body className="text-grey-400 mb-4">Get notified when we add or change sub-processors.</Body>
            <Button variant="outline">Subscribe</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Legal", title: "Sub-processors", description: "Third-party services that process data on our behalf" }}
      backButton={{ label: "Legal", href: "/legal" }}
      tabs={tabs}
    />
  );
}
