import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const featuresData = {
  hero: {
    headline: "EVERYTHING YOU NEED TO RUN PRODUCTIONS",
    description: "A complete platform for managing projects, crews, assets, finances, and more.",
  },
  categories: [
    {
      title: "PROJECT MANAGEMENT",
      description: "Plan, execute, and deliver productions on time and on budget.",
      icon: LayoutDashboard,
      features: [
        "Multi-project dashboards",
        "Timeline & milestone tracking",
        "Task management",
        "Document collaboration",
        "Real-time status updates",
      ],
    },
    {
      title: "CREW MANAGEMENT",
      description: "Build and manage your production teams with ease.",
      icon: Users,
      features: [
        "Crew database & profiles",
        "Availability tracking",
        "Role-based assignments",
        "Certifications & compliance",
        "Communication tools",
      ],
    },
    {
      title: "FINANCIAL TOOLS",
      description: "Track budgets, expenses, and payments in one place.",
      icon: DollarSign,
      features: [
        "Budget creation & tracking",
        "Expense management",
        "Invoice generation",
        "Payment processing",
        "Financial reporting",
      ],
    },
    {
      title: "ASSET TRACKING",
      description: "Know where every piece of equipment is at all times.",
      icon: Package,
      features: [
        "Inventory management",
        "QR/barcode scanning",
        "Maintenance scheduling",
        "Rental tracking",
        "Depreciation reports",
      ],
    },
    {
      title: "SCHEDULING",
      description: "Coordinate complex schedules across multiple productions.",
      icon: Calendar,
      features: [
        "Visual calendar views",
        "Shift management",
        "Conflict detection",
        "Automated reminders",
        "Calendar integrations",
      ],
    },
    {
      title: "DOCUMENTS & CONTRACTS",
      description: "Manage all production paperwork digitally.",
      icon: FileText,
      features: [
        "Contract templates",
        "E-signatures",
        "Version control",
        "Secure storage",
        "Compliance tracking",
      ],
    },
    {
      title: "ANALYTICS & REPORTING",
      description: "Make data-driven decisions with powerful insights.",
      icon: BarChart3,
      features: [
        "Custom dashboards",
        "KPI tracking",
        "Automated reports",
        "Data exports",
        "Trend analysis",
      ],
    },
    {
      title: "SECURITY & COMPLIANCE",
      description: "Enterprise-grade security for your production data.",
      icon: Shield,
      features: [
        "SOC 2 Type II certified",
        "SSO & 2FA",
        "Role-based permissions",
        "Audit logs",
        "Data encryption",
      ],
    },
  ],
  highlights: [
    { icon: Zap, title: "FAST", description: "Built for speed with instant load times" },
    { icon: Globe, title: "GLOBAL", description: "Multi-currency and timezone support" },
    { icon: Shield, title: "SECURE", description: "Enterprise-grade security standards" },
  ],
};

export default function FeaturesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              FEATURES
            </Label>
            <Display size="lg" className="text-white">
              {featuresData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {featuresData.hero.description}
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Watch Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Highlights */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={3} gap={8}>
            {featuresData.highlights.map((item) => (
              <Stack key={item.title} direction="horizontal" gap={4} className="items-center">
                <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <item.icon className="size-6 text-ink-950" />
                </Stack>
                <Stack gap={1}>
                  <H3 size="sm" className="text-ink-950">{item.title}</H3>
                  <Label size="xs" className="text-grey-500">{item.description}</Label>
                </Stack>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Feature Categories */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={8}>
            {featuresData.categories.map((category) => (
              <Card key={category.title} className="border-2 border-ink-950 bg-white p-8 shadow-md">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <category.icon className="size-6 text-ink-950" />
                    </Stack>
                    <Stack gap={2} className="flex-1">
                      <H3 className="text-ink-950">{category.title}</H3>
                      <Body size="sm" className="text-grey-600">
                        {category.description}
                      </Body>
                    </Stack>
                  </Stack>
                  <Grid cols={2} gap={2}>
                    {category.features.map((feature) => (
                      <Label key={feature} size="xs" className="text-grey-600">
                        {feature}
                      </Label>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO TRANSFORM YOUR PRODUCTIONS?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Start your 14-day free trial today. No credit card required.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/pricing">
                <Button variant="outlineWhite" size="lg">
                  View Pricing
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
