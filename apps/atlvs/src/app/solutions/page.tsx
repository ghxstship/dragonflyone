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
import {
  ArrowRight,
  Briefcase,
  Users,
  Ticket,
  Clapperboard,
  TrendingUp,
  ClipboardList,
  HardHat,
  Building,
  MapPin,
  Mic2,
  DollarSign,
  UserCheck,
  Megaphone,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const roleGroups = [
  {
    title: "LEADERSHIP & EXECUTIVE",
    roles: [
      { role: "CEO / Owner", tier: "ENTERPRISE", byo: "Nothing", icon: TrendingUp },
      { role: "COO / Operations Director", tier: "PRODUCTION", byo: "Ticketing", icon: ClipboardList },
      { role: "CFO / Finance Director", tier: "ATLVS or EXPERIENCE", byo: "Crews", icon: DollarSign },
      { role: "Head of Production", tier: "PRODUCTION", byo: "Ticketing", icon: Clapperboard },
    ],
  },
  {
    title: "SALES & MARKETING",
    roles: [
      { role: "Head of Sales", tier: "ATLVS or EXPERIENCE", byo: "Crews", icon: TrendingUp },
      { role: "Talent Buyer", tier: "ATLVS", byo: "Crews, Ticketing", icon: Mic2 },
      { role: "Marketing Director", tier: "EXPERIENCE", byo: "Crews", icon: Megaphone },
      { role: "Partnerships Manager", tier: "ATLVS", byo: "Crews, Ticketing", icon: UserCheck },
    ],
  },
  {
    title: "OPERATIONS & PRODUCTION",
    roles: [
      { role: "Production Manager", tier: "PRODUCTION", byo: "Ticketing", icon: Clapperboard },
      { role: "Site Manager", tier: "COMPVSS", byo: "CRM, Finance, Ticketing", icon: MapPin },
      { role: "Technical Director", tier: "COMPVSS or PRODUCTION", byo: "Varies", icon: HardHat },
      { role: "Crew Coordinator", tier: "COMPVSS", byo: "CRM, Finance, Ticketing", icon: Users },
    ],
  },
  {
    title: "VENUE & BOX OFFICE",
    roles: [
      { role: "Venue Manager", tier: "EXPERIENCE", byo: "Crews", icon: Building },
      { role: "Box Office Manager", tier: "GVTEWAY", byo: "CRM, Finance, Crews", icon: Ticket },
      { role: "Guest Services Director", tier: "GVTEWAY or EXPERIENCE", byo: "Crews", icon: UserCheck },
      { role: "Operations Director", tier: "OPERATIONS", byo: "CRM, Finance", icon: ClipboardList },
    ],
  },
];

const verticals = [
  {
    name: "PRODUCTIONS",
    description: "Concerts, festivals, tours",
    recommendedTiers: ["EXPERIENCE", "PRODUCTION", "ENTERPRISE"],
    typicalByo: "Crews (ConnectTeam, Deputy)",
    icon: Clapperboard,
  },
  {
    name: "ACTIVATIONS",
    description: "Brand events, corporate",
    recommendedTiers: ["ATLVS", "PRODUCTION"],
    typicalByo: "Ticketing (not needed)",
    icon: Megaphone,
  },
  {
    name: "INSTALLATIONS",
    description: "Seasonal, immersive experiences",
    recommendedTiers: ["OPERATIONS", "PRODUCTION", "ENTERPRISE"],
    typicalByo: "CRM (Salesforce)",
    icon: MapPin,
  },
  {
    name: "DESTINATIONS",
    description: "Venues, resorts, attractions",
    recommendedTiers: ["GVTEWAY", "ATLVS", "OPERATIONS"],
    typicalByo: "Crews (Deputy), CRM (HubSpot)",
    icon: Building,
  },
];

export default function SolutionsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-brand-pink">THE INDUSTRY STANDARD</Label>
            <Display size="lg" className="text-white">BUILT FOR YOUR WORLD</Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              By role. By vertical. By scale. The industry standard for productions, activations, installations, and destinations.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Solutions by Role */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={16}>
            {roleGroups.map((group) => (
              <Stack key={group.title} gap={8}>
                <Stack gap={2}>
                  <Label size="xs" className="text-grey-500 uppercase tracking-kicker">{group.title}</Label>
                  <H1 className="text-ink-950">{group.title}</H1>
                </Stack>

                <Grid cols={4} gap={6} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {group.roles.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Card key={item.role} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl h-full">
                        <Stack gap={4}>
                          <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                            <IconComponent className="h-6 w-6 text-ink-950" />
                          </Box>
                          <H3 size="sm" className="text-ink-950">{item.role}</H3>
                          <Stack gap={2}>
                            <Stack gap={1}>
                              <Label size="xs" className="text-success">RECOMMENDED TIER</Label>
                              <Text size="sm" className="text-ink-950 font-weight-semibold">{item.tier}</Text>
                            </Stack>
                            <Stack gap={1}>
                              <Label size="xs" className="text-grey-500">BYO</Label>
                              <Text size="xs" className="text-grey-600">{item.byo}</Text>
                            </Stack>
                          </Stack>
                          <NextLink href="/pricing" className="mt-auto">
                            <Stack direction="horizontal" gap={1} className="items-center text-brand-pink">
                              <Label size="xs">See pricing</Label>
                              <ArrowRight className="h-3 w-3" />
                            </Stack>
                          </NextLink>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
              </Stack>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* By Vertical */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500 uppercase tracking-kicker">BY VERTICAL</Label>
              <H1 className="text-white">SOLUTIONS BY EVENT TYPE</H1>
              <Body size="lg" className="text-grey-400 max-w-2xl mx-auto">
                Different events have different needs. Here&apos;s what we see most often.
              </Body>
            </Stack>

            <Grid cols={2} gap={6} className="sm:grid-cols-1">
              {verticals.map((vertical) => {
                const IconComponent = vertical.icon;
                return (
                  <Card key={vertical.name} className="border-2 border-ink-700 bg-ink-900 p-6 transition-all duration-150 hover:border-brand-pink">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-700 bg-ink-800">
                          <IconComponent className="h-6 w-6 text-brand-pink" />
                        </Box>
                        <Stack gap={1}>
                          <H3 size="sm" className="text-white">{vertical.name}</H3>
                          <Text size="xs" className="text-grey-400">{vertical.description}</Text>
                        </Stack>
                      </Stack>
                      <Stack gap={2}>
                        <Label size="xs" className="text-success">RECOMMENDED TIERS</Label>
                        <Text size="sm" className="text-grey-300">{vertical.recommendedTiers.join(', ')}</Text>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-grey-500">TYPICAL BYO</Label>
                        <Text size="xs" className="text-grey-400">{vertical.typicalByo}</Text>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Platform Overview */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">THREE PRODUCTS. SEVEN TIERS.</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Use one, use two, use all three. Keep what works—add what&apos;s missing.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              <Card className="border-2 border-brand-pink bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-pink">
                    <Briefcase className="h-6 w-6 text-brand-pink" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">ATLVS</H3>
                  <Body size="xs" className="text-grey-600">CRM, Finance, Projects</Body>
                  <Text size="xs" className="text-grey-500">Replaces Monday + QuickBooks + HubSpot</Text>
                  <NextLink href="/products/atlvs">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>Learn More</Button>
                  </NextLink>
                </Stack>
              </Card>

              <Card className="border-2 border-brand-cyan bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan">
                    <Users className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">COMPVSS</H3>
                  <Body size="xs" className="text-grey-600">Crews, Scheduling, Site Ops</Body>
                  <Text size="xs" className="text-grey-500">Replaces ConnectTeam, Deputy, When I Work</Text>
                  <NextLink href="/products/compvss">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>Learn More</Button>
                  </NextLink>
                </Stack>
              </Card>

              <Card className="border-2 border-brand-yellow bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-yellow">
                    <Ticket className="h-6 w-6 text-brand-yellow" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">GVTEWAY</H3>
                  <Body size="xs" className="text-grey-600">Ticketing, Fans, Experience</Body>
                  <Text size="xs" className="text-grey-500">Replaces Eventbrite, DICE, Ticketmaster</Text>
                  <NextLink href="/products/gvteway">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>Learn More</Button>
                  </NextLink>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">NOT SURE WHERE TO START?</Display>
            <Body size="lg" className="text-grey-600">
              Tell us what tools you use—we&apos;ll recommend the right tier.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>Get a Recommendation</Button>
              </NextLink>
              <NextLink href="/products/compare">
                <Button variant="outline" size="lg">Compare All Tiers</Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
