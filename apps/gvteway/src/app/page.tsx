import { ConsumerNavigationPublic } from "../components/navigation";
import { Section, SectionHeader } from "../components/section";
import { Badge, Stack, Grid, Card, Container, H1, H2, H3, Body, Label, Link, Button, Article, Box } from "@ghxstship/ui";
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
  { label: "Concerts", href: "/events?category=concerts", icon: "🎵" },
  { label: "Festivals", href: "/events?category=festivals", icon: "🎪" },
  { label: "Sports", href: "/events?category=sports", icon: "⚽" },
  { label: "Theater", href: "/events?category=theater", icon: "🎭" },
  { label: "Comedy", href: "/events?category=comedy", icon: "😂" },
  { label: "Immersive", href: "/events?category=immersive", icon: "✨" },
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

      <Container className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        {/* Hero Section */}
        <Stack gap={8} className="text-center">
          <Stack gap={4}>
            <Label size="xs" className="tracking-display text-ink-400">{consumerHero.kicker}</Label>
            <H1 size="lg" className="text-white">{consumerHero.headline}</H1>
            <Body size="md" className="mx-auto max-w-2xl text-ink-300">{consumerHero.subhead}</Body>
          </Stack>
          <Stack direction="horizontal" gap={4} className="flex-col items-center justify-center md:flex-row">
            <Link
              href="/events"
              className="border border-white px-8 py-4 text-mono-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Browse Events
            </Link>
            <Link
              href="/search"
              className="border border-ink-600 px-8 py-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              Search by Artist
            </Link>
          </Stack>
        </Stack>

        {/* Stats */}
        <Section border>
          <Grid cols={3} gap={6}>
            {consumerHero.stats.map((stat) => (
              <Card key={stat.label} className="space-y-2 bg-transparent text-center">
                <Body className="font-display text-h3-md text-white">{stat.value}</Body>
                <Label size="xs" className="tracking-display text-ink-500">{stat.label}</Label>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Category Quick Links */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Browse by Category"
            title="Find Your Next Experience"
            description="Explore events across genres, from intimate concerts to massive festivals."
            align="center"
          />
          <Grid cols={6} gap={4} className="md:grid-cols-3 lg:grid-cols-6">
            {featuredCategories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="flex flex-col items-center gap-3 border border-ink-800 p-6 text-center transition hover:-translate-y-1 hover:border-white"
              >
                <Body className="text-h3-md">{category.icon}</Body>
                <Label size="xs" className="tracking-kicker text-ink-300">{category.label}</Label>
              </Link>
            ))}
          </Grid>
        </Section>

        {/* Event Discovery */}
        <Section id="discover" border className="space-y-8">
          <SectionHeader
            kicker="Personalized Discovery"
            title="Events Curated for You"
            description="Search by artist, venue, city, or vibe. Save searches and get alerts when new events match your preferences."
          />
          <Card className="border border-ink-800 p-6">
            <ExperienceDiscovery />
          </Card>
        </Section>

        {/* Consumer Features */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Your Complete Event Journey"
            title="From Discovery to Memories"
            description="Everything you need for an unforgettable experience, all in one place."
            align="center"
          />
          <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {consumerFeatures.map((feature) => (
              <Article key={feature.title} className="border border-ink-800 p-6">
                <H3 size="sm">{feature.title}</H3>
                <Body size="sm" className="mt-3 text-ink-300">{feature.description}</Body>
                <Stack gap={2} className="mt-4">
                  {feature.bullets.map((bullet) => (
                    <Body key={bullet} size="sm" className="flex items-center gap-2 text-ink-200">
                      <Box className="h-1 w-1 rounded-full bg-ink-500" />
                      {bullet}
                    </Body>
                  ))}
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Trending Section */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="What's Hot"
            title="Trending This Week"
            description="The most popular events and artists your friends are talking about."
          />
          <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
            <Badge variant="outline" className="px-4 py-2">Flash Sales</Badge>
            <Badge variant="outline" className="px-4 py-2">Last Minute Deals</Badge>
            <Badge variant="outline" className="px-4 py-2">VIP Experiences</Badge>
            <Badge variant="outline" className="px-4 py-2">Festival Season</Badge>
            <Badge variant="outline" className="px-4 py-2">New Venues</Badge>
          </Stack>
          <Stack className="text-center">
            <Link
              href="/events?filter=trending"
              className="inline-flex border border-ink-600 px-8 py-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              View All Trending Events
            </Link>
          </Stack>
        </Section>

        {/* CTA Section */}
        <Section border={false} className="border border-ink-700/60 p-8 text-center">
          <SectionHeader
            kicker="Event Creators"
            title="Sell Tickets on GVTEWAY"
            description="Are you an event organizer, venue, or artist? Join thousands of creators using GVTEWAY to sell tickets and grow their audience."
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="mt-8 flex-col items-center justify-center md:flex-row">
            <Link
              href="/creators"
              className="border border-white px-8 py-4 text-mono-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Start Selling Tickets
            </Link>
            <Link
              href="/creators#pricing"
              className="border border-ink-600 px-8 py-4 text-mono-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              View Pricing
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
