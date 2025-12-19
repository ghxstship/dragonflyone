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
} from "@ghxstship/ui";
import {
  ArrowRight,
  Briefcase,
  Users,
  Ticket,
  Clapperboard,
  Megaphone,
  TrendingUp,
  Award,
  ClipboardList,
  Wrench,
  HardHat,
  UserCheck,
  Building,
  MapPin,
  Mic2,
  Store,
  Star,
  Shield,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { solutionsNavigation } from "../../data/public-navigation";

export const runtime = "edge";

const iconMap: Record<string, LucideIcon> = {
  Clapperboard,
  Megaphone,
  TrendingUp,
  Award,
  ClipboardList,
  Wrench,
  HardHat,
  UserCheck,
  Building,
  MapPin,
  Mic2,
  Store,
  Users,
  Star,
  Shield,
};

const verticalIcons: Record<string, LucideIcon> = {
  Clapperboard,
  Zap: Star,
  Palette: Mic2,
  MapPin,
};

export default function SolutionsPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              SOLUTIONS
            </Label>
            <Display size="lg" className="text-white">
              BUILT FOR YOUR ROLE
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Whether you&apos;re producing festivals, managing venues, coordinating crews, or selling tickets—we have tools designed specifically for you.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Solutions by Role */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={16}>
            {solutionsNavigation.groups.map((group) => (
              <Stack key={group.title} gap={8}>
                <Stack gap={2}>
                  <Label size="xs" className="text-grey-500 uppercase tracking-kicker">{group.title}</Label>
                  <H1 className="text-ink-950">{group.title.toUpperCase()}</H1>
                </Stack>

                <Grid cols={4} gap={6} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {group.items.map((item) => {
                    const iconName = item.icon || "Users";
                    const IconComponent = iconMap[iconName] || Users;
                    return (
                      <NextLink key={item.href} href={item.href}>
                        <Card className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl h-full">
                          <Stack gap={4}>
                            <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                              <IconComponent className="h-6 w-6 text-ink-950" />
                            </Box>
                            <H3 size="sm" className="text-ink-950">{item.label}</H3>
                            {item.description && (
                              <Body size="xs" className="text-grey-600">{item.description}</Body>
                            )}
                            <Stack direction="horizontal" gap={1} className="items-center text-brand-pink">
                              <Label size="xs">Learn more</Label>
                              <ArrowRight className="h-3 w-3" />
                            </Stack>
                          </Stack>
                        </Card>
                      </NextLink>
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
                Different events have different needs. Explore solutions tailored to your specific vertical.
              </Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2">
              {solutionsNavigation.verticals.map((vertical, idx) => {
                const iconNames = ["Clapperboard", "Star", "Mic2", "MapPin"];
                const IconComponent = verticalIcons[iconNames[idx]] || Clapperboard;
                return (
                  <NextLink key={vertical.href} href={vertical.href}>
                    <Card className="border-2 border-ink-700 bg-ink-900 p-6 transition-all duration-150 hover:border-brand-pink h-full">
                      <Stack gap={4} className="items-center text-center">
                        <Box className="flex h-12 w-12 items-center justify-center border-2 border-ink-700 bg-ink-800">
                          <IconComponent className="h-6 w-6 text-brand-pink" />
                        </Box>
                        <H3 size="sm" className="text-white">{vertical.label}</H3>
                      </Stack>
                    </Card>
                  </NextLink>
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
              <H1 className="text-ink-950">THREE PRODUCTS. ONE PLATFORM.</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                All our solutions are powered by the GHXSTSHIP platform—three integrated products that work seamlessly together.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              <Card className="border-2 border-brand-pink bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-pink">
                    <Briefcase className="h-6 w-6 text-brand-pink" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">ATLVS</H3>
                  <Body size="xs" className="text-grey-600">Production Management</Body>
                  <NextLink href="/products/atlvs">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>
                      Learn More
                    </Button>
                  </NextLink>
                </Stack>
              </Card>

              <Card className="border-2 border-brand-cyan bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan">
                    <Users className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">COMPVSS</H3>
                  <Body size="xs" className="text-grey-600">Crew & Operations</Body>
                  <NextLink href="/products/compvss">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>
                      Learn More
                    </Button>
                  </NextLink>
                </Stack>
              </Card>

              <Card className="border-2 border-brand-yellow bg-white p-6 text-center">
                <Stack gap={4} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-yellow">
                    <Ticket className="h-6 w-6 text-brand-yellow" />
                  </Box>
                  <H3 size="sm" className="text-ink-950">GVTEWAY</H3>
                  <Body size="xs" className="text-grey-600">Ticketing & Experience</Body>
                  <NextLink href="/products/gvteway">
                    <Button variant="outline" size="sm" icon={<ArrowRight />}>
                      Learn More
                    </Button>
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
            <Display size="md" className="text-ink-950">
              NOT SURE WHERE TO START?
            </Display>
            <Body size="lg" className="text-grey-600">
              Talk to our team to get personalized recommendations based on your specific needs.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo/request">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Request a Demo
                </Button>
              </NextLink>
              <NextLink href="/products/compare">
                <Button variant="outline" size="lg">
                  Compare Products
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
