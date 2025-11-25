import { Navigation } from "../components/navigation";
import { Section, SectionHeader } from "../components/section";
import { Badge, StatusBadge, Stack, Grid, Card, Container, H1, H2, H3, H4, Body, Label, Link, Button, Text, List, ListItem, Article, Box, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ghxstship/ui";
import { ProgressBar } from "@ghxstship/ui";
import { ExperienceDiscovery } from "../components/experience-discovery";
import { EventCreationForm } from "../components/event-creation-form";
import {
  gvtewayCommunityTracks,
  gvtewayCommerceLanes,
  gvtewayEventBlueprint,
  gvtewayGuestSignals,
  gvtewayHero,
  gvtewayDiscoveryStreams,
  gvtewayIntegrationLinks,
  gvtewayNavigation,
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
} from "../data/gvteway";

export const runtime = "edge";

export default function Home() {
  return (
    <Section className="relative min-h-screen overflow-hidden bg-black text-ink-50" id="top">
      <Card className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />
      <Navigation />

      <Container className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        <Stack direction="horizontal" gap={10} className="flex-col lg:flex-row lg:items-end lg:justify-between">
          <Stack gap={6}>
            <Label className="text-xs uppercase tracking-[0.4em] text-ink-400">{gvtewayHero.kicker}</Label>
            <H1 className="font-display text-6xl uppercase text-white md:text-8xl">{gvtewayHero.headline}</H1>
            <Body className="max-w-2xl text-base text-ink-300 md:text-lg">{gvtewayHero.subhead}</Body>
            <Stack direction="horizontal" gap={3} className="flex-wrap text-xs uppercase tracking-[0.3em] text-ink-500">
              {gvtewayNavigation.map((item) => (
                <Badge key={item.label}>{item.label}</Badge>
              ))}
            </Stack>
          </Stack>
          <Stack gap={5} className="text-right">
            <Label className="text-xs tracking-[0.4em] text-ink-500">STATUS</Label>
            <Body className="font-code text-2xl text-white">{gvtewayHero.status}</Body>
            <Stack gap={3} className="text-xs uppercase tracking-[0.4em] text-white">
              <Link
                href="#event-stack"
                className="border border-white px-8 py-4 tracking-[0.35em] transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                {gvtewayHero.ctaPrimary}
              </Link>
              <Link
                href="#integrations"
                className="border border-ink-600 px-8 py-4 text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
              >
                {gvtewayHero.ctaSecondary}
              </Link>
            </Stack>
          </Stack>
        </Stack>

        <Section border>
          <Grid cols={3} gap={6}>
            {gvtewayHero.stats.map((stat) => (
              <Card key={stat.label} className="space-y-2 bg-transparent">
                <Label className="text-xs uppercase tracking-[0.4em] text-ink-500">{stat.label}</Label>
                <Body className="font-display text-4xl text-white">{stat.value}</Body>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section id="event-creation" border className="space-y-8">
          <SectionHeader
            kicker="Admin Workflow"
            title="Event creation console"
            description="Roadmap-ready control surface for drafting new GVTEWAY listings with status, pricing, and genre metadata."
          />
          <EventCreationForm />
        </Section>

        <Section id="seating" border className="space-y-8">
          <SectionHeader
            kicker="Seating Architecture"
            title="Dynamic layouts + capacity telemetry"
            description="Directly visualizes the roadmap’s seating chart deliverable with live capacity, availability, and perk mapping per grid."
          />
          <Grid cols={2} gap={6}>
            {gvtewaySeatingBlueprint.map((node) => (
              <Article key={node.id} className="space-y-4 border border-ink-800 p-6">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack>
                    <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{node.access}</Label>
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
                <Body className="text-sm text-grey-400">Price band {node.priceRange}</Body>
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

        <Section
          id="event-stack"
          border
          className="space-y-10"
        >
          <SectionHeader
            kicker="Experience Stack"
            title="Event management, marketing, and memberships"
            description="Direct lift from the GVTEWAY master checklist: every subsystem required for launch is staged here so engineering can verify coverage run-by-run."
          />
          <Grid cols={3} gap={6}>
            {gvtewayEventBlueprint.map((card) => (
              <Article key={card.title} className="border border-ink-800 bg-black/60 p-6">
                <Label className="text-xs uppercase tracking-[0.4em] text-ink-500">Blueprint</Label>
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
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="bg-ink-900 text-ink-500">
                <TableRow>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Ticket</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Tier</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Price</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Fee</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Available</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gvtewayTicketTypes.map((ticket) => (
                  <TableRow key={ticket.id} className="border-t border-ink-800">
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-50">{ticket.name}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300 uppercase">{ticket.tier}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">
                      ${(ticket.priceCents / 100).toLocaleString("en-US", { style: "currency", currency: ticket.currency }).replace("USD", "USD")}
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

        <Section id="commerce" border className="space-y-8">
          <SectionHeader
            kicker="Commerce & POS"
            title="Merchandise, venue operations, and loyalty"
            description="Direct implementation of the ecommerce/POS checklist: unified inventory, offline-ready POS, and loyalty orchestration bridging GVTEWAY ↔ ATLVS ledgers."
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

        <Section id="revenue" border className="space-y-8">
          <SectionHeader
            kicker="Revenue Fabric"
            title="Commerce, marketing, and membership telemetry"
            description="Commerce lanes tie directly into ATLVS ledgers, while marketing spend and membership perks ride the shared KPI bus for executive command."
          />
          <Grid cols={3} gap={6}>
            {gvtewayRevenuePanels.map((panel) => (
              <Article key={panel.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{panel.kicker}</Label>
                <H3 className="mt-4 text-2xl uppercase">{panel.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{panel.description}</Body>
                <Stack direction="horizontal" gap={6} className="mt-6">
                  {panel.metrics.map((metric) => (
                    <Stack key={metric.label}>
                      <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">{metric.label}</Label>
                      <Body className="font-display text-3xl text-white">{metric.value}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="reconciliation" border className="space-y-8">
          <SectionHeader
            kicker="Financial Integrity"
            title="Payout reconciliation + variance control"
            description="Nightly Stripe settlements reconciled against ATLVS ledgers with variance watchdogs, fulfilling the roadmap's payout transparency requirements."
          />
          <Grid cols={3} gap={4}>
            {gvtewayReconciliationInsights.stats.map((stat) => (
              <Article key={stat.label} className="border border-ink-800 p-6">
                <Label className="text-xs uppercase tracking-[0.4em] text-ink-500">{stat.label}</Label>
                <Body className="mt-3 font-display text-4xl text-white">{stat.value}</Body>
                <Body className="text-sm text-ink-400">{stat.delta}</Body>
              </Article>
            ))}
          </Grid>
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="bg-ink-900 text-ink-500">
                <TableRow>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Run</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Window</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Gross</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Fees</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Refunds</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Net</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Variance</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-[0.3em]">Status</TableHead>
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
          <Grid cols={2} gap={4}>
            {gvtewayReconciliationInsights.alerts.map((alert) => (
              <Article key={alert.id} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="items-center justify-between text-xs uppercase tracking-[0.3em] text-ink-500">
                  <Text>{alert.label}</Text>
                  <Text className="text-ink-400">Owner: {alert.owner}</Text>
                </Stack>
                <Body className="mt-3 text-sm text-ink-200">{alert.detail}</Body>
                <StatusBadge 
                  status={alert.severity === "high" ? "error" : alert.severity === "medium" ? "warning" : "info"}
                  size="sm"
                  className="mt-4"
                >
                  {alert.severity}
                </StatusBadge>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="ticketing" border className="space-y-8">
          <SectionHeader
            kicker="Ticketing & Memberships"
            title="Access, trust, and financial controls"
            description="Maps directly to the roadmap's multi-tier ticketing, anti-scalping, and financial guardrails so launch partners can certify compliance."
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

        <Section id="mobile-tickets" border className="space-y-8">
          <SectionHeader
            kicker="Mobile Ticketing"
            title="QR access passes + revocation controls"
            description="Implements the roadmap's mobile ticketing requirement with live credential state, access tiers, and QR payload previews."
          />
          <Grid cols={3} gap={6}>
            {gvtewayMobileTickets.map((ticket) => (
              <Article key={ticket.id} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="items-center justify-between text-xs uppercase tracking-[0.3em] text-ink-500">
                  <Text>{ticket.attendee}</Text>
                  <Text>{ticket.status}</Text>
                </Stack>
                <Body className="mt-3 text-sm text-ink-200">{ticket.entryWindow}</Body>
                <Body className="text-sm text-ink-400">{ticket.access}</Body>
                <Body className="text-sm text-ink-400">{ticket.seat}</Body>
                <Stack gap={2} className="mt-4 text-sm text-ink-300">
                  <Body>Event: {ticket.eventId}</Body>
                  <Body>Ticket: {ticket.ticketTypeId}</Body>
                  <Body>Issued: {new Date(ticket.issuedAt).toLocaleString()}</Body>
                </Stack>
                <Body className="mt-4 text-[0.65rem] font-mono text-ink-500 break-all">{ticket.qrData}</Body>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="guest" border className="space-y-8">
          <SectionHeader
            kicker="Guest Journey"
            title="Pre-show intelligence → in-venue assist → post-show loyalty"
            description="Supports the roadmap's personalization, accessibility, and loyalty requirements so guests always have context-aware tools across the lifecycle."
          />
          <Grid cols={3} gap={6}>
            {gvtewayGuestSignals.map((signal) => (
              <Article key={signal.label} className="border border-ink-800 p-6">
                <H3 className="text-xl uppercase">{signal.label}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {signal.items.map((item) => (
                    <ListItem key={item}>• {item}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="community" border className="space-y-10">
          <SectionHeader
            kicker="Community & Signals"
            title="Forums, social amplification, and opportunity grids"
            description="Feature slices cover the roadmap's community management, social campaigns, and RFP/affiliate requirements so every fan tier has a lane."
          />
          <Grid cols={3} gap={6}>
            {gvtewayCommunityTracks.map((track) => (
              <Article key={track.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl uppercase">{track.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {track.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="social" border className="space-y-8">
          <SectionHeader
            kicker="Social Systems"
            title="Signal capture, activation, and intelligence"
            description="Implements the roadmap's social media stack so every event page can collect UGC, run activations, and feed analytics back into marketing pipelines."
          />
          <Grid cols={3} gap={6}>
            {gvtewaySocialPlaybook.map((block) => (
              <Article key={block.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl uppercase">{block.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {block.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="discovery" border className="space-y-8">
          <SectionHeader
            kicker="Experience Listings"
            title="Search, personalization, and commerce discovery"
            description="Covers the MASTER_ROADMAP discovery checklist: universal search, AI recommendations, curated feeds, and destination packaging."
          />
          <Grid cols={3} gap={6}>
            {gvtewayDiscoveryStreams.map((stream: (typeof gvtewayDiscoveryStreams)[number]) => (
              <Article key={stream.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl uppercase">{stream.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {stream.bullets.map((bullet: string) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
          <Card className="border border-ink-800 p-6">
            <ExperienceDiscovery />
          </Card>
        </Section>

        <Section id="email" border className="space-y-8">
          <SectionHeader
            kicker="Basic Notifications"
            title="Checkout confirmation"
            description="Shows Resend-backed confirmation emails and checklist coverage per roadmap requirements."
          />
          <Article className="border border-ink-800 p-6">
            <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Stack>
                <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">Provider</Label>
                <H3 className="text-2xl uppercase">{gvtewayEmailNotifications.provider}</H3>
              </Stack>
              <Text
                className={`text-xs uppercase tracking-[0.3em] ${
                  gvtewayEmailNotifications.status === "active" ? "text-green-400" : "text-ink-500"
                }`}
              >
                {gvtewayEmailNotifications.status}
              </Text>
            </Stack>
            <List className="mt-4 space-y-2 text-sm text-ink-200">
              {gvtewayEmailNotifications.checklist.map((item) => (
                <ListItem key={item} className="flex gap-2">
                  <Text className="text-ink-500">{"//"}</Text>
                  <Text>{item}</Text>
                </ListItem>
              ))}
            </List>
            <Link
              href="mailto:legend@gvxstship.com?subject=GVTEWAY%20Email%20Test"
              className="mt-4 inline-flex border border-ink-50 px-6 py-3 text-xs uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:bg-ink-50 hover:text-ink-950"
            >
              {gvtewayEmailNotifications.cta}
            </Link>
          </Article>
        </Section>

        <Section id="automation" border className="space-y-8">
          <SectionHeader
            kicker="Automation & Integrations"
            title="Zapier · Make · n8n"
            description="Blueprints pulled from the Automation & Open Integration Program so each connector ships with security, scale, and documentation expectations."
          />
          <Grid cols={3} gap={6}>
            {gvtewayAutomationProgram.map((program: (typeof gvtewayAutomationProgram)[number]) => (
              <Article key={program.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{program.title}</Label>
                <H3 className="mt-4 text-2xl uppercase">{program.title}</H3>
                <Body className="mt-3 text-sm text-ink-300">{program.description}</Body>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {program.bullets.map((bullet: string) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="roadmap" border className="space-y-10">
          <SectionHeader
            kicker="Development Roadmap"
            title="Foundation → Enhancement → Scale"
            description="Mirrors the MASTER_ROADMAP development phases so stakeholders can validate sequencing without leaving GVTEWAY."
          />
          <Grid cols={2} gap={6}>
            {gvtewayDevelopmentPhases.map((phase: (typeof gvtewayDevelopmentPhases)[number]) => (
              <Article key={phase.phase} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{phase.phase}</Label>
                <H3 className="mt-4 text-2xl uppercase">{phase.focus}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {phase.bullets.map((bullet: string) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
          <Section border className="space-y-6">
            <SectionHeader
              kicker="Stripe Integration"
              title="Execution Plan"
              description="Phase 1 deliverable ensures GVTEWAY tickets settle cleanly into ATLVS ledgers via Stripe infrastructure."
            />
            <List className="space-y-4 text-sm text-ink-200">
              {gvtewayStripePlan.map((step: (typeof gvtewayStripePlan)[number]) => (
                <ListItem key={step.step} className="flex flex-col gap-2 border border-ink-800 p-4">
                  <Text className="font-display text-xl uppercase text-white">{step.step}</Text>
                  <Body>{step.detail}</Body>
                </ListItem>
              ))}
            </List>
          </Section>
        </Section>

        <Section id="integrations" border className="space-y-8">
          <SectionHeader
            kicker="Tri-Platform Sync"
            title="Integration bridge"
            description="Derived from the roadmap tri-platform flows: ATLVS feeds CRM and finance telemetry, COMPVSS keeps production truths synced, and GVTEWAY closes the loop with guest data."
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

        <Section border={false} className="border border-ink-700/60 p-8 text-center">
          <SectionHeader
            kicker="Legend Ops"
            title="Need to launch GVTEWAY?"
            description="Secure access to the alpha environment, ingest the API spec, and sync with the Legend deployment team for roll-out sequencing."
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="mt-8 flex-col items-center justify-center md:flex-row">
            <Link
              href="mailto:legend@gvxstship.com"
              className="border border-white px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:-translate-y-1 hover:bg-white hover:text-black"
            >
              Email Legend Team
            </Link>
            <Link
              href="#event-stack"
              className="border border-ink-600 px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink-400 transition hover:-translate-y-1 hover:border-white hover:text-white"
            >
              Review Feature Checklist
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
