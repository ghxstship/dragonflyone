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
  Box,
  Text,
} from "@ghxstship/ui";
import { Check, Minus, ArrowRight, Ticket, Users, Briefcase, Layers, Zap, Rocket, Shield, Headphones, X } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const singleProducts = [
  {
    id: 'gvteway',
    name: 'GVTEWAY',
    tagline: 'OWN THE DOOR',
    price: '$0',
    period: '+ 3.5% + $0.75/ticket',
    valueProposition: 'Keep HubSpot. Keep ConnectTeam. Just add ticketing.',
    byo: ['CRM', 'Finance', 'Crews'],
    byoCompetitors: 'Salesforce, HubSpot, ConnectTeam',
    replaces: 'Eventbrite, DICE, Ticketmaster',
    features: ['Full ticketing platform', 'Event publishing & discovery', 'Fan engagement tools', 'Box office & will-call', 'Own your fan data'],
    icon: Ticket,
    color: 'brand-yellow',
    ctaText: 'START GVTEWAY',
    ctaHref: '/auth/signup?plan=gvteway',
  },
  {
    id: 'compvss',
    name: 'COMPVSS',
    tagline: 'WORK THE SITE',
    price: '$299',
    period: '/month',
    valueProposition: 'Keep your CRM. Keep your ticketing. Manage crews here.',
    byo: ['CRM', 'Finance', 'Ticketing'],
    byoCompetitors: 'Salesforce, QuickBooks, Eventbrite',
    replaces: 'ConnectTeam, Deputy, When I Work',
    features: ['Unlimited crew members', 'Punch lists & task mgmt', 'Digital timekeeping', 'Site communications', 'Cross-org JOIN'],
    icon: Users,
    color: 'brand-cyan',
    ctaText: 'START COMPVSS',
    ctaHref: '/auth/signup?plan=compvss',
  },
  {
    id: 'atlvs',
    name: 'ATLVS',
    tagline: 'RUN THE SHOW',
    price: '$799',
    period: '/month',
    valueProposition: 'Keep your crew app. Keep your ticketing. Run the business here.',
    byo: ['Crews', 'Ticketing'],
    byoCompetitors: 'ConnectTeam, Deputy, Eventbrite',
    replaces: 'Monday + QuickBooks + HubSpot',
    features: ['Full CRM (deals, venues, artists)', 'Project management', 'Financial management', 'Vendor management', 'Reporting & analytics'],
    icon: Briefcase,
    color: 'brand-pink',
    ctaText: 'START ATLVS',
    ctaHref: '/auth/signup?plan=atlvs',
  },
];

const bundleProducts = [
  {
    id: 'operations',
    name: 'OPERATIONS',
    tagline: 'CREWS + TICKETS. BYO BUSINESS.',
    products: ['GVTEWAY', 'COMPVSS'],
    price: '$299',
    period: '/mo + 2.5% + $0.50/ticket',
    valueProposition: "Love Salesforce? Keep it. We'll handle crews and tickets.",
    byo: ['CRM', 'Finance'],
    byoCompetitors: 'Salesforce, HubSpot, QuickBooks',
    features: ['Everything in GVTEWAY', 'Everything in COMPVSS', 'Crew-to-event sync', 'Lower transaction fees'],
    icon: Layers,
    color: 'brand-purple',
    ctaText: 'START OPERATIONS',
    ctaHref: '/auth/signup?plan=operations',
  },
  {
    id: 'experience',
    name: 'EXPERIENCE',
    tagline: 'DEALS + TICKETS. BYO CREWS.',
    products: ['ATLVS', 'GVTEWAY'],
    price: '$799',
    period: '/mo + 2.5% + $0.50/ticket',
    valueProposition: "Love your crew app? Keep it. We'll handle the rest.",
    byo: ['Crews'],
    byoCompetitors: 'ConnectTeam, Deputy, labor vendors',
    features: ['Everything in ATLVS', 'Everything in GVTEWAY', 'Deal-to-door tracking', 'Lower transaction fees'],
    icon: Zap,
    color: 'brand-pink',
    ctaText: 'START EXPERIENCE',
    ctaHref: '/auth/signup?plan=experience',
  },
  {
    id: 'production',
    name: 'PRODUCTION',
    tagline: 'BOARDROOM TO BUILD SITE',
    products: ['ATLVS', 'COMPVSS'],
    price: '$999',
    period: '/month',
    valueProposition: "Love your ticketing? Keep it. We'll run the operation.",
    byo: ['Ticketing'],
    byoCompetitors: 'Eventbrite, DICE, Ticketmaster',
    features: ['Everything in ATLVS', 'Everything in COMPVSS', 'Native business-site sync', 'Consolidated financials'],
    icon: Rocket,
    color: 'brand-cyan',
    popular: true,
    ctaText: 'START PRODUCTION',
    ctaHref: '/auth/signup?plan=production',
  },
];

const enterpriseTier = {
  id: 'enterprise',
  name: 'ENTERPRISE',
  tagline: 'REPLACE EVERYTHING',
  price: '$1,499',
  period: '/mo + 2.0% + $0.40/ticket',
  valueProposition: 'Replace Salesforce. Replace ConnectTeam. Replace Eventbrite. One platform.',
  features: ['Everything in PRODUCTION + EXPERIENCE', 'Lowest transaction fees', 'Multi-property dashboard', 'Advanced analytics & BI', 'Full API access', 'Dedicated CSM + SLA'],
  ctaText: 'GO ENTERPRISE',
  ctaHref: '/contact?plan=enterprise',
};

const faqData = [
  { question: 'I already have Salesforce—what do I need?', answer: 'Keep it! Choose OPERATIONS (crews + tickets) or PRODUCTION (crews only) and integrate with your existing CRM.' },
  { question: 'I already have ConnectTeam—what do I need?', answer: 'Stick with it. Choose EXPERIENCE (business + tickets) or just ATLVS + GVTEWAY separately.' },
  { question: 'I already have Eventbrite—what do I need?', answer: "Use PRODUCTION (business + crews). You can always migrate ticketing later for lower fees." },
  { question: 'Can I start with one product and add more later?', answer: 'Absolutely. Every tier has clear upgrade paths, and your data migrates seamlessly.' },
  { question: 'How does GHXSTSHIP compare to Ticketmaster?', answer: 'Lower fees (2.0-3.5% vs 5-10%), you own your fan data, no exclusivity contracts.' },
  { question: 'Why no per-seat charges?', answer: 'COMPVSS includes unlimited crew members. ATLVS includes unlimited users. Scale without scaling your bill.' },
];

const colorMap: Record<string, string> = {
  'brand-yellow': 'text-brand-yellow border-brand-yellow',
  'brand-cyan': 'text-brand-cyan border-brand-cyan',
  'brand-pink': 'text-brand-pink border-brand-pink',
  'brand-purple': 'text-purple-500 border-purple-500',
};

export default function PricingPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">PRICING</Label>
            <Display size="lg" className="text-white">PRICING THAT DOESN&apos;T PLAY GAMES</Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">Seven tiers. Three products. Keep what works. Add what&apos;s missing.</Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Entry Point Selector */}
      <FullBleedSection background="white" className="py-8 sm:py-12">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="text-center">
            <H3 className="text-ink-950">WHAT DO YOU NEED?</H3>
            <Grid cols={3} gap={4} className="sm:grid-cols-1">
              <NextLink href="#single"><Card className="border-2 border-ink-950 p-4 hover:bg-grey-50 transition-colors cursor-pointer"><Stack gap={2} className="items-center"><Label size="xs" className="text-grey-500">SINGLE PRODUCTS</Label><Body size="sm" className="text-grey-600">BYO everything else</Body></Stack></Card></NextLink>
              <NextLink href="#bundles"><Card className="border-2 border-brand-pink p-4 hover:bg-grey-50 transition-colors cursor-pointer"><Stack gap={2} className="items-center"><Label size="xs" className="text-brand-pink">BUNDLES</Label><Body size="sm" className="text-grey-600">Fill the gaps</Body></Stack></Card></NextLink>
              <NextLink href="#enterprise"><Card className="border-2 border-ink-950 p-4 hover:bg-grey-50 transition-colors cursor-pointer"><Stack gap={2} className="items-center"><Label size="xs" className="text-grey-500">FULL STACK</Label><Body size="sm" className="text-grey-600">Replace everything</Body></Stack></Card></NextLink>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Single Products */}
      <FullBleedSection id="single" background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500">SINGLE PRODUCTS</Label>
              <H1 className="text-ink-950">BYO EVERYTHING ELSE</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">Already have tools you love? Keep them. Just add what&apos;s missing.</Body>
            </Stack>
            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              {singleProducts.map((tier) => {
                const IconComponent = tier.icon;
                const colors = colorMap[tier.color] || 'text-ink-950 border-ink-950';
                return (
                  <Card key={tier.id} className="relative flex h-full flex-col border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                    <Stack gap={5}>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Box className={`p-2 border-2 ${colors}`}><IconComponent className={`h-5 w-5 ${colors.split(' ')[0]}`} /></Box>
                        <Stack gap={0}><H3 size="sm" className="text-ink-950">{tier.name}</H3><Label size="xs" className="text-grey-500">{tier.tagline}</Label></Stack>
                      </Stack>
                      <Stack direction="horizontal" className="items-baseline gap-1"><Display size="md" className="text-ink-950">{tier.price}</Display><Label size="sm" className="text-grey-500">{tier.period}</Label></Stack>
                      <Body size="sm" className="text-grey-700 italic">&ldquo;{tier.valueProposition}&rdquo;</Body>
                      <Stack gap={2}>
                        <Label size="xs" className="text-grey-500">BYO (BRING YOUR OWN)</Label>
                        <Stack gap={1}>{tier.byo.map((item) => (<Stack key={item} direction="horizontal" gap={2} className="items-center"><X className="h-3 w-3 text-grey-400" /><Text size="xs" className="text-grey-500">{item}</Text></Stack>))}</Stack>
                        <Text size="xs" className="text-grey-400 italic">Keep using {tier.byoCompetitors}</Text>
                      </Stack>
                      <Stack gap={1}><Label size="xs" className="text-success">REPLACES</Label><Text size="xs" className="text-grey-600">{tier.replaces}</Text></Stack>
                      <Stack gap={2}>{tier.features.map((feature) => (<Stack key={feature} direction="horizontal" gap={2} className="items-start"><Check className={`h-4 w-4 mt-0.5 shrink-0 ${colors.split(' ')[0]}`} /><Text size="xs" className="text-grey-700">{feature}</Text></Stack>))}</Stack>
                      <NextLink href={tier.ctaHref} className="mt-auto"><Button variant="outline" size="md" fullWidth icon={<ArrowRight />}>{tier.ctaText}</Button></NextLink>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Bundle Products */}
      <FullBleedSection id="bundles" background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-brand-pink">BUNDLES</Label>
              <H1 className="text-ink-950">FILL THE GAPS</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">Two products that work together. Keep what you love, add what you need.</Body>
            </Stack>
            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              {bundleProducts.map((tier) => {
                const IconComponent = tier.icon;
                const colors = colorMap[tier.color] || 'text-ink-950 border-ink-950';
                return (
                  <Card key={tier.id} className={`relative flex h-full flex-col border-2 ${tier.popular ? 'border-brand-pink' : 'border-ink-950'} bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl`}>
                    {tier.popular && (<Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-3 py-1 text-white">MOST POPULAR</Label>)}
                    <Stack gap={5}>
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Box className={`p-2 border-2 ${colors}`}><IconComponent className={`h-5 w-5 ${colors.split(' ')[0]}`} /></Box>
                        <Stack gap={0}><H3 size="sm" className="text-ink-950">{tier.name}</H3><Label size="xs" className="text-grey-500">{tier.tagline}</Label></Stack>
                      </Stack>
                      <Stack direction="horizontal" className="items-baseline gap-1"><Display size="md" className="text-ink-950">{tier.price}</Display><Label size="sm" className="text-grey-500">{tier.period}</Label></Stack>
                      <Body size="sm" className="text-grey-700 italic">&ldquo;{tier.valueProposition}&rdquo;</Body>
                      <Stack gap={1}><Label size="xs" className="text-grey-500">INCLUDES</Label><Text size="xs" className="text-grey-600">{tier.products.join(' + ')}</Text></Stack>
                      {tier.byo.length > 0 && (
                        <Stack gap={2}>
                          <Label size="xs" className="text-grey-500">BYO (BRING YOUR OWN)</Label>
                          <Stack gap={1}>{tier.byo.map((item) => (<Stack key={item} direction="horizontal" gap={2} className="items-center"><X className="h-3 w-3 text-grey-400" /><Text size="xs" className="text-grey-500">{item}</Text></Stack>))}</Stack>
                          <Text size="xs" className="text-grey-400 italic">Keep using {tier.byoCompetitors}</Text>
                        </Stack>
                      )}
                      <Stack gap={2}>{tier.features.map((feature) => (<Stack key={feature} direction="horizontal" gap={2} className="items-start"><Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.popular ? 'text-brand-pink' : colors.split(' ')[0]}`} /><Text size="xs" className="text-grey-700">{feature}</Text></Stack>))}</Stack>
                      <NextLink href={tier.ctaHref} className="mt-auto"><Button variant={tier.popular ? "pop" : "outline"} size="md" fullWidth icon={<ArrowRight />}>{tier.ctaText}</Button></NextLink>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Enterprise */}
      <FullBleedSection id="enterprise" background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center sm:grid-cols-1">
            <Stack gap={6}>
              <Stack gap={2}><Label size="xs" className="text-grey-500">FULL STACK</Label><Display size="md" className="text-white">{enterpriseTier.name}</Display><H3 className="text-brand-pink">{enterpriseTier.tagline}</H3></Stack>
              <Stack direction="horizontal" className="items-baseline gap-1"><Display size="lg" className="text-white">{enterpriseTier.price}</Display><Label size="sm" className="text-grey-500">{enterpriseTier.period}</Label></Stack>
              <Body size="lg" className="text-grey-300">{enterpriseTier.valueProposition}</Body>
              <NextLink href={enterpriseTier.ctaHref}><Button variant="pop" size="lg" icon={<ArrowRight />}>{enterpriseTier.ctaText}</Button></NextLink>
            </Stack>
            <Card className="border-2 border-ink-700 bg-ink-900 p-6">
              <Stack gap={4}>
                <Label size="xs" className="text-grey-500">EVERYTHING INCLUDED</Label>
                {enterpriseTier.features.map((feature) => (<Stack key={feature} direction="horizontal" gap={3} className="items-start"><Check className="h-5 w-5 mt-0.5 shrink-0 text-brand-pink" /><Text size="sm" className="text-grey-300">{feature}</Text></Stack>))}
              </Stack>
            </Card>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Comparison Table */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-7xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center"><H1 className="text-ink-950">WHAT&apos;S INCLUDED</H1><Body size="lg" className="text-grey-600 max-w-2xl mx-auto">See exactly which products are in each tier.</Body></Stack>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b-2 border-ink-950">
                    <th className="pb-4 text-left font-display text-h6-md uppercase text-ink-950 w-1/4">Product</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-yellow">GVTE</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-cyan">COMP</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-pink">ATLVS</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-purple-500">OPS</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-pink">EXP</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-cyan">PROD</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">ENT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-grey-100"><td className="py-3"><Text size="sm" className="text-grey-700">GVTEWAY (Ticketing)</Text></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td></tr>
                  <tr className="border-t border-grey-100"><td className="py-3"><Text size="sm" className="text-grey-700">COMPVSS (Crews)</Text></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td></tr>
                  <tr className="border-t border-grey-100"><td className="py-3"><Text size="sm" className="text-grey-700">ATLVS (Business)</Text></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td><td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td></tr>
                  <tr className="border-t border-grey-200"><td colSpan={8} className="py-3"><Label size="xs" className="text-grey-500 uppercase tracking-kicker">Pricing</Label></td></tr>
                  <tr className="border-t border-grey-100"><td className="py-3"><Text size="sm" className="text-grey-700">Monthly base</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$0</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$299</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$799</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$299</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$799</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$999</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">$1,499</Text></td></tr>
                  <tr className="border-t border-grey-100"><td className="py-3"><Text size="sm" className="text-grey-700">Transaction fee</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">3.5%</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-400">—</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-400">—</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">2.5%</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-600">2.5%</Text></td><td className="py-3 text-center"><Text size="sm" className="text-grey-400">—</Text></td><td className="py-3 text-center"><Text size="sm" className="text-success">2.0%</Text></td></tr>
                </tbody>
              </table>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Add-ons */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center"><Label size="xs" className="text-grey-500 uppercase tracking-kicker">ADD-ONS</Label><H1 className="text-white">ENHANCE ANY TIER</H1></Stack>
            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              <Card className="border-2 border-ink-700 bg-ink-900 p-6"><Stack gap={4}><Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-pink bg-ink-800"><Zap className="h-6 w-6 text-brand-pink" /></Box><H3 size="sm" className="text-white">API Access</H3><Body size="sm" className="text-grey-400">Full REST API for custom integrations.</Body><Stack direction="horizontal" gap={1} className="items-baseline"><Display size="md" className="text-white">$99</Display><Label size="sm" className="text-grey-500">/month</Label></Stack></Stack></Card>
              <Card className="border-2 border-ink-700 bg-ink-900 p-6"><Stack gap={4}><Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-ink-800"><Shield className="h-6 w-6 text-brand-cyan" /></Box><H3 size="sm" className="text-white">Advanced Security</H3><Body size="sm" className="text-grey-400">SSO, audit logs, custom policies.</Body><Stack direction="horizontal" gap={1} className="items-baseline"><Display size="md" className="text-white">$149</Display><Label size="sm" className="text-grey-500">/month</Label></Stack></Stack></Card>
              <Card className="border-2 border-ink-700 bg-ink-900 p-6"><Stack gap={4}><Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-yellow bg-ink-800"><Headphones className="h-6 w-6 text-brand-yellow" /></Box><H3 size="sm" className="text-white">Premium Support</H3><Body size="sm" className="text-grey-400">24/7 phone + dedicated CSM.</Body><Stack direction="horizontal" gap={1} className="items-baseline"><Display size="md" className="text-white">$199</Display><Label size="sm" className="text-grey-500">/month</Label></Stack></Stack></Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* FAQ */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center"><H1 className="text-ink-950">FREQUENTLY ASKED QUESTIONS</H1></Stack>
          <Grid cols={2} gap={6} className="sm:grid-cols-1">
            {faqData.map((item) => (<Card key={item.question} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl"><Stack gap={3}><H3 size="sm" className="text-ink-950">{item.question}</H3><Body size="sm" className="text-grey-600">{item.answer}</Body></Stack></Card>))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">NOT SURE WHERE TO START?</Display>
            <Body size="lg" className="text-on-dark-secondary">Tell us what tools you already use—we&apos;ll recommend the right tier.</Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo"><Button variant="pop" size="lg" icon={<ArrowRight />}>Get a Recommendation</Button></NextLink>
              <NextLink href="/products/compare"><Button variant="outlineWhite" size="lg">Compare All Tiers</Button></NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
