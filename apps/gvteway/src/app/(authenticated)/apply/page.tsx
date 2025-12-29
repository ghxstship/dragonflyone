"use client";

import {
  Alert,
  Body,
  Button,
  Card,
  Checkbox,
  Field,
  Form,
  Grid,
  H1,
  H2,
  IconBox,
  Input,
  Label,
  MarketingPage,
  ScrollReveal,
  Select,
  Stack,
  Textarea,
  type MarketingSection,
  useNotifications,
} from "@ghxstship/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Crown,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Users,
  Sparkles,
  Music,
  Plane,
  Utensils,
  Palette,
  Mountain,
} from "lucide-react";
import { useMembershipApplyData, type MembershipApplication } from "@/hooks/useMembershipApply";
import {
  gvtewayMembershipTiers,
} from "@/data/gvteway";

export const runtime = "edge";

// =============================================================================
// MEMBERSHIP APPLICATION PAGE
// Multi-step application form for GVTEWAY membership
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

// Interest categories for the application
const interestCategories = [
  { id: "music", label: "Music & Concerts", icon: Music },
  { id: "travel", label: "Travel & Destinations", icon: Plane },
  { id: "culinary", label: "Culinary Experiences", icon: Utensils },
  { id: "art", label: "Art & Culture", icon: Palette },
  { id: "adventure", label: "Adventure & Outdoors", icon: Mountain },
  { id: "community", label: "Community Events", icon: Users },
  { id: "exclusive", label: "Exclusive Access", icon: Sparkles },
  { id: "global", label: "Global Experiences", icon: Globe },
];

// Country options
const countryOptions = [
  { value: "", label: "Select your country" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "OTHER", label: "Other" },
];

// =============================================================================
// STEP COMPONENTS
// =============================================================================

interface StepProps {
  formData: MembershipApplication;
  setFormData: React.Dispatch<React.SetStateAction<MembershipApplication>>;
  error: string;
}

function PersonalInfoStep({ formData, setFormData, error }: StepProps) {
  return (
    <Stack gap={6}>
      <Stack gap={3} className="text-center">
        <IconBox size="lg" variant="warning" inverted className="mx-auto">
          <Crown className="size-6 text-warning sm:size-8" />
        </IconBox>
        <H2 className="text-white">TELL US ABOUT YOURSELF</H2>
        <Body size="sm" className="text-on-dark-muted">
          We keep this short. Promise.
        </Body>
      </Stack>

      {error && <Alert variant="error">{error}</Alert>}

      <Grid cols={1} gap={4} className="sm:grid-cols-2">
        <Field label="First Name" inverted required>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            placeholder="John"
            required
            inverted
          />
        </Field>
        <Field label="Last Name" inverted required>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            placeholder="Doe"
            required
            inverted
          />
        </Field>
      </Grid>

      <Field label="Email Address" inverted required>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          required
          inverted
        />
      </Field>

      <Field label="Phone Number" hint="For concierge services" inverted>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
          inverted
        />
      </Field>

      <Grid cols={1} gap={4} className="sm:grid-cols-2">
        <Field label="City" inverted required>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="New York"
            required
            inverted
          />
        </Field>
        <Field label="Country" inverted required>
          <Select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            inverted
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </Grid>
    </Stack>
  );
}

function InterestsStep({ formData, setFormData, error }: StepProps) {
  const toggleInterest = (interestId: string) => {
    const currentInterests = formData.interests;
    const newInterests = currentInterests.includes(interestId)
      ? currentInterests.filter((i) => i !== interestId)
      : [...currentInterests, interestId];
    setFormData({ ...formData, interests: newInterests });
  };

  return (
    <Stack gap={6}>
      <Stack gap={3} className="text-center">
        <IconBox size="lg" variant="warning" inverted className="mx-auto">
          <Sparkles className="size-6 text-warning sm:size-8" />
        </IconBox>
        <H2 className="text-white">WHAT GETS YOU EXCITED?</H2>
        <Body size="sm" className="text-on-dark-muted">
          Select all that apply. This helps us curate your experience.
        </Body>
      </Stack>

      {error && <Alert variant="error">{error}</Alert>}

      <Grid cols={2} gap={4} className="sm:grid-cols-4">
        {interestCategories.map((interest) => {
          const isSelected = formData.interests.includes(interest.id);
          const Icon = interest.icon;
          return (
            <Card
              key={interest.id}
              inverted
              className={`cursor-pointer border-2 p-4 text-center transition-all ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-ink-800 bg-ink-950 hover:border-ink-600"
              }`}
              onClick={() => toggleInterest(interest.id)}
            >
              <Stack gap={3} className="items-center">
                <IconBox size="md" inverted className={isSelected ? "bg-accent/20" : ""}>
                  <Icon className={`size-5 ${isSelected ? "text-accent" : "text-on-dark-muted"}`} />
                </IconBox>
                <Label size="xs" className={isSelected ? "text-white" : "text-on-dark-muted"}>
                  {interest.label}
                </Label>
                {isSelected && <Check className="size-4 text-accent" />}
              </Stack>
            </Card>
          );
        })}
      </Grid>

      <Body size="sm" className="text-center text-on-dark-disabled">
        Selected: {formData.interests.length} of {interestCategories.length}
      </Body>
    </Stack>
  );
}

function TierSelectionStep({ formData, setFormData, error }: StepProps) {
  return (
    <Stack gap={6}>
      <Stack gap={3} className="text-center">
        <IconBox size="lg" variant="warning" inverted className="mx-auto">
          <Crown className="size-6 text-warning sm:size-8" />
        </IconBox>
        <H2 className="text-white">CHOOSE YOUR TIER</H2>
        <Body size="sm" className="text-on-dark-muted">
          You can always upgrade later. No pressure.
        </Body>
      </Stack>

      {error && <Alert variant="error">{error}</Alert>}

      <Grid cols={1} gap={4} className="sm:grid-cols-3">
        {gvtewayMembershipTiers.map((tier) => {
          const isSelected = formData.selectedTier === tier.name;
          return (
            <Card
              key={tier.name}
              inverted
              className={`relative cursor-pointer border-2 p-6 transition-all ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : tier.popular
                    ? "border-accent/50 bg-ink-950"
                    : "border-ink-800 bg-ink-950 hover:border-ink-600"
              }`}
              onClick={() => setFormData({ ...formData, selectedTier: tier.name })}
            >
              {tier.popular && (
                <Label
                  size="xs"
                  className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-accent bg-ink-950 px-3 py-1 text-accent"
                >
                  MOST POPULAR
                </Label>
              )}

              <Stack gap={4}>
                <Stack gap={2}>
                  <H2 size="sm" className="text-white">{tier.name}</H2>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <H1 size="sm" className="text-white">{tier.price}</H1>
                    <Label size="sm" className="text-on-dark-muted">{tier.period}</Label>
                  </Stack>
                </Stack>

                <Body size="sm" className="text-on-dark-muted">{tier.description}</Body>

                <Stack gap={2} className="border-t border-ink-800 pt-4">
                  {tier.features.slice(0, 4).map((feature) => (
                    <Stack key={feature} direction="horizontal" gap={2} className="items-start">
                      <Check className="mt-0.5 size-3 shrink-0 text-accent" />
                      <Label size="xs" className="text-on-dark-secondary">{feature}</Label>
                    </Stack>
                  ))}
                </Stack>

                {isSelected && (
                  <Stack direction="horizontal" gap={2} className="items-center justify-center pt-2">
                    <Check className="size-5 text-accent" />
                    <Label size="sm" className="text-accent">SELECTED</Label>
                  </Stack>
                )}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
}

interface FinalStepProps extends StepProps {
  agreeToTerms: boolean;
  setAgreeToTerms: (value: boolean) => void;
}

function FinalStep({ formData, setFormData, error, agreeToTerms, setAgreeToTerms }: FinalStepProps) {
  return (
    <Stack gap={6}>
      <Stack gap={3} className="text-center">
        <IconBox size="lg" variant="success" inverted className="mx-auto">
          <Check className="size-6 text-success sm:size-8" />
        </IconBox>
        <H2 className="text-white">ALMOST THERE</H2>
        <Body size="sm" className="text-on-dark-muted">
          Just a few final details and you are in the queue.
        </Body>
      </Stack>

      {error && <Alert variant="error">{error}</Alert>}

      <Field label="Referral Code" hint="Optional - if someone referred you" inverted>
        <Input
          type="text"
          value={formData.referralCode}
          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
          placeholder="GVTEWAY-XXXX"
          inverted
        />
      </Field>

      <Field label="Anything else we should know?" hint="Optional" inverted>
        <Textarea
          value=""
          onChange={() => {}}
          placeholder="Tell us about yourself, your experience expectations, or any questions..."
          rows={4}
          inverted
        />
      </Field>

      {/* Application Summary */}
      <Card inverted className="border-2 border-ink-800 bg-ink-900 p-6">
        <Stack gap={4}>
          <Label size="sm" className="text-on-dark-muted">APPLICATION SUMMARY</Label>
          <Grid cols={2} gap={4}>
            <Stack gap={1}>
              <Label size="xs" className="text-on-dark-disabled">NAME</Label>
              <Body size="sm" className="text-white">{formData.firstName} {formData.lastName}</Body>
            </Stack>
            <Stack gap={1}>
              <Label size="xs" className="text-on-dark-disabled">EMAIL</Label>
              <Body size="sm" className="text-white">{formData.email}</Body>
            </Stack>
            <Stack gap={1}>
              <Label size="xs" className="text-on-dark-disabled">LOCATION</Label>
              <Body size="sm" className="text-white">{formData.city}, {formData.country}</Body>
            </Stack>
            <Stack gap={1}>
              <Label size="xs" className="text-on-dark-disabled">SELECTED TIER</Label>
              <Body size="sm" className="text-accent">{formData.selectedTier || "Not selected"}</Body>
            </Stack>
          </Grid>
          <Stack gap={1}>
            <Label size="xs" className="text-on-dark-disabled">INTERESTS</Label>
            <Body size="sm" className="text-white">
              {formData.interests.length > 0
                ? formData.interests
                    .map((id) => interestCategories.find((c) => c.id === id)?.label)
                    .join(", ")
                : "None selected"}
            </Body>
          </Stack>
        </Stack>
      </Card>

      <Stack direction="horizontal" gap={3} className="items-start">
        <Checkbox
          id="terms"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          inverted
        />
        <Label size="xs" className="text-on-dark-muted">
          I agree to the{" "}
          <NextLink href="/legal/terms" className="text-white underline">
            Terms of Service
          </NextLink>{" "}
          and{" "}
          <NextLink href="/legal/privacy" className="text-white underline">
            Privacy Policy
          </NextLink>
          . I understand that membership is subject to approval.
        </Label>
      </Stack>
    </Stack>
  );
}

// =============================================================================
// MAIN APPLICATION FORM
// =============================================================================

function ApplicationForm() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { submitApplication, isSubmitting } = useMembershipApplyData();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [formData, setFormData] = useState<MembershipApplication>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    interests: [],
    selectedTier: "",
    referralCode: "",
  });

  const totalSteps = 4;

  const validateStep = (currentStep: number): boolean => {
    setError("");

    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim()) {
          setError("First name is required");
          return false;
        }
        if (!formData.lastName.trim()) {
          setError("Last name is required");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (!formData.city.trim()) {
          setError("City is required");
          return false;
        }
        if (!formData.country) {
          setError("Please select your country");
          return false;
        }
        return true;

      case 2:
        if (formData.interests.length === 0) {
          setError("Please select at least one interest");
          return false;
        }
        return true;

      case 3:
        if (!formData.selectedTier) {
          setError("Please select a membership tier");
          return false;
        }
        return true;

      case 4:
        if (!agreeToTerms) {
          setError("You must agree to the terms and conditions");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(step)) {
      return;
    }

    try {
      await submitApplication(formData);
      addNotification({
        type: "success",
        title: "Application Submitted",
        message: "We will review your application and get back to you within 24-48 hours.",
      });
      router.push("/apply/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    }
  };

  return (
    <Stack className="py-16 sm:py-24">
      <ScrollReveal animation="slide-up" duration={600}>
        <Card inverted className="mx-auto max-w-2xl border-2 border-white/20 bg-black p-6 shadow-md sm:p-8">
          {/* Progress Indicator */}
          <Stack gap={6} className="mb-8">
            <Stack direction="horizontal" gap={2} className="justify-center">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-12 transition-colors ${
                    i + 1 <= step ? "bg-accent" : "bg-ink-800"
                  }`}
                />
              ))}
            </Stack>
            <Label size="xs" className="text-center tracking-label text-on-dark-disabled">
              STEP {step} OF {totalSteps}
            </Label>
          </Stack>

          <Form onSubmit={handleSubmit}>
            {/* Step Content */}
            {step === 1 && (
              <PersonalInfoStep formData={formData} setFormData={setFormData} error={error} />
            )}
            {step === 2 && (
              <InterestsStep formData={formData} setFormData={setFormData} error={error} />
            )}
            {step === 3 && (
              <TierSelectionStep formData={formData} setFormData={setFormData} error={error} />
            )}
            {step === 4 && (
              <FinalStep
                formData={formData}
                setFormData={setFormData}
                error={error}
                agreeToTerms={agreeToTerms}
                setAgreeToTerms={setAgreeToTerms}
              />
            )}

            {/* Navigation Buttons */}
            <Stack direction="horizontal" gap={4} className="mt-8 justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handleBack}
                  inverted
                  icon={<ArrowLeft className="size-4" />}
                >
                  Back
                </Button>
              ) : (
                <NextLink href="/">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    inverted
                    icon={<ArrowLeft className="size-4" />}
                  >
                    Cancel
                  </Button>
                </NextLink>
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  variant="pop"
                  size="lg"
                  onClick={handleNext}
                  icon={<ArrowRight className="size-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="pop"
                  size="lg"
                  disabled={isSubmitting}
                  icon={<Check className="size-4" />}
                  iconPosition="right"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </Stack>
          </Form>

          {/* Sign In Link */}
          <Stack gap={2} className="mt-8 border-t border-white/10 pt-6 text-center">
            <Body size="sm" className="text-on-dark-muted">
              Already a member?
            </Body>
            <NextLink href="/auth/signin">
              <Button variant="ghost" size="sm" inverted>
                Sign In
              </Button>
            </NextLink>
          </Stack>
        </Card>
      </ScrollReveal>
    </Stack>
  );
}

// =============================================================================
// MARKETING SECTIONS CONFIGURATION
// =============================================================================

const marketingSections: MarketingSection[] = [
  { id: "application", background: "black", content: <ApplicationForm /> },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MembershipApplyPage() {
  return (
    <MarketingPage
      sections={marketingSections}
      inverted={true}
    />
  );
}
