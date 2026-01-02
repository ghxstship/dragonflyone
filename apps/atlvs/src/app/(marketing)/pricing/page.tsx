"use client";

/**
 * Pricing Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, pricing table, FAQ, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 * 
 * Structure:
 * - Experience Generator (FREE): AI-powered blueprint generation
 * - Single Products (from $0): GVTEWAY, COMPVSS, ATLVS
 * - Bundles (from $299): OPERATIONS, EXPERIENCE, PRODUCTION
 * - Full Stack ($1,499): All three products
 */

import { useRouter } from "next/navigation";
import { Check, ArrowRight, Ticket, Users, Briefcase, Sparkles } from "lucide-react";
import {
  Body, Button, Card, Grid, Stack, Container, Display, H1, H2, H3, Label, Text, Article, Box
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

export default function PricingPage() {
  const router = useRouter();
  const { experienceGenerator, singleProducts, bundles, fullStack } = atlvsPricing;

  return (
    <>
      {/* Hero Section */}
      <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Stack gap={6} className="items-center text-center sm:gap-8">
          <Label size="xs" className="text-brand-pink">PRICING</Label>
          <Display className="text-white text-display-sm sm:text-display-md lg:text-display-lg">MODULAR BY DESIGN</Display>
          <Body size="lg" className="max-w-3xl text-on-dark-secondary">
            Seven tiers. Three products. Use what you need. Keep what you have.
          </Body>
          <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
            <Button variant="primary" size="lg" onClick={() => router.push("/auth/signup")} icon={<ArrowRight />} iconPosition="right">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
              Contact Sales
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Experience Generator - FREE */}
      <Box id="free" className="bg-white">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Card className="border-2 border-primary bg-primary/5 p-8 sm:p-12">
            <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
              <Stack gap={6}>
                <Stack gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Sparkles className="size-5 text-primary" />
                    <Label size="xs" className="text-primary">{experienceGenerator.subtitle.toUpperCase()}</Label>
                  </Stack>
                  <H2 className="text-ink-950">{experienceGenerator.name}</H2>
                </Stack>
                <Display className="text-primary text-display-md">{experienceGenerator.price}</Display>
                <Body className="text-on-light-secondary">{experienceGenerator.description}</Body>
                <Stack gap={3}>
                  {experienceGenerator.features.map((feature, idx) => (
                    <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                      <Check className="size-5 text-primary flex-shrink-0" />
                      <Body className="text-on-light-secondary">{feature}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
              <Stack gap={6} className="items-center text-center">
                <Box className="p-6 border-2 border-primary bg-white shadow-md">
                  <Sparkles className="size-16 text-primary mx-auto mb-4" />
                  <H3 className="text-ink-950 mb-2">Start Creating Now</H3>
                  <Body size="sm" className="text-on-light-muted mb-4">No account needed. Just enter an idea.</Body>
                </Box>
                <Button variant="primary" size="lg" onClick={() => router.push(experienceGenerator.cta.href)} icon={<Sparkles className="size-5" />}>
                  {experienceGenerator.cta.label}
                </Button>
              </Stack>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* Single Products Section */}
      <Box id="single" className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-center mb-12">
            <Label size="xs" className="text-on-light-muted">{singleProducts.category}</Label>
            <H1 className="text-ink-950">{singleProducts.tagline}</H1>
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">{singleProducts.description}</Body>
          </Stack>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
            {singleProducts.products.map((product) => (
              <Article key={product.id} className={`border-2 border-ink-950 bg-white p-6 pop-card-${product.color === "brand-yellow" ? "yellow" : product.color === "brand-cyan" ? "cyan" : "brand"}`}>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className={`text-${product.color}`}>{PRODUCT_ICONS[product.id.replace("-single", "") as keyof typeof PRODUCT_ICONS]}</Box>
                    <Label size="xs" className={`text-${product.color}`}>{product.subtitle.toUpperCase()}</Label>
                  </Stack>
                  <H3 className="font-display text-h4-md uppercase tracking-label text-ink-950">{product.name}</H3>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <Display className="text-ink-950 text-display-sm">{product.price}</Display>
                    <Text size="sm" className="text-on-light-muted">{product.period}</Text>
                  </Stack>
                  <Body size="sm" className="text-on-light-muted">{product.description}</Body>
                  <Stack gap={2} className="flex-1">
                    {product.features.map((feature, idx) => (
                      <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                        <Check className={`size-4 text-${product.color} flex-shrink-0`} />
                        <Text size="sm" className="text-on-light-secondary">{feature}</Text>
                      </Stack>
                    ))}
                  </Stack>
                  <Button 
                    variant={product.price === "$0" ? "primary" : "outline"} 
                    size="md" 
                    fullWidth 
                    onClick={() => router.push(product.cta.href)}
                  >
                    {product.cta.label}
                  </Button>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Bundles Section */}
      <Box id="bundles" className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-center mb-12">
            <Label size="xs" className="text-brand-pink">{bundles.category}</Label>
            <H1 className="text-ink-950">{bundles.tagline}</H1>
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">{bundles.description}</Body>
          </Stack>
          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
            {bundles.products.map((bundle) => (
              <Article 
                key={bundle.id} 
                className={`border-2 ${bundle.id === "experience" ? "border-brand-pink" : "border-ink-950"} bg-white p-6 pop-card relative`}
              >
                {bundle.id === "experience" && (
                  <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-3 py-1 text-white">MOST POPULAR</Label>
                )}
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className={`size-3 rounded-full bg-${bundle.color}`} />
                    <Label size="xs" className="text-on-light-muted">{bundle.subtitle.toUpperCase()}</Label>
                  </Stack>
                  <H3 className="font-display text-h4-md uppercase tracking-label text-ink-950">{bundle.name}</H3>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <Display className="text-ink-950 text-display-sm">{bundle.price}</Display>
                    <Text size="sm" className="text-on-light-muted">{bundle.period}</Text>
                  </Stack>
                  <Body size="sm" className="text-on-light-muted">{bundle.description}</Body>
                  <Stack gap={2} className="flex-1">
                    {bundle.features.map((feature, idx) => (
                      <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                        <Check className={`size-4 text-${bundle.color} flex-shrink-0`} />
                        <Text size="sm" className="text-on-light-secondary">{feature}</Text>
                      </Stack>
                    ))}
                  </Stack>
                  <Button 
                    variant={bundle.id === "experience" ? "accent" : "outline"} 
                    size="md" 
                    fullWidth 
                    onClick={() => router.push(bundle.cta.href)}
                  >
                    {bundle.cta.label}
                  </Button>
                </Stack>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Full Stack Section */}
      <Container id="enterprise" className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Card inverted className="border-2 border-white p-8 sm:p-12">
          <Grid cols={2} gap={8} className="grid-cols-1 lg:grid-cols-2 items-center">
            <Stack gap={6}>
              <Stack gap={2}>
                <Label size="xs" className="text-on-dark-muted">{fullStack.category}</Label>
                <H2 className="text-white">{fullStack.tagline}</H2>
              </Stack>
              <Stack direction="horizontal" gap={2} className="items-baseline">
                <Display className="text-white">{fullStack.price}</Display>
                <Text className="text-on-dark-muted">{fullStack.period}</Text>
              </Stack>
              <Body className="text-on-dark-secondary">{fullStack.description}</Body>
              <Stack gap={3}>
                {fullStack.features.map((feature, idx) => (
                  <Stack key={idx} direction="horizontal" gap={3} className="items-center">
                    <Check className="size-5 text-brand-pink flex-shrink-0" />
                    <Body className="text-on-dark-secondary">{feature}</Body>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Stack gap={6} className="items-center text-center lg:items-end lg:text-right">
              <Stack gap={2}>
                <Text className="text-on-dark-muted">Includes all three products:</Text>
                <Stack direction="horizontal" gap={4} className="justify-center lg:justify-end">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="text-brand-pink">{PRODUCT_ICONS.atlvs}</Box>
                    <Text className="text-white">ATLVS</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="text-brand-cyan">{PRODUCT_ICONS.compvss}</Box>
                    <Text className="text-white">COMPVSS</Text>
                  </Stack>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Box className="text-brand-yellow">{PRODUCT_ICONS.gvteway}</Box>
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

      {/* FAQ Section */}
      <Box className="bg-white">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <Stack gap={4} className="text-center mb-12">
            <Label size="xs" className="text-on-light-muted">FAQ</Label>
            <H1 className="text-ink-950">FREQUENTLY ASKED QUESTIONS</H1>
            <Body size="lg" className="text-on-light-muted max-w-2xl mx-auto">Everything you need to know about our pricing</Body>
          </Stack>
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
            {FAQS.map((faq) => (
              <Article key={faq.id} className="border-2 border-ink-950 bg-white p-6 pop-card">
                <H3 className="font-display text-h6-md uppercase tracking-label text-ink-950 mb-3">{faq.question}</H3>
                <Body className="text-on-light-muted">{faq.answer}</Body>
              </Article>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footnote */}
      <Box className="bg-white border-t-2 border-ink-200">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8 py-6">
          <Body size="sm" className="text-center text-on-light-muted">{atlvsPricing.footnote}</Body>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <Display size="md" className="text-white">READY TO TRANSFORM YOUR PRODUCTIONS?</Display>
        <Body size="lg" className="mx-auto mt-4 max-w-xl text-on-dark-muted">
          Start your 14-day free trial today. No credit card required.
        </Body>
        <Stack direction="horizontal" gap={4} className="mt-8 flex-wrap justify-center">
          <Button variant="primary" size="lg" onClick={() => router.push("/auth/signup")} icon={<ArrowRight />} iconPosition="right">
            Start Free Trial
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.push("/contact")}>
            Talk to Sales
          </Button>
        </Stack>
      </Container>
    </>
  );
}
