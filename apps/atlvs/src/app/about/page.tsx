import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { Target, Heart, Zap, Users, ArrowRight } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const aboutData = {
  hero: {
    headline: "BUILT BY PRODUCTION PEOPLE WHO GOT TIRED OF THE CHAOS",
    description:
      "We started ATLVS because we lived it. The spreadsheet nightmares, the disconnected tools, the 2am fire drills that made us question our life choices. We knew there had to be a better way. Turns out, there was. We just had to build it ourselves.",
  },
  mission: {
    title: "OUR MISSION",
    description:
      "To give every production team the tools they need to create extraordinary experiences without losing their minds in the process. When the logistics disappear, the magic happens. That's not just a tagline — it's the whole point.",
  },
  values: [
    {
      icon: Target,
      title: "SHIP THE SHOW",
      description: "Everything we build helps you deliver. No feature bloat, no complexity for complexity's sake. If it doesn't help you ship, it doesn't ship.",
    },
    {
      icon: Heart,
      title: "RESPECT THE CRAFT",
      description: "Production is an art. Our tools enhance your expertise, not replace it. You're the captain — we're just building a better ship.",
    },
    {
      icon: Zap,
      title: "MOVE FAST",
      description: "In live events, speed isn't a luxury — it's survival. Our platform is built for the pace of real production, not theoretical workflows.",
    },
    {
      icon: Users,
      title: "CREW FIRST",
      description: "Happy crews make great shows. Burned out crews make mistakes. We build tools that make everyone's job easier. Including yours.",
    },
  ],
  stats: [
    { value: "2019", label: "Founded" },
    { value: "85+", label: "Team Members" },
    { value: "4", label: "Global Offices" },
    { value: "$42M", label: "Raised" },
  ],
  team: {
    title: "LEADERSHIP",
    members: [
      { name: "Alex Rivera", role: "CEO & Co-Founder", background: "Former VP Production, Insomniac" },
      { name: "Jordan Chen", role: "CTO & Co-Founder", background: "Former Engineering Lead, Eventbrite" },
      { name: "Sam Williams", role: "CPO", background: "Former Head of Product, Asana" },
      { name: "Morgan Taylor", role: "COO", background: "Former COO, C3 Presents" },
    ],
  },
  investors: ["Andreessen Horowitz", "Founders Fund", "Index Ventures", "General Catalyst"],
};

export default function AboutPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="max-w-3xl">
            <Label size="xs" className="text-on-dark-muted">
              ABOUT ATLVS
            </Label>
            <Display size="lg" className="text-white">
              {aboutData.hero.headline}
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              {aboutData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Mission */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-12 shadow-[6px_6px_0_#FF006E]">
            <Stack gap={6} className="text-center">
              <H1 className="text-ink-950">{aboutData.mission.title}</H1>
              <Body size="lg" className="text-grey-700">
                {aboutData.mission.description}
              </Body>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Stats */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Grid cols={4} gap={8}>
            {aboutData.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
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

      {/* Values */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">OUR VALUES</H1>
          </Stack>

          <Grid cols={4} gap={6}>
            {aboutData.values.map((value) => (
              <Card key={value.title} className="border-2 border-ink-950 bg-white p-6 shadow-md">
                <Stack gap={4}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <value.icon className="size-6 text-ink-950" />
                  </Stack>
                  <H3 size="sm" className="text-ink-950">
                    {value.title}
                  </H3>
                  <Body size="sm" className="text-grey-600">
                    {value.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Leadership */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-white">{aboutData.team.title}</H1>
          </Stack>

          <Grid cols={4} gap={6}>
            {aboutData.team.members.map((member) => (
              <Card key={member.name} inverted className="border-2 border-ink-800 bg-ink-900 p-6">
                <Stack gap={4}>
                  <Stack className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-800">
                    <Users className="size-8 text-on-dark-muted" />
                  </Stack>
                  <Stack gap={1}>
                    <H3 size="sm" className="text-white">
                      {member.name}
                    </H3>
                    <Label size="xs" className="text-[#FF006E]">
                      {member.role}
                    </Label>
                  </Stack>
                  <Body size="xs" className="text-on-dark-muted">
                    {member.background}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Investors */}
      <FullBleedSection background="white" className="py-16">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-grey-500">
              BACKED BY
            </Label>
            <Stack direction="horizontal" gap={12} className="flex-wrap justify-center">
              {aboutData.investors.map((investor) => (
                <Label key={investor} size="sm" className="text-grey-400">
                  {investor}
                </Label>
              ))}
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              JOIN THE TEAM
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              We&apos;re always looking for talented people who are passionate about production.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/careers">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  View Open Roles
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outlineWhite" size="lg">
                  Get in Touch
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
