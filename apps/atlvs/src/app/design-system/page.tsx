"use client";

import { useState } from "react";
import { useLocalTabState } from "@ghxstship/config/hooks";
import {
  // Atoms
  Badge, Button, Checkbox, Input, Radio, Select, Spinner, Switch, Textarea,
  Display, H1, H2, H3, H4, Body, Label, Kicker, Avatar, AvatarGroup, ProgressBar,
  StatusBadge, HalftonePattern, GridPattern,
  // Molecules
  Alert, ButtonGroup, Card,
  EmptyState, Field, Pagination,
  Skeleton, SkeletonCard, StatCard, Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell, Tabs, TabsList, Tab, TabPanel,
  // Organisms
  Modal, ModalHeader, ModalBody, ModalFooter,
  // Foundations
  Container, Section, Grid, Stack,
  // Templates
  MainContent,
} from "@ghxstship/ui";
import { AtlvsAppLayout } from "../../components/app-layout";
import { Box, Zap, Layers, Grid3X3, Star } from "lucide-react";

// Design token data
const INK_PALETTE = [
  { name: "ink-50", hex: "#FFFFFF", usage: "Primary text on dark" },
  { name: "ink-100", hex: "#F5F5F5", usage: "Light backgrounds" },
  { name: "ink-200", hex: "#E5E5E5", usage: "Light surfaces" },
  { name: "ink-300", hex: "#D4D4D4", usage: "Light borders" },
  { name: "ink-400", hex: "#A3A3A3", usage: "Muted text" },
  { name: "ink-500", hex: "#737373", usage: "Secondary text" },
  { name: "ink-600", hex: "#525252", usage: "Dark muted" },
  { name: "ink-700", hex: "#404040", usage: "Dark borders" },
  { name: "ink-800", hex: "#262626", usage: "Dark surfaces" },
  { name: "ink-900", hex: "#171717", usage: "Dark backgrounds" },
  { name: "ink-950", hex: "#000000", usage: "Darkest / Primary BG" },
];

const STATUS_COLORS = [
  { name: "Success", hex: "#22C55E", class: "bg-success-500" },
  { name: "Warning", hex: "#F59E0B", class: "bg-warning-500" },
  { name: "Error", hex: "#EF4444", class: "bg-error-500" },
  { name: "Info", hex: "#3B82F6", class: "bg-info-500" },
];

const ACCENT_COLORS = [
  { name: "Indigo", hex: "#6366F1", class: "bg-indigo-500" },
  { name: "Violet", hex: "#8B5CF6", class: "bg-violet-500" },
  { name: "Purple", hex: "#A855F7", class: "bg-purple-500" },
  { name: "Pink", hex: "#EC4899", class: "bg-pink-500" },
  { name: "Cyan", hex: "#06B6D4", class: "bg-cyan-500" },
  { name: "Teal", hex: "#14B8A6", class: "bg-teal-500" },
];

const COMPONENT_COUNTS = {
  atoms: 29,
  molecules: 37,
  organisms: 28,
  templates: 11,
  foundations: 12,
  hooks: 15,
};

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'design-system-tab',
    defaultTab: 'overview',
  });

  const totalComponents = Object.values(COMPONENT_COUNTS).reduce((a, b) => a + b, 0);

  return (
    <AtlvsAppLayout>
      <MainContent padding="none">
        {/* Hero Header */}
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

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-10 border-b-2 border-ink-700 bg-ink-900">
          <Container>
            <Tabs>
              <TabsList>
                <Tab active={isActive('overview')} onClick={() => setActiveTab('overview')}>
                  Overview
                </Tab>
                <Tab active={isActive('colors')} onClick={() => setActiveTab('colors')}>
                  Colors
                </Tab>
                <Tab active={isActive('typography')} onClick={() => setActiveTab('typography')}>
                  Typography
                </Tab>
                <Tab active={isActive('components')} onClick={() => setActiveTab('components')}>
                  Components
                </Tab>
                <Tab active={isActive('patterns')} onClick={() => setActiveTab('patterns')}>
                  Patterns
                </Tab>
              </TabsList>
            </Tabs>
          </Container>
        </div>

        <Container>
          {/* Overview Tab */}
          {isActive('overview') && (
            <Section>
              {/* Stats */}
              <Grid cols={6} gap={4} className="mb-12">
                <StatCard label="Atoms" value={String(COMPONENT_COUNTS.atoms)} />
                <StatCard label="Molecules" value={String(COMPONENT_COUNTS.molecules)} />
                <StatCard label="Organisms" value={String(COMPONENT_COUNTS.organisms)} />
                <StatCard label="Templates" value={String(COMPONENT_COUNTS.templates)} />
                <StatCard label="Foundations" value={String(COMPONENT_COUNTS.foundations)} />
                <StatCard label="Hooks" value={String(COMPONENT_COUNTS.hooks)} />
              </Grid>

              {/* Design Principles */}
              <H2 className="mb-6 text-ink-50">Design Principles</H2>
              <Grid cols={4} gap={4} className="mb-12">
                {[
                  { icon: <Box className="size-6" />, title: "Bold", desc: "Thick borders, heavy weights, high contrast" },
                  { icon: <Zap className="size-6" />, title: "Contemporary", desc: "Clean lines, modern energy" },
                  { icon: <Layers className="size-6" />, title: "Pop Art", desc: "Hard shadows, halftone patterns" },
                  { icon: <Star className="size-6" />, title: "Adventure", desc: "Motion, bounce, discovery" },
                  { icon: <Grid3X3 className="size-6" />, title: "Comic Book", desc: "Panel layouts, thick outlines" },
                ].map((principle) => (
                  <Card key={principle.title} className="border-2 border-ink-700 bg-ink-900 p-6">
                    <div className="mb-4 text-ink-400">{principle.icon}</div>
                    <H4 className="mb-2 text-ink-50">{principle.title}</H4>
                    <Body className="text-body-sm text-ink-400">{principle.desc}</Body>
                  </Card>
                ))}
              </Grid>

              {/* Shadow System */}
              <H2 className="mb-6 text-ink-50">Shadow System</H2>
              <Body className="mb-4 text-ink-400">Hard offset shadows only - no blur, no soft shadows</Body>
              <Grid cols={4} gap={6} className="mb-12">
                <div className="border-2 border-ink-700 bg-ink-800 p-6 shadow-hard">
                  <Label className="text-ink-400">shadow-hard</Label>
                  <Body className="text-ink-300">4px 4px 0 0</Body>
                </div>
                <div className="border-2 border-ink-700 bg-ink-800 p-6 shadow-hard-lg">
                  <Label className="text-ink-400">shadow-hard-lg</Label>
                  <Body className="text-ink-300">8px 8px 0 0</Body>
                </div>
                <div className="border-2 border-ink-50 bg-ink-950 p-6 shadow-hard-white">
                  <Label className="text-ink-400">shadow-hard-white</Label>
                  <Body className="text-ink-300">4px 4px 0 white</Body>
                </div>
                <div className="border-2 border-ink-50 bg-ink-950 p-6 shadow-hard-lg-white">
                  <Label className="text-ink-400">shadow-hard-lg-white</Label>
                  <Body className="text-ink-300">8px 8px 0 white</Body>
                </div>
              </Grid>

              {/* Border Radius */}
              <H2 className="mb-6 text-ink-50">Border Radius</H2>
              <Body className="mb-4 text-ink-400">Minimal radius for geometric aesthetic</Body>
              <Grid cols={4} gap={6} className="mb-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="size-20 rounded-button border-2 border-ink-50 bg-ink-800" />
                  <Label className="text-ink-400">rounded-button</Label>
                  <Body className="text-body-sm text-ink-500">4px</Body>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="size-20 rounded-card border-2 border-ink-50 bg-ink-800" />
                  <Label className="text-ink-400">rounded-card</Label>
                  <Body className="text-body-sm text-ink-500">8px</Body>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="size-20 rounded-modal border-2 border-ink-50 bg-ink-800" />
                  <Label className="text-ink-400">rounded-modal</Label>
                  <Body className="text-body-sm text-ink-500">16px</Body>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="size-20 rounded-badge border-2 border-ink-50 bg-ink-800" />
                  <Label className="text-ink-400">rounded-badge</Label>
                  <Body className="text-body-sm text-ink-500">2px</Body>
                </div>
              </Grid>

              {/* Border Widths */}
              <H2 className="mb-6 text-ink-50">Border Widths</H2>
              <Body className="mb-4 text-ink-400">Thick borders for bold pop art aesthetic</Body>
              <Grid cols={4} gap={6}>
                <div className="border-2 border-ink-50 bg-ink-900 p-4">
                  <Label className="text-ink-400">border (1px)</Label>
                  <Body className="text-body-sm text-ink-500">Subtle dividers</Body>
                </div>
                <div className="border-2 border-ink-50 bg-ink-900 p-4">
                  <Label className="text-ink-400">border-2 (2px)</Label>
                  <Body className="text-body-sm text-ink-500">Standard interactive</Body>
                </div>
                <div className="border-thick border-ink-50 bg-ink-900 p-4">
                  <Label className="text-ink-400">border-thick (3px)</Label>
                  <Body className="text-body-sm text-ink-500">Emphasis</Body>
                </div>
                <div className="border-heavy border-ink-50 bg-ink-900 p-4">
                  <Label className="text-ink-400">border-heavy (4px)</Label>
                  <Body className="text-body-sm text-ink-500">Maximum impact</Body>
                </div>
              </Grid>
            </Section>
          )}

          {/* Colors Tab */}
          {isActive('colors') && (
            <Section>
              {/* Ink Palette */}
              <H2 className="mb-6 text-ink-50">Ink Palette</H2>
              <Body className="mb-6 text-ink-400">
                Monochromatic grayscale palette for dark-mode-first design
              </Body>
              <Grid cols={6} gap={4} className="mb-12">
                {INK_PALETTE.map((color) => (
                  <div key={color.name} className="flex flex-col items-center">
                    <div 
                      className="mb-2 size-16 border-2 border-ink-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <Label className="text-body-xs text-ink-400">{color.name}</Label>
                    <Body className="text-body-xs text-ink-500">{color.hex}</Body>
                  </div>
                ))}
              </Grid>

              {/* Status Colors */}
              <H2 className="mb-6 text-ink-50">Status Colors</H2>
              <Body className="mb-6 text-ink-400">
                Semantic colors for status indicators - exceptions to monochromatic palette
              </Body>
              <Grid cols={4} gap={4} className="mb-12">
                {STATUS_COLORS.map((color) => (
                  <Card key={color.name} className="border-2 border-ink-700 bg-ink-900 p-4">
                    <div 
                      className="mb-3 h-12 w-full border-2 border-ink-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <H4 className="text-ink-50">{color.name}</H4>
                    <Body className="text-body-sm text-ink-500">{color.hex}</Body>
                  </Card>
                ))}
              </Grid>

              {/* Accent Colors */}
              <H2 className="mb-6 text-ink-50">Accent Colors</H2>
              <Body className="mb-6 text-ink-400">
                For categories, tags, and decorative elements - visual distinction only
              </Body>
              <Grid cols={6} gap={4}>
                {ACCENT_COLORS.map((color) => (
                  <Card key={color.name} className="border-2 border-ink-700 bg-ink-900 p-4">
                    <div 
                      className="mb-3 h-12 w-full border-2 border-ink-600"
                      style={{ backgroundColor: color.hex }}
                    />
                    <H4 className="text-ink-50">{color.name}</H4>
                    <Body className="text-body-sm text-ink-500">{color.hex}</Body>
                  </Card>
                ))}
              </Grid>
            </Section>
          )}

          {/* Typography Tab */}
          {isActive('typography') && (
            <Section>
              {/* Font Families */}
              <H2 className="mb-6 text-ink-50">Font Families</H2>
              <Grid cols={2} gap={6} className="mb-12">
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Display / H1</Label>
                  <div className="font-display text-display-md uppercase text-ink-50">
                    ANTON
                  </div>
                  <Body className="mt-2 text-ink-500">
                    Impact, Arial Black fallback
                  </Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Headings H2-H6</Label>
                  <div className="font-heading text-h2-md uppercase tracking-label text-ink-50">
                    BEBAS NEUE
                  </div>
                  <Body className="mt-2 text-ink-500">
                    Arial Narrow fallback
                  </Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Body Text</Label>
                  <div className="font-body text-body-lg text-ink-50">
                    Share Tech
                  </div>
                  <Body className="mt-2 text-ink-500">
                    Monaco, Consolas fallback
                  </Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">Monospace / Code</Label>
                  <div className="font-mono text-mono-lg text-ink-50">
                    Share Tech Mono
                  </div>
                  <Body className="mt-2 text-ink-500">
                    Courier New fallback
                  </Body>
                </Card>
              </Grid>

              {/* Type Scale */}
              <H2 className="mb-6 text-ink-50">Type Scale</H2>
              <Stack gap={6} className="mb-12">
                <div className="border-b border-ink-800 pb-4">
                  <Display className="text-ink-50">Display XL - 120px</Display>
                  <Body className="text-ink-500">Hero headlines, landing pages</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <H1 className="text-ink-50">Heading 1 - 56px</H1>
                  <Body className="text-ink-500">Page titles</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <H2 className="text-ink-50">Heading 2 - 40px</H2>
                  <Body className="text-ink-500">Section headers</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <H3 className="text-ink-50">Heading 3 - 32px</H3>
                  <Body className="text-ink-500">Card titles, subsections</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <H4 className="text-ink-50">Heading 4 - 24px</H4>
                  <Body className="text-ink-500">Minor headings</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <Body className="text-body-lg text-ink-50">Body Large - 20px</Body>
                  <Body className="text-ink-500">Lead paragraphs</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <Body className="text-ink-50">Body Default - 16px</Body>
                  <Body className="text-ink-500">Standard body text</Body>
                </div>
                <div className="border-b border-ink-800 pb-4">
                  <Body className="text-body-sm text-ink-50">Body Small - 14px</Body>
                  <Body className="text-ink-500">Secondary text, captions</Body>
                </div>
                <div>
                  <Label className="text-ink-50">Label / Mono - 12px</Label>
                  <Body className="text-ink-500">Labels, badges, metadata</Body>
                </div>
              </Stack>

              {/* Text Treatment */}
              <H2 className="mb-6 text-ink-50">Text Treatment</H2>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-4 text-ink-400">Headings</Label>
                  <H3 className="text-ink-50">UPPERCASE + TIGHT TRACKING</H3>
                  <Body className="mt-2 text-ink-500">(-0.02em)</Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-4 text-ink-400">Labels & Kickers</Label>
                  <Kicker>UPPERCASE + WIDE TRACKING</Kicker>
                  <Body className="mt-2 text-ink-500">tracking-label (0.1em)</Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-4 text-ink-400">Body Text</Label>
                  <Body className="text-ink-50">Sentence case, normal tracking, 1.6 line height</Body>
                  <Body className="mt-2 text-ink-500">(0)</Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-4 text-ink-400">Buttons</Label>
                  <Button variant="solid">UPPERCASE ACTION</Button>
                  <Body className="mt-2 text-ink-500">tracking-label (0.05em)</Body>
                </Card>
              </Grid>
            </Section>
          )}

          {/* Components Tab */}
          {isActive('components') && (
            <Section>
              {/* Buttons */}
              <H2 className="mb-6 text-ink-50">Buttons</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack direction="horizontal" gap={4} className="mb-6 flex-wrap">
                  <Button variant="solid">Solid</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outlineWhite">Outline White</Button>
                  <Button variant="outlineInk">Outline Ink</Button>
                  <Button variant="solid" disabled>Disabled</Button>
                </Stack>
                <Stack direction="horizontal" gap={4} className="mb-6">
                  <Button variant="solid" size="sm">Small</Button>
                  <Button variant="solid" size="md">Medium</Button>
                  <Button variant="solid" size="lg">Large</Button>
                </Stack>
                <ButtonGroup>
                  <Button>First</Button>
                  <Button>Second</Button>
                  <Button>Third</Button>
                </ButtonGroup>
              </Card>

              {/* Badges */}
              <H2 className="mb-6 text-ink-50">Badges & Status</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack direction="horizontal" gap={3} className="mb-4 flex-wrap">
                  <Badge variant="solid">Solid</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge>Default</Badge>
                </Stack>
                <Stack direction="horizontal" gap={3} className="flex-wrap">
                  <StatusBadge status="active">Active</StatusBadge>
                  <StatusBadge status="pending">Pending</StatusBadge>
                  <StatusBadge status="success">Success</StatusBadge>
                  <StatusBadge status="error">Error</StatusBadge>
                  <StatusBadge status="warning">Warning</StatusBadge>
                  <StatusBadge status="info">Info</StatusBadge>
                </Stack>
              </Card>

              {/* Form Controls */}
              <H2 className="mb-6 text-ink-50">Form Controls</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Grid cols={2} gap={6}>
                  <Field label="Text Input" hint="Helper text appears here">
                    <Input placeholder="Enter text..." inverted />
                  </Field>
                  <Field label="Select">
                    <Select inverted>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </Select>
                  </Field>
                  <Field label="Textarea">
                    <Textarea placeholder="Multi-line input..." rows={3} inverted />
                  </Field>
                  <Stack gap={4}>
                    <Checkbox label="Checkbox option" />
                    <Radio name="demo-radio" label="Radio option 1" />
                    <Radio name="demo-radio" label="Radio option 2" />
                    <Switch label="Toggle switch" />
                  </Stack>
                </Grid>
              </Card>

              {/* Alerts */}
              <H2 className="mb-6 text-ink-50">Alerts</H2>
              <Stack gap={4} className="mb-8">
                <Alert variant="success">Success - Operation completed successfully</Alert>
                <Alert variant="warning">Warning - Please review before continuing</Alert>
                <Alert variant="error">Error - Something went wrong</Alert>
                <Alert variant="info">Info - Here is some helpful information</Alert>
              </Stack>

              {/* Cards */}
              <H2 className="mb-6 text-ink-50">Cards & Stats</H2>
              <Grid cols={4} gap={4} className="mb-8">
                <StatCard label="Revenue" value="$124.5K" trendValue="+12.5%" trend="up" />
                <StatCard label="Users" value="1,234" trendValue="-2.3%" trend="down" />
                <StatCard label="Orders" value="856" trendValue="+8.1%" trend="up" />
                <StatCard label="Conversion" value="3.2%" />
              </Grid>

              {/* Avatars */}
              <H2 className="mb-6 text-ink-50">Avatars</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack direction="horizontal" gap={4} className="mb-4">
                  <Avatar size="sm" initials="JD" />
                  <Avatar size="md" initials="JS" />
                  <Avatar size="lg" initials="BW" />
                  <Avatar size="xl" initials="AB" />
                </Stack>
                <AvatarGroup max={4}>
                  <Avatar initials="U1" />
                  <Avatar initials="U2" />
                  <Avatar initials="U3" />
                  <Avatar initials="U4" />
                  <Avatar initials="U5" />
                  <Avatar initials="U6" />
                </AvatarGroup>
              </Card>

              {/* Progress */}
              <H2 className="mb-6 text-ink-50">Progress & Loading</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4} className="mb-6">
                  <ProgressBar value={25} showLabel />
                  <ProgressBar value={50} showLabel />
                  <ProgressBar value={75} showLabel />
                  <ProgressBar value={100} showLabel />
                </Stack>
                <Stack direction="horizontal" gap={6}>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                  <Spinner variant="grey" />
                </Stack>
              </Card>

              {/* Table */}
              <H2 className="mb-6 text-ink-50">Data Table</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Table variant="dark">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Project Alpha</TableCell>
                      <TableCell><StatusBadge status="active">Active</StatusBadge></TableCell>
                      <TableCell>Lead</TableCell>
                      <TableCell>$12,500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Project Beta</TableCell>
                      <TableCell><StatusBadge status="pending">Pending</StatusBadge></TableCell>
                      <TableCell>Member</TableCell>
                      <TableCell>$8,200</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Project Gamma</TableCell>
                      <TableCell><StatusBadge status="success">Completed</StatusBadge></TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>$15,800</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={10}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </Card>

              {/* Tabs */}
              <H2 className="mb-6 text-ink-50">Tabs</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Tabs>
                  <TabsList>
                    <Tab active>Overview</Tab>
                    <Tab>Analytics</Tab>
                    <Tab>Reports</Tab>
                    <Tab>Settings</Tab>
                  </TabsList>
                  <TabPanel active>
                    <Body className="text-ink-300">
                      Tab content appears here. Each tab can contain different content.
                    </Body>
                  </TabPanel>
                </Tabs>
              </Card>

              
              {/* Modal */}
              <H2 className="mb-6 text-ink-50">Modal</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Button variant="solid" onClick={() => setModalOpen(true)}>
                  Open Modal
                </Button>
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                  <ModalHeader>
                    <H3>Modal Title</H3>
                  </ModalHeader>
                  <ModalBody>
                    <Body className="text-ink-300">
                      Modal content with standardized spacing and typography.
                      Modals use rounded-modal (16px) border-2 radius.
                    </Body>
                  </ModalBody>
                  <ModalFooter>
                    <ButtonGroup>
                      <Button variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="solid" onClick={() => setModalOpen(false)}>
                        Confirm
                      </Button>
                    </ButtonGroup>
                  </ModalFooter>
                </Modal>
              </Card>

              {/* Skeleton */}
              <H2 className="mb-6 text-ink-50">Skeleton Loading</H2>
              <Card className="mb-8 border-2 border-ink-700 bg-ink-900 p-6">
                <Grid cols={2} gap={6}>
                  <SkeletonCard />
                  <Stack gap={3}>
                    <Skeleton height="1.5rem" width="60%" />
                    <Skeleton height="1rem" width="80%" />
                    <Skeleton height="1rem" width="40%" />
                  </Stack>
                </Grid>
              </Card>

              {/* Empty State */}
              <H2 className="mb-6 text-ink-50">Empty State</H2>
              <EmptyState
                title="No Results Found"
                description="Try adjusting your search or filters to find what you are looking for."
                action={{
                  label: "Clear Filters",
                  onClick: () => {},  // eslint-disable-line @typescript-eslint/no-empty-function
                }}
              />
            </Section>
          )}

          {/* Patterns Tab */}
          {isActive('patterns') && (
            <Section>
              <H2 className="mb-6 text-ink-50">Background Patterns</H2>
              <Body className="mb-6 text-ink-400">
                Pop art inspired patterns for visual texture and depth
              </Body>
              
              <Grid cols={2} gap={6} className="mb-12">
                <div className="relative h-48 overflow-hidden border-2 border-ink-700">
                  <GridPattern className="absolute inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Label className="bg-ink-950 px-4 py-2 text-ink-50">Grid Pattern</Label>
                  </div>
                </div>
                <div className="relative h-48 overflow-hidden border-2 border-ink-700">
                  <HalftonePattern className="absolute inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Label className="bg-ink-950 px-4 py-2 text-ink-50">Halftone Pattern</Label>
                  </div>
                </div>
                <div className="relative h-48 overflow-hidden border-2 border-ink-700 bg-stripes">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Label className="bg-ink-950 px-4 py-2 text-ink-50">Stripes Pattern</Label>
                  </div>
                </div>
                <div className="relative h-48 overflow-hidden border-2 border-ink-700 bg-crosshatch">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Label className="bg-ink-950 px-4 py-2 text-ink-50">Crosshatch Pattern</Label>
                  </div>
                </div>
              </Grid>

              {/* Animations */}
              <H2 className="mb-6 text-ink-50">Animations</H2>
              <Body className="mb-6 text-ink-400">
                Snappy, bouncy animations for adventure feel
              </Body>
              
              <Grid cols={4} gap={6} className="mb-12">
                <Card className="animate-pop-in border-2 border-ink-700 bg-ink-900 p-6 text-center">
                  <Label className="text-ink-400">animate-pop-in</Label>
                </Card>
                <Card className="animate-slide-up-bounce border-2 border-ink-700 bg-ink-900 p-6 text-center">
                  <Label className="text-ink-400">animate-slide-up-bounce</Label>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6 text-center transition-transform hover:scale-105">
                  <Label className="text-ink-400">hover:scale-105</Label>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6 text-center transition-all hover:-translate-y-1 hover:shadow-hard">
                  <Label className="text-ink-400">hover:lift + shadow</Label>
                </Card>
              </Grid>

              {/* Transitions */}
              <H2 className="mb-6 text-ink-50">Transition Timing</H2>
              <Grid cols={3} gap={6}>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">transition-fast</Label>
                  <Body className="text-ink-500">100ms ease-in-out</Body>
                  <Body className="text-body-sm text-ink-600">Micro-interactions</Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">transition-base</Label>
                  <Body className="text-ink-500">200ms ease-in-out</Body>
                  <Body className="text-body-sm text-ink-600">Standard transitions</Body>
                </Card>
                <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                  <Label className="mb-2 text-ink-400">transition-slow</Label>
                  <Body className="text-ink-500">300ms ease-in-out</Body>
                  <Body className="text-body-sm text-ink-600">Page transitions</Body>
                </Card>
              </Grid>
            </Section>
          )}
        </Container>

        {/* Footer */}
        <div className="mt-16 border-t-2 border-ink-700 bg-ink-900 py-8">
          <Container>
            <Stack direction="horizontal" className="items-center justify-between">
              <Body className="text-ink-500">
                GHXSTSHIP Design System v1.0
              </Body>
              <Stack direction="horizontal" gap={4}>
                <Badge variant="outline">ATLVS</Badge>
                <Badge variant="outline">COMPVSS</Badge>
                <Badge variant="outline">GVTEWAY</Badge>
              </Stack>
            </Stack>
          </Container>
        </div>
      </MainContent>
    </AtlvsAppLayout>
  );
}
