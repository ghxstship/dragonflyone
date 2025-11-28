import { ConsumerNavigationPublic } from "../components/navigation";
import { Badge, Stack, Grid, Card, Container, Display, H2, H3, Body, Label, Link, Article, Box, Section, SectionHeader } from "@ghxstship/ui";
import { Music, Tent, Trophy, Drama, Laugh, Sparkles } from "lucide-react";
import { ExperienceDiscovery } from "../components/experience-discovery";

export const runtime = "edge";

// Consumer-focused hero content
const consumerHero = {
  kicker: "Experiences Amplified",
  headline: "GVTEWAY",
  subhead: "Find and book unforgettable live events, festivals, and performances. Your gateway to extraordinary experiences.",
  stats: [
    { label: "Live Events", value: "2,400+" },
    { label: "Cities", value: "180+" },
    { label: "Artists", value: "12K+" },
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

// Consumer value propositions
const consumerFeatures = [
  {
    title: "Discover",
    description: "Find your next obsession through music, vibes, experiences, and the people, places, and products that define your scene.",
    bullets: ["Music & vibe matching", "Experience curation", "People & places", "Product discovery"],
  },
  {
    title: "Connect",
    description: "Join experience-driven social communities, groups, and clubs built around shared passions and moments.",
    bullets: ["Social communities", "Interest-based groups", "Exclusive clubs", "Shared experiences"],
  },
  {
    title: "Access",
    description: "Unlock membership-based ticketing with priority access, exclusive drops, and insider benefits.",
    bullets: ["Membership tiers", "Priority access", "Exclusive drops", "Insider benefits"],
  },
  {
    title: "Enrich",
    description: "Experiences beyond events—engage all five senses across distance, space, and time.",
    bullets: ["Multi-sensory experiences", "Virtual & hybrid events", "Extended reality", "Timeless moments"],
  },
  {
    title: "Inspire",
    description: "Education, resources, and tools for continued creative growth and development in your craft.",
    bullets: ["Learning resources", "Creative tools", "Artist development", "Community mentorship"],
  },
];

export default function Home() {
  return (
    <Section className="relative min-h-screen overflow-hidden bg-black text-ink-50" id="top">
      <Card className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />
      <ConsumerNavigationPublic />

      <Container className="relative mx-auto flex max-w-container-6xl flex-col gap-spacing-16 px-spacing-6 pb-spacing-24 pt-spacing-16 lg:px-spacing-8">
        {/* Hero Section */}
        <Stack gap={8} className="text-center">
          <Stack gap={6}>
            <Label size="xs" className="tracking-widest text-ink-400">{consumerHero.kicker}</Label>
            <Display size="xl" className="text-white">{consumerHero.headline}</Display>
            <Body size="lg" className="mx-auto max-w-container-2xl text-ink-300">{consumerHero.subhead}</Body>
          </Stack>
          <Stack direction="horizontal" gap={4} className="flex-col items-center justify-center md:flex-row">
            <Link
              href="/events"
              className="border border-white px-spacing-8 py-spacing-4 text-mono-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Browse Events
            </Link>
            <Link
              href="/search"
              className="border border-ink-600 px-spacing-8 py-spacing-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              Search by Artist
            </Link>
          </Stack>
        </Stack>

        {/* Stats */}
        <Section border>
          <Grid cols={3} gap={6}>
            {consumerHero.stats.map((stat) => (
              <Card key={stat.label} className="space-y-spacing-2 bg-transparent text-center">
                <H2 size="lg" className="text-white">{stat.value}</H2>
                <Label size="xs" className="tracking-widest text-ink-500">{stat.label}</Label>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Category Quick Links */}
        <Section border className="space-y-spacing-8">
          <SectionHeader
            kicker="Browse by Category"
            title="Find Your Next Experience"
            description="Explore events across genres, from intimate concerts to massive festivals."
            align="center"
          />
          <Grid cols={6} gap={4}>
            {featuredCategories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="flex flex-col items-center gap-spacing-3 border border-ink-800 p-spacing-6 text-center transition hover:-translate-y-1 hover:border-white"
              >
                <category.icon className="h-8 w-8 text-white" />
                <Label size="xs" className="tracking-widest text-ink-300">{category.label}</Label>
              </Link>
            ))}
          </Grid>
        </Section>

        {/* Event Discovery */}
        <Section id="discover" border className="space-y-spacing-8">
          <SectionHeader
            kicker="Personalized Discovery"
            title="Events Curated for You"
            description="Search by artist, venue, city, or vibe. Save searches and get alerts when new events match your preferences."
          />
          <Card className="border border-ink-800 p-spacing-6">
            <ExperienceDiscovery />
          </Card>
        </Section>

        {/* Consumer Features */}
        <Section border className="space-y-spacing-8">
          <SectionHeader
            kicker="Your Complete Event Journey"
            title="From Discovery to Memories"
            description="Everything you need for an unforgettable experience, all in one place."
            align="center"
          />
          <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {consumerFeatures.map((feature) => (
              <Article key={feature.title} className="border border-ink-800 p-spacing-6">
                <H3 size="md" className="text-white">{feature.title}</H3>
                <Body size="sm" className="mt-spacing-3 text-ink-300">{feature.description}</Body>
                <Stack gap={2} className="mt-spacing-4">
                  {feature.bullets.map((bullet) => (
                    <Body key={bullet} size="xs" className="flex items-center gap-spacing-2 text-ink-400">
                      <Box className="h-spacing-1 w-spacing-1 rounded-full bg-ink-500" />
                      {bullet}
                    </Body>
                  ))}
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Trending Section */}
        <Section border className="space-y-spacing-8">
          <SectionHeader
            kicker="What's Hot"
            title="Trending This Week"
            description="The most popular events and artists your friends are talking about."
          />
          <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
            <Badge variant="outline" className="px-spacing-4 py-spacing-2">Flash Sales</Badge>
            <Badge variant="outline" className="px-spacing-4 py-spacing-2">Last Minute Deals</Badge>
            <Badge variant="outline" className="px-spacing-4 py-spacing-2">VIP Experiences</Badge>
            <Badge variant="outline" className="px-spacing-4 py-spacing-2">Festival Season</Badge>
            <Badge variant="outline" className="px-spacing-4 py-spacing-2">New Venues</Badge>
          </Stack>
          <Stack className="text-center">
            <Link
              href="/events?filter=trending"
              className="inline-flex border border-ink-600 px-spacing-8 py-spacing-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              View All Trending Events
            </Link>
          </Stack>
        </Section>

        {/* CTA Section */}
        <Section border={false} className="border border-ink-700/60 p-spacing-8 text-center">
          <SectionHeader
            kicker="Event Creators"
            title="Sell Tickets on GVTEWAY"
            description="Are you an event organizer, venue, or artist? Join thousands of creators using GVTEWAY to sell tickets and grow their audience."
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="mt-spacing-8 flex-col items-center justify-center md:flex-row">
            <Link
              href="/creators"
              className="border border-white px-spacing-8 py-spacing-4 text-mono-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Start Selling Tickets
            </Link>
            <Link
              href="/creators#pricing"
              className="border border-ink-600 px-spacing-8 py-spacing-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              View Pricing
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
