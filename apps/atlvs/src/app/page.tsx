import { CreatorNavigationAuthenticated } from "../components/navigation";
import { Badge, Section, SectionHeader } from "../components/section";
import { ContactWizard } from "../components/contact-wizard";
import { Stack, Grid, Card, Body, H1, H2, H3, Label, Button, Link, Container, Display, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, List, ListItem, Article, Header, Main, Box, Text, Badge as UIBadge, StatusBadge } from "@ghxstship/ui";
import {
  atlvsCapabilityPanels,
  atlvsComplianceChecklist,
  atlvsExecutiveSummary,
  atlvsFinalCta,
  atlvsFormGuidelines,
  atlvsAssetInsights,
  atlvsFinanceKPIs,
  atlvsSlaCommitments,
  atlvsHero,
  atlvsImmediateNextSteps,
  atlvsIntegrationMatrix,
  atlvsIntegrationWorkflows,
  atlvsPillars,
  atlvsRoadmapSections,
  atlvsRoles,
  atlvsTriPlatformFlows,
  atlvsFeatureChecklist,
  atlvsStats,
  atlvsWorkflowTimeline,
  atlvsAuditFocus,
  atlvsAutomationProgram,
  atlvsDevelopmentPhases,
  atlvsSuccessMetrics,
  atlvsCompetitiveMatrix,
  atlvsInnovationTracks,
  atlvsGtmPlan,
  atlvsPortfolioSync,
  atlvsEntities,
  atlvsDocumentVault,
  atlvsComplianceAlerts,
} from "../data/atlvs";

export const runtime = "edge";

type PortfolioSync = (typeof atlvsPortfolioSync)[number];

export default function Home() {
  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50" id="top">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />

      <Container className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-16 pb-24 lg:px-8">
        <Header className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Stack gap={6}>
            <Label className="text-sm uppercase tracking-display text-ink-400">{atlvsHero.kicker}</Label>
            <H1 className="text-5xl uppercase text-ink-50 md:text-7xl lg:text-8xl">
              {atlvsHero.headline}
            </H1>
            <Body className="max-w-2xl text-base text-ink-300 md:text-lg">{atlvsHero.description}</Body>
            <Stack direction="horizontal" gap={3} className="flex-wrap text-xs uppercase tracking-kicker text-ink-400">
              {atlvsHero.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </Stack>
          </Stack>
          <Stack gap={6} className="text-right">
            <Label className="text-xs tracking-display text-ink-500">STATUS</Label>
            <Body className="font-code text-2xl text-ink-100">{atlvsHero.status}</Body>
            <Button variant="outline" className="inline-flex items-center gap-2 border border-ink-50 px-8 py-4 text-sm uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-ink-50 hover:text-ink-950">
              {atlvsHero.cta}
            </Button>
          </Stack>
        </Header>

        <Section id="entities" border>
          <SectionHeader
            kicker="Operating Model"
            title="Multi-entity lattice"
            description="Direction, Development, Design, and Disruption verticals lifted directly from the roadmap with utilization, OKRs, and dependency mapping."
          />
          <Grid cols={2} gap={6}>
            {atlvsEntities.map((entity) => (
              <Article key={entity.id} className="flex flex-col gap-4 border border-ink-800 p-5">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack>
                    <Label className="font-code text-xs uppercase tracking-display text-ink-500">{entity.vertical}</Label>
                    <H3 className="text-2xl uppercase">{entity.name}</H3>
                  </Stack>
                  <Stack className="text-right text-sm text-ink-300">
                    <Body>
                      Headcount: <Text className="font-display text-ink-50">{entity.headcount}</Text>
                    </Body>
                    <Body>
                      Revenue: <Text className="font-display text-ink-50">{entity.revenue}</Text>
                    </Body>
                    <Body>
                      Utilization: <Text className="font-display text-ink-50">{Math.round(entity.utilization * 100)}%</Text>
                    </Body>
                  </Stack>
                </Stack>
                <Body className="text-sm text-ink-300">{entity.description}</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap text-xs uppercase tracking-kicker text-ink-400">
                  {entity.dependencies.map((dependency) => (
                    <Badge key={dependency}>{dependency}</Badge>
                  ))}
                </Stack>
                <Stack>
                  <Label className="font-code text-xs uppercase tracking-display text-ink-500">Top OKRs</Label>
                  <List className="mt-2 space-y-1 text-sm text-ink-200">
                    {entity.okrs.map((okr) => (
                      <ListItem key={okr} className="flex gap-2">
                        <Text className="text-ink-500">{"//"}</Text>
                        <Text>{okr}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="portfolio-sync" border>
          <SectionHeader
            kicker="Cross-App Telemetry"
            title="Portfolio sync status"
            description="Live state of ATLVS ⇄ COMPVSS project links so exec ops can see exactly which productions are pending, in-progress, or blocked."
          />
          <Box className="overflow-x-auto">
            <Table variant="bordered" className="min-w-full border border-ink-800 text-left text-sm">
              <TableHeader className="bg-ink-900 text-ink-400">
                <TableRow>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Project</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">COMPVSS Link</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Status</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Last Sync</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Delta</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Blockers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atlvsPortfolioSync.map((sync: PortfolioSync) => (
                  <TableRow key={sync.id} className="border-t border-ink-800">
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-50">{sync.project}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{sync.compvssSlug}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3">
                      <Text
                        className={`inline-flex items-center gap-2 px-3 py-1 text-xs uppercase tracking-kicker ${
                          sync.status === "synced"
                            ? "bg-ink-50 text-ink-950"
                            : sync.status === "in-progress"
                              ? "bg-ink-200 text-ink-900"
                              : sync.status === "pending"
                                ? "bg-ink-700 text-ink-200"
                                : "bg-error-500 text-ink-950"
                        }`}
                      >
                        {sync.status}
                      </Text>
                    </TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{sync.lastSync}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{sync.delta}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">
                      {sync.blockers.length ? (
                        <List className="list-disc pl-4 text-ink-200">
                          {sync.blockers.map((blocker: string) => (
                            <ListItem key={blocker}>{blocker}</ListItem>
                          ))}
                        </List>
                      ) : (
                        <Text className="text-ink-400">None</Text>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        <Section border id="executive">
          <SectionHeader kicker="Executive Summary" title="Signal report" description="Live highlights and OKR signals for stakeholders." />
          <Grid cols={2} gap={6} className="md:grid-cols-[2fr_1fr]">
            <List className="space-y-3 text-sm text-ink-300">
              {atlvsExecutiveSummary.highlights.map((item) => (
                <ListItem key={item} className="flex gap-2">
                  <Text className="text-ink-500">{"//"}</Text>
                  <Text>{item}</Text>
                </ListItem>
              ))}
            </List>
            <Card className="border border-ink-800 p-4">
              <Label className="text-xs uppercase tracking-kicker text-ink-500">Signals</Label>
              <Stack gap={4} className="mt-4">
                {atlvsExecutiveSummary.signals.map((signal) => (
                  <Stack key={signal.label} direction="horizontal" className="items-center justify-between">
                    <Stack>
                      <Label className="text-xs uppercase tracking-kicker text-ink-500">{signal.label}</Label>
                      <Body className="font-display text-3xl text-ink-50">{signal.value}</Body>
                    </Stack>
                    <Text className="text-xs uppercase tracking-kicker text-ink-400">{signal.trend}</Text>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Section>

        <Section id="governance" border>
          <SectionHeader
            kicker="Governance Vault"
            title="Document intelligence + compliance alerts"
            description="Roadmap-mandated documentation control paired with live compliance escalations so executives can unblock legal and risk items in seconds."
          />
          <Grid cols={3} gap={6}>
            <Box className="overflow-x-auto lg:col-span-2">
              <Table variant="bordered" className="min-w-full border border-ink-800 text-left text-sm">
                <TableHeader className="bg-ink-900 text-ink-400">
                  <TableRow>
                    <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Doc</TableHead>
                    <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Owner</TableHead>
                    <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Category</TableHead>
                    <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Status</TableHead>
                    <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atlvsDocumentVault.map((doc) => (
                    <TableRow key={doc.id} className="border-t border-ink-800">
                      <TableCell className="border border-ink-800 px-4 py-3 font-display text-ink-50">{doc.title}</TableCell>
                      <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{doc.owner}</TableCell>
                      <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{doc.category}</TableCell>
                      <TableCell className="border border-ink-800 px-4 py-3">
                        <Text
                          className={`inline-flex items-center gap-2 border px-3 py-1 text-xs uppercase tracking-kicker ${
                            doc.status === "approved"
                              ? "border-ink-200 text-ink-100"
                              : doc.status === "in-review"
                                ? "border-ink-500 text-ink-200"
                                : "border-ink-700 text-ink-400"
                          }`}
                        >
                          <Text className="block size-2 rounded-full bg-ink-200" />
                          {doc.status}
                        </Text>
                      </TableCell>
                      <TableCell className="border border-ink-800 px-4 py-3 text-ink-400">{doc.updated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Stack gap={4}>
              <Label className="font-code text-xs uppercase tracking-display text-ink-500">Active Compliance Alerts</Label>
              <List className="space-y-3">
                {atlvsComplianceAlerts.map((alert) => (
                  <ListItem key={alert.id} className="border border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between text-xs uppercase tracking-kicker">
                      <Text className="text-ink-500">{alert.area}</Text>
                      <Text className="text-ink-400">Due {alert.due}</Text>
                    </Stack>
                    <Body className="mt-2 text-sm text-ink-50">{alert.detail}</Body>
                    <Stack direction="horizontal" className="mt-3 items-center justify-between text-xs uppercase tracking-kicker">
                      <Text className="text-ink-400">Owner: {alert.owner}</Text>
                      <Text className={`px-3 py-1 text-ink-950 ${
                        alert.severity === "high"
                          ? "bg-ink-50"
                          : alert.severity === "medium"
                            ? "bg-ink-200 text-ink-900"
                            : "bg-ink-400"
                      }`}>{alert.severity}</Text>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Grid>
        </Section>

        <Section id="gtm" border>
          <SectionHeader
            kicker="Go-To-Market"
            title="Multi-year commercial motion"
            description="Sequenced targets, tactics, and metrics for ATLVS adoption pulled straight from the master roadmap."
          />
          <Stack gap={6}>
            {atlvsGtmPlan.map((phase) => (
              <Article key={phase.phase} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Stack>
                    <Label className="font-code text-xs uppercase tracking-display text-ink-500">{phase.phase}</Label>
                    <H3 className="text-2xl uppercase">{phase.target}</H3>
                  </Stack>
                  <Text className="text-sm text-ink-400">Key tactics + proof metrics</Text>
                </Stack>
                <Grid cols={2} gap={4} className="mt-4">
                  <Stack>
                    <Label className="text-xs uppercase tracking-kicker text-ink-500">Tactics</Label>
                    <List className="mt-2 space-y-1 text-sm text-ink-200">
                      {phase.tactics.map((tactic) => (
                        <ListItem key={tactic} className="flex gap-2">
                          <Text className="text-ink-500">{"//"}</Text>
                          <Text>{tactic}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                  <Stack>
                    <Label className="text-xs uppercase tracking-kicker text-ink-500">Metrics</Label>
                    <List className="mt-2 space-y-1 text-sm text-ink-200">
                      {phase.metrics.map((metric) => (
                        <ListItem key={metric} className="flex gap-2">
                          <Text className="text-ink-500">{"//"}</Text>
                          <Text>{metric}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Grid>
              </Article>
            ))}
          </Stack>
        </Section>

        <Section id="innovation">
          <SectionHeader
            kicker="Innovation Tracks"
            title="Future-state R&D"
            description="Priority technology bets from the roadmap spanning AI, Web3, immersive, and IoT layers to keep ATLVS ahead."
          />
          <Grid cols={2} gap={6}>
            {atlvsInnovationTracks.map((track) => (
              <Article key={track.title} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{track.title}</Label>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {track.bullets.map((bullet) => (
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

        <Section id="competitive">
          <SectionHeader
            kicker="Positioning"
            title="Competitive advantage"
            description="Reference grid articulating why ATLVS wins against horizontal operators across every subsystem."
          />
          <Box className="overflow-x-auto">
            <Table variant="bordered" className="min-w-full border border-ink-800 text-left text-sm">
              <TableHeader>
                <TableRow className="bg-ink-900 text-ink-400">
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Feature</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">Competitors</TableHead>
                  <TableHead className="border border-ink-800 px-4 py-3 uppercase tracking-kicker">ATLVS Advantage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atlvsCompetitiveMatrix.map((row) => (
                  <TableRow key={row.feature} className="border-t border-ink-800">
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-50">{row.feature}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-300">{row.competitors}</TableCell>
                    <TableCell className="border border-ink-800 px-4 py-3 text-ink-200">{row.advantage}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Section>

        <Section id="roadmap" border>
          <SectionHeader
            kicker="Delivery Roadmap"
            title="Phase gates"
            description="Month-by-month commitments lifted from the master roadmap so leadership can align resourcing and sequencing."
          />
          <Stack gap={6}>
            {atlvsDevelopmentPhases.map((phase) => (
              <Article key={phase.id} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Stack>
                    <Label className="font-code text-xs uppercase tracking-display text-ink-500">{phase.phase}</Label>
                    <H3 className="text-2xl uppercase">{phase.timeframe}</H3>
                  </Stack>
                  <Text className="text-sm text-ink-400">{phase.description}</Text>
                </Stack>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {phase.deliverables.map((item) => (
                    <ListItem key={item} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{item}</Text>
                    </ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Stack>
        </Section>

        <Section id="automation">
          <SectionHeader
            kicker="Automation & DX"
            title="Open integration program"
            description="Sequenced deliverables for Zapier, Make, n8n, and OpenAPI so partners can extend ATLVS without waiting on core teams."
          />
          <Grid cols={2} gap={6}>
            {atlvsAutomationProgram.map((track) => (
              <Article key={track.id} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{track.title}</Label>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {track.bullets.map((bullet) => (
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

        <Section id="tri-platform">
          <SectionHeader
            kicker="Unified Cycles"
            title="Tri-platform signal loops"
            description="Macro flows that combine inquiry, operations, finance, and guest telemetry into one master view, mirroring the roadmap glue requirements."
          />
          <Grid gap={4}>
            {atlvsTriPlatformFlows.map((flow) => (
              <Article key={flow.title} className="flex flex-col gap-2 border border-ink-800 p-4 md:flex-row md:items-center md:justify-between">
                <Stack>
                  <H3 className="text-xl uppercase">{flow.title}</H3>
                  <Body className="text-sm text-ink-300">{flow.detail}</Body>
                </Stack>
                <Text className="text-xs uppercase tracking-kicker text-ink-500">ATLVS · COMPVSS · GVTEWAY</Text>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="feature-checklist" border>
          <SectionHeader
            kicker="Roadmap Compliance"
            title="Critical feature checklist"
            description="Operational scope derived directly from the master roadmap so each subsystem ships with verifiable coverage before production toggles."
          />
          <Grid cols={2} gap={6}>
            {atlvsFeatureChecklist.map((segment) => (
              <Article key={segment.id} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{segment.kicker}</Label>
                <H3 className="mt-4 text-2xl uppercase">{segment.title}</H3>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {segment.items.map((item) => (
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

        <Section id="integration-workflows">
          <SectionHeader
            kicker="Workflow Specs"
            title="Cross-platform automation"
            description="Line-item coverage for bridge scenarios pulled from the master roadmap to guide service ownership conversations."
          />
          <Grid gap={8}>
            {atlvsIntegrationWorkflows.map((workflow) => (
              <Article key={workflow.id} className="border border-ink-800 p-6">
                <Stack direction="horizontal" className="flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Label className="font-code text-xs uppercase tracking-display text-ink-500">{workflow.title}</Label>
                  <Text className="text-sm text-ink-400">{workflow.description}</Text>
                </Stack>
                <List className="mt-4 grid gap-2 text-sm text-ink-200 md:grid-cols-2">
                  {workflow.items.map((item) => (
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

        <Section id="metrics">
          <Grid cols={4} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
            {atlvsStats.map((stat) => (
              <Stack key={stat.label} gap={1}>
                <Text className="font-code text-xs tracking-display text-ink-500">{stat.label}</Text>
                <Text className="font-display text-4xl text-ink-50 md:text-5xl">{stat.value}</Text>
              </Stack>
            ))}
          </Grid>
        </Section>

        <Section id="kpis" border>
          <SectionHeader
            kicker="Success Metrics"
            title="Command KPIs"
            description="Scorecard of executive signals uplifted directly from the master roadmap so ATLVS launches with measurable accountability."
          />
          <Grid cols={2} gap={6}>
            {atlvsSuccessMetrics.map((group) => (
              <Article key={group.id} className="border border-ink-800 p-6">
                <Label className="font-code text-xs uppercase tracking-display text-ink-500">{group.title}</Label>
                <List className="mt-4 space-y-2 text-sm text-ink-200">
                  {group.metrics.map((metric) => (
                    <ListItem key={metric} className="flex gap-2">
                      <Text className="text-ink-500">{"//"}</Text>
                      <Text>{metric}</Text>
                    </ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section border id="sla">
          <SectionHeader
            kicker="Service Level"
            title="Operational commitments"
            description="Derived from the audit standards: time-to-response expectations across executive ops, assets, and finance."
          />
          <Grid cols={3} gap={6}>
            {atlvsSlaCommitments.map((group) => (
              <Article key={group.category} className="border border-ink-800 p-4">
                <H3 className="text-xl">{group.category}</H3>
                <List className="mt-3 space-y-2 text-sm text-ink-300">
                  {group.entries.map((entry) => (
                    <ListItem key={entry}>• {entry}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section border={false} className="grid gap-8 lg:grid-cols-2">
          {atlvsCapabilityPanels.map((panel) => (
            <Article key={panel.title} className="surface p-8">
              <Label className="font-code text-xs tracking-display text-ink-400">{panel.kicker}</Label>
              <H2 className="mt-6 text-3xl md:text-4xl">{panel.title}</H2>
              <Body className="mt-4 text-ink-300">{panel.description}</Body>
              <List className="mt-6 space-y-2 text-sm text-ink-200">
                {panel.bullets.map((bullet) => (
                  <ListItem key={bullet}>• {bullet}</ListItem>
                ))}
              </List>
            </Article>
          ))}
        </Section>

        <Section id="operations">
          <SectionHeader kicker="Platform Pillars" title="Operational Spine" description="Core subsystems powering ATLVS across business ops, projects, assets, and finance" />
          <Grid cols={4} gap={6} className="md:grid-cols-2 lg:grid-cols-4">
            {atlvsPillars.map((pillar) => (
              <Stack key={pillar.label} gap={4} className="border border-ink-800 p-4">
                <H3 className="text-xl text-ink-50">{pillar.label}</H3>
                <List className="space-y-2 text-sm text-ink-300">
                  {pillar.items.map((item) => (
                    <ListItem key={item}>{item}</ListItem>
                  ))}
                </List>
              </Stack>
            ))}
          </Grid>
        </Section>

        <Section id="projects" border={false} className="space-y-8">
          <SectionHeader
            kicker="Roadmap Execution"
            title="Full-stack initiative stream"
            description="Direct lift from the ATLVS feature checklist to ensure every subsystem ships with executive clarity, audit trails, and integration fidelity."
          />
          <Grid cols={2} gap={6}>
            {atlvsRoadmapSections.map((section) => (
              <Article key={section.id} id={section.id} className="border border-ink-800 p-6">
                <Label className="font-code text-xs tracking-display text-ink-500">{section.kicker}</Label>
                <H3 className="mt-4 text-2xl">{section.title}</H3>
                <Body className="mt-2 text-ink-300">{section.description}</Body>
                <List className="mt-4 space-y-1 text-sm text-ink-200">
                  {section.bullets.map((bullet) => (
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
            title="Inquiry → Execution → Intelligence"
            description="Step-by-step signal chain ensuring client, production, asset, and guest workflows stay synchronized across ATLVS, COMPVSS, and GVTEWAY."
          />
          <Grid gap={4}>
            {atlvsWorkflowTimeline.map((stage) => (
              <Article key={stage.label} className="flex flex-col gap-3 border border-ink-800 p-4 md:flex-row md:items-start md:gap-6">
                <Text className="font-display text-4xl text-ink-500">{stage.label}</Text>
                <Stack gap={3} className="flex-1">
                  <Stack>
                    <H3 className="text-2xl uppercase">{stage.title}</H3>
                    <Body className="mt-2 text-sm text-ink-300">{stage.description}</Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="flex-wrap text-xs uppercase tracking-kicker text-ink-400">
                    {stage.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </Stack>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="assets">
          <SectionHeader
            kicker="Asset Intelligence"
            title="Macro readiness"
            description="Telemetry-informed snapshot of maintenance, availability, and incident queues across every depot."
          />
          <Grid cols={3} gap={6}>
            {atlvsAssetInsights.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-6">
                <H3 className="text-2xl">{card.title}</H3>
                <Stack direction="horizontal" gap={6} className="mt-4">
                  {card.metrics.map((metric) => (
                    <Stack key={metric.label}>
                      <Label className="text-xs uppercase tracking-kicker text-ink-500">{metric.label}</Label>
                      <Body className="font-display text-3xl text-ink-50">{metric.value}</Body>
                    </Stack>
                  ))}
                </Stack>
                <Body className="mt-4 text-sm text-ink-300">{card.description}</Body>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="integrations">
          <SectionHeader
            kicker="Tri-Platform Links"
            title="Systems Integration Matrix"
            description="Ecosystem handshake between ATLVS, COMPVSS, and GVTEWAY so financial, production, and guest signals never drift."
          />
          <Grid cols={3} gap={6}>
            {atlvsIntegrationMatrix.map((block) => (
              <Article key={block.title} className="border border-ink-800 p-6">
                <H3 className="text-xl">{block.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{block.description}</Body>
                <List className="mt-4 space-y-1 text-xs text-ink-200">
                  {block.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section className="lg:flex-row lg:items-center lg:justify-between" >
          <Stack>
            <Label className="font-code text-xs tracking-display text-ink-500">ROLE MATRIX</Label>
            <H2 className="mt-4 text-2xl">Legend → Atlvs → Compvss interlocks</H2>
            <Body className="mt-2 max-w-2xl text-ink-300">
              Granular RBAC spans Legend god-mode through ATLVS admin, member, and viewer layers,
              ensuring precision control and secure impersonation for support flows.
            </Body>
          </Stack>
          <Grid gap={3} className="w-full text-sm uppercase tracking-kicker text-ink-200 lg:max-w-md">
            {atlvsRoles.map((role) => (
              <Stack key={role.name} className="border border-ink-700 px-4 py-3">
                <Text>{role.name}</Text>
                <Text className="font-code text-xs text-ink-500">{role.detail}</Text>
              </Stack>
            ))}
          </Grid>
        </Section>

        <Section id="forms">
          <SectionHeader
            kicker="Forms & Input System"
            title="Monochrome contact flow"
            description="Derived from the design prompts: bold multi-step wizardry, inline intelligence, and resilient submission states."
          />
          <Grid cols={3} gap={6}>
            {atlvsFormGuidelines.map((card) => (
              <Article key={card.title} className="border border-ink-800 p-4">
                <H3 className="text-xl">{card.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{card.description}</Body>
                <List className="mt-4 space-y-1 text-xs text-ink-200">
                  {card.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
          <ContactWizard />
        </Section>

        <Section id="finance">
          <SectionHeader
            kicker="Finance Stack"
            title="Live KPIs"
            description="Multi-entity cash, utilization, margin, and collections views derived from ATLVS finance automation."
          />
          <Grid cols={4} gap={6}>
            {atlvsFinanceKPIs.map((kpi) => (
              <Article key={kpi.label} className="border border-ink-800 p-4">
                <Label className="text-xs uppercase tracking-kicker text-ink-500">{kpi.label}</Label>
                <Body className="font-display text-4xl text-ink-50">{kpi.value}</Body>
                <Body className="mt-2 text-sm text-ink-300">{kpi.detail}</Body>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="compliance">
          <SectionHeader
            kicker="Full Stack Compliance"
            title="Design + Security Checklist"
            description="Guardrails derived from the audit standards to ensure every release is accessible, secure, and production-ready."
          />
          <Grid cols={3} gap={6}>
            {atlvsComplianceChecklist.map((item) => (
              <Article key={item.title} className="border border-ink-800 p-4">
                <H3 className="text-xl">{item.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{item.description}</Body>
                <List className="mt-4 space-y-1 text-xs text-ink-200">
                  {item.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="next" className="grid gap-6 md:grid-cols-3">
          {atlvsImmediateNextSteps.map((step) => (
            <Stack key={step.title} gap={3}>
              <Label className="font-code text-xs tracking-display text-ink-500">NEXT</Label>
              <H3 className="text-xl">{step.title}</H3>
              <Body className="text-sm text-ink-300">{step.detail}</Body>
            </Stack>
          ))}
        </Section>

        <Section id="audit">
          <SectionHeader kicker="Production Audit Focus" title="Zero-defect release gates" />
          <Grid cols={3} gap={6}>
            {atlvsAuditFocus.map((item) => (
              <Article key={item.title} className="border border-ink-800 p-4">
                <H3 className="text-xl">{item.title}</H3>
                <Body className="mt-2 text-sm text-ink-300">{item.detail}</Body>
                <List className="mt-4 space-y-1 text-xs text-ink-200">
                  {item.bullets.map((bullet) => (
                    <ListItem key={bullet}>• {bullet}</ListItem>
                  ))}
                </List>
              </Article>
            ))}
          </Grid>
        </Section>

        <Section id="cta" border={false} className="border border-ink-50/30 p-8 text-center">
          <SectionHeader
            kicker={atlvsFinalCta.kicker}
            title={atlvsFinalCta.title}
            description={atlvsFinalCta.description}
            align="center"
          />
          <Stack direction="horizontal" gap={4} className="flex-col items-center justify-center md:flex-row">
            <Link
              href={atlvsFinalCta.primary.href}
              className="border border-ink-50 px-8 py-4 text-xs uppercase tracking-kicker transition hover:-translate-y-1 hover:bg-ink-50 hover:text-ink-950"
            >
              {atlvsFinalCta.primary.label}
            </Link>
            <Link
              href={atlvsFinalCta.secondary.href}
              className="border border-ink-700 px-8 py-4 text-xs uppercase tracking-kicker text-ink-400 transition hover:-translate-y-1 hover:border-ink-50 hover:text-ink-50"
            >
              {atlvsFinalCta.secondary.label}
            </Link>
          </Stack>
        </Section>
      </Container>
    </Section>
  );
}
