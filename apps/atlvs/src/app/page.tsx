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
  Building2,
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
  FastForward,
  ClipboardList,
  MessageSquare,
  Smartphone,
  Mic2,
  Briefcase,
  Camera,
  BadgeDollarSign,
  GraduationCap,
  Heart,
  Megaphone,
  Link as LinkIcon,
  Target,
  FileSignature,
  Truck,
  Route,
  Radio,
  AlertTriangle,
  IdCard,
  Receipt,
  TrendingUp,
  GitBranch,
  Sparkles,
  Lock,
  Globe,
  type LucideIcon,
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
  atlvsV3Features,
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
        <Container className="relative mx-auto max-w-container-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Label className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                {atlvsLandingHero.kicker}
              </Label>
              <Display className="font-display text-display-md uppercase leading-none text-ink-950 md:text-display-lg">
                {atlvsLandingHero.headline}
              </Display>
              <Body className="max-w-xl text-body-lg text-grey-600">
                {atlvsLandingHero.description}
              </Body>
              <Stack direction="horizontal" gap={4} className="flex-wrap">
                <NextLink href={atlvsLandingHero.primaryCta.href}>
                  <Button variant="pop" size="lg">
                    {atlvsLandingHero.primaryCta.label}
                  </Button>
                </NextLink>
                <NextLink href={atlvsLandingHero.secondaryCta.href}>
                  <Button variant="outline" size="lg">
                    {atlvsLandingHero.secondaryCta.label}
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
            <Box className="relative hidden lg:block">
              <Card className="border-2 aspect-video border-ink-950 bg-grey-100 shadow-brand-xl">
                <Box className="flex h-full items-center justify-center">
                  <Stack gap={4} className="text-center">
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">
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
          <Box className="mt-12 border-t-2 border-grey-200 pt-6 sm:mt-16 sm:pt-8">
            <Label className="mb-4 block text-center font-mono text-mono-xs uppercase tracking-label text-grey-400 sm:mb-6">
              Trusted by industry leaders
            </Label>
            <Stack direction="horizontal" gap={4} className="flex-wrap items-center justify-center sm:gap-8">
              {atlvsLandingHero.trustedBy.map((company) => (
                <Text key={company} className="font-display text-h5-md uppercase tracking-label text-grey-300">
                  {company}
                </Text>
              ))}
            </Stack>
          </Box>
        </Container>
      </FullBleedSection>

      {/* SECTION 2: FOUR VERTICALS - Features */}
      <FullBleedSection id="features" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="text-center">
            <H1 className="text-ink-950">NATIVE TO YOUR WORLD.</H1>
            <Body className="text-grey-600">Four verticals. One platform. Infinite possibilities.</Body>
          </Stack>
          <Grid cols={4} gap={4} className="mt-8 sm:mt-12 sm:gap-6">
            {atlvsVerticals.map((vertical) => (
              <Article key={vertical.id} className="group flex h-full flex-col border-2 border-ink-950 bg-white p-4 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl sm:p-6">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  {vertical.icon === "Tent" && <Tent className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "Zap" && <Zap className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "Palette" && <Palette className="h-6 w-6 text-ink-950" />}
                  {vertical.icon === "MapPin" && <MapPin className="h-6 w-6 text-ink-950" />}
                </Box>
                <H3 className="font-display text-h5-md uppercase tracking-label text-ink-950">{vertical.title}</H3>
                <Body className="mt-3 flex-1 text-grey-600">{vertical.description}</Body>
                <List className="mt-4 space-y-1">
                  {vertical.features.map((feature) => (
                    <ListItem key={feature} className="font-mono text-mono-xs uppercase tracking-label text-grey-500">{feature}</ListItem>
                  ))}
                </List>
                <Link href={vertical.href} className="mt-6 inline-block font-mono text-mono-xs uppercase tracking-label text-brand-pink transition-colors hover:text-ink-950">
                  Learn More →
                </Link>
              </Article>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 3: THE PROBLEM */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <H1 className="text-center text-white">
            {atlvsProblemSection.headline}
          </H1>
          <Grid cols={3} gap={4} className="mt-8 sm:mt-12 sm:gap-6">
            {atlvsProblemSection.problems.map((problem) => (
              <Article key={problem.title} className="border-2 border-ink-800 bg-ink-900 p-4 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl sm:p-6">
                <Box className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-grey-600 bg-ink-800">
                  {problem.icon === "chaos" && <BarChart3 className="h-6 w-6 text-grey-400" />}
                  {problem.icon === "silos" && <Link2 className="h-6 w-6 text-grey-400" />}
                  {problem.icon === "clock" && <Clock className="h-6 w-6 text-grey-400" />}
                </Box>
                <H3 className="font-display text-h5-md uppercase tracking-label text-white">{problem.title}</H3>
                <Body className="mt-3 text-grey-400">{problem.description}</Body>
              </Article>
            ))}
          </Grid>
          <Body className="mx-auto mt-12 max-w-2xl text-center text-body-lg text-grey-300">
            {atlvsProblemSection.tagline}
          </Body>
        </Container>
      </FullBleedSection>

      {/* SECTION 4: FOUR PILLARS - Solutions */}
      <FullBleedSection id="solutions" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <H1 className="text-center text-ink-950">FOUR PILLARS. ONE PLATFORM.</H1>
          <Stack gap={8} className="mt-8 sm:mt-12 sm:gap-16">
            {atlvsPillarsSolution.map((pillar, index) => (
              <Article key={pillar.id} className={`grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <Card className={`border-2 aspect-video border-ink-950 bg-grey-100 shadow-brand-lg ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Box className="flex h-full items-center justify-center">
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-400">{pillar.title} Screenshot</Text>
                  </Box>
                </Card>
                <Stack gap={6} className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <H3 className="font-display text-h3-md uppercase tracking-label text-ink-950">{pillar.title}</H3>
                  <Body className="text-body-md text-grey-600">{pillar.description}</Body>
                  <List className="space-y-2">
                    {pillar.features.map((feature) => (
                      <ListItem key={feature} className="flex items-start gap-3">
                        <Check className="h-4 w-4 flex-shrink-0 text-brand-pink" />
                        <Text size="sm" className=" text-grey-700">{feature}</Text>
                      </ListItem>
                    ))}
                  </List>
                  <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-pink">Replaces: {pillar.replaces}</Text>
                </Stack>
              </Article>
            ))}
          </Stack>
        </Container>
      </FullBleedSection>

      {/* SECTION 5: FEATURE GRID */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <H1 className="text-center text-ink-950">THE TOOLKIT WITHOUT MISSING TOOLS</H1>
          <Grid cols={3} gap={4} className="mt-8 sm:mt-12 sm:gap-6">
            {atlvsFeatureGrid.map((feature) => (
              <Article key={feature.title} className="border-2 border-ink-950 bg-white p-4 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl sm:p-6">
                <Box className="mb-4 flex h-10 w-10 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  {(() => {
                    const iconMap: Record<string, LucideIcon> = {
                      Target,
                      FileSignature,
                      Handshake,
                      FastForward,
                      DollarSign,
                      Calendar,
                      Building2,
                      Truck,
                      Route,
                      ClipboardList,
                      Users,
                      Box: Package,
                      FileText,
                      Mic2,
                      Clock,
                      Smartphone,
                      MessageSquare,
                      Shield,
                      Radio,
                      AlertTriangle,
                      IdCard,
                      BarChart: BarChart3,
                      Receipt,
                      TrendingUp,
                      GitBranch,
                      Zap,
                      Sparkles,
                      Puzzle,
                      Lock,
                      Globe,
                    };
                    const IconComponent = iconMap[feature.icon];
                    return IconComponent ? <IconComponent className="h-5 w-5 text-ink-950" /> : null;
                  })()}
                </Box>
                <H3 className="font-display text-h6-md uppercase tracking-label text-ink-950">{feature.title}</H3>
                <Body className="mt-2 text-grey-600">{feature.description}</Body>
              </Article>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 6: V3 EXPANSION - NEW VENUE & VENDOR FEATURES */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="text-center">
            <Label className="font-mono text-mono-xs uppercase tracking-label text-brand-pink">NEW IN V3</Label>
            <H1 className="text-white">VENUE & VENDOR POWERHOUSE</H1>
            <Body className="mx-auto max-w-2xl text-grey-400">
              Two new modules that transform how you manage venues and vendors. From lead capture to payment collection, from RFP to delivery.
            </Body>
          </Stack>

          <Grid cols={2} gap={6} className="mt-12">
            {/* Venue Management Module */}
            <Article className="border-2 border-ink-800 bg-ink-900 p-6 sm:p-8">
              <Stack gap={6}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-pink bg-ink-800">
                    <Building className="h-6 w-6 text-brand-pink" />
                  </Box>
                  <Stack gap={1}>
                    <H3 className="font-display text-h5-md uppercase tracking-label text-white">{atlvsV3Features.venueManagement.title}</H3>
                    <Label size="xs" className="text-brand-pink">NEW MODULE</Label>
                  </Stack>
                </Stack>
                <Body className="text-grey-400">{atlvsV3Features.venueManagement.description}</Body>
                <Grid cols={2} gap={3}>
                  {atlvsV3Features.venueManagement.features.filter(f => f.priority === "critical").slice(0, 6).map((feature) => (
                    <Stack key={feature.id} direction="horizontal" gap={2} className="items-start">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-brand-pink" />
                      <Text size="sm" className="text-grey-300">{feature.name}</Text>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Article>

            {/* Vendor Services Module */}
            <Article className="border-2 border-ink-800 bg-ink-900 p-6 sm:p-8">
              <Stack gap={6}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-ink-800">
                    <Handshake className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <Stack gap={1}>
                    <H3 className="font-display text-h5-md uppercase tracking-label text-white">{atlvsV3Features.vendorServices.title}</H3>
                    <Label size="xs" className="text-brand-cyan">NEW MODULE</Label>
                  </Stack>
                </Stack>
                <Body className="text-grey-400">{atlvsV3Features.vendorServices.description}</Body>
                <Grid cols={2} gap={3}>
                  {atlvsV3Features.vendorServices.features.filter(f => f.priority === "critical").slice(0, 6).map((feature) => (
                    <Stack key={feature.id} direction="horizontal" gap={2} className="items-start">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-brand-cyan" />
                      <Text size="sm" className="text-grey-300">{feature.name}</Text>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Article>
          </Grid>

          {/* Blue Ocean Differentiators */}
          <Box className="mt-12 border-t border-ink-800 pt-12">
            <Stack gap={4} className="text-center">
              <Label className="font-mono text-mono-xs uppercase tracking-label text-grey-500">WHAT SETS US APART</Label>
              <H3 className="text-white">FEATURES NO ONE ELSE HAS</H3>
            </Stack>
            <Grid cols={4} gap={4} className="mt-8">
              {atlvsV3Features.differentiation.features.map((feature) => (
                <Article key={feature.id} className="border-2 border-ink-800 bg-ink-800 p-4 transition-all duration-150 hover:-translate-y-2 hover:border-brand-pink">
                  <Stack gap={3}>
                    <Box className="flex h-10 w-10 items-center justify-center border-2 border-grey-600 bg-ink-900">
                      <Sparkles className="h-5 w-5 text-brand-pink" />
                    </Box>
                    <H3 className="font-display text-h6-md uppercase tracking-label text-white">{feature.name}</H3>
                    <Body size="sm" className="text-grey-400">{feature.description}</Body>
                  </Stack>
                </Article>
              ))}
            </Grid>
          </Box>
        </Container>
      </FullBleedSection>

      {/* SECTION 7: COMPVSS */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Box className="border-2 border-ink-950 bg-ink-950 p-4 sm:p-8 lg:p-12">
            <Label className="font-mono text-mono-xs uppercase tracking-label text-brand-cyan">{atlvsCompvssSection.kicker}</Label>
            <Display className="mt-4 font-display text-display-sm uppercase text-white md:text-display-md">{atlvsCompvssSection.title}</Display>
            <Body className="mt-4 text-body-md text-grey-400 sm:text-body-lg">{atlvsCompvssSection.subtitle}</Body>
            <Box className="my-6 h-px bg-grey-700 sm:my-8" />
            <Body className="max-w-3xl text-grey-300 sm:text-body-md">{atlvsCompvssSection.description}</Body>
            <Grid cols={3} gap={4} className="mt-6 sm:mt-8 sm:gap-6">
              {atlvsCompvssSection.features.map((feature) => (
                <Article key={feature.title} className="border-2 border-ink-800 bg-ink-800 p-3 sm:p-4">
                  <Box className="mb-2 flex h-10 w-10 items-center justify-center border-2 border-grey-600 bg-ink-900">
                    {feature.icon === "HardHat" && <HardHat className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Users" && <Users className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Building" && <Building className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Mic2" && <Mic2 className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Briefcase" && <Briefcase className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Camera" && <Camera className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "BadgeDollarSign" && <BadgeDollarSign className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Handshake" && <Handshake className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Building2" && <Building2 className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "GraduationCap" && <GraduationCap className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Heart" && <Heart className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Megaphone" && <Megaphone className="h-5 w-5 text-brand-cyan" />}
                    {feature.icon === "Link" && <LinkIcon className="h-5 w-5 text-brand-cyan" />}
                  </Box>
                  <H3 className="font-display text-h6-md uppercase tracking-label text-white">{feature.title}</H3>
                  <Body className="mt-2 text-grey-400">{feature.description}</Body>
                </Article>
              ))}
            </Grid>
            <Stack gap={4} className="mt-8">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Check className="h-4 w-4 text-brand-cyan" />
                <Text className="font-mono text-mono-xs uppercase tracking-label text-brand-cyan">{atlvsCompvssSection.note}</Text>
              </Stack>
              <NextLink href={atlvsCompvssSection.cta.href}>
                <Button variant="outlineWhite" size="md">
                  {atlvsCompvssSection.cta.label}
                </Button>
              </NextLink>
            </Stack>
          </Box>
        </Container>
      </FullBleedSection>

      {/* SECTION 7: SOCIAL PROOF - About */}
      <FullBleedSection id="about" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <H1 className="text-center text-ink-950">{atlvsSocialProof.headline}</H1>
          <Article className="border-2 mx-auto mt-8 max-w-4xl border-ink-950 bg-white p-4 shadow-brand-lg sm:mt-12 sm:p-8 lg:p-12">
            <Body className="text-center text-body-md text-grey-700 italic sm:text-body-lg">&ldquo;{atlvsSocialProof.testimonial.quote}&rdquo;</Body>
            <Text className="mt-4 block text-center font-mono text-mono-xs uppercase tracking-label text-grey-500 sm:mt-6 sm:text-mono-sm">
              — {atlvsSocialProof.testimonial.author}, {atlvsSocialProof.testimonial.company}
            </Text>
          </Article>
          <Grid cols={4} gap={4} className="mt-8 sm:mt-12 sm:gap-6">
            {atlvsSocialProof.stats.map((stat) => (
              <Stack key={stat.label} className="text-center">
                <Display className="font-display text-display-sm uppercase text-ink-950">{stat.value}</Display>
                <Text className="mt-2 font-mono text-mono-xs uppercase tracking-label text-grey-500">{stat.label}</Text>
              </Stack>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* SECTION 8: PRICING */}
      <FullBleedSection id="pricing" background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-8 text-center sm:mb-16">
            <H1 className="text-ink-950">{atlvsPricing.headline}</H1>
            <Body className="text-grey-600">{atlvsPricing.subheadline}</Body>
          </Stack>

          <Grid cols={3} gap={4} className="sm:gap-6">
            {atlvsPricing.tiers.map((tier) => (
              <Card
                key={tier.id}
                className="relative flex h-full flex-col border-2 border-ink-950 bg-white p-4 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl sm:p-8"
              >
                {tier.popular && (
                  <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-4 py-1 text-white">
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
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-pink" />
                        <Label size="xs" className="text-grey-700">{feature}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <NextLink href={tier.cta.href} className="mt-6 w-full">
                  <Button variant={tier.popular ? "pop" : "outline"} size="md" fullWidth>
                    {tier.cta.label}
                  </Button>
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
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Display className="font-display text-display-sm uppercase text-white sm:text-display-md md:text-display-lg">{atlvsLandingCta.headline}</Display>
          <Body className="mx-auto mt-4 max-w-xl text-body-md text-grey-400 sm:mt-6 sm:text-body-lg">{atlvsLandingCta.subheadline}</Body>
          <Stack direction="horizontal" gap={3} className="mt-6 flex-wrap justify-center sm:mt-8 sm:gap-4">
            <NextLink href={atlvsLandingCta.primaryCta.href}>
              <Button variant="pop" size="lg" inverted>
                {atlvsLandingCta.primaryCta.label}
              </Button>
            </NextLink>
            <NextLink href={atlvsLandingCta.secondaryCta.href}>
              <Button variant="outlineWhite" size="lg">
                {atlvsLandingCta.secondaryCta.label}
              </Button>
            </NextLink>
          </Stack>
          <Label size="xs" className="mt-8 block text-center text-grey-500">
            {atlvsLandingCta.footnote}
          </Label>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
