import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Card,
  Body,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
  Badge,
} from "@ghxstship/ui";
import { Sparkles, Bug, Zap, ArrowRight, Bell } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const changelogData = {
  hero: {
    headline: "WHAT'S NEW",
    description: "Stay up to date with the latest features, improvements, and fixes.",
  },
  releases: [
    {
      version: "2.4.0",
      date: "December 1, 2024",
      title: "Mobile App Redesign",
      description: "Complete overhaul of our mobile experience with improved navigation and offline support.",
      changes: [
        { type: "feature", text: "New mobile app UI with improved navigation" },
        { type: "feature", text: "Offline mode for field operations" },
        { type: "feature", text: "Push notifications for critical updates" },
        { type: "improvement", text: "50% faster sync times" },
        { type: "fix", text: "Fixed calendar timezone issues" },
      ],
    },
    {
      version: "2.3.0",
      date: "November 15, 2024",
      title: "Advanced Reporting",
      description: "New reporting engine with custom dashboards and automated report scheduling.",
      changes: [
        { type: "feature", text: "Custom dashboard builder" },
        { type: "feature", text: "Scheduled report delivery" },
        { type: "feature", text: "Export to PDF, Excel, CSV" },
        { type: "improvement", text: "Improved chart visualizations" },
        { type: "fix", text: "Fixed budget variance calculations" },
      ],
    },
    {
      version: "2.2.0",
      date: "October 28, 2024",
      title: "Crew Scheduling 2.0",
      description: "Major improvements to crew scheduling with conflict detection and availability tracking.",
      changes: [
        { type: "feature", text: "Automatic conflict detection" },
        { type: "feature", text: "Crew availability calendar" },
        { type: "feature", text: "Shift templates" },
        { type: "improvement", text: "Drag-and-drop schedule editing" },
        { type: "fix", text: "Fixed overtime calculation bugs" },
      ],
    },
    {
      version: "2.1.0",
      date: "September 10, 2024",
      title: "QuickBooks Integration",
      description: "Seamless two-way sync with QuickBooks for financial data.",
      changes: [
        { type: "feature", text: "QuickBooks Online integration" },
        { type: "feature", text: "Automatic invoice sync" },
        { type: "feature", text: "Expense categorization" },
        { type: "improvement", text: "Improved financial reports" },
      ],
    },
  ],
};

const typeIcons = {
  feature: Sparkles,
  improvement: Zap,
  fix: Bug,
};

const typeColors = {
  feature: "text-brand-pink",
  improvement: "text-info",
  fix: "text-grey-500",
};

export default function ChangelogPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              CHANGELOG
            </Label>
            <Display size="lg" className="text-white">
              {changelogData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {changelogData.hero.description}
            </Body>
            <NextLink href="#subscribe">
              <Button variant="pop" size="lg" icon={<Bell />}>
                Subscribe to Updates
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Releases */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={12}>
            {changelogData.releases.map((release) => (
              <Card key={release.version} className="border-2 border-ink-950 bg-white p-8 shadow-md">
                <Stack gap={6}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Badge variant="outline" className="border-ink-950 text-ink-950">
                          v{release.version}
                        </Badge>
                        <Label size="xs" className="text-grey-500">{release.date}</Label>
                      </Stack>
                      <H3 className="text-ink-950">{release.title}</H3>
                      <Body size="sm" className="text-grey-600">
                        {release.description}
                      </Body>
                    </Stack>
                  </Stack>

                  <Stack gap={3}>
                    {release.changes.map((change, idx) => {
                      const Icon = typeIcons[change.type as keyof typeof typeIcons];
                      const colorClass = typeColors[change.type as keyof typeof typeColors];
                      return (
                        <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                          <Icon className={`size-4 ${colorClass}`} />
                          <Label size="xs" className="text-grey-700">{change.text}</Label>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Stack className="mt-12 text-center">
            <Body size="sm" className="text-grey-500">
              Looking for older releases? Check our{" "}
              <NextLink href="/docs/api" className="text-brand-pink underline">
                release notes archive
              </NextLink>
              .
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Subscribe */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24" id="subscribe">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              STAY IN THE LOOP
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Get notified when we ship new features and improvements.
            </Body>
            <NextLink href="/settings/notifications">
              <Button variant="pop" size="lg" icon={<ArrowRight />}>
                Manage Notifications
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
