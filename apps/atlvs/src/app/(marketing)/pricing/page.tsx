"use client";

/**
 * Pricing Page - 2026 Landing Page Best Practices
 * Full-width marketing layout with hero, pricing table, FAQ, and CTA
 * Bold Contemporary Pop Art Adventure Design System
 */

import { useRouter } from "next/navigation";
import {
  MarketingPage,
  HeroSection,
  PricingSection,
  FAQSection,
  CTABanner,
  LogoCloud,
  type PricingPlan,
  type FAQItem,
  type LogoItem,
} from "@ghxstship/ui";

const PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting started",
    price: { monthly: 29, annual: 24 },
    features: [
      { name: "Up to 5 team members", included: true },
      { name: "10 active projects", included: true },
      { name: "Basic reporting", included: true },
      { name: "Email support", included: true },
      { name: "1GB storage", included: true },
      { name: "API access", included: false },
      { name: "Custom integrations", included: false },
    ],
    cta: { label: "Start Free Trial" },
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing production teams",
    price: { monthly: 79, annual: 66 },
    features: [
      { name: "Up to 25 team members", included: true },
      { name: "Unlimited projects", included: true },
      { name: "Advanced reporting", included: true },
      { name: "Priority support", included: true },
      { name: "25GB storage", included: true },
      { name: "API access", included: true },
      { name: "Custom integrations", included: true },
    ],
    cta: { label: "Start Free Trial" },
    highlighted: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: { monthly: 0, annual: 0 },
    features: [
      { name: "Unlimited team members", included: true },
      { name: "Unlimited projects", included: true },
      { name: "Custom reporting", included: true },
      { name: "Dedicated support", included: true },
      { name: "Unlimited storage", included: true },
      { name: "Full API access", included: true },
      { name: "SSO & SAML", included: true },
      { name: "Custom contracts", included: true },
      { name: "SLA guarantee", included: true },
    ],
    cta: { label: "Contact Sales" },
  },
];

const FAQS: FAQItem[] = [
  { id: "change-plans", question: "Can I change plans later?", answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing accordingly." },
  { id: "payment-methods", question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express), ACH transfers, and wire transfers for enterprise accounts." },
  { id: "free-trial", question: "Is there a free trial?", answer: "Yes! All plans include a 14-day free trial with full access to all features. No credit card required to start." },
  { id: "trial-end", question: "What happens when my trial ends?", answer: "You'll be prompted to choose a plan. If you don't, your account will be downgraded to a limited free tier with basic features." },
  { id: "cancel", question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access continues until the end of your billing period." },
  { id: "support", question: "What kind of support do you offer?", answer: "All plans include email support. Professional plans get priority support with faster response times. Enterprise customers get dedicated account managers and 24/7 phone support." },
];

const TRUSTED_BY: LogoItem[] = [
  { id: "company1", name: "Live Nation", logo: "/logos/livenation.svg" },
  { id: "company2", name: "AEG", logo: "/logos/aeg.svg" },
  { id: "company3", name: "MSG", logo: "/logos/msg.svg" },
  { id: "company4", name: "Coachella", logo: "/logos/coachella.svg" },
  { id: "company5", name: "Lollapalooza", logo: "/logos/lollapalooza.svg" },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <MarketingPage
      sections={[
        {
          id: "hero",
          background: "gradient",
          pattern: "halftone",
          patternOpacity: 0.05,
          content: (
            <HeroSection
              kicker="Pricing"
              title="Simple, Transparent Pricing"
              description="Choose the plan that's right for your team. All plans include a 14-day free trial."
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
        {
          id: "logos",
          background: "black",
          content: (
            <LogoCloud
              title="Trusted by leading production companies"
              logos={TRUSTED_BY}
              grayscale
            />
          ),
        },
        {
          id: "pricing",
          background: "ink",
          pattern: "grid",
          patternOpacity: 0.03,
          content: (
            <PricingSection
              kicker="Plans"
              title="Choose Your Plan"
              description="Scale your production management as your team grows"
              plans={PLANS.map((plan) => ({
                ...plan,
                cta: {
                  ...plan.cta,
                  onClick: () => router.push(plan.id === "enterprise" ? "/contact" : "/auth/signup"),
                },
              }))}
              showBillingToggle
              defaultBilling="annual"
              annualSavings={20}
              background="ink"
            />
          ),
        },
        {
          id: "faq",
          background: "black",
          content: (
            <FAQSection
              kicker="FAQ"
              title="Frequently Asked Questions"
              description="Everything you need to know about our pricing"
              faqs={FAQS}
              background="black"
              variant="two-column"
            />
          ),
        },
        {
          id: "cta",
          background: "primary",
          pattern: "halftone",
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
              background="primary"
            />
          ),
        },
      ]}
      stickyCta={{
        label: "Start Free Trial",
        onClick: () => router.push("/auth/signup"),
      }}
    />
  );
}
