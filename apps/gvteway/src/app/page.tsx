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
  FileText,
  Package,
  UserPlus,
  Gift,
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
    description: "Dip your toes in. The water's perfect.",
    features: [
      "Priority access to all experiences",
      "Member-only pricing",
      "48-hour early access windows",
      "Community access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "PLUS",
    price: "$99",
    period: "/mo",
    description: "For those who like their adventures with extra sauce.",
    features: [
      "Everything in Member",
      "VIP upgrades when available",
      "Personal concierge service",
      "Exclusive member events",
      "Priority support",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "EXTRA",
    price: "$199",
    period: "/mo",
    description: "Go big or go home. You chose wisely.",
    features: [
      "Everything in Plus",
      "Backstage passes",
      "Curated adventure trips",
      "Artist meet & greets",
      "Dedicated account manager",
      "Complimentary +1 on select experiences",
    ],
    cta: "Get Started",
    popular: false,
  },
];

// Membership benefits
const membershipBenefits = [
  {
    icon: Lock,
    title: "PRIORITY ACCESS",
    description: "While everyone else is refreshing their browser like it's 2005, you're already in. Funny how that works.",
  },
  {
    icon: Clock,
    title: "EARLY WINDOWS",
    description: "48 hours before the masses even know what's happening. Call it an unfair advantage. We call it membership.",
  },
  {
    icon: DollarSign,
    title: "MEMBER PRICING",
    description: "Better rates on everything. Your wallet will thank you. Your accountant might actually smile.",
  },
  {
    icon: Headphones,
    title: "PERSONAL CONCIERGE",
    description: "Need the impossible? That's literally what they're here for. Plus+ and above get their own legend.",
  },
  {
    icon: Globe,
    title: "GLOBAL ADVENTURES",
    description: "52+ countries. Festivals, retreats, expeditions. Your passport is about to get very interesting.",
  },
  {
    icon: Users,
    title: "THE COMMUNITY",
    description: "847 members who get it. No small talk about the weather. Just people who live for extraordinary.",
  },
];

// Get Started steps
const getStartedSteps = [
  {
    step: 1,
    icon: FileText,
    title: "APPLY FOR MEMBERSHIP",
    description: "Fill out a quick application. We're selective, but not pretentious. Promise.",
  },
  {
    step: 2,
    icon: Package,
    title: "CREATE YOUR PACKAGE",
    description: "Pick your tier, customize your preferences. Make it yours.",
  },
  {
    step: 3,
    icon: UserPlus,
    title: "JOIN THE COMMUNITY",
    description: "Meet your people. The ones who understand why 'sold out' is a personal insult.",
  },
  {
    step: 4,
    icon: Gift,
    title: "ENJOY EXCLUSIVE BENEFITS",
    description: "Access unlocked. Adventures await. Try not to brag too much.",
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
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
              <H1 size="lg" className="text-white">
                EXPERIENCE
              </H1>
              <H1 size="lg" className="-mt-4 text-white">
                BEYOND EVENTS
              </H1>
              
              <Body size="lg" className="mx-auto mt-4 max-w-2xl text-on-dark-secondary">
                Look, you could keep fighting for tickets like everyone else.
                <br />
                Or you could join the crew that skips the line entirely.
              </Body>
            </Stack>
          </ScrollReveal>
          
          <ScrollReveal animation="slide-up" delay={200} duration={800}>
            <Stack gap={6} className="mt-12 items-center">
              <NextLink href="/apply">
                <Button variant="pop" size="lg" inverted>
                  Request Membership
                </Button>
              </NextLink>
              
              <Label size="xs" className="uppercase tracking-label text-on-dark-muted">
                Invitation Only • 4321 Members Worldwide
              </Label>
            </Stack>
          </ScrollReveal>
        </Stack>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 2: WELCOME
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={6} className="mx-auto max-w-3xl text-center">
            <H1 size="md" className="text-white">
              WELCOME ABOARD
            </H1>
            <Body size="lg" className="text-on-dark-secondary">
              Here&apos;s the deal. We&apos;ve spent years building relationships with the people who make 
              extraordinary experiences happen. Venues, artists, organizers—the whole crew. 
              Now we&apos;re opening the door for a select few who want in on the action.
            </Body>
            <Body className="text-on-dark-muted">
              Think of it less like a membership and more like having a very well-connected friend 
              who happens to know everyone. Except this friend doesn&apos;t flake on you.
            </Body>
          </Stack>
        </ScrollReveal>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 3: MEMBERSHIP EXPERIENCE OVERVIEW
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              THE GVTEWAY EXPERIENCE
            </H1>
            <Body className="mx-auto max-w-2xl text-on-dark-muted">
              Not to brag, but... actually, yes, we&apos;re going to brag a little. 
              This is what membership gets you.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={100} animation="slide-up">
          <Grid cols={3} gap={6} className="mx-auto max-w-5xl">
            <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8 text-center">
              <Stack gap={4} className="items-center">
                <Display size="md" className="text-white">52+</Display>
                <H3 size="sm" className="text-white">COUNTRIES</H3>
                <Body size="sm" className="text-on-dark-muted">
                  From Tokyo to Tulum. Your passport is about to get interesting.
                </Body>
              </Stack>
            </Card>
            <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8 text-center">
              <Stack gap={4} className="items-center">
                <Display size="md" className="text-white">200+</Display>
                <H3 size="sm" className="text-white">EXPERIENCES</H3>
                <Body size="sm" className="text-on-dark-muted">
                  Festivals, retreats, exclusive gatherings. The good stuff.
                </Body>
              </Stack>
            </Card>
            <Card inverted className="border-2 border-ink-800 bg-ink-950 p-8 text-center">
              <Stack gap={4} className="items-center">
                <Display size="md" className="text-white">48HR</Display>
                <H3 size="sm" className="text-white">HEAD START</H3>
                <Body size="sm" className="text-on-dark-muted">
                  Early access on everything. By the time it&apos;s public, you&apos;re already in.
                </Body>
              </Stack>
            </Card>
          </Grid>
        </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 4: EXPERIENCE CATEGORIES - Bento Grid
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              PICK YOUR POISON
            </H1>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Adventure comes in many flavors. We&apos;ve got the whole menu.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={50} animation="slide-up">
          <div className="grid auto-rows-[140px] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Card inverted className="group relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Search className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">DISCOVERY</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Users className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">COMMUNITY</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative col-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Zap className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">EXPERIENCES</Label>
              </Stack>
            </Card>

            <Card inverted className="group relative flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Compass className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">ADVENTURES</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative col-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Palette className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">CULTURE</Label>
              </Stack>
            </Card>

            <Card inverted className="group relative row-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Target className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">DISCIPLINE</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Handshake className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">COLLABORATION</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Lightbulb className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">INSPIRATION</Label>
              </Stack>
            </Card>
            
            <Card inverted className="group relative flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <TrendingUp className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">INVESTMENT</Label>
              </Stack>
            </Card>

            <Card inverted className="group relative col-span-2 flex flex-col justify-end overflow-hidden border-2 border-ink-800 p-5">
              <div 
                className="absolute inset-0 bg-cover bg-center brightness-[0.3] saturate-[0.3] transition-all duration-slow group-hover:brightness-[0.5] group-hover:saturate-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <Stack gap={1} className="relative z-10">
                <Heart className="size-5 text-accent" />
                <Label size="xs" className="tracking-label text-white">IMPACT</Label>
              </Stack>
            </Card>
          </div>
        </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 5: MEMBERSHIP FEATURES
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              WHAT YOU GET
            </H1>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Spoiler alert: it&apos;s a lot. But we&apos;ll try to keep it brief.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={100} animation="slide-up">
          <Grid cols={2} gap={6} className="mx-auto max-w-4xl">
            {membershipBenefits.map((benefit) => (
              <Card
                key={benefit.title}
                inverted
                className="border-2 border-ink-800 bg-ink-950 p-8"
              >
                <Stack gap={4}>
                  <div className="flex size-12 items-center justify-center border-2 border-ink-700 bg-ink-900">
                    <benefit.icon className="size-6 text-accent" />
                  </div>
                  <H3 size="sm" className="text-white">{benefit.title}</H3>
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
          SECTION 6: GET STARTED
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              HOW IT WORKS
            </H1>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Four steps. That&apos;s it. We&apos;ve made it embarrassingly simple.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={150} animation="slide-up">
          <Grid cols={4} gap={6} className="mx-auto max-w-5xl">
            {getStartedSteps.map((item) => (
              <Card
                key={item.step}
                inverted
                className="border-2 border-ink-800 bg-ink-950 p-6 text-center"
              >
                <Stack gap={4} className="items-center">
                  <div className="relative">
                    <div className="flex size-16 items-center justify-center border-2 border-ink-700 bg-ink-900">
                      <item.icon className="size-8 text-accent" />
                    </div>
                    <Label size="xs" className="absolute -right-2 -top-2 flex size-6 items-center justify-center bg-accent text-black">
                      {item.step}
                    </Label>
                  </div>
                  <H3 size="sm" className="text-white">{item.title}</H3>
                  <Body size="sm" className="text-on-dark-muted">
                    {item.description}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 7: PRICING TIERS
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              CHOOSE YOUR ADVENTURE
            </H1>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              Three tiers. Zero hidden fees. Pick what works for you.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={150} animation="slide-up">
          <Grid cols={3} gap={6} className="mx-auto max-w-5xl">
            {membershipTiers.map((tier) => (
              <Card
                key={tier.name}
                inverted
                className={`relative flex h-full flex-col border-2 bg-ink-950 p-8 ${
                  tier.popular 
                    ? "border-accent shadow-accent" 
                    : "border-ink-800"
                }`}
              >
                {tier.popular && (
                  <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-white bg-ink-950 px-4 py-1 text-white">
                    MOST POPULAR
                  </Label>
                )}
                
                <Stack gap={6} className="flex-1">
                  <H3 className="text-white">{tier.name}</H3>
                  
                  <div className="flex items-baseline gap-1">
                    <Display size="md" className="text-white">{tier.price}</Display>
                    <Label size="sm" className="text-on-dark-muted">{tier.period}</Label>
                  </div>
                  
                  <Body size="sm" className="text-on-dark-muted">
                    {tier.description}
                  </Body>
                  
                  <Stack gap={3} className="flex-1 border-t border-ink-800 py-4">
                    {tier.features.map((feature) => (
                      <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        <Label size="xs" className="text-on-dark-secondary">{feature}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                  
                <NextLink href="/apply" className="mt-6 w-full">
                  <Button variant="outlineWhite" size="md" fullWidth>
                    {tier.cta}
                  </Button>
                </NextLink>
              </Card>
            ))}
          </Grid>
        </StaggerChildren>

        <ScrollReveal animation="fade" delay={400}>
          <Label size="xs" className="mt-8 block text-center tracking-label text-on-dark-disabled">
            FOUNDING MEMBER PRICING • LOCK IN YOUR RATE BEFORE IT GOES UP
          </Label>
        </ScrollReveal>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 8: SOCIAL PROOF - Testimonials
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="border-t border-ink-900 py-24">
        <ScrollReveal animation="fade">
          <Stack gap={4} className="mb-16 text-center">
            <H1 size="md" className="text-white">
              DON&apos;T TAKE OUR WORD FOR IT
            </H1>
            <Body className="mx-auto max-w-xl text-on-dark-muted">
              We could talk all day about how great this is. But these folks said it better.
            </Body>
          </Stack>
        </ScrollReveal>

        <StaggerChildren staggerDelay={150} animation="slide-up">
          <Grid cols={3} gap={6} className="mx-auto max-w-5xl">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                inverted
                className="border-2 border-ink-800 bg-ink-950 p-8"
              >
                <Stack gap={6}>
                  <Quote className="size-8 text-accent opacity-50" />
                  <Body className="italic text-on-dark-secondary">
                    &ldquo;{testimonial.quote}&rdquo;
                  </Body>
                  <Stack gap={1}>
                    <Label size="sm" className="text-white">— {testimonial.author}</Label>
                    <Label size="xxs" className="tracking-label text-on-dark-disabled">{testimonial.tier}</Label>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </StaggerChildren>
      </Stack>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 9: FINAL CTA
          ═══════════════════════════════════════════════════════════════════════════ */}
      <Stack className="relative overflow-hidden border-t border-ink-900 py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <ScrollReveal animation="scale" duration={600}>
          <Stack gap={8} className="mx-auto max-w-2xl items-center text-center">
            <H1 size="md" className="text-white">
              READY TO STOP MISSING OUT?
            </H1>
            
            <Body size="lg" className="text-on-dark-secondary">
              Applications take about 2 minutes. Approval takes 24-48 hours. 
              Your next adventure? That&apos;s up to you.
            </Body>
            
            <NextLink href="/apply">
              <Button variant="pop" size="lg" icon={<ArrowRight />} inverted>
                Request Membership
              </Button>
            </NextLink>
            
            <Label size="xs" className="tracking-label text-on-dark-disabled">
              No credit card required to apply • Cancel anytime
            </Label>
          </Stack>
        </ScrollReveal>
      </Stack>
    </GvtewayAppLayout>
  );
}
