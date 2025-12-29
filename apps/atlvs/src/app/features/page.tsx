"use client";

/**
 * Features Page
 * Product features overview
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Zap, Calendar, Users, FileText, BarChart3, Shield, Globe, Smartphone, List, Star } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
}

const FEATURES: Feature[] = [
  { icon: <Calendar className="size-8" />, title: "Production Planning", description: "Plan and manage every aspect of your productions", highlights: ["Timeline management", "Task scheduling", "Milestone tracking", "Resource allocation"] },
  { icon: <Users className="size-8" />, title: "Team Collaboration", description: "Work together seamlessly with your entire team", highlights: ["Real-time updates", "Comments & mentions", "File sharing", "Role-based access"] },
  { icon: <FileText className="size-8" />, title: "Document Management", description: "Keep all your production documents organized", highlights: ["Version control", "Template library", "Digital signatures", "Secure storage"] },
  { icon: <BarChart3 className="size-8" />, title: "Analytics & Reporting", description: "Get insights into your production performance", highlights: ["Custom dashboards", "Automated reports", "Budget tracking", "Performance metrics"] },
  { icon: <Shield className="size-8" />, title: "Security & Compliance", description: "Enterprise-grade security for your data", highlights: ["SOC 2 certified", "Data encryption", "SSO support", "Audit logs"] },
  { icon: <Globe className="size-8" />, title: "Integrations", description: "Connect with your favorite tools", highlights: ["100+ integrations", "API access", "Webhooks", "Custom workflows"] },
];

const HIGHLIGHTS = [
  { icon: <Zap className="size-6" />, title: "Lightning Fast", description: "Optimized for speed and performance" },
  { icon: <Smartphone className="size-6" />, title: "Mobile Ready", description: "Access from any device, anywhere" },
  { icon: <Shield className="size-6" />, title: "Enterprise Security", description: "Bank-level security for your data" },
];

export default function FeaturesPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "all",
      label: "All Features",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-8">
            {HIGHLIGHTS.map((highlight, idx) => (
              <Card key={idx} className="p-6 text-center">
                <div className="p-3 bg-primary/20 rounded-card text-primary w-fit mx-auto mb-4">{highlight.icon}</div>
                <Body className="font-weight-bold">{highlight.title}</Body>
                <Body size="sm" className="text-grey-400">{highlight.description}</Body>
              </Card>
            ))}
          </Grid>

          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
            {FEATURES.map((feature, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{feature.icon}</div>
                  <div className="flex-1">
                    <Body className="font-weight-bold font-weight-medium mb-2">{feature.title}</Body>
                    <Body className="text-grey-400 mb-4">{feature.description}</Body>
                    <Stack gap={2}>
                      {feature.highlights.map((highlight, hidx) => (
                        <Stack key={hidx} direction="horizontal" gap={2} className="items-center">
                          <div className="size-1.5 rounded-avatar bg-primary" />
                          <Body size="sm">{highlight}</Body>
                        </Stack>
                      ))}
                    </Stack>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Ready to get started?</Body>
            <Body className="text-grey-400 mb-4">See how ATLVS can transform your production workflow</Body>
            <div className="flex gap-4 justify-center">
              <Button variant="solid" onClick={() => router.push("/demo")}>Request a Demo</Button>
              <Button variant="outline" onClick={() => router.push("/auth/signup")}>Start Free Trial</Button>
            </div>
          </Card>
        </Section>
      ),
    },
    {
      id: "highlights",
      label: "Key Benefits",
      icon: <Star className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Why Choose ATLVS?" description="The benefits that set us apart" />
          <div className="space-y-8 mt-6">
            {FEATURES.slice(0, 3).map((feature, idx) => (
              <Card key={idx} className="p-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-primary/20 rounded-card text-primary">{feature.icon}</div>
                  <div className="flex-1">
                    <Body className="font-weight-bold font-weight-bold mb-2">{feature.title}</Body>
                    <Body className="text-grey-300 font-weight-medium mb-4">{feature.description}</Body>
                    <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
                      {feature.highlights.map((highlight, hidx) => (
                        <Card key={hidx} className="p-4">
                          <div className="flex items-center gap-2">
                            <Zap className="size-4 text-primary" />
                            <Body>{highlight}</Body>
                          </div>
                        </Card>
                      ))}
                    </Grid>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Platform",
        title: "Features",
        description: "Everything you need to manage productions at scale",
      }}
      tabs={tabs}
      actions={<Button variant="solid" onClick={() => router.push("/demo")}>Get Started</Button>}
    />
  );
}
