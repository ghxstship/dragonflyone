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
  Box,
  Text,
} from "@ghxstship/ui";
import { Briefcase, Users, Ticket, ArrowRight, Check, Zap, Shield, Globe, RefreshCw } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const products = [
  {
    name: 'GVTEWAY',
    tagline: 'OWN THE DOOR',
    description: 'Full-service ticketing platform built for live entertainment. Own your fan data, lower your fees, escape platform lock-in.',
    icon: Ticket,
    color: 'brand-yellow',
    replaces: ['Eventbrite', 'DICE', 'Ticketmaster', 'Universe', 'See Tickets'],
    capabilities: ['Event publishing & discovery', 'Box office & will-call', 'Fan CRM & marketing', 'Membership & loyalty', 'Real-time analytics'],
    href: '/products/gvteway',
  },
  {
    name: 'COMPVSS',
    tagline: 'WORK THE SITE',
    description: 'Crew management for productions that actually scale. Punch lists, timekeeping, scheduling, and cross-org collaboration.',
    icon: Users,
    color: 'brand-cyan',
    replaces: ['ConnectTeam', 'Deputy', 'When I Work', 'Sling', '7shifts'],
    capabilities: ['Crew scheduling', 'Digital timekeeping', 'Punch lists & tasks', 'Site communications', 'Cross-org JOIN'],
    href: '/products/compvss',
  },
  {
    name: 'ATLVS',
    tagline: 'RUN THE SHOW',
    description: 'Business operations for live entertainment. CRM, finance, projects, vendors—everything an executive needs in one place.',
    icon: Briefcase,
    color: 'brand-pink',
    replaces: ['Monday + QuickBooks + HubSpot', 'Salesforce', 'Airtable + spreadsheets'],
    capabilities: ['CRM (deals, contacts, venues)', 'Project management', 'Financial management', 'Vendor management', 'Reporting & analytics'],
    href: '/products/atlvs',
  },
];

const colorMap: Record<string, string> = {
  'brand-yellow': 'text-brand-yellow border-brand-yellow',
  'brand-cyan': 'text-brand-cyan border-brand-cyan',
  'brand-pink': 'text-brand-pink border-brand-pink',
};

export default function ProductsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-brand-pink">THE INDUSTRY STANDARD</Label>
            <Display size="lg" className="text-white">THREE PRODUCTS. ONE INDUSTRY STANDARD.</Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Modular by design. Use one, two, or all three. Built for every vertical, compatible with every stack.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Products Grid */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={8} className="sm:grid-cols-1 lg:grid-cols-3">
            {products.map((product) => {
              const IconComponent = product.icon;
              const colors = colorMap[product.color] || colorMap['brand-pink'];
              return (
                <Card key={product.name} className="group border-2 border-ink-950 bg-white p-8 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                  <Stack gap={6}>
                    {/* Icon and Name */}
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Box className={`p-3 border-2 ${colors}`}>
                        <IconComponent className={`h-6 w-6 ${colors.split(" ")[0]}`} />
                      </Box>
                      <Stack gap={1}>
                        <H3 className="text-ink-950">{product.name}</H3>
                        <Label size="xs" className="text-grey-500">{product.tagline}</Label>
                      </Stack>
                    </Stack>

                    {/* Description */}
                    <Body size="md" className="text-grey-600">{product.description}</Body>

                    {/* Replaces */}
                    <Stack gap={2}>
                      <Label size="xs" className="text-success">REPLACES</Label>
                      <Text size="sm" className="text-grey-600">{product.replaces.join(', ')}</Text>
                    </Stack>

                    {/* Capabilities */}
                    <Stack gap={3}>
                      {product.capabilities.map((cap) => (
                        <Stack key={cap} direction="horizontal" gap={3} className="items-start">
                          <Check className={`h-4 w-4 mt-0.5 shrink-0 ${colors.split(" ")[0]}`} />
                          <Text size="sm" className="text-grey-700">{cap}</Text>
                        </Stack>
                      ))}
                    </Stack>

                    {/* CTA */}
                    <NextLink href={product.href}>
                      <Button variant="outline" size="md" fullWidth icon={<ArrowRight />}>
                        Explore {product.name}
                      </Button>
                    </NextLink>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* BYO Message */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-8 sm:py-12">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-brand-pink bg-brand-pink/5 p-8 text-center">
            <Stack gap={4} className="items-center">
              <RefreshCw className="h-8 w-8 text-brand-pink" />
              <H3 className="text-ink-950">BRING YOUR OWN</H3>
              <Body className="text-grey-600 max-w-xl">
                Already have tools you love? Keep them. Use GVTEWAY with your Salesforce. Use COMPVSS with your Eventbrite. Use ATLVS with your ConnectTeam. Mix and match.
              </Body>
              <NextLink href="/pricing">
                <Button variant="pop" size="md" icon={<ArrowRight />}>See Tier Options</Button>
              </NextLink>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Platform Benefits */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={16}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">BETTER TOGETHER</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Each product is powerful alone. Together, they eliminate silos and streamline everything.
              </Body>
            </Stack>

            <Grid cols={3} gap={8} className="sm:grid-cols-1">
              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Zap className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">REAL-TIME SYNC</H3>
                <Body size="sm" className="text-grey-600">
                  Data flows seamlessly. Crew costs hit budgets. Ticket sales hit P&L. No exports.
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Shield className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">UNIFIED SECURITY</H3>
                <Body size="sm" className="text-grey-600">
                  Single sign-on, role-based access, enterprise-grade security across all products.
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Globe className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">LOWER FEES</H3>
                <Body size="sm" className="text-grey-600">
                  Bundle products, lower transaction fees. Enterprise gets the lowest rates.
                </Body>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Compare CTA */}
      <FullBleedSection background="ink" className="py-8 sm:py-12 lg:py-16">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-6">
            <Stack gap={2}>
              <H3 className="text-white">Not sure which products you need?</H3>
              <Body className="text-grey-400">Tell us what tools you already use—we&apos;ll show you the gaps.</Body>
            </Stack>
            <NextLink href="/products/compare">
              <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>Compare Products</Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">READY TO REPLACE THE CHAOS?</Display>
            <Body size="lg" className="text-grey-600">Start with one product. Add more when you&apos;re ready. Your data will be waiting.</Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup"><Button variant="pop" size="lg" icon={<ArrowRight />}>Start Free Trial</Button></NextLink>
              <NextLink href="/demo"><Button variant="outline" size="lg">Watch Demo</Button></NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
