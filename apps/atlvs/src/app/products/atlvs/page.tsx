import { AtlvsAppLayout } from "../../../components/app-layout";
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
  Article,
} from "@ghxstship/ui";
import {
  Briefcase,
  ArrowRight,
  Check,
  FolderKanban,
  DollarSign,
  Package,
  Building,
  Users,
  BarChart3,
  Calendar,
  Globe,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { atlvsProductsData, atlvsV3Features } from "../../../data/atlvs";

export const runtime = "edge";

const capabilityIcons: Record<string, LucideIcon> = {
  FolderKanban,
  DollarSign,
  Package,
  Building,
  Users,
  BarChart3,
};

export default function AtlvsProductPage() {
  const product = atlvsProductsData.atlvs;
  const venueFeatures = atlvsV3Features.venueManagement.features.filter(f => f.priority === "critical").slice(0, 6);
  const vendorFeatures = atlvsV3Features.vendorServices.features.filter(f => f.priority === "critical").slice(0, 6);
  const differentiators = atlvsV3Features.differentiation.features;

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Box className="p-3 border-2 border-brand-pink bg-ink-800">
                  <Briefcase className="h-6 w-6 text-brand-pink" />
                </Box>
                <Label size="sm" className="text-brand-pink uppercase tracking-kicker">
                  {product.tagline}
                </Label>
              </Stack>
              <Display size="lg" className="text-white">
                {product.headline}
              </Display>
              <Body size="lg" className="text-on-dark-secondary">
                {product.description}
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
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-video border-ink-700 bg-ink-900 shadow-brand-xl">
                <Box className="flex h-full items-center justify-center">
                  <Stack gap={4} className="text-center">
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Product Dashboard
                    </Text>
                    <Text className="font-display text-h4-md uppercase text-grey-600">
                      Screenshot Placeholder
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Core Capabilities */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500">CORE CAPABILITIES</Label>
              <H1 className="text-ink-950">EVERYTHING YOU NEED TO RUN PRODUCTIONS</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Six integrated modules that work together to give you complete control over your production operation.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
              {product.capabilities.map((cap) => {
                const IconComponent = capabilityIcons[cap.icon] || FolderKanban;
                return (
                  <Card key={cap.title} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                    <Stack gap={4}>
                      <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                        <IconComponent className="h-6 w-6 text-ink-950" />
                      </Box>
                      <H3 size="sm" className="text-ink-950">{cap.title}</H3>
                      <Body size="sm" className="text-grey-600">{cap.description}</Body>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Venue Management Module (V3 Expansion) */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-pink uppercase tracking-kicker">NEW MODULE</Label>
                <H1 className="text-ink-950">{atlvsV3Features.venueManagement.title.toUpperCase()}</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                {atlvsV3Features.venueManagement.description}. From lead capture to payment collection, manage your entire venue sales process in one place.
              </Body>
              <Stack gap={3}>
                {venueFeatures.map((feature) => (
                  <Stack key={feature.id} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-pink" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-ink-950">{feature.name}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-square border-ink-950 bg-grey-100 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Calendar className="h-16 w-16 text-grey-400 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
                      Venue Calendar & Booking
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Vendor Services Module (V3 Expansion) */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Box className="hidden lg:block order-2 lg:order-1">
              <Card className="border-2 aspect-square border-ink-700 bg-ink-900 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Building className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Vendor Management Hub
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
            <Stack gap={8} className="order-1 lg:order-2">
              <Stack gap={2}>
                <Label size="xs" className="text-brand-cyan uppercase tracking-kicker">NEW MODULE</Label>
                <H1 className="text-white">{atlvsV3Features.vendorServices.title.toUpperCase()}</H1>
              </Stack>
              <Body size="lg" className="text-grey-400">
                {atlvsV3Features.vendorServices.description}. The most comprehensive vendor management system in the industry.
              </Body>
              <Stack gap={3}>
                {vendorFeatures.map((feature) => (
                  <Stack key={feature.id} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-cyan" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-white">{feature.name}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Blue Ocean Differentiators */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500">WHAT SETS US APART</Label>
              <H1 className="text-ink-950">FEATURES NO ONE ELSE HAS</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Blue ocean features that give you capabilities your competitors can only dream about.
              </Body>
            </Stack>

            <Grid cols={2} gap={6} className="sm:grid-cols-1">
              {differentiators.map((feature) => (
                <Article key={feature.id} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                  <Stack gap={4}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Box className="flex h-10 w-10 items-center justify-center border-2 border-brand-pink bg-grey-100">
                        <Sparkles className="h-5 w-5 text-brand-pink" />
                      </Box>
                      <Label size="xs" className="text-brand-pink">{feature.id}</Label>
                    </Stack>
                    <H3 size="sm" className="text-ink-950">{feature.name}</H3>
                    <Body size="sm" className="text-grey-600">{feature.description}</Body>
                  </Stack>
                </Article>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Integration & Security */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="sm:grid-cols-1">
            <Card className="border-2 border-ink-950 bg-white p-8">
              <Stack gap={6}>
                <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Globe className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 className="text-ink-950">INTEGRATIONS</H3>
                <Body size="sm" className="text-grey-600">
                  Connect ATLVS to the tools you already use. Pre-built integrations with QuickBooks, Stripe, Salesforce, Slack, and 50+ more.
                </Body>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">One-click setup</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">Custom API access</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">Webhook notifications</Text>
                  </Stack>
                </Stack>
                <NextLink href="/integrations">
                  <Button variant="outline" size="sm" icon={<ArrowRight />}>
                    View All Integrations
                  </Button>
                </NextLink>
              </Stack>
            </Card>

            <Card className="border-2 border-ink-950 bg-white p-8">
              <Stack gap={6}>
                <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Zap className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 className="text-ink-950">ENTERPRISE SECURITY</H3>
                <Body size="sm" className="text-grey-600">
                  Your data is protected with enterprise-grade security. SOC 2 Type II certified with advanced encryption and access controls.
                </Body>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">SOC 2 Type II certified</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">SSO & 2FA authentication</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Check className="h-4 w-4 text-brand-pink" />
                    <Text size="sm" className="text-grey-700">Role-based permissions</Text>
                  </Stack>
                </Stack>
                <NextLink href="/security">
                  <Button variant="outline" size="sm" icon={<ArrowRight />}>
                    Learn About Security
                  </Button>
                </NextLink>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO TAKE CONTROL?
            </Display>
            <Body size="lg" className="text-grey-400 max-w-xl">
              Join thousands of production professionals who use ATLVS to run their operations. Start your 14-day free trial today.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" inverted icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/pricing">
                <Button variant="outlineWhite" size="lg">
                  View Pricing
                </Button>
              </NextLink>
            </Stack>
            <Label size="xs" className="text-grey-500">
              No credit card required • 14-day free trial • Cancel anytime
            </Label>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
