import { AtlvsAppLayout } from "../../../components/app-layout";
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
  Grid,
} from "@ghxstship/ui";
import { MessageCircle, ArrowRight, Bell, Rocket, CheckCircle, Users, Zap, Trophy } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const comingSoonData = {
  title: "COMMUNITY",
  tagline: "WHERE PRODUCTION PROS ACTUALLY TALK TO EACH OTHER",
  description: "We're building a space where you can swap war stories, share templates, and learn from people who've been in the trenches. No corporate fluff, just real talk from real producers.",
  features: [
    "Discussion forums by topic",
    "User-shared templates",
    "Monthly AMAs with pros",
    "Regional meetup coordination",
    "Job board & networking",
  ],
  stats: [
    { icon: Users, value: "2,400+", label: "Productions waiting" },
    { icon: Zap, value: "150+", label: "Beta testers" },
    { icon: Trophy, value: "50+", label: "Power users" },
  ],
  eta: "Q2 2025",
};

export default function CommunityComingSoonPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="min-h-[70vh] py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Stack className="flex size-20 items-center justify-center border-2 border-ink-700 bg-ink-800">
              <MessageCircle className="size-10 text-brand-pink" />
            </Stack>
            <Label size="xs" className="text-on-dark-muted">
              COMING SOON
            </Label>
            <Display size="lg" className="text-white">
              {comingSoonData.title}
            </Display>
            <Body size="lg" className="max-w-2xl text-brand-pink">
              {comingSoonData.tagline}
            </Body>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {comingSoonData.description}
            </Body>

            {/* Stats */}
            <Grid cols={3} gap={6} className="mt-8 w-full max-w-2xl">
              {comingSoonData.stats.map((stat) => (
                <Card key={stat.label} inverted className="border-2 border-ink-800 bg-ink-900 p-6 text-center">
                  <Stack gap={2} className="items-center">
                    <stat.icon className="size-6 text-brand-pink" />
                    <Display size="md" className="text-white">{stat.value}</Display>
                    <Label size="xs" className="text-on-dark-muted">{stat.label}</Label>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Card inverted className="mt-8 border-2 border-ink-800 bg-ink-900 p-8">
              <Stack gap={4}>
                <Label size="xs" className="text-on-dark-muted">WHAT WE&apos;RE BUILDING</Label>
                <Stack gap={3}>
                  {comingSoonData.features.map((feature) => (
                    <Stack key={feature} direction="horizontal" gap={3} className="items-center">
                      <CheckCircle className="size-4 text-brand-pink" />
                      <Label size="sm" className="text-white">{feature}</Label>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Stack direction="horizontal" gap={4} className="mt-8">
              <NextLink href="/contact">
                <Button variant="pop" size="lg" icon={<Bell />}>
                  Join the Waitlist
                </Button>
              </NextLink>
              <NextLink href="/help">
                <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                  Back to Help Center
                </Button>
              </NextLink>
            </Stack>

            <Stack direction="horizontal" gap={2} className="mt-4 items-center">
              <Rocket className="size-4 text-on-dark-muted" />
              <Label size="xs" className="text-on-dark-muted">
                Expected: {comingSoonData.eta}
              </Label>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Meanwhile CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <H3 className="text-ink-950">CAN&apos;T WAIT TO CONNECT?</H3>
            <Body size="lg" className="text-grey-600">
              We host monthly virtual meetups for ATLVS users. It&apos;s like a conference, but you can wear sweatpants and nobody judges you.
            </Body>
            <NextLink href="/contact">
              <Button variant="outline" size="lg" icon={<ArrowRight />}>
                Get Meetup Invites
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
