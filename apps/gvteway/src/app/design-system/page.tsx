"use client";

import { useState, Suspense } from "react";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  Badge, Button, Checkbox, Input, Radio, Select, Spinner, Switch, Textarea,
  Display, H1, H2, H3, H4, Body, Label, Kicker, ProgressBar,
  StatusBadge, GridPattern,
  Alert, ButtonGroup, Card,
  Field, StatCard, Tabs, TabsList, Tab,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Container, Section, Grid, Stack,
  MainContent,
} from "@ghxstship/ui";
import { Box, Zap, Layers, Star } from "lucide-react";

const INK_PALETTE = [
  { name: "ink-50", hex: "#FFFFFF" },
  { name: "ink-100", hex: "#F5F5F5" },
  { name: "ink-200", hex: "#E5E5E5" },
  { name: "ink-300", hex: "#D4D4D4" },
  { name: "ink-400", hex: "#A3A3A3" },
  { name: "ink-500", hex: "#737373" },
  { name: "ink-600", hex: "#525252" },
  { name: "ink-700", hex: "#404040" },
  { name: "ink-800", hex: "#262626" },
  { name: "ink-900", hex: "#171717" },
  { name: "ink-950", hex: "#000000" },
];

const STATUS_COLORS = [
  { name: "Success", hex: "#22C55E" },
  { name: "Warning", hex: "#F59E0B" },
  { name: "Error", hex: "#EF4444" },
  { name: "Info", hex: "#3B82F6" },
];

const ACCENT_COLORS = [
  { name: "Indigo", hex: "#6366F1" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Teal", hex: "#14B8A6" },
];

const COMPONENT_COUNTS = {
  atoms: 29, molecules: 37, organisms: 28, templates: 11, foundations: 12, hooks: 15,
};

function DesignSystemPageContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [_currentPage, _setCurrentPage] = useState(1);
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'overview',
    validTabs: ['overview', 'colors', 'typography', 'components'],
  });
  const totalComponents = Object.values(COMPONENT_COUNTS).reduce((a, b) => a + b, 0);

  return (
    <>
      <MainContent padding="none">
        <div className="relative overflow-hidden border-b-2 border-ink-700 bg-ink-950">
          <GridPattern className="absolute inset-0 opacity-30" />
          <Container>
            <div className="relative py-16">
              <Kicker>GHXSTSHIP Platform</Kicker>
              <Display className="mb-4 text-ink-50">Design System</Display>
              <Body className="mb-8 max-w-2xl text-ink-400">
                Bold Contemporary Pop Art Adventure aesthetic. Monochromatic palette with 
                stark contrast, thick borders, hard shadows, and comic book energy.
              </Body>
              <Stack direction="horizontal" gap={4}>
                <Badge variant="solid">{totalComponents} Components</Badge>
                <Badge variant="outline">ATLVS</Badge>
                <Badge variant="outline">COMPVSS</Badge>
                <Badge variant="outline">GVTEWAY</Badge>
              </Stack>
            </div>
          </Container>
        </div>

        <div className="sticky top-0 z-10 border-b-2 border-ink-700 bg-ink-900">
          <Container>
            <Tabs>
              <TabsList>
                <Tab active={isActive('overview')} onClick={() => setActiveTab('overview')}>Overview</Tab>
                <Tab active={isActive('colors')} onClick={() => setActiveTab('colors')}>Colors</Tab>
                <Tab active={isActive('typography')} onClick={() => setActiveTab('typography')}>Typography</Tab>
                <Tab active={isActive('components')} onClick={() => setActiveTab('components')}>Components</Tab>
              </TabsList>
            </Tabs>
          </Container>
        </div>

        <Container>
          {isActive('overview') && (
            <Section>
              <Grid cols={6} gap={4} className="mb-12">
                <StatCard label="Atoms" value={String(COMPONENT_COUNTS.atoms)} />
                <StatCard label="Molecules" value={String(COMPONENT_COUNTS.molecules)} />
                <StatCard label="Organisms" value={String(COMPONENT_COUNTS.organisms)} />
                <StatCard label="Templates" value={String(COMPONENT_COUNTS.templates)} />
                <StatCard label="Foundations" value={String(COMPONENT_COUNTS.foundations)} />
                <StatCard label="Hooks" value={String(COMPONENT_COUNTS.hooks)} />
              </Grid>

              <H2 className="mb-6 text-ink-50">Design Principles</H2>
              <Grid cols={4} gap={4} className="mb-12">
                {[
                  { icon: <Box className="size-6" />, title: "Bold", desc: "Thick borders, heavy weights" },
                  { icon: <Zap className="size-6" />, title: "Contemporary", desc: "Clean lines, modern energy" },
                  { icon: <Layers className="size-6" />, title: "Pop Art", desc: "Hard shadows, halftone patterns" },
                  { icon: <Star className="size-6" />, title: "Adventure", desc: "Motion, bounce, discovery" },
                ].map((p) => (
                  <Card key={p.title} className="border-2 border-ink-700 bg-ink-900 p-6">
                    <div className="mb-4 text-ink-400">{p.icon}</div>
                    <H4 className="mb-2 text-ink-50">{p.title}</H4>
                    <Body size="sm" className=" text-ink-400">{p.desc}</Body>
                  </Card>
                ))}
              </Grid>

              <H2 className="mb-6 text-ink-50">Shadow System</H2>
              <Grid cols={4} gap={6} className="mb-12">
                <div className="border-2 border-ink-700 bg-ink-800 p-6 shadow-hard">
                  <Label className="text-ink-400">shadow-hard</Label>
                </div>
                <div className="border-2 border-ink-700 bg-ink-800 p-6 shadow-hard-lg">
                  <Label className="text-ink-400">shadow-hard-lg</Label>
                </div>
                <div className="border-2 border-ink-50 bg-ink-950 p-6 shadow-hard-white">
                  <Label className="text-ink-400">shadow-hard-white</Label>
                </div>
                <div className="border-2 border-ink-50 bg-ink-950 p-6 shadow-hard-lg-white">
                  <Label className="text-ink-400">shadow-hard-lg-white</Label>
                </div>
              </Grid>
            </Section>
          )}

          {isActive('colors') && (
            <Section>
              <H2 className="mb-6 text-ink-50">Ink Palette</H2>
              <Grid cols={6} gap={4} className="mb-12">
                {INK_PALETTE.map((c) => (
                  <div key={c.name} className="flex flex-col items-center">
                    <div className="mb-2 size-16 border-2 border-ink-600" style={{ backgroundColor: c.hex }} />
                    <Label className="text-body-xs text-ink-400">{c.name}</Label>
                  </div>
                ))}
              </Grid>
              <H2 className="mb-6 text-ink-50">Status Colors</H2>
              <Grid cols={4} gap={4} className="mb-12">
                {STATUS_COLORS.map((c) => (
                  <Card key={c.name} className="border-2 border-ink-700 bg-ink-900 p-4">
                    <div className="mb-3 h-12 w-full border-2 border-ink-600" style={{ backgroundColor: c.hex }} />
                    <H4 className="text-ink-50">{c.name}</H4>
                  </Card>
                ))}
              </Grid>
              <H2 className="mb-6 text-ink-50">Accent Colors</H2>
              <Grid cols={6} gap={4} className="sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                {ACCENT_COLORS.map((c) => (
                  <Card key={c.name} className="border-2 border-ink-700 bg-ink-900 p-4">
                    <div className="mb-3 h-12 w-full border-2 border-ink-600" style={{ backgroundColor: c.hex }} />
                    <H4 className="text-ink-50">{c.name}</H4>
                  </Card>
                ))}
              </Grid>
            </Section>
          )}

          {isActive('typography') && (
            <Section>
              <H2 className="mb-6 text-ink-50">Font Families</H2>
              <Grid cols={2} gap={6} className="mb-12">
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Display / H1</Label>
                  <div className="font-display text-display-md uppercase text-ink-50">ANTON</div>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Headings H2-H6</Label>
                  <div className="font-heading text-h2-md uppercase tracking-label text-ink-50">BEBAS NEUE</div>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Body Text</Label>
                  <div className="font-body text-body-lg text-ink-50">Share Tech</div>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Monospace</Label>
                  <div className="font-mono text-mono-lg text-ink-50">Share Tech Mono</div>
                </Card>
              </Grid>
              <H2 className="mb-6 text-ink-50">Type Scale</H2>
              <Stack gap={4}>
                <Display className="text-ink-50">Display - 120px</Display>
                <H1 className="text-ink-50">Heading 1 - 56px</H1>
                <H2 className="text-ink-50">Heading 2 - 40px</H2>
                <H3 className="text-ink-50">Heading 3 - 32px</H3>
                <H4 className="text-ink-50">Heading 4 - 24px</H4>
                <Body className="text-ink-50">Body - 16px</Body>
                <Label className="text-ink-50">Label - 12px</Label>
              </Stack>
            </Section>
          )}

          {isActive('components') && (
            <Section>
              <H2 className="mb-6 text-ink-50">Buttons</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack direction="horizontal" gap={4} className="mb-6 flex-wrap">
                  <Button variant="solid">Solid</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outlineWhite">Outline White</Button>
                </Stack>
                <ButtonGroup>
                  <Button>First</Button>
                  <Button>Second</Button>
                  <Button>Third</Button>
                </ButtonGroup>
              </Card>

              <H2 className="mb-6 text-ink-50">Badges & Status</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack direction="horizontal" gap={3} className="mb-4 flex-wrap">
                  <Badge variant="solid">Solid</Badge>
                  <Badge variant="outline">Outline</Badge>
                </Stack>
                <Stack direction="horizontal" gap={3} className="flex-wrap">
                  <StatusBadge status="active">Active</StatusBadge>
                  <StatusBadge status="pending">Pending</StatusBadge>
                  <StatusBadge status="success">Success</StatusBadge>
                  <StatusBadge status="error">Error</StatusBadge>
                </Stack>
              </Card>

              <H2 className="mb-6 text-ink-50">Form Controls</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                  <Field label="Text Input"><Input placeholder="Enter text..." inverted /></Field>
                  <Field label="Select"><Select inverted><option>Option 1</option></Select></Field>
                  <Field label="Textarea"><Textarea placeholder="Multi-line..." rows={3} inverted /></Field>
                  <Stack gap={4}>
                    <Checkbox label="Checkbox" />
                    <Radio name="demo" label="Radio" />
                    <Switch label="Switch" />
                  </Stack>
                </Grid>
              </Card>

              <H2 className="mb-6 text-ink-50">Alerts</H2>
              <Stack gap={4} className="mb-8">
                <Alert variant="success">Success message</Alert>
                <Alert variant="warning">Warning message</Alert>
                <Alert variant="error">Error message</Alert>
                <Alert variant="info">Info message</Alert>
              </Stack>

              <H2 className="mb-6 text-ink-50">Cards & Stats</H2>
              <Grid cols={4} gap={4} className="mb-8">
                <StatCard label="Revenue" value="$124.5K" trendValue="+12.5%" trend="up" />
                <StatCard label="Users" value="1,234" trendValue="-2.3%" trend="down" />
                <StatCard label="Orders" value="856" trendValue="+8.1%" trend="up" />
                <StatCard label="Rate" value="3.2%" />
              </Grid>

              <H2 className="mb-6 text-ink-50">Progress & Loading</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4} className="mb-6">
                  <ProgressBar value={25} showLabel />
                  <ProgressBar value={75} showLabel />
                </Stack>
                <Stack direction="horizontal" gap={6}>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </Stack>
              </Card>

              <H2 className="mb-6 text-ink-50">Modal</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Button variant="solid" onClick={() => setModalOpen(true)}>Open Modal</Button>
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                  <ModalHeader><H3>Modal Title</H3></ModalHeader>
                  <ModalBody><Body className="text-ink-300">Modal content here.</Body></ModalBody>
                  <ModalFooter>
                    <ButtonGroup>
                      <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                      <Button variant="solid" onClick={() => setModalOpen(false)}>Confirm</Button>
                    </ButtonGroup>
                  </ModalFooter>
                </Modal>
              </Card>
            </Section>
          )}
        </Container>

        <div className="mt-16 border-t-2 border-ink-700 bg-ink-900 py-8">
          <Container>
            <Stack direction="horizontal" className="items-center justify-between">
              <Body className="text-ink-500">GHXSTSHIP Design System v1.0</Body>
              <Stack direction="horizontal" gap={4}>
                <Badge variant="outline">ATLVS</Badge>
                <Badge variant="outline">COMPVSS</Badge>
                <Badge variant="outline">GVTEWAY</Badge>
              </Stack>
            </Stack>
          </Container>
        </div>
      </MainContent>
    </>
  );
}

export default function DesignSystemPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <DesignSystemPageContent />
    </Suspense>
  );
}
