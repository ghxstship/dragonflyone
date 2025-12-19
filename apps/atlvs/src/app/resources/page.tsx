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
  HelpCircle,
  BookOpen,
  Code,
  FileText,
  Trophy,
  LayoutTemplate,
  MessageSquare,
  Activity,
  Users,
  GraduationCap,
  Video,
  Building2,
  Briefcase,
  Newspaper,
  Handshake,
  Mail,
  Rocket,
  Play,
  Calendar,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { resourcesNavigation } from "../../data/public-navigation";

export const runtime = "edge";

const iconMap: Record<string, LucideIcon> = {
  HelpCircle,
  BookOpen,
  Code,
  FileText,
  Trophy,
  LayoutTemplate,
  MessageSquare,
  Activity,
  Users,
  GraduationCap,
  Video,
  Building2,
  Briefcase,
  Newspaper,
  Handshake,
  Mail,
  Rocket,
  Play,
  Calendar,
  Sparkles,
};

const featuredResources = [
  {
    title: "Getting Started Guide",
    description: "Everything you need to know to get up and running with GHXSTSHIP in 30 minutes or less.",
    href: "/guides/getting-started",
    icon: "Rocket",
    tag: "Guide",
  },
  {
    title: "Watch Product Demo",
    description: "See ATLVS, COMPVSS, and GVTEWAY in action with our guided product tour.",
    href: "/demo",
    icon: "Play",
    tag: "Video",
  },
  {
    title: "API Documentation",
    description: "Complete reference for developers integrating with the GHXSTSHIP platform.",
    href: "/docs/api",
    icon: "Code",
    tag: "Developer",
  },
  {
    title: "What's New",
    description: "Stay up to date with the latest features, improvements, and announcements.",
    href: "/changelog",
    icon: "Sparkles",
    tag: "Updates",
  },
];

const upcomingWebinars = [
  {
    title: "Mastering Multi-Event Budgeting",
    date: "Coming Soon",
    duration: "45 min",
  },
  {
    title: "Crew Scheduling Best Practices",
    date: "Coming Soon",
    duration: "30 min",
  },
  {
    title: "Fan Engagement Strategies That Work",
    date: "Coming Soon",
    duration: "45 min",
  },
];

export default function ResourcesPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              RESOURCES
            </Label>
            <Display size="lg" className="text-white">
              LEARN. CONNECT. SUCCEED.
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Everything you need to get the most out of GHXSTSHIP—guides, tutorials, documentation, and a community of production professionals.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Featured Resources */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500 uppercase tracking-kicker">FEATURED</Label>
              <H1 className="text-ink-950">START HERE</H1>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {featuredResources.map((resource) => {
                const IconComponent = iconMap[resource.icon] || FileText;
                return (
                  <NextLink key={resource.href} href={resource.href}>
                    <Card className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl h-full">
                      <Stack gap={4}>
                        <Stack direction="horizontal" gap={3} className="items-center justify-between">
                          <Box className="flex h-10 w-10 items-center justify-center border-2 border-brand-pink bg-grey-100">
                            <IconComponent className="h-5 w-5 text-brand-pink" />
                          </Box>
                          <Label size="xs" className="text-brand-pink">{resource.tag}</Label>
                        </Stack>
                        <H3 size="sm" className="text-ink-950">{resource.title}</H3>
                        <Body size="xs" className="text-grey-600">{resource.description}</Body>
                        <Stack direction="horizontal" gap={1} className="items-center text-brand-pink">
                          <Label size="xs">Explore</Label>
                          <ArrowRight className="h-3 w-3" />
                        </Stack>
                      </Stack>
                    </Card>
                  </NextLink>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Resource Categories */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Stack gap={16}>
            {resourcesNavigation.groups.map((group) => (
              <Stack key={group.title} gap={8}>
                <Stack gap={2}>
                  <Label size="xs" className="text-grey-500 uppercase tracking-kicker">{group.title}</Label>
                  <H1 className="text-ink-950">{group.title.toUpperCase()}</H1>
                </Stack>

                <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const iconName = item.icon || "FileText";
                    const IconComponent = iconMap[iconName] || FileText;
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

      {/* Upcoming Webinars */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-brand-pink uppercase tracking-kicker">WEBINARS</Label>
                <H1 className="text-white">LEARN FROM THE EXPERTS</H1>
              </Stack>
              <Body size="lg" className="text-grey-400">
                Join live webinars hosted by production professionals and GHXSTSHIP experts. Get practical tips, see advanced features in action, and ask questions in real-time.
              </Body>
              <NextLink href="/webinars">
                <Button variant="outlineWhite" size="md" icon={<ArrowRight />}>
                  View All Webinars
                </Button>
              </NextLink>
            </Stack>

            <Stack gap={4}>
              {upcomingWebinars.map((webinar, idx) => (
                <Card key={idx} className="border-2 border-ink-700 bg-ink-900 p-4">
                  <Stack direction="horizontal" gap={4} className="items-center justify-between">
                    <Stack gap={1}>
                      <Body size="sm" className="text-white">{webinar.title}</Body>
                      <Stack direction="horizontal" gap={3}>
                        <Label size="xs" className="text-grey-500">{webinar.date}</Label>
                        <Label size="xs" className="text-grey-500">{webinar.duration}</Label>
                      </Stack>
                    </Stack>
                    <Button variant="outline" size="sm" inverted>
                      Notify Me
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Community Section */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 lg:p-12 shadow-brand-lg">
            <Grid cols={2} gap={8} className="items-center">
              <Stack gap={6}>
                <Stack gap={2}>
                  <Label size="xs" className="text-brand-pink uppercase tracking-kicker">COMMUNITY</Label>
                  <H1 className="text-ink-950">JOIN THE CONVERSATION</H1>
                </Stack>
                <Body size="lg" className="text-grey-600">
                  Connect with thousands of production professionals in the GHXSTSHIP community. Share best practices, get answers to your questions, and network with peers.
                </Body>
                <Stack direction="horizontal" gap={4}>
                  <NextLink href="/community">
                    <Button variant="pop" size="md" icon={<Users />}>
                      Join Community
                    </Button>
                  </NextLink>
                  <NextLink href="/training">
                    <Button variant="outline" size="md" icon={<GraduationCap />}>
                      Get Certified
                    </Button>
                  </NextLink>
                </Stack>
              </Stack>
              <Box className="hidden lg:flex h-full items-center justify-center">
                <Card className="border-2 aspect-video w-full border-ink-950 bg-grey-100">
                  <Box className="flex h-full items-center justify-center">
                    <Stack gap={4} className="text-center">
                      <Users className="h-16 w-16 text-grey-400 mx-auto" />
                      <Label size="xs" className="text-grey-400">Community Hub</Label>
                    </Stack>
                  </Box>
                </Card>
              </Box>
            </Grid>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Request Demo CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              PREFER A GUIDED TOUR?
            </Display>
            <Body size="lg" className="text-grey-600">
              Our team is happy to walk you through the platform and answer any questions.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo/request">
                <Button variant="pop" size="lg" icon={<Calendar />}>
                  Schedule Demo
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outline" size="lg" icon={<MessageSquare />}>
                  Contact Us
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
