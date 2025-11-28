import { ConsumerNavigationPublic } from "../components/navigation";
import { 
  Badge, 
  Stack, 
  Grid, 
  Card, 
  Container, 
  Display, 
  Body, 
  Label, 
  Button,
  Section, 
  SectionHeader,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  StatCard,
  ContentCard,
  Kicker,
} from "@ghxstship/ui";
import { Music, Tent, Trophy, Drama, Laugh, Sparkles, ArrowRight, Ticket, Users, MapPin } from "lucide-react";
import { ExperienceDiscovery } from "../components/experience-discovery";
import NextLink from "next/link";

export const runtime = "edge";

// Consumer-focused hero content
const consumerHero = {
  kicker: "Experiences Amplified",
  headline: "GVTEWAY",
  subhead: "Find and book unforgettable live events, festivals, and performances. Your gateway to extraordinary experiences.",
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
      {/* Hero Section */}
      <Section className="relative min-h-[70vh] overflow-hidden bg-black pt-24">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
        <Container className="relative z-10 flex h-full flex-col items-center justify-center py-20 text-center">
          <Stack gap={6} className="max-w-4xl">
            <Kicker colorScheme="on-dark">{consumerHero.kicker}</Kicker>
            <Display size="xl" className="text-white">{consumerHero.headline}</Display>
            <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary">
              {consumerHero.subhead}
            </Body>
          </Stack>
          <Stack direction="horizontal" gap={4} className="mt-10 flex-col items-center justify-center md:flex-row">
            <NextLink href="/events">
              <Button
                variant="solid"
                size="lg"
                inverted
                icon={<ArrowRight />}
              >
                Browse Events
              </Button>
            </NextLink>
            <NextLink href="/search">
              <Button
                variant="outlineInk"
                size="lg"
              >
                Search by Artist
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </Section>

      <Container className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        {/* Stats Section */}
        <Section border className="py-12">
          <Grid cols={3} gap={6}>
            {consumerHero.stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={<stat.icon className="size-6" />}
                inverted
              />
            ))}
          </Grid>
        </Section>

        {/* Category Quick Links */}
        <Section border className="py-16">
          <SectionHeader
            kicker="Browse by Category"
            title="Find Your Next Experience"
            description="Explore events across genres, from intimate concerts to massive festivals."
            align="center"
            colorScheme="on-dark"
            gap="lg"
          />
          <Grid cols={6} gap={4} className="mt-10">
            {featuredCategories.map((category) => (
              <NextLink
                key={category.label}
                href={category.href}
              >
                <Card className="flex flex-col items-center gap-4 border-2 border-grey-800 bg-transparent p-6 text-center shadow-sm transition-all duration-100 hover:-translate-y-1 hover:border-white hover:shadow-md">
                  <category.icon className="size-8 text-white" />
                  <Label size="xs" className="tracking-kicker text-on-dark-muted">{category.label}</Label>
                </Card>
              </NextLink>
            ))}
          </Grid>
        </Section>

        {/* Event Discovery */}
        <Section id="discover" border className="py-16">
          <SectionHeader
            kicker="Personalized Discovery"
            title="Events Curated for You"
            description="Search by artist, venue, city, or vibe. Save searches and get alerts when new events match your preferences."
            colorScheme="on-dark"
            gap="lg"
          />
          <Card className="mt-10 border-2 border-grey-800 bg-grey-950/50 p-8">
            <ExperienceDiscovery />
          </Card>
        </Section>

        {/* Consumer Features */}
        <Section border className="py-16">
          <SectionHeader
            kicker="Your Complete Event Journey"
            title="From Discovery to Memories"
            description="Everything you need for an unforgettable experience, all in one place."
            align="center"
            colorScheme="on-dark"
            gap="lg"
          />
          <Grid cols={1} gap={6} className="mt-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {consumerFeatures.map((feature) => (
              <ContentCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                bullets={feature.bullets}
                bulletPrefix="//"
                variant="bordered"
              />
            ))}
          </Grid>
        </Section>

        {/* Trending Section */}
        <Section border className="py-16">
          <SectionHeader
            kicker="What's Hot"
            title="Trending This Week"
            description="The most popular events and artists your friends are talking about."
            colorScheme="on-dark"
            gap="lg"
          />
          <Stack gap={8} className="mt-10">
            <Stack direction="horizontal" gap={3} className="flex-wrap justify-center">
              {trendingTags.map((tag) => (
                <Badge key={tag} variant="outline" size="lg">
                  {tag}
                </Badge>
              ))}
            </Stack>
            <Stack className="text-center">
              <NextLink href="/events?filter=trending">
                <Button
                  variant="outlineInk"
                  size="lg"
                  icon={<ArrowRight />}
                >
                  View All Trending Events
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Section>

        {/* CTA Section */}
        <Section className="py-16">
          <Card className="border-2 border-grey-700 bg-grey-900/50 p-10 text-center">
            <SectionHeader
              kicker="Event Creators"
              title="Sell Tickets on GVTEWAY"
              description="Are you an event organizer, venue, or artist? Join thousands of creators using GVTEWAY to sell tickets and grow their audience."
              align="center"
              colorScheme="on-dark"
              gap="lg"
            />
            <Stack direction="horizontal" gap={4} className="mt-10 flex-col items-center justify-center md:flex-row">
              <NextLink href="/creators">
                <Button
                  variant="solid"
                  size="lg"
                  inverted
                  icon={<ArrowRight />}
                >
                  Start Selling Tickets
                </Button>
              </NextLink>
              <NextLink href="/creators#pricing">
                <Button
                  variant="outlineInk"
                  size="lg"
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
