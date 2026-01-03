"use client";

/**
 * Pricing Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, pricing table, FAQ, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 * Uses MarketingPage template for consistency with other marketing pages
 */

import { useRouter } from "next/navigation";
import { Check, ArrowRight, Ticket, Users, Briefcase, Sparkles } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, Container, Display, H1, H2, H3, Label, Text, Article, Box,
  MarketingPage, HeroSection, CTABanner, type MarketingSection
} from "@ghxstship/ui";
import { atlvsPricing } from "@/data/atlvs";

const FAQS = [
  { id: "change-plans", question: "Can I change plans later?", answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing accordingly." },
  { id: "payment-methods", question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express), ACH transfers, and wire transfers for enterprise accounts." },
  { id: "free-trial", question: "Is there a free trial?", answer: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start." },
  { id: "trial-end", question: "What happens when my trial ends?", answer: "You'll be prompted to choose a plan. If you don't, your account will be downgraded to a limited free tier with basic features." },
  { id: "cancel", question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access continues until the end of your billing period." },
  { id: "support", question: "What kind of support do you offer?", answer: "All plans include email support. Professional plans get priority support with faster response times. Enterprise customers get dedicated account managers and 24/7 phone support." },
  { id: "transaction-fees", question: "What are the transaction fees?", answer: "GVTEWAY standalone has 3.5% fees. Bundles have 2.5% fees. Full Stack Enterprise has the lowest at 2.0% fees." },
  { id: "seats", question: "Are there per-seat charges?", answer: "No! ATLVS and COMPVSS have unlimited users included. No per-seat pricing ever." },
];

const PRODUCT_ICONS = {
  gvteway: <Ticket className="size-5" />,
  compvss: <Users className="size-5" />,
  atlvs: <Briefcase className="size-5" />,
};

// Experience Generator Section
function ExperienceGeneratorSection() {
  const router = useRouter();
  const { experienceGenerator } = atlvsPricing;
  
  return (
    <Container size="2xl" className="py-16 md:py-24">
      <Card className="border-2 border-primary bg-primary/5 p-8 sm:p-12">
        <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
          <Stack gap={6}>
            <Stack gap={2}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Sparkles className="size-5 text-primary" />
                <Label size="xs" className="text-primary">{experienceGenerator.subtitle.toUpperCase()}</Label>
              </Stack>
              <H2 className="text-text-primary">{experienceGenerator.name}</H2>
            </Stack>
            <Display className="text-primary text-display-md">{experienceGenerator.price}</Display>
            <Body className="text-text-secondary">{experienceGenerator.description}</Body>
            <Stack gap={3}>
              {experienceGenerator.features.map((feature: string, idx: number) => (
                <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                  <Check className="size-5 text-primary flex-shrink-0" />
                  <Body className="text-text-secondary">{feature}</Body>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack gap={6} className="items-center text-center">
            <Box className="p-6 border-2 border-primary bg-white shadow-md">
              <Sparkles className="size-16 text-primary mx-auto mb-4" />
              <H3 className="text-text-primary mb-2">Start Creating Now</H3>
              <Body size="sm" className="text-text-muted mb-4">No account needed. Just enter an idea.</Body>
            </Box>
            <Button variant="primary" size="lg" onClick={() => router.push(experienceGenerator.cta.href)} icon={<Sparkles className="size-5" />}>
              {experienceGenerator.cta.label}
            </Button>
          </Stack>
        </Grid>
      </Card>
    </Container>
  );
}

// Single Products Section
function SingleProductsSection() {
  const router = useRouter();
  const { singleProducts } = atlvsPricing;
  
  return (
    <Container size="2xl" className="py-16 md:py-24">
      <Stack gap={4} className="text-center mb-12">
        <Label size="xs" className="text-text-muted">{singleProducts.category}</Label>
        <H1 className="text-text-primary">{singleProducts.tagline}</H1>
        <Body size="lg" className="text-text-muted max-w-2xl mx-auto">{singleProducts.description}</Body>
      </Stack>
      <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
        {singleProducts.products.map((product: { id: string; color: string; subtitle: string; name: string; price: string; period: string; description: string; features: string[]; cta: { href: string; label: string } }) => (
          <Article key={product.id} className={`border-2 border-border bg-white p-6 h-full flex flex-col pop-card-${product.color === "brand-yellow" ? "yellow" : product.color === "brand-cyan" ? "cyan" : "brand"}`}>
            {/* Card content - grows to fill available space */}
            <Stack gap={4} className="flex-1">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Box className={`text-${product.color}`}>{PRODUCT_ICONS[product.id.replace("-single", "") as keyof typeof PRODUCT_ICONS]}</Box>
                <Label size="xs" className={`text-${product.color}`}>{product.subtitle.toUpperCase()}</Label>
              </Stack>
              <H3 className="font-display text-h4-md uppercase tracking-label text-text-primary">{product.name}</H3>
              <Stack direction="horizontal" gap={1} className="items-baseline">
                <Display className="text-text-primary text-display-sm">{product.price}</Display>
                <Text size="sm" className="text-text-muted">{product.period}</Text>
              </Stack>
              <Body size="sm" className="text-text-muted">{product.description}</Body>
              <Stack gap={2}>
                {product.features.map((feature: string, idx: number) => (
                  <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                    <Check className={`size-4 text-${product.color} flex-shrink-0`} />
                    <Text size="sm" className="text-text-secondary">{feature}</Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            {/* CTA - anchored at bottom */}
            <Button 
              variant={product.price === "$0" ? "primary" : "outline"} 
              size="md" 
              fullWidth 
              onClick={() => router.push(product.cta.href)}
              className="mt-4"
            >
              {product.cta.label}
            </Button>
          </Article>
        ))}
      </Grid>
    </Container>
  );
}

// Bundles Section
function BundlesSection() {
  const router = useRouter();
  const { bundles } = atlvsPricing;
  
  return (
    <Container size="2xl" className="py-16 md:py-24">
      <Stack gap={4} className="text-center mb-12">
        <Label size="xs" className="text-brand-pink">{bundles.category}</Label>
        <H1 className="text-text-primary">{bundles.tagline}</H1>
        <Body size="lg" className="text-text-muted max-w-2xl mx-auto">{bundles.description}</Body>
      </Stack>
      <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
        {bundles.products.map((bundle: { id: string; color: string; subtitle: string; name: string; price: string; period: string; description: string; features: string[]; cta: { href: string; label: string } }) => (
          <Article 
            key={bundle.id} 
            className={`border-2 ${bundle.id === "experience" ? "border-brand-pink" : "border-border"} bg-white p-6 h-full flex flex-col pop-card relative`}
          >
            {bundle.id === "experience" && (
              <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-3 py-1 text-white">MOST POPULAR</Label>
            )}
            {/* Card content - grows to fill available space */}
            <Stack gap={4} className="flex-1">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Box className={`size-3 rounded-full bg-${bundle.color}`} />
                <Label size="xs" className="text-text-muted">{bundle.subtitle.toUpperCase()}</Label>
              </Stack>
              <H3 className="font-display text-h4-md uppercase tracking-label text-text-primary">{bundle.name}</H3>
              <Stack direction="horizontal" gap={1} className="items-baseline">
                <Display className="text-text-primary text-display-sm">{bundle.price}</Display>
                <Text size="sm" className="text-text-muted">{bundle.period}</Text>
              </Stack>
              <Body size="sm" className="text-text-muted">{bundle.description}</Body>
              <Stack gap={2}>
                {bundle.features.map((feature: string, idx: number) => (
                  <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                    <Check className={`size-4 text-${bundle.color} flex-shrink-0`} />
                    <Text size="sm" className="text-text-secondary">{feature}</Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            {/* CTA - anchored at bottom */}
            <Button 
              variant={bundle.id === "experience" ? "accent" : "outline"} 
              size="md" 
              fullWidth 
              onClick={() => router.push(bundle.cta.href)}
              className="mt-4"
            >
              {bundle.cta.label}
            </Button>
          </Article>
        ))}
      </Grid>
    </Container>
  );
}

// Full Stack Section
function FullStackSection() {
  const router = useRouter();
  const { fullStack } = atlvsPricing;
  
  return (
    <Container size="2xl" className="py-16 md:py-24">
      <Card inverted className="border-2 border-white p-8 sm:p-12">
        <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
          <Stack gap={6}>
            <Stack gap={2}>
              <Label size="xs" className="text-text-muted">{fullStack.category}</Label>
              <H2 className="text-white">{fullStack.tagline}</H2>
            </Stack>
            <Stack direction="horizontal" gap={2} className="items-baseline">
              <Display className="text-white">{fullStack.price}</Display>
              <Text className="text-text-muted">{fullStack.period}</Text>
            </Stack>
            <Body className="text-text-secondary">{fullStack.description}</Body>
            <Stack gap={3}>
              {fullStack.features.map((feature: string, idx: number) => (
                <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                  <Check className="size-5 text-brand-pink flex-shrink-0" />
                  <Body className="text-text-secondary">{feature}</Body>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack gap={6} className="items-center text-center lg:items-end lg:text-right">
            <Stack gap={2}>
              <Text className="text-text-muted">Includes all three products:</Text>
              <Stack direction="horizontal" gap={4} className="justify-center lg:justify-end">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Box className="text-brand-pink">{PRODUCT_ICONS.atlvs}</Box>
                  <Text className="text-white">ATLVS</Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Box className="text-brand-yellow">{PRODUCT_ICONS.compvss}</Box>
                  <Text className="text-white">COMPVSS</Text>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Box className="text-brand-cyan">{PRODUCT_ICONS.gvteway}</Box>
                  <Text className="text-white">GVTEWAY</Text>
                </Stack>
              </Stack>
            </Stack>
            <Button variant="primary" size="lg" onClick={() => router.push(fullStack.cta.href)} icon={<ArrowRight />} iconPosition="right">
              {fullStack.cta.label}
            </Button>
          </Stack>
        </Grid>
      </Card>
    </Container>
  );
}

// FAQ Section
function FAQSection() {
  return (
    <Container size="2xl" className="py-16 md:py-24">
      <Stack gap={4} className="text-center mb-12">
        <Label size="xs" className="text-text-muted">FAQ</Label>
        <H1 className="text-text-primary">FREQUENTLY ASKED QUESTIONS</H1>
        <Body size="lg" className="text-text-muted max-w-2xl mx-auto">Everything you need to know about our pricing</Body>
      </Stack>
      <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
        {FAQS.map((faq) => (
          <Article key={faq.id} className="border-2 border-border bg-white p-6 pop-card">
            <H3 className="font-display text-h6-md uppercase tracking-label text-text-primary mb-3">{faq.question}</H3>
            <Body className="text-text-muted">{faq.answer}</Body>
          </Article>
        ))}
      </Grid>
      <Box className="mt-12 pt-6 border-t-2 border-border">
        <Body size="sm" className="text-center text-text-muted">{atlvsPricing.footnote}</Body>
      </Box>
    </Container>
  );
}

export default function PricingPage() {
  const router = useRouter();

  const sections: MarketingSection[] = [
    {
      id: "hero",
      background: "gradient",
      pattern: "halftone",
      patternOpacity: 0.05,
      content: (
        <HeroSection
          kicker="Pricing"
          title="Modular by Design"
          description="Seven tiers. Three products. Use what you need. Keep what you have."
          primaryCta={{
            label: "Start Free Trial",
            onClick: () => router.push("/auth/signup"),
          }}
          secondaryCta={{
            label: "Contact Sales",
            onClick: () => router.push("/contact"),
          }}
          background="gradient"
          pattern="none"
          fullHeight={false}
          align="center"
        />
      ),
    },
    { id: "generator", background: "white", content: <ExperienceGeneratorSection /> },
    { id: "single", background: "white", content: <SingleProductsSection /> },
    { id: "bundles", background: "white", content: <BundlesSection /> },
    { id: "fullstack", background: "ink", content: <FullStackSection /> },
    { id: "faq", background: "white", content: <FAQSection /> },
    {
      id: "cta",
      background: "ink",
      pattern: "stripes",
      content: (
        <CTABanner
          title="Ready to Transform Your Productions?"
          description="Start your 14-day free trial today. No credit card required."
          primaryCta={{
            label: "Start Free Trial",
            onClick: () => router.push("/auth/signup"),
          }}
          secondaryCta={{
            label: "Talk to Sales",
            onClick: () => router.push("/contact"),
          }}
          background="ink"
        />
      ),
    },
  ];

  return <MarketingPage sections={sections} />;
}
