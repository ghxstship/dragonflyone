"use client";

/**
 * Contractors Solution Page
 * Solution for contractors and freelancers
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Briefcase, FileText, DollarSign, Calendar, Check, ArrowRight, List } from "lucide-react";
import {
  Stack,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const FEATURES = [
  { icon: <Briefcase className="size-6" />, title: "Job Management", description: "Track all your contracts and gigs" },
  { icon: <FileText className="size-6" />, title: "Document Storage", description: "Store contracts and certifications" },
  { icon: <DollarSign className="size-6" />, title: "Invoice Tracking", description: "Manage invoices and payments" },
  { icon: <Calendar className="size-6" />, title: "Availability", description: "Share your availability with clients" },
];

const BENEFITS = ["Centralized job tracking", "Professional invoicing", "Document management", "Availability calendar", "Client communication", "Payment history"];

export default function ContractorsSolutionPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <Body className="font-weight-bold text-grey-300 leading-relaxed">
              ATLVS helps contractors manage their freelance business with professional tools 
              for job tracking, invoicing, and client communication.
            </Body>
          </Card>

          <SectionHeader title="Key Features" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            {FEATURES.map((feature, idx) => (
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

          <Card className="p-8 mt-8">
            <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2">
              <div>
                <Body className="font-weight-bold font-weight-bold mb-4">Benefits</Body>
                <Stack gap={3}>
                  {BENEFITS.map((benefit, idx) => (
                    <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                      <Check className="size-5 text-success" />
                      <Body>{benefit}</Body>
                    </Stack>
                  ))}
                </Stack>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <Body className="font-weight-bold font-weight-bold mb-2">Run your business professionally</Body>
                <Body className="text-grey-400 mb-6">Tools built for freelance success</Body>
                <Button variant="solid" onClick={() => router.push("/auth/signup")} icon={<ArrowRight className="size-4" />} iconPosition="right">Get Started Free</Button>
              </div>
            </Grid>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Solutions", title: "For Contractors", description: "Professional tools for freelance success" }}
      backButton={{ label: "Solutions", href: "/solutions" }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/auth/signup")}>Sign Up Free</Button>}
    />
  );
}
