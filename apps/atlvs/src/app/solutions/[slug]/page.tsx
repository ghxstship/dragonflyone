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
  ArrowRight,
  Check,
  X,
  Briefcase,
  Users,
  Ticket,
  GitBranch,
  FileText,
  PieChart,
  Building,
  BarChart3,
  FormInput,
  Calendar,
  FileCheck,
  LayoutGrid,
  CreditCard,
  Globe,
  LayoutDashboard,
  CheckSquare,
  AlertTriangle,
  Bell,
  Clock,
  Truck,
  MessageSquare,
  Star,
  DollarSign,
  Package,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { atlvsSolutionsData, atlvsProductsData } from "../../../data/atlvs";

export const runtime = "edge";

const iconMap: Record<string, LucideIcon> = {
  GitBranch,
  FileText,
  PieChart,
  Building,
  Users,
  BarChart3,
  FormInput,
  Calendar,
  FileCheck,
  LayoutGrid,
  CreditCard,
  Globe,
  LayoutDashboard,
  CheckSquare,
  AlertTriangle,
  Bell,
  Clock,
  Truck,
  MessageSquare,
  Briefcase,
  Star,
  DollarSign,
  Package,
  ShoppingCart,
};

const productColors = {
  ATLVS: { text: "text-brand-pink", border: "border-brand-pink", bg: "bg-brand-pink" },
  COMPVSS: { text: "text-brand-cyan", border: "border-brand-cyan", bg: "bg-brand-cyan" },
  GVTEWAY: { text: "text-brand-yellow", border: "border-brand-yellow", bg: "bg-brand-yellow" },
};

const productIcons = {
  ATLVS: Briefcase,
  COMPVSS: Users,
  GVTEWAY: Ticket,
};

export function generateStaticParams() {
  return Object.keys(atlvsSolutionsData).map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = atlvsSolutionsData[slug];

  if (!solution) {
    notFound();
  }

  const productKey = solution.primaryProduct.toLowerCase() as keyof typeof atlvsProductsData;
  const product = atlvsProductsData[productKey];
  const colors = productColors[solution.primaryProduct as keyof typeof productColors];
  const ProductIcon = productIcons[solution.primaryProduct as keyof typeof productIcons];

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack direction="horizontal" gap={3} className="items-center">
                <Box className={`p-2 border-2 ${colors.border} bg-ink-800`}>
                  <ProductIcon className={`h-5 w-5 ${colors.text}`} />
                </Box>
                <Label size="xs" className={`${colors.text} uppercase tracking-kicker`}>
                  {solution.title}
                </Label>
              </Stack>
              <Display size="lg" className="text-white">
                {solution.headline}
              </Display>
              <Body size="lg" className="text-on-dark-secondary">
                {solution.description}
              </Body>
              <Stack direction="horizontal" gap={4}>
                <NextLink href={solution.cta.href}>
                  <Button variant="pop" size="lg" icon={<ArrowRight />}>
                    {solution.cta.label}
                  </Button>
                </NextLink>
                <NextLink href="/demo">
                  <Button variant="outlineWhite" size="lg">
                    Watch Demo
                  </Button>
                </NextLink>
              </Stack>
            </Stack>
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-video border-ink-700 bg-ink-900 shadow-brand-xl">
                <Box className="flex h-full items-center justify-center">
                  <Stack gap={4} className="text-center">
                    <ProductIcon className="h-16 w-16 text-grey-600 mx-auto" />
                    <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                      {solution.primaryProduct} Dashboard
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Pain Points */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className="text-grey-500 uppercase tracking-kicker">THE PROBLEM</Label>
                <H1 className="text-ink-950">SOUND FAMILIAR?</H1>
              </Stack>
              <Body size="lg" className="text-grey-600">
                We built {solution.primaryProduct} because we lived these frustrations every day. If any of these hit home, you&apos;re in the right place.
              </Body>
            </Stack>
            <Stack gap={4}>
              {solution.painPoints.map((pain, idx) => (
                <Card key={idx} className="border-2 border-ink-950 bg-white p-4 shadow-subtle-sm">
                  <Stack direction="horizontal" gap={3} className="items-start">
                    <Box className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-error bg-error/10">
                      <X className="h-4 w-4 text-error" />
                    </Box>
                    <Body size="sm" className="text-grey-700">{pain}</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Key Features */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500 uppercase tracking-kicker">THE SOLUTION</Label>
              <H1 className="text-ink-950">WHAT {solution.primaryProduct} GIVES YOU</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Purpose-built tools that address your specific challenges and help you work smarter.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1 lg:grid-cols-3">
              {solution.keyFeatures.map((feature) => {
                const IconComponent = iconMap[feature.icon] || Check;
                return (
                  <Card key={feature.title} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                    <Stack gap={4}>
                      <Box className={`flex h-12 w-12 items-center justify-center border-2 ${colors.border} bg-grey-100`}>
                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                      </Box>
                      <H3 size="sm" className="text-ink-950">{feature.title}</H3>
                      <Body size="sm" className="text-grey-600">{feature.description}</Body>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Product Integration */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Grid cols={2} gap={12} className="items-center">
            <Stack gap={8}>
              <Stack gap={2}>
                <Label size="xs" className={`${colors.text} uppercase tracking-kicker`}>POWERED BY</Label>
                <H1 className="text-white">{solution.primaryProduct}</H1>
              </Stack>
              <Body size="lg" className="text-grey-400">
                {product.description}
              </Body>
              <Stack gap={3}>
                {product.capabilities.slice(0, 4).map((cap) => (
                  <Stack key={cap.title} direction="horizontal" gap={3} className="items-start">
                    <Check className={`h-5 w-5 mt-0.5 shrink-0 ${colors.text}`} />
                    <Stack gap={1}>
                      <Text size="sm" weight="medium" className="text-white">{cap.title}</Text>
                      <Text size="xs" className="text-grey-500">{cap.description}</Text>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              <NextLink href={`/products/${productKey}`}>
                <Button variant="outlineWhite" size="md" icon={<ArrowRight />}>
                  Learn More About {solution.primaryProduct}
                </Button>
              </NextLink>
            </Stack>
            <Box className="hidden lg:block">
              <Card className="border-2 aspect-square border-ink-700 bg-ink-900 shadow-brand-lg">
                <Box className="flex h-full items-center justify-center p-8">
                  <Stack gap={4} className="text-center">
                    <ProductIcon className="h-20 w-20 text-grey-600 mx-auto" />
                    <Text className="font-display text-h4-md uppercase text-grey-500">
                      {solution.primaryProduct}
                    </Text>
                  </Stack>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Testimonial Placeholder */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-ink-950 bg-white p-8 lg:p-12 text-center shadow-brand-lg">
            <Stack gap={6} className="items-center">
              <Box className="flex h-16 w-16 items-center justify-center border-2 border-ink-950 bg-grey-100 rounded-avatar">
                <Users className="h-8 w-8 text-grey-400" />
              </Box>
              <Body size="lg" className="text-grey-600 italic max-w-2xl">
                &ldquo;[Customer testimonial placeholder] GHXSTSHIP transformed how our team operates. We saved 20+ hours per week and reduced errors by 80%.&rdquo;
              </Body>
              <Stack gap={1} className="items-center">
                <Text weight="medium" className="text-ink-950">Customer Name</Text>
                <Text size="sm" className="text-grey-500">Role, Company Name</Text>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </FullBleedSection>

      {/* Related Solutions */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={8}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">EXPLORE OTHER SOLUTIONS</H1>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              {Object.entries(atlvsSolutionsData)
                .filter(([key]) => key !== slug)
                .slice(0, 3)
                .map(([key, sol]) => {
                  const solColors = productColors[sol.primaryProduct as keyof typeof productColors];
                  const SolIcon = productIcons[sol.primaryProduct as keyof typeof productIcons];
                  return (
                    <NextLink key={key} href={`/solutions/${key}`}>
                      <Card className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl h-full">
                        <Stack gap={4}>
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <Box className={`p-2 border-2 ${solColors.border}`}>
                              <SolIcon className={`h-4 w-4 ${solColors.text}`} />
                            </Box>
                            <Label size="xs" className="text-grey-500">{sol.primaryProduct}</Label>
                          </Stack>
                          <H3 size="sm" className="text-ink-950">{sol.title}</H3>
                          <Body size="xs" className="text-grey-600 line-clamp-2">{sol.description}</Body>
                        </Stack>
                      </Card>
                    </NextLink>
                  );
                })}
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO GET STARTED?
            </Display>
            <Body size="lg" className="text-grey-400 max-w-xl">
              Join thousands of professionals who use GHXSTSHIP to transform their work. Start your 14-day free trial today.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href={solution.cta.href}>
                <Button variant="pop" size="lg" inverted icon={<ArrowRight />}>
                  {solution.cta.label}
                </Button>
              </NextLink>
              <NextLink href="/pricing">
                <Button variant="outlineWhite" size="lg">
                  View Pricing
                </Button>
              </NextLink>
            </Stack>
            <Label size="xs" className="text-grey-500">
              No credit card required • 14-day free trial • Cancel anytime
            </Label>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
