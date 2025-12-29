"use client";

/**
 * Partners Page
 * Partner program information
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Handshake, Users, DollarSign, Zap, Award, Globe, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Stack,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const PARTNER_TYPES = [
  { id: "reseller", title: "Reseller Partner", description: "Sell ATLVS to your customers and earn commissions", icon: <DollarSign className="size-6" />, benefits: ["Up to 30% commission", "Sales training", "Marketing materials", "Dedicated support"] },
  { id: "integration", title: "Integration Partner", description: "Build integrations with ATLVS", icon: <Zap className="size-6" />, benefits: ["API access", "Technical support", "Co-marketing", "Partner directory listing"] },
  { id: "referral", title: "Referral Partner", description: "Refer customers and earn rewards", icon: <Users className="size-6" />, benefits: ["$500 per referral", "No minimum commitment", "Easy tracking", "Monthly payouts"] },
];

const FEATURED_PARTNERS = [
  { name: "TechCorp", type: "Reseller", logo: "TC" },
  { name: "EventPro", type: "Integration", logo: "EP" },
  { name: "StageWorks", type: "Reseller", logo: "SW" },
  { name: "LiveNation", type: "Integration", logo: "LN" },
];

export default function PartnersPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "program",
      label: "Partner Program",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-8">
            <StatCard label="Partners" value="500+" icon={<Handshake className="size-5" />} />
            <StatCard label="Countries" value="50+" icon={<Globe className="size-5" />} />
            <StatCard label="Revenue Shared" value="$2M+" icon={<DollarSign className="size-5" />} />
            <StatCard label="Integrations" value="100+" icon={<Zap className="size-5" />} />
          </Grid>

          <SectionHeader title="Partnership Types" description="Choose the program that fits your business" />
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
            {PARTNER_TYPES.map((type) => (
              <Card key={type.id} className="p-6">
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mb-4">{type.icon}</div>
                <Body className="font-weight-bold font-weight-medium mb-2">{type.title}</Body>
                <Body size="sm" className="text-grey-400 mb-4">{type.description}</Body>
                <Stack gap={2} className="mb-6">
                  {type.benefits.map((benefit, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                      <Award className="size-4 text-success" />
                      <Body size="sm">{benefit}</Body>
                    </Stack>
                  ))}
                </Stack>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/partners/apply?type=${type.id}`)}>Apply Now</Button>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Ready to Partner?</Body>
            <Body className="text-grey-400 mb-4">Join our growing network of partners</Body>
            <Button variant="solid" onClick={() => router.push("/partners/apply")}>Apply to Partner Program</Button>
          </Card>
        </Section>
      ),
    },
    {
      id: "featured",
      label: "Featured Partners",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Featured Partners" description="Some of our amazing partners" />
          <Grid cols={4} gap={6} className="grid-cols-2 md:grid-cols-4 mt-6">
            {FEATURED_PARTNERS.map((partner, idx) => (
              <Card key={idx} className="p-6 text-center">
                <div className="size-16 bg-grey-800 rounded-card flex items-center justify-center mx-auto mb-4">
                  <Body className="font-weight-bold font-weight-bold">{partner.logo}</Body>
                </div>
                <Body className="font-weight-medium">{partner.name}</Body>
                <Body size="sm" className="text-grey-400">{partner.type} Partner</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Partners",
        title: "Partner Program",
        description: "Grow your business with ATLVS",
      }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/partners/apply")}>Become a Partner</Button>}
    />
  );
}
