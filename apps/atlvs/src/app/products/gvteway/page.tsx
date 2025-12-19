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
} from "@ghxstship/ui";
import {
  Ticket,
  ArrowRight,
  Check,
  Search,
  Calendar,
  Heart,
  ShoppingBag,
  Megaphone,
  Star,
  Trophy,
  Gift,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { atlvsProductsData, atlvsV3Features } from "../../../data/atlvs";

export const runtime = "edge";

const capabilityIcons: Record<string, LucideIcon> = {
  Search,
  Ticket,
  Calendar,
  Heart,
  ShoppingBag,
  Megaphone,
};

export default function GvtewayProductPage() {
  const product = atlvsProductsData.gvteway;
  const gamificationFeature = atlvsV3Features.differentiation.features.find(f => f.id === "DF-003");

  const ticketingFeatures = [
    { title: "Multiple Ticket Types", description: "GA, VIP, reserved seating, packages, and add-ons" },
    { title: "Dynamic Pricing", description: "Optimize revenue with demand-based pricing algorithms" },
    { title: "Anti-Scalping Protection", description: "Transferable tickets with identity verification" },
    { title: "Mobile Tickets", description: "QR code tickets with Apple Wallet and Google Pay support" },
  ];

  const engagementFeatures = [
    { title: "Pre-Event Gamification", description: "Build anticipation with challenges, badges, and rewards" },
    { title: "Community Features", description: "Fan forums, reviews, and social connections" },
    { title: "UGC & Social Walls", description: "Curate and display user-generated content" },
    { title: "Loyalty Programs", description: "Reward repeat attendees with points and perks" },
  ];

  const marketingFeatures = [
    { title: "Email Campaigns", description: "Targeted emails with dynamic content and automation" },
    { title: "SMS Marketing", description: "Reach fans directly with text message campaigns" },
    { title: "Social Integration", description: "Connect with fans across social platforms" },
    { title: "Influencer Tools", description: "Track referrals and manage ambassador programs" },
  ];

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Box className="p-3 border-2 border-brand-yellow bg-ink-800">
                  <Ticket className="h-6 w-6 text-brand-yellow" />
                </Box>
                <Label size="sm" className="text-brand-yellow uppercase tracking-kicker">
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
                    <Ticket className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Event Discovery Page
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
              <H1 className="text-ink-950">THE COMPLETE FAN EXPERIENCE</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                From discovery to purchase to post-event engagement—create unforgettable experiences for your fans.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
              {product.capabilities.map((cap) => {
                const IconComponent = capabilityIcons[cap.icon] || Ticket;
                return (
                  <Card key={cap.title} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                    <Stack gap={4}>
                      <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-yellow bg-grey-100">
                        <IconComponent className="h-6 w-6 text-brand-yellow" />
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

      {/* Ticketing */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-yellow uppercase tracking-kicker">TICKETING</Label>
                <H1 className="text-ink-950">SELL MORE TICKETS</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                A complete ticketing platform with everything you need to maximize sales and minimize friction. From single events to multi-day festivals.
              </Body>
              <Stack gap={3}>
                {ticketingFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-yellow" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-ink-950">{feature.title}</Text>
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
                    <Ticket className="h-16 w-16 text-grey-400 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
                      Ticket Selection
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Fan Engagement */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-square border-ink-700 bg-ink-900 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <Heart className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      Fan Engagement Hub
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-yellow uppercase tracking-kicker">FAN ENGAGEMENT</Label>
                <H1 className="text-white">BUILD SUPERFANS</H1>
              </Stack>
              <Body size="lg" className="text-grey-400">
                Turn casual attendees into loyal superfans with gamification, community features, and personalized experiences that keep them coming back.
              </Body>
              <Stack gap={3}>
                {engagementFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-yellow" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-white">{feature.title}</Text>
                      <Text size="xs" className="text-grey-500">{feature.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Gamification Highlight (V3) */}
      {gamificationFeature && (
        <FullBleedSection background="white" className="py-24">
          <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
            <Card className="border-2 border-brand-yellow bg-white p-8 lg:p-12 shadow-brand-xl">
              <Grid cols={2} gap={8} className="items-center">
                <Stack gap={6}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="flex h-10 w-10 items-center justify-center border-2 border-brand-yellow bg-grey-100">
                      <Sparkles className="h-5 w-5 text-brand-yellow" />
                    </Box>
                    <Label size="xs" className="text-brand-yellow">EXCLUSIVE FEATURE</Label>
                  </Stack>
                  <H1 className="text-ink-950">{gamificationFeature.name.toUpperCase()}</H1>
                  <Body size="lg" className="text-grey-600">
                    {gamificationFeature.description}. Transform the pre-event period into an engaging experience that builds anticipation and reduces no-shows.
                  </Body>
                  <Stack gap={2}>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Trophy className="h-4 w-4 text-brand-yellow" />
                      <Text size="sm" className="text-grey-700">Challenges and missions</Text>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Star className="h-4 w-4 text-brand-yellow" />
                      <Text size="sm" className="text-grey-700">Achievement badges</Text>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Gift className="h-4 w-4 text-brand-yellow" />
                      <Text size="sm" className="text-grey-700">Points and rewards</Text>
                    </Stack>
                  </Stack>
                </Stack>
                <Box className="hidden lg:block">
                  <Card className="border-2 aspect-video border-ink-950 bg-grey-100">
                    <Box className="flex h-full items-center justify-center">
                      <Stack gap={4} className="text-center">
                        <Trophy className="h-12 w-12 text-grey-400 mx-auto" />
                        <Text className="font-mono text-mono-xs uppercase tracking-label text-grey-400">
                          Gamification Dashboard
                        </Text>
                      </Stack>
                    </Box>
                  </Card>
                </Box>
              </Grid>
            </Card>
          </Container>
        </FullBleedSection>
      )}

      {/* Marketing Tools */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-yellow uppercase tracking-kicker">MARKETING</Label>
                <H1 className="text-ink-950">REACH YOUR AUDIENCE</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                Built-in marketing tools to promote your events, reach new audiences, and keep fans engaged before, during, and after the show.
              </Body>
              <Stack gap={3}>
                {marketingFeatures.map((feature) => (
                  <Stack key={feature.title} direction="horizontal" gap={3} className="items-start">
                    <Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-yellow" />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-ink-950">{feature.title}</Text>
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
                    <Megaphone className="h-16 w-16 text-grey-400 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
                      Marketing Hub
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Integration with ATLVS */}
      <FullBleedSection background="ink" className="py-16">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-6">
            <Stack gap={2}>
              <H3 className="text-white">Powered by ATLVS</H3>
              <Body className="text-grey-400">Ticket sales and fan data sync directly with your production management tools.</Body>
            </Stack>
            <NextLink href="/products/atlvs">
              <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                Learn About ATLVS
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              READY TO CREATE SUPERFANS?
            </Display>
            <Body size="lg" className="text-grey-600 max-w-xl">
              Give your fans the experience they deserve. Start selling tickets and building community today.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/pricing">
                <Button variant="outline" size="lg">
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
