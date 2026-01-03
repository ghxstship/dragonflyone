"use client";

import { useState } from "react";
import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  Card,
  Grid,
  H2,
  H3,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
} from "@ghxstship/ui";
import {
  Palette,
  Volume2,
  Hand,
  UtensilsCrossed,
  Wind,
  Eye,
  Map,
  FileText,
  Users,
} from "lucide-react";
import type { GeneratedBlueprint } from "../types";

// =============================================================================
// BLUEPRINT PREVIEW COMPONENT
// Tabbed interface for exploring generated blueprint sections
// =============================================================================

interface BlueprintPreviewProps {
  blueprint: GeneratedBlueprint;
}

const SENSE_ICONS = {
  sight: Eye,
  sound: Volume2,
  touch: Hand,
  taste: UtensilsCrossed,
  smell: Wind,
};

const TAB_ITEMS = [
  { id: "concept", label: "Concept" },
  { id: "sensory", label: "Sensory" },
  { id: "spatial", label: "Spatial" },
  { id: "journey", label: "Journey" },
  { id: "documents", label: "Documents" },
];

export function BlueprintPreview({ blueprint }: BlueprintPreviewProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <FullBleedSection background="grey" className="py-16 lg:py-24">
      <Container className="mx-auto max-w-screen-2xl px-6 lg:px-8">
        {/* Blueprint Header */}
        <Stack gap={4} className="mb-12 text-center">
          <Text className="font-mono text-mono-sm uppercase tracking-kicker text-grey-500">
            Generated Blueprint
          </Text>
          <H2 className="font-display text-display-sm uppercase tracking-display text-ink-950">
            {blueprint.concept.name}
          </H2>
          <Body className="mx-auto max-w-2xl text-body-lg text-grey-600">
            {blueprint.concept.tagline}
          </Body>
        </Stack>

        {/* Tabbed Content */}
        <Tabs>
          <TabsList
            variant="line"
            inverted={false}
            className="mb-8 flex flex-wrap justify-center gap-2 border-b-2 border-ink-950 pb-4"
            onTabChange={setActiveTab}
          >
            {TAB_ITEMS.map((tab, index) => (
              <Tab
                key={tab.id}
                active={activeTab === index}
                variant="line"
                inverted={false}
                onClick={() => setActiveTab(index)}
                className={`border-2 px-4 py-2 font-mono text-mono-sm uppercase tracking-label transition-colors ${
                  activeTab === index
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-grey-300 bg-white text-grey-600 hover:border-ink-950"
                }`}
              >
                {tab.label}
              </Tab>
            ))}
          </TabsList>

          {/* Concept Tab */}
          <TabPanel active={activeTab === 0} inverted={false}>
            <Grid cols={2} gap={8}>
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Stack direction="horizontal" gap={3} className="mb-4 items-center">
                  <Palette className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    Visual Identity
                  </H3>
                </Stack>
                <Stack gap={4}>
                  <Box>
                    <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                      Color Palette
                    </Text>
                    <Stack direction="horizontal" gap={2}>
                      {blueprint.concept.visualIdentity.colorPalette.map((color, i) => (
                        <Box
                          key={i}
                          className="size-10 border-2 border-ink-950"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                      Typography
                    </Text>
                    <Text className="text-body-md text-grey-600">
                      {blueprint.concept.visualIdentity.typography}
                    </Text>
                  </Box>
                  <Box>
                    <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                      Mood Keywords
                    </Text>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {blueprint.concept.visualIdentity.moodKeywords.map((keyword, i) => (
                        <Text
                          key={i}
                          className="border-2 border-grey-300 bg-grey-100 px-3 py-1 font-mono text-mono-xs text-grey-600"
                        >
                          {keyword}
                        </Text>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <H3 className="mb-4 font-display text-h5-md uppercase text-ink-950">
                  Narrative
                </H3>
                <Body className="mb-6 leading-body text-body-md text-grey-600">
                  {blueprint.concept.narrative}
                </Body>
                <Box className="border-t-2 border-grey-200 pt-4">
                  <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                    Target Transformation
                  </Text>
                  <Body className="text-body-md italic text-ink-950">
                    &ldquo;{blueprint.concept.targetTransformation}&rdquo;
                  </Body>
                </Box>
              </Card>
            </Grid>
          </TabPanel>

          {/* Sensory Tab */}
          <TabPanel active={activeTab === 1} inverted={false}>
            <Grid cols={3} gap={4}>
              {Object.entries(blueprint.sensoryDesign).map(([sense, activation]) => {
                const IconComponent = SENSE_ICONS[sense as keyof typeof SENSE_ICONS];
                return (
                  <Card key={sense} className="border-2 border-ink-950 p-6 shadow-md">
                    <Stack direction="horizontal" gap={3} className="mb-4 items-center">
                      <Box className="flex size-10 items-center justify-center border-2 border-ink-950 bg-primary/10">
                        <IconComponent className="size-5 text-primary" />
                      </Box>
                      <H3 className="font-display text-h5-md uppercase text-ink-950">
                        {sense}
                      </H3>
                    </Stack>
                    <Stack gap={3}>
                      <Box>
                        <Text className="mb-1 font-mono text-mono-xs uppercase text-grey-400">
                          Primary
                        </Text>
                        <Text className="text-body-md font-weight-medium text-ink-950">
                          {activation.primary}
                        </Text>
                      </Box>
                      <Box>
                        <Text className="mb-1 font-mono text-mono-xs uppercase text-grey-400">
                          Secondary
                        </Text>
                        <Stack gap={1}>
                          {activation.secondary.map((item, i) => (
                            <Text key={i} className="text-body-sm text-grey-600">
                              {item}
                            </Text>
                          ))}
                        </Stack>
                      </Box>
                      <Box>
                        <Text className="mb-1 font-mono text-mono-xs uppercase text-grey-400">
                          Accessibility
                        </Text>
                        <Text className="text-body-sm text-grey-500">
                          {activation.accessibility}
                        </Text>
                      </Box>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </TabPanel>

          {/* Spatial Tab */}
          <TabPanel active={activeTab === 2} inverted={false}>
            <Stack gap={8}>
              {/* XYZ Levels */}
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Stack direction="horizontal" gap={3} className="mb-6 items-center">
                  <Map className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    XYZ Foundation
                  </H3>
                </Stack>
                <Grid cols={3} gap={6}>
                  {["x", "y", "z"].map((axis) => {
                    const data = blueprint.spatialTemporal[axis as "x" | "y" | "z"];
                    const labels = {
                      x: "Distance/Scale",
                      y: "Space/Footprint",
                      z: "Time/Duration",
                    };
                    return (
                      <Box key={axis} className="text-center">
                        <Text className="mb-2 font-mono text-mono-xs uppercase text-grey-400">
                          {axis.toUpperCase()}-Axis: {labels[axis as keyof typeof labels]}
                        </Text>
                        <Stack direction="horizontal" gap={1} className="mb-2 justify-center">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <Box
                              key={level}
                              className={`size-8 border-2 border-ink-950 ${
                                level <= data.level ? "bg-primary" : "bg-grey-100"
                              }`}
                            />
                          ))}
                        </Stack>
                        <Text className="font-mono text-mono-sm text-grey-600">
                          Level {data.level}/5
                        </Text>
                        <Text className="mt-2 text-body-sm text-grey-500">
                          {data.description}
                        </Text>
                      </Box>
                    );
                  })}
                </Grid>
              </Card>

              {/* Zones */}
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <H3 className="mb-4 font-display text-h5-md uppercase text-ink-950">
                  Zones ({blueprint.spatialTemporal.zones.length})
                </H3>
                <Grid cols={3} gap={4}>
                  {blueprint.spatialTemporal.zones.map((zone, i) => (
                    <Box
                      key={i}
                      className="border-2 border-grey-300 bg-white p-4"
                    >
                      <Text className="font-display text-h6-md uppercase text-ink-950">
                        {zone.name}
                      </Text>
                      <Text className="mt-1 text-body-sm text-grey-600">
                        {zone.description}
                      </Text>
                      <Text className="mt-2 font-mono text-mono-xs text-grey-500">
                        {zone.code} | Level {zone.accessLevel} | Cap: {zone.capacity}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              </Card>
            </Stack>
          </TabPanel>

          {/* Journey Tab */}
          <TabPanel active={activeTab === 3} inverted={false}>
            <Stack gap={4}>
              {Object.entries(blueprint.guestJourney).map(([key, phase], index) => (
                <Card key={key} className="border-2 border-ink-950 p-6 shadow-md">
                  <Stack direction="horizontal" gap={4} className="items-start">
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
                  </Stack>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          {/* Documents Tab */}
          <TabPanel active={activeTab === 4} inverted={false}>
            <Grid cols={2} gap={8}>
              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Stack direction="horizontal" gap={3} className="mb-4 items-center">
                  <FileText className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    One-Page Overview
                  </H3>
                </Stack>
                <Body className="leading-body text-body-sm text-grey-600">
                  {blueprint.documents.onePageOverview}
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <Stack direction="horizontal" gap={3} className="mb-4 items-center">
                  <Users className="size-6 text-ink-950" />
                  <H3 className="font-display text-h5-md uppercase text-ink-950">
                    Organization Structure
                  </H3>
                </Stack>
                <Stack gap={2}>
                  {blueprint.documents.orgChartPreview.slice(0, 6).map((node, i) => (
                    <Stack key={i} direction="horizontal" gap={2} className="items-center">
                      <Box
                        className="size-3 border-2 border-ink-950"
                        style={{ marginLeft: `${(node.tier - 1) * 16}px` }}
                      />
                      <Text className="font-mono text-mono-sm text-grey-600">
                        {node.title}
                      </Text>
                    </Stack>
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
                    <Stack
                      key={i}
                      direction="horizontal"
                      className="items-center justify-between border-b-2 border-grey-200 pb-2"
                    >
                      <Text className="font-mono text-mono-sm text-ink-950">
                        {phase.name}
                      </Text>
                      <Text className="font-mono text-mono-xs text-grey-500">
                        {phase.duration}
                      </Text>
                    </Stack>
                  ))}
                </Stack>
              </Card>

              <Card className="border-2 border-ink-950 p-6 shadow-md">
                <H3 className="mb-4 font-display text-h5-md uppercase text-ink-950">
                  Credential Types
                </H3>
                <Grid cols={2} gap={2}>
                  {blueprint.documents.credentialTypes.map((cred, i) => (
                    <Stack
                      key={i}
                      direction="horizontal"
                      gap={2}
                      className="items-center border-2 border-grey-200 p-2"
                    >
                      <Box
                        className="size-4 border-2 border-ink-950"
                        style={{ backgroundColor: cred.color }}
                      />
                      <Text className="font-mono text-mono-xs text-grey-600">
                        {cred.code}: {cred.name}
                      </Text>
                    </Stack>
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

export default BlueprintPreview;
