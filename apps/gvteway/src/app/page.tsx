import { ConsumerNavigationPublic } from "../components/navigation";
import {
  Badge,
  Stack,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Container,
  Display,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Section,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Kicker,
} from "@ghxstship/ui";
import {
  Music,
  Tent,
  Trophy,
  Drama,
  Laugh,
  Sparkles,
  ArrowRight,
  Ticket,
  Users,
  MapPin,
  Zap,
  Heart,
  Star,
  Globe,
} from "lucide-react";
import { ExperienceDiscovery } from "../components/experience-discovery";
import NextLink from "next/link";

export const runtime = "edge";

// Consumer-focused hero content
const consumerHero = {
  kicker: "GVTEWAY",
  headline: "EXPERIENCES AMPLIFIED",
  subhead:
    "Find and book unforgettable live events, festivals, and performances. Your gateway to extraordinary experiences.",
  stats: [
    { label: "Live Events", value: "2,400+", icon: Ticket },
    { label: "Cities", value: "180+", icon: MapPin },
    { label: "Artists", value: "12K+", icon: Users },
  ],
};

// Featured categories for consumer discovery
const featuredCategories = [
  { label: "Concerts", href: "/events?category=concerts", icon: Music },
  { label: "Festivals", href: "/events?category=festivals", icon: Tent },
  { label: "Sports", href: "/events?category=sports", icon: Trophy },
  { label: "Theater", href: "/events?category=theater", icon: Drama },
  { label: "Comedy", href: "/events?category=comedy", icon: Laugh },
  { label: "Immersive", href: "/events?category=immersive", icon: Sparkles },
];

// Consumer value propositions with icons
const consumerFeatures = [
  {
    title: "Discover",
    icon: Zap,
    description:
      "Find your next obsession through music, vibes, and the experiences that define your scene.",
    bullets: [
      "Music & vibe matching",
      "Experience curation",
      "People & places",
      "Product discovery",
    ],
  },
  {
    title: "Connect",
    icon: Heart,
    description:
      "Join experience-driven communities built around shared passions and unforgettable moments.",
    bullets: [
      "Social communities",
      "Interest-based groups",
      "Exclusive clubs",
      "Shared experiences",
    ],
  },
  {
    title: "Access",
    icon: Star,
    description:
      "Unlock membership-based ticketing with priority access and exclusive insider benefits.",
    bullets: [
      "Membership tiers",
      "Priority access",
      "Exclusive drops",
      "Insider benefits",
    ],
  },
  {
    title: "Enrich",
    icon: Globe,
    description:
      "Experiences beyond events—engage all five senses across distance, space, and time.",
    bullets: [
      "Multi-sensory experiences",
      "Virtual & hybrid events",
      "Extended reality",
      "Timeless moments",
    ],
  },
  {
    title: "Inspire",
    icon: Sparkles,
    description:
      "Education, resources, and tools for continued creative growth in your craft.",
    bullets: [
      "Learning resources",
      "Creative tools",
      "Artist development",
      "Community mentorship",
    ],
  },
];

// Trending tags
const trendingTags = [
  "Flash Sales",
  "Last Minute Deals",
  "VIP Experiences",
  "Festival Season",
  "New Venues",
];

export default function Home() {
  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="For Creators">
            <FooterLink href="/creators">Sell Tickets</FooterLink>
            <FooterLink href="/creators#pricing">Pricing</FooterLink>
            <FooterLink href="/creators#features">Features</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
            <FooterLink href="/help#faq">FAQ</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
            <FooterLink href="/accessibility">Accessibility</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION - Bold Contemporary Pop Art Adventure
          Features: Grid pattern, massive Anton headline, hard shadow CTAs
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Section background="black" className="relative min-h-[80vh] overflow-hidden">
        {/* Grid Pattern Background - Pop Art aesthetic */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Halftone dots overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <Container className="relative z-10 flex h-full min-h-[80vh] flex-col items-center justify-center py-24 text-center">
          <Stack gap={8} className="max-w-5xl">
            {/* Kicker - mono label */}
            <Kicker size="lg" colorScheme="on-dark" className="tracking-[0.3em]">
              {consumerHero.kicker}
            </Kicker>
            
            {/* Main Headline - ANTON display font */}
            <Display size="xl" className="text-white">
              {consumerHero.headline}
            </Display>
            
            {/* Subhead */}
            <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary">
              {consumerHero.subhead}
            </Body>
          </Stack>
          
          {/* CTA Buttons - Bold with hard shadows */}
          <Stack direction="horizontal" gap={6} className="mt-12 flex-col items-center justify-center md:flex-row">
            <NextLink href="/events">
              <Button
                variant="solid"
                size="lg"
                inverted
                icon={<ArrowRight />}
                className="shadow-md transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg"
              >
                Browse Events
              </Button>
            </NextLink>
            <NextLink href="/search">
              <Button
                variant="outlineInk"
                size="lg"
                className="border-2 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
              >
                Search by Artist
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </Section>

      <Container className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {/* ═══════════════════════════════════════════════════════════════════════════
            STATS SECTION - Comic panel cards with hard shadows
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section border className="-mt-16 relative z-20 rounded-none border-2 border-ink-700 bg-ink-950 p-8 shadow-primary">
          <Grid cols={3} gap={8}>
            {consumerHero.stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="flex size-14 items-center justify-center border-2 border-ink-600 bg-ink-900 shadow-primary">
                  <stat.icon className="size-6 text-white" />
                </div>
                <H1 size="sm" className="text-white">{stat.value}</H1>
                <Label size="xs" className="tracking-label text-on-dark-muted">{stat.label}</Label>
              </div>
            ))}
          </Grid>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            CATEGORY QUICK LINKS - Pop Art card grid
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section className="py-20">
          <Stack gap={4} className="mb-12 text-center">
            <Kicker colorScheme="on-dark" className="tracking-kicker">Browse by Category</Kicker>
            <H2 size="lg" className="text-white">Find Your Next Experience</H2>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Explore events across genres, from intimate concerts to massive festivals.
            </Body>
          </Stack>
          <Grid cols={6} gap={4}>
            {featuredCategories.map((category) => (
              <NextLink key={category.label} href={category.href}>
                <Card inverted interactive className="group flex flex-col items-center gap-4 p-6 text-center">
                  <div className="flex size-12 items-center justify-center border-2 border-ink-700 bg-ink-900 transition-colors group-hover:border-white group-hover:bg-ink-800">
                    <category.icon className="size-6 text-on-dark-secondary transition-colors group-hover:text-white" />
                  </div>
                  <Label size="xs" className="tracking-label text-on-dark-muted transition-colors group-hover:text-white">
                    {category.label}
                  </Label>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            EVENT DISCOVERY - Search panel with bold borders
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section id="discover" className="py-20">
          <Stack gap={4} className="mb-12">
            <Kicker colorScheme="on-dark" className="tracking-kicker">Personalized Discovery</Kicker>
            <H2 size="lg" className="text-white">Events Curated for You</H2>
            <Body className="max-w-2xl text-on-dark-muted">
              Search by artist, venue, city, or vibe. Save searches and get alerts when new events match your preferences.
            </Body>
          </Stack>
          <Card inverted variant="elevated" className="p-8">
            <ExperienceDiscovery />
          </Card>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            CONSUMER FEATURES - Pop Art feature cards with icons
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section className="py-20">
          <Stack gap={4} className="mb-12 text-center">
            <Kicker colorScheme="on-dark" className="tracking-kicker">Your Complete Event Journey</Kicker>
            <H2 size="lg" className="text-white">From Discovery to Memories</H2>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Everything you need for an unforgettable experience, all in one place.
            </Body>
          </Stack>
          <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {consumerFeatures.map((feature) => (
              <Card
                key={feature.title}
                inverted
                interactive
                className="group flex flex-col gap-6"
              >
                {/* Icon with accent shadow */}
                <div className="flex size-14 items-center justify-center border-2 border-ink-700 bg-ink-900 shadow-xs transition-all group-hover:shadow-sm">
                  <feature.icon className="size-6 text-white" />
                </div>
                
                {/* Title */}
                <H3 className="text-white">{feature.title}</H3>
                
                {/* Description */}
                <Body size="sm" className="text-on-dark-muted">
                  {feature.description}
                </Body>
                
                {/* Bullet points */}
                <Stack gap={2} className="mt-auto">
                  {feature.bullets.map((bullet) => (
                    <Label key={bullet} size="xxs" className="text-on-dark-disabled">
                      {`// ${bullet}`}
                    </Label>
                  ))}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            TRENDING SECTION - Badge tags with pop art styling
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section className="py-20">
          <Stack gap={4} className="mb-12">
            <Kicker colorScheme="on-dark" className="tracking-kicker">What&apos;s Hot</Kicker>
            <H2 size="lg" className="text-white">Trending This Week</H2>
            <Body className="max-w-xl text-on-dark-muted">
              The most popular events and artists your friends are talking about.
            </Body>
          </Stack>
          <Stack gap={10}>
            <Stack direction="horizontal" gap={4} className="flex-wrap">
              {trendingTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  size="lg"
                  className="border-2 border-ink-600 bg-ink-950 px-5 py-2 shadow-xs transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-white hover:shadow-sm"
                >
                  {tag}
                </Badge>
              ))}
            </Stack>
            <div>
              <NextLink href="/events?filter=trending">
                <Button
                  variant="outlineInk"
                  size="lg"
                  icon={<ArrowRight />}
                  className="border-2 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
                >
                  View All Trending Events
                </Button>
              </NextLink>
            </div>
          </Stack>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════════════
            CTA SECTION - Pop Art panel with accent shadow
            ═══════════════════════════════════════════════════════════════════════════ */}
        <Section className="py-20">
          <Card inverted variant="pop" className="p-12 text-center">
            <Stack gap={6} className="mx-auto max-w-2xl">
              <Kicker colorScheme="on-dark" className="tracking-kicker">Event Creators</Kicker>
              <H2 size="lg" className="text-white">Sell Tickets on GVTEWAY</H2>
              <Body className="text-on-dark-muted">
                Are you an event organizer, venue, or artist? Join thousands of creators using GVTEWAY to sell tickets and grow their audience.
              </Body>
            </Stack>
            <Stack direction="horizontal" gap={6} className="mt-10 flex-col items-center justify-center md:flex-row">
              <NextLink href="/creators">
                <Button
                  variant="solid"
                  size="lg"
                  inverted
                  icon={<ArrowRight />}
                  className="shadow-md transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Start Selling Tickets
                </Button>
              </NextLink>
              <NextLink href="/creators#pricing">
                <Button
                  variant="outlineInk"
                  size="lg"
                  className="border-2 shadow-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-md"
                >
                  View Pricing
                </Button>
              </NextLink>
            </Stack>
          </Card>
        </Section>
      </Container>
    </PageLayout>
  );
}
