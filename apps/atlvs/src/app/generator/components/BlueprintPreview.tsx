"use client";

import { useLocalTabState } from "@ghxstship/config/hooks";
import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  H1,
  H3,
  Card,
  Grid,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Label,
  Tooltip,
} from "@ghxstship/ui";
import {
  Eye,
  Ear,
  Hand,
  Utensils,
  Wind,
  Map,
  Clock,
  Users,
  FileText,
  Maximize2,
} from "lucide-react";
import type { GeneratedBlueprint } from "../types";

// =============================================================================
// BLUEPRINT PREVIEW COMPONENT
// Tabbed preview of the generated experience blueprint
// =============================================================================

interface BlueprintPreviewProps {
  blueprint: GeneratedBlueprint;
}

const SENSE_ICONS = {
  sight: Eye,
  sound: Ear,
  touch: Hand,
  taste: Utensils,
  smell: Wind,
};

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'blueprint-preview-tab',
    defaultTab: 'concept',
  });

  return (
    <FullBleedSection background="white" className="py-16">
      <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
        {/* Blueprint Header - Compact Hero */}
        <Box className="mb-10">
          <Stack gap={6} className="text-center">
            <Label className="font-mono text-mono-sm uppercase tracking-kicker text-grey-500">
              Your Experience Blueprint
            </Label>
            <H1 className="font-display text-display-md uppercase tracking-display text-ink-950 md:text-display-lg">
              {blueprint.concept.name}
            </H1>
            <Body className="mx-auto max-w-2xl text-body-lg italic text-grey-600">
              &ldquo;{blueprint.concept.tagline}&rdquo;
            </Body>
            
            {/* Brand Color Palette - Inline with label */}
            <Box className="flex items-center justify-center gap-4">
              <Text className="font-mono text-mono-xs uppercase tracking-kicker text-grey-400">
                Brand Palette
              </Text>
              <Box className="flex gap-2">
                {blueprint.concept.visualIdentity.colorPalette.map((color, index) => (
                  <Tooltip key={index} content={color}>
                    <Box
                      className="size-8 cursor-pointer border-2 border-ink-950 shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Tabbed Content */}
        <Tabs variant="pop">
          <TabsList variant="pop" className="mb-8 flex justify-center">
            <Tab active={isActive('concept')} onClick={() => setActiveTab('concept')} variant="pop">
              Concept
            </Tab>
            <Tab active={isActive('sensory')} onClick={() => setActiveTab('sensory')} variant="pop">
              5 Senses
            </Tab>
            <Tab active={isActive('spatial')} onClick={() => setActiveTab('spatial')} variant="pop">
              XYZ Spatial
            </Tab>
            <Tab active={isActive('journey')} onClick={() => setActiveTab('journey')} variant="pop">
              Guest Journey
            </Tab>
            <Tab active={isActive('documents')} onClick={() => setActiveTab('documents')} variant="pop">
              Documents
            </Tab>
          </TabsList>

          {/* Concept Tab */}
          <TabPanel active={isActive('concept')}>
            <Grid cols={2} gap={8}>
              <Card className="border-2 border-ink-950 p-8 shadow-md">
                <H3 className="mb-4 font-display text-h4-md uppercase text-ink-950">
                  Core Narrative
                </H3>
                <Body className="leading-body text-grey-600">
                  {blueprint.concept.narrative}
                </Body>
              </Card>
              <Card className="border-2 border-ink-950 p-8 shadow-md">
                <H3 className="mb-4 font-display text-h4-md uppercase text-ink-950">
                  Target Transformation
                </H3>
                <Body className="leading-body text-grey-600">
                  {blueprint.concept.targetTransformation}
                </Body>
                <Box className="mt-6 flex flex-wrap gap-2">
                  {blueprint.concept.visualIdentity.moodKeywords.map((keyword) => (
                    <Text
                      key={keyword}
                      className="border-2 border-grey-300 bg-grey-100 px-3 py-1 font-mono text-mono-xs uppercase text-grey-600"
                    >
                      {keyword}
                    </Text>
                  ))}
                </Box>
              </Card>
            </Grid>
          </TabPanel>

          {/* Sensory Tab */}
          <TabPanel active={isActive('sensory')}>
            <Grid cols={3} gap={4} className="md:grid-cols-3 lg:grid-cols-3">
              {(Object.keys(blueprint.sensoryDesign) as Array<keyof typeof blueprint.sensoryDesign>).map((sense) => {
                const Icon = SENSE_ICONS[sense];
                const activation = blueprint.sensoryDesign[sense];
                return (
                  <Card key={sense} className="border-2 border-ink-950 p-6 shadow-md">
                    <Box className="mb-4 flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                      <Icon className="size-6 text-ink-950" />
                    </Box>
                    <H3 className="mb-2 font-display text-h5-md uppercase text-ink-950">
                      {sense}
                    </H3>
                    <Body className="mb-4 text-body-sm text-grey-600">
                      {activation.primary}
                    </Body>
                    <Stack gap={1}>
                      {activation.secondary.slice(0, 3).map((item, i) => (
                        <Text key={i} className="font-mono text-mono-xs text-grey-500">
                          {item}
                        </Text>
                      ))}
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </TabPanel>

          {/* Spatial Tab */}
          <TabPanel active={isActive('spatial')}>
            <Grid cols={3} gap={8} className="mb-8">
              {/* X-Axis */}
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Box className="mb-4 flex items-center gap-3">
                  <Box className="flex size-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <Maximize2 className="size-5 text-ink-950" />
                  </Box>
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    X-Axis: Distance
                  </H3>
                </Box>
                <Box className="mb-4 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Box
                      key={level}
                      className={`size-8 border-2 border-ink-950 ${
                        level <= blueprint.spatialTemporal.x.level
                          ? "bg-ink-950"
                          : "bg-grey-100"
                      }`}
                    />
                  ))}
                </Box>
                <Text className="mb-2 font-display text-body-md text-ink-950">
                  {blueprint.spatialTemporal.x.description}
                </Text>
                <Body className="text-body-sm text-grey-500">
                  {blueprint.spatialTemporal.x.rationale}
                </Body>
              </Card>

              {/* Y-Axis */}
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Box className="mb-4 flex items-center gap-3">
                  <Box className="flex size-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <Map className="size-5 text-ink-950" />
                  </Box>
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    Y-Axis: Space
                  </H3>
                </Box>
                <Box className="mb-4 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Box
                      key={level}
                      className={`size-8 border-2 border-ink-950 ${
                        level <= blueprint.spatialTemporal.y.level
                          ? "bg-ink-950"
                          : "bg-grey-100"
                      }`}
                    />
                  ))}
                </Box>
                <Text className="mb-2 font-display text-body-md text-ink-950">
                  {blueprint.spatialTemporal.y.description}
                </Text>
                <Body className="text-body-sm text-grey-500">
                  {blueprint.spatialTemporal.y.rationale}
                </Body>
              </Card>

              {/* Z-Axis */}
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Box className="mb-4 flex items-center gap-3">
                  <Box className="flex size-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <Clock className="size-5 text-ink-950" />
                  </Box>
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    Z-Axis: Time
                  </H3>
                </Box>
                <Box className="mb-4 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <Box
                      key={level}
                      className={`size-8 border-2 border-ink-950 ${
                        level <= blueprint.spatialTemporal.z.level
                          ? "bg-ink-950"
                          : "bg-grey-100"
                      }`}
                    />
                  ))}
                </Box>
                <Text className="mb-2 font-display text-body-md text-ink-950">
                  {blueprint.spatialTemporal.z.description}
                </Text>
                <Body className="text-body-sm text-grey-500">
                  {blueprint.spatialTemporal.z.rationale}
                </Body>
              </Card>
            </Grid>

            {/* Zones */}
            <Card className="border-2 border-ink-950 p-6 shadow-md">
              <H3 className="mb-4 font-display text-h4-md uppercase text-ink-950">
                Experience Zones
              </H3>
              <Grid cols={4} gap={4}>
                {blueprint.spatialTemporal.zones.map((zone) => (
                  <Box
                    key={zone.code}
                    className="border-2 border-grey-300 bg-grey-100 p-4"
                  >
                    <Stack gap={2}>
                      <Text className="font-display text-body-md uppercase text-ink-950">
                        {zone.name}
                      </Text>
                      <Box className="flex flex-wrap gap-2">
                        <Text className="rounded-badge border-2 border-grey-300 bg-white px-2 py-0.5 font-mono text-mono-xs text-grey-500">
                          {zone.code}
                        </Text>
                        <Text className="rounded-badge border-2 border-grey-300 bg-white px-2 py-0.5 font-mono text-mono-xs text-grey-500">
                          Level {zone.accessLevel}
                        </Text>
                        <Text className="rounded-badge border-2 border-grey-300 bg-white px-2 py-0.5 font-mono text-mono-xs text-grey-500">
                          Cap: {zone.capacity}
                        </Text>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Grid>
            </Card>
          </TabPanel>

          {/* Journey Tab */}
          <TabPanel active={isActive('journey')}>
            <Stack gap={4}>
              {Object.entries(blueprint.guestJourney).map(([key, phase], index) => (
                <Card key={key} className="border-2 border-ink-950 p-6 shadow-md">
                  <Box className="flex items-start gap-4">
                    <Box className="flex size-12 shrink-0 items-center justify-center border-2 border-ink-950 bg-grey-100 font-display text-h4-md text-ink-950">
                      {index + 1}
                    </Box>
                    <Box className="flex-1">
                      <H3 className="mb-2 font-display text-h5-md uppercase text-ink-950">
                        {phase.name}
                      </H3>
                      <Text className="mb-4 font-mono text-mono-sm italic text-grey-500">
                        Emotional State: {phase.emotionalState}
                      </Text>
                      <Grid cols={2} gap={4}>
                        <Box>
                          <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                            Touchpoints
                          </Text>
                          <Stack gap={1}>
                            {phase.touchpoints.map((tp, i) => (
                              <Text key={i} className="text-body-sm text-grey-600">
                                {tp}
                              </Text>
                            ))}
                          </Stack>
                        </Box>
                        <Box>
                          <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                            Technology
                          </Text>
                          <Stack gap={1}>
                            {phase.technology.map((tech, i) => (
                              <Text key={i} className="text-body-sm text-grey-600">
                                {tech}
                              </Text>
                            ))}
                          </Stack>
                        </Box>
                      </Grid>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* Documents Tab */}
          <TabPanel active={isActive('documents')}>
            <Grid cols={2} gap={8}>
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Box className="mb-4 flex items-center gap-3">
                  <FileText className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    One-Page Overview
                  </H3>
                </Box>
                <Body className="leading-body text-body-sm text-grey-600">
                  {blueprint.documents.onePageOverview}
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Box className="mb-4 flex items-center gap-3">
                  <Users className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    Organization Structure
                  </H3>
                </Box>
                <Stack gap={2}>
                  {blueprint.documents.orgChartPreview.slice(0, 6).map((node, i) => (
                    <Box key={i} className="flex items-center gap-2">
                      <Box
                        className="size-3 border-2 border-ink-950"
                        style={{ marginLeft: `${(node.tier - 1) * 16}px` }}
                      />
                      <Text className="font-mono text-mono-sm text-grey-600">
                        {node.title}
                      </Text>
                    </Box>
                  ))}
                  {blueprint.documents.orgChartPreview.length > 6 && (
                    <Text className="font-mono text-mono-xs text-grey-400">
                      +{blueprint.documents.orgChartPreview.length - 6} more roles...
                    </Text>
                  )}
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <H3 className="mb-4 font-display text-h5-md uppercase text-ink-950">
                  Schedule Phases
                </H3>
                <Stack gap={2}>
                  {blueprint.documents.schedulePhases.map((phase, i) => (
                    <Box key={i} className="flex items-center justify-between border-b-2 border-grey-200 pb-2">
                      <Text className="font-mono text-mono-sm text-ink-950">
                        {phase.name}
                      </Text>
                      <Text className="font-mono text-mono-xs text-grey-500">
                        {phase.duration}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <H3 className="mb-4 font-display text-h5-md uppercase text-ink-950">
                  Credential Types
                </H3>
                <Grid cols={2} gap={2}>
                  {blueprint.documents.credentialTypes.map((cred, i) => (
                    <Box
                      key={i}
                      className="flex items-center gap-2 border-2 border-grey-200 p-2"
                    >
                      <Box
                        className="size-4 border-2 border-ink-950"
                        style={{ backgroundColor: cred.color }}
                      />
                      <Text className="font-mono text-mono-xs text-grey-600">
                        {cred.code}: {cred.name}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Card>
            </Grid>
          </TabPanel>
        </Tabs>
      </Container>
    </FullBleedSection>
  );
}
