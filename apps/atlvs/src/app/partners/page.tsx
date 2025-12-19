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
import { Handshake, Code, Building2, Megaphone, ArrowRight, Check } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const partnersData = {
  hero: {
    headline: "PARTNER WITH ATLVS",
    description: "Join our ecosystem of technology partners, agencies, and consultants helping productions succeed.",
  },
  partnerTypes: [
    {
      icon: Code,
      title: "TECHNOLOGY PARTNERS",
      description: "Integrate your tools with ATLVS to reach thousands of production professionals.",
      benefits: ["API access", "Co-marketing opportunities", "Technical support", "Partner directory listing"],
    },
    {
      icon: Building2,
      title: "AGENCY PARTNERS",
      description: "Help your clients implement and optimize ATLVS for their productions.",
      benefits: ["Partner certification", "Revenue sharing", "Priority support", "Training resources"],
    },
    {
      icon: Megaphone,
      title: "REFERRAL PARTNERS",
      description: "Earn commissions by referring production companies to ATLVS.",
      benefits: ["Competitive commissions", "Marketing materials", "Deal registration", "Partner portal access"],
    },
  ],
  integrations: [
    "Slack", "QuickBooks", "Salesforce", "Google Workspace", "Microsoft 365", "Dropbox", "Asana", "Monday.com"
  ],
  stats: [
    { value: "150+", label: "Active Partners" },
    { value: "$2M+", label: "Partner Revenue" },
    { value: "500+", label: "Integrations Built" },
    { value: "98%", label: "Partner Satisfaction" },
  ],
};

export default function PartnersPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Label size="xs" className="text-on-dark-muted">
              PARTNER PROGRAM
            </Label>
            <Display size="lg" className="text-white">
              {partnersData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {partnersData.hero.description}
            </Body>
            <NextLink href="/contact">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                Become a Partner
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={8} className="sm:grid-cols-2">
            {partnersData.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display size="md" className="text-ink-950">
                  {stat.value}
                </Display>
                <Label size="xs" className="text-grey-500">
                  {stat.label}
                </Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Partner Types */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">PARTNERSHIP PROGRAMS</H1>
            <Body size="lg" className="mx-auto max-w-2xl text-grey-600">
              Choose the partnership model that fits your business.
            </Body>
          </Stack>

          <Grid cols={3} gap={6} className="sm:grid-cols-1">
            {partnersData.partnerTypes.map((type) => (
              <Card key={type.title} className="border-2 border-ink-950 bg-white p-8 shadow-md">
                <Stack gap={6}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <type.icon className="size-6 text-ink-950" />
                  </Stack>
                  <Stack gap={2}>
                    <H3 className="text-ink-950">{type.title}</H3>
                    <Body size="sm" className="text-grey-600">
                      {type.description}
                    </Body>
                  </Stack>
                  <Stack gap={2}>
                    {type.benefits.map((benefit) => (
                      <Stack key={benefit} direction="horizontal" gap={2} className="items-center">
                        <Check className="size-4 text-brand-pink" />
                        <Label size="xs" className="text-grey-600">{benefit}</Label>
                      </Stack>
                    ))}
                  </Stack>
                  <NextLink href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Integrations */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack gap={4}>
              <H1 className="text-white">INTEGRATION ECOSYSTEM</H1>
              <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary">
                Connect ATLVS with the tools your clients already use.
              </Body>
            </Stack>
            <Stack direction="horizontal" gap={6} className="flex-wrap justify-center">
              {partnersData.integrations.map((integration) => (
                <Card key={integration} inverted className="border-2 border-ink-800 bg-ink-900 px-6 py-3">
                  <Label size="sm" className="text-white">{integration}</Label>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-12 shadow-brand-lg">
            <Stack gap={8} className="items-center">
              <Stack className="flex size-16 items-center justify-center border-2 border-ink-950 bg-grey-100">
                <Handshake className="size-8 text-ink-950" />
              </Stack>
              <Display size="md" className="text-ink-950">
                READY TO PARTNER?
              </Display>
              <Body size="lg" className="text-grey-600">
                Join our partner program and help shape the future of production management.
              </Body>
              <Stack direction="horizontal" gap={4}>
                <NextLink href="/contact">
                  <Button variant="pop" size="lg" icon={<ArrowRight />}>
                    Apply Now
                  </Button>
                </NextLink>
                <NextLink href="/docs/api">
                  <Button variant="outline" size="lg">
                    View API Docs
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
