"use client";

import { GvtewayAppLayout } from "@/components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Display,
  H1,
  H3,
  Body,
  Label,
  Button,
  ScrollReveal,
  StaggerChildren,
} from "@ghxstship/ui";
import {
  Lock,
  Clock,
  DollarSign,
  Headphones,
  Globe,
  Users,
  Compass,
  ArrowRight,
  Check,
  Quote,
  Search,
  Zap,
  Palette,
  Target,
  Handshake,
  Lightbulb,
  TrendingUp,
  Heart,
} from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

// =============================================================================
// MEMBERSHIP LANDING PAGE DATA
// =============================================================================

// Membership tiers
const membershipTiers = [
  {
    name: "MEMBER",
    price: "$49",
    period: "/mo",
    description: "Your gateway to extraordinary experiences",
    features: [
      "Priority access to all experiences",
      "Member-only pricing",
      "48-hour early access windows",
      "Community access",
    ],
    cta: "Apply Now",
    popular: false,
  },
  {
    name: "PLUS",
    price: "$99",
    period: "/mo",
    description: "Enhanced access with premium perks",
    features: [
      "Everything in Member",
      "VIP upgrades when available",
      "Personal concierge service",
      "Exclusive member events",
      "Priority support",
    ],
    cta: "Apply Now",
    popular: true,
  },
  {
    name: "EXTRA",
    price: "$199",
    period: "/mo",
    description: "The ultimate experience membership",
    features: [
      "Everything in Plus",
      "Backstage passes",
      "Curated adventure trips",
      "Artist meet & greets",
      "Dedicated account manager",
      "Complimentary +1 on select experiences",
    ],
    cta: "Apply Now",
    popular: false,
  },
];

// Membership benefits
const membershipBenefits = [
  {
    icon: Lock,
    title: "PRIORITY ACCESS",
    description: "Skip the public chaos. Members get first look at every experience.",
  },
  {
    icon: Clock,
    title: "EARLY WINDOWS",
    description: "48-hour head start on every drop. By the time it's public, you're in.",
  },
  {
    icon: DollarSign,
    title: "MEMBER PRICING",
    description: "Exclusive rates on every experience. The more you attend, the more you save.",
  },
  {
    icon: Headphones,
    title: "PERSONAL CONCIERGE",
    description: "Need something special? Your dedicated concierge makes it happen. (Plus+ and above)",
  },
  {
    icon: Globe,
    title: "GLOBAL ADVENTURES",
    description: "Curated trips to 52+ countries. Festivals, retreats, expeditions.",
  },
  {
    icon: Users,
    title: "THE COMMUNITY",
    description: "Connect with 847 members who share your passion for extraordinary experiences.",
  },
];

// Testimonials
const testimonials = [
  {
    quote: "GVTEWAY changed how I experience music. I've been backstage at festivals I used to watch from the lawn.",
    author: "SARAH M.",
    tier: "EXTRA MEMBER SINCE 2024",
  },
  {
    quote: "The concierge service alone is worth the membership. They've made impossible reservations happen.",
    author: "MARCUS T.",
    tier: "PLUS MEMBER SINCE 2023",
  },
  {
    quote: "I've met artists I've followed for years. These aren't just events—they're life-changing moments.",
    author: "ELENA K.",
    tier: "EXTRA MEMBER SINCE 2024",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function MembershipLandingPage() {
  return (
    <GvtewayAppLayout>
      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 1: HERO - Full Viewport Immersive
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="relative min-h-screen overflow-hidden">
        {/* Background gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Halftone pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <Stack className="relative z-10 flex min-h-screen flex-col items-center justify-center py-32 text-center">
          <ScrollReveal animation="slide-up" duration={800}>
            <Stack gap={8} className="max-w-4xl">
              {/* Main Headline - ANTON display font, stacked */}
              <H1 size="lg" className="text-white leading-[0.9]">
                EXPERIENCE
              </H1>
              <H1 size="lg" className="text-white leading-[0.9] -mt-4">
                BEYOND EVENTS
              </H1>
              
              {/* Subhead */}
              <Body size="lg" className="mx-auto max-w-2xl text-on-dark-secondary mt-4">
                The membership for those who refuse to settle for less.
                <br />
                Curated destinations. Rare experiences. Priceless moments.
              </Body>
            </Stack>
          </ScrollReveal>
          
          {/* CTA Button - Large, amber accent, pop shadow */}
          <ScrollReveal animation="slide-up" delay={200} duration={800}>
            <Stack gap={6} className="mt-12 items-center">
              <NextLink href="/apply">
                <Button
                  variant="pop"
                  size="lg"
                  inverted
                >
                  Request Membership
                </Button>
              </NextLink>
              
              {/* Scarcity signal */}
              <Label size="xs" className="text-on-dark-muted tracking-[0.2em] uppercase">
                Invitation Only • 4321 Members Worldwide
              </Label>
            </Stack>
          </ScrollReveal>
        </Stack>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: MEMBERSHIP TIERS - Value Visualization
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="py-24 border-t border-ink-900">
          <ScrollReveal animation="fade">
            <Stack gap={4} className="text-center mb-16">
              <H1 size="md" className="text-white tracking-wide">
                YOUR EXPEDITION AWAITS
              </H1>
              <Body className="text-on-dark-muted max-w-xl mx-auto">
                Choose the membership that matches your appetite for adventure.
              </Body>
            </Stack>
          </ScrollReveal>

          <StaggerChildren staggerDelay={150} animation="slide-up">
            <Grid cols={3} gap={6} className="max-w-5xl mx-auto">
              {membershipTiers.map((tier) => (
                <Card
                  key={tier.name}
                  inverted
                  className={`relative flex h-full flex-col p-8 border-2 ${
                    tier.popular 
                      ? "border-accent shadow-[4px_4px_0_rgba(245,158,11,0.4)]" 
                      : "border-ink-800"
                  } bg-ink-950`}
                >
                  {tier.popular && (
                    <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-white bg-ink-950 text-white px-4 py-1 font-bold tracking-wider">
                      ★ POPULAR
                    </Label>
                  )}
                  
                  <Stack gap={6} className="flex-1">
                    <H3 className="text-white tracking-wider">{tier.name}</H3>
                    
                    <div className="flex items-baseline gap-1">
                      <Display size="md" className="text-white">{tier.price}</Display>
                      <Label size="sm" className="text-on-dark-muted">{tier.period}</Label>
                    </div>
                    
                    <Body size="sm" className="text-on-dark-muted">
                      {tier.description}
                    </Body>
                    
                    <Stack gap={3} className="py-4 border-t border-ink-800 flex-1">
                      {tier.features.map((feature) => (
                        <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                          <Check className="size-4 text-accent mt-0.5 flex-shrink-0" />
                          <Label size="xs" className="text-on-dark-secondary">{feature}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                    
                  <NextLink href="/apply" className="mt-6 w-full">
                    <Button
                      variant="outlineWhite"
                      size="md"
                      fullWidth
                    >
                      {tier.cta}
                    </Button>
                  </NextLink>
                </Card>
              ))}
            </Grid>
          </StaggerChildren>

          <ScrollReveal animation="fade" delay={400}>
            <Label size="xs" className="text-on-dark-disabled text-center mt-8 block tracking-wider">
              FOUNDING MEMBER PRICING • RATES INCREASE SOON
            </Label>
          </ScrollReveal>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 3: EXPERIENCE CATEGORIES - Lifestyle Pillars
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="py-24 border-t border-ink-900">
          <ScrollReveal animation="fade">
            <H1 size="md" className="text-white text-center mb-16 tracking-wide">
              DESTINATIONS THAT DEFINE YOU
            </H1>
          </ScrollReveal>

          <StaggerChildren staggerDelay={50} animation="slide-up">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-[140px]">
              {/* Row 1 */}
              <Card inverted className="group col-span-2 row-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Search className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">DISCOVERY</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Users className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">COMMUNITY</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group col-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Zap className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">EXPERIENCES</Label>
                </Stack>
              </Card>

              {/* Row 2 */}
              <Card inverted className="group relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Compass className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">ADVENTURES</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group col-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Palette className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">CULTURE</Label>
                </Stack>
              </Card>

              {/* Row 3 */}
              <Card inverted className="group row-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Target className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">DISCIPLINE</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group col-span-2 row-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Handshake className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">COLLABORATION</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Lightbulb className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">INSPIRATION</Label>
                </Stack>
              </Card>
              
              <Card inverted className="group relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <TrendingUp className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">INVESTMENT</Label>
                </Stack>
              </Card>

              {/* Row 4 */}
              <Card inverted className="group col-span-2 relative flex flex-col justify-end p-5 border-2 border-ink-800 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-slow brightness-[0.3] saturate-[0.3] group-hover:brightness-[0.5] group-hover:saturate-100"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <Stack gap={1} className="relative z-10">
                  <Heart className="size-5 text-accent" />
                  <Label size="xs" className="text-white tracking-wider">IMPACT</Label>
                </Stack>
              </Card>
            </div>
          </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 4: THE GVTEWAY DIFFERENCE - Features Grid
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="py-24 border-t border-ink-900">
          <ScrollReveal animation="fade">
            <H1 size="md" className="text-white text-center mb-16 tracking-wide">
              THE EXPEDITION ADVANTAGE
            </H1>
          </ScrollReveal>

          <StaggerChildren staggerDelay={100} animation="slide-up">
            <Grid cols={2} gap={6} className="max-w-4xl mx-auto">
              {membershipBenefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  inverted
                  className="p-8 border-2 border-ink-800 bg-ink-950"
                >
                  <Stack gap={4}>
                    <div className="flex size-12 items-center justify-center border-2 border-ink-700 bg-ink-900">
                      <benefit.icon className="size-6 text-accent" />
                    </div>
                    <H3 size="sm" className="text-white tracking-wider">{benefit.title}</H3>
                    <Body size="sm" className="text-on-dark-muted">
                      {benefit.description}
                    </Body>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 5: SOCIAL PROOF - Testimonials
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="py-24 border-t border-ink-900">
          <ScrollReveal animation="fade">
            <H1 size="md" className="text-white text-center mb-16 tracking-wide">
              STORIES FROM THE FIELD
            </H1>
          </ScrollReveal>

          <StaggerChildren staggerDelay={150} animation="slide-up">
            <Grid cols={3} gap={6} className="max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  inverted
                  className="p-8 border-2 border-ink-800 bg-ink-950"
                >
                  <Stack gap={6}>
                    <Quote className="size-8 text-accent opacity-50" />
                    <Body className="text-on-dark-secondary italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </Body>
                    <Stack gap={1}>
                      <Label size="sm" className="text-white font-bold">— {testimonial.author}</Label>
                      <Label size="xxs" className="text-on-dark-disabled tracking-wider">{testimonial.tier}</Label>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 6: APPLICATION CTA - Final Conversion
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="py-32 border-t border-ink-900 relative overflow-hidden">
        {/* Subtle texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

          <ScrollReveal animation="scale" duration={600}>
            <Stack gap={8} className="items-center text-center max-w-2xl mx-auto">
              <H1 size="md" className="text-white">
                BEGIN YOUR JOURNEY
              </H1>
              
              <Body size="lg" className="text-on-dark-secondary">
                Membership is by application only. Approval takes 24-48 hours.
              </Body>
              
              <NextLink href="/apply">
                <Button
                  variant="pop"
                  size="lg"
                  icon={<ArrowRight />}
                  inverted
                >
                  Request Membership
                </Button>
              </NextLink>
              
              <Label size="xs" className="text-on-dark-disabled tracking-wider">
                No credit card required to apply
              </Label>
            </Stack>
          </ScrollReveal>
      </Stack>
    </GvtewayAppLayout>
  );
}
