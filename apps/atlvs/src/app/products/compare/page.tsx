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
import {
  Briefcase,
  Users,
  Ticket,
  Check,
  Minus,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { atlvsProductsData } from "../../../data/atlvs";

export const runtime = "edge";

const productIcons: Record<string, LucideIcon> = {
  Briefcase,
  Users,
  Ticket,
};

const productColors = {
  "brand-pink": { text: "text-brand-pink", border: "border-brand-pink", bg: "bg-brand-pink" },
  "brand-cyan": { text: "text-brand-cyan", border: "border-brand-cyan", bg: "bg-brand-cyan" },
  "brand-yellow": { text: "text-brand-yellow", border: "border-brand-yellow", bg: "bg-brand-yellow" },
};

interface Feature {
  name: string;
  atlvs: boolean | string;
  compvss: boolean | string;
  gvteway: boolean | string;
}

const comparisonFeatures: { category: string; features: Feature[] }[] = [
  {
    category: "Project Management",
    features: [
      { name: "Multi-project dashboards", atlvs: true, compvss: false, gvteway: false },
      { name: "Task management", atlvs: true, compvss: "Limited", gvteway: false },
      { name: "Timeline & Gantt charts", atlvs: true, compvss: false, gvteway: false },
      { name: "Document collaboration", atlvs: true, compvss: "View only", gvteway: false },
      { name: "Client portal", atlvs: true, compvss: false, gvteway: false },
    ],
  },
  {
    category: "Financial Tools",
    features: [
      { name: "Budget tracking", atlvs: true, compvss: false, gvteway: false },
      { name: "Invoicing", atlvs: true, compvss: false, gvteway: false },
      { name: "Expense management", atlvs: true, compvss: false, gvteway: false },
      { name: "Multi-entity accounting", atlvs: true, compvss: false, gvteway: false },
      { name: "Payment processing", atlvs: true, compvss: false, gvteway: true },
    ],
  },
  {
    category: "Workforce Management",
    features: [
      { name: "Crew database", atlvs: "Basic", compvss: true, gvteway: false },
      { name: "Scheduling", atlvs: "Basic", compvss: true, gvteway: false },
      { name: "Timekeeping & clock in/out", atlvs: false, compvss: true, gvteway: false },
      { name: "Skills & certifications", atlvs: false, compvss: true, gvteway: false },
      { name: "Mobile app for crew", atlvs: false, compvss: true, gvteway: false },
    ],
  },
  {
    category: "Vendor Management",
    features: [
      { name: "Vendor database", atlvs: true, compvss: false, gvteway: false },
      { name: "RFP & quote requests", atlvs: true, compvss: false, gvteway: false },
      { name: "Purchase orders", atlvs: true, compvss: false, gvteway: false },
      { name: "Vendor performance tracking", atlvs: true, compvss: false, gvteway: false },
      { name: "Load-in coordination", atlvs: true, compvss: true, gvteway: false },
    ],
  },
  {
    category: "Ticketing & Sales",
    features: [
      { name: "Ticket sales", atlvs: false, compvss: false, gvteway: true },
      { name: "Event discovery", atlvs: false, compvss: false, gvteway: true },
      { name: "Dynamic pricing", atlvs: false, compvss: false, gvteway: true },
      { name: "Merchandise sales", atlvs: false, compvss: false, gvteway: true },
      { name: "Self-service booking widget", atlvs: false, compvss: false, gvteway: true },
    ],
  },
  {
    category: "Fan Engagement",
    features: [
      { name: "Gamification & challenges", atlvs: false, compvss: false, gvteway: true },
      { name: "Community features", atlvs: false, compvss: false, gvteway: true },
      { name: "Email marketing", atlvs: false, compvss: false, gvteway: true },
      { name: "SMS marketing", atlvs: false, compvss: false, gvteway: true },
      { name: "Loyalty programs", atlvs: false, compvss: false, gvteway: true },
    ],
  },
  {
    category: "Analytics & Reporting",
    features: [
      { name: "Financial reports", atlvs: true, compvss: false, gvteway: "Revenue only" },
      { name: "Project reports", atlvs: true, compvss: false, gvteway: false },
      { name: "Crew reports", atlvs: "Basic", compvss: true, gvteway: false },
      { name: "Sales analytics", atlvs: false, compvss: false, gvteway: true },
      { name: "Custom dashboards", atlvs: true, compvss: true, gvteway: true },
    ],
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <Box className="flex items-center justify-center">
        <Check className="h-5 w-5 text-success" />
      </Box>
    );
  }
  if (value === false) {
    return (
      <Box className="flex items-center justify-center">
        <Minus className="h-5 w-5 text-grey-300" />
      </Box>
    );
  }
  return (
    <Text size="xs" className="text-grey-500 text-center">
      {value}
    </Text>
  );
}

export default function ProductComparePage() {
  const products = [
    { key: "atlvs", data: atlvsProductsData.atlvs },
    { key: "compvss", data: atlvsProductsData.compvss },
    { key: "gvteway", data: atlvsProductsData.gvteway },
  ];

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              PRODUCT COMPARISON
            </Label>
            <Display size="lg" className="text-white">
              FIND YOUR PERFECT FIT
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              Compare features across all three GHXSTSHIP products to find the right solution for your team. Use one, two, or all three—they work seamlessly together.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Product Cards */}
      <FullBleedSection background="white" className="py-12">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
            {products.map(({ key, data }) => {
              const IconComponent = productIcons[data.icon] || Briefcase;
              const colors = productColors[data.color as keyof typeof productColors];
              
              return (
                <Card
                  key={key}
                  className={`border-2 border-ink-950 bg-white p-6 shadow-subtle-sm`}
                >
                  <Stack gap={4} className="items-center text-center">
                    <Box className={`p-3 border-2 ${colors.border}`}>
                      <IconComponent className={`h-6 w-6 ${colors.text}`} />
                    </Box>
                    <H3 className="text-ink-950">{data.name}</H3>
                    <Label size="xs" className="text-grey-500">{data.tagline}</Label>
                    <Body size="sm" className="text-grey-600">{data.description}</Body>
                    <NextLink href={`/products/${key}`}>
                      <Button variant="outline" size="sm" icon={<ArrowRight />}>
                        Learn More
                      </Button>
                    </NextLink>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Comparison Table */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">FEATURE COMPARISON</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                A detailed breakdown of what each product offers.
              </Body>
            </Stack>

            {/* Sticky Header */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-ink-950">
                    <th className="pb-4 text-left font-display text-h6-md uppercase text-ink-950 w-1/3">
                      Feature
                    </th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase w-1/5">
                      <Stack gap={1} className="items-center">
                        <Briefcase className="h-5 w-5 text-brand-pink" />
                        <span className="text-brand-pink">ATLVS</span>
                      </Stack>
                    </th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase w-1/5">
                      <Stack gap={1} className="items-center">
                        <Users className="h-5 w-5 text-brand-cyan" />
                        <span className="text-brand-cyan">COMPVSS</span>
                      </Stack>
                    </th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase w-1/5">
                      <Stack gap={1} className="items-center">
                        <Ticket className="h-5 w-5 text-brand-yellow" />
                        <span className="text-brand-yellow">GVTEWAY</span>
                      </Stack>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category) => (
                    <>
                      <tr key={category.category} className="border-t border-grey-200">
                        <td colSpan={4} className="py-4">
                          <Label size="xs" className="text-grey-500 uppercase tracking-kicker">
                            {category.category}
                          </Label>
                        </td>
                      </tr>
                      {category.features.map((feature) => (
                        <tr key={feature.name} className="border-t border-grey-100">
                          <td className="py-3">
                            <Text size="sm" className="text-grey-700">{feature.name}</Text>
                          </td>
                          <td className="py-3">
                            <FeatureCell value={feature.atlvs} />
                          </td>
                          <td className="py-3">
                            <FeatureCell value={feature.compvss} />
                          </td>
                          <td className="py-3">
                            <FeatureCell value={feature.gvteway} />
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Bundle Pricing */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12} className="items-center text-center">
            <Stack gap={4}>
              <H1 className="text-white">BETTER TOGETHER</H1>
              <Body size="lg" className="text-grey-400 max-w-2xl">
                Use multiple products together and save. Bundle pricing gives you access to the full platform at a discount.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1 w-full">
              <Card className="border-2 border-ink-700 bg-ink-900 p-6 text-center">
                <Stack gap={4}>
                  <Label size="xs" className="text-grey-500">SINGLE PRODUCT</Label>
                  <Display size="md" className="text-white">$149</Display>
                  <Body size="sm" className="text-grey-500">/month per product</Body>
                </Stack>
              </Card>

              <Card className="border-2 border-brand-pink bg-ink-900 p-6 text-center relative">
                <Box className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-pink">
                  <Label size="xs" className="text-white">MOST POPULAR</Label>
                </Box>
                <Stack gap={4}>
                  <Label size="xs" className="text-grey-500">TWO PRODUCTS</Label>
                  <Display size="md" className="text-white">$249</Display>
                  <Body size="sm" className="text-grey-500">/month (save 16%)</Body>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-700 bg-ink-900 p-6 text-center">
                <Stack gap={4}>
                  <Label size="xs" className="text-grey-500">ALL THREE</Label>
                  <Display size="md" className="text-white">$349</Display>
                  <Body size="sm" className="text-grey-500">/month (save 22%)</Body>
                </Stack>
              </Card>
            </Grid>

            <NextLink href="/pricing">
              <Button variant="pop" size="lg" inverted icon={<ArrowRight />}>
                View Full Pricing
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              STILL NOT SURE?
            </Display>
            <Body size="lg" className="text-grey-600 max-w-xl">
              Talk to our team to get personalized recommendations based on your specific needs.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/demo/request">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Request a Demo
                </Button>
              </NextLink>
              <NextLink href="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
