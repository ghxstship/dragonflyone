import { AtlvsAppLayout } from "../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Link,
  Container,
  Display,
  List,
  ListItem,
  Article,
  Box,
  Text,
  FullBleedSection,
  Button,
} from "@ghxstship/ui";
import NextLink from "next/link";
import {
  Tent,
  Zap,
  Palette,
  MapPin,
  HardHat,
  Building,
  Handshake,
  BarChart3,
  Link2,
  Clock,
  Calendar,
  Users,
  Package,
  FileText,
  DollarSign,
  Shield,
  Puzzle,
  Check,
} from "lucide-react";
import {
  atlvsLandingHero,
  atlvsVerticals,
  atlvsProblemSection,
  atlvsPillarsSolution,
  atlvsFeatureGrid,
  atlvsCompvssSection,
  atlvsSocialProof,
  atlvsPricing,
  atlvsLandingCta,
} from "../data/atlvs";

export const runtime = "edge";

// =============================================================================
// ATLVS LANDING PAGE
// Marketing page for ATLVS - Production Management Platform
// Design: Bold Contemporary Pop Art Adventure with ATLVS Miami Pink accent
// =============================================================================

export default function Home() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* SECTION 1: HERO */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="relative min-h-screen">
        <Container className="relative mx-auto max-w-container-6xl px-6 py-16 lg:px-8 lg:py-24">
          <Grid cols={2} gap={12} className="items-center lg:grid-cols-2">
            <Stack gap={8}>
              <Label className="font-mono text-mono-sm uppercase tracking-widest text-grey-500">
                {atlvsLandingHero.kicker}
              </Label>
              <Display className="font-display text-display-md uppercase leading-none tracking-tight text-ink-950 md:text-display-lg">
                {atlvsLandingHero.headline}
              </Display>
              <Body className="max-w-xl text-body-lg text-grey-600">
                {atlvsLandingHero.description}
              </Body>
              <Stack direction="horizontal" gap={4} className="flex-wrap">
                <Link
                  href={atlvsLandingHero.primaryCta.href}
                  className="border-2 border-ink-950 bg-[#FF006E] px-8 py-4 font-display text-body-md uppercase tracking-wide text-white shadow-[4px_4px_0_#000] transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]"
                >
                  {atlvsLandingHero.primaryCta.label}
                </Link>
                <Link
                  href={atlvsLandingHero.secondaryCta.href}
                  className="border-2 border-ink-950 bg-white px-8 py-4 font-display text-body-md uppercase tracking-wide text-ink-950 shadow-[4px_4px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,0.2)]"
                >
                  {atlvsLandingHero.secondaryCta.label}
                </Link>
              </Stack>
            </Stack>
            <Box className="relative hidden lg:block">
              <Card className="border-2 aspect-video border-ink-950 bg-grey-100 shadow-[8px_8px_0_#FF006E]">
                <Box className="flex h-full items-center justify-center">
                  <Stack gap={4} className="text-center">
                    <Text className="font-mono text-mono-sm uppercase tracking-widest text-grey-400">
                      Product Dashboard
                    </Text>
                    <Text className="font-display text-h4-md uppercase text-grey-300">
                      Screenshot Placeholder
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
          <Box className="mt-16 border-t-2 border-grey-200 pt-8">
            <Label className="mb-6 block text-center font-mono text-mono-xs uppercase tracking-widest text-grey-400">
              Trusted by industry leaders
            </Label>
            <Stack direction="horizontal" gap={8} className="flex-wrap items-center justify-center">
              {atlvsLandingHero.trustedBy.map((company) => (
                <Text key={company} className="font-display text-h5-md uppercase tracking-wide text-grey-300">
                  {company}
                </Text>
              ))}
            </Stack>
          </Box>
        </Container>
      </FullBleedSection>

      {/* SECTION 2: FOUR VERTICALS - Features */}
      <FullBleedSection id="features" background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Stack gap={4} className="text-center">
            <H1 className="text-ink-950">BUILT FOR YOUR INDUSTRY</H1>
            <Body className="text-grey-600">Four verticals. One platform. Infinite possibilities.</Body>
          </Stack>
          <Grid cols={4} gap={6} className="mt-12 md:grid-cols-2 lg:grid-cols-4">
            {atlvsVerticals.map((vertical) => (
              <Article key={vertical.id} className="group border-2 border-ink-950 bg-white p-6 shadow-[4px_4px_0_rgba(0,0,0,0.1)] transition-all duration-150 hover:-translate-y-2 hover:shadow-[8px_8px_0_#FF006E]">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  {vertical.icon === "Tent" && <Tent className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "Zap" && <Zap className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "Palette" && <Palette className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "MapPin" && <MapPin className="h-6 w-6 text-ink-950" />}
                </Box>
                <H3 className="font-display text-h5-md uppercase tracking-wide text-ink-950">{vertical.title}</H3>
                <Body className="mt-3 text-body-sm text-grey-600">{vertical.description}</Body>
                <List className="mt-4 space-y-1">
                  {vertical.features.map((feature) => (
                    <ListItem key={feature} className="font-mono text-mono-xs uppercase tracking-wide text-grey-500">{feature}</ListItem>
                  ))}
                </List>
                <Link href={vertical.href} className="mt-6 inline-block font-mono text-mono-xs uppercase tracking-widest text-[#FF006E] transition-colors hover:text-ink-950">
                  Learn More →
                </Link>
              </Article>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 3: THE PROBLEM */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <H1 className="text-center text-white">
            {atlvsProblemSection.headline}
          </H1>
          <Grid cols={3} gap={6} className="mt-12 md:grid-cols-3">
            {atlvsProblemSection.problems.map((problem) => (
              <Article key={problem.title} className="border-2 border-grey-700 bg-ink-900 p-6">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-grey-600 bg-ink-800">
                  {problem.icon === "chaos" && <BarChart3 className="h-6 w-6 text-grey-400" />}
                  {problem.icon === "silos" && <Link2 className="h-6 w-6 text-grey-400" />}
                  {problem.icon === "clock" && <Clock className="h-6 w-6 text-grey-400" />}
                </Box>
                <H3 className="font-display text-h5-md uppercase tracking-wide text-white">{problem.title}</H3>
                <Body className="mt-3 text-body-sm text-grey-400">{problem.description}</Body>
              </Article>
            ))}
          </Grid>
          <Body className="mx-auto mt-12 max-w-2xl text-center text-body-lg text-grey-300">
            {atlvsProblemSection.tagline}
          </Body>
        </Container>
      </FullBleedSection>

      {/* SECTION 4: THREE PILLARS - Solutions */}
      <FullBleedSection id="solutions" background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <H1 className="text-center text-ink-950">ONE PLATFORM. THREE PILLARS.</H1>
          <Stack gap={16} className="mt-12">
            {atlvsPillarsSolution.map((pillar, index) => (
              <Article key={pillar.id} className={`grid gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <Card className={`border-2 aspect-video border-ink-950 bg-grey-100 shadow-[6px_6px_0_#FF006E] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Box className="flex h-full items-center justify-center">
                    <Text className="font-mono text-mono-sm uppercase tracking-widest text-grey-400">{pillar.title} Screenshot</Text>
                  </Box>
                </Card>
                <Stack gap={6} className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <H3 className="font-display text-h3-md uppercase tracking-wide text-ink-950">{pillar.title}</H3>
                  <Body className="text-body-md text-grey-600">{pillar.description}</Body>
                  <List className="space-y-2">
                    {pillar.features.map((feature) => (
                      <ListItem key={feature} className="flex items-start gap-3">
                        <Check className="h-4 w-4 flex-shrink-0 text-[#FF006E]" />
                        <Text className="text-body-sm text-grey-700">{feature}</Text>
                      </ListItem>
                    ))}
                  </List>
                  <Text className="font-mono text-mono-xs uppercase tracking-widest text-[#FF006E]">Replaces: {pillar.replaces}</Text>
                </Stack>
              </Article>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* SECTION 5: FEATURE GRID */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <H1 className="text-center text-ink-950">EVERYTHING YOU NEED TO SHIP THE SHOW</H1>
          <Grid cols={3} gap={6} className="mt-12 md:grid-cols-2 lg:grid-cols-3">
            {atlvsFeatureGrid.map((feature) => (
              <Article key={feature.title} className="border-2 border-grey-200 bg-white p-6 transition-all duration-150 hover:border-ink-950 hover:shadow-[4px_4px_0_rgba(0,0,0,0.1)]">
                <Box className="mb-4 flex h-10 w-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  {feature.icon === "Calendar" && <Calendar className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "Users" && <Users className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "Box" && <Package className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "FileText" && <FileText className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "DollarSign" && <DollarSign className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "Zap" && <Zap className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "BarChart" && <BarChart3 className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "Shield" && <Shield className="h-5 w-5 text-ink-950" />}
                  {feature.icon === "Puzzle" && <Puzzle className="h-5 w-5 text-ink-950" />}
                </Box>
                <H3 className="font-display text-h6-md uppercase tracking-wide text-ink-950">{feature.title}</H3>
                <Body className="mt-2 text-body-sm text-grey-600">{feature.description}</Body>
              </Article>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 6: COMPVSS */}
      <FullBleedSection background="ink" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Box className="border-2 border-grey-700 bg-ink-900 p-8 lg:p-12">
            <Label className="font-mono text-mono-xs uppercase tracking-widest text-[#00BFFF]">{atlvsCompvssSection.kicker}</Label>
            <Display className="mt-4 font-display text-display-sm uppercase tracking-tight text-white md:text-display-md">{atlvsCompvssSection.title}</Display>
            <Body className="mt-4 text-body-lg text-grey-400">{atlvsCompvssSection.subtitle}</Body>
            <Box className="my-8 h-px bg-grey-700" />
            <Body className="max-w-3xl text-body-md text-grey-300">{atlvsCompvssSection.description}</Body>
            <Grid cols={3} gap={6} className="mt-8 md:grid-cols-3">
              {atlvsCompvssSection.features.map((feature) => (
                <Article key={feature.title} className="border-2 border-grey-700 bg-ink-800 p-4">
                  <Box className="mb-2 flex h-10 w-10 items-center justify-center border-2 border-grey-600 bg-ink-900">
                    {feature.icon === "HardHat" && <HardHat className="h-5 w-5 text-[#00BFFF]" />}
                    {feature.icon === "Building" && <Building className="h-5 w-5 text-[#00BFFF]" />}
                    {feature.icon === "Handshake" && <Handshake className="h-5 w-5 text-[#00BFFF]" />}
                  </Box>
                  <H3 className="font-display text-h6-md uppercase tracking-wide text-white">{feature.title}</H3>
                  <Body className="mt-2 text-body-sm text-grey-400">{feature.description}</Body>
                </Article>
              ))}
            </Grid>
            <Stack gap={4} className="mt-8">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Check className="h-4 w-4 text-[#00BFFF]" />
                <Text className="font-mono text-mono-xs uppercase tracking-widest text-[#00BFFF]">{atlvsCompvssSection.note}</Text>
              </Stack>
              <Link href={atlvsCompvssSection.cta.href} className="inline-block border-2 border-[#00BFFF] bg-transparent px-6 py-3 font-mono text-mono-sm uppercase tracking-widest text-[#00BFFF] transition-all duration-150 hover:bg-[#00BFFF] hover:text-ink-950">
                {atlvsCompvssSection.cta.label}
              </Link>
            </Stack>
          </Box>
        </Container>
      </FullBleedSection>

      {/* SECTION 7: SOCIAL PROOF - About */}
      <FullBleedSection id="about" background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <H1 className="text-center text-ink-950">{atlvsSocialProof.headline}</H1>
          <Article className="border-2 mx-auto mt-12 max-w-4xl border-ink-950 bg-white p-8 shadow-[6px_6px_0_#FF006E] lg:p-12">
            <Body className="text-center text-body-lg text-grey-700 italic">&ldquo;{atlvsSocialProof.testimonial.quote}&rdquo;</Body>
            <Text className="mt-6 block text-center font-mono text-mono-sm uppercase tracking-widest text-grey-500">
              — {atlvsSocialProof.testimonial.author}, {atlvsSocialProof.testimonial.company}
            </Text>
          </Article>
          <Grid cols={4} gap={6} className="mt-12 md:grid-cols-2 lg:grid-cols-4">
            {atlvsSocialProof.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display className="font-display text-display-sm uppercase text-ink-950">{stat.value}</Display>
                <Text className="mt-2 font-mono text-mono-xs uppercase tracking-widest text-grey-500">{stat.label}</Text>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 8: PRICING */}
      <FullBleedSection id="pricing" background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">{atlvsPricing.headline}</H1>
            <Body className="text-grey-600">{atlvsPricing.subheadline}</Body>
          </Stack>

          <Grid cols={3} gap={6}>
            {atlvsPricing.tiers.map((tier) => (
              <Card
                key={tier.id}
                className={`relative flex h-full flex-col border-2 p-8 ${
                  tier.popular
                    ? "border-[#FF006E] shadow-[4px_4px_0_#FF006E]"
                    : "border-ink-950 shadow-md"
                } bg-white`}
              >
                {tier.popular && (
                  <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-[#FF006E] bg-[#FF006E] px-4 py-1 text-white">
                    MOST POPULAR
                  </Label>
                )}

                <Stack gap={6} className="flex-1">
                  <H3 className="text-ink-950">{tier.name}</H3>

                  <Stack direction="horizontal" className="items-baseline gap-1">
                    <Display size="md" className="text-ink-950">{tier.price}</Display>
                    <Label size="sm" className="text-grey-500">{tier.period}</Label>
                  </Stack>

                  <Body size="sm" className="text-grey-600">
                    {tier.description}
                  </Body>

                  <Stack gap={3} className="flex-1 border-t border-grey-200 py-4">
                    {tier.features.map((feature) => (
                      <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                        <Check className="mt-0.5 size-4 shrink-0 text-[#FF006E]" />
                        <Label size="xs" className="text-grey-700">{feature}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <NextLink href={tier.cta.href} className="mt-6 w-full">
                  {tier.popular ? (
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 border-4 border-current bg-white px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0_#FF006E] transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#FF006E] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#FF006E]"
                    >
                      {tier.cta.label}
                    </button>
                  ) : (
                    <Button variant="outline" size="md" fullWidth>
                      {tier.cta.label}
                    </Button>
                  )}
                </NextLink>
              </Card>
            ))}
          </Grid>

          <Label size="xs" className="mt-8 block text-center text-grey-500">
            {atlvsPricing.footnote}
          </Label>
        </Container>
      </FullBleedSection>

      {/* SECTION 9: FINAL CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Display className="font-display text-display-md uppercase tracking-tight text-white md:text-display-lg">{atlvsLandingCta.headline}</Display>
          <Body className="mx-auto mt-6 max-w-xl text-body-lg text-grey-400">{atlvsLandingCta.subheadline}</Body>
          <Stack direction="horizontal" gap={4} className="mt-8 flex-wrap justify-center">
            <Link href={atlvsLandingCta.primaryCta.href} className="border-2 border-[#FF006E] bg-[#FF006E] px-8 py-4 font-display text-body-md uppercase tracking-wide text-white shadow-[4px_4px_0_rgba(255,0,110,0.4)] transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(255,0,110,0.5)]">
              {atlvsLandingCta.primaryCta.label}
            </Link>
            <NextLink href={atlvsLandingCta.secondaryCta.href}>
              <Button variant="outline" size="lg" inverted>
                {atlvsLandingCta.secondaryCta.label}
              </Button>
            </NextLink>
          </Stack>
          <Text className="mt-8 font-mono text-mono-xs uppercase tracking-widest text-grey-500">{atlvsLandingCta.footnote}</Text>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
