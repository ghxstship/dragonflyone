import { CreatorNavigationPublic } from "../../components/navigation";
import { Section, SectionHeader } from "../../components/section";
import { Badge, StatusBadge, Stack, Grid, Card, Container, H1, H2, H3, Body, Label, Link, Text, List, ListItem, Article, Box, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ghxstship/ui";
import { ProgressBar } from "@ghxstship/ui";
import { EventCreationForm } from "../../components/event-creation-form";
import {
  gvtewayCommunityTracks,
  gvtewayCommerceLanes,
  gvtewayEventBlueprint,
  gvtewayGuestSignals,
  gvtewayDiscoveryStreams,
  gvtewayIntegrationLinks,
  gvtewayRevenuePanels,
  gvtewaySocialPlaybook,
  gvtewayAutomationProgram,
  gvtewayStripePlan,
  gvtewayDevelopmentPhases,
  gvtewayTicketingStack,
  gvtewayReconciliationInsights,
  gvtewayMobileTickets,
  gvtewaySeatingBlueprint,
  gvtewayTicketTypes,
  gvtewayEmailNotifications,
} from "../../data/gvteway";

export const runtime = "edge";

// Creator/SaaS landing page hero content
const creatorHero = {
  kicker: "Event Creator Platform",
  headline: "GVTEWAY",
  subhead: "The complete ticketing, marketing, and commerce platform for event creators. Sell tickets, grow your audience, and deliver unforgettable experiences.",
  stats: [
    { label: "Ticket + Membership Models", value: "27" },
    { label: "Marketplace Touchpoints", value: "63" },
    { label: "Experience Taxonomy", value: "312" },
  ],
};

// Pricing tiers for creators
const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small events and getting started",
    features: ["Up to 100 tickets/event", "Basic analytics", "Email support", "Mobile tickets", "Standard checkout"],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49/mo",
    description: "For growing organizers and regular events",
    features: ["Unlimited tickets", "Advanced analytics", "Priority support", "Custom branding", "Marketing tools", "Promo codes"],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For venues, festivals, and large organizations",
    features: ["White-label solution", "Dedicated account manager", "API access", "Custom integrations", "SLA guarantee", "On-site support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

// Testimonials from creators
const testimonials = [
  {
    quote: "GVTEWAY transformed how we sell tickets. The analytics alone paid for itself in the first month.",
    author: "Sarah Chen",
    role: "Festival Director",
    company: "Neon Nights Festival",
  },
  {
    quote: "The integration with our existing systems was seamless. Our box office team was up and running in hours.",
    author: "Marcus Webb",
    role: "Venue Manager",
    company: "The Warehouse",
  },
  {
    quote: "Finally, a platform that understands what event creators actually need. The mobile ticketing is flawless.",
    author: "Jordan Taylor",
    role: "Independent Promoter",
    company: "Underground Events",
  },
];

export default function CreatorsPage() {
  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50" id="top">
      <Card className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />
      <CreatorNavigationPublic />

      <Container className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        {/* Hero Section */}
        <Stack direction="horizontal" gap={10} className="flex-col lg:flex-row lg:items-end lg:justify-between">
          <Stack gap={6}>
            <Label className="text-xs uppercase tracking-display text-ink-400">{creatorHero.kicker}</Label>
            <H1 className="font-display text-6xl uppercase text-white md:text-8xl">{creatorHero.headline}</H1>
            <Body className="max-w-2xl text-base text-ink-300 md:text-lg">{creatorHero.subhead}</Body>
          </Stack>
          <Stack gap={5} className="text-right">
            <Label className="text-xs tracking-display text-ink-500">FOR CREATORS</Label>
            <Stack gap={3} className="text-xs uppercase tracking-display text-white">
              <Link
                href="/auth/signup?type=creator"
                className="border border-white px-8 py-4 tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                Start Free
              </Link>
              <Link
                href="#pricing"
                className="border border-ink-600 px-8 py-4 text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
              >
                View Pricing
              </Link>
            </Stack>
          </Stack>
        </Stack>

        {/* Stats */}
        <Section border>
          <Grid cols={3} gap={6}>
            {creatorHero.stats.map((stat) => (
              <Card key={stat.label} className="space-y-2 bg-transparent">
                <Label className="text-xs uppercase tracking-display text-ink-500">{stat.label}</Label>
                <Body className="font-display text-4xl text-white">{stat.value}</Body>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Features Section */}
        <Section id="features" border className="space-y-10">
          <SectionHeader
            kicker="Platform Features"
            title="Everything You Need to Sell Tickets"
            description="From event creation to post-show analytics, GVTEWAY provides the complete toolkit for modern event creators."
          />
          <Grid cols={3} gap={6}>
            {gvtewayEventBlueprint.map((card) => (
              <Article key={card.title} className="border border-ink-800 bg-ink-950/60 p-6">
                <Label className="text-xs uppercase tracking-display text-ink-500">Feature</Label>
                <H3 className="mt-4 text-2xl uppercase">{card.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {card.bullets.map((item) => (
                    <ListItem key={item} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{item}</Text>
                    </ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Event Creation Demo */}
        <Section id="event-creation" border className="space-y-8">
          <SectionHeader
            kicker="Event Management"
            title="Create Events in Minutes"
            description="Intuitive event creation with templates, dynamic pricing, and venue configuration."
          />
          <EventCreationForm />
        </Section>

        {/* Seating Architecture */}
        <Section id="seating" border className="space-y-8">
          <SectionHeader
            kicker="Seating Architecture"
            title="Dynamic Layouts + Capacity Telemetry"
            description="Configure seating charts, VIP zones, and capacity controls with real-time availability tracking."
          />
          <Grid cols={2} gap={6}>
            {gvtewaySeatingBlueprint.map((node) => (
              <Article key={node.id} className="space-y-4 border border-ink-800 p-6">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack>
                    <Label className="font-code text-xs uppercase tracking-display text-ink-500">{node.access}</Label>
                    <H3 className="text-2xl uppercase">{node.label}</H3>
                  </Stack>
                  <Stack className="text-right text-sm text-ink-400">
                    <Body>Capacity {node.capacity}</Body>
                    <Body>Available {node.availability}</Body>
                  </Stack>
                </Stack>
                <ProgressBar 
                  value={Math.max(0, Math.min(100, (node.availability / node.capacity) * 100))}
                  variant="inverse"
                />
                <Body className="text-sm text-ink-400">Price band {node.priceRange}</Body>
                <List className="text-sm text-ink-200">
                  {node.perks.map((perk) => (
                    <ListItem key={perk} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{perk}</Text>
                    </ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Ticket Types Table */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Ticketing"
            title="Flexible Ticket Types"
            description="Create GA, VIP, and premium tiers with custom pricing, fees, and inventory controls."
          />
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="bg-ink-900 text-ink-500">
                <TableRow>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Ticket</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Tier</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Price</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Fee</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Available</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gvtewayTicketTypes.map((ticket) => (
                  <TableRow key={ticket.id} className="border-t border-ink-800">
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-50">{ticket.name}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300 uppercase">{ticket.tier}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">
                      ${(ticket.priceCents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">${(ticket.serviceFeeCents / 100).toFixed(2)}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{ticket.quantity - ticket.sold}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{ticket.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        {/* Pricing Section */}
        <Section id="pricing" border className="space-y-8">
          <SectionHeader
            kicker="Simple Pricing"
            title="Plans for Every Creator"
            description="Start free and scale as you grow. No hidden fees, transparent pricing."
            align="center"
          />
          <Grid cols={3} gap={6}>
            {pricingTiers.map((tier) => (
              <Article 
                key={tier.name} 
                className={`border p-6 ${tier.highlighted ? 'border-white bg-ink-900' : 'border-ink-800'}`}
              >
                <Label className="text-xs uppercase tracking-display text-ink-500">{tier.name}</Label>
                <H3 className="mt-2 font-display text-4xl text-white">{tier.price}</H3>
                <Body className="mt-2 text-sm text-ink-300">{tier.description}</Body>
                <List className="mt-6 space-y-2 text-sm text-ink-200">
                  {tier.features.map((feature) => (
                    <ListItem key={feature} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{feature}</Text>
                    </ListItem>
                  ))}
                </List>
                <Link
                  href={tier.name === "Enterprise" ? "mailto:sales@ghxstship.com" : "/auth/signup?type=creator"}
                  className={`mt-6 block w-full border px-6 py-3 text-center text-xs uppercase tracking-kicker transition hover:-translate-y-0.5 ${
                    tier.highlighted 
                      ? 'border-white bg-white text-black hover:bg-transparent hover:text-white' 
                      : 'border-ink-600 text-ink-400 hover:border-white hover:text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Ticketing Stack */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Ticketing & Memberships"
            title="Access, Trust, and Financial Controls"
            description="Multi-tier ticketing, anti-scalping protection, and financial guardrails for compliant operations."
          />
          <Grid cols={3} gap={6}>
            {gvtewayTicketingStack.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl uppercase">{card.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {card.bullets.map((bullet) => (
                    <ListItem key={bullet} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{bullet}</Text>
                    </ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Commerce & POS */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Commerce & POS"
            title="Merchandise, Venue Operations, and Loyalty"
            description="Unified inventory, offline-ready POS, and loyalty orchestration for complete venue commerce."
          />
          <Grid cols={3} gap={6}>
            {gvtewayCommerceLanes.map((lane) => (
              <Article key={lane.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl uppercase">{lane.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {lane.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Revenue Panels */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Revenue Fabric"
            title="Commerce, Marketing, and Membership Telemetry"
            description="Real-time analytics across all revenue streams with executive-level dashboards."
          />
          <Grid cols={3} gap={6}>
            {gvtewayRevenuePanels.map((panel) => (
              <Article key={panel.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{panel.kicker}</Label>
                <H3 className="mt-4 text-2xl uppercase">{panel.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{panel.description}</Body>
                <Stack direction="horizontal" gap={6} className="mt-6">
                  {panel.metrics.map((metric) => (
                    <Stack key={metric.label}>
                      <Label className="text-xs uppercase tracking-kicker text-ink-500">{metric.label}</Label>
                      <Body className="font-display text-3xl text-white">{metric.value}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Reconciliation */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Financial Integrity"
            title="Payout Reconciliation + Variance Control"
            description="Nightly settlements with variance watchdogs and transparent payout tracking."
          />
          <Grid cols={3} gap={4}>
            {gvtewayReconciliationInsights.stats.map((stat) => (
              <Article key={stat.label} className="border border-ink-800 p-6">
                <Label className="text-xs uppercase tracking-display text-ink-500">{stat.label}</Label>
                <Body className="mt-3 font-display text-4xl text-white">{stat.value}</Body>
                <Body className="text-sm text-ink-400">{stat.delta}</Body>
              </Article>
            ))}
          </Grid>
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="bg-ink-900 text-ink-500">
                <TableRow>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Run</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Window</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Gross</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Fees</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Refunds</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Net</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Variance</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gvtewayReconciliationInsights.payouts.map((payout) => (
                  <TableRow key={payout.id} className="border-t border-ink-800">
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-50">{payout.date}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{payout.window}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{payout.gross}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{payout.fees}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{payout.refunds}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-white">{payout.net}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{payout.variance}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3">
                      <StatusBadge 
                        status={payout.status === "cleared" ? "success" : payout.status === "investigating" ? "error" : "warning"}
                        size="sm"
                      >
                        {payout.status}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        {/* Testimonials */}
        <Section id="testimonials" border className="space-y-8">
          <SectionHeader
            kicker="Creator Stories"
            title="Trusted by Event Creators"
            description="See how organizers, venues, and promoters are growing with GVTEWAY."
            align="center"
          />
          <Grid cols={3} gap={6}>
            {testimonials.map((testimonial) => (
              <Article key={testimonial.author} className="border border-ink-800 p-6">
                <Body className="text-sm italic text-ink-200">&ldquo;{testimonial.quote}&rdquo;</Body>
                <Stack className="mt-6">
                  <Body className="text-sm font-semibold text-white">{testimonial.author}</Body>
                  <Body className="text-xs text-ink-400">{testimonial.role}</Body>
                  <Body className="text-xs text-ink-500">{testimonial.company}</Body>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Integrations */}
        <Section id="integrations" border className="space-y-8">
          <SectionHeader
            kicker="Automation & Integrations"
            title="Connect Your Stack"
            description="Zapier, Make, n8n, and native integrations with the tools you already use."
          />
          <Grid cols={3} gap={6}>
            {gvtewayAutomationProgram.map((program) => (
              <Article key={program.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{program.title}</Label>
                <H3 className="mt-4 text-2xl uppercase">{program.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{program.description}</Body>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {program.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Tri-Platform Integration */}
        <Section border className="space-y-8">
          <SectionHeader
            kicker="Ecosystem"
            title="Tri-Platform Sync"
            description="GVTEWAY integrates seamlessly with ATLVS (finance) and COMPVSS (production) for end-to-end event operations."
          />
          <Grid cols={3} gap={6}>
            {gvtewayIntegrationLinks.map((block) => (
              <Article key={block.title} className="border border-ink-800 p-6">
                <H3 className="text-xl uppercase">{block.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {block.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        {/* Roadmap */}
        <Section id="roadmap" border className="space-y-10">
          <SectionHeader
            kicker="Development Roadmap"
            title="Foundation → Enhancement → Scale"
            description="Our commitment to continuous improvement and feature development."
          />
          <Grid cols={2} gap={6}>
            {gvtewayDevelopmentPhases.map((phase) => (
              <Article key={phase.phase} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{phase.phase}</Label>
                <H3 className="mt-4 text-2xl uppercase">{phase.focus}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {phase.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
          <Section border className="space-y-6">
            <SectionHeader
              kicker="Stripe Integration"
              title="Payment Infrastructure"
              description="Enterprise-grade payment processing with Stripe for secure, compliant transactions."
            />
            <List className="space-y-4 text-sm text-ink-200">
              {gvtewayStripePlan.map((step) => (
                <ListItem key={step.step} className="flex flex-col gap-2 border border-ink-800 p-4">
                  <Text className="font-display text-xl uppercase text-white">{step.step}</Text>
                  <Body>{step.detail}</Body>
                </ListItem>
              ))}
            </List>
          </Section>
        </Section>

        {/* Final CTA */}
        <Section border={false} className="border border-ink-700/60 p-8 text-center">
          <SectionHeader
            kicker="Ready to Start?"
            title="Launch Your First Event Today"
            description="Join thousands of creators selling tickets on GVTEWAY. Start free, no credit card required."
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="mt-8 flex-col items-center justify-center md:flex-row">
            <Link
              href="/auth/signup?type=creator"
              className="border border-white px-8 py-4 text-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Create Free Account
            </Link>
            <Link
              href="mailto:sales@ghxstship.com"
              className="border border-ink-600 px-8 py-4 text-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              Contact Sales
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
