import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H2,
  Label,
  Container,
  Display,
  Button,
  Input,
  FullBleedSection,
} from "@ghxstship/ui";
import { Play, Calendar, Users, Clock, Check } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const demoData = {
  hero: {
    headline: "SEE ATLVS IN ACTION",
    description: "Watch how production teams are transforming their workflows with ATLVS.",
  },
  benefits: [
    "30-minute personalized walkthrough",
    "See features relevant to your vertical",
    "Get answers to your specific questions",
    "No commitment required",
  ],
  stats: [
    { icon: Clock, value: "30 min", label: "Average Demo Length" },
    { icon: Users, value: "2,400+", label: "Teams Using ATLVS" },
    { icon: Calendar, value: "24 hrs", label: "Response Time" },
  ],
};

export default function DemoPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Play className="size-6 text-primary" />
                <Label size="xs" className="text-on-dark-muted">
                  PRODUCT DEMO
                </Label>
              </Stack>
              <Display size="lg" className="text-white">
                {demoData.hero.headline}
              </Display>
              <Body size="lg" className="text-on-dark-secondary">
                {demoData.hero.description}
              </Body>
              <Stack gap={3}>
                {demoData.benefits.map((benefit) => (
                  <Stack key={benefit} direction="horizontal" gap={3} className="items-center">
                    <Check className="size-4 text-primary" />
                    <Label size="sm" className="text-on-dark-secondary">
                      {benefit}
                    </Label>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            {/* Demo Video Placeholder */}
            <Card inverted className="aspect-video border-2 border-ink-800 bg-ink-900">
              <Stack className="flex h-full items-center justify-center">
                <Stack gap={4} className="items-center text-center">
                  <Stack className="flex size-16 items-center justify-center rounded-full border-2 border-primary bg-ink-800">
                    <Play className="size-8 text-primary" />
                  </Stack>
                  <Label size="sm" className="text-on-dark-muted">
                    Watch Product Overview
                  </Label>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={3} gap={8}>
            {demoData.stats.map((stat) => (
              <Stack key={stat.label} className="items-center text-center">
                <stat.icon className="mb-4 size-8 text-primary" />
                <Display size="md" className="text-ink-950">
                  {stat.value}
                </Display>
                <Label size="xs" className="text-grey-500">
                  {stat.label}
                </Label>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Schedule Demo Form */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-3xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 shadow-lg lg:p-12">
            <Stack gap={8}>
              <Stack gap={4} className="text-center">
                <H2 className="text-ink-950">SCHEDULE YOUR DEMO</H2>
                <Body className="text-grey-600">
                  Fill out the form and we&apos;ll reach out to schedule a time that works for you.
                </Body>
              </Stack>

              <form>
                <Stack gap={6}>
                  <Grid cols={2} gap={6}>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">
                        FIRST NAME
                      </Label>
                      <Input placeholder="John" className="border-2 border-ink-950" />
                    </Stack>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-950">
                        LAST NAME
                      </Label>
                      <Input placeholder="Doe" className="border-2 border-ink-950" />
                    </Stack>
                  </Grid>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      WORK EMAIL
                    </Label>
                    <Input type="email" placeholder="john@company.com" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      COMPANY
                    </Label>
                    <Input placeholder="Your Company" className="border-2 border-ink-950" />
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      TEAM SIZE
                    </Label>
                    <select className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 people</option>
                      <option value="11-50">11-50 people</option>
                      <option value="51-200">51-200 people</option>
                      <option value="201+">201+ people</option>
                    </select>
                  </Stack>

                  <Stack gap={2}>
                    <Label size="xs" className="text-ink-950">
                      WHICH VERTICAL ARE YOU MOST INTERESTED IN?
                    </Label>
                    <select className="w-full border-2 border-ink-950 bg-white px-4 py-3 text-ink-950 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select a vertical</option>
                      <option value="productions">Productions</option>
                      <option value="activations">Activations</option>
                      <option value="installations">Installations</option>
                      <option value="destinations">Destinations</option>
                    </select>
                  </Stack>

                  <Button variant="pop" size="lg" fullWidth>
                    Request Demo
                  </Button>

                  <Body size="xs" className="text-center text-grey-500">
                    By submitting this form, you agree to our{" "}
                    <NextLink href="/legal/privacy" className="text-primary underline">
                      Privacy Policy
                    </NextLink>
                  </Body>
                </Stack>
              </form>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
