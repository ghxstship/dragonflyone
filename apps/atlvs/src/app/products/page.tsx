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
import {
  Briefcase,
  Users,
  Ticket,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  type LucideIcon,
} from "lucide-react";
import NextLink from "next/link";
import { atlvsProductsData } from "../../data/atlvs";

export const runtime = "edge";

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Users,
  Ticket,
};

const productColors = {
  "brand-pink": "text-brand-pink border-brand-pink",
  "brand-cyan": "text-brand-cyan border-brand-cyan",
  "brand-yellow": "text-brand-yellow border-brand-yellow",
};

export default function ProductsPage() {
  const products = Object.values(atlvsProductsData);

  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero Section */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              THE GHXSTSHIP PLATFORM
            </Label>
            <Display size="lg" className="text-white">
              THREE PRODUCTS. ONE PLATFORM.
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              From project management to crew operations to fan experiences—everything you need to produce extraordinary live events.
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Products Grid */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={3} gap={8} className="sm:grid-cols-1 lg:grid-cols-3">
            {products.map((product) => {
              const IconComponent = iconMap[product.icon] || Briefcase;
              const colorClass = productColors[product.color as keyof typeof productColors] || "text-brand-pink border-brand-pink";
              
              return (
                <Card
                  key={product.name}
                  className="group border-2 border-ink-950 bg-white p-8 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl"
                >
                  <Stack gap={6}>
                    {/* Icon and Name */}
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Box className={`p-3 border-2 ${colorClass}`}>
                        <IconComponent className={`h-6 w-6 ${colorClass.split(" ")[0]}`} />
                      </Box>
                      <Stack gap={1}>
                        <H3 className="text-ink-950">{product.name}</H3>
                        <Label size="xs" className="text-grey-500">{product.tagline}</Label>
                      </Stack>
                    </Stack>

                    {/* Description */}
                    <Body size="md" className="text-grey-600">
                      {product.description}
                    </Body>

                    {/* Capabilities */}
                    <Stack gap={3}>
                      {product.capabilities.slice(0, 4).map((cap) => (
                        <Stack key={cap.title} direction="horizontal" gap={3} className="items-start">
                          <Check className={`h-4 w-4 mt-0.5 shrink-0 ${colorClass.split(" ")[0]}`} />
                          <Text size="sm" className="text-grey-700">{cap.title}</Text>
                        </Stack>
                      ))}
                      {product.capabilities.length > 4 && (
                        <Text size="sm" className="text-grey-500 pl-7">
                          +{product.capabilities.length - 4} more capabilities
                        </Text>
                      )}
                    </Stack>

                    {/* CTA */}
                    <NextLink href={`/products/${product.name.toLowerCase()}`}>
                      <Button variant="outline" size="md" fullWidth icon={<ArrowRight />}>
                        Explore {product.name}
                      </Button>
                    </NextLink>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* Platform Benefits */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={16}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">BETTER TOGETHER</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                Each product is powerful on its own. Together, they create an integrated ecosystem that eliminates silos and streamlines your entire operation.
              </Body>
            </Stack>

            <Grid cols={3} gap={8} className="sm:grid-cols-1">
              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Zap className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">REAL-TIME SYNC</H3>
                <Body size="sm" className="text-grey-600">
                  Data flows seamlessly between products. No more manual exports or duplicate entry.
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Shield className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">UNIFIED SECURITY</H3>
                <Body size="sm" className="text-grey-600">
                  Single sign-on, role-based access, and enterprise-grade security across all products.
                </Body>
              </Card>

              <Card className="border-2 border-ink-950 bg-white p-6 text-center">
                <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                  <Globe className="h-6 w-6 text-ink-950" />
                </Box>
                <H3 size="sm" className="text-ink-950 mb-2">ONE PLATFORM</H3>
                <Body size="sm" className="text-grey-600">
                  One subscription, one support team, one learning curve. Maximum efficiency.
                </Body>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Compare CTA */}
      <FullBleedSection background="ink" className="py-16">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack direction="horizontal" className="items-center justify-between flex-wrap gap-6">
            <Stack gap={2}>
              <H3 className="text-white">Not sure which product you need?</H3>
              <Body className="text-grey-400">Compare features side-by-side to find the right fit for your team.</Body>
            </Stack>
            <NextLink href="/products/compare">
              <Button variant="outlineWhite" size="lg" icon={<ArrowRight />}>
                Compare Products
              </Button>
            </NextLink>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Final CTA */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-ink-950">
              READY TO TRANSFORM YOUR PRODUCTIONS?
            </Display>
            <Body size="lg" className="text-grey-600">
              Start your 14-day free trial today. No credit card required.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
