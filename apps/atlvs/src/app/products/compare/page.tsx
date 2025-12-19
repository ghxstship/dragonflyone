import { AtlvsAppLayout } from "../../../components/app-layout";
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
import { Check, Minus, ArrowRight, Ticket, Users, Briefcase, X } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const tiers = [
  { id: 'gvteway', name: 'GVTEWAY', price: '$0', fee: '3.5%', products: [true, false, false], byo: ['CRM', 'Finance', 'Crews'], color: 'brand-yellow' },
  { id: 'compvss', name: 'COMPVSS', price: '$299', fee: '—', products: [false, true, false], byo: ['CRM', 'Finance', 'Ticketing'], color: 'brand-cyan' },
  { id: 'atlvs', name: 'ATLVS', price: '$799', fee: '—', products: [false, false, true], byo: ['Crews', 'Ticketing'], color: 'brand-pink' },
  { id: 'operations', name: 'OPERATIONS', price: '$299', fee: '2.5%', products: [true, true, false], byo: ['CRM', 'Finance'], color: 'purple' },
  { id: 'experience', name: 'EXPERIENCE', price: '$799', fee: '2.5%', products: [true, false, true], byo: ['Crews'], color: 'brand-pink' },
  { id: 'production', name: 'PRODUCTION', price: '$999', fee: '—', products: [false, true, true], byo: ['Ticketing'], color: 'brand-cyan', popular: true },
  { id: 'enterprise', name: 'ENTERPRISE', price: '$1,499', fee: '2.0%', products: [true, true, true], byo: [], color: 'ink' },
];

const scenarios = [
  { situation: 'I have Salesforce for CRM and Deputy for crews', need: 'Just ticketing', recommendation: 'GVTEWAY', reason: 'Keep your tools. Add GVTEWAY for $0/mo + fees.' },
  { situation: 'I have Monday for projects and Eventbrite for tickets', need: 'Just crew management', recommendation: 'COMPVSS', reason: 'Keep your tools. Add COMPVSS for $299/mo.' },
  { situation: 'I have ConnectTeam for crews and DICE for tickets', need: 'CRM and finance', recommendation: 'ATLVS', reason: 'Keep your tools. Add ATLVS for $799/mo.' },
  { situation: 'I have HubSpot and QuickBooks', need: 'Crews + ticketing', recommendation: 'OPERATIONS', reason: 'Keep your CRM. Get crews + tickets with lower fees.' },
  { situation: 'I have ConnectTeam and labor vendors', need: 'CRM + ticketing', recommendation: 'EXPERIENCE', reason: 'Keep your crew app. Get business + tickets.' },
  { situation: 'I have Eventbrite and like it', need: 'CRM + crews', recommendation: 'PRODUCTION', reason: 'Keep your ticketing. Get business + crews.' },
  { situation: 'I want to replace everything', need: 'Full platform', recommendation: 'ENTERPRISE', reason: 'One platform. Lowest fees. Replace it all.' },
];

export default function ComparePage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">COMPARE</Label>
            <Display size="lg" className="text-white">FIND YOUR FIT</Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Seven tiers. Three products. Keep what works—add what&apos;s missing.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Product Grid Legend */}
      <FullBleedSection background="white" className="py-8">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={4} className="sm:grid-cols-3">
            <Stack direction="horizontal" gap={2} className="items-center justify-center">
              <Box className="p-2 border-2 border-brand-yellow"><Ticket className="h-4 w-4 text-brand-yellow" /></Box>
              <Text size="sm" className="text-grey-600">GVTEWAY (Ticketing)</Text>
            </Stack>
            <Stack direction="horizontal" gap={2} className="items-center justify-center">
              <Box className="p-2 border-2 border-brand-cyan"><Users className="h-4 w-4 text-brand-cyan" /></Box>
              <Text size="sm" className="text-grey-600">COMPVSS (Crews)</Text>
            </Stack>
            <Stack direction="horizontal" gap={2} className="items-center justify-center">
              <Box className="p-2 border-2 border-brand-pink"><Briefcase className="h-4 w-4 text-brand-pink" /></Box>
              <Text size="sm" className="text-grey-600">ATLVS (Business)</Text>
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Full Comparison Table */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-7xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <H1 className="text-ink-950 text-center">ALL TIERS AT A GLANCE</H1>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-ink-950">
                    <th className="pb-4 text-left font-display text-h6-md uppercase text-ink-950">Tier</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">Price</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-yellow">GVTE</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-cyan">COMP</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-pink">ATLVS</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">Fee</th>
                    <th className="pb-4 text-left font-display text-h6-md uppercase text-grey-500">BYO</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950"></th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((tier) => (
                    <tr key={tier.id} className={`border-t border-grey-100 ${tier.popular ? 'bg-brand-pink/5' : ''}`}>
                      <td className="py-4">
                        <Stack gap={1}>
                          <Text size="sm" className="font-semibold text-ink-950">{tier.name}</Text>
                          {tier.popular && <Label size="xs" className="text-brand-pink">MOST POPULAR</Label>}
                        </Stack>
                      </td>
                      <td className="py-4 text-center"><Text size="sm" className="text-ink-950 font-semibold">{tier.price}</Text></td>
                      <td className="py-4 text-center">{tier.products[0] ? <Check className="h-5 w-5 text-success mx-auto" /> : <Minus className="h-5 w-5 text-grey-300 mx-auto" />}</td>
                      <td className="py-4 text-center">{tier.products[1] ? <Check className="h-5 w-5 text-success mx-auto" /> : <Minus className="h-5 w-5 text-grey-300 mx-auto" />}</td>
                      <td className="py-4 text-center">{tier.products[2] ? <Check className="h-5 w-5 text-success mx-auto" /> : <Minus className="h-5 w-5 text-grey-300 mx-auto" />}</td>
                      <td className="py-4 text-center"><Text size="sm" className={tier.fee === '2.0%' ? 'text-success font-semibold' : 'text-grey-600'}>{tier.fee}</Text></td>
                      <td className="py-4">
                        {tier.byo.length > 0 ? (
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {tier.byo.map((item) => (
                              <Stack key={item} direction="horizontal" gap={1} className="items-center">
                                <X className="h-3 w-3 text-grey-400" />
                                <Text size="xs" className="text-grey-500">{item}</Text>
                              </Stack>
                            ))}
                          </Stack>
                        ) : (
                          <Text size="xs" className="text-success">Nothing—full stack</Text>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        <NextLink href={tier.id === 'enterprise' ? '/contact?plan=enterprise' : `/auth/signup?plan=${tier.id}`}>
                          <Button variant={tier.popular ? "pop" : "outline"} size="sm">
                            {tier.id === 'enterprise' ? 'Contact' : 'Start'}
                          </Button>
                        </NextLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Scenario Recommendations */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-brand-pink">SCENARIOS</Label>
              <H1 className="text-ink-950">WHAT DO YOU ALREADY USE?</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Find your situation below—we&apos;ll tell you which tier fits.
              </Body>
            </Stack>

            <Grid cols={1} gap={4}>
              {scenarios.map((scenario, idx) => (
                <Card key={idx} className="border-2 border-ink-950 bg-white p-6">
                  <Grid cols={4} gap={6} className="items-center sm:grid-cols-1">
                    <Stack gap={1} className="col-span-2">
                      <Label size="xs" className="text-grey-500">SITUATION</Label>
                      <Body size="sm" className="text-grey-700">&ldquo;{scenario.situation}&rdquo;</Body>
                      <Label size="xs" className="text-grey-500 mt-2">NEED</Label>
                      <Body size="sm" className="text-ink-950 font-semibold">{scenario.need}</Body>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-success">RECOMMENDATION</Label>
                      <H3 size="sm" className="text-ink-950">{scenario.recommendation}</H3>
                      <Body size="xs" className="text-grey-600">{scenario.reason}</Body>
                    </Stack>
                    <Stack className="items-end">
                      <NextLink href={scenario.recommendation === 'ENTERPRISE' ? '/contact?plan=enterprise' : `/auth/signup?plan=${scenario.recommendation.toLowerCase()}`}>
                        <Button variant="outline" size="sm" icon={<ArrowRight />}>
                          Start {scenario.recommendation}
                        </Button>
                      </NextLink>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">STILL NOT SURE?</Display>
            <Body size="lg" className="text-on-dark-secondary">
              Book a 15-minute call. Tell us what you use—we&apos;ll recommend the right tier.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo"><Button variant="pop" size="lg" icon={<ArrowRight />}>Get a Recommendation</Button></NextLink>
              <NextLink href="/pricing"><Button variant="outlineWhite" size="lg">See All Pricing</Button></NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
