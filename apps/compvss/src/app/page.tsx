import { Navigation } from "../components/navigation";
import { Section, SectionHeader } from "../components/section";
import { Badge, ProgressBar, Button, StatusBadge, Stack, Grid, Card, Container, Link, H1, H2, H3, H4, Body, Label, Text, List, ListItem, Article, Header, Box, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@ghxstship/ui";
import { CrewIntelligence } from "../components/crew-intelligence";
import {
  compvssAnalytics,
  compvssCommandPanels,
  compvssDirectory,
  compvssFieldInsights,
  compvssFinalCta,
  compvssHero,
  compvssIntegrationLinks,
  compvssKnowledgeBase,
  compvssOpportunities,
  compvssProjectIntakeQueue,
  compvssProjectLanes,
  compvssCheckIns,
  compvssRiskProtocols,
  compvssScheduleTracks,
  compvssShowConsole,
  compvssRunOfShow,
  compvssSignal,
  compvssStats,
  compvssFileVaultEntries,
  compvssVendors,
  compvssVenues,
  compvssEmergencyDirectory,
  compvssWorkflowTimeline,
} from "../data/compvss";

export const runtime = "edge";

export default function Home() {
  const getStatusVariant = (status: string): "success" | "error" | "warning" | "info" | "neutral" | "active" | "inactive" | "pending" => {
    switch (status) {
      case "Scheduled": return "active";
      case "Tracking": return "info";
      case "Closeout": return "neutral";
      case "Intake": 
      default: return "pending";
    }
  };

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50" id="top">
      <Card className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />
      <Navigation />

      <Container className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 lg:px-8">
        <Header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between" id="command">
          <Stack gap={6}>
            <Label className="text-sm uppercase tracking-[0.4em] text-ink-400">{compvssHero.kicker}</Label>
            <H1 className="text-5xl uppercase text-ink-50 md:text-7xl lg:text-8xl">{compvssHero.headline}</H1>
            <Body className="max-w-2xl text-base text-ink-300 md:text-lg">{compvssHero.description}</Body>
            <Stack direction="horizontal" gap={3} className="flex-wrap text-xs uppercase tracking-[0.3em] text-ink-400">
              {compvssHero.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </Stack>
          </Stack>
          <Stack gap={6} className="text-right">
            <Label className="text-xs tracking-[0.4em] text-ink-500">STATUS</Label>
            <Body className="font-code text-2xl text-ink-100">{compvssHero.status}</Body>
            <Button variant="outline" size="lg" className="border-ink-50 text-ink-50 hover:bg-ink-50 hover:text-ink-950">
              {compvssHero.cta}
            </Button>
          </Stack>
        </Header>

        <Section border id="signal" kicker="Executive Signal" title="Mission telemetry" description="Live production readiness snapshot derived from the COMPVSS roadmap checklist.">
          <Grid cols={2} gap={6} className="md:grid-cols-[2fr_1fr]">
            <List className="space-y-3 text-sm text-ink-300">
              {compvssSignal.highlights.map((item) => (
                <ListItem key={item} className="flex gap-3">
                  <Text className="text-ink-500">•</Text>
                  <Text>{item}</Text>
                </ListItem>
              ))}
            </List>
            <Card className="border border-ink-800 p-4">
              <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">Indicators</Label>
              <Stack gap={4} className="mt-4">
                {compvssSignal.indicators.map((signal) => (
                  <Stack key={signal.label} direction="horizontal" className="items-center justify-between">
                    <Stack>
                      <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">{signal.label}</Label>
                      <Body className="font-display text-3xl text-ink-50">{signal.value}</Body>
                    </Stack>
                    <Text className="text-xs uppercase tracking-[0.3em] text-ink-400">{signal.detail}</Text>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Section>

        <Section
          id="schedule"
          kicker="Schedule Control"
          title="Load-in sequencing"
          description="Phase-driven choreography for the current activation, showing dependencies, owners, and progress signals."
        >
          <Stack gap={6}>
            {compvssScheduleTracks.map((track) => (
              <Article key={track.id} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <Stack>
                    <Label className="text-xs uppercase tracking-[0.4em] text-ink-500">{track.dateLabel}</Label>
                    <H3 className="text-2xl">{track.location}</H3>
                  </Stack>
                  <Text className="text-xs uppercase tracking-[0.3em] text-ink-400">{track.phases.length} phases</Text>
                </Stack>
                <Stack gap={4} className="mt-4">
                  {track.phases.map((phase) => (
                    <Card key={`${track.id}-${phase.name}`} className="rounded border border-ink-800 p-4">
                      <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <Stack>
                          <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{phase.owner}</Label>
                          <H4 className="text-xl">{phase.name}</H4>
                        </Stack>
                        <Stack className="text-right text-sm text-ink-400">
                          <Body>
                            {phase.start} – {phase.end}
                          </Body>
                          <Body className="capitalize">{phase.status}</Body>
                        </Stack>
                      </Stack>
                      <Box className="mt-3">
                        <ProgressBar value={phase.progress} variant="inverse" />
                      </Box>
                      {phase.dependencies?.length ? (
                        <Body className="mt-2 text-xs uppercase tracking-[0.3em] text-ink-500">
                          Depends on: {phase.dependencies.join(", ")}
                        </Body>
                      ) : null}
                    </Card>
                  ))}
                </Stack>
              </Article>
            ))}
          </Stack>
        </Section>

        <Section
          id="files"
          kicker="File Exchange"
          title="Spec + compliance vault"
          description="Roadmap-mandated source of truth for riders, safety decks, COIs, and settlements."
        >
          <Grid cols={3} gap={4}>
            {compvssFileVaultEntries.map((file) => (
              <Article key={file.id} className="border border-ink-800 p-4">
                <Label className="text-xs uppercase tracking-[0.4em] text-ink-500">{file.type}</Label>
                <H3 className="mt-2 text-2xl">{file.filename}</H3>
                <Body className="mt-1 text-sm text-ink-300">{file.department}</Body>
                <Stack direction="horizontal" gap={2} className="mt-3 flex-wrap text-xs uppercase tracking-[0.3em] text-ink-400">
                  <Text className="border border-ink-800 px-3 py-1">{file.owner}</Text>
                  <Text className="border border-ink-800 px-3 py-1">{file.updatedAt}</Text>
                </Stack>
                <Body className="mt-3 text-xs uppercase tracking-[0.3em] text-ink-500">{file.status}</Body>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="crew" kicker="Team Management" title="Crew intelligence" description="Live roster, skills, and call schedule coverage for the COMPVSS workforce checklist.">
          <CrewIntelligence />
        </Section>

        <Section
          id="check-in"
          kicker="Call Status"
          title="Crew checkpoints"
          description="Badge, QR, and mobile confirmations feeding payroll + compliance audits."
        >
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="font-code text-xs uppercase tracking-[0.3em] text-ink-500">
                <TableRow>
                  <TableHead className="px-4 py-3">Crew</TableHead>
                  <TableHead className="px-4 py-3">Role</TableHead>
                  <TableHead className="px-4 py-3">Department</TableHead>
                  <TableHead className="px-4 py-3">Location</TableHead>
                  <TableHead className="px-4 py-3">Scheduled</TableHead>
                  <TableHead className="px-4 py-3">Actual</TableHead>
                  <TableHead className="px-4 py-3">Method</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compvssCheckIns.map((entry) => (
                  <TableRow key={entry.id} className="border-t border-ink-900">
                    <TableCell className="px-4 py-4 text-base">
                      <Body className="font-display text-xl">{entry.name}</Body>
                      <Body className="text-xs uppercase tracking-[0.3em] text-ink-500">{entry.id}</Body>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.role}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.department}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.location}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.scheduled}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.actual ?? "—"}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{entry.method}</TableCell>
                    <TableCell className="px-4 py-4">
                      <Text className="rounded border border-ink-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-ink-300">
                        {entry.status}
                      </Text>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        <Section
          id="intake"
          kicker="Project Intake"
          title="Pipeline triage"
          description="Live queue of productions moving from ATLVS deal capture into COMPVSS execution, with risk envelopes and ownership."
        >
          <Box className="overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="font-code text-xs uppercase tracking-[0.3em] text-ink-500">
                <TableRow>
                  <TableHead className="px-4 py-3">Project</TableHead>
                  <TableHead className="px-4 py-3">Client</TableHead>
                  <TableHead className="px-4 py-3">Venue</TableHead>
                  <TableHead className="px-4 py-3">Window</TableHead>
                  <TableHead className="px-4 py-3">Owner</TableHead>
                  <TableHead className="px-4 py-3">Budget</TableHead>
                  <TableHead className="px-4 py-3">Risk</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compvssProjectIntakeQueue.map((project) => (
                  <TableRow key={project.id} className="border-t border-ink-900">
                    <TableCell className="px-4 py-4 text-base">
                      <Body className="font-display text-xl">{project.name}</Body>
                      <Body className="text-xs uppercase tracking-[0.3em] text-ink-500">{project.id}</Body>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{project.client}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{project.venue}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{project.window}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{project.owner}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-50">{project.budget}</TableCell>
                    <TableCell className="px-4 py-4">
                      <Text className="rounded border border-ink-700 px-3 py-1 text-xs uppercase tracking-[0.3em] text-ink-300">
                        {project.risk}
                      </Text>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <StatusBadge status={getStatusVariant(project.status)} size="sm">
                        {project.status}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        <Section id="stats" border={false} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {compvssStats.map((stat) => (
            <Stack key={stat.label} gap={1}>
              <Text className="font-code text-xs tracking-[0.4em] text-ink-500">{stat.label}</Text>
              <Text className="font-display text-4xl text-ink-50 md:text-5xl">{stat.value}</Text>
            </Stack>
          ))}
        </Section>

        <Section id="projects" kicker="Control Panels" title="Production command centers" description="Derived from the MASTER_ROADMAP production project + integration checklist.">
          <Grid cols={2} gap={6}>
            {compvssCommandPanels.map((panel) => (
              <Article key={panel.title} className="surface p-8">
                <Label className="font-code text-xs tracking-[0.4em] text-ink-400">{panel.kicker}</Label>
                <H2 className="mt-6 text-3xl md:text-4xl">{panel.title}</H2>
                <Body className="mt-4 text-ink-300">{panel.description}</Body>
                <List className="mt-6 space-y-2 text-sm text-ink-200">
                  {panel.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="roadmap" border={false} className="space-y-8">
          <SectionHeader
            kicker="Roadmap Execution"
            title="Subsystem deployment stream"
            description="Every COMPVSS checklist pillar translated into shippable workstreams so project, crew, field, and show teams stay aligned."
          />
          <Grid cols={2} gap={6}>
            {compvssProjectLanes.map((lane) => (
              <Article key={lane.id} id={lane.id} className="border border-ink-800 p-6">
                <Label className="font-code text-xs tracking-[0.4em] text-ink-500">{lane.kicker}</Label>
                <H3 className="mt-4 text-2xl">{lane.title}</H3>
                <Body className="mt-2 text-ink-300">{lane.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {lane.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="field" kicker="Field Intelligence" title="Build + strike telemetry" description="Real-time load-in velocity, safety posture, and asset turnover insights for production leadership.">
          <Grid cols={3} gap={6}>
            {compvssFieldInsights.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{card.title}</H3>
                <Stack direction="horizontal" gap={6} className="mt-4">
                  {card.metrics.map((metric) => (
                    <Stack key={metric.label}>
                      <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">{metric.label}</Label>
                      <Body className="font-display text-3xl text-ink-50">{metric.value}</Body>
                    </Stack>
                  ))}
                </Stack>
                <Body className="mt-4 text-sm text-ink-300">{card.description}</Body>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="show" kicker="Show Day" title="Control room console" description="Minute-by-minute orchestration for cues, talent ops, and incident response per MASTER_ROADMAP show operations.">
          <Grid cols={3} gap={6}>
            {compvssShowConsole.map((panel) => (
              <Article key={panel.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-[0.4em] text-ink-500">{panel.kicker}</Label>
                <H3 className="mt-4 text-2xl">{panel.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{panel.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {panel.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
          <Box className="mt-8 overflow-x-auto border border-ink-800">
            <Table className="min-w-full text-left text-sm">
              <TableHeader className="font-code text-xs uppercase tracking-[0.3em] text-ink-500">
                <TableRow>
                  <TableHead className="px-4 py-3">Cue</TableHead>
                  <TableHead className="px-4 py-3">Time</TableHead>
                  <TableHead className="px-4 py-3">Owner</TableHead>
                  <TableHead className="px-4 py-3">Channel</TableHead>
                  <TableHead className="px-4 py-3">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compvssRunOfShow.map((cue) => (
                  <TableRow key={`${cue.time}-${cue.cue}`} className="border-t border-ink-900">
                    <TableCell className="px-4 py-4 text-base">
                      <Body className="font-display text-xl">{cue.cue}</Body>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{cue.time}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{cue.owner}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{cue.channel}</TableCell>
                    <TableCell className="px-4 py-4 text-ink-300">{cue.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        <Section id="directory" kicker="Directory" title="Vetted partner graph" description="Crew, vendor, venue, and emergency networks required by the COMPVSS directory checklist.">
          <Stack gap={8}>
            <Grid cols={3} gap={6}>
              {compvssDirectory.map((block) => (
                <Article key={block.title} className="border border-ink-800 p-6">
                  <H3 className="text-2xl">{block.title}</H3>
                  <Body className="mt-2 text-sm text-ink-300">{block.description}</Body>
                  <List className="mt-4 space-y-1 text-sm text-ink-200">
                    {block.bullets.map((bullet) => (
                      <ListItem key={bullet}>• {bullet}</ListItem>
                    ))}
                  </List>
                </Article>
              ))}
            </Grid>

            <Stack gap={4}>
              <H3 className="text-xl uppercase">Vendor network</H3>
              <Grid cols={3} gap={4}>
                {compvssVendors.map((vendor) => (
                  <Article key={vendor.name} className="border border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-start justify-between gap-3">
                      <Stack>
                        <Label className="text-xs uppercase tracking-[0.3em] text-ink-500">{vendor.category}</Label>
                        <H4 className="text-2xl">{vendor.name}</H4>
                      </Stack>
                      <Text className="text-xs uppercase tracking-[0.3em] text-ink-400">{vendor.rating.toFixed(1)}</Text>
                    </Stack>
                    <Body className="mt-2 text-sm text-ink-300">{vendor.location}</Body>
                    <Stack direction="horizontal" gap={2} className="mt-3 flex-wrap text-xs uppercase tracking-[0.3em] text-ink-400">
                      {vendor.specialties.map((specialty) => (
                        <Badge key={`${vendor.name}-${specialty}`} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </Stack>
                    <Link href={`mailto:${vendor.contact}`} className="mt-3 inline-flex text-xs uppercase tracking-[0.3em] text-ink-200">
                      {vendor.contact}
                    </Link>
                  </Article>
                ))}
              </Grid>
            </Stack>

            <Stack gap={4}>
              <H3 className="text-xl uppercase">Venue specs</H3>
              <Grid cols={3} gap={4}>
                {compvssVenues.map((venue) => (
                  <Article key={venue.name} className="border border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-start justify-between gap-3">
                      <H4 className="text-2xl">{venue.name}</H4>
                      <Text className="text-xs uppercase tracking-[0.3em] text-ink-400">{venue.capacity}</Text>
                    </Stack>
                    <Body className="mt-2 text-sm text-ink-300">{venue.city}</Body>
                    <List className="mt-3 space-y-1 text-sm text-ink-200">
                      {venue.specs.map((spec) => (
                        <ListItem key={`${venue.name}-${spec}`}>• {spec}</ListItem>
                      ))}
                    </List>
                    <Link href={`mailto:${venue.contact}`} className="mt-3 inline-flex text-xs uppercase tracking-[0.3em] text-ink-200">
                      {venue.contact}
                    </Link>
                  </Article>
                ))}
              </Grid>
            </Stack>

            <Stack gap={4}>
              <H3 className="text-xl uppercase">Emergency services</H3>
              <Grid cols={3} gap={4}>
                {compvssEmergencyDirectory.map((region) => (
                  <Article key={region.region} className="border border-ink-800 p-4">
                    <H4 className="text-2xl">{region.region}</H4>
                    <List className="mt-3 space-y-1 text-sm text-ink-200">
                      {region.contacts.map((contact) => (
                        <ListItem key={`${region.region}-${contact.label}`} className="flex flex-col">
                          <Text className="text-xs uppercase tracking-[0.3em] text-ink-500">{contact.label}</Text>
                          <Text>{contact.details}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Article>
                ))}
              </Grid>
            </Stack>
          </Stack>
        </Section>

        <Section id="knowledge" kicker="Knowledge Base" title="Operational intelligence vault" description="SOPs, training, and troubleshooting decks enumerated in the roadmap knowledge requirements.">
          <Grid cols={3} gap={6}>
            {compvssKnowledgeBase.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{card.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {card.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="opportunities" kicker="Opportunities" title="RFPs, gigs, careers" description="Bid, gig, and partnership pipelines lifted from the MASTER_ROADMAP opportunities checklist.">
          <Grid cols={3} gap={6}>
            {compvssOpportunities.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{card.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {card.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="analytics" kicker="Analytics" title="Live intelligence" description="Roadmap-required dashboards, predictive signals, and portability for executives + ops.">
          <Grid cols={3} gap={6}>
            {compvssAnalytics.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{card.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {card.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="risk" kicker="Risk + Compliance" title="Operational guardrails" description="Risk registers, safety, and resilience playbooks mandated by the audit + roadmap checklist.">
          <Grid cols={3} gap={6}>
            {compvssRiskProtocols.map((block) => (
              <Article key={block.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{block.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{block.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {block.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="integrations" kicker="Integrations" title="Tri-platform sync" description="How ATLVS, COMPVSS, and GVTEWAY exchange data so production, finance, and guest signals stay aligned.">
          <Grid cols={3} gap={6}>
            {compvssIntegrationLinks.map((link) => (
              <Article key={link.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{link.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{link.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {link.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="workflow">
          <SectionHeader
            kicker="Tri-Platform Workflow"
            title="Deal → Field → Intelligence"
            description="Signal chain detailing how ATLVS, COMPVSS, and GVTEWAY collaborate for every activation."
          />
          <Grid gap={4}>
            {compvssWorkflowTimeline.map((stage) => (
              <Article key={stage.label} className="flex flex-col gap-3 border border-ink-800 p-4 md:flex-row md:items-start md:gap-6">
                <Text className="font-display text-4xl text-ink-500">{stage.label}</Text>
                <Stack gap={3} className="flex-1">
                  <Stack>
                    <H3 className="text-2xl uppercase">{stage.title}</H3>
                    <Body className="mt-2 text-sm text-ink-300">{stage.description}</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="flex-wrap text-xs uppercase tracking-[0.3em] text-ink-400">
                    {stage.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </Stack>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="cta" border={false} className="border border-ink-50/30 p-8 text-center">
          <SectionHeader
            kicker={compvssFinalCta.kicker}
            title={compvssFinalCta.title}
            description={compvssFinalCta.description}
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="flex-col items-center justify-center md:flex-row">
            <Link
              href={compvssFinalCta.primary.href}
              className="border border-ink-50 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:-translate-y-1 hover:bg-ink-50 hover:text-ink-950"
            >
              {compvssFinalCta.primary.label}
            </Link>
            <Link
              href={compvssFinalCta.secondary.href}
              className="border border-ink-700 px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink-400 transition hover:-translate-y-1 hover:border-ink-50 hover:text-ink-50"
            >
              {compvssFinalCta.secondary.label}
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
